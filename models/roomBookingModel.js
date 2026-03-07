// const db = require("../db.js");
const db = require("../db.js");

const RoomBookingModel = {
    ensureTable() {
        return new Promise((resolve, reject) => {
            const sql = `
        CREATE TABLE IF NOT EXISTS room_bookings (
          id INT AUTO_INCREMENT PRIMARY KEY,
          hotel_id INT NULL,
          hotel_name VARCHAR(255) NULL,
          room_type VARCHAR(255) NULL,
          price_per_night DECIMAL(10,2) DEFAULT 0,
          check_in DATE,
          check_out DATE,
          nights INT DEFAULT 0,
          total_guests INT DEFAULT 1,
          total_price DECIMAL(10,2) DEFAULT 0,
          special_request TEXT NULL,
          lead_title VARCHAR(10) NULL,
          lead_first_name VARCHAR(100) NULL,
          lead_last_name VARCHAR(100) NULL,
          lead_email VARCHAR(255) NULL,
          lead_country_code VARCHAR(10) NULL,
          lead_phone VARCHAR(50) NULL,
          lead_nationality VARCHAR(100) NULL,
          additional_guests JSON NULL,
          payment_status VARCHAR(32) DEFAULT 'pending',
          stripe_session_id VARCHAR(255) NULL,
          stripe_payment_intent VARCHAR(255) NULL,
          created_at DATETIME,
          updated_at DATETIME NULL,
          UNIQUE KEY uniq_room_stripe_session (stripe_session_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `;
            db.query(sql, (err, result) => {
                if (err) return reject(err);
                // Attempt idempotent ALTERs for existing tables missing new columns
                const alters = [
                    "ALTER TABLE room_bookings ADD COLUMN IF NOT EXISTS payment_status VARCHAR(32) DEFAULT 'pending'",
                    "ALTER TABLE room_bookings ADD COLUMN IF NOT EXISTS stripe_session_id VARCHAR(255) NULL",
                    "ALTER TABLE room_bookings ADD COLUMN IF NOT EXISTS stripe_payment_intent VARCHAR(255) NULL",
                    "ALTER TABLE room_bookings ADD UNIQUE KEY uniq_room_stripe_session (stripe_session_id)",
                ];
                const runNext = (i = 0) => {
                    if (i >= alters.length) return resolve(result);
                    db.query(alters[i], (e) => {
                        // ignore errors (e.g., duplicate key when index exists, or older MySQL without IF NOT EXISTS)
                        runNext(i + 1);
                    });
                };
                runNext(0);
            });
        });
    },

    create(booking) {
        return new Promise((resolve, reject) => {
            const sql = `
        INSERT INTO room_bookings (
          hotel_id, hotel_name, room_type, price_per_night,
          check_in, check_out, nights, total_guests, total_price,
          special_request,
          lead_title, lead_first_name, lead_last_name, lead_email, lead_country_code, lead_phone, lead_nationality,
          additional_guests, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
            const params = [
                booking.hotel_id || null,
                booking.hotel_name || null,
                booking.room_type || null,
                booking.price_per_night || 0,
                booking.check_in,
                booking.check_out,
                booking.nights || 0,
                booking.total_guests || 1,
                booking.total_price || 0,
                booking.special_request || null,
                booking.lead_title || null,
                booking.lead_first_name || null,
                booking.lead_last_name || null,
                booking.lead_email || null,
                booking.lead_country_code || null,
                booking.lead_phone || null,
                booking.lead_nationality || null,
                booking.additional_guests ? JSON.stringify(booking.additional_guests) : null,
                new Date(),
            ];
            db.query(sql, params, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    },

    createPaid(booking) {
        return new Promise((resolve, reject) => {
            const sql = `
        INSERT INTO room_bookings (
          hotel_id, hotel_name, room_type, price_per_night,
          check_in, check_out, nights, total_guests, total_price,
          special_request,
          lead_title, lead_first_name, lead_last_name, lead_email, lead_country_code, lead_phone, lead_nationality,
          additional_guests,
          payment_status, stripe_session_id, stripe_payment_intent,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
            const params = [
                booking.hotel_id || null,
                booking.hotel_name || null,
                booking.room_type || null,
                Number(booking.price_per_night || 0) || 0,
                booking.check_in || null,
                booking.check_out || null,
                Number(booking.nights || 0) || 0,
                Number(booking.total_guests || 1) || 1,
                Number(booking.total_price || 0) || 0,
                booking.special_request || null,
                booking.lead_title || null,
                booking.lead_first_name || null,
                booking.lead_last_name || null,
                booking.lead_email || null,
                booking.lead_country_code || null,
                booking.lead_phone || null,
                booking.lead_nationality || null,
                booking.additional_guests ? JSON.stringify(booking.additional_guests) : null,
                booking.payment_status || 'pending',
                booking.stripe_session_id || null,
                booking.stripe_payment_intent || null,
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
            db.query(
                "SELECT * FROM room_bookings ORDER BY created_at DESC",
                (err, rows) => {
                    if (err) return reject(err);
                    resolve(rows);
                }
            );
        });
    },

    getById(id) {
        return new Promise((resolve, reject) => {
            db.query("SELECT * FROM room_bookings WHERE id = ?", [id], (err, rows) => {
                if (err) return reject(err);
                resolve(rows[0] || null);
            });
        });
    },

    getByStripeSession(sessionId) {
        return new Promise((resolve, reject) => {
            db.query(
                "SELECT * FROM room_bookings WHERE stripe_session_id = ?",
                [sessionId],
                (err, rows) => {
                    if (err) return reject(err);
                    resolve(rows && rows[0] ? rows[0] : null);
                }
            );
        });
    },
};

module.exports = RoomBookingModel;
