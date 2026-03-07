// // import { deleteCruiseEnquiry, getCruiseEnquiries, insertCruiseEnquiry } from "../models/cruiseEnquiryModel.js";
// const { deleteCruiseEnquiry, getCruiseEnquiries, insertCruiseEnquiry } = require("../models/cruiseEnquiryModel.js");


// export const submitCruiseEnquiry = async (req, res) => {
//     try {
//         const {
//             cruise_id,
//             cruise_title,
//             departure_port,
//             departure_date,
//             price,
//             name,
//             email,
//             phone,
//             travel_date,
//             adults,
//             children,
//             adult_count,
//             teen_count,
//             kid_count,
//             infant_count,
//             cabin_name,
//             remarks,
//         } = req.body;

//         if (!name || !email) {
//             return res.status(400).json({ success: false, message: "Missing required fields" });
//         }

//         await insertCruiseEnquiry({
//             cruise_id,
//             cruise_title,
//             departure_port,
//             departure_date,
//             price,
//             name,
//             email,
//             phone,
//             travel_date,
//             adults,
//             children,
//             adult_count,
//             teen_count,
//             kid_count,
//             infant_count,
//             cabin_name,
//             remarks,
//         });

//         res.status(201).json({ success: true, message: "Enquiry submitted" });
//     } catch (err) {
//         console.error("❌ submitCruiseEnquiry error", err);
//         res.status(500).json({ success: false, message: "Server error" });
//     }
// };

// export const listCruiseEnquiries = async (_req, res) => {
//     try {
//         const rows = await getCruiseEnquiries();
//         res.json({ success: true, data: rows });
//     } catch (err) {
//         console.error("❌ listCruiseEnquiries error", err);
//         res.status(500).json({ success: false, message: "Server error" });
//     }
// };

// export const removeCruiseEnquiry = async (req, res) => {
//     try {
//         await deleteCruiseEnquiry(req.params.id);
//         res.json({ success: true });
//     } catch (err) {
//         console.error("❌ removeCruiseEnquiry error", err);
//         res.status(500).json({ success: false, message: "Server error" });
//     }
// };


// import { deleteCruiseEnquiry, getCruiseEnquiries, insertCruiseEnquiry } from "../models/cruiseEnquiryModel.js";
const { deleteCruiseEnquiry, getCruiseEnquiries, insertCruiseEnquiry } = require("../models/cruiseEnquiryModel.js");

const submitCruiseEnquiry = async (req, res) => {
    try {
        const {
            cruise_id,
            cruise_title,
            departure_port,
            departure_date,
            price,
            name,
            email,
            phone,
            travel_date,
            adults,
            children,
            adult_count,
            teen_count,
            kid_count,
            infant_count,
            cabin_name,
            remarks,
        } = req.body;

        if (!name || !email) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        await insertCruiseEnquiry({
            cruise_id,
            cruise_title,
            departure_port,
            departure_date,
            price,
            name,
            email,
            phone,
            travel_date,
            adults,
            children,
            adult_count,
            teen_count,
            kid_count,
            infant_count,
            cabin_name,
            remarks,
        });

        res.status(201).json({ success: true, message: "Enquiry submitted" });
    } catch (err) {
        console.error("❌ submitCruiseEnquiry error", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const listCruiseEnquiries = async (_req, res) => {
    try {
        const rows = await getCruiseEnquiries();
        res.json({ success: true, data: rows });
    } catch (err) {
        console.error("❌ listCruiseEnquiries error", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const removeCruiseEnquiry = async (req, res) => {
    try {
        await deleteCruiseEnquiry(req.params.id);
        res.json({ success: true });
    } catch (err) {
        console.error("❌ removeCruiseEnquiry error", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ✅ Export all functions (CommonJS style)
module.exports = {
    submitCruiseEnquiry,
    listCruiseEnquiries,
    removeCruiseEnquiry,
};
