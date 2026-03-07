// import dotenv from "dotenv";
// import db from "../db.js";
// dotenv.config();
const dotenv = require("dotenv");
const db = require("../db.js");

dotenv.config();



db.changeUser({ database: process.env.DB_NAME }, (err) => {
    if (err) throw err;

    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS admin (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

    db.query(createTableQuery, (err) => {
        if (err) throw err;
        console.log("🗂️ Admin table ensured.");
    });
});

module.exports = db;
