// import express from "express";
// import fs from "fs";
// import multer from "multer";
// import path from "path";
// import { createCruiseHandler, deleteCruiseHandler, getCruise, listCruises, updateCruiseHandler } from "../controllers/cruisePackageController.js";
// import { ensureCruiseTable } from "../models/cruisePackageModel.js";
const express = require("express");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const { createCruiseHandler, deleteCruiseHandler, getCruise, listCruises, updateCruiseHandler } = require("../controllers/cruisePackageController.js");
const { ensureCruiseTable } = require("../models/cruisePackageModel.js");


const router = express.Router();

// ensure uploads/cruises exists
const uploadDir = path.join(process.cwd(), "uploads", "cruises");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ensure table exists
ensureCruiseTable();

const storage = multer.diskStorage({
    destination: function (_req, _file, cb) {
        cb(null, uploadDir);
    },
    filename: function (_req, file, cb) {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, unique + ext);
    },
});

const upload = multer({ storage });

router.get("/", listCruises);
router.get("/:id", getCruise);
router.post("/", upload.single("image"), createCruiseHandler);
router.put("/:id", upload.single("image"), updateCruiseHandler);
router.delete("/:id", deleteCruiseHandler);

module.exports = router;
