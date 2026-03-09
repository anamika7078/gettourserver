// // backend/routes/contactRoutes.js
// import express from "express";
// import { submitContactForm, getAllContactMessages, deleteMessage, getContactMessageStats, } from "../controllers/contactController.js";
// import { createContactTable } from "../models/contactModel.js";
const express = require("express");
const {
    submitContactForm,
    getAllContactMessages,
    deleteMessage,
    getContactMessageStats,
} = require("../controllers/contactController.js");
const { createContactTable } = require("../models/contactModel.js");


const router = express.Router();

// Auto-create the table when this route loads (skip if JSON mode)
if (process.env.USE_JSON_DATA !== "true" && process.env.USE_JSON_DATA !== "1") {
    createContactTable();
}

// POST /api/contact
router.post("/", submitContactForm);
router.get("/", getAllContactMessages);
router.get("/stats", getContactMessageStats); // ✅ Add this route
router.delete("/:id", deleteMessage); // 👈 Add this

module.exports = router;
