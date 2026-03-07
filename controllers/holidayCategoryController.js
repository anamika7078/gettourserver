const HolidayCategoryModel = require("../models/holidayCategoryModel.js");

async function listHolidayCategories(_req, res) {
    try {
        await HolidayCategoryModel.ensureTable();
        const rows = await HolidayCategoryModel.list();
        res.json(rows || []);
    } catch (e) {
        console.error("listHolidayCategories error", e);
        res.status(500).json({ error: e.message || "Server error" });
    }
}

async function createHolidayCategory(req, res) {
    try {
        await HolidayCategoryModel.ensureTable();
        const { name } = req.body;
        if (!name || !name.trim()) return res.status(400).json({ error: "Name required" });
        const result = await HolidayCategoryModel.create({ name: name.trim() });
        res.json({ success: true, insertId: result.insertId });
    } catch (e) {
        console.error("createHolidayCategory error", e);
        if (e?.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "Category already exists" });
        res.status(500).json({ error: e.message || "Server error" });
    }
}

async function deleteHolidayCategory(req, res) {
    try {
        const id = req.params.id;
        const result = await HolidayCategoryModel.delete(id);
        if (result.affectedRows > 0) return res.json({ success: true });
        res.status(404).json({ error: "Not found" });
    } catch (e) {
        console.error("deleteHolidayCategory error", e);
        res.status(500).json({ error: e.message || "Server error" });
    }
}

module.exports = { listHolidayCategories, createHolidayCategory, deleteHolidayCategory };
