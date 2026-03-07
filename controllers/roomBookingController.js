

// // import dotenv from "dotenv";
// // import Stripe from "stripe";
// // import db from "../db.js";
// // import RoomBookingModel from "../models/roomBookingModel.js";
// // import { sendEmail } from "../utils/email.js";

// // dotenv.config();
// const dotenv = require("dotenv");
// const Stripe = require("stripe");
// const db = require("../db.js");
// const RoomBookingModel = require("../models/roomBookingModel.js");
// const { sendEmail } = require("../utils/email.js");

// dotenv.config();

// const stripeSecret = process.env.STRIPE_SECRET_KEY || "";
// const stripe = stripeSecret ? new Stripe(stripeSecret) : null;

// function toDateOrNull(s) {
//     if (!s) return null;
//     const d = new Date(s);
//     return isNaN(d) ? null : new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
// }

// export async function createRoomBooking(req, res) {
//     try {
//         await RoomBookingModel.ensureTable();

//         const body = req.body || {};

//         // Normalize/shape payload
//         const hotel = body.hotel || {};
//         const room = body.room || {};
//         const passengers = Array.isArray(body.passengers) ? body.passengers : [];

//         const lead = passengers[0] || {};
//         const extras = passengers.slice(1).map((p) => ({
//             title: p.title || "Mr",
//             firstName: p.firstName || "",
//             lastName: p.lastName || "",
//         }));

//         const booking = {
//             hotel_id: hotel.id || null,
//             hotel_name: hotel.name || body.hotelName || null,
//             room_type: room.type || body.roomType || null,
//             price_per_night: Number(room.price_per_night || body.price_per_night || 0) || 0,
//             check_in: toDateOrNull(body.checkIn),
//             check_out: toDateOrNull(body.checkOut),
//             nights: Number(body.nights || 0) || 0,
//             total_guests: Number(body.totalGuests || body.guests || passengers.length || 1) || 1,
//             total_price: Number(body.totalPrice || 0) || 0,
//             special_request: body.specialRequest || null,
//             lead_title: lead.title || null,
//             lead_first_name: lead.firstName || null,
//             lead_last_name: lead.lastName || null,
//             lead_email: lead.email || null,
//             lead_country_code: lead.countryCode || null,
//             lead_phone: lead.phone || null,
//             lead_nationality: lead.nationality || null,
//             additional_guests: extras,
//         };

//         const result = await RoomBookingModel.create(booking);
//         res.json({ success: true, id: result.insertId });
//     } catch (err) {
//         console.error("createRoomBooking error:", err);
//         res.status(500).json({ success: false, error: err.message || "Server error" });
//     }
// }

// export async function listRoomBookings(_req, res) {
//     try {
//         await RoomBookingModel.ensureTable();
//         const rows = await RoomBookingModel.getAll();
//         res.json(rows);
//     } catch (err) {
//         console.error("listRoomBookings error:", err);
//         res.status(500).json({ success: false, error: err.message || "Server error" });
//     }
// }

// export async function getRoomBookingById(req, res) {
//     try {
//         await RoomBookingModel.ensureTable();
//         const id = req.params.id;
//         const row = await RoomBookingModel.getById(id);
//         if (!row) return res.status(404).json({ success: false, error: "Not found" });
//         res.json(row);
//     } catch (err) {
//         console.error("getRoomBookingById error:", err);
//         res.status(500).json({ success: false, error: err.message || "Server error" });
//     }
// }

// export async function deleteRoomBooking(req, res) {
//     try {
//         await RoomBookingModel.ensureTable();
//         const id = req.params.id;
//         if (!id) return res.status(400).json({ success: false, error: "id required" });

//         db.query("DELETE FROM room_bookings WHERE id = ?", [id], (err, result) => {
//             if (err) {
//                 console.error("deleteRoomBooking error:", err);
//                 return res.status(500).json({ success: false, error: err.message || "Server error" });
//             }
//             // result.affectedRows can indicate if something was deleted
//             if (result && result.affectedRows === 0) {
//                 return res.status(404).json({ success: false, error: "Not found" });
//             }
//             return res.json({ success: true });
//         });
//     } catch (err) {
//         console.error("deleteRoomBooking error:", err);
//         res.status(500).json({ success: false, error: err.message || "Server error" });
//     }
// }

// export async function getBookingStats(req, res) {
//     try {
//         await RoomBookingModel.ensureTable();

//         const [totalBookings, todayBookings, totalRevenue] = await Promise.all([
//             new Promise((resolve, reject) => {
//                 db.query("SELECT COUNT(*) AS count FROM room_bookings", (err, rows) =>
//                     err ? reject(err) : resolve(rows[0].count)
//                 );
//             }),
//             new Promise((resolve, reject) => {
//                 db.query(
//                     "SELECT COUNT(*) AS count FROM room_bookings WHERE DATE(created_at) = CURDATE()",
//                     (err, rows) => (err ? reject(err) : resolve(rows[0].count))
//                 );
//             }),
//             new Promise((resolve, reject) => {
//                 db.query(
//                     "SELECT SUM(total_price) AS revenue FROM room_bookings",
//                     (err, rows) => (err ? reject(err) : resolve(rows[0].revenue || 0))
//                 );
//             }),
//         ]);

