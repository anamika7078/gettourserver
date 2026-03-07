// // import dotenv from "dotenv";
// // import db from "../db.js";

// // dotenv.config();
// const dotenv = require("dotenv");
// const db = require("../db.js");

// dotenv.config();


// const useDb = () =>
//     new Promise((resolve, reject) => {
//         db.query(`USE ${process.env.DB_NAME}`, (err) => (err ? reject(err) : resolve()));
//     });

// export const ensureCruiseEnquiryTable = async () => {
//     try {
//         await useDb();
//         const sql = `
//       CREATE TABLE IF NOT EXISTS cruise_enquiries (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         cruise_id INT,
//         cruise_title VARCHAR(255),
//         departure_port VARCHAR(255),
//         departure_date VARCHAR(64),
//         price DECIMAL(10,2),
//         name VARCHAR(120) NOT NULL,
//         email VARCHAR(180) NOT NULL,
//         phone VARCHAR(60),
//         travel_date VARCHAR(32),
//         adults INT DEFAULT 1,
//         children INT DEFAULT 0,
//         adult_count INT DEFAULT 0,
//         teen_count INT DEFAULT 0,
//         kid_count INT DEFAULT 0,
//         infant_count INT DEFAULT 0,
//         cabin_name VARCHAR(255),
//         remarks TEXT,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
//     `;
//         db.query(sql, (err) => {
//             if (err) {
//                 console.error("❌ Error creating cruise_enquiries table:", err);
//             } else {
//                 console.log("✅ cruise_enquiries table created or already exists");
//             }
//         });
//     } catch (e) {
//         console.error("❌ ensureCruiseEnquiryTable failed:", e);
//     }
// };

// export const insertCruiseEnquiry = async (data) => {
//     await useDb();
//     const sql = `
//     INSERT INTO cruise_enquiries
//       (cruise_id, cruise_title, departure_port, departure_date, price, name, email, phone, travel_date, adults, children, adult_count, teen_count, kid_count, infant_count, cabin_name, remarks)
//     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
//   `;
//     const params = [
//         data.cruise_id ?? null,
//         data.cruise_title ?? null,
//         data.departure_port ?? null,
//         data.departure_date ?? null,
//         data.price ?? null,
//         data.name,
//         data.email,
//         data.phone ?? null,
//         data.travel_date ?? null,
//         data.adults ?? 1,
//         data.children ?? 0,
//         data.adult_count ?? 0,
//         data.teen_count ?? 0,
//         data.kid_count ?? 0,
//         data.infant_count ?? 0,
//         data.cabin_name ?? null,
//         data.remarks ?? null,
//     ];
//     return new Promise((resolve, reject) => {
//         db.query(sql, params, (err, result) => (err ? reject(err) : resolve(result)));
//     });
// };

// export const getCruiseEnquiries = async () => {
//     await useDb();
//     const sql = `SELECT * FROM cruise_enquiries ORDER BY created_at DESC`;
//     return new Promise((resolve, reject) => {
//         db.query(sql, (err, rows) => (err ? reject(err) : resolve(rows)));
//     });
// };

// export const deleteCruiseEnquiry = async (id) => {
//     await useDb();
//     const sql = `DELETE FROM cruise_enquiries WHERE id = ?`;
//     return new Promise((resolve, reject) => {
//         db.query(sql, [id], (err, result) => (err ? reject(err) : resolve(result)));
//     });
// };

// // auto ensure
// ensureCruiseEnquiryTable();

// backend/models/cruiseEnquiryModel.js
const dotenv = require("dotenv");
const db = require("../db.js");

dotenv.config();

const useDb = () =>
    new Promise((resolve, reject) => {
        db.query(`USE ${process.env.DB_NAME}`, (err) => (err ? reject(err) : resolve()));
    });

const ensureCruiseEnquiryTable = async () => {
    try {
        await useDb();
        const sql = `
      CREATE TABLE IF NOT EXISTS cruise_enquiries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cruise_id INT,
        cruise_title VARCHAR(255),
        departure_port VARCHAR(255),
        departure_date VARCHAR(64),
        price DECIMAL(10,2),
        name VARCHAR(120) NOT NULL,
        email VARCHAR(180) NOT NULL,
        phone VARCHAR(60),
        travel_date VARCHAR(32),
        adults INT DEFAULT 1,
        children INT DEFAULT 0,
        adult_count INT DEFAULT 0,
        teen_count INT DEFAULT 0,
        kid_count INT DEFAULT 0,
        infant_count INT DEFAULT 0,
        cabin_name VARCHAR(255),
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
        db.query(sql, (err) => {
            if (err) {
                console.error("❌ Error creating cruise_enquiries table:", err);
            } else {
                console.log("✅ cruise_enquiries table created or already exists");
            }
        });
    } catch (e) {
        console.error("❌ ensureCruiseEnquiryTable failed:", e);
    }
};

const insertCruiseEnquiry = async (data) => {
    await useDb();
    const sql = `
    INSERT INTO cruise_enquiries
      (cruise_id, cruise_title, departure_port, departure_date, price, name, email, phone, travel_date, adults, children, adult_count, teen_count, kid_count, infant_count, cabin_name, remarks)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `;
    const params = [
        data.cruise_id ?? null,
        data.cruise_title ?? null,
        data.departure_port ?? null,
        data.departure_date ?? null,
        data.price ?? null,
        data.name,
        data.email,
        data.phone ?? null,
        data.travel_date ?? null,
        data.adults ?? 1,
        data.children ?? 0,
        data.adult_count ?? 0,
        data.teen_count ?? 0,
        data.kid_count ?? 0,
        data.infant_count ?? 0,
        data.cabin_name ?? null,
        data.remarks ?? null,
    ];
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, result) => (err ? reject(err) : resolve(result)));
    });
};

const getCruiseEnquiries = async () => {
    await useDb();
    const sql = `SELECT * FROM cruise_enquiries ORDER BY created_at DESC`;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, rows) => (err ? reject(err) : resolve(rows)));
    });
};

const deleteCruiseEnquiry = async (id) => {
    await useDb();
    const sql = `DELETE FROM cruise_enquiries WHERE id = ?`;
    return new Promise((resolve, reject) => {
        db.query(sql, [id], (err, result) => (err ? reject(err) : resolve(result)));
    });
};

// auto ensure
ensureCruiseEnquiryTable();

module.exports = {
    ensureCruiseEnquiryTable,
    insertCruiseEnquiry,
    getCruiseEnquiries,
    deleteCruiseEnquiry,
};
