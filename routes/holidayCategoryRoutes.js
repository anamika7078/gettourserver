const express = require("express");
const { listHolidayCategories, createHolidayCategory, deleteHolidayCategory } = require("../controllers/holidayCategoryController.js");
const router = express.Router();

router.get("/", listHolidayCategories);
router.post("/", createHolidayCategory);
router.delete("/:id", deleteHolidayCategory);

module.exports = router;
