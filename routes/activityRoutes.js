// import express from "express";
// import multer from "multer";
// import path from "path";
// import { addActivity, deleteActivity, getActivities, getActivityById, updateActivity } from "../controllers/activityController.js";
const express = require("express");
const multer = require("multer");
const path = require("path");
const {
    addActivity,
    deleteActivity,
    getActivities,
    getActivityById,
    updateActivity
} = require("../controllers/activityController.js");



const router = express.Router();

// multer setup for activities
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(process.cwd(), "uploads", "activities"));
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, unique + "-" + file.originalname.replace(/\s+/g, "_"));
    },
});
const upload = multer({ storage });

// Accept cover (single), images (multiple), videos (multiple)
router.post(
    "/",
    upload.fields([
        { name: "cover", maxCount: 1 },
        { name: "image", maxCount: 1 }, // backward-compatible
        { name: "images", maxCount: 20 },
        { name: "videos", maxCount: 10 },
    ]),
    addActivity
);
router.get("/", getActivities);
router.get("/:id", getActivityById);
router.put(
    "/:id",
    upload.fields([
        { name: "cover", maxCount: 1 },
        { name: "image", maxCount: 1 },
        { name: "images", maxCount: 20 },
        { name: "videos", maxCount: 10 },
    ]),
    updateActivity
);
router.delete("/:id", deleteActivity);

module.exports = router;
