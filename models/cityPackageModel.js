// const db = require("../db");

// // Auto-create table if not exists
// const createTableQuery = `
//   CREATE TABLE IF NOT EXISTS city_packages (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     title VARCHAR(255) NOT NULL,
//     cityName VARCHAR(255) NOT NULL,
//     categoryId INT DEFAULT NULL,
//     cityImage VARCHAR(255) DEFAULT NULL,
//     locationUrl TEXT DEFAULT NULL,
//     duration VARCHAR(255) DEFAULT NULL,
//     price DECIMAL(10, 2) DEFAULT 0,
//     images TEXT DEFAULT NULL,
//     details LONGTEXT DEFAULT NULL,
//     createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//     FOREIGN KEY (categoryId) REFERENCES city_tour_categories(id) ON DELETE SET NULL
//   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
// `;

// // Initialize table
// db.query(createTableQuery, (err) => {
//     if (err) {
//         console.error("Error creating city_packages table:", err);
//     } else {
//         console.log("City packages table ready");
//     }
// });

// const CityPackage = {
//     // Create new city package
//     create: (data, callback) => {
//         const query = `
//       INSERT INTO city_packages (title, cityName, categoryId, cityImage, locationUrl, duration, price, images, details)
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
//     `;
//         const values = [
//             data.title,
//             data.cityName,
//             data.categoryId || null,
//             data.cityImage || null,
//             data.locationUrl || null,
//             data.duration || null,
//             data.price || 0,
//             data.images || null,
//             data.details || null,
//         ];
//         db.query(query, values, callback);
//     },

//     // Get all city packages
//     getAll: (callback) => {
//         const query = "SELECT * FROM city_packages ORDER BY createdAt DESC";
//         db.query(query, callback);
//     },

//     // Get city package by ID
//     getById: (id, callback) => {
//         const query = "SELECT * FROM city_packages WHERE id = ?";
//         db.query(query, [id], callback);
//     },

//     // Update city package
//     update: (id, data, callback) => {
//         const query = `
//       UPDATE city_packages
//       SET title = ?, cityName = ?, categoryId = ?, cityImage = ?, locationUrl = ?, duration = ?, price = ?, images = ?, details = ?
//       WHERE id = ?
//     `;
//         const values = [
//             data.title,
//             data.cityName,
//             data.categoryId || null,
//             data.cityImage,
//             data.locationUrl || null,
//             data.duration || null,
//             data.price || 0,
//             data.images || null,
//             data.details || null,
//             id,
//         ];
//         db.query(query, values, callback);
//     },

//     // Delete city package
//     delete: (id, callback) => {
//         const query = "DELETE FROM city_packages WHERE id = ?";
//         db.query(query, [id], callback);
//     },
// };

// module.exports = CityPackage;

const db = require("../db");

// Auto-create table if not exists with categoryId column (without foreign key first)
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS city_packages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    cityName VARCHAR(255) NOT NULL,
    categoryId INT DEFAULT NULL,
    cityImage VARCHAR(255) DEFAULT NULL,
    locationUrl TEXT DEFAULT NULL,
    duration VARCHAR(255) DEFAULT NULL,
    price DECIMAL(10, 2) DEFAULT 0,
    images TEXT DEFAULT NULL,
    details LONGTEXT DEFAULT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

// Function to add foreign key constraint after city_tour_categories table exists
const addForeignKey = () => {
    // Check if foreign key already exists
    const checkFKQuery = `
    SELECT COUNT(*) as count 
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
    WHERE TABLE_NAME = 'city_packages' 
    AND COLUMN_NAME = 'categoryId' 
    AND REFERENCED_TABLE_NAME = 'city_tour_categories'
    AND TABLE_SCHEMA = DATABASE()
  `;

    db.query(checkFKQuery, (err, results) => {
        if (err) {
            console.error("Error checking foreign key:", err);
            return;
        }

        if (results[0].count === 0) {
            // Check if city_tour_categories table exists first
            db.query(
                `SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.TABLES 
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'city_tour_categories'`,
                (err, tableResults) => {
                    if (err) {
                        console.error("Error checking city_tour_categories table:", err);
                        return;
                    }

                    if (tableResults[0].count > 0) {
                        // Table exists, add foreign key
                        const addFKQuery = `
                  ALTER TABLE city_packages 
                  ADD CONSTRAINT fk_city_packages_category 
                  FOREIGN KEY (categoryId) REFERENCES city_tour_categories(id) ON DELETE SET NULL
                `;

                        db.query(addFKQuery, (err) => {
                            if (err) {
                                console.error("Error adding foreign key:", err);
                            } else {
                                console.log("✓ Foreign key added to city_packages table");
                            }
                        });
                    } else {
                        // Table doesn't exist yet, try again later
                        setTimeout(addForeignKey, 2000);
                    }
                }
            );
        }
    });
};

