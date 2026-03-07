// // import dotenv from "dotenv";
// // import db from "../db.js";

// // dotenv.config();
// const dotenv = require("dotenv");
// const db = require("../db.js");

// dotenv.config();


// // Ensure we use the configured DB
// const useDb = () =>
//     new Promise((resolve, reject) => {
//         db.query(`USE ${process.env.DB_NAME}`, (err) => err ? reject(err) : resolve());
//     });

// export const ensureHolidayEnquiryTable = async () => {
//     try {
//         await useDb();
//         const sql = `
//       CREATE TABLE IF NOT EXISTS holiday_enquiries (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         package_id INT,
//         package_title VARCHAR(255),
//         destination VARCHAR(255),
//         duration VARCHAR(100),
//         price DECIMAL(10,2),
//         name VARCHAR(120) NOT NULL,
//         email VARCHAR(180) NOT NULL,
//         phone VARCHAR(60),
//         travel_date VARCHAR(32),
//         adults INT DEFAULT 1,
//         children INT DEFAULT 0,
//         flight_booked VARCHAR(10),
//         remarks TEXT,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
//     `;
//         db.query(sql, (err) => {
//             if (err) {
//                 console.error("❌ Error creating holiday_enquiries table:", err);
//             } else {
//                 console.log("✅ holiday_enquiries table created or already exists");
//             }
//         });
//     } catch (e) {
//         console.error("❌ ensureHolidayEnquiryTable failed:", e);
//     }
// };

// export const insertHolidayEnquiry = async (data) => {
//     await useDb();
//     const sql = `
//     INSERT INTO holiday_enquiries 
//       (package_id, package_title, destination, duration, price, name, email, phone, travel_date, adults, children, flight_booked, remarks)
//     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
//   `;
//     const params = [
//         data.package_id ?? null,
//         data.package_title ?? null,
//         data.destination ?? null,
//         data.duration ?? null,
//         data.price ?? null,
//         data.name,
//         data.email,
//         data.phone ?? null,
//         data.travel_date ?? null,
//         data.adults ?? 1,
//         data.children ?? 0,
//         data.flight_booked ?? null,
//         data.remarks ?? null,
//     ];
//     return new Promise((resolve, reject) => {
//         db.query(sql, params, (err, result) => {
//             if (err) return reject(err);
//             resolve(result);
//         });
//     });
// };

// export const getHolidayEnquiries = async () => {
//     await useDb();
//     const sql = `SELECT * FROM holiday_enquiries ORDER BY created_at DESC`;
//     return new Promise((resolve, reject) => {
//         db.query(sql, (err, rows) => (err ? reject(err) : resolve(rows)));
//     });
// };

// export const deleteHolidayEnquiry = async (id) => {
//     await useDb();
//     const sql = `DELETE FROM holiday_enquiries WHERE id = ?`;
//     return new Promise((resolve, reject) => {
//         db.query(sql, [id], (err, result) => (err ? reject(err) : resolve(result)));
//     });
// };

// // auto ensure
// ensureHolidayEnquiryTable();

const dotenv = require("dotenv");
const db = require("../db.js");

dotenv.config();

// Ensure we use the configured DB
const useDb = () =>
    new Promise((resolve, reject) => {
        db.query(`USE ${process.env.DB_NAME}`, (err) =>
            err ? reject(err) : resolve()
        );
    });

const ensureHolidayEnquiryTable = async () => {
    try {
        await useDb();
        const sql = `
      CREATE TABLE IF NOT EXISTS holiday_enquiries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        package_id INT,
        package_title VARCHAR(255),
        destination VARCHAR(255),
        duration VARCHAR(100),
        price DECIMAL(10,2),
        name VARCHAR(120) NOT NULL,
        email VARCHAR(180) NOT NULL,
        phone VARCHAR(60),
        travel_date VARCHAR(32),
        adults INT DEFAULT 1,
        children INT DEFAULT 0,
        flight_booked VARCHAR(10),
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
        db.query(sql, (err) => {
            if (err) {
                console.error("❌ Error creating holiday_enquiries table:", err);
            } else {
                console.log("✅ holiday_enquiries table created or already exists");
            }
        });
    } catch (e) {
        console.error("❌ ensureHolidayEnquiryTable failed:", e);
    }
};

const insertHolidayEnquiry = async (data) => {
    await useDb();
    const sql = `
    INSERT INTO holiday_enquiries 
      (package_id, package_title, destination, duration, price, name, email, phone, travel_date, adults, children, flight_booked, remarks)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
  `;
    const params = [
        data.package_id ?? null,
        data.package_title ?? null,
        data.destination ?? null,
        data.duration ?? null,
        data.price ?? null,
        data.name,
        data.email,
        data.phone ?? null,
        data.travel_date ?? null,
        data.adults ?? 1,
        data.children ?? 0,
        data.flight_booked ?? null,
        data.remarks ?? null,
    ];
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

const getHolidayEnquiries = async () => {
    await useDb();
    const sql = `SELECT * FROM holiday_enquiries ORDER BY created_at DESC`;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, rows) => (err ? reject(err) : resolve(rows)));
    });
};

const deleteHolidayEnquiry = async (id) => {
    await useDb();
    const sql = `DELETE FROM holiday_enquiries WHERE id = ?`;
    return new Promise((resolve, reject) => {
        db.query(sql, [id], (err, result) => (err ? reject(err) : resolve(result)));
    });
};

// Auto ensure table exists
ensureHolidayEnquiryTable();

module.exports = {
    ensureHolidayEnquiryTable,
    insertHolidayEnquiry,
    getHolidayEnquiries,
    deleteHolidayEnquiry,
};
