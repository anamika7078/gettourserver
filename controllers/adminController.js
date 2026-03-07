// // import bcrypt from "bcryptjs";
// // import jwt from "jsonwebtoken";
// // import db from "../models/adminModel.js";
// // import dotenv from "dotenv";
// // dotenv.config();
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const db = require("../models/adminModel.js");
// const dotenv = require("dotenv");

// dotenv.config();


// export const registerAdmin = (req, res) => {
//     const { email, password, confirmPassword } = req.body;

//     if (!email || !password || !confirmPassword)
//         return res.status(400).json({ message: "All fields are required" });

//     if (password !== confirmPassword)
//         return res.status(400).json({ message: "Passwords do not match" });

//     db.query("SELECT * FROM admin WHERE email = ?", [email], (err, result) => {
//         if (err) return res.status(500).json({ message: "Database error" });
//         if (result.length > 0) return res.status(400).json({ message: "Email already exists" });

//         const hashedPassword = bcrypt.hashSync(password, 10);
//         db.query("INSERT INTO admin (email, password) VALUES (?, ?)", [email, hashedPassword], (err) => {
//             if (err) return res.status(500).json({ message: "Error saving admin" });
//             res.status(201).json({ message: "Admin registered successfully" });
//         });
//     });
// };

// export const loginAdmin = (req, res) => {
//     const { email, password } = req.body;

//     db.query("SELECT * FROM admin WHERE email = ?", [email], (err, result) => {
//         if (err) return res.status(500).json({ message: "Database error" });
//         if (result.length === 0) return res.status(404).json({ message: "Admin not found" });

//         const admin = result[0];
//         const isMatch = bcrypt.compareSync(password, admin.password);
//         if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

//         const token = jwt.sign({ id: admin.id, email: admin.email }, process.env.JWT_SECRET, { expiresIn: "1d" });
//         res.json({ token });
//     });
// };

// export const verifyToken = (req, res, next) => {
//     const token = req.headers.authorization?.split(" ")[1];
//     if (!token) return res.status(403).json({ message: "No token provided" });

//     jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//         if (err) return res.status(401).json({ message: "Invalid token" });
//         req.admin = decoded;
//         next();
//     });
// };

// export const getDashboard = (req, res) => {
//     res.json({ message: `Welcome Admin: ${req.admin.email}` });
// };




// // ----------------- Forgot Password -----------------
// export const forgotPassword = (req, res) => {
//     const { email } = req.body;
//     if (!email) return res.status(400).json({ message: "Email is required" });

//     db.query("SELECT * FROM admin WHERE email = ?", [email], (err, result) => {
//         if (err) return res.status(500).json({ message: "Database error" });
//         if (result.length === 0) return res.status(404).json({ message: "Admin not found" });

//         const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "15m" });

//         // Here, send the token via email in real system (SMTP/SendGrid/Nodemailer)
//         // For demo, we just return the token
//         res.json({ message: "Password reset token generated", token });
//     });
// };

// // ----------------- Reset Password -----------------
// export const resetPassword = (req, res) => {
//     const { token, password, confirmPassword } = req.body;
//     if (!token || !password || !confirmPassword)
//         return res.status(400).json({ message: "All fields are required" });

//     if (password !== confirmPassword)
//         return res.status(400).json({ message: "Passwords do not match" });

//     jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//         if (err) return res.status(401).json({ message: "Invalid or expired token" });

//         const hashedPassword = bcrypt.hashSync(password, 10);
//         db.query("UPDATE admin SET password = ? WHERE email = ?", [hashedPassword, decoded.email], (err) => {
//             if (err) return res.status(500).json({ message: "Database error updating password" });
//             res.json({ message: "Password reset successfully" });
//         });
//     });
// };

// -------------------- adminController.js --------------------

// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const db = require("../models/adminModel.js");
// const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../models/adminModel.js");
const dotenv = require("dotenv");

dotenv.config();

const registerAdmin = (req, res) => {
    const { email, password, confirmPassword } = req.body;

    if (!email || !password || !confirmPassword)
        return res.status(400).json({ message: "All fields are required" });

    if (password !== confirmPassword)
        return res.status(400).json({ message: "Passwords do not match" });

    db.query("SELECT * FROM admin WHERE email = ?", [email], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (result.length > 0) return res.status(400).json({ message: "Email already exists" });

        const hashedPassword = bcrypt.hashSync(password, 10);
        db.query("INSERT INTO admin (email, password) VALUES (?, ?)", [email, hashedPassword], (err) => {
            if (err) return res.status(500).json({ message: "Error saving admin" });
            res.status(201).json({ message: "Admin registered successfully" });
        });
    });
};

const loginAdmin = (req, res) => {
    const { email, password } = req.body;

    db.query("SELECT * FROM admin WHERE email = ?", [email], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (result.length === 0) return res.status(404).json({ message: "Admin not found" });

        const admin = result[0];
        const isMatch = bcrypt.compareSync(password, admin.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: admin.id, email: admin.email }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.json({ token });
    });
};

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(403).json({ message: "No token provided" });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: "Invalid token" });
        req.admin = decoded;
        next();
    });
};

const getDashboard = (req, res) => {
    res.json({ message: `Welcome Admin: ${req.admin.email}` });
};

// ----------------- Forgot Password -----------------
const forgotPassword = (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    db.query("SELECT * FROM admin WHERE email = ?", [email], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (result.length === 0) return res.status(404).json({ message: "Admin not found" });

        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "15m" });

        // Here, send the token via email in real system (SMTP/SendGrid/Nodemailer)
        // For demo, we just return the token
        res.json({ message: "Password reset token generated", token });
    });
};

// ----------------- Reset Password -----------------
const resetPassword = (req, res) => {
    const { token, password, confirmPassword } = req.body;
    if (!token || !password || !confirmPassword)
        return res.status(400).json({ message: "All fields are required" });

    if (password !== confirmPassword)
        return res.status(400).json({ message: "Passwords do not match" });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: "Invalid or expired token" });

        const hashedPassword = bcrypt.hashSync(password, 10);
        db.query("UPDATE admin SET password = ? WHERE email = ?", [hashedPassword, decoded.email], (err) => {
            if (err) return res.status(500).json({ message: "Database error updating password" });
            res.json({ message: "Password reset successfully" });
        });
    });
};

// -------------------- Export All --------------------
module.exports = {
    registerAdmin,
    loginAdmin,
    verifyToken,
    getDashboard,
    forgotPassword,
    resetPassword,
};
