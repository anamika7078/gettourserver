// const db = require("../db.js");
const db = require("../db.js");

const HolidayPackageModel = {
    ensureTable() {
        return new Promise((resolve, reject) => {
            const sql = `
        CREATE TABLE IF NOT EXISTS holiday_packages (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          destination VARCHAR(255) NULL,
          duration VARCHAR(100) NULL,
          price DECIMAL(10,2) DEFAULT 0,
          category VARCHAR(255) NULL,
          details LONGTEXT NULL,
          images JSON NULL,
          created_at DATETIME,
          updated_at DATETIME NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `;
            db.query(sql, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    },

    create(record) {
        return new Promise((resolve, reject) => {
            const sql = `
        INSERT INTO holiday_packages (
          title, destination, duration, price, category, details, images, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
            const params = [
                record.title,
                record.destination || null,
                record.duration || null,
                Number(record.price || 0) || 0,
                record.category || null,
                record.details || null,
                record.images ? JSON.stringify(record.images) : null,
                new Date(),
            ];
            db.query(sql, params, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    },

    getAll() {
        return new Promise((resolve, reject) => {
            db.query("SELECT * FROM holiday_packages ORDER BY created_at DESC", (err, rows) => {
                if (err) return reject(err);
                resolve(rows || []);
            });
        });
    },

    getById(id) {
        return new Promise((resolve, reject) => {
            db.query("SELECT * FROM holiday_packages WHERE id = ?", [id], (err, rows) => {
                if (err) return reject(err);
                resolve(rows && rows[0] ? rows[0] : null);
            });
        });
    },

    update(id, record) {
        return new Promise((resolve, reject) => {
            const sql = `
                    UPDATE holiday_packages
                    SET title = ?, destination = ?, duration = ?, price = ?, category = ?, details = ?, images = ?, updated_at = ?
                    WHERE id = ?
                `;
            const params = [
                record.title,
                record.destination || null,
                record.duration || null,
                Number(record.price || 0) || 0,
                record.category || null,
                record.details || null,
                record.images ? JSON.stringify(record.images) : null,
                new Date(),
                id,
            ];
            db.query(sql, params, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    },

    delete(id) {
        return new Promise((resolve, reject) => {
            db.query("DELETE FROM holiday_packages WHERE id = ?", [id], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    },
};

// Auto-ensure (skip if JSON mode)
if (process.env.USE_JSON_DATA !== "true" && process.env.USE_JSON_DATA !== "1") {
    HolidayPackageModel.ensureTable()
        .then(() => console.log("🗂️ holiday_packages table ensured."))
        .catch((err) => {
            if (process.env.USE_JSON_DATA !== "true" && process.env.USE_JSON_DATA !== "1") {
                console.error("❌ Failed ensuring holiday_packages table:", err.message);
            }
        });
} else {
    console.log("📦 JSON mode: Skipping holiday_packages table creation");
}

module.exports = HolidayPackageModel;
