// // backend/models/contactModel.js
// // import db from "../db.js";
// const db = require("../db.js");


// /**
//  * Auto-create the contact_messages table if it doesn't exist
//  */
// export const createContactTable = () => {
//     const createTableQuery = `
//     CREATE TABLE IF NOT EXISTS contact_messages (
//       id INT AUTO_INCREMENT PRIMARY KEY,
//       name VARCHAR(100) NOT NULL,
//       email VARCHAR(150) NOT NULL,
//       subject VARCHAR(200),
//       phone VARCHAR(50),
//       message TEXT NOT NULL,
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//     )
//   `;

//     db.query(createTableQuery, (err) => {
//         if (err) {
//             console.error("❌ Error creating contact_messages table:", err);
//         } else {
//             console.log("✅ contact_messages table created or already exists");
//         }
//     });
// };

// /**
//  * Insert a new contact message into the database
//  */
// export const insertContactMessage = (data, callback) => {
//     const { name, email, subject, phone, message } = data;

//     const insertQuery = `
//     INSERT INTO contact_messages (name, email, subject, phone, message)
//     VALUES (?, ?, ?, ?, ?)
//   `;

//     db.query(insertQuery, [name, email, subject, phone, message], (err, result) => {
//         if (err) {
//             console.error("❌ Error inserting contact message:", err);
//             callback(err, null);
//         } else {
//             console.log("✅ New contact message added:", result.insertId);
//             callback(null, result);
//         }
//     });
// };

// // ✅ Auto-create table when model file is loaded
// createContactTable();

// backend/models/contactModel.js
const db = require("../db.js");

/**
 * Auto-create the contact_messages table if it doesn't exist
 */
const createContactTable = () => {
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS contact_messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) NOT NULL,
      subject VARCHAR(200),
      phone VARCHAR(50),
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

    db.query(createTableQuery, (err) => {
        if (err) {
            console.error("❌ Error creating contact_messages table:", err);
        } else {
            console.log("✅ contact_messages table created or already exists");
        }
    });
};

/**
 * Insert a new contact message into the database
 */
const insertContactMessage = (data, callback) => {
    const { name, email, subject, phone, message } = data;

    const insertQuery = `
    INSERT INTO contact_messages (name, email, subject, phone, message)
    VALUES (?, ?, ?, ?, ?)
  `;

    db.query(insertQuery, [name, email, subject, phone, message], (err, result) => {
        if (err) {
            console.error("❌ Error inserting contact message:", err);
            callback(err, null);
        } else {
            console.log("✅ New contact message added:", result.insertId);
            callback(null, result);
        }
    });
};

// ✅ Auto-create table when model file is loaded
createContactTable();

module.exports = { createContactTable, insertContactMessage };
