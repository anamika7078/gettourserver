// import express from "express";
// import {
//     forgotPassword,
//     getDashboard,
//     loginAdmin,
//     registerAdmin, // ✅ Add this
//     resetPassword,
//     verifyToken
// } from "../controllers/adminController.js";
const express = require("express");
const {
    forgotPassword,
    getDashboard,
    loginAdmin,
    registerAdmin, // ✅ Add this
    resetPassword,
    verifyToken
} = require("../controllers/adminController.js");


const router = express.Router();

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.get("/dashboard", verifyToken, getDashboard);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);


module.exports = router;
