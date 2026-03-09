const City = require("../models/cityModel");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("../db.js");

// Create uploads directory if not exists
const uploadDir = path.join(__dirname, "../uploads/cities");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration for image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(
            path.extname(file.originalname).toLowerCase()
        );
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed"));
        }
    },
});

// Multer middleware
exports.uploadImage = upload.single("image");

// Get all cities
exports.getAllCities = (req, res) => {
    // Try JSON data first if enabled
    const { getJsonData } = require("../utils/jsonDataLoader");
    const jsonData = getJsonData("cities");
    if (jsonData && jsonData.length > 0) {
        return res.json({ success: true, data: jsonData });
    }
    
    // Fallback to database
    City.getAll((err, results) => {
        if (err) {
            console.error("Error fetching cities:", err);
            // Try JSON as last resort
            const { getJsonData } = require("../utils/jsonDataLoader");
            const jsonData = getJsonData("cities");
            if (jsonData && jsonData.length > 0) {
                return res.json({ success: true, data: jsonData });
            }
            return res.status(500).json({
                success: false,
                error: "Failed to fetch cities"
            });
        }

        const cities = results.map(city => ({
            ...city,
            id: parseInt(city.id, 10)
        }));

        console.log(`✓ Fetched ${cities.length} cities`);

        res.json({ success: true, data: cities });
    });
};

// Get city by ID
exports.getCityById = (req, res) => {
    const { id } = req.params;
    City.getById(id, (err, results) => {
        if (err) {
            console.error("Error fetching city:", err);
            return res.status(500).json({
                success: false,
                error: "Failed to fetch city"
            });
        }
        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                error: "City not found"
            });
        }
        res.json({ success: true, data: results[0] });
    });
};

// Create city
exports.createCity = (req, res) => {
    const { name } = req.body;

    if (!name || !name.trim()) {
        return res.status(400).json({
            success: false,
            error: "City name is required"
        });
    }

    let imagePath = null;
    if (req.file) {
        imagePath = req.file.filename;
    }

    const data = {
        name: name.trim(),
        image: imagePath,
    };

    City.create(data, (err, result) => {
        if (err) {
            console.error("Error creating city:", err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({
                    success: false,
                    error: "City already exists"
                });
            }
            return res.status(500).json({
                success: false,
                error: "Failed to create city"
            });
        }
        res.status(201).json({
            success: true,
            message: "City created successfully",
            data: { id: result.insertId, ...data }
        });
    });
};

// Update city
exports.updateCity = (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
        return res.status(400).json({
            success: false,
            error: "City name is required"
        });
    }

    // Get existing city to access current image
    City.getById(id, (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({
                success: false,
                error: "City not found",
            });
        }

        const existingCity = results[0];
        let imagePath = existingCity.image;

        // If new image uploaded, delete old one
        if (req.file) {
            if (existingCity.image) {
                const oldImagePath = path.join(uploadDir, existingCity.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            imagePath = req.file.filename;
        }

        const data = {
            name: name.trim(),
            image: imagePath,
        };

        City.update(id, data, (err) => {
            if (err) {
                console.error("Error updating city:", err);
                return res.status(500).json({
                    success: false,
                    error: "Failed to update city"
                });
            }
            res.json({
                success: true,
                message: "City updated successfully",
                data: { id: parseInt(id), ...data }
            });
        });
    });
};

// Delete city (with cascade delete of its categories)
exports.deleteCity = (req, res) => {
    const { id } = req.params;

    // Get city to access image file
    City.getById(id, (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({
                success: false,
                error: "City not found",
            });
        }

        const city = results[0];

        const cityName = city.name;

        // Delete related categories (by cityName) first
        const categoriesDir = path.join(__dirname, "../uploads/categories");
        const selectCategoriesSql = `SELECT id, image FROM city_tour_categories WHERE LOWER(cityName) = LOWER(?)`;
        db.query(selectCategoriesSql, [cityName], (catErr, catRows) => {
            if (catErr) {
                console.error("Error selecting categories for cascade delete:", catErr);
                // Proceed anyway with city deletion to avoid blocking
                return proceedCityDelete(city, cityName, []);
            }

            // Remove category images
            catRows.forEach((cat) => {
                if (cat.image) {
                    const catImgPath = path.join(categoriesDir, cat.image);
                    if (fs.existsSync(catImgPath)) {
                        try { fs.unlinkSync(catImgPath); } catch (unlinkErr) { console.warn("Failed to delete category image:", unlinkErr.message); }
                    }
                }
            });

            const deleteCategoriesSql = `DELETE FROM city_tour_categories WHERE LOWER(cityName) = LOWER(?)`;
            db.query(deleteCategoriesSql, [cityName], (delCatErr, delCatRes) => {
                if (delCatErr) {
                    console.error("Error deleting categories for city:", delCatErr);
                } else {
                    console.log(`✓ Deleted ${delCatRes.affectedRows} categories for city '${cityName}'`);
                }
                proceedCityDelete(city, cityName, catRows);
            });
        });

        function proceedCityDelete(cityRecord, cityNameVal, deletedCategoryRows) {
            // Delete city image if exists
            if (cityRecord.image) {
                const imagePath = path.join(uploadDir, cityRecord.image);
                if (fs.existsSync(imagePath)) {
                    try { fs.unlinkSync(imagePath); } catch (e) { console.warn("Failed to delete city image:", e.message); }
                }
            }

            City.delete(id, (err2) => {
                if (err2) {
                    console.error("Error deleting city:", err2);
                    return res.status(500).json({
                        success: false,
                        error: "Failed to delete city"
                    });
                }
                res.json({
                    success: true,
                    message: "City and related categories deleted successfully",
                    data: {
                        cityId: parseInt(id, 10),
                        cityName: cityNameVal,
                        categoriesDeleted: deletedCategoryRows.length
                    }
                });
            });
        }
    });
};
