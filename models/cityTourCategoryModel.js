const db = require("../db");

const CityTourCategory = {};

// Create table if not exists with image field
db.query(
    `CREATE TABLE IF NOT EXISTS city_tour_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        image VARCHAR(255) DEFAULT NULL,
        cityName VARCHAR(255) DEFAULT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
    (err) => {
        if (err) console.error("Error creating city_tour_categories table:", err);
        else console.log("✓ city_tour_categories table ready");
    }
);

// Add image column if it doesn't exist
const addImageColumn = () => {
    const checkColumnQuery = `
    SELECT COUNT(*) as count 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'city_tour_categories' 
    AND COLUMN_NAME = 'image' 
    AND TABLE_SCHEMA = DATABASE()
  `;

    db.query(checkColumnQuery, (err, results) => {
        if (err) {
            console.error("Error checking image column:", err);
            return;
        }

        if (results[0].count === 0) {
            const addColumnQuery = `ALTER TABLE city_tour_categories ADD COLUMN image VARCHAR(255) DEFAULT NULL`;
            db.query(addColumnQuery, (err) => {
                if (err) {
                    console.error("Error adding image column:", err);
                } else {
                    console.log("✓ image column added to city_tour_categories table");
                }
            });
        }
    });
};

// Check and add image column
setTimeout(addImageColumn, 1000);

// Add cityName column if it doesn't exist
const addCityNameColumn = () => {
    const checkColumnQuery = `
    SELECT COUNT(*) as count 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'city_tour_categories' 
    AND COLUMN_NAME = 'cityName' 
    AND TABLE_SCHEMA = DATABASE()
  `;

    db.query(checkColumnQuery, (err, results) => {
        if (err) {
            console.error("Error checking cityName column:", err);
            return;
        }

        if (results[0].count === 0) {
            const addColumnQuery = `ALTER TABLE city_tour_categories ADD COLUMN cityName VARCHAR(255) DEFAULT NULL`;
            db.query(addColumnQuery, (err) => {
                if (err) {
                    console.error("Error adding cityName column:", err);
                } else {
                    console.log("✓ cityName column added to city_tour_categories table");
                }
            });
        }
    });
};

setTimeout(addCityNameColumn, 1200);

// Get all categories
CityTourCategory.getAll = (callback) => {
    db.query("SELECT * FROM city_tour_categories ORDER BY name ASC", callback);
};

// Get by ID
CityTourCategory.getById = (id, callback) => {
    db.query("SELECT * FROM city_tour_categories WHERE id = ?", [id], callback);
};

// Create category
CityTourCategory.create = (data, callback) => {
    db.query("INSERT INTO city_tour_categories SET ?", data, callback);
};

// Update category
CityTourCategory.update = (id, data, callback) => {
    db.query("UPDATE city_tour_categories SET ? WHERE id = ?", [data, id], callback);
};

// Delete category
CityTourCategory.delete = (id, callback) => {
    db.query("DELETE FROM city_tour_categories WHERE id = ?", [id], callback);
};

module.exports = CityTourCategory;
