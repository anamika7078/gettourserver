// import dotenv from "dotenv";
// const db = require("../db.js");
const db = require("../db.js");
const dotenv = require("dotenv");

dotenv.config();

const ActivityCategoryModel = {
    ensureTable() {
        return new Promise((resolve, reject) => {
            db.changeUser({ database: process.env.DB_NAME }, (err) => {
                if (err) return reject(err);
                const sql = `
          CREATE TABLE IF NOT EXISTS activity_categories (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(150) NOT NULL,
            slug VARCHAR(160) UNIQUE,
            details LONGTEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NULL
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `;
                db.query(sql, (qErr) => {
                    if (qErr) return reject(qErr);
                    resolve(true);
                });
            });
        });
    },

    list() {
        return new Promise((resolve, reject) => {
            db.query("SELECT * FROM activity_categories ORDER BY name ASC", (err, rows) => {
                if (err) return reject(err);
                resolve(rows || []);
            });
        });
    },

    create({ name, slug, details }) {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO activity_categories (name, slug, details) VALUES (?, ?, ?)`;
            db.query(sql, [name, slug, details || null], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    },

    update(id, { name, slug, details }) {
        return new Promise((resolve, reject) => {
            const fields = [];
            const params = [];
            if (name !== undefined) { fields.push("name = ?"); params.push(name); }
            if (slug !== undefined) { fields.push("slug = ?"); params.push(slug); }
            if (details !== undefined) { fields.push("details = ?"); params.push(details); }
            fields.push("updated_at = ?"); params.push(new Date());
            const sql = `UPDATE activity_categories SET ${fields.join(", ")} WHERE id = ?`;
            params.push(id);
            db.query(sql, params, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    },

    getById(id) {
        return new Promise((resolve, reject) => {
            db.query("SELECT * FROM activity_categories WHERE id = ?", [id], (err, rows) => {
                if (err) return reject(err);
                resolve(rows && rows[0] ? rows[0] : null);
            });
        });
    },

    delete(id) {
        return new Promise((resolve, reject) => {
            db.query("DELETE FROM activity_categories WHERE id = ?", [id], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    },
};

// auto ensure
ActivityCategoryModel.ensureTable()
    .then(() => console.log("🗂️ activity_categories table ensured."))
    .catch((e) => console.error("❌ Failed ensuring activity_categories:", e));

module.exports = ActivityCategoryModel;
