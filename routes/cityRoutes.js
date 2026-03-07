const express = require("express");
const router = express.Router();
const cityController = require("../controllers/cityController");

// Get all cities
router.get("/", cityController.getAllCities);

// Get city by ID
router.get("/:id", cityController.getCityById);

// Create new city
router.post("/", cityController.uploadImage, cityController.createCity);

// Update city
router.put("/:id", cityController.uploadImage, cityController.updateCity);

// Delete city
router.delete("/:id", cityController.deleteCity);

module.exports = router;