//         res.json({
//             totalBookings,
//             todayBookings,
//             totalRevenue,
//         });
//     } catch (err) {
//         console.error("getBookingStats error:", err);
//         res.status(500).json({ error: "Server error" });
//     }
// }

// // ========== Stripe Checkout for Room Bookings ==========
// function toISODate(d) {
//     try {
//         if (!d) return null;
//         const dt = new Date(d);
//         if (isNaN(dt)) return null;
//         return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
//     } catch {
//         return null;
//     }
// }

// export async function createRoomCheckoutSession(req, res) {
//     try {
//         if (!stripe) return res.status(500).json({ success: false, error: "Stripe not configured" });

//         const body = req.body || {};
//         console.log("=== CREATE ROOM CHECKOUT SESSION ===");
//         console.log("Full request body:", JSON.stringify(body, null, 2));

//         const hotel = body.hotel || {};
//         const room = body.room || {};
//         const guests = Number(body.totalGuests || body.guests || 1) || 1;
//         const nights = Number(body.nights || 0) || 0;
//         const pricePerNight = Number(room.price_per_night || body.price_per_night || 0) || 0;
//         const total = Number(body.totalPrice || (pricePerNight * (nights > 0 ? nights : 1) * guests)) || 0;

//         const passengers = Array.isArray(body.passengers) ? body.passengers : [];
//         const lead = passengers[0] || {};
//         const additionalGuests = passengers.slice(1);

//         const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
//         const productName = `${hotel.name || body.hotelName || "Hotel"} — ${room.type || body.roomType || "Room"}`;

//         // Create optimized additional guests data for Stripe metadata
//         let optimizedGuests = "";
//         try {
//             if (Array.isArray(additionalGuests) && additionalGuests.length > 0) {
//                 // Create compressed format for additional guests
//                 const compressed = additionalGuests.map((g, index) =>
//                     `${index + 1}|${g.title?.substring(0, 2) || "Mr"}|${g.firstName?.substring(0, 12) || ""}|${g.lastName?.substring(0, 12) || ""}`
//                 ).join(';');
//                 optimizedGuests = compressed;
//                 console.log("Optimized additional guests:", optimizedGuests);
//                 console.log("Additional guests length:", optimizedGuests.length);
//             }
//         } catch (e) {
//             console.error("Error optimizing additional guests:", e);
//             optimizedGuests = "";
//         }

//         const metadata = {
//             hotel_id: String(hotel.id || ""),
//             hotel_name: String(hotel.name || body.hotelName || "").substring(0, 50),
//             room_type: String(room.type || body.roomType || "").substring(0, 50),
//             price_per_night: String(pricePerNight),
//             check_in: toISODate(body.checkIn) || "",
//             check_out: toISODate(body.checkOut) || "",
//             nights: String(nights),
//             total_guests: String(guests),
//             total_price: String(total),
//             special_request: body.specialRequest ? String(body.specialRequest).slice(0, 200) : "",
//             lead_title: lead.title || "",
//             lead_first_name: lead.firstName ? lead.firstName.substring(0, 20) : "",
//             lead_last_name: lead.lastName ? lead.lastName.substring(0, 20) : "",
//             lead_email: lead.email ? lead.email.substring(0, 40) : "",
//             lead_country_code: lead.countryCode || "",
//             lead_phone: lead.phone ? lead.phone.substring(0, 15) : "",
//             lead_nationality: lead.nationality ? lead.nationality.substring(0, 20) : "",
//             // Store compressed additional guests data
//             additional_guests: optimizedGuests.substring(0, 500),
//             additional_guests_count: String(additionalGuests.length),
//         };

//         console.log("Final metadata for Stripe:", metadata);

//         const session = await stripe.checkout.sessions.create({
//             mode: "payment",
//             success_url: `${FRONTEND_URL}/booking/${hotel.id || ""}?success=1&session_id={CHECKOUT_SESSION_ID}`,
//             cancel_url: `${FRONTEND_URL}/booking/${hotel.id || ""}?canceled=1`,
//             currency: "AED",
//             line_items: [
//                 {
//                     price_data: {
//                         currency: "AED",
//                         product_data: { name: `${productName}` },
//                         unit_amount: Math.round(pricePerNight * 100),
//                     },
//                     quantity: Math.max(1, guests * (nights > 0 ? nights : 1)),
//                 },
//             ],
//             metadata: metadata,
//         });

//         return res.json({ success: true, url: session.url });
//     } catch (err) {
//         console.error("createRoomCheckoutSession error:", err);
//         return res.status(500).json({ success: false, error: err.message || "Server error" });
//     }
// }

