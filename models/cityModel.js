const db = require("../db");

const City = {};

// Create table if not exists
db.query(
    `CREATE TABLE IF NOT EXISTS cities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        image VARCHAR(255) DEFAULT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
    (err) => {
        if (err) console.error("Error creating cities table:", err);
        else console.log("✓ cities table ready");
    }
);

// Get all cities
City.getAll = (callback) => {
    db.query("SELECT * FROM cities ORDER BY name ASC", callback);
};

// Get by ID
City.getById = (id, callback) => {
    db.query("SELECT * FROM cities WHERE id = ?", [id], callback);
};

// Get by name
City.getByName = (name, callback) => {
    db.query("SELECT * FROM cities WHERE name = ?", [name], callback);
};

// Create city
City.create = (data, callback) => {
    db.query("INSERT INTO cities SET ?", data, callback);
};

// Update city
City.update = (id, data, callback) => {
    db.query("UPDATE cities SET ? WHERE id = ?", [data, id], callback);
};

// Delete city
City.delete = (id, callback) => {
    db.query("DELETE FROM cities WHERE id = ?", [id], callback);
};

module.exports = City;
