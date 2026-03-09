// // import {
// //     ensureHeroImagesTable,
// //     getHeroImagesByPage,
// //     upsertHeroImages,
// // } from "../models/heroImagesModel.js";
// const {
//     ensureHeroImagesTable,
//     getHeroImagesByPage,
//     upsertHeroImages,
// } = require("../models/heroImagesModel.js");

// ensureHeroImagesTable();

// function publicUrlFor(page, filename, req) {
//     if (!filename) return null;
//     // Return relative URL so frontend can prefix with API base
//     const rel = `/uploads/heroes/${page}/${filename}`;
//     return rel;
// }

// export async function getHeroImages(req, res) {
//     try {
//         const page = req.params.page;
//         const row = await getHeroImagesByPage(page);
//         if (!row) {
//             return res.json({ success: true, data: { page, images: [] } });
//         }
//         const images = [row.image1, row.image2, row.image3, row.image4]
//             .filter(Boolean)
//             .map((f) => publicUrlFor(page, f, req));
//         res.json({ success: true, data: { page, images } });
//     } catch (e) {
//         console.error(e);
//         res.status(500).json({ success: false, message: "Server error" });
//     }
// }

// export async function updateHeroImages(req, res) {
//     try {
//         const page = req.params.page;
//         const files = req.files || {};
//         // Fetch current row to preserve other images if not replaced
//         const existing = await getHeroImagesByPage(page);

//         const nextImages = {
//             image1: files.image1?.[0]?.filename || null,
//             image2: files.image2?.[0]?.filename || null,
//             image3: files.image3?.[0]?.filename || null,
//             image4: files.image4?.[0]?.filename || null,
//         };

//         // If no new file for a slot, keep the previous filename
//         if (existing) {
//             nextImages.image1 = nextImages.image1 || existing.image1 || null;
//             nextImages.image2 = nextImages.image2 || existing.image2 || null;
//             nextImages.image3 = nextImages.image3 || existing.image3 || null;
//             nextImages.image4 = nextImages.image4 || existing.image4 || null;
//         }

//         await upsertHeroImages(page, nextImages);

//         const urls = [nextImages.image1, nextImages.image2, nextImages.image3, nextImages.image4]
//             .filter(Boolean)
//             .map((f) => publicUrlFor(page, f, req));

//         res.json({ success: true, message: "Hero images updated", data: { page, images: urls } });
//     } catch (e) {
//         console.error(e);
//         res.status(500).json({ success: false, message: "Server error" });
//     }
// }


// const {
//     ensureHeroImagesTable,
//     getHeroImagesByPage,
//     upsertHeroImages,
// } = require("../models/heroImagesModel.js");

const {
    ensureHeroImagesTable,
    getHeroImagesByPage,
    upsertHeroImages,
} = require("../models/heroImagesModel.js");

// Ensure table exists (skip if JSON mode)
if (process.env.USE_JSON_DATA !== "true" && process.env.USE_JSON_DATA !== "1") {
    ensureHeroImagesTable();
}

function publicUrlFor(page, filename, req) {
    if (!filename) return null;
    // Return relative URL so frontend can prefix with API base
    const rel = `/uploads/heroes/${page}/${filename}`;
    return rel;
}

const getHeroImages = async (req, res) => {
    try {
        const page = req.params.page;
        const row = await getHeroImagesByPage(page);
        if (!row) {
            return res.json({ success: true, data: { page, images: [] } });
        }
        const images = [row.image1, row.image2, row.image3, row.image4]
            .filter(Boolean)
            .map((f) => publicUrlFor(page, f, req));
        res.json({ success: true, data: { page, images } });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const updateHeroImages = async (req, res) => {
    try {
        const page = req.params.page;
        const files = req.files || {};
        // Fetch current row to preserve other images if not replaced
        const existing = await getHeroImagesByPage(page);

        const nextImages = {
            image1: files.image1?.[0]?.filename || null,
            image2: files.image2?.[0]?.filename || null,
            image3: files.image3?.[0]?.filename || null,
            image4: files.image4?.[0]?.filename || null,
        };

        // If no new file for a slot, keep the previous filename
        if (existing) {
            nextImages.image1 = nextImages.image1 || existing.image1 || null;
            nextImages.image2 = nextImages.image2 || existing.image2 || null;
            nextImages.image3 = nextImages.image3 || existing.image3 || null;
            nextImages.image4 = nextImages.image4 || existing.image4 || null;
        }

        await upsertHeroImages(page, nextImages);

        const urls = [nextImages.image1, nextImages.image2, nextImages.image3, nextImages.image4]
            .filter(Boolean)
            .map((f) => publicUrlFor(page, f, req));

        res.json({ success: true, message: "Hero images updated", data: { page, images: urls } });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = {
    getHeroImages,
    updateHeroImages,
};
