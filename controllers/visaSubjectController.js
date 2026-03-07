const VisaSubjectModel = require("../models/visaSubjectModel.js");

async function listVisaSubjects(_req, res) {
    try {
        await VisaSubjectModel.ensureTable();
        const rows = await VisaSubjectModel.list();
        res.json(rows || []);
    } catch (e) {
        console.error("listVisaSubjects error", e);
        res.status(500).json({ error: e.message || "Server error" });
    }
}

async function createVisaSubject(req, res) {
    try {
        await VisaSubjectModel.ensureTable();
        const { subject } = req.body;
        if (!subject || !subject.trim()) return res.status(400).json({ error: "Subject required" });
        const result = await VisaSubjectModel.create({ subject: subject.trim() });
        res.json({ success: true, insertId: result.insertId });
    } catch (e) {
        console.error("createVisaSubject error", e);
        if (e?.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "Subject already exists" });
        res.status(500).json({ error: e.message || "Server error" });
    }
}

async function deleteVisaSubject(req, res) {
    try {
        const id = req.params.id;
        const result = await VisaSubjectModel.delete(id);
        if (result.affectedRows > 0) return res.json({ success: true });
        res.status(404).json({ error: "Not found" });
    } catch (e) {
        console.error("deleteVisaSubject error", e);
        res.status(500).json({ error: e.message || "Server error" });
    }
}

module.exports = { listVisaSubjects, createVisaSubject, deleteVisaSubject };
