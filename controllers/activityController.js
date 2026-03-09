
const ActivityCategoryModel = require("../models/activityCategoryModel.js");
const ActivityModel = require("../models/activityModel.js");

async function addActivity(req, res) {
    try {
        await ActivityModel.ensureTable();

        const { title, locationName, locationLink, price, category, categoryId, details, categoryDetails } = req.body;
        // Support single or multiple uploads
        const cover = req?.files?.cover?.[0]?.filename || req?.files?.image?.[0]?.filename || req?.file?.filename || null;
        const gallery = (req?.files?.images || []).map((f) => f.filename);
        const videos = (req?.files?.videos || []).map((f) => f.filename);

        let videoLinks = [];
        if (typeof req.body.videoLinks === "string") {
            try {
                videoLinks = JSON.parse(req.body.videoLinks);
            } catch {
                videoLinks = req.body.videoLinks
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean);
            }
        } else if (Array.isArray(req.body.videoLinks)) {
            videoLinks = req.body.videoLinks;
        }

        // Optionally sync category name by id
        let categoryName = category || "";
        let catId = categoryId ? Number(categoryId) : undefined;
        if (catId) {
            try {
                const cat = await ActivityCategoryModel.getById(catId);
                if (cat) categoryName = cat.name;
            } catch { }
        }

        // Optionally update category details if provided
        if (catId && typeof categoryDetails === "string") {
            try {
                await ActivityCategoryModel.update(catId, { details: categoryDetails });
            } catch { }
        }

        const data = {
            title: title || "",
            location_name: locationName || "",
            location_link: locationLink || "",
            price: price || "",
            category: categoryName,
            category_id: catId,
            details: details || "",
            image: cover,
            images: JSON.stringify(gallery),
            videos: JSON.stringify(videos),
            video_links: JSON.stringify(videoLinks),
            created_at: new Date(),
        };

        const result = await ActivityModel.insertActivity(data);
        return res.json({ success: true, insertId: result.insertId });
    } catch (err) {
        console.error("addActivity error:", err);
        return res.status(500).json({ success: false, error: err.message || "Server error" });
    }
}

async function getActivities(_req, res) {
    try {
        // Try to use JSON data if enabled
        const { getJsonData } = require("../utils/jsonDataLoader");
        const jsonData = getJsonData("activities");
        if (jsonData && jsonData.length > 0) {
            return res.json(jsonData);
        }
        
        // Fallback to database
        await ActivityModel.ensureTable();
        const rows = await ActivityModel.getAll();
        return res.json(rows || []);
    } catch (err) {
        console.error("getActivities error:", err);
        // Try JSON as last resort
        const { getJsonData } = require("../utils/jsonDataLoader");
        const jsonData = getJsonData("activities");
        if (jsonData && jsonData.length > 0) {
            return res.json(jsonData);
        }
        return res.status(500).json({ success: false, error: err.message || "Server error" });
    }
}

async function getActivityById(req, res) {
    try {
        await ActivityModel.ensureTable();
        const id = req.params.id;
        const row = await ActivityModel.getById(id);
        if (!row) return res.status(404).json({ success: false, error: "Activity not found" });
        return res.json(row);
    } catch (err) {
        console.error("getActivityById error:", err);
        return res.status(500).json({ success: false, error: err.message || "Server error" });
    }
}

async function updateActivity(req, res) {
    try {
        await ActivityModel.ensureTable();
        const id = req.params.id;

        const existing = await ActivityModel.getById(id);
        if (!existing) return res.status(404).json({ success: false, error: "Activity not found" });

        const { title, locationName, locationLink, price, category, categoryId, details, categoryDetails } = req.body;

        // Accept both single and multiple uploads
        const cover = req?.files?.cover?.[0]?.filename || req?.files?.image?.[0]?.filename || req?.file?.filename;
        const gallery = (req?.files?.images || []).map((f) => f.filename);
        const videos = (req?.files?.videos || []).map((f) => f.filename);

        let videoLinks;
        if (typeof req.body.videoLinks === "string") {
            try {
                videoLinks = JSON.parse(req.body.videoLinks);
            } catch {
                videoLinks = req.body.videoLinks
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean);
            }
        } else if (Array.isArray(req.body.videoLinks)) {
            videoLinks = req.body.videoLinks;
        }

        // Resolve category name by id if provided
        let categoryName = category ?? existing.category;
        let catId = categoryId !== undefined ? Number(categoryId) : existing.category_id;
        if (catId) {
            try {
                const cat = await ActivityCategoryModel.getById(catId);
                if (cat) categoryName = cat.name;
            } catch { }
        }

        // Optionally update category details
        if (catId && typeof categoryDetails === "string") {
            try {
                await ActivityCategoryModel.update(catId, { details: categoryDetails });
            } catch { }
        }

        const data = {
            title: title ?? existing.title,
            location_name: locationName ?? existing.location_name,
            location_link: locationLink ?? existing.location_link,
            price: price ?? existing.price,
            category: categoryName,
            category_id: catId,
            details: details ?? existing.details,
            image: cover !== undefined ? cover : existing.image,
            images: gallery.length ? JSON.stringify(gallery) : undefined,
            videos: videos.length ? JSON.stringify(videos) : undefined,
            video_links: videoLinks !== undefined ? JSON.stringify(videoLinks) : undefined,
        };

        const result = await ActivityModel.updateActivity(id, data);
        return res.json({ success: true, affectedRows: result.affectedRows });
    } catch (err) {
        console.error("updateActivity error:", err);
        return res.status(500).json({ success: false, error: err.message || "Server error" });
    }
}

async function deleteActivity(req, res) {
    try {
        await ActivityModel.ensureTable();
        const id = req.params.id;
        const result = await ActivityModel.deleteById(id);
        if (result.affectedRows > 0) return res.json({ success: true });
        return res.status(404).json({ success: false, error: "Activity not found" });
    } catch (err) {
        console.error("deleteActivity error:", err);
        return res.status(500).json({ success: false, error: err.message || "Server error" });
    }
}

// ✅ CommonJS Exports
module.exports = {
    addActivity,
    getActivities,
    getActivityById,
    updateActivity,
    deleteActivity,
};