// Function to add categoryId column if it doesn't exist
const addCategoryIdColumn = () => {
    const checkColumnQuery = `
    SELECT COUNT(*) as count 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'city_packages' 
    AND COLUMN_NAME = 'categoryId' 
    AND TABLE_SCHEMA = DATABASE()
  `;

    db.query(checkColumnQuery, (err, results) => {
        if (err) {
            console.error("Error checking categoryId column:", err);
            return;
        }

        if (results[0].count === 0) {
            // Column doesn't exist, add it
            const addColumnQuery = `ALTER TABLE city_packages ADD COLUMN categoryId INT DEFAULT NULL`;

            db.query(addColumnQuery, (err) => {
                if (err) {
                    console.error("Error adding categoryId column:", err);
                } else {
                    console.log("✓ categoryId column added to city_packages table");
                    // Try to add foreign key after adding column
                    setTimeout(addForeignKey, 1000);
                }
            });
        } else {
            // Column exists, try to add foreign key
            setTimeout(addForeignKey, 1000);
        }
    });
};

// Initialize table and column (skip if JSON mode)
if (process.env.USE_JSON_DATA !== "true" && process.env.USE_JSON_DATA !== "1") {
    db.query(createTableQuery, (err) => {
        if (err) {
            if (process.env.USE_JSON_DATA !== "true" && process.env.USE_JSON_DATA !== "1") {
                console.error("Error creating city_packages table:", err.message);
            }
        } else {
            console.log("🗂️ city_packages table ensured.");
            // Check and add categoryId column if needed
            setTimeout(addCategoryIdColumn, 1500);
        }
    });
} else {
    console.log("📦 JSON mode: Skipping city_packages table creation");
}

const CityPackage = {
    // Create new city package
    create: (data, callback) => {
        const query = `
      INSERT INTO city_packages (title, cityName, categoryId, cityImage, locationUrl, duration, price, images, details)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
        const values = [
            data.title,
            data.cityName,
            data.categoryId || null,
            data.cityImage || null,
            data.locationUrl || null,
            data.duration || null,
            data.price || 0,
            data.images || null,
            data.details || null,
        ];
        db.query(query, values, callback);
    },

    // Get all city packages
    getAll: (callback) => {
        const query = "SELECT * FROM city_packages ORDER BY createdAt DESC";
        db.query(query, callback);
    },

    // Get city package by ID
    getById: (id, callback) => {
        const query = "SELECT * FROM city_packages WHERE id = ?";
        db.query(query, [id], callback);
    },

    // Update city package
    update: (id, data, callback) => {
        const query = `
      UPDATE city_packages
      SET title = ?, cityName = ?, categoryId = ?, cityImage = ?, locationUrl = ?, duration = ?, price = ?, images = ?, details = ?
      WHERE id = ?
    `;
        const values = [
            data.title,
            data.cityName,
            data.categoryId || null,
            data.cityImage,
            data.locationUrl || null,
            data.duration || null,
            data.price || 0,
            data.images || null,
            data.details || null,
            id,
        ];
        db.query(query, values, callback);
    },

    // Delete city package
    delete: (id, callback) => {
        const query = "DELETE FROM city_packages WHERE id = ?";
        db.query(query, [id], callback);
    },

    // Get packages by city name
    getByCityName: (cityName, callback) => {
        const query = "SELECT * FROM city_packages WHERE LOWER(cityName) = LOWER(?) ORDER BY createdAt DESC";
        db.query(query, [cityName], callback);
    },

    // Get packages by category and city
    getByCategoryAndCity: (categoryId, cityName, callback) => {
        const query = "SELECT * FROM city_packages WHERE categoryId = ? AND LOWER(cityName) = LOWER(?) ORDER BY createdAt DESC";
        db.query(query, [categoryId, cityName], callback);
    },
};

module.exports = CityPackage;