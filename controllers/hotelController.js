

// // import db from "../db.js";
// // import HotelModel from "../models/hotelModel.js";
// const db = require("../db.js");
// const HotelModel = require("../models/hotelModel.js");

// /**
//  * Helper to normalize rooms/images stored as strings in DB
//  */
// function normalizeToArray(value) {
//     if (Array.isArray(value)) return value;
//     if (value == null) return [];
//     if (typeof value === "string") {
//         const trimmed = value.trim();
//         if ((trimmed.startsWith("[") && trimmed.endsWith("]")) || trimmed.startsWith("{")) {
//             try {
//                 const parsed = JSON.parse(trimmed);
//                 return Array.isArray(parsed) ? parsed : [];
//             } catch (_) {
//                 // fallthrough to comma-split fallback
//             }
//         }
//         if (trimmed.includes(",")) {
//             return trimmed
//                 .split(",")
//                 .map((s) => s.trim())
//                 .filter(Boolean);
//         }
//         if (trimmed) return [trimmed];
//         return [];
//     }
//     return [];
// }

// /**
//  * Ensure rooms is returned as an array of room objects with sane defaults.
//  */
// function parseRoomsField(rawRooms) {
//     let rooms = [];
//     if (rawRooms == null) return rooms;

//     if (Array.isArray(rawRooms)) {
//         rooms = rawRooms;
//     } else if (typeof rawRooms === "string") {
//         try {
//             const parsed = JSON.parse(rawRooms);
//             if (Array.isArray(parsed)) rooms = parsed;
//             else rooms = normalizeToArray(rawRooms);
//         } catch {
//             rooms = normalizeToArray(rawRooms);
//         }
//     } else {
//         rooms = [];
//     }

//     // Normalize each room object
//     rooms = rooms.map((r) => {
//         const room = typeof r === "string" ? { room_type: r } : { ...(r || {}) };
//         // ensure numeric max_guests
//         const mg =
//             room.max_guests ?? room.max ?? room.capacity ?? room.maxGuests ?? 1;
//         const parsedMg = Number(mg) || 1;
//         return {
//             room_type: room.room_type ?? room.roomType ?? "",
//             board_type: room.board_type ?? room.boardType ?? "",
//             max_guests: parsedMg,
//             price_per_night: room.price_per_night ?? room.price ?? "",
//             availability: room.availability ?? "Available",
//             // keep other fields if present:
//             ...room,
//         };
//     });

//     return rooms;
// }

// /**
//  * Convert images field (string or JSON) into array of paths/urls.
//  */
// function parseImagesField(rawImages) {
//     const arr = normalizeToArray(rawImages);
//     return arr.map((img) => {
//         if (!img) return null;
//         const s = String(img).trim();
//         if (s.startsWith("http://") || s.startsWith("https://")) return s;
//         // Keep file name; frontend may map to uploads path if desired
//         return s;
//     }).filter(Boolean);
// }

// export async function addHotel(req, res) {
//     try {
//         await HotelModel.ensureTable();

//         const { hotel_name, address, map_link, description, facilities = "", rooms = "[]" } = req.body;
//         const images = (req.files || []).map(f => f.filename);

//         let roomsObj;
//         try {
//             roomsObj = typeof rooms === "string" ? JSON.parse(rooms) : rooms;
//         } catch (e) {
//             roomsObj = [];
//         }

//         // ensure availability field exists and normalize max_guests
//         roomsObj = (roomsObj || []).map(r => ({
//             room_type: r.room_type || r.roomType || "",
//             board_type: r.board_type || r.boardType || "",
//             max_guests: Number(r.max_guests ?? r.max ?? r.capacity ?? 1) || 1,
//             price_per_night: r.price_per_night ?? r.price ?? "",
//             availability: r.availability || "Available",
//             ...r,
//         }));

//         const hotelData = {
//             hotel_name,
//             address,
//             map_link,
//             description,
//             facilities,
//             rooms: JSON.stringify(roomsObj),
//             images: images.join(","),
//             created_at: new Date(),
//         };

//         const result = await HotelModel.insertHotel(hotelData);
//         res.json({ success: true, insertId: result.insertId });
//     } catch (err) {
//         console.error("addHotel error", err);
//         res.status(500).json({ message: err.message, stack: err.stack });
//     }
// }