// export async function confirmRoomCheckout(req, res) {
//     try {
//         if (!stripe) return res.status(500).json({ success: false, error: "Stripe not configured" });
//         await RoomBookingModel.ensureTable();

//         const { sessionId } = req.body || {};
//         if (!sessionId) return res.status(400).json({ success: false, error: "sessionId required" });

//         const existing = await RoomBookingModel.getByStripeSession(sessionId);
//         if (existing) {
//             return res.json({ success: true, id: existing.id, alreadySaved: true, status: existing.payment_status });
//         }

//         const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["payment_intent"] });
//         if (!session) return res.status(404).json({ success: false, error: "Session not found" });

//         const paid = session.payment_status === "paid" || session.status === "complete";
//         const pi = session.payment_intent;
//         const paymentIntentId = typeof pi === "string" ? pi : pi?.id;

//         const md = session.metadata || {};

//         console.log("=== CONFIRM ROOM CHECKOUT ===");
//         console.log("Stripe session metadata:", md);

//         // Parse additional guests from metadata
//         let additionalGuests = [];
//         try {
//             const guestsData = md.additional_guests;
//             if (guestsData && guestsData !== "") {
//                 console.log("Raw additional guests data:", guestsData);

//                 if (guestsData.includes('|') && guestsData.includes(';')) {
//                     // Parse the optimized pipe-separated format
//                     const guestStrings = guestsData.split(';');
//                     additionalGuests = guestStrings.map((guestStr) => {
//                         const parts = guestStr.split('|');
//                         if (parts.length >= 4) {
//                             return {
//                                 title: parts[1] === 'Mr' ? 'Mr' : parts[1] === 'Ms' ? 'Ms' : parts[1] === 'Mrs' ? 'Mrs' : 'Mr',
//                                 firstName: parts[2] || '',
//                                 lastName: parts[3] || '',
//                             };
//                         }
//                         return null;
//                     }).filter(guest => guest !== null);

//                     console.log("✅ Parsed additional guests:", additionalGuests);
//                 }
//             }
//         } catch (e) {
//             console.error("❌ Error parsing additional guests:", e);
//             additionalGuests = [];
//         }

//         const record = {
//             hotel_id: md.hotel_id ? Number(md.hotel_id) : null,
//             hotel_name: md.hotel_name || null,
//             room_type: md.room_type || null,
//             price_per_night: md.price_per_night ? Number(md.price_per_night) : 0,
//             check_in: md.check_in || null,
//             check_out: md.check_out || null,
//             nights: md.nights ? Number(md.nights) : 0,
//             total_guests: md.total_guests ? Number(md.total_guests) : 1,
//             total_price: md.total_price ? Number(md.total_price) : 0,
//             special_request: md.special_request || null,
//             lead_title: md.lead_title || null,
//             lead_first_name: md.lead_first_name || null,
//             lead_last_name: md.lead_last_name || null,
//             lead_email: md.lead_email || null,
//             lead_country_code: md.lead_country_code || null,
//             lead_phone: md.lead_phone || null,
//             lead_nationality: md.lead_nationality || null,
//             additional_guests: additionalGuests, // Now properly populated
//             payment_status: paid ? "paid" : session.payment_status || "unpaid",
//             stripe_session_id: session.id,
//             stripe_payment_intent: paymentIntentId || null,
//         };

//         console.log("💾 Record to be saved to database:", {
//             ...record,
//             additional_guests_count: additionalGuests.length
//         });

//         try {
//             const result = await RoomBookingModel.createPaid(record);
//             console.log("✅ Database insert successful - Insert ID:", result.insertId);

//             if (record.payment_status === "paid") {
//                 notifyRoomInvoice(record).catch((e) => console.error("notifyRoomInvoice error:", e));
//             }

//             return res.json({ success: true, id: result.insertId, status: record.payment_status });
//         } catch (e) {
//             if (e && (e.code === "ER_DUP_ENTRY" || e.errno === 1062)) {
//                 const existingAgain = await RoomBookingModel.getByStripeSession(session.id);
//                 if (existingAgain) {
//                     return res.json({
//                         success: true,
//                         id: existingAgain.id,
//                         status: existingAgain.payment_status || record.payment_status,
//                         alreadySaved: true,
//                     });
//                 }
//             }
//             throw e;
//         }
//     } catch (err) {
//         console.error("confirmRoomCheckout error:", err);
//         return res.status(500).json({ success: false, error: err.message || "Server error" });
//     }
// }

