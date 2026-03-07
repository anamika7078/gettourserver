const db = require("./db.js");

// Check if data exists
function hasData(tableName, callback) {
    db.query(`SELECT COUNT(*) as count FROM ${tableName}`, (err, results) => {
        if (err) return callback(err, false);
        callback(null, results[0].count > 0);
    });
}

// Add dummy data automatically on server start
function autoSeed() {
    console.log("🔍 Checking if database needs dummy data...");

    // Check if activities table has data
    hasData("activities", (err, hasActivities) => {
        if (err) {
            console.error("Error checking activities:", err);
            return;
        }

        // If data exists, skip seeding
        if (hasActivities) {
            console.log("✅ Database already has data. Skipping auto-seed.");
            return;
        }

        console.log("🌱 No data found. Adding dummy data...\n");
        insertDummyData();
    });
}

function insertDummyData() {
    // 1. Activity Categories
    const activityCategories = [
        { name: "Adventure Sports", slug: "adventure-sports", details: "Thrilling adventure activities" },
        { name: "Water Activities", slug: "water-activities", details: "Swimming, diving, and water fun" },
        { name: "Cultural Tours", slug: "cultural-tours", details: "Explore local culture" },
        { name: "Nature & Wildlife", slug: "nature-wildlife", details: "Wildlife safaris" },
        { name: "Entertainment", slug: "entertainment", details: "Shows and entertainment" },
    ];

    activityCategories.forEach((cat) => {
        db.query(
            "INSERT IGNORE INTO activity_categories (name, slug, details) VALUES (?, ?, ?)",
            [cat.name, cat.slug, cat.details]
        );
    });

    // Wait a bit, then add activities
    setTimeout(() => {
        db.query("SELECT id, name FROM activity_categories", (err, categories) => {
            if (err) return;
            const catMap = {};
            categories.forEach((c) => { catMap[c.name] = c.id; });

            const activities = [
                {
                    title: "Bungee Jumping Adventure",
                    location_name: "Adventure Park, Dubai",
                    location_link: "https://maps.google.com/?q=Adventure+Park+Dubai",
                    price: "AED 350",
                    category: "Adventure Sports",
                    category_id: catMap["Adventure Sports"],
                    details: "Experience the ultimate adrenaline rush with professional bungee jumping.",
                    images: JSON.stringify(["a1.png", "a2.png"]),
                },
                {
                    title: "Scuba Diving Experience",
                    location_name: "Coral Reef, Maldives",
                    location_link: "https://maps.google.com/?q=Coral+Reef+Maldives",
                    price: "USD 150",
                    category: "Water Activities",
                    category_id: catMap["Water Activities"],
                    details: "Dive into crystal-clear waters and explore vibrant coral reefs.",
                    images: JSON.stringify(["a3.png", "a4.png"]),
                },
                {
                    title: "Historical City Tour",
                    location_name: "Old Town, Istanbul",
                    location_link: "https://maps.google.com/?q=Old+Town+Istanbul",
                    price: "EUR 45",
                    category: "Cultural Tours",
                    category_id: catMap["Cultural Tours"],
                    details: "Discover the rich history of Istanbul with guided tours.",
                    images: JSON.stringify(["a5.png", "a6.jpg"]),
                },
                {
                    title: "Safari Wildlife Experience",
                    location_name: "Serengeti National Park",
                    location_link: "https://maps.google.com/?q=Serengeti",
                    price: "USD 200",
                    category: "Nature & Wildlife",
                    category_id: catMap["Nature & Wildlife"],
                    details: "Witness the Big Five in their natural habitat.",
                    images: JSON.stringify(["a7.png", "a8.png"]),
                },
                {
                    title: "Broadway Show Tickets",
                    location_name: "Times Square, New York",
                    location_link: "https://maps.google.com/?q=Times+Square",
                    price: "USD 120",
                    category: "Entertainment",
                    category_id: catMap["Entertainment"],
                    details: "Enjoy world-class Broadway performances.",
                    images: JSON.stringify(["a9.png", "a10.png"]),
                },
            ];

            activities.forEach((act) => {
                db.query(
                    `INSERT IGNORE INTO activities (title, location_name, location_link, price, category, category_id, details, images) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [act.title, act.location_name, act.location_link, act.price, act.category, act.category_id, act.details, act.images]
                );
            });
        });
    }, 500);

    // 2. Cities
    const cities = [
        { name: "Dubai", image: "dubai.jpg" },
        { name: "Paris", image: "paris.jpg" },
        { name: "Tokyo", image: "tokyo.jpg" },
        { name: "New York", image: "newyork.jpg" },
        { name: "London", image: "london.jpg" },
        { name: "Barcelona", image: "barcelona.jpg" },
        { name: "Singapore", image: "singapore.jpg" },
        { name: "Istanbul", image: "istanbul.jpg" },
    ];

    cities.forEach((city) => {
        db.query("INSERT IGNORE INTO cities (name, image) VALUES (?, ?)", [city.name, city.image]);
    });

    // 3. City Tour Categories
    setTimeout(() => {
        const cityCategories = [
            { name: "City Highlights", cityName: "Dubai", image: "highlights.jpg" },
            { name: "Food Tours", cityName: "Dubai", image: "food.jpg" },
            { name: "Night Tours", cityName: "Dubai", image: "night.jpg" },
            { name: "Historical Tours", cityName: "Paris", image: "historical.jpg" },
            { name: "Art & Culture", cityName: "Paris", image: "art.jpg" },
            { name: "Shopping Tours", cityName: "Tokyo", image: "shopping.jpg" },
        ];

        cityCategories.forEach((cat) => {
            db.query(
                "INSERT IGNORE INTO city_tour_categories (name, cityName, image) VALUES (?, ?, ?)",
                [cat.name, cat.cityName, cat.image]
            );
        });

        // 4. City Packages
        setTimeout(() => {
            db.query("SELECT id, name, cityName FROM city_tour_categories", (err, cityCats) => {
                if (err) return;
                const cityCatMap = {};
                cityCats.forEach((c) => {
                    const key = `${c.name.toLowerCase()}-${c.cityName.toLowerCase()}`;
                    cityCatMap[key] = c.id;
                });

                const cityPackages = [
                    {
                        title: "Dubai City Highlights Tour",
                        cityName: "Dubai",
                        categoryId: cityCatMap["city highlights-dubai"] || null,
                        cityImage: "dubai-highlights.jpg",
                        locationUrl: "https://maps.google.com/?q=Dubai",
                        duration: "4 hours",
                        price: 89.99,
                        images: JSON.stringify(["package1.jpg", "package2.jpg"]),
                        details: "Explore iconic landmarks including Burj Khalifa, Dubai Mall, and Palm Jumeirah.",
                    },
                    {
                        title: "Dubai Food & Culture Walk",
                        cityName: "Dubai",
                        categoryId: cityCatMap["food tours-dubai"] || null,
                        cityImage: "dubai-food.jpg",
                        locationUrl: "https://maps.google.com/?q=Dubai+Food",
                        duration: "3 hours",
                        price: 65.00,
                        images: JSON.stringify(["food1.jpg", "food2.jpg"]),
                        details: "Taste authentic Emirati cuisine and learn about local food culture.",
                    },
                    {
                        title: "Paris Historical Walking Tour",
                        cityName: "Paris",
                        categoryId: cityCatMap["historical tours-paris"] || null,
                        cityImage: "paris-historical.jpg",
                        locationUrl: "https://maps.google.com/?q=Paris",
                        duration: "5 hours",
                        price: 75.00,
                        images: JSON.stringify(["paris1.jpg", "paris2.jpg"]),
                        details: "Discover the rich history of Paris through iconic monuments.",
                    },
                    {
                        title: "Tokyo Shopping Experience",
                        cityName: "Tokyo",
                        categoryId: cityCatMap["shopping tours-tokyo"] || null,
                        cityImage: "tokyo-shopping.jpg",
                        locationUrl: "https://maps.google.com/?q=Tokyo",
                        duration: "6 hours",
                        price: 95.00,
                        images: JSON.stringify(["tokyo1.jpg", "tokyo2.jpg"]),
                        details: "Explore Tokyo's best shopping districts.",
                    },
                ];

                cityPackages.forEach((pkg) => {
                    db.query(
                        `INSERT IGNORE INTO city_packages (title, cityName, categoryId, cityImage, locationUrl, duration, price, images, details) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [pkg.title, pkg.cityName, pkg.categoryId, pkg.cityImage, pkg.locationUrl, pkg.duration, pkg.price, pkg.images, pkg.details]
                    );
                });
            });
        }, 1000);
    }, 1000);

    // 5. Holiday Categories
    const holidayCategories = [
        { name: "Europe" },
        { name: "Asia" },
        { name: "Beach" },
        { name: "Adventure" },
        { name: "Family" },
        { name: "Luxury" },
    ];

    holidayCategories.forEach((cat) => {
        db.query("INSERT IGNORE INTO holiday_categories (name) VALUES (?)", [cat.name]);
    });

    // 6. Holiday Packages
    setTimeout(() => {
        const holidayPackages = [
                {
                    title: "European Adventure - 7 Days",
                    destination: "Paris, Rome, Barcelona",
                    duration: "7 days / 6 nights",
                    price: 2500.00,
                    category: "Europe",
                    details: "Explore three of Europe's most beautiful cities. Includes flights, hotels, and guided tours.",
                    images: JSON.stringify(["h1.jpg", "h2.jpg", "h3.jpg"]),
                },
                {
                    title: "Tropical Paradise - Maldives",
                    destination: "Maldives",
                    duration: "5 days / 4 nights",
                    price: 1800.00,
                    category: "Beach",
                    details: "Relax in luxury water villas with crystal-clear waters. All meals and water sports included.",
                    images: JSON.stringify(["h1.jpg", "h2.jpg"]),
                },
                {
                    title: "Asian Discovery Tour",
                    destination: "Tokyo, Singapore, Bangkok",
                    duration: "10 days / 9 nights",
                    price: 3200.00,
                    category: "Asia",
                    details: "Experience the best of Asia with cultural tours and amazing food.",
                    images: JSON.stringify(["h3.jpg", "h4.jpg"]),
                },
                {
                    title: "Safari Adventure - Kenya",
                    destination: "Nairobi, Masai Mara",
                    duration: "6 days / 5 nights",
                    price: 2200.00,
                    category: "Adventure",
                    details: "Witness the Great Migration and Big Five. Includes game drives and accommodation.",
                    images: JSON.stringify(["h1.jpg", "h2.jpg"]),
                },
            ];

            holidayPackages.forEach((pkg) => {
                db.query(
                    `INSERT IGNORE INTO holiday_packages (title, destination, duration, price, category, details, images, created_at) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
                    [pkg.title, pkg.destination, pkg.duration, pkg.price, pkg.category, pkg.details, pkg.images]
                );
            });
        });
    }, 1500);

    // 7. Hotels
    setTimeout(() => {
        const hotels = [
            {
                hotel_name: "Grand Luxury Hotel",
                address: "123 Main Street, Dubai, UAE",
                map_link: "https://maps.google.com/?q=Grand+Luxury+Hotel+Dubai",
                description: "A luxurious 5-star hotel in the heart of Dubai with stunning views.",
                facilities: "Swimming Pool, Spa, Gym, Restaurant, Bar, Free WiFi, Parking",
                rooms: JSON.stringify([
                    { type: "Deluxe Room", price: 200, amenities: ["WiFi", "TV", "Mini Bar"] },
                    { type: "Suite", price: 400, amenities: ["WiFi", "TV", "Mini Bar", "Jacuzzi"] },
                    { type: "Presidential Suite", price: 800, amenities: ["WiFi", "TV", "Mini Bar", "Jacuzzi", "Butler"] },
                ]),
                images: JSON.stringify(["h1.jpg", "h2.jpg", "h3.jpg"]),
            },
            {
                hotel_name: "Seaside Resort",
                address: "456 Beach Road, Maldives",
                map_link: "https://maps.google.com/?q=Seaside+Resort+Maldives",
                description: "Beautiful beachfront resort with private villas and direct beach access.",
                facilities: "Private Beach, Water Sports, Spa, Restaurant, Bar, Free WiFi",
                rooms: JSON.stringify([
                    { type: "Beach Villa", price: 300, amenities: ["WiFi", "TV", "Private Pool", "Beach Access"] },
                    { type: "Water Villa", price: 500, amenities: ["WiFi", "TV", "Private Pool", "Ocean Access"] },
                ]),
                images: JSON.stringify(["h1.jpg", "h2.jpg"]),
            },
            {
                hotel_name: "City Center Hotel",
                address: "789 Downtown Avenue, New York, USA",
                map_link: "https://maps.google.com/?q=City+Center+Hotel+New+York",
                description: "Modern hotel in the heart of Manhattan, close to major attractions.",
                facilities: "Fitness Center, Business Center, Restaurant, Bar, Free WiFi, Parking",
                rooms: JSON.stringify([
                    { type: "Standard Room", price: 150, amenities: ["WiFi", "TV", "Work Desk"] },
                    { type: "Executive Room", price: 250, amenities: ["WiFi", "TV", "Work Desk", "Lounge Access"] },
                ]),
                images: JSON.stringify(["h3.jpg", "h4.jpg"]),
            },
        ];

        hotels.forEach((hotel) => {
            db.query(
                `INSERT IGNORE INTO hotels (hotel_name, address, map_link, description, facilities, rooms, images, created_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
                [hotel.hotel_name, hotel.address, hotel.map_link, hotel.description, hotel.facilities, hotel.rooms, hotel.images]
            );
        });
    }, 2000);

    // 8. Cruise Categories
    const cruiseCategories = [
        { name: "Mediterranean" },
        { name: "Caribbean" },
        { name: "Adventure" },
        { name: "Luxury" },
        { name: "Family" },
    ];

    cruiseCategories.forEach((cat) => {
        db.query("INSERT IGNORE INTO cruise_categories (name) VALUES (?)", [cat.name]);
    });

    // 9. Cruise Packages
    setTimeout(() => {
        db.query("SELECT id, name FROM cruise_categories", (err, cruiseCats) => {
            if (err) return;
            const cruiseCatMap = {};
            cruiseCats.forEach((c) => { cruiseCatMap[c.name] = c.id; });

            const cruises = [
                {
                    title: "Mediterranean Cruise - 7 Nights",
                    departure_port: "Barcelona, Spain",
                    departure_dates: JSON.stringify(["2024-06-15", "2024-07-20", "2024-08-10"]),
                    price: 1500.00,
                    image: "c1.jpg",
                    banner_video_url: "https://youtube.com/watch?v=mediterranean",
                    category: "Mediterranean",
                    details: "Sail through the beautiful Mediterranean visiting Spain, France, Italy, and Greece.",
                },
                {
                    title: "Caribbean Paradise Cruise",
                    departure_port: "Miami, USA",
                    departure_dates: JSON.stringify(["2024-05-01", "2024-06-15", "2024-07-30"]),
                    price: 1800.00,
                    image: "c2.jpg",
                    banner_video_url: "https://youtube.com/watch?v=caribbean",
                    category: "Caribbean",
                    details: "Explore tropical islands, pristine beaches, and vibrant cultures.",
                },
                {
                    title: "Alaska Adventure Cruise",
                    departure_port: "Seattle, USA",
                    departure_dates: JSON.stringify(["2024-07-01", "2024-08-15"]),
                    price: 2200.00,
                    image: "c3.jpg",
                    banner_video_url: "https://youtube.com/watch?v=alaska",
                    category: "Adventure",
                    details: "Witness glaciers, wildlife, and stunning natural beauty.",
                },
            ];

            cruises.forEach((cruise) => {
                db.query(
                    `INSERT IGNORE INTO cruise_packages (title, departure_port, departure_dates, price, image, banner_video_url, category, details) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [cruise.title, cruise.departure_port, cruise.departure_dates, cruise.price, cruise.image, cruise.banner_video_url, cruise.category, cruise.details]
                );
            });
        });
    }, 2500);

    // 10. Visas
    setTimeout(() => {
        const visas = [
            {
                country: "United States",
                price: 185.00,
                subject: "Tourist Visa",
                image: "v1.jpg",
                overview: "Apply for a US tourist visa to explore America's iconic landmarks. Processing time: 2-3 weeks.",
            },
            {
                country: "United Kingdom",
                price: 120.00,
                subject: "Standard Visitor Visa",
                image: "v2.jpg",
                overview: "Visit the UK for tourism, business, or to see family. Valid for up to 6 months.",
            },
            {
                country: "Schengen Area",
                price: 80.00,
                subject: "Schengen Visa",
                image: "v3.jpg",
                overview: "Travel to 27 European countries with a single Schengen visa.",
            },
            {
                country: "Australia",
                price: 150.00,
                subject: "Tourist Visa",
                image: "v4.jpg",
                overview: "Explore Australia's stunning landscapes and beaches.",
            },
            {
                country: "Japan",
                price: 45.00,
                subject: "Tourist Visa",
                image: "v5.jpg",
                overview: "Discover Japan's unique culture and technology.",
            },
            {
                country: "Dubai/UAE",
                price: 100.00,
                subject: "Tourist Visa",
                image: "v1.jpg",
                overview: "Visit Dubai and the UAE for tourism or business.",
            },
        ];

        visas.forEach((visa) => {
            db.query(
                `INSERT IGNORE INTO visas (country, price, subject, image, overview) 
                 VALUES (?, ?, ?, ?, ?)`,
                [visa.country, visa.price, visa.subject, visa.image, visa.overview]
            );
        });

        console.log("✅ Dummy data insertion completed!");
    }, 3000);
}

module.exports = { autoSeed };

