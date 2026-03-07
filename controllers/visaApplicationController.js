


// import dotenv from "dotenv";
// import Stripe from "stripe";
// import db from "../db.js";
// import VisaApplicationModel from "../models/visaApplicationModel.js";
// import { sendEmail } from "../utils/email.js";

// dotenv.config();
const dotenv = require("dotenv");
const Stripe = require("stripe");
const db = require("../db.js");
const VisaApplicationModel = require("../models/visaApplicationModel.js");
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

// Helper function to expand nationality codes
function expandNationality(code) {
    const nationalityMap = {
        'IND': 'India',
        'UAE': 'United Arab Emirates',
        'PAK': 'Pakistan',
        'BAN': 'Bangladesh',
        'NEP': 'Nepal',
        'SRI': 'Sri Lanka',
        'SAU': 'Saudi Arabia',
        'QAT': 'Qatar',
        'OMA': 'Oman',
        'BAH': 'Bahrain',
        'KUW': 'Kuwait',
        'EGY': 'Egypt',
        'TUR': 'Turkey',
        'UK': 'United Kingdom',
        'USA': 'United States',
        'CAN': 'Canada',
        'AUS': 'Australia',
        'GER': 'Germany',
        'FRA': 'France',
        'ITA': 'Italy',
        'SPA': 'Spain'
    };
    return nationalityMap[code] || code;
}

 async function createVisaCheckoutSession(req, res) {
    try {
        if (!stripe) return res.status(500).json({ success: false, error: "Stripe not configured" });

        const body = req.body || {};
        console.log("=== CREATE CHECKOUT SESSION ===");
        console.log("Full request body:", JSON.stringify(body, null, 2));

        const visaId = body.visaId || body.visa_id || null;
        const country = body.country || body.visaCountry || body.visa?.country || "Visa";
        const subject = body.subject || body.visaSubject || body.visa?.subject || "General";
        const price = Number(body.price || body.price_per_person || body.visa?.price || 0) || 0;
        const totalPassengers = Number(body.totalPassengers || body.passengers || 1) || 1;

        const allPassengers = body.passengers || [];
        const travelDate = body.travelDate || "";
        const notes = body.notes || "";
        const lead = body.lead || {};

        const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
        const productName = `${country} Visa${subject ? ` — ${subject}` : ""}`;

        // Create optimized passenger data that fits within Stripe limits
        let optimizedPassengers = "";
        try {
            if (Array.isArray(allPassengers) && allPassengers.length > 0) {
                // Create a highly compressed format that preserves essential data
                const compressed = allPassengers.map(p =>
                    `${p.passengerNumber}|${p.title.substring(0, 2)}|${p.firstName.substring(0, 12)}|${p.lastName.substring(0, 12)}|${p.passport.substring(0, 15)}|${p.gender.substring(0, 1)}|${p.nationality.substring(0, 3)}|${p.birthDate}`
                ).join(';');

                optimizedPassengers = compressed;
                console.log("Optimized passengers length:", optimizedPassengers.length);
                console.log("Optimized passengers data:", optimizedPassengers);

                // If still too long, use minimal format with just names and passport
                if (optimizedPassengers.length > 450) {
                    const minimal = allPassengers.map(p =>
                        `${p.passengerNumber}|${p.firstName.substring(0, 8)}|${p.lastName.substring(0, 8)}|${p.passport.substring(0, 10)}`
                    ).join(';');
                    optimizedPassengers = minimal;
                    console.log("Using minimal format, length:", optimizedPassengers.length);
                }
            }
        } catch (e) {
            console.error("Error optimizing passengers:", e);
            optimizedPassengers = `count:${allPassengers.length}`;
        }

        // Use clear but shortened field names that are easy to map back
        const metadata = {
            visa_id: String(visaId || "").substring(0, 10),
            country: String(country || "").substring(0, 30),
            subject: String(subject || "").substring(0, 30),
            price: String(price),
            travel_date: toISODate(travelDate) || "",
            passengers_count: String(totalPassengers),
            notes: notes ? String(notes).slice(0, 100) : "",
            lead_title: lead.title || "",
            lead_fname: lead.firstName ? lead.firstName.substring(0, 20) : "",
            lead_lname: lead.lastName ? lead.lastName.substring(0, 20) : "",
            lead_email: lead.email ? lead.email.substring(0, 40) : "",
            lead_isd: lead.isd || "",
            lead_phone: lead.phone ? lead.phone.substring(0, 15) : "",
            lead_nationality: lead.nationality ? lead.nationality.substring(0, 20) : "",
            pass_data: optimizedPassengers.substring(0, 500), // Ensure it doesn't exceed limit
        };

        console.log("Final metadata for Stripe:", metadata);
        console.log("Passenger data length:", metadata.pass_data.length);

        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            success_url: `${FRONTEND_URL}/visas/${visaId || ""}/apply?success=1&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${FRONTEND_URL}/visas/${visaId || ""}/apply?canceled=1`,
            currency: "AED",
            line_items: [
                {
                    price_data: {
                        currency: "AED",
                        product_data: { name: productName },
                        unit_amount: Math.round(price * 100),
                    },
                    quantity: Math.max(1, totalPassengers),
                },
            ],
            metadata: metadata,
        });

        return res.json({ success: true, url: session.url });
    } catch (err) {
        console.error("createVisaCheckoutSession error:", err);
        return res.status(500).json({ success: false, error: err.message || "Server error" });
    }
}

 async function confirmVisaCheckout(req, res) {
    try {
        if (!stripe) return res.status(500).json({ success: false, error: "Stripe not configured" });

        const { sessionId } = req.body || {};
        if (!sessionId) return res.status(400).json({ success: false, error: "sessionId required" });

        // Check if application already exists first
        const existing = await VisaApplicationModel.getByStripeSession(sessionId);
        if (existing) {
            console.log("Application already exists:", existing.id);
            return res.json({ success: true, id: existing.id, alreadySaved: true, status: existing.payment_status });
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["payment_intent"] });
        if (!session) return res.status(404).json({ success: false, error: "Session not found" });

        // Only ensure table if we're actually going to create a new record
        console.log("Ensuring visa_applications table exists for new application...");
        await VisaApplicationModel.ensureTable();

        const paid = session.payment_status === "paid" || session.status === "complete";
        const pi = session.payment_intent;
        const paymentIntentId = typeof pi === "string" ? pi : pi?.id;
        const md = session.metadata || {};

        console.log("=== CONFIRM CHECKOUT ===");
        console.log("Stripe session metadata:", md);

        // MAP METADATA BACK TO ORIGINAL FIELD NAMES
        // Handle both shortened field names (new) and original field names (backward compatibility)
        const fullMetadata = {
            // Try shortened names first, then fall back to original names
            visa_id: md.visa_id || md.v_id,
            country: md.country || md.c,
            subject: md.subject || md.s,
            price_per_person: md.price || md.p || md.price_per_person,
            travel_date: md.travel_date || md.td,
            total_passengers: md.passengers_count || md.tp || md.total_passengers,
            notes: md.notes || md.n,
            lead_title: md.lead_title || md.lt,
            lead_first_name: md.lead_fname || md.lf || md.lead_first_name,
            lead_last_name: md.lead_lname || md.ll || md.lead_last_name,
            lead_email: md.lead_email || md.le,
            lead_isd: md.lead_isd || md.li,
            lead_phone: md.lead_phone || md.lp,
            lead_nationality: md.lead_nationality || md.ln,
        };

        console.log("Mapped full metadata:", fullMetadata);

        // PARSE PASSENGER DATA FROM METADATA
        let passengers = [];
        try {
            // Check both new and old passenger data fields
            const passengerData = md.pass_data || md.ps || md.passengers;

            if (passengerData && passengerData !== "" && passengerData !== "[]") {
                console.log("Raw passenger data from metadata:", passengerData);

                if (passengerData.includes('|') && passengerData.includes(';')) {
                    // Parse the optimized pipe-separated format
                    const passengerStrings = passengerData.split(';');
                    passengers = passengerStrings.map((passStr, index) => {
                        const parts = passStr.split('|');

                        // Handle different formats based on number of parts
                        if (parts.length >= 8) {
                            // Full format: passengerNumber|title|firstName|lastName|passport|gender|nationality|birthDate
                            return {
                                passengerNumber: parseInt(parts[0]) || index + 1,
                                title: parts[1] === 'Mr' ? 'Mr' : parts[1] === 'Ms' ? 'Ms' : parts[1] === 'Mrs' ? 'Mrs' : 'Mr',
                                firstName: parts[2] || '',
                                lastName: parts[3] || '',
                                passport: parts[4] || '',
                                gender: parts[5] === 'M' ? 'Male' : parts[5] === 'F' ? 'Female' : 'Male',
                                nationality: expandNationality(parts[6]) || parts[6] || '', // Use the helper function
                                birthDate: parts[7] || ''
                            };
                        } else if (parts.length >= 4) {
                            // Minimal format: passengerNumber|firstName|lastName|passport
                            return {
                                passengerNumber: parseInt(parts[0]) || index + 1,
                                title: 'Mr', // Default
                                firstName: parts[1] || '',
                                lastName: parts[2] || '',
                                passport: parts[3] || '',
                                gender: 'Male', // Default
                                nationality: '', // Not available in minimal format
                                birthDate: '' // Not available in minimal format
                            };
                        } else {
                            // Fallback for unexpected format
                            return {
                                passengerNumber: index + 1,
                                title: 'Mr',
                                firstName: `Passenger ${index + 1}`,
                                lastName: '',
                                passport: '',
                                gender: 'Male',
                                nationality: '',
                                birthDate: ''
                            };
                        }
                    }).filter(p => p !== null);

                    console.log("✅ Successfully parsed optimized passengers");
                    console.log("📊 Passengers count:", passengers.length);

                    // Log first passenger for verification
                    if (passengers.length > 0) {
                        console.log("Sample passenger:", passengers[0]);
                    }
                } else if (passengerData.startsWith('count:')) {
                    // Handle count-only format
                    const count = parseInt(passengerData.replace('count:', ''));
                    passengers = Array.from({ length: count }, (_, i) => ({
                        passengerNumber: i + 1,
                        title: 'Mr',
                        firstName: `Passenger ${i + 1}`,
                        lastName: '',
                        passport: '',
                        gender: 'Male',
                        nationality: '',
                        birthDate: ''
                    }));
                    console.log("Created placeholder passengers from count:", count);
                } else {
                    // Try to parse as JSON (backward compatibility)
                    try {
                        const parsed = JSON.parse(passengerData);
                        if (Array.isArray(parsed)) {
                            passengers = parsed;
                            console.log("✅ Parsed passengers as JSON");
                        }
                    } catch (jsonError) {
                        console.log("❌ Could not parse passengers as JSON, using empty array");
                    }
                }
            } else {
                console.log("❌ No passenger data found in metadata, creating empty array");
            }
        } catch (e) {
            console.error("❌ Error parsing passengers from metadata:", e);
            passengers = [];
        }

        // CREATE THE FINAL RECORD WITH ALL DATA
        const record = {
            visa_id: fullMetadata.visa_id ? Number(fullMetadata.visa_id) : null,
            country: fullMetadata.country || null,
            subject: fullMetadata.subject || null,
            price_per_person: fullMetadata.price_per_person ? Number(fullMetadata.price_per_person) : 0,
            travel_date: fullMetadata.travel_date || null,
            total_passengers: fullMetadata.total_passengers ? Number(fullMetadata.total_passengers) : 1,
            notes: fullMetadata.notes || null,
            lead_title: fullMetadata.lead_title || null,
            lead_first_name: fullMetadata.lead_first_name || null,
            lead_last_name: fullMetadata.lead_last_name || null,
            lead_email: fullMetadata.lead_email || null,
            lead_isd: fullMetadata.lead_isd || null,
            lead_phone: fullMetadata.lead_phone || null,
            lead_nationality: fullMetadata.lead_nationality || null,
            extra_passengers: passengers,
            passengers: passengers,
            payment_status: paid ? "paid" : session.payment_status || "unpaid",
            stripe_session_id: session.id,
            stripe_payment_intent: paymentIntentId || null,
        };

        console.log("💾 Record to be saved to database:", {
            visa_id: record.visa_id,
            country: record.country,
            subject: record.subject,
            total_passengers: record.total_passengers,
            passengers_count: passengers.length,
            payment_status: record.payment_status
        });

        try {
            const result = await VisaApplicationModel.createPaid(record);
            console.log("✅ Database insert successful - Insert ID:", result.insertId);

            // Verify the data was saved correctly
            const savedApplication = await VisaApplicationModel.getById(result.insertId);
            console.log("🔍 Verifying saved data:");
            console.log("   Saved passengers:", savedApplication.passengers);
            console.log("   Saved extra_passengers:", savedApplication.extra_passengers);
            console.log("   Total passengers in DB:", savedApplication.passengers ? savedApplication.passengers.length : 0);

            if (record.payment_status === "paid") {
                notifyVisaInvoice(record).catch((e) => console.error("notifyVisaInvoice error:", e));
            }

            return res.json({
                success: true,
                id: result.insertId,
                status: record.payment_status,
                passengers_count: passengers.length,
                message: "Application saved successfully"
            });
        } catch (e) {
            if (e && (e.code === "ER_DUP_ENTRY" || e.errno === 1062)) {
                const existingAgain = await VisaApplicationModel.getByStripeSession(session.id);
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
        console.error("confirmVisaCheckout error:", err);
        return res.status(500).json({ success: false, error: err.message || "Server error" });
    }
}

 async function deleteVisaApplication(req, res) {
    try {
        await VisaApplicationModel.ensureTable();
        const id = req.params.id;
        if (!id) return res.status(400).json({ success: false, error: "id required" });

        db.query("DELETE FROM visa_applications WHERE id = ?", [id], (err, result) => {
            if (err) {
                console.error("deleteVisaApplication error:", err);
                return res.status(500).json({ success: false, error: err.message || "Server error" });
            }
            if (result && result.affectedRows === 0) {
                return res.status(404).json({ success: false, error: "Not found" });
            }
            return res.json({ success: true });
        });
    } catch (err) {
        console.error("deleteVisaApplication error:", err);
        return res.status(500).json({ success: false, error: err.message || "Server error" });
    }
}

function buildVisaInvoiceText(r) {
    const lines = [
        `Thank you for your visa application!`,
        ``,
        `${process.env.APP_NAME || "GetTourGuide"} — Visa Application Invoice`,
        `--------------------------------------------------`,
        `Country: ${r.country || "-"}`,
        `Subject: ${r.subject || "-"}`,
        `Travel Date: ${r.travel_date || "-"}`,
        `Passengers: ${Number(r.total_passengers || 1)}`,
        `Price/Person: AED ${Number(r.price_per_person || 0).toFixed(2)}`,
        `Total Paid: AED ${(Number(r.price_per_person || 0) * Number(r.total_passengers || 1)).toFixed(2)}`,
        `Payment Status: ${r.payment_status || "-"}`,
        `Stripe Session: ${r.stripe_session_id || "-"}`,
        ``,
        `Lead: ${[r.lead_title, r.lead_first_name, r.lead_last_name].filter(Boolean).join(" ")}`,
        `Email: ${r.lead_email || "-"}`,
        `Phone: ${(r.lead_isd || "") + " " + (r.lead_phone || "-")}`,
        r.notes ? `Notes: ${r.notes}` : null,
        ``,
    ];

    // Add ALL passengers to the invoice
    const displayPassengers = r.passengers || r.extra_passengers || [];
    if (displayPassengers && displayPassengers.length > 0) {
        lines.push(`Passengers:`);
        displayPassengers.forEach((passenger, index) => {
            const passengerName = `${passenger.title} ${passenger.firstName} ${passenger.lastName}`.trim();
            lines.push(`  ${index + 1}. ${passengerName} - Passport: ${passenger.passport} - Birth: ${passenger.birthDate || "N/A"}`);
        });
        lines.push(``);
    } else {
        lines.push(`Passengers: No passenger data available`, ``);
    }

    lines.push(
        `We'll start processing your visa shortly!`,
        `${process.env.APP_NAME || "GetTourGuide"}`,
        `${process.env.APP_URL || "http://localhost:5173"}`
    );

    return lines.join("\n");
}

function buildVisaInvoiceHtml(r) {
    const esc = (s) => String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // Use passengers field first, fall back to extra_passengers for backward compatibility
    const displayPassengers = r.passengers || r.extra_passengers || [];

    let passengersHtml = "";
    if (displayPassengers && displayPassengers.length > 0) {
        passengersHtml = `
            <h3 style="margin-top:18px;">Passengers (${displayPassengers.length})</h3>
            <table style="width:100%; border-collapse: collapse; margin-top:10px;">
                <thead>
                    <tr style="background-color: #f8f9fa;">
                        <th style="padding:8px; border:1px solid #ddd; text-align:left;">#</th>
                        <th style="padding:8px; border:1px solid #ddd; text-align:left;">Name</th>
                        <th style="padding:8px; border:1px solid #ddd; text-align:left;">Gender</th>
                        <th style="padding:8px; border:1px solid #ddd; text-align:left;">Passport</th>
                        <th style="padding:8px; border:1px solid #ddd; text-align:left;">Birth Date</th>
                        <th style="padding:8px; border:1px solid #ddd; text-align:left;">Nationality</th>
                    </tr>
                </thead>
                <tbody>
                    ${displayPassengers.map((passenger, index) => `
                        <tr>
                            <td style="padding:8px; border:1px solid #ddd;">${index + 1}</td>
                            <td style="padding:8px; border:1px solid #ddd;">${esc(passenger.title)} ${esc(passenger.firstName)} ${esc(passenger.lastName)}</td>
                            <td style="padding:8px; border:1px solid #ddd;">${esc(passenger.gender)}</td>
                            <td style="padding:8px; border:1px solid #ddd;">${esc(passenger.passport)}</td>
                            <td style="padding:8px; border:1px solid #ddd;">${esc(passenger.birthDate || "-")}</td>
                            <td style="padding:8px; border:1px solid #ddd;">${esc(passenger.nationality)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } else {
        passengersHtml = `<p><em>No passenger data available</em></p>`;
    }

    return `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto;">
      <h2 style="color:#333;">${esc(process.env.APP_NAME || "GetTourGuide")} — Visa Application Invoice</h2>
      <p>Thank you for your visa application!</p>
      <table style="width:100%; border-collapse: collapse;">
        <tbody>
          <tr><td style="padding:6px; border-bottom:1px solid #eee;">Country</td><td style="padding:6px; border-bottom:1px solid #eee;"><b>${esc(r.country || "-")}</b></td></tr>
          <tr><td style="padding:6px; border-bottom:1px solid #eee;">Subject</td><td style="padding:6px; border-bottom:1px solid #eee;">${esc(r.subject || "-")}</td></tr>
          <tr><td style="padding:6px; border-bottom:1px solid #eee;">Travel Date</td><td style="padding:6px; border-bottom:1px solid #eee;">${esc(r.travel_date || "-")}</td></tr>
          <tr><td style="padding:6px; border-bottom:1px solid #eee;">Passengers</td><td style="padding:6px; border-bottom:1px solid #eee;">${Number(r.total_passengers || 1)}</td></tr>
          <tr><td style="padding:6px; border-bottom:1px solid #eee;">Price/Person</td><td style="padding:6px; border-bottom:1px solid #eee;">AED ${Number(r.price_per_person || 0).toFixed(2)}</td></tr>
          <tr><td style="padding:6px; border-bottom:1px solid #eee;">Total Paid</td><td style="padding:6px; border-bottom:1px solid #eee;"><b>AED ${(Number(r.price_per_person || 0) * Number(r.total_passengers || 1)).toFixed(2)}</b></td></tr>
          <tr><td style="padding:6px; border-bottom:1px solid #eee;">Payment Status</td><td style="padding:6px; border-bottom:1px solid #eee;">${esc(r.payment_status || "-")}</td></tr>
          <tr><td style="padding:6px; border-bottom:1px solid #eee;">Stripe Session</td><td style="padding:6px; border-bottom:1px solid #eee;">${esc(r.stripe_session_id || "-")}</td></tr>
        </tbody>
      </table>
      <h3 style="margin-top:18px;">Lead Applicant</h3>
      <p>
        ${esc([r.lead_title, r.lead_first_name, r.lead_last_name].filter(Boolean).join(" "))}<br/>
        ${esc(r.lead_email || "-")}<br/>
        ${esc((r.lead_isd || "") + " " + (r.lead_phone || "-"))}
      </p>
      ${r.notes ? `<p><b>Notes:</b> ${esc(r.notes)}</p>` : ""}
      ${passengersHtml}
      <p style="margin-top:18px; color:#666;">We'll start processing your visa shortly!<br/>${esc(process.env.APP_NAME || "GetTourGuide")} — ${esc(process.env.APP_URL || "http://localhost:5173")}</p>
    </div>
  `;
}

async function notifyVisaInvoice(record) {
    const subject = `${process.env.APP_NAME || "GetTourGuide"} — Visa Application for ${record.country || "Visa"}`;
    const text = buildVisaInvoiceText(record);
    const html = buildVisaInvoiceHtml(record);
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
    const tasks = [];
    if (record.lead_email) {
        tasks.push(sendEmail({ to: record.lead_email, subject, text, html }).catch((e) => console.error("sendEmail (user) error:", e)));
    }
    if (adminEmail) {
        tasks.push(sendEmail({ to: adminEmail, subject: `[Admin Copy] ${subject}`, text, html }).catch((e) => console.error("sendEmail (admin) error:", e)));
    }
    await Promise.all(tasks);
}


module.exports = {
    createVisaCheckoutSession,
    confirmVisaCheckout,
    deleteVisaApplication,
};
