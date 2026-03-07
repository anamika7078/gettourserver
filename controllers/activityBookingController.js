
const dotenv = require("dotenv");
const Stripe = require("stripe");
const ActivityBookingModel = require("../models/activityBookingModel.js");
const db = require("../db.js");
const { sendEmail } = require("../utils/email.js");


dotenv.config();

const stripeSecret = process.env.STRIPE_SECRET_KEY || "";
const stripe = stripeSecret ? new Stripe(stripeSecret) : null;

function toISODate(d) {
    try {
        if (!d) return null;
        const dt = new Date(d);
        if (isNaN(dt)) return null;
        return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
    } catch {
        return null;
    }
}

async function createCheckoutSession(req, res) {
    try {
        if (!stripe) {
            return res.status(500).json({ success: false, error: "Stripe not configured" });
        }

        const body = req.body || {};
        const activityId = Number(body.activityId || body.activity_id || 0) || null;
        const title = body.title || body.activityTitle || "Activity";
        const unitPrice = Number(body.unitPrice || body.price || 0) || 0; // AED
        const adults = Number(body.adults || 0) || 0;
        const children = Number(body.children || 0) || 0;
        const transfer = Boolean(body.transfer);
        const visitDate = toISODate(body.visitDate);
        const fullName = body.fullName || "";
        const email = body.email || "";
        const phone = body.phone || "";
        const notes = body.notes || "";

        const total = Number(body.total || unitPrice * (adults + children)) || 0;

        const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            success_url: `${FRONTEND_URL}/activities/${activityId || ""}/book?success=1&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${FRONTEND_URL}/activities/${activityId || ""}/book?canceled=1`,
            currency: "AED",
            line_items: [
                {
                    price_data: {
                        currency: "AED",
                        product_data: { name: `${title} — Tickets` },
                        unit_amount: Math.round(unitPrice * 100),
                    },
                    quantity: Math.max(1, adults + children),
                },
            ],
            metadata: {
                activity_id: String(activityId || ""),
                activity_title: String(title || ""),
                unit_price: String(unitPrice),
                adults: String(adults),
                children: String(children),
                transfer: transfer ? "1" : "0",
                visit_date: visitDate || "",
                full_name: fullName,
                email,
                phone,
                notes,
                total_amount: String(total),
            },
        });

        return res.json({ success: true, url: session.url });
    } catch (err) {
        console.error("createCheckoutSession error:", err);
        return res.status(500).json({ success: false, error: err.message || "Server error" });
    }
}

async function confirmCheckout(req, res) {
    try {
        if (!stripe) {
            return res.status(500).json({ success: false, error: "Stripe not configured" });
        }
        await ActivityBookingModel.ensureTable();

        const { sessionId } = req.body || {};
        if (!sessionId) return res.status(400).json({ success: false, error: "sessionId required" });

        const existing = await ActivityBookingModel.getByStripeSession(sessionId);
        if (existing) {
            return res.json({ success: true, id: existing.id, alreadySaved: true });
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["payment_intent"] });
        if (!session) return res.status(404).json({ success: false, error: "Session not found" });

        const paid = session.payment_status === "paid" || session.status === "complete";
        const pi = session.payment_intent;
        const paymentIntentId = typeof pi === "string" ? pi : pi?.id;

        const md = session.metadata || {};
        const record = {
            activity_id: md.activity_id ? Number(md.activity_id) : null,
            activity_title: md.activity_title || null,
            unit_price: md.unit_price ? Number(md.unit_price) : 0,
            adults: md.adults ? Number(md.adults) : 0,
            children: md.children ? Number(md.children) : 0,
            transfer: md.transfer === "1",
            visit_date: md.visit_date || null,
            full_name: md.full_name || null,
            email: md.email || null,
            phone: md.phone || null,
            notes: md.notes || null,
            total_amount: md.total_amount ? Number(md.total_amount) : 0,
            payment_status: paid ? "paid" : session.payment_status || "unpaid",
            stripe_session_id: session.id,
            stripe_payment_intent: paymentIntentId || null,
        };

        try {
            const result = await ActivityBookingModel.create(record);

            // Fire-and-forget notifications only when newly created and paid
            if (record.payment_status === "paid") {
                notifyInvoice(record).catch((e) =>
                    console.error("notifyInvoice error:", e)
                );
            }

            return res.json({ success: true, id: result.insertId, status: record.payment_status });
        } catch (e) {
            if (e && (e.code === "ER_DUP_ENTRY" || e.errno === 1062)) {
                // Another request already saved this session concurrently; return the existing record.
                const existingAgain = await ActivityBookingModel.getByStripeSession(session.id);
                if (existingAgain) {
                    return res.json({
                        success: true,
                        id: existingAgain.id,
                        status: existingAgain.payment_status || record.payment_status,
                        alreadySaved: true,
                    });
                }
            }
            throw e;
        }
    } catch (err) {
        console.error("confirmCheckout error:", err);
        return res.status(500).json({ success: false, error: err.message || "Server error" });
    }
}

async function listBookings(req, res) {
    try {
        await ActivityBookingModel.ensureTable();
        const rows = await ActivityBookingModel.listAll();
        return res.json({ success: true, data: rows });
    } catch (err) {
        console.error("listBookings error:", err);
        return res.status(500).json({ success: false, error: err.message || "Server error" });
    }
}

