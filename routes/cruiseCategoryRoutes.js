const express = require("express");
const { listCruiseCategories, createCruiseCategory, deleteCruiseCategory } = require("../controllers/cruiseCategoryController.js");
const router = express.Router();

router.get("/", listCruiseCategories);
router.post("/", createCruiseCategory);
router.delete("/:id", deleteCruiseCategory);

module.exports = router;