// function buildRoomInvoiceText(r) {
//     const lines = [
//         `Thank you for your hotel booking!`,
//         ``,
//         `${process.env.APP_NAME || "GetTourGuide"} — Hotel Booking Invoice`,
//         `--------------------------------------------------`,
//         `Hotel: ${r.hotel_name || "-"}`,
//         `Room: ${r.room_type || "-"}`,
//         `Check-in: ${r.check_in || "-"}`,
//         `Check-out: ${r.check_out || "-"}`,
//         `Nights: ${Number(r.nights || 0)}`,
//         `Guests: ${Number(r.total_guests || 1)}`,
//         `Price/Night: AED ${Number(r.price_per_night || 0).toFixed(2)}`,
//         `Total Paid: AED ${Number(r.total_price || 0).toFixed(2)}`,
//         `Payment Status: ${r.payment_status || "-"}`,
//         ``,
//         `Lead: ${[r.lead_title, r.lead_first_name, r.lead_last_name].filter(Boolean).join(" ")}`,
//         `Email: ${r.lead_email || "-"}`,
//         `Phone: ${(r.lead_country_code || "") + " " + (r.lead_phone || "-")}`,
//         r.special_request ? `Special Request: ${r.special_request}` : null,
//         ``,
//     ];

//     // Add additional guests to the invoice
//     const additionalGuests = r.additional_guests || [];
//     if (additionalGuests.length > 0) {
//         lines.push(`Additional Guests:`);
//         additionalGuests.forEach((guest, index) => {
//             const guestName = `${guest.title} ${guest.firstName} ${guest.lastName}`.trim();
//             lines.push(`  ${index + 1}. ${guestName}`);
//         });
//         lines.push(``);
//     }

//     lines.push(
//         `We look forward to hosting you!`,
//         `${process.env.APP_NAME || "GetTourGuide"}`,
//         `${process.env.APP_URL || "http://localhost:5173"}`
//     );

//     return lines.join("\n");
// }

// function buildRoomInvoiceHtml(r) {
//     const esc = (s) => String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

//     let additionalGuestsHtml = "";
//     const additionalGuests = r.additional_guests || [];
//     if (additionalGuests.length > 0) {
//         additionalGuestsHtml = `
//             <h3 style="margin-top:18px;">Additional Guests (${additionalGuests.length})</h3>
//             <table style="width:100%; border-collapse: collapse; margin-top:10px;">
//                 <thead>
//                     <tr style="background-color: #f8f9fa;">
//                         <th style="padding:8px; border:1px solid #ddd; text-align:left;">#</th>
//                         <th style="padding:8px; border:1px solid #ddd; text-align:left;">Name</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     ${additionalGuests.map((guest, index) => `
//                         <tr>
//                             <td style="padding:8px; border:1px solid #ddd;">${index + 1}</td>
//                             <td style="padding:8px; border:1px solid #ddd;">${esc(guest.title)} ${esc(guest.firstName)} ${esc(guest.lastName)}</td>
//                         </tr>
//                     `).join('')}
//                 </tbody>
//             </table>
//         `;
//     }

//     return `
//       <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto;">
//         <h2 style="color:#333;">${esc(process.env.APP_NAME || "GetTourGuide")} — Hotel Booking Invoice</h2>
//         <p>Thank you for your hotel booking!</p>
//         <table style="width:100%; border-collapse: collapse;">
//           <tbody>
//             <tr><td style="padding:6px; border-bottom:1px solid #eee;">Hotel</td><td style="padding:6px; border-bottom:1px solid #eee;"><b>${esc(r.hotel_name || "-")}</b></td></tr>
//             <tr><td style="padding:6px; border-bottom:1px solid #eee;">Room</td><td style="padding:6px; border-bottom:1px solid #eee;">${esc(r.room_type || "-")}</td></tr>
//             <tr><td style="padding:6px; border-bottom:1px solid #eee;">Check-in</td><td style="padding:6px; border-bottom:1px solid #eee;">${esc(r.check_in || "-")}</td></tr>
//             <tr><td style="padding:6px; border-bottom:1px solid #eee;">Check-out</td><td style="padding:6px; border-bottom:1px solid #eee;">${esc(r.check_out || "-")}</td></tr>
//             <tr><td style="padding:6px; border-bottom:1px solid #eee;">Nights</td><td style="padding:6px; border-bottom:1px solid #eee;">${Number(r.nights || 0)}</td></tr>
//             <tr><td style="padding:6px; border-bottom:1px solid #eee;">Guests</td><td style="padding:6px; border-bottom:1px solid #eee;">${Number(r.total_guests || 1)}</td></tr>
//             <tr><td style="padding:6px; border-bottom:1px solid #eee;">Price/Night</td><td style="padding:6px; border-bottom:1px solid #eee;">AED ${Number(r.price_per_night || 0).toFixed(2)}</td></tr>
//             <tr><td style="padding:6px; border-bottom:1px solid #eee;">Total Paid</td><td style="padding:6px; border-bottom:1px solid #eee;"><b>AED ${Number(r.total_price || 0).toFixed(2)}</b></td></tr>
//             <tr><td style="padding:6px; border-bottom:1px solid #eee;">Payment Status</td><td style="padding:6px; border-bottom:1px solid #eee;">${esc(r.payment_status || "-")}</td></tr>
//           </tbody>
//         </table>
//         <h3 style="margin-top:18px;">Lead Passenger</h3>
//         <p>
//           ${esc([r.lead_title, r.lead_first_name, r.lead_last_name].filter(Boolean).join(" "))}<br/>
//           ${esc(r.lead_email || "-")}<br/>
//           ${esc((r.lead_country_code || "") + " " + (r.lead_phone || "-"))}
//         </p>
//         ${r.special_request ? `<p><b>Special Request:</b> ${esc(r.special_request)}</p>` : ""}
//         ${additionalGuestsHtml}
//         <p style="margin-top:18px; color:#666;">We look forward to hosting you!<br/>${esc(process.env.APP_NAME || "GetTourGuide")} — ${esc(process.env.APP_URL || "http://localhost:5173")}</p>
//       </div>
//     `;
// }

