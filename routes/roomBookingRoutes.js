// import express from "express";
// import { confirmRoomCheckout, createRoomBooking, createRoomCheckoutSession, deleteRoomBooking, getBookingStats, getRoomBookingById, listRoomBookings } from "../controllers/roomBookingController.js";
// const router = express.Router();
const express = require("express");
const {
    confirmRoomCheckout,
    createRoomBooking,
    createRoomCheckoutSession,
    deleteRoomBooking,
    getBookingStats,
    getRoomBookingById,
    listRoomBookings,
} = require("../controllers/roomBookingController.js");

const router = express.Router();


router.get("/stats", getBookingStats);
// Stripe payment endpoints
router.post("/checkout-session", createRoomCheckoutSession);
router.post("/confirm", confirmRoomCheckout);
// POST /api/room-bookings
router.post("/", createRoomBooking);

// Optional admin helpers
router.get("/", listRoomBookings);
router.get("/:id", getRoomBookingById);
router.delete("/:id", deleteRoomBooking);

module.exports = router;
