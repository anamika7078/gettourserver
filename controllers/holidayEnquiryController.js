// // import { deleteHolidayEnquiry, getHolidayEnquiries, insertHolidayEnquiry } from "../models/holidayEnquiryModel.js";
// const { deleteHolidayEnquiry, getHolidayEnquiries, insertHolidayEnquiry } = require("../models/holidayEnquiryModel.js");

// export const submitHolidayEnquiry = async (req, res) => {
//     try {
//         const {
//             package_id,
//             package_title,
//             destination,
//             duration,
//             price,
//             name,
//             email,
//             phone,
//             travel_date,
//             adults,
//             children,
//             flight_booked,
//             remarks,
//         } = req.body;

//         if (!name || !email) {
//             return res.status(400).json({ success: false, message: "Missing required fields" });
//         }

//         await insertHolidayEnquiry({
//             package_id,
//             package_title,
//             destination,
//             duration,
//             price,
//             name,
//             email,
//             phone,
//             travel_date,
//             adults,
//             children,
//             flight_booked,
//             remarks,
//         });

//         res.status(201).json({ success: true, message: "Enquiry submitted" });
//     } catch (err) {
//         console.error("❌ submitHolidayEnquiry error", err);
//         res.status(500).json({ success: false, message: "Server error" });
//     }
// };

// export const listHolidayEnquiries = async (_req, res) => {
//     try {
//         const rows = await getHolidayEnquiries();
//         res.json({ success: true, data: rows });
//     } catch (err) {
//         console.error("❌ listHolidayEnquiries error", err);
//         res.status(500).json({ success: false, message: "Server error" });
//     }
// };

// export const removeHolidayEnquiry = async (req, res) => {
//     try {
//         await deleteHolidayEnquiry(req.params.id);
//         res.json({ success: true });
//     } catch (err) {
//         console.error("❌ removeHolidayEnquiry error", err);
//         res.status(500).json({ success: false, message: "Server error" });
//     }
// };


// const { deleteHolidayEnquiry, getHolidayEnquiries, insertHolidayEnquiry } = require("../models/holidayEnquiryModel.js");
const { deleteHolidayEnquiry, getHolidayEnquiries, insertHolidayEnquiry } = require("../models/holidayEnquiryModel.js");

const submitHolidayEnquiry = async (req, res) => {
    try {
        const {
            package_id,
            package_title,
            destination,
            duration,
            price,
            name,
            email,
            phone,
            travel_date,
            adults,
            children,
            flight_booked,
            remarks,
        } = req.body;

        if (!name || !email) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        await insertHolidayEnquiry({
            package_id,
            package_title,
            destination,
            duration,
            price,
            name,
            email,
            phone,
            travel_date,
            adults,
            children,
            flight_booked,
            remarks,
        });

        res.status(201).json({ success: true, message: "Enquiry submitted" });
    } catch (err) {
        console.error("❌ submitHolidayEnquiry error", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const listHolidayEnquiries = async (_req, res) => {
    try {
        const rows = await getHolidayEnquiries();
        res.json({ success: true, data: rows });
    } catch (err) {
        console.error("❌ listHolidayEnquiries error", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const removeHolidayEnquiry = async (req, res) => {
    try {
        await deleteHolidayEnquiry(req.params.id);
        res.json({ success: true });
    } catch (err) {
        console.error("❌ removeHolidayEnquiry error", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = {
    submitHolidayEnquiry,
    listHolidayEnquiries,
    removeHolidayEnquiry,
};
