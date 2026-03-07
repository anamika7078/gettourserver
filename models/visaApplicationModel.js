

// const db = require("../db.js");
const db = require("../db.js");

const VisaApplicationModel = {
    ensureTable() {
        return new Promise((resolve, reject) => {
            const sql = `
        CREATE TABLE IF NOT EXISTS visa_applications (
          id INT AUTO_INCREMENT PRIMARY KEY,
          visa_id INT NULL,
          country VARCHAR(150) NULL,
          subject VARCHAR(150) NULL,
          price_per_person DECIMAL(10,2) DEFAULT 0,
          travel_date DATE NULL,
          total_passengers INT DEFAULT 1,
          notes TEXT NULL,
          lead_title VARCHAR(10) NULL,
          lead_first_name VARCHAR(100) NULL,
          lead_last_name VARCHAR(100) NULL,
          lead_email VARCHAR(255) NULL,
          lead_isd VARCHAR(10) NULL,
          lead_phone VARCHAR(50) NULL,
          lead_nationality VARCHAR(100) NULL,
          extra_passengers JSON NULL,
          payment_status VARCHAR(32) DEFAULT 'pending',
          stripe_session_id VARCHAR(255) NULL,
          stripe_payment_intent VARCHAR(255) NULL,
          created_at DATETIME,
          updated_at DATETIME NULL,
          UNIQUE KEY uniq_visa_stripe_session (stripe_session_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `;
            db.query(sql, (err, result) => {
                if (err) return reject(err);
                const alters = [
                    "ALTER TABLE visa_applications ADD COLUMN IF NOT EXISTS payment_status VARCHAR(32) DEFAULT 'pending'",
                    "ALTER TABLE visa_applications ADD COLUMN IF NOT EXISTS stripe_session_id VARCHAR(255) NULL",
                    "ALTER TABLE visa_applications ADD COLUMN IF NOT EXISTS stripe_payment_intent VARCHAR(255) NULL",
                    "ALTER TABLE visa_applications ADD UNIQUE KEY uniq_visa_stripe_session (stripe_session_id)",
                ];
                const runNext = (i = 0) => {
                    if (i >= alters.length) return resolve(result);
                    db.query(alters[i], () => runNext(i + 1));
                };
                runNext(0);
            });
        });
    },

    // createPaid(app) {
    //     return new Promise((resolve, reject) => {
    //         const sql = `
    //     INSERT INTO visa_applications (
    //       visa_id, country, subject, price_per_person,
    //       travel_date, total_passengers, notes,
    //       lead_title, lead_first_name, lead_last_name, lead_email, lead_isd, lead_phone, lead_nationality,
    //       extra_passengers,
    //       payment_status, stripe_session_id, stripe_payment_intent,
    //       created_at
    //     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    //   `;
    //         const params = [
    //             app.visa_id || null,
    //             app.country || null,
    //             app.subject || null,
    //             Number(app.price_per_person || 0) || 0,
    //             app.travel_date || null,
    //             Number(app.total_passengers || 1) || 1,
    //             app.notes || null,
    //             app.lead_title || null,
    //             app.lead_first_name || null,
    //             app.lead_last_name || null,
    //             app.lead_email || null,
    //             app.lead_isd || null,
    //             app.lead_phone || null,
    //             app.lead_nationality || null,
    //             app.extra_passengers ? JSON.stringify(app.extra_passengers) : null,
    //             app.payment_status || 'pending',
    //             app.stripe_session_id || null,
    //             app.stripe_payment_intent || null,
    //             new Date(),
    //         ];
    //         db.query(sql, params, (err, result) => {
    //             if (err) return reject(err);
    //             resolve(result);
    //         });
    //     });
    // },
    // In visaApplicationModel.js, update the createPaid method
    async createPaid(app) {
        // Ensure table exists before inserting
        await this.ensureTable();

        return new Promise((resolve, reject) => {
            const sql = `
      INSERT INTO visa_applications (
        visa_id, country, subject, price_per_person,
        travel_date, total_passengers, notes,
        lead_title, lead_first_name, lead_last_name, lead_email, lead_isd, lead_phone, lead_nationality,
        extra_passengers,
        passengers,
        payment_status, stripe_session_id, stripe_payment_intent,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

            // Ensure passengers data is properly formatted
            let passengersData = null;
            let extraPassengersData = null;

            try {
                if (app.passengers && Array.isArray(app.passengers)) {
                    passengersData = JSON.stringify(app.passengers);
                    extraPassengersData = JSON.stringify(app.passengers);
                } else if (app.extra_passengers && Array.isArray(app.extra_passengers)) {
                    passengersData = JSON.stringify(app.extra_passengers);
                    extraPassengersData = JSON.stringify(app.extra_passengers);
                }
            } catch (error) {
                console.error("Error stringifying passengers data:", error);
            }

            const params = [
                app.visa_id || null,
                app.country || null,
                app.subject || null,
                Number(app.price_per_person || 0) || 0,
                app.travel_date || null,
                Number(app.total_passengers || 1) || 1,
                app.notes || null,
                app.lead_title || null,
                app.lead_first_name || null,
                app.lead_last_name || null,
                app.lead_email || null,
                app.lead_isd || null,
                app.lead_phone || null,
                app.lead_nationality || null,
                extraPassengersData,
                passengersData, // Store in both fields for compatibility
                app.payment_status || 'pending',
                app.stripe_session_id || null,
                app.stripe_payment_intent || null,
                new Date(),
            ];

            console.log("💾 Saving visa application to database...");
            console.log("Passengers data being saved:", passengersData);

            db.query(sql, params, (err, result) => {
                if (err) {
                    console.error("❌ Error saving visa application:", err.message);
                    return reject(err);
                }
                console.log(`✅ Visa application saved successfully (ID: ${result.insertId})`);
                console.log(`📊 Passengers count: ${app.passengers ? app.passengers.length : 0}`);
                resolve(result);
            });
        });
    },

    getByStripeSession(sessionId) {
        return new Promise((resolve, reject) => {
            db.query(
                "SELECT * FROM visa_applications WHERE stripe_session_id = ?",
                [sessionId],
                (err, rows) => {
                    if (err) return reject(err);
                    resolve(rows && rows[0] ? rows[0] : null);
                }
            );
        });
    },

    // Safe JSON parsing function
    safeJsonParse(str) {
        try {
            if (!str || typeof str !== 'string') return null;
            // Check if it's already an object (from previous failed attempts)
            if (str === '[object Object]' || str === 'null' || str === 'undefined') {
                return null;
            }
            return JSON.parse(str);
        } catch (error) {
            console.error('JSON parse error:', error, 'String:', str);
            return null;
        }
    },

    getAll() {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM visa_applications ORDER BY created_at DESC";
            db.query(sql, (err, rows) => {
                if (err) return reject(err);
                // Parse extra_passengers JSON safely
                const applications = rows.map(row => ({
                    ...row,
                    extra_passengers: this.safeJsonParse(row.extra_passengers)
                }));
                resolve(applications);
            });
        });
    },

    getById(id) {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM visa_applications WHERE id = ?";
            db.query(sql, [id], (err, rows) => {
                if (err) return reject(err);
                if (rows.length === 0) return resolve(null);
                const application = rows[0];
                // Parse extra_passengers JSON safely
                application.extra_passengers = this.safeJsonParse(application.extra_passengers);
                resolve(application);
            });
        });
    },

    updateStatus(id, status) {
        return new Promise((resolve, reject) => {
            const sql = "UPDATE visa_applications SET payment_status = ?, updated_at = ? WHERE id = ?";
            db.query(sql, [status, new Date(), id], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    },

    // Method to fix existing corrupted data
    fixCorruptedExtraPassengers() {
        return new Promise((resolve, reject) => {
            const sql = "SELECT id, extra_passengers FROM visa_applications WHERE extra_passengers IS NOT NULL";
            db.query(sql, (err, rows) => {
                if (err) return reject(err);

                const updates = rows.map(row => {
                    return new Promise((resolveUpdate, rejectUpdate) => {
                        let fixedValue = null;

                        // Check if the value is corrupted
                        if (row.extra_passengers === '[object Object]' ||
                            row.extra_passengers === 'null' ||
                            row.extra_passengers === 'undefined') {
                            fixedValue = null;
                        } else {
                            // Try to parse it safely
                            try {
                                const parsed = JSON.parse(row.extra_passengers);
                                fixedValue = row.extra_passengers; // It's already valid JSON
                            } catch (e) {
                                fixedValue = null; // Invalid JSON, set to null
                            }
                        }

                        if (fixedValue !== row.extra_passengers) {
                            const updateSql = "UPDATE visa_applications SET extra_passengers = ? WHERE id = ?";
                            db.query(updateSql, [fixedValue, row.id], (err, result) => {
                                if (err) return rejectUpdate(err);
                                resolveUpdate(result);
                            });
                        } else {
                            resolveUpdate(null);
                        }
                    });
                });

                Promise.all(updates)
                    .then(results => resolve(results))
                    .catch(error => reject(error));
            });
        });
    },

    // In visaApplicationModel.js, add this method
    async verifyAndFixSchema() {
        await this.ensureTable();

        return new Promise((resolve, reject) => {
            console.log("🔧 Verifying database schema...");

            // Check if passengers column exists and has correct data
            const checkSql = `
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'visa_applications' 
      AND TABLE_SCHEMA = DATABASE()
      AND COLUMN_NAME IN ('passengers', 'extra_passengers')
    `;

            db.query(checkSql, (err, results) => {
                if (err) {
                    console.error("❌ Error checking schema:", err.message);
                    return reject(err);
                }

                console.log("📊 Current columns found:", results);

                // If passengers column doesn't exist, add it
                const passengersColumnExists = results.some(col => col.COLUMN_NAME === 'passengers');

                if (!passengersColumnExists) {
                    console.log("🔄 Adding missing passengers column...");
                    const alterSql = "ALTER TABLE visa_applications ADD COLUMN passengers JSON NULL AFTER extra_passengers";

                    db.query(alterSql, (alterErr) => {
                        if (alterErr) {
                            console.error("❌ Error adding passengers column:", alterErr.message);
                        } else {
                            console.log("✅ Added passengers column successfully");
                        }
                        resolve();
                    });
                } else {
                    console.log("✅ All required columns exist");
                    resolve();
                }
            });
        });
    }
};

module.exports = VisaApplicationModel;