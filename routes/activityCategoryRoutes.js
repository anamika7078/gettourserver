// import express from "express";
// import { createCategory, deleteCategory, getCategoryById, listCategories, updateCategory } from "../controllers/activityCategoryController.js";
const express = require("express");
const {
    createCategory,
    deleteCategory,
    getCategoryById,
    listCategories,
    updateCategory
} = require("../controllers/activityCategoryController.js");

const router = express.Router();

router.get("/", listCategories);
router.get("/:id", getCategoryById);
router.post("/", createCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

module.exports = router;
