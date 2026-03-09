// import express from "express";
// import { listCruiseEnquiries, removeCruiseEnquiry, submitCruiseEnquiry } from "../controllers/cruiseEnquiryController.js";
// import { ensureCruiseEnquiryTable } from "../models/cruiseEnquiryModel.js";
// backend/routes/cruiseEnquiryRoutes.js
const express = require("express");
const {
    listCruiseEnquiries,
    removeCruiseEnquiry,
    submitCruiseEnquiry,
} = require("../controllers/cruiseEnquiryController.js");
const { ensureCruiseEnquiryTable } = require("../models/cruiseEnquiryModel.js");


const router = express.Router();

// ensure table exists when routes load (skip if JSON mode)
if (process.env.USE_JSON_DATA !== "true" && process.env.USE_JSON_DATA !== "1") {
    ensureCruiseEnquiryTable();
}

router.post("/", submitCruiseEnquiry);
router.get("/", listCruiseEnquiries);
router.delete("/:id", removeCruiseEnquiry);

module.exports = router;
