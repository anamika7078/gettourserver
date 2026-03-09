const fs = require("fs");
const path = require("path");

// Helper function to read JSON file
function readJsonFile(filename) {
    try {
        const filePath = path.join(__dirname, "../data", filename);
        if (!fs.existsSync(filePath)) {
            console.warn(`JSON file not found: ${filename}`);
            return null;
        }
        const data = fs.readFileSync(filePath, "utf8");
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${filename}:`, error);
        return null;
    }
}

// Check if we should use JSON data (when USE_JSON_DATA env var is set)
function shouldUseJsonData() {
    return process.env.USE_JSON_DATA === "true" || process.env.USE_JSON_DATA === "1";
}

// Check if we should prefer JSON data (always use JSON first if enabled)
function shouldPreferJsonData() {
    return shouldUseJsonData();
}

// Get data from JSON or return null
function getJsonData(type, force = false) {
    // If force is true, always try to get JSON data (for fallback scenarios)
    if (!force && !shouldUseJsonData()) {
        return null;
    }
    
    const fileMap = {
        cities: "cities.json",
        activities: "activities.json",
        hotels: "hotels.json",
        holidays: "holidays.json",
        cruises: "cruises.json",
        visas: "visas.json",
        cityPackages: "cityPackages.json",
    };
    
    const filename = fileMap[type];
    if (!filename) {
        return null;
    }
    
    return readJsonFile(filename);
}

module.exports = {
    readJsonFile,
    shouldUseJsonData,
    shouldPreferJsonData,
    getJsonData,
};

