// // import {
// //     ensureVisaTable,
// //     getAllVisas,
// //     insertVisa,
// //     deleteVisa as modelDeleteVisa,
// //     getVisaById as modelGetVisaById,
// //     updateVisa as modelUpdateVisa,
// // } from "../models/visaModel.js";
// const {
//     ensureVisaTable,
//     getAllVisas,
//     insertVisa,
//     deleteVisa: modelDeleteVisa,
//     getVisaById: modelGetVisaById,
//     updateVisa: modelUpdateVisa,
// } = require("../models/visaModel.js");


// export async function createVisa(req, res) {
//     try {
//         await ensureVisaTable();
//         const { country, price, subject, overview } = req.body;
//         const image = req.file?.filename || null;
//         if (!country || !country.trim()) {
//             return res.status(400).json({ success: false, message: "Country is required" });
//         }
//         const result = await insertVisa({ country: country.trim(), price, subject, image, overview });
//         res.json({ success: true, insertId: result.insertId });
//     } catch (err) {
//         console.error("createVisa error", err);
//         res.status(500).json({ success: false, message: err.message || "Server error" });
//     }
// }

// export async function listVisas(req, res) {
//     try {
//         await ensureVisaTable();
//         const rows = await getAllVisas();
//         res.json(rows || []);
//     } catch (err) {
//         console.error("listVisas error", err);
//         res.status(500).json({ success: false, message: err.message || "Server error" });
//     }
// }

// export async function getVisa(req, res) {
//     try {
//         await ensureVisaTable();
//         const id = req.params.id;
//         const row = await modelGetVisaById(id);
//         if (!row) return res.status(404).json({ success: false, message: "Visa not found" });
//         res.json({ success: true, data: row });
//     } catch (err) {
//         console.error("getVisa error", err);
//         res.status(500).json({ success: false, message: err.message || "Server error" });
//     }
// }

// export async function updateVisa(req, res) {
//     try {
//         await ensureVisaTable();
//         const id = req.params.id;
//         const { country, price, subject, overview } = req.body;
//         const image = req.file?.filename || null;
//         await modelUpdateVisa(id, { country, price, subject, image, overview });
//         res.json({ success: true, message: "Visa updated" });
//     } catch (err) {
//         console.error("updateVisa error", err);
//         res.status(500).json({ success: false, message: err.message || "Server error" });
//     }
// }

// export async function deleteVisa(req, res) {
//     try {
//         await ensureVisaTable();
//         const id = req.params.id;
//         const result = await modelDeleteVisa(id);
//         if (result.affectedRows > 0) return res.json({ success: true, message: "Visa deleted" });
//         res.status(404).json({ success: false, message: "Visa not found" });
//     } catch (err) {
//         console.error("deleteVisa error", err);
//         res.status(500).json({ success: false, message: err.message || "Server error" });
//     }
// }


// const {
//     ensureVisaTable,
//     getAllVisas,
//     insertVisa,
//     deleteVisa as modelDeleteVisa,
//     getVisaById as modelGetVisaById,
//     updateVisa as modelUpdateVisa,
// } = require("../models/visaModel.js");

const {
    ensureVisaTable,
    getAllVisas,
    insertVisa,
    deleteVisa: modelDeleteVisa,
    getVisaById: modelGetVisaById,
    updateVisa: modelUpdateVisa,
} = require("../models/visaModel.js");

async function createVisa(req, res) {
    try {
        await ensureVisaTable();
        const { country, price, subject, overview } = req.body;
        const image = req.file?.filename || null;
        if (!country || !country.trim()) {
            return res.status(400).json({ success: false, message: "Country is required" });
        }
        const result = await insertVisa({ country: country.trim(), price, subject, image, overview });
        res.json({ success: true, insertId: result.insertId });
    } catch (err) {
        console.error("createVisa error", err);
        res.status(500).json({ success: false, message: err.message || "Server error" });
    }
}

async function listVisas(req, res) {
    try {
        const { getJsonData, shouldPreferJsonData } = require("../utils/jsonDataLoader");
        
        // If JSON mode is enabled, use JSON first and skip database
        if (shouldPreferJsonData()) {
            const jsonData = getJsonData("visas");
            if (jsonData && jsonData.length > 0) {
                console.log("✓ Serving visas from JSON data");
                return res.json(jsonData);
            }
        }
        
        // Try database (only if JSON mode is not enabled or JSON data is empty)
        try {
            await ensureVisaTable();
            const rows = await getAllVisas();
            if (rows && rows.length > 0) {
                return res.json(rows);
            }
        } catch (dbError) {
            console.warn("Database error, trying JSON fallback:", dbError.message);
        }
        
        // Fallback to JSON if database fails or returns empty
        const jsonData = getJsonData("visas", true);
        if (jsonData && jsonData.length > 0) {
            console.log("✓ Serving visas from JSON fallback");
            return res.json(jsonData);
        }
        
        return res.json([]);
    } catch (err) {
        console.error("listVisas error", err);
        // Last resort: try JSON
        const { getJsonData } = require("../utils/jsonDataLoader");
        const jsonData = getJsonData("visas", true);
        if (jsonData && jsonData.length > 0) {
            return res.json(jsonData);
        }
        res.status(500).json({ success: false, message: err.message || "Server error" });
    }
}

async function getVisa(req, res) {
    try {
        await ensureVisaTable();
        const id = req.params.id;
        const row = await modelGetVisaById(id);
        if (!row) return res.status(404).json({ success: false, message: "Visa not found" });
        res.json({ success: true, data: row });
    } catch (err) {
        console.error("getVisa error", err);
        res.status(500).json({ success: false, message: err.message || "Server error" });
    }
}

async function updateVisa(req, res) {
    try {
        await ensureVisaTable();
        const id = req.params.id;
        const { country, price, subject, overview } = req.body;
        const image = req.file?.filename || null;
        await modelUpdateVisa(id, { country, price, subject, image, overview });
        res.json({ success: true, message: "Visa updated" });
    } catch (err) {
        console.error("updateVisa error", err);
        res.status(500).json({ success: false, message: err.message || "Server error" });
    }
}

async function deleteVisa(req, res) {
    try {
        await ensureVisaTable();
        const id = req.params.id;
        const result = await modelDeleteVisa(id);
        if (result.affectedRows > 0) return res.json({ success: true, message: "Visa deleted" });
        res.status(404).json({ success: false, message: "Visa not found" });
    } catch (err) {
        console.error("deleteVisa error", err);
        res.status(500).json({ success: false, message: err.message || "Server error" });
    }
}

module.exports = {
    createVisa,
    listVisas,
    getVisa,
    updateVisa,
    deleteVisa,
};
