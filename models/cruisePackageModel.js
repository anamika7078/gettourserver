// // import dotenv from "dotenv";
// // import db from "../db.js";

// // dotenv.config();
// const dotenv = require("dotenv");
// const db = require("../db.js");

// dotenv.config();


// const useDb = () => new Promise((resolve, reject) => {
//     db.query(`USE ${process.env.DB_NAME}`, (err) => err ? reject(err) : resolve());
// });

// export const ensureCruiseTable = async () => {
//     try {
//         await useDb();
//         const sql = `
//       CREATE TABLE IF NOT EXISTS cruise_packages (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         title VARCHAR(255) NOT NULL,
//         departure_port VARCHAR(255),
//         departure_dates JSON,
//         price DECIMAL(10,2) DEFAULT 0,
//         image VARCHAR(255),
//         banner_video_url VARCHAR(500),
//         category VARCHAR(255),
//         details LONGTEXT,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
//       ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
//     `;
//         db.query(sql, (err) => {
//             if (err) console.error("❌ Error creating cruise_packages table:", err);
//             else console.log("✅ cruise_packages table created or already exists");
//         });
//     } catch (e) {
//         console.error("❌ ensureCruiseTable failed:", e);
//     }
// };

// export const createCruise = async (data) => {
//     await useDb();
//     const sql = `INSERT INTO cruise_packages (title, departure_port, departure_dates, price, image, banner_video_url, category, details)
//                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
//     const params = [
//         data.title,
//         data.departure_port ?? null,
//         data.departure_dates ? JSON.stringify(data.departure_dates) : null,
//         data.price ?? 0,
//         data.image ?? null,
//         data.banner_video_url ?? null,
//         data.category ?? null,
//         data.details ?? null,
//     ];
//     return new Promise((resolve, reject) => {
//         db.query(sql, params, (err, result) => err ? reject(err) : resolve(result));
//     });
// };

// export const getCruises = async () => {
//     await useDb();
//     const sql = `SELECT * FROM cruise_packages ORDER BY created_at DESC`;
//     return new Promise((resolve, reject) => {
//         db.query(sql, (err, rows) => err ? reject(err) : resolve(rows));
//     });
// };

// export const getCruiseById = async (id) => {
//     await useDb();
//     const sql = `SELECT * FROM cruise_packages WHERE id = ?`;
//     return new Promise((resolve, reject) => {
//         db.query(sql, [id], (err, rows) => err ? reject(err) : resolve(rows[0]));
//     });
// };

// export const updateCruise = async (id, data) => {
//     await useDb();
//     const sql = `UPDATE cruise_packages SET title=?, departure_port=?, departure_dates=?, price=?, image=?, banner_video_url=?, category=?, details=? WHERE id=?`;
//     const params = [
//         data.title,
//         data.departure_port ?? null,
//         data.departure_dates ? JSON.stringify(data.departure_dates) : null,
//         data.price ?? 0,
//         data.image ?? null,
//         data.banner_video_url ?? null,
//         data.category ?? null,
//         data.details ?? null,
//         id,
//     ];
//     return new Promise((resolve, reject) => {
//         db.query(sql, params, (err, result) => err ? reject(err) : resolve(result));
//     });
// };

// export const deleteCruise = async (id) => {
//     await useDb();
//     const sql = `DELETE FROM cruise_packages WHERE id = ?`;
//     return new Promise((resolve, reject) => {
//         db.query(sql, [id], (err, result) => err ? reject(err) : resolve(result));
//     });
// };

// ensureCruiseTable();

// backend/models/cruisePackageModel.js
const dotenv = require("dotenv");
const db = require("../db.js");

dotenv.config();

const useDb = () =>
    new Promise((resolve, reject) => {
        db.query(`USE ${process.env.DB_NAME}`, (err) => (err ? reject(err) : resolve()));
    });

const ensureCruiseTable = async () => {
    try {
        await useDb();
        const sql = `
      CREATE TABLE IF NOT EXISTS cruise_packages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        departure_port VARCHAR(255),
        departure_dates JSON,
        price DECIMAL(10,2) DEFAULT 0,
        image VARCHAR(255),
        banner_video_url VARCHAR(500),
        category VARCHAR(255),
        details LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
        db.query(sql, (err) => {
            if (err) console.error("❌ Error creating cruise_packages table:", err);
            else console.log("✅ cruise_packages table created or already exists");
        });
    } catch (e) {
        console.error("❌ ensureCruiseTable failed:", e);
    }
};

const createCruise = async (data) => {
    await useDb();
    const sql = `INSERT INTO cruise_packages (title, departure_port, departure_dates, price, image, banner_video_url, category, details)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [
        data.title,
        data.departure_port ?? null,
        data.departure_dates ? JSON.stringify(data.departure_dates) : null,
        data.price ?? 0,
        data.image ?? null,
        data.banner_video_url ?? null,
        data.category ?? null,
        data.details ?? null,
    ];
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, result) => (err ? reject(err) : resolve(result)));
    });
};

const getCruises = async () => {
    await useDb();
    const sql = `SELECT * FROM cruise_packages ORDER BY created_at DESC`;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, rows) => (err ? reject(err) : resolve(rows)));
    });
};

const getCruiseById = async (id) => {
    await useDb();
    const sql = `SELECT * FROM cruise_packages WHERE id = ?`;
    return new Promise((resolve, reject) => {
        db.query(sql, [id], (err, rows) => (err ? reject(err) : resolve(rows[0])));
    });
};

const updateCruise = async (id, data) => {
    await useDb();
    const sql = `UPDATE cruise_packages SET title=?, departure_port=?, departure_dates=?, price=?, image=?, banner_video_url=?, category=?, details=? WHERE id=?`;
    const params = [
        data.title,
        data.departure_port ?? null,
        data.departure_dates ? JSON.stringify(data.departure_dates) : null,
        data.price ?? 0,
        data.image ?? null,
        data.banner_video_url ?? null,
        data.category ?? null,
        data.details ?? null,
        id,
    ];
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, result) => (err ? reject(err) : resolve(result)));
    });
};

const deleteCruise = async (id) => {
    await useDb();
    const sql = `DELETE FROM cruise_packages WHERE id = ?`;
    return new Promise((resolve, reject) => {
        db.query(sql, [id], (err, result) => (err ? reject(err) : resolve(result)));
    });
};

// auto-create table
ensureCruiseTable();

module.exports = {
    ensureCruiseTable,
    createCruise,
    getCruises,
    getCruiseById,
    updateCruise,
    deleteCruise,
};
