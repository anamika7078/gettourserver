// import express from "express";
// import fs from "fs";
// import multer from "multer";
// import path from "path";
// import { createHoliday, deleteHoliday, getHolidayById, listHolidays, updateHoliday } from "../controllers/holidayPackageController.js";
const express = require("express");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const { createHoliday, deleteHoliday, getHolidayById, listHolidays, updateHoliday } = require("../controllers/holidayPackageController.js");


const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), "uploads", "holidays");
try {
    fs.mkdirSync(uploadDir, { recursive: true });
} catch { }

// Multer storage for multiple images
const storage = multer.diskStorage({
    destination: function (_req, _file, cb) {
        cb(null, uploadDir);
    },
    filename: function (_req, file, cb) {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname || "");
        cb(null, unique + ext);
    },
});

const upload = multer({ storage });

// Routes
router.get("/", listHolidays);
router.get("/:id", getHolidayById);
router.post("/", upload.array("images", 20), createHoliday);
router.put("/:id", upload.array("newImages", 20), updateHoliday);
router.delete("/:id", deleteHoliday);

module.exports = router;
