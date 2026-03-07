// backend/routes/hotelRoutes.js
// import express from "express";
// import multer from "multer";
// import path from "path";
// import { addHotel, getHotels, deleteHotel, getHotelById, updateHotelById } from "../controllers/hotelController.js";
const express = require("express");
const multer = require("multer");
const path = require("path");
const { addHotel, getHotels, deleteHotel, getHotelById, updateHotelById } = require("../controllers/hotelController.js");


const router = express.Router();

// multer setup (store files in ./uploads/hotels)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(process.cwd(), "uploads", "hotels"));
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, unique + "-" + file.originalname.replace(/\s+/g, "_"));
    },
});
const upload = multer({ storage });

// POST /api/hotels
router.post("/", upload.array("hotel_images"), addHotel);
router.get("/", getHotels);
router.get("/:id", getHotelById);
router.delete("/:id", deleteHotel);
router.put("/:id", upload.array("hotel_images"), updateHotelById); // <-- add this


module.exports = router;
