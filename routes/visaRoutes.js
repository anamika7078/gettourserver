// import express from "express";
// import multer from "multer";
// import path from "path";
// import { createVisa, deleteVisa, getVisa, listVisas, updateVisa } from "../controllers/visaController.js";
const express = require("express");
const multer = require("multer");
const path = require("path");
const { createVisa, deleteVisa, getVisa, listVisas, updateVisa } = require("../controllers/visaController.js");


const router = express.Router();

// Multer storage for visas
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(process.cwd(), "uploads", "visas"));
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, unique + "-" + file.originalname.replace(/\s+/g, "_"));
    },
});

const upload = multer({ storage });

router.post("/", upload.single("image"), createVisa);
router.get("/", listVisas);
router.get("/:id", getVisa);
router.put("/:id", upload.single("image"), updateVisa);
router.delete("/:id", deleteVisa);

module.exports = router;
