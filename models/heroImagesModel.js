// // import fs from "fs";
// // import path from "path";
// // import db from "../db.js";
// const fs = require("fs");
// const path = require("path");
// const db = require("../db.js");



// const TABLE = "hero_images";

// export function ensureHeroUploadsDir() {
//     const dir = path.join(process.cwd(), "uploads", "heroes");
//     if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
// }

// export function ensureHeroImagesTable() {
//     ensureHeroUploadsDir();
//     return new Promise((resolve, reject) => {
//         const sql = `
//       CREATE TABLE IF NOT EXISTS ${TABLE} (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         page VARCHAR(50) UNIQUE,
//         image1 VARCHAR(512) NULL,
//         image2 VARCHAR(512) NULL,
//         image3 VARCHAR(512) NULL,
//         image4 VARCHAR(512) NULL,
//         updated_at DATETIME NULL
//       ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
//     `;
//         db.query(sql, (err, result) => {
//             if (err) return reject(err);
//             resolve(result);
//         });
//     });
// }

// export function getHeroImagesByPage(page) {
//     return new Promise((resolve, reject) => {
//         db.query(`SELECT * FROM ${TABLE} WHERE page = ? LIMIT 1`, [page], (err, rows) => {
//             if (err) return reject(err);
//             resolve(rows[0] || null);
//         });
//     });
// }

// export function upsertHeroImages(page, images) {
//     return new Promise((resolve, reject) => {
//         const now = new Date();
//         const { image1, image2, image3, image4 } = images;
//         const sql = `
//       INSERT INTO ${TABLE} (page, image1, image2, image3, image4, updated_at)
//       VALUES (?, ?, ?, ?, ?, ?)
//       ON DUPLICATE KEY UPDATE 
//         image1 = COALESCE(VALUES(image1), image1),
//         image2 = COALESCE(VALUES(image2), image2),
//         image3 = COALESCE(VALUES(image3), image3),
//         image4 = COALESCE(VALUES(image4), image4),
//         updated_at = VALUES(updated_at)
//     `;
//         db.query(sql, [page, image1 || null, image2 || null, image3 || null, image4 || null, now], (err, result) => {
//             if (err) return reject(err);
//             resolve(result);
//         });
//     });
// }

// module.exports =  {
//     ensureHeroUploadsDir,
//     ensureHeroImagesTable,
//     getHeroImagesByPage,
//     upsertHeroImages,
// };


// const fs = require("fs");
// const path = require("path");
// const db = require("../db.js");
const fs = require("fs");
const path = require("path");
const db = require("../db.js");

const TABLE = "hero_images";

function ensureHeroUploadsDir() {
    const dir = path.join(process.cwd(), "uploads", "heroes");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function ensureHeroImagesTable() {
    ensureHeroUploadsDir();
    return new Promise((resolve, reject) => {
        const sql = `
      CREATE TABLE IF NOT EXISTS ${TABLE} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        page VARCHAR(50) UNIQUE,
        image1 VARCHAR(512) NULL,
        image2 VARCHAR(512) NULL,
        image3 VARCHAR(512) NULL,
        image4 VARCHAR(512) NULL,
        updated_at DATETIME NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
        db.query(sql, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
}

function getHeroImagesByPage(page) {
    return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM ${TABLE} WHERE page = ? LIMIT 1`, [page], (err, rows) => {
            if (err) return reject(err);
            resolve(rows[0] || null);
        });
    });
}

function upsertHeroImages(page, images) {
    return new Promise((resolve, reject) => {
        const now = new Date();
        const { image1, image2, image3, image4 } = images;
        const sql = `
      INSERT INTO ${TABLE} (page, image1, image2, image3, image4, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        image1 = COALESCE(VALUES(image1), image1),
        image2 = COALESCE(VALUES(image2), image2),
        image3 = COALESCE(VALUES(image3), image3),
        image4 = COALESCE(VALUES(image4), image4),
        updated_at = VALUES(updated_at)
    `;
        db.query(sql, [page, image1 || null, image2 || null, image3 || null, image4 || null, now], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
}

module.exports = {
    ensureHeroUploadsDir,
    ensureHeroImagesTable,
    getHeroImagesByPage,
    upsertHeroImages,
};
