
const fs = require("fs");
const path = require("path");
const HolidayPackageModel = require("../models/holidayPackageModel.js");

async function listHolidays(_req, res) {
    try {
        // Try JSON data first if enabled
        const { getJsonData } = require("../utils/jsonDataLoader");
        const jsonData = getJsonData("holidays");
        if (jsonData && jsonData.length > 0) {
            return res.json({ success: true, data: jsonData });
        }
        
        // Fallback to database
        await HolidayPackageModel.ensureTable();
        const rows = await HolidayPackageModel.getAll();
        return res.json({ success: true, data: rows });
    } catch (err) {
        console.error("listHolidays error:", err);
        // Try JSON as last resort
        const { getJsonData } = require("../utils/jsonDataLoader");
        const jsonData = getJsonData("holidays");
        if (jsonData && jsonData.length > 0) {
            return res.json({ success: true, data: jsonData });
        }
        return res.status(500).json({ success: false, error: err.message || "Server error" });
    }
}

async function getHolidayById(req, res) {
    try {
        await HolidayPackageModel.ensureTable();
        const row = await HolidayPackageModel.getById(req.params.id);
        if (!row) return res.status(404).json({ success: false, error: "Not found" });
        return res.json({ success: true, data: row });
    } catch (err) {
        console.error("getHolidayById error:", err);
        return res.status(500).json({ success: false, error: err.message || "Server error" });
    }
}

async function createHoliday(req, res) {
    try {
        await HolidayPackageModel.ensureTable();
        const body = req.body || {};
        const files = Array.isArray(req.files) ? req.files : [];
        const images = files.map((f) => f.filename);

        const record = {
            title: body.title || "",
            destination: body.destination || null,
            duration: body.duration || null,
            price: body.price || 0,
            category: body.category || null,
            details: body.details || null,
            images,
        };

        if (!record.title) return res.status(400).json({ success: false, error: "Title is required" });

        const result = await HolidayPackageModel.create(record);
        return res.json({ success: true, id: result.insertId });
    } catch (err) {
        console.error("createHoliday error:", err);
        return res.status(500).json({ success: false, error: err.message || "Server error" });
    }
}

async function updateHoliday(req, res) {
    try {
        await HolidayPackageModel.ensureTable();
        const id = req.params.id;
        const existing = await HolidayPackageModel.getById(id);
        if (!existing) return res.status(404).json({ success: false, error: "Not found" });

        // Parse existing images array
        let existingImages = [];
        try {
            existingImages = typeof existing.images === "string" ? JSON.parse(existing.images) : existing.images || [];
            if (!Array.isArray(existingImages)) existingImages = [];
        } catch {
            existingImages = [];
        }

        // keepImages is a JSON-encoded string of filenames to retain
        let keepImages = [];
        try {
            keepImages = req.body.keepImages ? JSON.parse(req.body.keepImages) : [];
            if (!Array.isArray(keepImages)) keepImages = [];
        } catch {
            keepImages = [];
        }

        const uploaded = Array.isArray(req.files) ? req.files.map((f) => f.filename) : [];
        const finalImages = [...new Set([...(keepImages || []), ...(uploaded || [])])];

        // Delete any removed images from disk
        const uploadDir = path.join(process.cwd(), "uploads", "holidays");
        const toDelete = (existingImages || []).filter((f) => !finalImages.includes(f));
        for (const filename of toDelete) {
            const fullPath = path.join(uploadDir, filename);
            try {
                if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
            } catch (e) {
                console.warn("Failed to delete image:", filename, e?.message);
            }
        }

        const updatedRecord = {
            title: req.body.title || existing.title,
            destination: req.body.destination ?? existing.destination,
            duration: req.body.duration ?? existing.duration,
            price: req.body.price ?? existing.price,
            category: req.body.category ?? existing.category,
            details: req.body.details ?? existing.details,
            images: finalImages,
        };

        await HolidayPackageModel.update(id, updatedRecord);
        const after = await HolidayPackageModel.getById(id);
        return res.json({ success: true, data: after });
    } catch (err) {
        console.error("updateHoliday error:", err);
        return res.status(500).json({ success: false, error: err.message || "Server error" });
    }
}

async function deleteHoliday(req, res) {
    try {
        await HolidayPackageModel.ensureTable();
        const id = req.params.id;
        const existing = await HolidayPackageModel.getById(id);
        if (!existing) return res.status(404).json({ success: false, error: "Not found" });

        let images = [];
        try {
            images = typeof existing.images === "string" ? JSON.parse(existing.images) : existing.images || [];
            if (!Array.isArray(images)) images = [];
        } catch {
            images = [];
        }

        const uploadDir = path.join(process.cwd(), "uploads", "holidays");
        for (const filename of images) {
            const fullPath = path.join(uploadDir, filename);
            try {
                if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
            } catch (e) {
                console.warn("Failed to delete image:", filename, e?.message);
            }
        }

        await HolidayPackageModel.delete(id);
        return res.json({ success: true });
    } catch (err) {
        console.error("deleteHoliday error:", err);
        return res.status(500).json({ success: false, error: err.message || "Server error" });
    }
}

module.exports = {
    listHolidays,
    getHolidayById,
    createHoliday,
    updateHoliday,
    deleteHoliday,
};
