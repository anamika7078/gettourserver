const CityTourCategory = require("../models/cityTourCategoryModel");
const db = require("../db.js");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Create uploads directory if not exists
const uploadDir = path.join(__dirname, "../uploads/categories");
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


// Get all categories
exports.getAllCategories = (req, res) => {
    CityTourCategory.getAll((err, results) => {
        if (err) {
            console.error("Error fetching categories:", err);
            return res.status(500).json({ success: false, error: "Failed to fetch categories" });
        }

        // Ensure id is returned as a number
        const categories = results.map(cat => ({
            ...cat,
            id: parseInt(cat.id, 10)
        }));

        console.log(`✓ Fetched ${categories.length} city tour categories`);
        console.log('Categories:', categories.map(c => ({ id: c.id, name: c.name, idType: typeof c.id })));

        res.json({ success: true, data: categories });
    });
};

// Get category by ID
exports.getCategoryById = (req, res) => {
    const { id } = req.params;
    CityTourCategory.getById(id, (err, results) => {
        if (err) {
            console.error("Error fetching category:", err);
            return res.status(500).json({ error: "Failed to fetch category" });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: "Category not found" });
        }
        res.json(results[0]);
    });
};

// Create category
exports.createCategory = (req, res) => {
    const { name, cityName } = req.body;
    if (!name || !name.trim()) {
        return res.status(400).json({ success: false, error: "Category name is required" });
    }

    let imagePath = null;
    if (req.file) {
        imagePath = req.file.filename;
    }

    const data = {
        name: name.trim(),
        image: imagePath,
        cityName: cityName ? cityName.trim() : null,
    };

    CityTourCategory.create(data, (err, result) => {
        if (err) {
            console.error("Error creating category:", err);
            return res.status(500).json({ success: false, error: "Failed to create category" });
        }
        res.status(201).json({ success: true, message: "Category created successfully", data: { id: result.insertId, ...data } });
    });
};

// Update category
exports.updateCategory = (req, res) => {
    const { id } = req.params;
    const { name, cityName } = req.body;

    if (!name || !name.trim()) {
        return res.status(400).json({ success: false, error: "Category name is required" });
    }

    // Get existing category to access current image
    CityTourCategory.getById(id, (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({
                success: false,
                error: "Category not found",
            });
        }

        const existingCategory = results[0];
        let imagePath = existingCategory.image;

        // If new image uploaded, delete old one
        if (req.file) {
            if (existingCategory.image) {
                const oldImagePath = path.join(uploadDir, existingCategory.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            imagePath = req.file.filename;
        }

        const data = {
            name: name.trim(),
            image: imagePath,
            cityName: typeof cityName === 'string' && cityName.trim() !== '' ? cityName.trim() : existingCategory.cityName || null,
        };

        CityTourCategory.update(id, data, (err) => {
            if (err) {
                console.error("Error updating category:", err);
                return res.status(500).json({ success: false, error: "Failed to update category" });
            }
            res.json({ success: true, message: "Category updated successfully", data: { id: parseInt(id), ...data } });
        });
    });
};

// Delete category
exports.deleteCategory = (req, res) => {
    const { id } = req.params;

    // Get category to access image file
    CityTourCategory.getById(id, (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({
                success: false,
                error: "Category not found",
            });
        }

        const category = results[0];

        // Delete image file if exists
        if (category.image) {
            const imagePath = path.join(uploadDir, category.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        CityTourCategory.delete(id, (err) => {
            if (err) {
                console.error("Error deleting category:", err);
                return res.status(500).json({ success: false, error: "Failed to delete category" });
            }

            // Cascade: unset categoryId on related city packages
            const updatePackagesSql = `UPDATE city_packages SET categoryId = NULL WHERE categoryId = ?`;
            db.query(updatePackagesSql, [id], (updErr, updRes) => {
                if (updErr) {
                    console.error("Error clearing categoryId from city_packages:", updErr);
                    return res.json({ success: true, message: "Category deleted, but failed to clear references" });
                }
                console.log(`✓ Cleared categoryId for ${updRes.affectedRows} city package(s) after category delete`);
                res.json({ success: true, message: "Category deleted successfully", packagesUpdated: updRes.affectedRows });
            });
        });
    });
};


// Get categories by city name from categories table (city-wise categories)
exports.getCategoriesByCity = (req, res) => {
    const { cityName } = req.params;
    if (!cityName) {
        return res.status(400).json({ success: false, error: "City name is required" });
    }
    const query = `
        SELECT * FROM city_tour_categories
        WHERE LOWER(cityName) = LOWER(?)
        ORDER BY name ASC
    `;
    db.query(query, [cityName], (err, results) => {
        if (err) {
            console.error("Error fetching categories by city:", err);
            return res.status(500).json({ success: false, error: "Failed to fetch categories" });
        }
        const categories = results.map(cat => ({ ...cat, id: parseInt(cat.id, 10) }));
        res.json({ success: true, data: categories });
    });
};