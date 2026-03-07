const express = require("express");
const {
    confirmCheckout,
    createCheckoutSession,
    listBookings,
    deleteBooking
} = require("../controllers/cityTourBookingController.js");

const router = express.Router();

// Create Stripe checkout session
router.post("/checkout-session", createCheckoutSession);

// Confirm and save booking after payment success
router.post("/confirm", confirmCheckout);

// Admin: list all city tour bookings
router.get("/", listBookings);

// Admin: delete a city tour booking
router.delete("/:id", deleteBooking);

module.exports = router;
