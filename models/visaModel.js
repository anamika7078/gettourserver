
// const dotenv = require("dotenv");
// const fs = require("fs");
// const path = require("path");
// const db = require("../db.js");

// dotenv.config();


// // Ensure DB is selected
// const useDb = () =>
//     new Promise((resolve, reject) => {
//         db.query(`USE ${process.env.DB_NAME}`, (err) =>
//             err ? reject(err) : resolve()
//         );
//     });

// export const ensureVisaUploadsDir = () => {
//     const dir = path.join(process.cwd(), "uploads", "visas");
//     if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
// };

// export const ensureVisaTable = async () => {
//     await useDb();
//     ensureVisaUploadsDir();
//     const sql = `
//     CREATE TABLE IF NOT EXISTS visas (
//       id INT AUTO_INCREMENT PRIMARY KEY,
//       country VARCHAR(255) NOT NULL,
//       price DECIMAL(10,2) DEFAULT 0,
//       subject VARCHAR(255) NULL,
//       image VARCHAR(512) NULL,
//       overview LONGTEXT NULL,
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//       updated_at DATETIME NULL
//     ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
//   `;
//     return new Promise((resolve, reject) => {
//         db.query(sql, (err, result) => (err ? reject(err) : resolve(result)));
//     });
// };

// export const insertVisa = async ({ country, price, subject, image, overview }) => {
//     await useDb();
//     const sql = `INSERT INTO visas (country, price, subject, image, overview) VALUES (?, ?, ?, ?, ?)`;
//     const params = [country || "", Number(price || 0) || 0, subject || null, image || null, overview || null];
//     return new Promise((resolve, reject) => {
//         db.query(sql, params, (err, result) => (err ? reject(err) : resolve(result)));
//     });
// };

// export const getAllVisas = async () => {
//     await useDb();
//     const sql = `SELECT * FROM visas ORDER BY created_at DESC`;
//     return new Promise((resolve, reject) => {
//         db.query(sql, (err, rows) => (err ? reject(err) : resolve(rows)));
//     });
// };

// export const getVisaById = async (id) => {
//     await useDb();
//     const sql = `SELECT * FROM visas WHERE id = ?`;
//     return new Promise((resolve, reject) => {
//         db.query(sql, [id], (err, rows) => (err ? reject(err) : resolve(rows?.[0] || null)));
//     });
// };

// export const updateVisa = async (id, { country, price, subject, image, overview }) => {
//     await useDb();
//     // If image is null, don't change it; otherwise set to provided
//     const fields = ["country = ?", "price = ?", "subject = ?", image ? "image = ?" : null, "overview = ?", "updated_at = ?"].filter(Boolean).join(", ");
//     const params = [
//         country || "",
//         Number(price || 0) || 0,
//         subject || null,
//         ...(image ? [image] : []),
//         overview || null,
//         new Date(),
//         id,
//     ];
//     const sql = `UPDATE visas SET ${fields} WHERE id = ?`;
//     return new Promise((resolve, reject) => {
//         db.query(sql, params, (err, result) => (err ? reject(err) : resolve(result)));
//     });
// };

// export const deleteVisa = async (id) => {
//     await useDb();
//     const sql = `DELETE FROM visas WHERE id = ?`;
//     return new Promise((resolve, reject) => {
//         db.query(sql, [id], (err, result) => (err ? reject(err) : resolve(result)));
//     });
// };

// // Auto ensure on import
// ensureVisaTable().catch((e) => console.error("ensureVisaTable failed:", e));

// module.exports =  {
//     ensureVisaTable,
//     ensureVisaUploadsDir,
//     insertVisa,
//     getAllVisas,
//     getVisaById,
//     updateVisa,
//     deleteVisa,
// };


const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const db = require("../db.js");

dotenv.config();

// Ensure DB is selected
const useDb = () =>
    new Promise((resolve, reject) => {
        db.query(`USE ${process.env.DB_NAME}`, (err) =>
            err ? reject(err) : resolve()
        );
    });

// Ensure uploads/visas folder exists
const ensureVisaUploadsDir = () => {
    const dir = path.join(process.cwd(), "uploads", "visas");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

// Create table if not exists
const ensureVisaTable = async () => {
    await useDb();
    ensureVisaUploadsDir();
    const sql = `
    CREATE TABLE IF NOT EXISTS visas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      country VARCHAR(255) NOT NULL,
      price DECIMAL(10,2) DEFAULT 0,
      subject VARCHAR(255) NULL,
      image VARCHAR(512) NULL,
      overview LONGTEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => (err ? reject(err) : resolve(result)));
    });
};

// Insert new visa
const insertVisa = async ({ country, price, subject, image, overview }) => {
    await useDb();
    const sql = `
    INSERT INTO visas (country, price, subject, image, overview)
    VALUES (?, ?, ?, ?, ?)
  `;
    const params = [
        country || "",
        Number(price || 0) || 0,
        subject || null,
        image || null,
        overview || null,
    ];
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, result) => (err ? reject(err) : resolve(result)));
    });
};

// Fetch all visas
const getAllVisas = async () => {
    await useDb();
    const sql = `SELECT * FROM visas ORDER BY created_at DESC`;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, rows) => (err ? reject(err) : resolve(rows)));
    });
};

// Fetch visa by ID
const getVisaById = async (id) => {
    await useDb();
    const sql = `SELECT * FROM visas WHERE id = ?`;
    return new Promise((resolve, reject) => {
        db.query(sql, [id], (err, rows) => (err ? reject(err) : resolve(rows?.[0] || null)));
    });
};

// Update visa
const updateVisa = async (id, { country, price, subject, image, overview }) => {
    await useDb();
    const fields = [
        "country = ?",
        "price = ?",
        "subject = ?",
        image ? "image = ?" : null,
        "overview = ?",
        "updated_at = ?",
    ]
        .filter(Boolean)
        .join(", ");

    const params = [
        country || "",
        Number(price || 0) || 0,
        subject || null,
        ...(image ? [image] : []),
        overview || null,
        new Date(),
        id,
    ];

    const sql = `UPDATE visas SET ${fields} WHERE id = ?`;
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, result) => (err ? reject(err) : resolve(result)));
    });
};

// Delete visa
const deleteVisa = async (id) => {
    await useDb();
    const sql = `DELETE FROM visas WHERE id = ?`;
    return new Promise((resolve, reject) => {
        db.query(sql, [id], (err, result) => (err ? reject(err) : resolve(result)));
    });
};

// Auto ensure table exists on import (skip if JSON mode)
if (process.env.USE_JSON_DATA !== "true" && process.env.USE_JSON_DATA !== "1") {
    ensureVisaTable().catch((e) => {
        if (process.env.USE_JSON_DATA !== "true" && process.env.USE_JSON_DATA !== "1") {
            console.error("ensureVisaTable failed:", e.message);
        }
    });
} else {
    console.log("📦 JSON mode: Skipping visas table creation");
}

// Export functions (CommonJS)
module.exports = {
    ensureVisaTable,
    ensureVisaUploadsDir,
    insertVisa,
    getAllVisas,
    getVisaById,
    updateVisa,
    deleteVisa,
};
