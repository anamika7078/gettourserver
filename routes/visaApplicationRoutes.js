// import express from "express";
// import { confirmVisaCheckout, createVisaCheckoutSession, deleteVisaApplication } from "../controllers/visaApplicationController.js";
// import db from "../db.js";
// import VisaApplicationModel from "../models/visaApplicationModel.js";
// const router = express.Router();
const express = require("express");
const { confirmVisaCheckout, createVisaCheckoutSession, deleteVisaApplication } = require("../controllers/visaApplicationController.js");
const db = require("../db.js");
const VisaApplicationModel = require("../models/visaApplicationModel.js");
const router = express.Router();

// Stripe payment endpoints for visa applications
router.post("/checkout-session", createVisaCheckoutSession);
router.post("/confirm", confirmVisaCheckout);


// Get all visa applications
router.get("/", async (req, res) => {
    try {
        const applications = await VisaApplicationModel.getAll();
        res.json({ success: true, data: applications });
    } catch (error) {
        console.error("Get visa applications error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get visa application by ID
router.get("/:id", async (req, res) => {
    try {
        const application = await VisaApplicationModel.getById(req.params.id);
        if (!application) {
            return res.status(404).json({ success: false, error: "Application not found" });
        }
        res.json({ success: true, data: application });
    } catch (error) {
        console.error("Get visa application error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update application status
router.put("/:id/status", async (req, res) => {
    try {
        const { status } = req.body;
        await VisaApplicationModel.updateStatus(req.params.id, status);
        res.json({ success: true, message: "Status updated successfully" });
    } catch (error) {
        console.error("Update status error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add this to your visaApplications.js router
// Debug route to check passenger data

// In your visa applications router
router.get("/debug/fix-passengers/:id", async (req, res) => {
    try {
        const application = await VisaApplicationModel.getById(req.params.id);
        if (!application) {
            return res.status(404).json({ success: false, error: "Application not found" });
        }

        // Fix passenger data if needed
        let passengers = application.passengers || application.extra_passengers;

        if (typeof passengers === 'string') {
            try {
                passengers = JSON.parse(passengers);
            } catch (e) {
                console.error("Error parsing passengers:", e);
                passengers = [];
            }
        }

        // Update the application with properly formatted passenger data
        if (Array.isArray(passengers)) {
            await new Promise((resolve, reject) => {
                const sql = "UPDATE visa_applications SET passengers = ? WHERE id = ?";
                db.query(sql, [JSON.stringify(passengers), req.params.id], (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            });
        }

        res.json({
            success: true,
            message: "Passenger data fixed",
            before: {
                passengers: application.passengers,
                extra_passengers: application.extra_passengers
            },
            after: {
                passengers: passengers
            }
        });
    } catch (error) {
        console.error("Fix passengers error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete a visa application
router.delete("/:id", deleteVisaApplication);



module.exports = router;
