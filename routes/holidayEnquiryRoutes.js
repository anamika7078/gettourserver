// import express from "express";
// import { listHolidayEnquiries, removeHolidayEnquiry, submitHolidayEnquiry } from "../controllers/holidayEnquiryController.js";
// import { ensureHolidayEnquiryTable } from "../models/holidayEnquiryModel.js";
const express = require("express");
const { listHolidayEnquiries, removeHolidayEnquiry, submitHolidayEnquiry } = require("../controllers/holidayEnquiryController.js");
const { ensureHolidayEnquiryTable } = require("../models/holidayEnquiryModel.js");


const router = express.Router();

// Ensure table exists when routes load
ensureHolidayEnquiryTable();

router.post("/", submitHolidayEnquiry);
router.get("/", listHolidayEnquiries);
router.delete("/:id", removeHolidayEnquiry);

module.exports = router;
