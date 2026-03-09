const express = require("express");
const router = express.Router();
const {
    getCities,
    getCityById,
    getActivities,
    getActivityById,
    getHotels,
    getHotelById,
    getHolidays,
    getHolidayById,
    getCruises,
    getCruiseById,
    getVisas,
    getVisaById,
    getCityPackages,
    getCityPackageById,
} = require("../controllers/jsonDataController");

// Cities routes
router.get("/cities", getCities);
router.get("/cities/:id", getCityById);

// Activities routes
router.get("/activities", getActivities);
router.get("/activities/:id", getActivityById);

// Hotels routes
router.get("/hotels", getHotels);
router.get("/hotels/:id", getHotelById);

// Holidays routes
router.get("/holidays", getHolidays);
router.get("/holidays/:id", getHolidayById);

// Cruises routes
router.get("/cruises", getCruises);
router.get("/cruises/:id", getCruiseById);

// Visas routes
router.get("/visas", getVisas);
router.get("/visas/:id", getVisaById);

// City Packages routes
router.get("/city-packages", getCityPackages);
router.get("/city-packages/:id", getCityPackageById);

module.exports = router;