async function deleteBooking(req, res) {
    try {
        await ActivityBookingModel.ensureTable();
        const id = req.params.id;
        if (!id) return res.status(400).json({ success: false, error: "id required" });

        db.query("DELETE FROM activity_bookings WHERE id = ?", [id], (err, result) => {
            if (err) {
                console.error("deleteBooking error:", err);
                return res.status(500).json({ success: false, error: err.message || "Server error" });
            }
            if (result && result.affectedRows === 0) {
                return res.status(404).json({ success: false, error: "Not found" });
            }
            return res.json({ success: true });
        });
    } catch (err) {
        console.error("deleteBooking error:", err);
        return res.status(500).json({ success: false, error: err.message || "Server error" });
    }
}

// Build a simple invoice email/WhatsApp body
function buildInvoiceText(r) {
    const lines = [
        `Thank you for your booking!`,
        ``,
        `${process.env.APP_NAME || "GetTourGuide"} — Activity Booking Invoice`,
        `--------------------------------------------------`,
        `Activity: ${r.activity_title || "-"}`,
        `Visit Date: ${r.visit_date || "-"}`,
        `Adults: ${r.adults || 0}  Children: ${r.children || 0}`,
        `Transfer: ${r.transfer ? "Yes" : "No"}`,
        `Unit Price: AED ${Number(r.unit_price || 0).toFixed(2)}`,
        `Total Paid: AED ${Number(r.total_amount || 0).toFixed(2)}`,
        `Payment Status: ${r.payment_status || "-"}`,
        `Stripe Session: ${r.stripe_session_id || "-"}`,
        ``,
        `Lead Guest: ${r.full_name || "-"}`,
        `Email: ${r.email || "-"}`,
        `Phone: ${r.phone || "-"}`,
        r.notes ? `Notes: ${r.notes}` : null,
        ``,
        `We look forward to hosting you!`,
        `${process.env.APP_NAME || "GetTourGuide"}`,
        `${process.env.APP_URL || "http://localhost:5173"}`,
    ].filter(Boolean);
    return lines.join("\n");
}

function buildInvoiceHtml(r) {
    const esc = (s) => String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto;">
        <h2 style="color:#333;">${esc(process.env.APP_NAME || "GetTourGuide")} — Activity Booking Invoice</h2>
        <p>Thank you for your booking!</p>
        <table style="width:100%; border-collapse: collapse;">
          <tbody>
            <tr><td style="padding:6px; border-bottom:1px solid #eee;">Activity:</td><td style="padding:6px; border-bottom:1px solid #eee;"><b>${esc(r.activity_title || "-")}</b></td></tr>
            <tr><td style="padding:6px; border-bottom:1px solid #eee;">Visit Date:</td><td style="padding:6px; border-bottom:1px solid #eee;">${esc(r.visit_date || "-")}</td></tr>
            <tr><td style="padding:6px; border-bottom:1px solid #eee;">Adults / Children:</td><td style="padding:6px; border-bottom:1px solid #eee;">${Number(r.adults || 0)} / ${Number(r.children || 0)}</td></tr>
            <tr><td style="padding:6px; border-bottom:1px solid #eee;">Transfer:</td><td style="padding:6px; border-bottom:1px solid #eee;">${r.transfer ? "Yes" : "No"}</td></tr>
            <tr><td style="padding:6px; border-bottom:1px solid #eee;">Unit Price:</td><td style="padding:6px; border-bottom:1px solid #eee;">AED ${Number(r.unit_price || 0).toFixed(2)}</td></tr>
            <tr><td style="padding:6px; border-bottom:1px solid #eee;">Total Paid:</td><td style="padding:6px; border-bottom:1px solid #eee;"><b>AED ${Number(r.total_amount || 0).toFixed(2)}</b></td></tr>
            <tr><td style="padding:6px; border-bottom:1px solid #eee;">Payment Status:</td><td style="padding:6px; border-bottom:1px solid #eee;">${esc(r.payment_status || "-")}</td></tr>
            <tr><td style="padding:6px; border-bottom:1px solid #eee;">Stripe Session:</td><td style="padding:6px; border-bottom:1px solid #eee;">${esc(r.stripe_session_id || "-")}</td></tr>
          </tbody>
        </table>
        <h3 style="margin-top:18px;">Lead Guest</h3>
        <p>
          ${esc(r.full_name || "-")}<br/>
          ${esc(r.email || "-")}<br/>
          ${esc(r.phone || "-")}
        </p>
        ${r.notes ? `<p><b>Notes:</b> ${esc(r.notes)}</p>` : ""}
        <p style="margin-top:18px; color:#666;">We look forward to hosting you!<br/>${esc(process.env.APP_NAME || "GetTourGuide")} — ${esc(process.env.APP_URL || "http://localhost:5173")}</p>
      </div>
    `;
}

async function notifyInvoice(record) {
    const subject = `${process.env.APP_NAME || "GetTourGuide"} — Invoice for ${record.activity_title || "Activity"}`;
    const text = buildInvoiceText(record);
    const html = buildInvoiceHtml(record);

    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;

    const tasks = [];
    if (record.email) {
        tasks.push(
            sendEmail({ to: record.email, subject, text, html }).catch((e) =>
                console.error("sendEmail (user) error:", e)
            )
        );
    }
    if (adminEmail) {
        tasks.push(
            sendEmail({ to: adminEmail, subject: `[Admin Copy] ${subject}`, text, html }).catch((e) =>
                console.error("sendEmail (admin) error:", e)
            )
        );
    }
    await Promise.all(tasks);
}


module.exports = {
    createCheckoutSession,
    confirmCheckout,
    listBookings,
    deleteBooking,
};