

// import bcrypt from "bcrypt";
// import crypto from "crypto";
// import db from "../db.js";
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const db = require("../db.js");

/**
 * UserModel - extended with reset token fields/methods
 */
class UserModel {
    constructor() {
        this.init();
    }

    init() {
        // Skip table creation if JSON mode is enabled
        if (process.env.USE_JSON_DATA === "true" || process.env.USE_JSON_DATA === "1") {
            console.log("📦 JSON mode: Skipping users table creation");
            return;
        }
        
        // Add resetToken and resetExpires columns (if not already present)
        const sql = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        firstName VARCHAR(100) NOT NULL,
        lastName VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        countryCode VARCHAR(5),
        acceptedTos BOOLEAN DEFAULT 0,
        resetToken VARCHAR(255) DEFAULT NULL,
        resetExpires DATETIME DEFAULT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
        db.query(sql, (err) => {
            if (err) {
                if (process.env.USE_JSON_DATA !== "true" && process.env.USE_JSON_DATA !== "1") {
                    console.error("❌ Error creating 'users' table:", err.message);
                }
            } else {
                console.log("✅ 'users' table is ready in the database.");
            }
        });
    }

    create({ firstName, lastName, email, password, phone, countryCode, acceptedTos }) {
        return new Promise(async (resolve, reject) => {
            try {
                const hashedPassword = await bcrypt.hash(password, 10);
                const sql = `
          INSERT INTO users (firstName, lastName, email, password, phone, countryCode, acceptedTos)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
                db.query(
                    sql,
                    [firstName, lastName, email, hashedPassword, phone, countryCode, acceptedTos ? 1 : 0],
                    (err, result) => {
                        if (err) return reject(err);
                        resolve({ id: result.insertId, firstName, lastName, email, phone, countryCode, acceptedTos });
                    }
                );
            } catch (err) {
                reject(err);
            }
        });
    }

    findByEmail(email) {
        return new Promise((resolve, reject) => {
            db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
                if (err) return reject(err);
                resolve(results[0]);
            });
        });
    }

    findById(id) {
        return new Promise((resolve, reject) => {
            db.query("SELECT * FROM users WHERE id = ?", [id], (err, results) => {
                if (err) return reject(err);
                resolve(results[0]);
            });
        });
    }

    // Create and store a reset token (hashed). Returns rawToken so it can be emailed.
    // createPasswordResetToken(email) {
    //     return new Promise(async (resolve, reject) => {
    //         try {
    //             // find user by email
    //             this.findByEmail(email)
    //                 .then((user) => {
    //                     if (!user) return resolve(null);
    //                     // generate token
    //                     const rawToken = crypto.randomBytes(20).toString("hex");
    //                     const hashed = crypto.createHash("sha256").update(rawToken).digest("hex");
    //                     const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    //                     const expiresSql = expires.toISOString().slice(0, 19).replace("T", " ");
    //                     const sql = "UPDATE users SET resetToken = ?, resetExpires = ? WHERE email = ?";
    //                     db.query(sql, [hashed, expiresSql, email], (err) => {
    //                         if (err) return reject(err);
    //                         resolve({ rawToken, user });
    //                     });
    //                 })
    //                 .catch(reject);
    //         } catch (err) {
    //             reject(err);
    //         }
    //     });
    // }
    // Create and store a reset token (hashed). Returns rawToken so it can be emailed.
    createPasswordResetToken(email) {
        return new Promise(async (resolve, reject) => {
            try {
                // Find user by email
                this.findByEmail(email)
                    .then((user) => {
                        if (!user) return resolve(null);

                        // Generate token
                        const rawToken = crypto.randomBytes(20).toString("hex");
                        const hashed = crypto.createHash("sha256").update(rawToken).digest("hex");

                        // Extend expiry for testing (24 hours)
                        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
                        const expiresSql = expires.toISOString().slice(0, 19).replace("T", " ");

                        // Save hashed token in DB
                        const sql = "UPDATE users SET resetToken = ?, resetExpires = ? WHERE email = ?";
                        db.query(sql, [hashed, expiresSql, email], (err, result) => {
                            if (err) return reject(err);

                            console.log("✅ Password reset token saved in DB for:", email);
                            console.log("🔒 Hashed token saved:", hashed);
                            console.log("📅 Expires at:", expiresSql);

                            // Return the raw token (sent in email)
                            resolve({ rawToken, user });
                        });
                    })
                    .catch(reject);
            } catch (err) {
                reject(err);
            }
        });
    }


    // Find user by raw token (will hash token and search)
    // findByResetToken(rawToken) {
    //     return new Promise((resolve, reject) => {
    //         try {
    //             const hashed = crypto.createHash("sha256").update(rawToken).digest("hex");
    //             console.log("🔑 Raw:", rawToken);
    //             console.log("🔒 Hashed:", hashed);
    //             const sql = "SELECT * FROM users WHERE resetToken = ? AND resetExpires > NOW() LIMIT 1";
    //             db.query(sql, [hashed], (err, results) => {
    //                 if (err) return reject(err);
    //                 console.log("🧾 DB results:", results);
    //                 resolve(results[0]);
    //             });
    //         } catch (err) {
    //             reject(err);
    //         }
    //     });
    // }
    findByResetToken(rawToken) {
        return new Promise((resolve, reject) => {
            try {
                const hashed = crypto.createHash("sha256").update(rawToken).digest("hex");
                console.log("🔑 Raw:", rawToken);
                console.log("🔒 Hashed:", hashed);
                const sql = "SELECT * FROM users WHERE resetToken = ? AND resetExpires > NOW() LIMIT 1";
                db.query(sql, [hashed], (err, results) => {
                    if (err) return reject(err);
                    console.log("🧾 DB results:", results);
                    resolve(results[0]);
                });
            } catch (err) {
                reject(err);
            }
        });
    }


    // Update password by user id and clear reset token/expiry
    updatePasswordById(id, newPassword) {
        return new Promise(async (resolve, reject) => {
            try {
                const hashedPassword = await bcrypt.hash(newPassword, 10);
                const sql =
                    "UPDATE users SET password = ?, resetToken = NULL, resetExpires = NULL WHERE id = ?";
                db.query(sql, [hashedPassword, id], (err) => {
                    if (err) return reject(err);
                    // return updated user (without password)
                    this.findById(id)
                        .then((u) => {
                            if (u) {
                                delete u.password;
                                delete u.resetToken;
                                delete u.resetExpires;
                            }
                            resolve(u);
                        })
                        .catch(reject);
                });
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports =  new UserModel();