// async function notifyRoomInvoice(record) {
//     const subject = `${process.env.APP_NAME || "GetTourGuide"} — Invoice for ${record.hotel_name || "Hotel"}`;
//     const text = buildRoomInvoiceText(record);
//     const html = buildRoomInvoiceHtml(record);
//     const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
//     const tasks = [];
//     if (record.lead_email) {
//         tasks.push(
//             sendEmail({ to: record.lead_email, subject, text, html }).catch((e) =>
//                 console.error("sendEmail (user) error:", e)
//             )
//         );
//     }
//     if (adminEmail) {
//         tasks.push(
//             sendEmail({ to: adminEmail, subject: `[Admin Copy] ${subject}`, text, html }).catch((e) =>
//                 console.error("sendEmail (admin) error:", e)
//             )
//         );
//     }
//     await Promise.all(tasks);
// }

// ====================== roomBookingController.js (CommonJS) ======================

const dotenv = require("dotenv");
const Stripe = require("stripe");
const db = require("../db.js");
const RoomBookingModel = require("../models/roomBookingModel.js");
const { sendEmail } = require("../utils/email.js");

dotenv.config();

const stripeSecret = process.env.STRIPE_SECRET_KEY || "";
const stripe = stripeSecret ? new Stripe(stripeSecret) : null;

function toDateOrNull(s) {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d) ? null : new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}

// ====================== Create Room Booking ======================
async function createRoomBooking(req, res) {
  try {
    await RoomBookingModel.ensureTable();

    const body = req.body || {};

    const hotel = body.hotel || {};
    const room = body.room || {};
    const passengers = Array.isArray(body.passengers) ? body.passengers : [];

    const lead = passengers[0] || {};
    const extras = passengers.slice(1).map((p) => ({
      title: p.title || "Mr",
      firstName: p.firstName || "",
      lastName: p.lastName || "",
    }));

    const booking = {
      hotel_id: hotel.id || null,
      hotel_name: hotel.name || body.hotelName || null,
      room_type: room.type || body.roomType || null,
      price_per_night: Number(room.price_per_night || body.price_per_night || 0) || 0,
      check_in: toDateOrNull(body.checkIn),
      check_out: toDateOrNull(body.checkOut),
      nights: Number(body.nights || 0) || 0,
      total_guests: Number(body.totalGuests || body.guests || passengers.length || 1) || 1,
      total_price: Number(body.totalPrice || 0) || 0,
      special_request: body.specialRequest || null,
      lead_title: lead.title || null,
      lead_first_name: lead.firstName || null,
      lead_last_name: lead.lastName || null,
      lead_email: lead.email || null,
      lead_country_code: lead.countryCode || null,
      lead_phone: lead.phone || null,
      lead_nationality: lead.nationality || null,
      additional_guests: extras,
    };

    const result = await RoomBookingModel.create(booking);
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error("createRoomBooking error:", err);
    res.status(500).json({ success: false, error: err.message || "Server error" });
  }
}

// ====================== List All Room Bookings ======================
async function listRoomBookings(_req, res) {
  try {
    await RoomBookingModel.ensureTable();
    const rows = await RoomBookingModel.getAll();
    res.json(rows);
  } catch (err) {
    console.error("listRoomBookings error:", err);
    res.status(500).json({ success: false, error: err.message || "Server error" });
  }
}

// ====================== Get Room Booking by ID ======================
async function getRoomBookingById(req, res) {
  try {
    await RoomBookingModel.ensureTable();
    const id = req.params.id;
    const row = await RoomBookingModel.getById(id);
    if (!row) return res.status(404).json({ success: false, error: "Not found" });
    res.json(row);
  } catch (err) {
    console.error("getRoomBookingById error:", err);
    res.status(500).json({ success: false, error: err.message || "Server error" });
  }
}

// ====================== Delete Room Booking ======================
async function deleteRoomBooking(req, res) {
  try {
    await RoomBookingModel.ensureTable();
    const id = req.params.id;
    if (!id) return res.status(400).json({ success: false, error: "id required" });

    db.query("DELETE FROM room_bookings WHERE id = ?", [id], (err, result) => {
      if (err) {
        console.error("deleteRoomBooking error:", err);
        return res.status(500).json({ success: false, error: err.message || "Server error" });
      }
      if (result && result.affectedRows === 0) {
        return res.status(404).json({ success: false, error: "Not found" });
      }
      return res.json({ success: true });
    });
  } catch (err) {
    console.error("deleteRoomBooking error:", err);
    res.status(500).json({ success: false, error: err.message || "Server error" });
  }
}

