const CityPackage = require("../models/cityPackageModel");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Create uploads directory if not exists
const uploadDir = path.join(__dirname, "../uploads/city-packages");
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
exports.uploadImages = upload.fields([
    { name: "cityImage", maxCount: 1 },
    { name: "images", maxCount: 20 },
    { name: "newImages", maxCount: 20 },
]);

// Create city package
exports.createCityPackage = (req, res) => {
    try {
        const { title, cityName, categoryId, locationUrl, duration, price, details } = req.body;

        // Validation
        if (!title || !cityName) {
            return res.status(400).json({
                success: false,
                error: "Title and City Name are required",
            });
        }

        // Handle city image
        let cityImagePath = null;
        if (req.files && req.files.cityImage && req.files.cityImage[0]) {
            cityImagePath = req.files.cityImage[0].filename;
        }

        // Handle multiple images
        let imagesPaths = [];
        if (req.files && req.files.images) {
            imagesPaths = req.files.images.map((file) => file.filename);
        }

        const cityPackageData = {
            title,
            cityName,
            categoryId: categoryId && categoryId !== '' ? parseInt(categoryId) : null,
            cityImage: cityImagePath,
            locationUrl,
            duration,
            price: parseFloat(price) || 0,
            images: JSON.stringify(imagesPaths),
            details,
        };

        CityPackage.create(cityPackageData, (err, result) => {
            if (err) {
                console.error("Error creating city package:", err);
                return res.status(500).json({
                    success: false,
                    error: "Failed to create city package",
                });
            }

            res.status(201).json({
                success: true,
                message: "City package created successfully",
                data: { id: result.insertId, ...cityPackageData },
            });
        });
    } catch (error) {
        console.error("Error in createCityPackage:", error);
        res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
};

// Get all city packages
exports.getAllCityPackages = (req, res) => {
    const { getJsonData, shouldPreferJsonData } = require("../utils/jsonDataLoader");
    
    // Helper function to process packages
    const processPackages = (packages) => {
        return packages.map((pkg) => {
            try {
                pkg.images = pkg.images ? JSON.parse(pkg.images) : [];
            } catch (e) {
                pkg.images = [];
            }
            if (pkg.categoryId !== null && pkg.categoryId !== undefined) {
                pkg.categoryId = parseInt(pkg.categoryId, 10);
            }
            return pkg;
        });
    };
    
    // If JSON mode is enabled, use JSON first and skip database
    if (shouldPreferJsonData()) {
        const jsonData = getJsonData("cityPackages");
        if (jsonData && jsonData.length > 0) {
            const packages = processPackages(jsonData);
            console.log("✓ Serving city packages from JSON data");
            return res.status(200).json({
                success: true,
                data: packages,
            });
        }
    }
    
    // Try database (only if JSON mode is not enabled or JSON data is empty)
    CityPackage.getAll((err, results) => {
        if (err) {
            console.warn("Database error, trying JSON fallback:", err.message);
            // Try JSON as fallback
            const jsonData = getJsonData("cityPackages", true);
            if (jsonData && jsonData.length > 0) {
                const packages = processPackages(jsonData);
                console.log("✓ Serving city packages from JSON fallback");
                return res.status(200).json({
                    success: true,
                    data: packages,
                });
            }
            return res.status(500).json({
                success: false,
                error: "Failed to fetch city packages",
            });
        }

        // Parse images JSON for each package
        const packages = results.map((pkg) => {
            try {
                pkg.images = pkg.images ? JSON.parse(pkg.images) : [];
            } catch (e) {
                pkg.images = [];
            }
            // Ensure categoryId is returned as a number
            if (pkg.categoryId !== null && pkg.categoryId !== undefined) {
                pkg.categoryId = parseInt(pkg.categoryId, 10);
            }
            return pkg;
        });

        console.log(`✓ Fetched ${packages.length} city packages`);
        console.log('Sample package data:', packages.length > 0 ? {
            id: packages[0].id,
            title: packages[0].title,
            cityName: packages[0].cityName,
            categoryId: packages[0].categoryId,
            categoryIdType: typeof packages[0].categoryId
        } : 'No packages');

        res.status(200).json({
            success: true,
            data: packages,
        });
    });
};

// Get city package by ID
exports.getCityPackageById = (req, res) => {
    const { id } = req.params;

    CityPackage.getById(id, (err, results) => {
        if (err) {
            console.error("Error fetching city package:", err);
            return res.status(500).json({
                success: false,
                error: "Failed to fetch city package",
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                error: "City package not found",
            });
        }

        const pkg = results[0];
        try {
            pkg.images = pkg.images ? JSON.parse(pkg.images) : [];
        } catch (e) {
            pkg.images = [];
        }

        // Ensure categoryId is returned as a number
        if (pkg.categoryId !== null && pkg.categoryId !== undefined) {
            pkg.categoryId = parseInt(pkg.categoryId, 10);
        }

        res.status(200).json({
            success: true,
            data: pkg,
        });
    });
};

// Update city package
exports.updateCityPackage = (req, res) => {
    try {
        const { id } = req.params;
        const { title, cityName, categoryId, locationUrl, duration, price, details, keepImages } =
            req.body;

        // First, get existing package to access current images
        CityPackage.getById(id, (err, results) => {
            if (err || results.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: "City package not found",
                });
            }

            const existingPackage = results[0];
            let existingImages = [];
            try {
                existingImages = existingPackage.images
                    ? JSON.parse(existingPackage.images)
                    : [];
            } catch (e) {
                existingImages = [];
            }

            // Handle city image update
            let cityImagePath = existingPackage.cityImage;
            if (req.files && req.files.cityImage && req.files.cityImage[0]) {
                // Delete old city image if exists
                if (existingPackage.cityImage) {
                    const oldCityImagePath = path.join(uploadDir, existingPackage.cityImage);
                    if (fs.existsSync(oldCityImagePath)) {
                        fs.unlinkSync(oldCityImagePath);
                    }
                }
                cityImagePath = req.files.cityImage[0].filename;
            }

            // Handle images to keep
            let keptImages = [];
            if (keepImages) {
                try {
                    keptImages = JSON.parse(keepImages);
                    if (!Array.isArray(keptImages)) keptImages = [];
                } catch (e) {
                    keptImages = [];
                }
            }

            // Delete images that are not being kept
            existingImages.forEach((img) => {
                if (!keptImages.includes(img)) {
                    const imgPath = path.join(uploadDir, img);
                    if (fs.existsSync(imgPath)) {
                        fs.unlinkSync(imgPath);
                    }
                }
            });

            // Add new images
            let newImagesPaths = [];
            if (req.files && req.files.newImages) {
                newImagesPaths = req.files.newImages.map((file) => file.filename);
            }

            // Combine kept images and new images
            const allImages = [...keptImages, ...newImagesPaths];

            const updateData = {
                title,
                cityName,
                categoryId: categoryId && categoryId !== '' ? parseInt(categoryId) : null,
                cityImage: cityImagePath,
                locationUrl,
                duration,
                price: parseFloat(price) || 0,
                images: JSON.stringify(allImages),
                details,
            };

            CityPackage.update(id, updateData, (err, result) => {
                if (err) {
                    console.error("Error updating city package:", err);
                    return res.status(500).json({
                        success: false,
                        error: "Failed to update city package",
                    });
                }

                res.status(200).json({
                    success: true,
                    message: "City package updated successfully",
                    data: { id, ...updateData },
                });
            });
        });
    } catch (error) {
        console.error("Error in updateCityPackage:", error);
        res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
};

// Delete city package
exports.deleteCityPackage = (req, res) => {
    const { id } = req.params;

    // First, get the package to access image files
    CityPackage.getById(id, (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({
                success: false,
                error: "City package not found",
            });
        }

        const pkg = results[0];

        // Delete city image file if exists
        if (pkg.cityImage) {
            const cityImagePath = path.join(uploadDir, pkg.cityImage);
            if (fs.existsSync(cityImagePath)) {
                fs.unlinkSync(cityImagePath);
            }
        }

        // Delete package images
        try {
            const images = pkg.images ? JSON.parse(pkg.images) : [];
            images.forEach((img) => {
                const imgPath = path.join(uploadDir, img);
                if (fs.existsSync(imgPath)) {
                    fs.unlinkSync(imgPath);
                }
            });
        } catch (e) {
            console.error("Error deleting images:", e);
        }

        // Delete from database
        CityPackage.delete(id, (err, result) => {
            if (err) {
                console.error("Error deleting city package:", err);
                return res.status(500).json({
                    success: false,
                    error: "Failed to delete city package",
                });
            }

            res.status(200).json({
                success: true,
                message: "City package deleted successfully",
            });
        });
    });
};
