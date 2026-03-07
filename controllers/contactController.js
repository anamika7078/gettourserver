// // backend/controllers/contactController.js
// // import db from "../db.js";
// // import { insertContactMessage } from "../models/contactModel.js";

// const db = require("../db.js");
// const { insertContactMessage } = require("../models/contactModel.js");

// export const submitContactForm = (req, res) => {
//     const { name, email, subject, phone, message } = req.body;

//     if (!name || !email || !message) {
//         return res.status(400).json({ success: false, message: "Missing required fields." });
//     }

//     insertContactMessage({ name, email, subject, phone, message }, (err, result) => {
//         if (err) {
//             console.error("❌ Error saving contact message:", err);
//             return res.status(500).json({ success: false, message: "Server error." });
//         }

//         res.status(201).json({ success: true, message: "Message received successfully!" });
//     });
// };

// export const getAllContactMessages = (req, res) => {
//     const query = "SELECT * FROM contact_messages ORDER BY created_at DESC";
//     db.query(query, (err, results) => {
//         if (err) return res.status(500).json({ error: "Database error" });
//         res.json(results);
//     });
// };

// export const deleteMessage = (req, res) => {
//     const { id } = req.params;
//     const q = "DELETE FROM contact_messages WHERE id = ?";

//     db.query(q, [id], (err, result) => {
//         if (err) {
//             console.error("Error deleting message:", err);
//             return res.status(500).json({ error: "Database error" });
//         }
//         res.json({ success: true, message: "Message deleted successfully" });
//     });
// };


// // ✅ Get total count of contact messages
// export const getContactMessageStats = (req, res) => {
//     const query = `
//     SELECT 
//       COUNT(*) AS totalMessages
//     FROM contact_messages
//   `;

//     db.query(query, (err, result) => {
//         if (err) {
//             console.error("❌ Error fetching contact message stats:", err);
//             return res.status(500).json({ error: "Database error" });
//         }
//         res.json(result[0]);
//     });
// };


// backend/controllers/contactController.js
// import db from "../db.js";
// import { insertContactMessage } from "../models/contactModel.js";

const db = require("../db.js");
const { insertContactMessage } = require("../models/contactModel.js");

const submitContactForm = (req, res) => {
    const { name, email, subject, phone, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    insertContactMessage({ name, email, subject, phone, message }, (err, result) => {
        if (err) {
            console.error("❌ Error saving contact message:", err);
            return res.status(500).json({ success: false, message: "Server error." });
        }

        res.status(201).json({ success: true, message: "Message received successfully!" });
    });
};

const getAllContactMessages = (req, res) => {
    const query = "SELECT * FROM contact_messages ORDER BY created_at DESC";
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json(results);
    });
};

const deleteMessage = (req, res) => {
    const { id } = req.params;
    const q = "DELETE FROM contact_messages WHERE id = ?";

    db.query(q, [id], (err, result) => {
        if (err) {
            console.error("Error deleting message:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json({ success: true, message: "Message deleted successfully" });
    });
};

// ✅ Get total count of contact messages
const getContactMessageStats = (req, res) => {
    const query = `
    SELECT 
      COUNT(*) AS totalMessages
    FROM contact_messages
  `;

    db.query(query, (err, result) => {
        if (err) {
            console.error("❌ Error fetching contact message stats:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(result[0]);
    });
};

// ✅ Export all functions (CommonJS style)
module.exports = {
    submitContactForm,
    getAllContactMessages,
    deleteMessage,
    getContactMessageStats,
};
