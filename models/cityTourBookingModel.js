const db = require("../db.js");

const CityTourBookingModel = {
    ensureTable() {
        return new Promise((resolve, reject) => {
            const sql = `
        CREATE TABLE IF NOT EXISTS city_tour_bookings (
          id INT AUTO_INCREMENT PRIMARY KEY,
          city_tour_id INT NULL,
          city_tour_title VARCHAR(255) NULL,
          unit_price DECIMAL(10,2) DEFAULT 0,
          adults INT DEFAULT 0,
          children INT DEFAULT 0,
          full_name VARCHAR(255) NULL,
          email VARCHAR(255) NULL,
          phone VARCHAR(50) NULL,
          notes TEXT NULL,
          total_amount DECIMAL(10,2) DEFAULT 0,
          payment_status VARCHAR(32) DEFAULT 'pending',
          stripe_session_id VARCHAR(255) NULL,
          stripe_payment_intent VARCHAR(255) NULL,
          created_at DATETIME,
          updated_at DATETIME NULL,
          UNIQUE KEY uniq_stripe_session (stripe_session_id)
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
        INSERT INTO city_tour_bookings (
          city_tour_id, city_tour_title, unit_price,
          adults, children,
          full_name, email, phone, notes,
          total_amount, payment_status, stripe_session_id, stripe_payment_intent,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
            const params = [
                record.city_tour_id || null,
                record.city_tour_title || null,
                Number(record.unit_price || 0) || 0,
                Number(record.adults || 0) || 0,
                Number(record.children || 0) || 0,
                record.full_name || null,
                record.email || null,
                record.phone || null,
                record.notes || null,
                Number(record.total_amount || 0) || 0,
                record.payment_status || "pending",
                record.stripe_session_id || null,
                record.stripe_payment_intent || null,
                new Date(),
            ];
            db.query(sql, params, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    },

    listAll() {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM city_tour_bookings ORDER BY created_at DESC`;
            db.query(sql, (err, rows) => {
                if (err) return reject(err);
                resolve(rows || []);
            });
        });
    },

    getByStripeSession(sessionId) {
        return new Promise((resolve, reject) => {
            db.query(
                "SELECT * FROM city_tour_bookings WHERE stripe_session_id = ?",
                [sessionId],
                (err, rows) => {
                    if (err) return reject(err);
                    resolve(rows && rows[0] ? rows[0] : null);
                }
            );
        });
    },

    updatePaymentStatus(id, status) {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE city_tour_bookings SET payment_status = ?, updated_at = ? WHERE id = ?`;
            db.query(sql, [status, new Date(), id], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    },
};

// Auto-ensure on import
CityTourBookingModel.ensureTable()
    .then(() => console.log("🗂️ city_tour_bookings table ensured."))
    .catch((err) => console.error("❌ Failed ensuring city_tour_bookings table:", err));

module.exports = CityTourBookingModel;
