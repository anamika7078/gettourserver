const CruiseCategoryModel = require("../models/cruiseCategoryModel.js");

async function listCruiseCategories(_req, res) {
    try {
        await CruiseCategoryModel.ensureTable();
        const rows = await CruiseCategoryModel.list();
        res.json(rows || []);
    } catch (e) {
        console.error("listCruiseCategories error", e);
        res.status(500).json({ error: e.message || "Server error" });
    }
}

async function createCruiseCategory(req, res) {
    try {
        await CruiseCategoryModel.ensureTable();
        const { name } = req.body;
        if (!name || !name.trim()) return res.status(400).json({ error: "Name required" });
        const result = await CruiseCategoryModel.create({ name: name.trim() });
        res.json({ success: true, insertId: result.insertId });
    } catch (e) {
        console.error("createCruiseCategory error", e);
        if (e?.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "Category already exists" });
        res.status(500).json({ error: e.message || "Server error" });
    }
}

async function deleteCruiseCategory(req, res) {
    try {
        const id = req.params.id;
        const result = await CruiseCategoryModel.delete(id);
        if (result.affectedRows > 0) return res.json({ success: true });
        res.status(404).json({ error: "Not found" });
    } catch (e) {
        console.error("deleteCruiseCategory error", e);
        res.status(500).json({ error: e.message || "Server error" });
    }
}

module.exports = { listCruiseCategories, createCruiseCategory, deleteCruiseCategory };
