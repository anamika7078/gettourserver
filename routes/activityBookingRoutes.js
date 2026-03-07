// import express from "express";
// import { confirmCheckout, createCheckoutSession, listBookings, deleteBooking } from "../controllers/activityBookingController.js";
const express = require("express");
const {
    confirmCheckout,
    createCheckoutSession,
    listBookings,
    deleteBooking
} = require("../controllers/activityBookingController.js");

const router = express.Router();

// Create Stripe checkout session
router.post("/checkout-session", createCheckoutSession);

// Confirm and save booking after payment success
router.post("/confirm", confirmCheckout);

// Admin: list all activity bookings
router.get("/", listBookings);

// Admin: delete an activity booking
router.delete("/:id", deleteBooking);

module.exports = router;
