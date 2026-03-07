// const express = require("express");
// const router = express.Router();
// const {
//     getAllCategories,
//     getCategoryById,
//     createCategory,
//     updateCategory,
//     deleteCategory,
// } = require("../controllers/cityTourCategoryController");

// router.get("/", getAllCategories);
// router.get("/:id", getCategoryById);
// router.post("/", createCategory);
// router.put("/:id", updateCategory);
// router.delete("/:id", deleteCategory);

// module.exports = router;


const express = require("express");
const router = express.Router();
const {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoriesByCity, // Add this
    uploadImage // Add this
} = require("../controllers/cityTourCategoryController");

router.get("/", getAllCategories);
router.get("/by-city/:cityName", getCategoriesByCity); // City-wise categories
router.get("/:id", getCategoryById);
router.post("/", uploadImage, createCategory); // Add uploadImage middleware
router.put("/:id", uploadImage, updateCategory); // Add uploadImage middleware
router.delete("/:id", deleteCategory);

module.exports = router;