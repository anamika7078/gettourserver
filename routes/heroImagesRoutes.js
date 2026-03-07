// import express from "express";
// import fs from "fs";
// import multer from "multer";
// import path from "path";
// import { getHeroImages, updateHeroImages } from "../controllers/heroImagesController.js";
// import { ensureHeroImagesTable } from "../models/heroImagesModel.js";
const express = require("express");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const { getHeroImages, updateHeroImages } = require("../controllers/heroImagesController.js");
const { ensureHeroImagesTable } = require("../models/heroImagesModel.js");

const router = express.Router();

ensureHeroImagesTable();

const storage = multer.diskStorage({
    destination: function (req, _file, cb) {
        const page = req.params.page || "general";
        const dir = path.join(process.cwd(), "uploads", "heroes", page);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: function (_req, file, cb) {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, unique + ext);
    },
});

const upload = multer({ storage });

router.get("/:page", getHeroImages);
router.put(
    "/:page",
    upload.fields([
        { name: "image1", maxCount: 1 },
        { name: "image2", maxCount: 1 },
        { name: "image3", maxCount: 1 },
        { name: "image4", maxCount: 1 },
    ]),
    updateHeroImages
);

module.exports = router;