// export async function getHotels(req, res) {
//     try {
//         await HotelModel.ensureTable();
//         const hotels = await HotelModel.getAll();

//         // parse rooms/images for each hotel
//         const mapped = (hotels || []).map((h) => {
//             const parsedRooms = parseRoomsField(h.rooms);
//             const images = parseImagesField(h.images);
//             return {
//                 ...h,
//                 rooms: parsedRooms,
//                 images,
//             };
//         });

//         res.json(mapped);
//     } catch (err) {
//         console.error("getHotels error", err);
//         res.status(500).json({ error: err.message || "Server error" });
//     }
// }

// export async function getHotelById(req, res) {
//     try {
//         const id = req.params.id;
//         await HotelModel.ensureTable();

//         db.query("SELECT * FROM hotels WHERE id = ?", [id], (err, results) => {
//             if (err) return res.status(500).json({ error: err.message });
//             if (results.length === 0) return res.status(404).json({ error: "Hotel not found" });

//             const raw = results[0];
//             const parsedRooms = parseRoomsField(raw.rooms);
//             const images = parseImagesField(raw.images);

//             const hotelObj = {
//                 ...raw,
//                 rooms: parsedRooms,
//                 images,
//             };

//             res.json(hotelObj);
//         });
//     } catch (err) {
//         console.error("getHotelById error:", err);
//         res.status(500).json({ error: err.message || "Server error" });
//     }
// }

// export async function updateHotelById(req, res) {
//     try {
//         const id = req.params.id;
//         await HotelModel.ensureTable();

//         const { hotel_name, address, map_link, description, facilities = "", rooms = "[]" } = req.body;
//         const images = (req.files || []).map(f => f.filename);

//         // Get existing hotel
//         let existingHotel = await new Promise((resolve, reject) => {
//             db.query("SELECT * FROM hotels WHERE id = ?", [id], (err, results) => {
//                 if (err) return reject(err);
//                 if (results.length === 0) return reject("Hotel not found");
//                 resolve(results[0]);
//             });
//         });

//         // Merge old images with new ones
//         const allImages = existingHotel.images
//             ? existingHotel.images.split(",").concat(images)
//             : images;

//         let roomsObj;
//         try {
//             roomsObj = typeof rooms === "string" ? JSON.parse(rooms) : rooms;
//         } catch (e) {
//             roomsObj = [];
//         }

//         roomsObj = (roomsObj || []).map(r => ({
//             room_type: r.room_type || r.roomType || "",
//             board_type: r.board_type || r.boardType || "",
//             max_guests: Number(r.max_guests ?? r.max ?? r.capacity ?? 1) || 1,
//             price_per_night: r.price_per_night ?? r.price ?? "",
//             availability: r.availability || "Available",
//             ...r,
//         }));

//         await HotelModel.updateHotel(id, {
//             hotel_name,
//             address,
//             map_link,
//             description,
//             facilities,
//             rooms: JSON.stringify(roomsObj),
//             images: allImages.join(","),
//         });

//         res.json({ success: true, message: "Hotel updated successfully" });
//     } catch (err) {
//         console.error("updateHotelById error:", err);
//         res.status(500).json({ error: err.message || "Server error" });
//     }
// }

// export async function deleteHotel(req, res) {
//     try {
//         const id = req.params.id;
//         await HotelModel.ensureTable();
//         const result = await HotelModel.deleteById(id);

//         if (result.affectedRows > 0) {
//             res.json({ success: true, message: "Hotel deleted successfully" });
//         } else {
//             res.status(404).json({ error: "Hotel not found" });
//         }
//     } catch (err) {
//         console.error("deleteHotel error", err);
//         res.status(500).json({ error: err.message || "Server error" });
//     }
// }

// const db = require("../db.js");
// const HotelModel = require("../models/hotelModel.js");
const db = require("../db.js");
const HotelModel = require("../models/hotelModel.js");

/**
 * Helper to normalize rooms/images stored as strings in DB
 */
