// import express from "express";
// import UserController from "../controllers/UserController.js";
const express = require("express");
const UserController = require("../controllers/UserController.js");


const router = express.Router();

// POST /api/users/register
router.post("/register", UserController.register);
router.post("/login", UserController.login);

router.post("/forgot-password", UserController.forgotPassword);
router.post("/reset-password", UserController.resetPassword);

// GET /api/users -> list all users (admin use)
router.get("/", UserController.listUsers);
router.get("/count", UserController.getUserCount);


module.exports = router;