// ====================== Booking Stats ======================
async function getBookingStats(req, res) {
  try {
    await RoomBookingModel.ensureTable();

    const [totalBookings, todayBookings, totalRevenue] = await Promise.all([
      new Promise((resolve, reject) => {
        db.query("SELECT COUNT(*) AS count FROM room_bookings", (err, rows) =>
          err ? reject(err) : resolve(rows[0].count)
        );
      }),
      new Promise((resolve, reject) => {
        db.query(
          "SELECT COUNT(*) AS count FROM room_bookings WHERE DATE(created_at) = CURDATE()",
          (err, rows) => (err ? reject(err) : resolve(rows[0].count))
        );
      }),
      new Promise((resolve, reject) => {
        db.query(
          "SELECT SUM(total_price) AS revenue FROM room_bookings",
          (err, rows) => (err ? reject(err) : resolve(rows[0].revenue || 0))
        );
      }),
    ]);

    res.json({ totalBookings, todayBookings, totalRevenue });
  } catch (err) {
    console.error("getBookingStats error:", err);
    res.status(500).json({ error: "Server error" });
  }
}

// ====================== Stripe Checkout for Room Bookings ======================
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

async function createRoomCheckoutSession(req, res) {
  try {
    if (!stripe) return res.status(500).json({ success: false, error: "Stripe not configured" });

    const body = req.body || {};
    const hotel = body.hotel || {};
    const room = body.room || {};
    const guests = Number(body.totalGuests || body.guests || 1) || 1;
    const nights = Number(body.nights || 0) || 0;
    const pricePerNight = Number(room.price_per_night || body.price_per_night || 0) || 0;
    const total = Number(body.totalPrice || pricePerNight * (nights > 0 ? nights : 1) * guests) || 0;

    const passengers = Array.isArray(body.passengers) ? body.passengers : [];
    const lead = passengers[0] || {};
    const additionalGuests = passengers.slice(1);

    const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
    const productName = `${hotel.name || body.hotelName || "Hotel"} — ${room.type || body.roomType || "Room"}`;

    let optimizedGuests = "";
    try {
      if (Array.isArray(additionalGuests) && additionalGuests.length > 0) {
        const compressed = additionalGuests
          .map((g, i) =>
            `${i + 1}|${g.title?.substring(0, 2) || "Mr"}|${g.firstName?.substring(0, 12) || ""}|${g.lastName?.substring(0, 12) || ""}`
          )
          .join(";");
        optimizedGuests = compressed;
      }
    } catch (e) {
      console.error("Error optimizing additional guests:", e);
      optimizedGuests = "";
    }

    const metadata = {
      hotel_id: String(hotel.id || ""),
      hotel_name: String(hotel.name || body.hotelName || "").substring(0, 50),
      room_type: String(room.type || body.roomType || "").substring(0, 50),
      price_per_night: String(pricePerNight),
      check_in: toISODate(body.checkIn) || "",
      check_out: toISODate(body.checkOut) || "",
      nights: String(nights),
      total_guests: String(guests),
      total_price: String(total),
      special_request: body.specialRequest ? String(body.specialRequest).slice(0, 200) : "",
      lead_title: lead.title || "",
      lead_first_name: lead.firstName ? lead.firstName.substring(0, 20) : "",
      lead_last_name: lead.lastName ? lead.lastName.substring(0, 20) : "",
      lead_email: lead.email ? lead.email.substring(0, 40) : "",
      lead_country_code: lead.countryCode || "",
      lead_phone: lead.phone ? lead.phone.substring(0, 15) : "",
      lead_nationality: lead.nationality ? lead.nationality.substring(0, 20) : "",
      additional_guests: optimizedGuests.substring(0, 500),
      additional_guests_count: String(additionalGuests.length),
    };

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${FRONTEND_URL}/booking/${hotel.id || ""}?success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/booking/${hotel.id || ""}?canceled=1`,
      currency: "AED",
      line_items: [
        {
          price_data: {
            currency: "AED",
            product_data: { name: `${productName}` },
            unit_amount: Math.round(pricePerNight * 100),
          },
          quantity: Math.max(1, guests * (nights > 0 ? nights : 1)),
        },
      ],
      metadata: metadata,
    });

    return res.json({ success: true, url: session.url });
  } catch (err) {
    console.error("createRoomCheckoutSession error:", err);
    return res.status(500).json({ success: false, error: err.message || "Server error" });
  }
}

// ====================== Confirm Stripe Checkout ======================
async function confirmRoomCheckout(req, res) {
  try {
    if (!stripe) return res.status(500).json({ success: false, error: "Stripe not configured" });
    await RoomBookingModel.ensureTable();

    const { sessionId } = req.body || {};
    if (!sessionId) return res.status(400).json({ success: false, error: "sessionId required" });

    const existing = await RoomBookingModel.getByStripeSession(sessionId);
    if (existing) {
      return res.json({ success: true, id: existing.id, alreadySaved: true, status: existing.payment_status });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["payment_intent"] });
    if (!session) return res.status(404).json({ success: false, error: "Session not found" });

    const paid = session.payment_status === "paid" || session.status === "complete";
    const pi = session.payment_intent;
    const paymentIntentId = typeof pi === "string" ? pi : pi?.id;
    const md = session.metadata || {};

    let additionalGuests = [];
    try {
      const guestsData = md.additional_guests;
      if (guestsData && guestsData !== "") {
        if (guestsData.includes("|") && guestsData.includes(";")) {
          const guestStrings = guestsData.split(";");
          additionalGuests = guestStrings
            .map((guestStr) => {
              const parts = guestStr.split("|");
              if (parts.length >= 4) {
                return {
                  title: parts[1] === "Mr" ? "Mr" : parts[1] === "Ms" ? "Ms" : parts[1] === "Mrs" ? "Mrs" : "Mr",
                  firstName: parts[2] || "",
                  lastName: parts[3] || "",
                };
              }
              return null;
            })
            .filter((g) => g !== null);
        }
      }
    } catch (e) {
      console.error("❌ Error parsing additional guests:", e);
      additionalGuests = [];
    }

    const record = {
      hotel_id: md.hotel_id ? Number(md.hotel_id) : null,
      hotel_name: md.hotel_name || null,
      room_type: md.room_type || null,
      price_per_night: md.price_per_night ? Number(md.price_per_night) : 0,
      check_in: md.check_in || null,
      check_out: md.check_out || null,
      nights: md.nights ? Number(md.nights) : 0,
      total_guests: md.total_guests ? Number(md.total_guests) : 1,
      total_price: md.total_price ? Number(md.total_price) : 0,
      special_request: md.special_request || null,
      lead_title: md.lead_title || null,
      lead_first_name: md.lead_first_name || null,
      lead_last_name: md.lead_last_name || null,
      lead_email: md.lead_email || null,
      lead_country_code: md.lead_country_code || null,
      lead_phone: md.lead_phone || null,
      lead_nationality: md.lead_nationality || null,
      additional_guests: additionalGuests,
      payment_status: paid ? "paid" : session.payment_status || "unpaid",
      stripe_session_id: session.id,
      stripe_payment_intent: paymentIntentId || null,
    };

    try {
      const result = await RoomBookingModel.createPaid(record);

      if (record.payment_status === "paid") {
        notifyRoomInvoice(record).catch((e) => console.error("notifyRoomInvoice error:", e));
      }

      return res.json({ success: true, id: result.insertId, status: record.payment_status });
    } catch (e) {
      if (e && (e.code === "ER_DUP_ENTRY" || e.errno === 1062)) {
        const existingAgain = await RoomBookingModel.getByStripeSession(session.id);
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
    console.error("confirmRoomCheckout error:", err);
    return res.status(500).json({ success: false, error: err.message || "Server error" });
  }
}

// ====================== Email Invoice Helpers ======================
function buildRoomInvoiceText(r) {
  const lines = [
    `Thank you for your hotel booking!`,
    ``,
    `${process.env.APP_NAME || "GetTourGuide"} — Hotel Booking Invoice`,
    `--------------------------------------------------`,
    `Hotel: ${r.hotel_name || "-"}`,
    `Room: ${r.room_type || "-"}`,
    `Check-in: ${r.check_in || "-"}`,
    `Check-out: ${r.check_out || "-"}`,
    `Nights: ${Number(r.nights || 0)}`,
    `Guests: ${Number(r.total_guests || 1)}`,
    `Price/Night: AED ${Number(r.price_per_night || 0).toFixed(2)}`,
    `Total Paid: AED ${Number(r.total_price || 0).toFixed(2)}`,
    `Payment Status: ${r.payment_status || "-"}`,
    ``,
    `Lead: ${[r.lead_title, r.lead_first_name, r.lead_last_name].filter(Boolean).join(" ")}`,
    `Email: ${r.lead_email || "-"}`,
    `Phone: ${(r.lead_country_code || "") + " " + (r.lead_phone || "-")}`,
    r.special_request ? `Special Request: ${r.special_request}` : null,
    ``,
  ];

  const additionalGuests = r.additional_guests || [];
  if (additionalGuests.length > 0) {
    lines.push(`Additional Guests:`);
    additionalGuests.forEach((g, i) => {
      const guestName = `${g.title} ${g.firstName} ${g.lastName}`.trim();
      lines.push(`  ${i + 1}. ${guestName}`);
    });
    lines.push(``);
  }

  lines.push(
    `We look forward to hosting you!`,
    `${process.env.APP_NAME || "GetTourGuide"}`,
    `${process.env.APP_URL || "http://localhost:5173"}`
  );

  return lines.join("\n");
}

function buildRoomInvoiceHtml(r) {
  const esc = (s) =>
    String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  let additionalGuestsHtml = "";
  const additionalGuests = r.additional_guests || [];
  if (additionalGuests.length > 0) {
    additionalGuestsHtml = `
      <h3 style="margin-top:18px;">Additional Guests (${additionalGuests.length})</h3>
      <table style="width:100%; border-collapse: collapse; margin-top:10px;">
        <thead>
          <tr style="background-color: #f8f9fa;">
            <th style="padding:8px; border:1px solid #ddd; text-align:left;">#</th>
            <th style="padding:8px; border:1px solid #ddd; text-align:left;">Name</th>
          </tr>
        </thead>
        <tbody>
          ${additionalGuests
            .map(
              (g, i) => `
            <tr>
              <td style="padding:8px; border:1px solid #ddd;">${i + 1}</td>
              <td style="padding:8px; border:1px solid #ddd;">${esc(g.title)} ${esc(g.firstName)} ${esc(g.lastName)}</td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table>
    `;
  }

  return `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto;">
      <h2 style="color:#333;">${esc(process.env.APP_NAME || "GetTourGuide")} — Hotel Booking Invoice</h2>
      <p>Thank you for your hotel booking!</p>
      <table style="width:100%; border-collapse: collapse;">
        <tbody>
          <tr><td style="padding:6px; border-bottom:1px solid #eee;">Hotel</td><td style="padding:6px; border-bottom:1px solid #eee;"><b>${esc(r.hotel_name || "-")}</b></td></tr>
          <tr><td style="padding:6px; border-bottom:1px solid #eee;">Room</td><td style="padding:6px; border-bottom:1px solid #eee;">${esc(r.room_type || "-")}</td></tr>
          <tr><td style="padding:6px; border-bottom:1px solid #eee;">Check-in</td><td style="padding:6px; border-bottom:1px solid #eee;">${esc(r.check_in || "-")}</td></tr>
          <tr><td style="padding:6px; border-bottom:1px solid #eee;">Check-out</td><td style="padding:6px; border-bottom:1px solid #eee;">${esc(r.check_out || "-")}</td></tr>
          <tr><td style="padding:6px; border-bottom:1px solid #eee;">Nights</td><td style="padding:6px; border-bottom:1px solid #eee;">${Number(r.nights || 0)}</td></tr>
          <tr><td style="padding:6px; border-bottom:1px solid #eee;">Guests</td><td style="padding:6px; border-bottom:1px solid #eee;">${Number(r.total_guests || 1)}</td></tr>
          <tr><td style="padding:6px; border-bottom:1px solid #eee;">Price/Night</td><td style="padding:6px; border-bottom:1px solid #eee;">AED ${Number(r.price_per_night || 0).toFixed(2)}</td></tr>
          <tr><td style="padding:6px; border-bottom:1px solid #eee;">Total Paid</td><td style="padding:6px; border-bottom:1px solid #eee;"><b>AED ${Number(r.total_price || 0).toFixed(2)}</b></td></tr>
          <tr><td style="padding:6px; border-bottom:1px solid #eee;">Payment Status</td><td style="padding:6px; border-bottom:1px solid #eee;">${esc(r.payment_status || "-")}</td></tr>
        </tbody>
      </table>
      <h3 style="margin-top:18px;">Lead Passenger</h3>
      <p>
        ${esc([r.lead_title, r.lead_first_name, r.lead_last_name].filter(Boolean).join(" "))}<br/>
        ${esc(r.lead_email || "-")}<br/>
        ${esc((r.lead_country_code || "") + " " + (r.lead_phone || "-"))}
      </p>
      ${r.special_request ? `<p><b>Special Request:</b> ${esc(r.special_request)}</p>` : ""}
      ${additionalGuestsHtml}
      <p style="margin-top:18px; color:#666;">We look forward to hosting you!<br/>${esc(process.env.APP_NAME || "GetTourGuide")} — ${esc(process.env.APP_URL || "http://localhost:5173")}</p>
    </div>
  `;
}

async function notifyRoomInvoice(record) {
  const subject = `${process.env.APP_NAME || "GetTourGuide"} — Invoice for ${record.hotel_name || "Hotel"}`;
  const text = buildRoomInvoiceText(record);
  const html = buildRoomInvoiceHtml(record);
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;

  const tasks = [];
  if (record.lead_email) {
    tasks.push(
      sendEmail({ to: record.lead_email, subject, text, html }).catch((e) =>
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

// ====================== Exports ======================
module.exports = {
  createRoomBooking,
  listRoomBookings,
  getRoomBookingById,
  deleteRoomBooking,
  getBookingStats,
  createRoomCheckoutSession,
  confirmRoomCheckout,
};