function normalizeToArray(value) {
    if (Array.isArray(value)) return value;
    if (value == null) return [];
    if (typeof value === "string") {
        const trimmed = value.trim();
        if ((trimmed.startsWith("[") && trimmed.endsWith("]")) || trimmed.startsWith("{")) {
            try {
                const parsed = JSON.parse(trimmed);
                return Array.isArray(parsed) ? parsed : [];
            } catch (_) {
                // fallthrough to comma-split fallback
            }
        }
        if (trimmed.includes(",")) {
            return trimmed
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
        }
        if (trimmed) return [trimmed];
        return [];
    }
    return [];
}

/**
 * Ensure rooms is returned as an array of room objects with sane defaults.
 */
function parseRoomsField(rawRooms) {
    let rooms = [];
    if (rawRooms == null) return rooms;

    if (Array.isArray(rawRooms)) {
        rooms = rawRooms;
    } else if (typeof rawRooms === "string") {
        try {
            const parsed = JSON.parse(rawRooms);
            if (Array.isArray(parsed)) rooms = parsed;
            else rooms = normalizeToArray(rawRooms);
        } catch {
            rooms = normalizeToArray(rawRooms);
        }
    } else {
        rooms = [];
    }

    // Normalize each room object
    rooms = rooms.map((r) => {
        const room = typeof r === "string" ? { room_type: r } : { ...(r || {}) };
        const mg = room.max_guests ?? room.max ?? room.capacity ?? room.maxGuests ?? 1;
        const parsedMg = Number(mg) || 1;
        return {
            room_type: room.room_type ?? room.roomType ?? "",
            board_type: room.board_type ?? room.boardType ?? "",
            max_guests: parsedMg,
            price_per_night: room.price_per_night ?? room.price ?? "",
            availability: room.availability ?? "Available",
            ...room,
        };
    });

    return rooms;
}

/**
 * Convert images field (string or JSON) into array of paths/urls.
 */
function parseImagesField(rawImages) {
    const arr = normalizeToArray(rawImages);
    return arr
        .map((img) => {
            if (!img) return null;
            const s = String(img).trim();
            if (s.startsWith("http://") || s.startsWith("https://")) return s;
            return s;
        })
        .filter(Boolean);
}

async function addHotel(req, res) {
    try {
        await HotelModel.ensureTable();

        const { hotel_name, address, map_link, description, facilities = "", rooms = "[]" } = req.body;
        const images = (req.files || []).map((f) => f.filename);

        let roomsObj;
        try {
            roomsObj = typeof rooms === "string" ? JSON.parse(rooms) : rooms;
        } catch (e) {
            roomsObj = [];
        }

        roomsObj = (roomsObj || []).map((r) => ({
            room_type: r.room_type || r.roomType || "",
            board_type: r.board_type || r.boardType || "",
            max_guests: Number(r.max_guests ?? r.max ?? r.capacity ?? 1) || 1,
            price_per_night: r.price_per_night ?? r.price ?? "",
            availability: r.availability || "Available",
            ...r,
        }));

        const hotelData = {
            hotel_name,
            address,
            map_link,
            description,
            facilities,
            rooms: JSON.stringify(roomsObj),
            images: images.join(","),
            created_at: new Date(),
        };

        const result = await HotelModel.insertHotel(hotelData);
        res.json({ success: true, insertId: result.insertId });
    } catch (err) {
        console.error("addHotel error", err);
        res.status(500).json({ message: err.message, stack: err.stack });
    }
}

