const fs = require("fs");
const path = require("path");

// Helper function to read JSON file
function readJsonFile(filename) {
    try {
        const filePath = path.join(__dirname, "../data", filename);
        const data = fs.readFileSync(filePath, "utf8");
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${filename}:`, error);
        return [];
    }
}

// Cities
exports.getCities = (req, res) => {
    try {
        const cities = readJsonFile("cities.json");
        return res.json({ success: true, data: cities });
    } catch (error) {
        console.error("Error fetching cities:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

exports.getCityById = (req, res) => {
    try {
        const cities = readJsonFile("cities.json");
        const city = cities.find(c => c.id === parseInt(req.params.id));
        if (!city) {
            return res.status(404).json({ success: false, error: "City not found" });
        }
        return res.json({ success: true, data: city });
    } catch (error) {
        console.error("Error fetching city:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

// Activities
exports.getActivities = (req, res) => {
    try {
        const activities = readJsonFile("activities.json");
        return res.json(activities);
    } catch (error) {
        console.error("Error fetching activities:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

exports.getActivityById = (req, res) => {
    try {
        const activities = readJsonFile("activities.json");
        const activity = activities.find(a => a.id === parseInt(req.params.id));
        if (!activity) {
            return res.status(404).json({ success: false, error: "Activity not found" });
        }
        return res.json(activity);
    } catch (error) {
        console.error("Error fetching activity:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

// Hotels
exports.getHotels = (req, res) => {
    try {
        const hotels = readJsonFile("hotels.json");
        return res.json(hotels);
    } catch (error) {
        console.error("Error fetching hotels:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

exports.getHotelById = (req, res) => {
    try {
        const hotels = readJsonFile("hotels.json");
        const hotel = hotels.find(h => h.id === parseInt(req.params.id));
        if (!hotel) {
            return res.status(404).json({ success: false, error: "Hotel not found" });
        }
        return res.json(hotel);
    } catch (error) {
        console.error("Error fetching hotel:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

// Holidays
exports.getHolidays = (req, res) => {
    try {
        const holidays = readJsonFile("holidays.json");
        return res.json({ success: true, data: holidays });
    } catch (error) {
        console.error("Error fetching holidays:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

exports.getHolidayById = (req, res) => {
    try {
        const holidays = readJsonFile("holidays.json");
        const holiday = holidays.find(h => h.id === parseInt(req.params.id));
        if (!holiday) {
            return res.status(404).json({ success: false, error: "Holiday not found" });
        }
        return res.json({ success: true, data: holiday });
    } catch (error) {
        console.error("Error fetching holiday:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

// Cruises
exports.getCruises = (req, res) => {
    try {
        const cruises = readJsonFile("cruises.json");
        return res.json(cruises);
    } catch (error) {
        console.error("Error fetching cruises:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

exports.getCruiseById = (req, res) => {
    try {
        const cruises = readJsonFile("cruises.json");
        const cruise = cruises.find(c => c.id === parseInt(req.params.id));
        if (!cruise) {
            return res.status(404).json({ success: false, error: "Cruise not found" });
        }
        return res.json(cruise);
    } catch (error) {
        console.error("Error fetching cruise:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

// Visas
exports.getVisas = (req, res) => {
    try {
        const visas = readJsonFile("visas.json");
        return res.json(visas);
    } catch (error) {
        console.error("Error fetching visas:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

exports.getVisaById = (req, res) => {
    try {
        const visas = readJsonFile("visas.json");
        const visa = visas.find(v => v.id === parseInt(req.params.id));
        if (!visa) {
            return res.status(404).json({ success: false, error: "Visa not found" });
        }
        return res.json(visa);
    } catch (error) {
        console.error("Error fetching visa:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

// City Packages
exports.getCityPackages = (req, res) => {
    try {
        const packages = readJsonFile("cityPackages.json");
        return res.json({ success: true, data: packages });
    } catch (error) {
        console.error("Error fetching city packages:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

exports.getCityPackageById = (req, res) => {
    try {
        const packages = readJsonFile("cityPackages.json");
        const pkg = packages.find(p => p.id === parseInt(req.params.id));
        if (!pkg) {
            return res.status(404).json({ success: false, error: "City package not found" });
        }
        return res.json({ success: true, data: pkg });
    } catch (error) {
        console.error("Error fetching city package:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

