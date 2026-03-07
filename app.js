


// import bodyParser from "body-parser";
// import cors from "cors";
// import dotenv from "dotenv";
// import express from "express";
// import path from "path";
// import "./models/activityBookingModel.js";
// import "./models/activityCategoryModel.js";
// import "./models/activityModel.js";
// import "./models/adminModel.js";
// import "./models/contactModel.js";
// import "./models/holidayPackageModel.js";
// import "./models/visaModel.js";
// import userRoutes from "./routes/UserRoutes.js";
// import activityBookingRoutes from "./routes/activityBookingRoutes.js";
// import activityCategoryRoutes from "./routes/activityCategoryRoutes.js";
// import activityRoutes from "./routes/activityRoutes.js";
// import adminRoutes from "./routes/adminRoutes.js";
// import contactRoutes from "./routes/contactRoutes.js";
// import cruiseEnquiryRoutes from "./routes/cruiseEnquiryRoutes.js";
// import cruisePackageRoutes from "./routes/cruisePackageRoutes.js";
// import heroImagesRoutes from "./routes/heroImagesRoutes.js";
// import holidayEnquiryRoutes from "./routes/holidayEnquiryRoutes.js";
// import holidayPackageRoutes from "./routes/holidayPackageRoutes.js";
// import hotelRoutes from "./routes/hotelRoutes.js";
// import roomBookingRoutes from "./routes/roomBookingRoutes.js";
// import visaApplicationRoutes from "./routes/visaApplicationRoutes.js";
// import visaRoutes from "./routes/visaRoutes.js";
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");
const path = require("path");

require("./models/activityBookingModel.js");
require("./models/activityCategoryModel.js");
require("./models/activityModel.js");
require("./models/adminModel.js");
require("./models/contactModel.js");
require("./models/holidayPackageModel.js");
require("./models/cityPackageModel.js");
require("./models/cityTourBookingModel.js");
require("./models/cityModel.js");
require("./models/cityTourCategoryModel.js");
require("./models/visaModel.js");

const userRoutes = require("./routes/UserRoutes.js");
const activityBookingRoutes = require("./routes/activityBookingRoutes.js");
const cityTourBookingRoutes = require("./routes/cityTourBookingRoutes.js");
const activityCategoryRoutes = require("./routes/activityCategoryRoutes.js");
const activityRoutes = require("./routes/activityRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");
const contactRoutes = require("./routes/contactRoutes.js");
const cruiseEnquiryRoutes = require("./routes/cruiseEnquiryRoutes.js");
const cruisePackageRoutes = require("./routes/cruisePackageRoutes.js");
const cruiseCategoryRoutes = require("./routes/cruiseCategoryRoutes.js");
const heroImagesRoutes = require("./routes/heroImagesRoutes.js");
const holidayEnquiryRoutes = require("./routes/holidayEnquiryRoutes.js");
const holidayPackageRoutes = require("./routes/holidayPackageRoutes.js");
const holidayCategoryRoutes = require("./routes/holidayCategoryRoutes.js");
const cityPackageRoutes = require("./routes/cityPackageRoutes.js");
const cityTourCategoryRoutes = require("./routes/cityTourCategoryRoutes.js");
const cityRoutes = require("./routes/cityRoutes.js");
const hotelRoutes = require("./routes/hotelRoutes.js");
const roomBookingRoutes = require("./routes/roomBookingRoutes.js");
const visaApplicationRoutes = require("./routes/visaApplicationRoutes.js");
const visaRoutes = require("./routes/visaRoutes.js");
const visaSubjectRoutes = require("./routes/visaSubjectRoutes.js");


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// body parser for non-multipart routes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve uploads folder
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/uploads/hotels", express.static(path.join(process.cwd(), "uploads", "hotels")));
app.use("/uploads/activities", express.static(path.join(process.cwd(), "uploads", "activities")));
app.use("/uploads/holidays", express.static(path.join(process.cwd(), "uploads", "holidays")));
app.use("/uploads/cruises", express.static(path.join(process.cwd(), "uploads", "cruises")));
app.use("/uploads/city-packages", express.static(path.join(process.cwd(), "uploads", "city-packages")));
app.use("/uploads/cities", express.static(path.join(process.cwd(), "uploads", "cities")));
app.use("/uploads/categories", express.static(path.join(process.cwd(), "uploads", "categories")));
app.use("/uploads/visas", express.static(path.join(process.cwd(), "uploads", "visas")));
app.use("/uploads/heroes", express.static(path.join(process.cwd(), "uploads", "heroes")));

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/activity-categories", activityCategoryRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/users", userRoutes);
app.use("/api/room-bookings", roomBookingRoutes);
app.use("/api/visa-applications", visaApplicationRoutes);
app.use("/api/activity-bookings", activityBookingRoutes);
app.use("/api/city-tour-bookings", cityTourBookingRoutes);
app.use("/api/holidays", holidayPackageRoutes);
app.use("/api/city-packages", cityPackageRoutes);
app.use("/api/city-tour-categories", cityTourCategoryRoutes);
app.use("/api/cities", cityRoutes);
app.use("/api/cruises", cruisePackageRoutes);
app.use("/api/cruise-categories", cruiseCategoryRoutes);
app.use("/api/holiday-enquiries", holidayEnquiryRoutes);
app.use("/api/cruise-enquiries", cruiseEnquiryRoutes);
app.use("/api/visas", visaRoutes);
app.use("/api/holiday-categories", holidayCategoryRoutes);
app.use("/api/visa-subjects", visaSubjectRoutes);
app.use("/api/hero", heroImagesRoutes);




app.listen(process.env.PORT, () => {
    console.log(`🚀 Server running on port ${process.env.PORT}`);
    console.log("✅ All models auto-initializing...");
});