async function getHotels(req, res) {
    try {
        const { getJsonData, shouldPreferJsonData } = require("../utils/jsonDataLoader");
        
        // If JSON mode is enabled, use JSON first and skip database
        if (shouldPreferJsonData()) {
            const jsonData = getJsonData("hotels");
            if (jsonData && jsonData.length > 0) {
                const mapped = jsonData.map((h) => {
                    const parsedRooms = parseRoomsField(h.rooms);
                    const images = parseImagesField(h.images);
                    return { ...h, rooms: parsedRooms, images };
                });
                console.log("✓ Serving hotels from JSON data");
                return res.json(mapped);
            }
        }
        
        // Try database (only if JSON mode is not enabled or JSON data is empty)
        try {
            await HotelModel.ensureTable();
            const hotels = await HotelModel.getAll();

            const mapped = (hotels || []).map((h) => {
                const parsedRooms = parseRoomsField(h.rooms);
                const images = parseImagesField(h.images);
                return { ...h, rooms: parsedRooms, images };
            });

            return res.json(mapped);
        } catch (dbError) {
            console.warn("Database error, trying JSON fallback:", dbError.message);
        }
        
        // Fallback to JSON if database fails
        const jsonData = getJsonData("hotels", true);
        if (jsonData && jsonData.length > 0) {
            const mapped = jsonData.map((h) => {
                const parsedRooms = parseRoomsField(h.rooms);
                const images = parseImagesField(h.images);
                return { ...h, rooms: parsedRooms, images };
            });
            console.log("✓ Serving hotels from JSON fallback");
            return res.json(mapped);
        }
        
        res.json([]);
    } catch (err) {
        console.error("getHotels error", err);
        // Last resort: try JSON
        const { getJsonData } = require("../utils/jsonDataLoader");
        const jsonData = getJsonData("hotels", true);
        if (jsonData && jsonData.length > 0) {
            const mapped = jsonData.map((h) => {
                const parsedRooms = parseRoomsField(h.rooms);
                const images = parseImagesField(h.images);
                return { ...h, rooms: parsedRooms, images };
            });
            return res.json(mapped);
        }
        res.status(500).json({ error: err.message || "Server error" });
    }
}

async function getHotelById(req, res) {
    try {
        const id = req.params.id;
        await HotelModel.ensureTable();

        db.query("SELECT * FROM hotels WHERE id = ?", [id], (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            if (results.length === 0) return res.status(404).json({ error: "Hotel not found" });

            const raw = results[0];
            const parsedRooms = parseRoomsField(raw.rooms);
            const images = parseImagesField(raw.images);

            const hotelObj = { ...raw, rooms: parsedRooms, images };
            res.json(hotelObj);
        });
    } catch (err) {
        console.error("getHotelById error:", err);
        res.status(500).json({ error: err.message || "Server error" });
    }
}

async function updateHotelById(req, res) {
    try {
        const id = req.params.id;
        await HotelModel.ensureTable();

        const { hotel_name, address, map_link, description, facilities = "", rooms = "[]" } = req.body;
        const images = (req.files || []).map((f) => f.filename);

        let existingHotel = await new Promise((resolve, reject) => {
            db.query("SELECT * FROM hotels WHERE id = ?", [id], (err, results) => {
                if (err) return reject(err);
                if (results.length === 0) return reject("Hotel not found");
                resolve(results[0]);
            });
        });

        const allImages = existingHotel.images
            ? existingHotel.images.split(",").concat(images)
            : images;

        let roomsObj;
        try {
            roomsObj = typeof rooms === "string" ? JSON.parse(rooms) : rooms;
        } catch (e) {
            roomsObj = [];
        }

        roomsObj = (roomsObj || []).map((r) => ({
            room_type: r.room_type || r.roomType || "",
            board_type: r.board_type || r.boardType || "",
            max_guests: Number(r.max_guests ?? r.max ?? r.capacity ?? 1) || 1,
            price_per_night: r.price_per_night ?? r.price ?? "",
            availability: r.availability || "Available",
            ...r,
        }));

        await HotelModel.updateHotel(id, {
            hotel_name,
            address,
            map_link,
            description,
            facilities,
            rooms: JSON.stringify(roomsObj),
            images: allImages.join(","),
        });

        res.json({ success: true, message: "Hotel updated successfully" });
    } catch (err) {
        console.error("updateHotelById error:", err);
        res.status(500).json({ error: err.message || "Server error" });
    }
}

async function deleteHotel(req, res) {
    try {
        const id = req.params.id;
        await HotelModel.ensureTable();
        const result = await HotelModel.deleteById(id);

        if (result.affectedRows > 0) {
            res.json({ success: true, message: "Hotel deleted successfully" });
        } else {
            res.status(404).json({ error: "Hotel not found" });
        }
    } catch (err) {
        console.error("deleteHotel error", err);
        res.status(500).json({ error: err.message || "Server error" });
    }
}

module.exports = {
    addHotel,
    getHotels,
    getHotelById,
    updateHotelById,
    deleteHotel,
};
