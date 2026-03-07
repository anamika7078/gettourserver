const dotenv = require("dotenv");
dotenv.config();

const db = require("./db.js");

// Wait for database connection
function waitForDb(callback, maxAttempts = 10) {
    let attempts = 0;
    const checkDb = () => {
        attempts++;
        db.query("SELECT 1", (err) => {
            if (!err) {
                callback();
            } else if (attempts < maxAttempts) {
                setTimeout(checkDb, 1000);
            } else {
                console.error("❌ Database not ready after", maxAttempts, "attempts");
                process.exit(1);
            }
        });
    };
    checkDb();
}

async function insertData() {
    console.log("🌱 Adding dummy data to database...\n");

    // 1. Activity Categories
    console.log("📁 Adding Activity Categories...");
    const activityCategories = [
        { name: "Adventure Sports", slug: "adventure-sports", details: "Thrilling adventure activities" },
        { name: "Water Activities", slug: "water-activities", details: "Swimming, diving, and water fun" },
        { name: "Cultural Tours", slug: "cultural-tours", details: "Explore local culture" },
        { name: "Nature & Wildlife", slug: "nature-wildlife", details: "Wildlife safaris" },
        { name: "Entertainment", slug: "entertainment", details: "Shows and entertainment" },
    ];

    for (const cat of activityCategories) {
        await new Promise((resolve) => {
            db.query(
                "INSERT IGNORE INTO activity_categories (name, slug, details) VALUES (?, ?, ?)",
                [cat.name, cat.slug, cat.details],
                (err) => {
                    if (!err) console.log(`  ✓ ${cat.name}`);
                    resolve();
                }
            );
        });
    }

    // 2. Get category IDs for activities
    const categories = await new Promise((resolve) => {
        db.query("SELECT id, name FROM activity_categories", (err, results) => {
            resolve(err ? [] : results);
        });
    });
    const catMap = {};
    categories.forEach(c => { catMap[c.name] = c.id; });

    // 3. Activities
    console.log("\n🎯 Adding Activities...");
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

    for (const act of activities) {
        await new Promise((resolve) => {
            db.query(
                `INSERT IGNORE INTO activities (title, location_name, location_link, price, category, category_id, details, images) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [act.title, act.location_name, act.location_link, act.price, act.category, act.category_id, act.details, act.images],
                (err) => {
                    if (!err) console.log(`  ✓ ${act.title}`);
                    resolve();
                }
            );
        });
    }

    // 4. Cities
    console.log("\n🏙️ Adding Cities...");
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

    for (const city of cities) {
        await new Promise((resolve) => {
            db.query("INSERT IGNORE INTO cities (name, image) VALUES (?, ?)", [city.name, city.image], (err) => {
                if (!err) console.log(`  ✓ ${city.name}`);
                resolve();
            });
        });
    }

    // 5. City Tour Categories
    console.log("\n🗺️ Adding City Tour Categories...");
    const cityCategories = [
        { name: "City Highlights", cityName: "Dubai", image: "highlights.jpg" },
        { name: "Food Tours", cityName: "Dubai", image: "food.jpg" },
        { name: "Night Tours", cityName: "Dubai", image: "night.jpg" },
        { name: "Historical Tours", cityName: "Paris", image: "historical.jpg" },
        { name: "Art & Culture", cityName: "Paris", image: "art.jpg" },
        { name: "Shopping Tours", cityName: "Tokyo", image: "shopping.jpg" },
    ];

    for (const cat of cityCategories) {
        await new Promise((resolve) => {
            db.query(
                "INSERT IGNORE INTO city_tour_categories (name, cityName, image) VALUES (?, ?, ?)",
                [cat.name, cat.cityName, cat.image],
                (err) => {
                    if (!err) console.log(`  ✓ ${cat.name} (${cat.cityName})`);
                    resolve();
                }
            );
        });
    }

    // 6. Get city category IDs
    const cityCats = await new Promise((resolve) => {
        db.query("SELECT id, name, cityName FROM city_tour_categories", (err, results) => {
            resolve(err ? [] : results);
        });
    });
    const cityCatMap = {};
    cityCats.forEach(c => {
        const key = `${c.name.toLowerCase()}-${c.cityName.toLowerCase()}`;
        cityCatMap[key] = c.id;
    });

    // 7. City Packages
    console.log("\n📦 Adding City Packages...");
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

    for (const pkg of cityPackages) {
        await new Promise((resolve) => {
            db.query(
                `INSERT IGNORE INTO city_packages (title, cityName, categoryId, cityImage, locationUrl, duration, price, images, details) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [pkg.title, pkg.cityName, pkg.categoryId, pkg.cityImage, pkg.locationUrl, pkg.duration, pkg.price, pkg.images, pkg.details],
                (err) => {
                    if (!err) console.log(`  ✓ ${pkg.title}`);
                    resolve();
                }
            );
        });
    }

    // 8. Holiday Categories
    console.log("\n🎄 Adding Holiday Categories...");
    const holidayCategories = [
        { name: "Europe" },
        { name: "Asia" },
        { name: "Beach" },
        { name: "Adventure" },
        { name: "Family" },
        { name: "Luxury" },
    ];

    for (const cat of holidayCategories) {
        await new Promise((resolve) => {
            db.query("INSERT IGNORE INTO holiday_categories (name) VALUES (?)", [cat.name], (err) => {
                if (!err) console.log(`  ✓ ${cat.name}`);
                resolve();
            });
        });
    }

    // 9. Get holiday category IDs
    const holidayCats = await new Promise((resolve) => {
        db.query("SELECT id, name FROM holiday_categories", (err, results) => {
            resolve(err ? [] : results);
        });
    });
    const holidayCatMap = {};
    holidayCats.forEach(c => { holidayCatMap[c.name] = c.id; });

    // 10. Holiday Packages
    console.log("\n🏖️ Adding Holiday Packages...");
    const holidayPackages = [
        {
            title: "European Adventure - 7 Days",
            destination: "Paris, Rome, Barcelona",
            duration: "7 days / 6 nights",
            price: 2500.00,
            category: "Europe",
            category_id: holidayCatMap["Europe"],
            details: "Explore three of Europe's most beautiful cities. Includes flights, hotels, and guided tours.",
            images: JSON.stringify(["h1.jpg", "h2.jpg", "h3.jpg"]),
        },
        {
            title: "Tropical Paradise - Maldives",
            destination: "Maldives",
            duration: "5 days / 4 nights",
            price: 1800.00,
            category: "Beach",
            category_id: holidayCatMap["Beach"],
            details: "Relax in luxury water villas with crystal-clear waters. All meals and water sports included.",
            images: JSON.stringify(["h1.jpg", "h2.jpg"]),
        },
        {
            title: "Asian Discovery Tour",
            destination: "Tokyo, Singapore, Bangkok",
            duration: "10 days / 9 nights",
            price: 3200.00,
            category: "Asia",
            category_id: holidayCatMap["Asia"],
            details: "Experience the best of Asia with cultural tours and amazing food.",
            images: JSON.stringify(["h3.jpg", "h4.jpg"]),
        },
        {
            title: "Safari Adventure - Kenya",
            destination: "Nairobi, Masai Mara",
            duration: "6 days / 5 nights",
            price: 2200.00,
            category: "Adventure",
            category_id: holidayCatMap["Adventure"],
            details: "Witness the Great Migration and Big Five. Includes game drives and accommodation.",
            images: JSON.stringify(["h1.jpg", "h2.jpg"]),
        },
    ];

    for (const pkg of holidayPackages) {
        await new Promise((resolve) => {
            db.query(
                `INSERT IGNORE INTO holiday_packages (title, destination, duration, price, category, category_id, details, images) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [pkg.title, pkg.destination, pkg.duration, pkg.price, pkg.category, pkg.category_id, pkg.details, pkg.images],
                (err) => {
                    if (!err) console.log(`  ✓ ${pkg.title}`);
                    resolve();
                }
            );
        });
    }

    // 11. Hotels
    console.log("\n🏨 Adding Hotels...");
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

    for (const hotel of hotels) {
        await new Promise((resolve) => {
            db.query(
                `INSERT IGNORE INTO hotels (hotel_name, address, map_link, description, facilities, rooms, images, created_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
                [hotel.hotel_name, hotel.address, hotel.map_link, hotel.description, hotel.facilities, hotel.rooms, hotel.images],
                (err) => {
                    if (!err) console.log(`  ✓ ${hotel.hotel_name}`);
                    resolve();
                }
            );
        });
    }

    // 12. Cruise Categories
    console.log("\n🚢 Adding Cruise Categories...");
    const cruiseCategories = [
        { name: "Mediterranean" },
        { name: "Caribbean" },
        { name: "Adventure" },
        { name: "Luxury" },
        { name: "Family" },
    ];

    for (const cat of cruiseCategories) {
        await new Promise((resolve) => {
            db.query("INSERT IGNORE INTO cruise_categories (name) VALUES (?)", [cat.name], (err) => {
                if (!err) console.log(`  ✓ ${cat.name}`);
                resolve();
            });
        });
    }

    // 13. Get cruise category IDs
    const cruiseCats = await new Promise((resolve) => {
        db.query("SELECT id, name FROM cruise_categories", (err, results) => {
            resolve(err ? [] : results);
        });
    });
    const cruiseCatMap = {};
    cruiseCats.forEach(c => { cruiseCatMap[c.name] = c.id; });

    // 14. Cruise Packages
    console.log("\n⛵ Adding Cruise Packages...");
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

    for (const cruise of cruises) {
        await new Promise((resolve) => {
            db.query(
                `INSERT IGNORE INTO cruise_packages (title, departure_port, departure_dates, price, image, banner_video_url, category, details) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [cruise.title, cruise.departure_port, cruise.departure_dates, cruise.price, cruise.image, cruise.banner_video_url, cruise.category, cruise.details],
                (err) => {
                    if (!err) console.log(`  ✓ ${cruise.title}`);
                    resolve();
                }
            );
        });
    }

    // 15. Visas
    console.log("\n🛂 Adding Visas...");
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

    for (const visa of visas) {
        await new Promise((resolve) => {
            db.query(
                `INSERT IGNORE INTO visas (country, price, subject, image, overview) 
                 VALUES (?, ?, ?, ?, ?)`,
                [visa.country, visa.price, visa.subject, visa.image, visa.overview],
                (err) => {
                    if (!err) console.log(`  ✓ ${visa.country}`);
                    resolve();
                }
            );
        });
    }

    console.log("\n✅ All dummy data added successfully!");
    console.log("\n📊 Summary:");
    console.log("  - Activity Categories: 5");
    console.log("  - Activities: 5");
    console.log("  - Cities: 8");
    console.log("  - City Tour Categories: 6");
    console.log("  - City Packages: 4");
    console.log("  - Holiday Categories: 6");
    console.log("  - Holiday Packages: 4");
    console.log("  - Hotels: 3");
    console.log("  - Cruise Categories: 5");
    console.log("  - Cruise Packages: 3");
    console.log("  - Visas: 6");
    console.log("\n🎉 Your frontend should now display data!");
    process.exit(0);
}

// Start
waitForDb(() => {
    insertData().catch((err) => {
        console.error("❌ Error:", err);
        process.exit(1);
    });
});

