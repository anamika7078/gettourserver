const express = require("express");
const router = express.Router();
const cityPackageController = require("../controllers/cityPackageController");

// Create new city package
router.post(
    "/",
    cityPackageController.uploadImages,
    cityPackageController.createCityPackage
);

// Get all city packages
router.get("/", cityPackageController.getAllCityPackages);

// Get city package by ID
router.get("/:id", cityPackageController.getCityPackageById);

// Update city package
router.put(
    "/:id",
    cityPackageController.uploadImages,
    cityPackageController.updateCityPackage
);

// Delete city package
router.delete("/:id", cityPackageController.deleteCityPackage);

module.exports = router;
