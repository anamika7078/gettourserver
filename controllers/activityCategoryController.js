// // import ActivityCategoryModel from "../models/activityCategoryModel.js";
// const ActivityCategoryModel = require("../models/activityCategoryModel.js");

// function slugify(text = "") {
//     return text
//         .toString()
//         .toLowerCase()
//         .trim()
//         .replace(/[^\w\s-]/g, "")
//         .replace(/\s+/g, "-");
// }

// export async function listCategories(_req, res) {
//     try {
//         await ActivityCategoryModel.ensureTable();
//         const rows = await ActivityCategoryModel.list();
//         return res.json(rows || []);
//     } catch (e) {
//         console.error("listCategories error:", e);
//         return res.status(500).json({ error: e.message || "Server error" });
//     }
// }

// export async function createCategory(req, res) {
//     try {
//         await ActivityCategoryModel.ensureTable();
//         const { name, details } = req.body;
//         if (!name || !name.trim()) return res.status(400).json({ error: "Name required" });
//         const result = await ActivityCategoryModel.create({ name: name.trim(), slug: slugify(name), details: details || null });
//         return res.json({ success: true, insertId: result.insertId });
//     } catch (e) {
//         console.error("createCategory error:", e);
//         return res.status(500).json({ error: e.message || "Server error" });
//     }
// }

// export async function updateCategory(req, res) {
//     try {
//         await ActivityCategoryModel.ensureTable();
//         const id = req.params.id;
//         const { name, details } = req.body;
//         const payload = {};
//         if (name !== undefined) { payload.name = name; payload.slug = slugify(name); }
//         if (details !== undefined) payload.details = details;
//         const result = await ActivityCategoryModel.update(id, payload);
//         return res.json({ success: true, affectedRows: result.affectedRows });
//     } catch (e) {
//         console.error("updateCategory error:", e);
//         return res.status(500).json({ error: e.message || "Server error" });
//     }
// }

// export async function deleteCategory(req, res) {
//     try {
//         const id = req.params.id;
//         const result = await ActivityCategoryModel.delete(id);
//         if (result.affectedRows > 0) return res.json({ success: true });
//         return res.status(404).json({ error: "Category not found" });
//     } catch (e) {
//         console.error("deleteCategory error:", e);
//         return res.status(500).json({ error: e.message || "Server error" });
//     }
// }

// export async function getCategoryById(req, res) {
//     try {
//         const id = req.params.id;
//         const row = await ActivityCategoryModel.getById(id);
//         if (!row) return res.status(404).json({ error: "Category not found" });
//         return res.json(row);
//     } catch (e) {
//         console.error("getCategoryById error:", e);
//         return res.status(500).json({ error: e.message || "Server error" });
//     }
// }


// ✅ Converted fully to CommonJS (no ES module syntax)

// const ActivityCategoryModel = require("../models/activityCategoryModel.js");
const ActivityCategoryModel = require("../models/activityCategoryModel.js");

function slugify(text = "") {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
}

async function listCategories(_req, res) {
    try {
        await ActivityCategoryModel.ensureTable();
        const rows = await ActivityCategoryModel.list();
        return res.json(rows || []);
    } catch (e) {
        console.error("listCategories error:", e);
        return res.status(500).json({ error: e.message || "Server error" });
    }
}

async function createCategory(req, res) {
    try {
        await ActivityCategoryModel.ensureTable();
        const { name, details } = req.body;
        if (!name || !name.trim()) return res.status(400).json({ error: "Name required" });
        const result = await ActivityCategoryModel.create({
            name: name.trim(),
            slug: slugify(name),
            details: details || null,
        });
        return res.json({ success: true, insertId: result.insertId });
    } catch (e) {
        console.error("createCategory error:", e);
        return res.status(500).json({ error: e.message || "Server error" });
    }
}

async function updateCategory(req, res) {
    try {
        await ActivityCategoryModel.ensureTable();
        const id = req.params.id;
        const { name, details } = req.body;
        const payload = {};
        if (name !== undefined) {
            payload.name = name;
            payload.slug = slugify(name);
        }
        if (details !== undefined) payload.details = details;
        const result = await ActivityCategoryModel.update(id, payload);
        return res.json({ success: true, affectedRows: result.affectedRows });
    } catch (e) {
        console.error("updateCategory error:", e);
        return res.status(500).json({ error: e.message || "Server error" });
    }
}

async function deleteCategory(req, res) {
    try {
        const id = req.params.id;
        const result = await ActivityCategoryModel.delete(id);
        if (result.affectedRows > 0) return res.json({ success: true });
        return res.status(404).json({ error: "Category not found" });
    } catch (e) {
        console.error("deleteCategory error:", e);
        return res.status(500).json({ error: e.message || "Server error" });
    }
}

async function getCategoryById(req, res) {
    try {
        const id = req.params.id;
        const row = await ActivityCategoryModel.getById(id);
        if (!row) return res.status(404).json({ error: "Category not found" });
        return res.json(row);
    } catch (e) {
        console.error("getCategoryById error:", e);
        return res.status(500).json({ error: e.message || "Server error" });
    }
}

// ✅ CommonJS exports
module.exports = {
    listCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
};
