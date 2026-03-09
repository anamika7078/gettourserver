const db = require("../db.js");
const dotenv = require("dotenv");
dotenv.config();

function useDb() {
    return new Promise((resolve, reject) => {
        db.changeUser({ database: process.env.DB_NAME }, (err) => (err ? reject(err) : resolve()));
    });
}

function slugify(text = "") {
    return text.toString().toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
}

const HolidayCategoryModel = {
    async ensureTable() {
        await useDb();
        const sql = `CREATE TABLE IF NOT EXISTS holiday_categories (
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
            db.query("SELECT * FROM holiday_categories ORDER BY name ASC", (err, rows) => (err ? reject(err) : resolve(rows || [])));
        });
    },
    async create({ name }) {
        await useDb();
        const slug = slugify(name);
        return new Promise((resolve, reject) => {
            db.query("INSERT INTO holiday_categories (name, slug) VALUES (?, ?)", [name, slug], (err, result) => (err ? reject(err) : resolve(result)));
        });
    },
    async delete(id) {
        await useDb();
        return new Promise((resolve, reject) => {
            db.query("DELETE FROM holiday_categories WHERE id = ?", [id], (err, result) => (err ? reject(err) : resolve(result)));
        });
    },
};

if (process.env.USE_JSON_DATA !== "true" && process.env.USE_JSON_DATA !== "1") {
    HolidayCategoryModel.ensureTable().catch((e) => {
        if (process.env.USE_JSON_DATA !== "true" && process.env.USE_JSON_DATA !== "1") {
            console.error("❌ holiday_categories ensure failed", e.message);
        }
    });
} else {
    console.log("📦 JSON mode: Skipping holiday_categories table creation");
}

module.exports = HolidayCategoryModel;
