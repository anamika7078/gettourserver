// import dotenv from "dotenv";
// import fs from "fs";
// import path from "path";
// import db from "../db.js";

// dotenv.config();
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const db = require("../db.js");

dotenv.config();

const UPLOAD_SUBDIR = path.join(process.cwd(), "uploads", "activities");

const ActivityModel = {
    ensureUploadsDir() {
        if (!fs.existsSync(UPLOAD_SUBDIR)) {
            fs.mkdirSync(UPLOAD_SUBDIR, { recursive: true });
        }
    },

    ensureTable() {
        this.ensureUploadsDir();
        return new Promise((resolve, reject) => {
            // Make sure we are using the target DB
            db.changeUser({ database: process.env.DB_NAME }, (err) => {
                if (err) return reject(err);

                const createSql = `
                CREATE TABLE IF NOT EXISTS activities (
                  id INT AUTO_INCREMENT PRIMARY KEY,
                  title VARCHAR(255) NOT NULL,
                  location_name VARCHAR(255),
                  location_link VARCHAR(512),
                  price VARCHAR(50),
                                    category VARCHAR(100),
                                    category_id INT NULL,
                  details LONGTEXT,
                  image VARCHAR(255),
                  images LONGTEXT,
                  videos LONGTEXT,
                  video_links LONGTEXT,
                  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                  updated_at DATETIME NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
                `;

                db.query(createSql, (qErr) => {
                    if (qErr) return reject(qErr);

                    // Try ensure extra columns exist for older tables
                    const alterImages = `ALTER TABLE activities ADD COLUMN IF NOT EXISTS images LONGTEXT`;
                    const alterVideos = `ALTER TABLE activities ADD COLUMN IF NOT EXISTS videos LONGTEXT`;
                    const alterVideoLinks = `ALTER TABLE activities ADD COLUMN IF NOT EXISTS video_links LONGTEXT`;
                    const alterCatId = `ALTER TABLE activities ADD COLUMN IF NOT EXISTS category_id INT NULL`;

                    // Execute sequentially to be safe
                    db.query(alterImages, () => {
                        db.query(alterVideos, () => {
                            db.query(alterVideoLinks, () => {
                                db.query(alterCatId, () => resolve(true));
                            });
                        });
                    });
                });
            });
        });
    },

    insertActivity(data) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO activities 
                (title, location_name, location_link, price, category, category_id, details, image, images, videos, video_links, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const params = [
                data.title,
                data.location_name,
                data.location_link,
                data.price,
                data.category,
                data.category_id,
                data.details,
                data.image,
                data.images,
                data.videos,
                data.video_links,
                data.created_at,
            ];
            db.query(sql, params, (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    },

    getAll() {
        return new Promise((resolve, reject) => {
            db.query("SELECT * FROM activities ORDER BY created_at DESC", (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    },

    getById(id) {
        return new Promise((resolve, reject) => {
            db.query("SELECT * FROM activities WHERE id = ?", [id], (err, rows) => {
                if (err) return reject(err);
                resolve(rows && rows[0] ? rows[0] : null);
            });
        });
    },

    updateActivity(id, data) {
        return new Promise((resolve, reject) => {
            const fields = [];
            const params = [];
            if (data.title !== undefined) { fields.push("title = ?"); params.push(data.title); }
            if (data.location_name !== undefined) { fields.push("location_name = ?"); params.push(data.location_name); }
            if (data.location_link !== undefined) { fields.push("location_link = ?"); params.push(data.location_link); }
            if (data.price !== undefined) { fields.push("price = ?"); params.push(data.price); }
            if (data.category !== undefined) { fields.push("category = ?"); params.push(data.category); }
            if (data.details !== undefined) { fields.push("details = ?"); params.push(data.details); }
            if (data.image !== undefined) { fields.push("image = ?"); params.push(data.image); }
            if (data.images !== undefined) { fields.push("images = ?"); params.push(data.images); }
            if (data.videos !== undefined) { fields.push("videos = ?"); params.push(data.videos); }
            if (data.video_links !== undefined) { fields.push("video_links = ?"); params.push(data.video_links); }
            if (data.category_id !== undefined) { fields.push("category_id = ?"); params.push(data.category_id); }
            fields.push("updated_at = ?"); params.push(new Date());

            if (fields.length === 0) return resolve({ affectedRows: 0 });

            const sql = `UPDATE activities SET ${fields.join(", ")} WHERE id = ?`;
            params.push(id);
            db.query(sql, params, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    },

    deleteById(id) {
        return new Promise((resolve, reject) => {
            db.query("DELETE FROM activities WHERE id = ?", [id], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    },
};

// Auto-ensure table at startup and log a friendly message
ActivityModel.ensureTable()
    .then(() => console.log("🗂️ activities table ensured."))
    .catch((err) => console.error("❌ Failed ensuring activities table:", err));

module.exports = ActivityModel;
