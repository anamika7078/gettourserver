
// import fs from "fs";
// import path from "path";
// import db from "../db.js";
const fs = require("fs");
const path = require("path");
const db = require("../db.js");

const HotelModel = {
    ensureUploadsDir() {
        const dir = path.join(process.cwd(), "uploads", "hotels");
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    },

    ensureTable() {
        this.ensureUploadsDir();
        return new Promise((resolve, reject) => {
            const sql = `
        CREATE TABLE IF NOT EXISTS hotels (
          id INT AUTO_INCREMENT PRIMARY KEY,
          hotel_name VARCHAR(255),
          address TEXT,
          map_link VARCHAR(512),
          description TEXT,
          facilities TEXT,
          rooms LONGTEXT,
          images TEXT,
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

    insertHotel(data) {
        return new Promise((resolve, reject) => {
            const sql = `
        INSERT INTO hotels 
        (hotel_name, address, map_link, description, facilities, rooms, images, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
            const params = [
                data.hotel_name,
                data.address,
                data.map_link,
                data.description,
                data.facilities,
                data.rooms,
                data.images,
                data.created_at,
            ];
            db.query(sql, params, (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    },

    getAll() {
        return new Promise((resolve, reject) => {
            db.query("SELECT * FROM hotels ORDER BY created_at DESC", (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    },

    deleteById(id) {
        return new Promise((resolve, reject) => {
            db.query("DELETE FROM hotels WHERE id = ?", [id], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    },

    updateHotel(id, data) {
        return new Promise((resolve, reject) => {
            const sql = `
        UPDATE hotels SET 
          hotel_name = ?, 
          address = ?, 
          map_link = ?, 
          description = ?, 
          facilities = ?, 
          rooms = ?, 
          images = ?, 
          updated_at = ?
        WHERE id = ?
      `;
            const params = [
                data.hotel_name,
                data.address,
                data.map_link,
                data.description,
                data.facilities,
                data.rooms,
                data.images,
                new Date(),
                id,
            ];
            db.query(sql, params, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    },
};

module.exports = HotelModel;
