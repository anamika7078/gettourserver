// import dotenv from "dotenv";
// import db from "../db.js";
// dotenv.config();
const dotenv = require("dotenv");
const db = require("../db.js");

dotenv.config();



// Skip table creation if JSON mode is enabled
if (process.env.USE_JSON_DATA !== "true" && process.env.USE_JSON_DATA !== "1") {
    db.changeUser({ database: process.env.DB_NAME }, (err) => {
        if (err) {
            if (process.env.USE_JSON_DATA !== "true" && process.env.USE_JSON_DATA !== "1") {
                console.error("Database change user error:", err.message);
            }
            return;
        }

        const createTableQuery = `
        CREATE TABLE IF NOT EXISTS admin (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

        db.query(createTableQuery, (err) => {
            if (err && process.env.USE_JSON_DATA !== "true" && process.env.USE_JSON_DATA !== "1") {
                console.error("Error creating admin table:", err.message);
            } else if (!err) {
                console.log("🗂️ Admin table ensured.");
            }
        });
    });
} else {
    console.log("📦 JSON mode: Skipping admin table creation");
}

module.exports = db;
