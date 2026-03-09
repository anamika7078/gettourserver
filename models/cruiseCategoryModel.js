const db = require("../db.js");
const dotenv = require("dotenv");
dotenv.config();

function useDb() {
    return new Promise((resolve, reject) => {
        db.changeUser({ database: process.env.DB_NAME }, (err) => (err ? reject(err) : resolve()));
    });
}

function slugify(text = "") {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
}

const CruiseCategoryModel = {
    async ensureTable() {
        await useDb();
        const sql = `
      CREATE TABLE IF NOT EXISTS cruise_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL UNIQUE,
        slug VARCHAR(160) UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;
        return new Promise((resolve, reject) => {
            db.query(sql, (err, result) => (err ? reject(err) : resolve(result)));
        });
    },
    async list() {
        await useDb();
        return new Promise((resolve, reject) => {
            db.query("SELECT * FROM cruise_categories ORDER BY name ASC", (err, rows) => (err ? reject(err) : resolve(rows || [])));
        });
    },
    async create({ name }) {
        await useDb();
        const slug = slugify(name);
        const sql = "INSERT INTO cruise_categories (name, slug) VALUES (?, ?)";
        return new Promise((resolve, reject) => {
            db.query(sql, [name, slug], (err, result) => (err ? reject(err) : resolve(result)));
        });
    },
    async delete(id) {
        await useDb();
        const sql = "DELETE FROM cruise_categories WHERE id = ?";
        return new Promise((resolve, reject) => {
            db.query(sql, [id], (err, result) => (err ? reject(err) : resolve(result)));
        });
    },
};

if (process.env.USE_JSON_DATA !== "true" && process.env.USE_JSON_DATA !== "1") {
    CruiseCategoryModel.ensureTable().catch((e) => {
        if (process.env.USE_JSON_DATA !== "true" && process.env.USE_JSON_DATA !== "1") {
            console.error("❌ cruise_categories ensure failed", e.message);
        }
    });
} else {
    console.log("📦 JSON mode: Skipping cruise_categories table creation");
}

module.exports = CruiseCategoryModel;
