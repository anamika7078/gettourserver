
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import UserModel from "../models/UserModel.js";
// import { sendEmail } from "../utils/email.js";
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/UserModel.js");
const { sendEmail } = require("../utils/email.js");

/**
 * UserController
 * - register, login (existing)
 * - forgotPassword -> creates reset token, emails reset link (or logs it)
 * - resetPassword  -> validates reset token and updates password
 */

const register = async (req, res) => {
    try {
        const { firstName, lastName, email, password, phone, countryCode, acceptedTos } =
            req.body;

        const existingUser = await UserModel.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const user = await UserModel.create({
            firstName,
            lastName,
            email,
            password,
            phone,
            countryCode,
            acceptedTos,
        });

        res.status(201).json({ message: "User created successfully", user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await UserModel.findByEmail(email);
        if (!user) return res.status(400).json({ message: "Invalid email or password" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ message: "Invalid email or password" });

        const token = jwt.sign(
            { id: user.id, email: user.email, firstName: user.firstName },
            process.env.JWT_SECRET || "secret123",
            { expiresIn: "7d" }
        );

        // omit password before returning
        const safeUser = { ...user };
        delete safeUser.password;
        delete safeUser.resetToken;
        delete safeUser.resetExpires;

        res.json({ message: "Login successful", user: safeUser, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Forgot password
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });

        // create token if user exists
        const result = await UserModel.createPasswordResetToken(email);

        // Always return success response to avoid email enumeration
        const appUrl = process.env.APP_URL || "http://localhost:5173";
        if (result && result.user) {
            const { rawToken, user } = result;
            // Build reset link (front-end route)
            const resetUrl = `${appUrl}/reset?token=${rawToken}&id=${user.id}`;

            // Send email (or log fallback)
            const subject = "Reset your password";
            const text = `You requested a password reset. Click the link to reset your password:\n\n${resetUrl}\n\nIf you didn't request this, ignore this email.`;
            const html = `<p>You requested a password reset. Click the link to reset your password:</p>
                    <p><a href="${resetUrl}">${resetUrl}</a></p>
                    <p>If you didn't request this, ignore this email.</p>`;

            try {
                await sendEmail({ to: email, subject, text, html });
            } catch (err) {
                console.error("Failed to send reset email:", err);
            }
        }

        // Respond with generic message
        res.json({
            message: "If an account with that email exists, a reset link has been sent.",
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Reset password
const resetPassword = async (req, res) => {
    try {
        const { token, id, password } = req.body;
        if (!token || !id || !password) {
            return res.status(400).json({ message: "Token, id and new password are required" });
        }

        // Validate token
        const user = await UserModel.findByResetToken(token);
        if (!user || String(user.id) !== String(id)) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        // Update password
        await UserModel.updatePasswordById(user.id, password);

        res.json({ message: "Password has been reset successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

// List all users (omit sensitive fields)
const listUsers = async (_req, res) => {
    try {
        // Directly query via model would be nicer, but simple raw query via model methods isn't exposed; use model's db through a small inline query pattern.
        // We can reuse UserModel.findById/findByEmail patterns, but for a list, make a custom query here:
        const sql = "SELECT id, firstName, lastName, email, phone, countryCode, acceptedTos, createdAt FROM users ORDER BY id DESC";
        // Access db via model import
        const { default: _unused } = await import("../models/UserModel.js"); // ensures table exists
        // Lazy import db to avoid circular import
        const { default: db } = await import("../db.js");
        db.query(sql, [], (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Failed to load users" });
            }
            res.json(Array.isArray(results) ? results : []);
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get total number of users (for dashboard count)
const getUserCount = async (_req, res) => {
    try {
        const { default: db } = await import("../db.js");
        const sql = "SELECT COUNT(*) AS totalUsers FROM users";

        db.query(sql, (err, results) => {
            if (err) {
                console.error("❌ Error fetching user count:", err);
                return res.status(500).json({ message: "Database error" });
            }
            const count = results[0]?.totalUsers || 0;
            res.json({ totalUsers: count });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};


module.exports = {
    register,
    login,
    forgotPassword,
    resetPassword,
    listUsers,
    getUserCount,
};