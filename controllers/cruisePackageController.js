// // import fs from "fs";
// // import path from "path";
// // import { createCruise, deleteCruise, getCruiseById, getCruises, updateCruise } from "../models/cruisePackageModel.js";
// const fs = require("fs");
// const path = require("path");
// const { createCruise, deleteCruise, getCruiseById, getCruises, updateCruise } = require("../models/cruisePackageModel.js");

// export const listCruises = async (_req, res) => {
//     try {
//         const rows = await getCruises();
//         res.json({ success: true, data: rows });
//     } catch (e) {
//         res.status(500).json({ success: false, message: "Server error" });
//     }
// };

// export const getCruise = async (req, res) => {
//     try {
//         const row = await getCruiseById(req.params.id);
//         if (!row) return res.status(404).json({ success: false, message: "Not found" });
//         res.json({ success: true, data: row });
//     } catch (e) {
//         res.status(500).json({ success: false, message: "Server error" });
//     }
// };

// export const createCruiseHandler = async (req, res) => {
//     try {
//         const { title, departure_port, departure_dates, price, banner_video_url, category, details } = req.body;
//         if (!title) return res.status(400).json({ success: false, message: "Title is required" });

//         const image = req.file?.filename || null;
//         const dates = departure_dates ? JSON.parse(departure_dates) : null;

//         await createCruise({ title, departure_port, departure_dates: dates, price, image, banner_video_url, category, details });
//         res.status(201).json({ success: true, message: "Cruise saved" });
//     } catch (e) {
//         console.error(e);
//         res.status(500).json({ success: false, message: "Server error" });
//     }
// };

// export const updateCruiseHandler = async (req, res) => {
//     try {
//         const id = req.params.id;
//         const { title, departure_port, departure_dates, price, banner_video_url, category, details, current_image } = req.body;
//         const exists = await getCruiseById(id);
//         if (!exists) return res.status(404).json({ success: false, message: "Not found" });

//         let image = exists.image || null;
//         if (req.file?.filename) {
//             // delete previous
//             if (image) {
//                 const p = path.join(process.cwd(), "uploads", "cruises", image);
//                 fs.existsSync(p) && fs.unlinkSync(p);
//             }
//             image = req.file.filename;
//         } else if (current_image === "") {
//             // explicit remove
//             if (image) {
//                 const p = path.join(process.cwd(), "uploads", "cruises", image);
//                 fs.existsSync(p) && fs.unlinkSync(p);
//             }
//             image = null;
//         }

//         const dates = departure_dates ? JSON.parse(departure_dates) : null;
//         await updateCruise(id, { title, departure_port, departure_dates: dates, price, image, banner_video_url, category, details });
//         res.json({ success: true, message: "Cruise updated" });
//     } catch (e) {
//         console.error(e);
//         res.status(500).json({ success: false, message: "Server error" });
//     }
// };

// export const deleteCruiseHandler = async (req, res) => {
//     try {
//         const id = req.params.id;
//         const exists = await getCruiseById(id);
//         if (!exists) return res.status(404).json({ success: false, message: "Not found" });
//         if (exists.image) {
//             const p = path.join(process.cwd(), "uploads", "cruises", exists.image);
//             fs.existsSync(p) && fs.unlinkSync(p);
//         }
//         await deleteCruise(id);
//         res.json({ success: true });
//     } catch (e) {
//         console.error(e);
//         res.status(500).json({ success: false, message: "Server error" });
//     }
// };

// const fs = require("fs");
// const path = require("path");
// const { createCruise, deleteCruise, getCruiseById, getCruises, updateCruise } = require("../models/cruisePackageModel.js");

const fs = require("fs");
const path = require("path");
const { createCruise, deleteCruise, getCruiseById, getCruises, updateCruise } = require("../models/cruisePackageModel.js");

const listCruises = async (_req, res) => {
    try {
        const { getJsonData, shouldPreferJsonData } = require("../utils/jsonDataLoader");
        
        // If JSON mode is enabled, use JSON first and skip database
        if (shouldPreferJsonData()) {
            const jsonData = getJsonData("cruises");
            if (jsonData && jsonData.length > 0) {
                console.log("✓ Serving cruises from JSON data");
                return res.json({ success: true, data: jsonData });
            }
        }
        
        // Try database (only if JSON mode is not enabled or JSON data is empty)
        try {
            const rows = await getCruises();
            if (rows && rows.length > 0) {
                return res.json({ success: true, data: rows });
            }
        } catch (dbError) {
            console.warn("Database error, trying JSON fallback:", dbError.message);
        }
        
        // Fallback to JSON if database fails or returns empty
        const jsonData = getJsonData("cruises", true);
        if (jsonData && jsonData.length > 0) {
            console.log("✓ Serving cruises from JSON fallback");
            return res.json({ success: true, data: jsonData });
        }
        
        return res.json({ success: true, data: [] });
    } catch (e) {
        console.error("listCruises error:", e);
        // Last resort: try JSON
        const { getJsonData } = require("../utils/jsonDataLoader");
        const jsonData = getJsonData("cruises", true);
        if (jsonData && jsonData.length > 0) {
            return res.json({ success: true, data: jsonData });
        }
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const getCruise = async (req, res) => {
    try {
        const row = await getCruiseById(req.params.id);
        if (!row) return res.status(404).json({ success: false, message: "Not found" });
        res.json({ success: true, data: row });
    } catch (e) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const createCruiseHandler = async (req, res) => {
    try {
        const { title, departure_port, departure_dates, price, banner_video_url, category, details } = req.body;
        if (!title) return res.status(400).json({ success: false, message: "Title is required" });

        const image = req.file?.filename || null;
        const dates = departure_dates ? JSON.parse(departure_dates) : null;

        await createCruise({ title, departure_port, departure_dates: dates, price, image, banner_video_url, category, details });
        res.status(201).json({ success: true, message: "Cruise saved" });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const updateCruiseHandler = async (req, res) => {
    try {
        const id = req.params.id;
        const { title, departure_port, departure_dates, price, banner_video_url, category, details, current_image } = req.body;
        const exists = await getCruiseById(id);
        if (!exists) return res.status(404).json({ success: false, message: "Not found" });

        let image = exists.image || null;
        if (req.file?.filename) {
            // delete previous
            if (image) {
                const p = path.join(process.cwd(), "uploads", "cruises", image);
                fs.existsSync(p) && fs.unlinkSync(p);
            }
            image = req.file.filename;
        } else if (current_image === "") {
            // explicit remove
            if (image) {
                const p = path.join(process.cwd(), "uploads", "cruises", image);
                fs.existsSync(p) && fs.unlinkSync(p);
            }
            image = null;
        }

        const dates = departure_dates ? JSON.parse(departure_dates) : null;
        await updateCruise(id, { title, departure_port, departure_dates: dates, price, image, banner_video_url, category, details });
        res.json({ success: true, message: "Cruise updated" });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const deleteCruiseHandler = async (req, res) => {
    try {
        const id = req.params.id;
        const exists = await getCruiseById(id);
        if (!exists) return res.status(404).json({ success: false, message: "Not found" });
        if (exists.image) {
            const p = path.join(process.cwd(), "uploads", "cruises", exists.image);
            fs.existsSync(p) && fs.unlinkSync(p);
        }
        await deleteCruise(id);
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = {
    listCruises,
    getCruise,
    createCruiseHandler,
    updateCruiseHandler,
    deleteCruiseHandler,
};
