const dotenv = require("dotenv");
dotenv.config();

const db = require("./db.js");
const ActivityModel = require("./models/activityModel.js");
const ActivityCategoryModel = require("./models/activityCategoryModel.js");
const HotelModel = require("./models/hotelModel.js");
const HolidayPackageModel = require("./models/holidayPackageModel.js");
const { createCruise } = require("./models/cruisePackageModel.js");
const { insertVisa } = require("./models/visaModel.js");
const CityPackage = require("./models/cityPackageModel.js");
const City = require("./models/cityModel.js");
const CityTourCategory = require("./models/cityTourCategoryModel.js");
const HolidayCategoryModel = require("./models/holidayCategoryModel.js");
const CruiseCategoryModel = require("./models/cruiseCategoryModel.js");

// Helper function to slugify
function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]+/g, "")
        .replace(/\-\-+/g, "-");
}

// Seed Activity Categories
async function seedActivityCategories() {
    console.log("🌱 Seeding activity categories...");
    const categories = [
        { name: "Adventure Sports", slug: "adventure-sports", details: "Thrilling adventure activities for adrenaline junkies" },
        { name: "Water Activities", slug: "water-activities", details: "Swimming, diving, and water-based fun" },
        { name: "Cultural Tours", slug: "cultural-tours", details: "Explore local culture and heritage" },
        { name: "Nature & Wildlife", slug: "nature-wildlife", details: "Wildlife safaris and nature exploration" },
        { name: "Entertainment", slug: "entertainment", details: "Shows, concerts, and entertainment venues" },
    ];

    for (const cat of categories) {
        try {
            await ActivityCategoryModel.create(cat);
            console.log(`  ✓ Added category: ${cat.name}`);
        } catch (err) {
            if (err.code !== "ER_DUP_ENTRY") {
                console.error(`  ✗ Error adding category ${cat.name}:`, err.message);
            }
        }
    }
}

// Seed Activities
async function seedActivities() {
    console.log("🌱 Seeding activities...");
    const categories = await ActivityCategoryModel.list();
    const categoryMap = {};
    categories.forEach(cat => {
        categoryMap[cat.name.toLowerCase()] = cat.id;
    });

    const activities = [
        {
            title: "Bungee Jumping Adventure",
            location_name: "Adventure Park, Dubai",
            location_link: "https://maps.google.com/?q=Adventure+Park+Dubai",
            price: "AED 350",
            category: "Adventure Sports",
            category_id: categoryMap["adventure sports"],
            details: "Experience the ultimate adrenaline rush with our professional bungee jumping experience. Safety certified equipment and expert instructors ensure a thrilling yet safe adventure.",
            image: null,
            images: JSON.stringify(["activity1.jpg", "activity2.jpg"]),
            videos: null,
            video_links: JSON.stringify(["https://youtube.com/watch?v=example1"]),
        },
        {
            title: "Scuba Diving Experience",
            location_name: "Coral Reef, Maldives",
            location_link: "https://maps.google.com/?q=Coral+Reef+Maldives",
            price: "USD 150",
            category: "Water Activities",
            category_id: categoryMap["water activities"],
            details: "Dive into the crystal-clear waters and explore vibrant coral reefs. Professional PADI certified instructors will guide you through this underwater adventure.",
            image: null,
            images: JSON.stringify(["diving1.jpg", "diving2.jpg"]),
            videos: null,
            video_links: null,
        },
        {
            title: "Historical City Tour",
            location_name: "Old Town, Istanbul",
            location_link: "https://maps.google.com/?q=Old+Town+Istanbul",
            price: "EUR 45",
            category: "Cultural Tours",
            category_id: categoryMap["cultural tours"],
            details: "Discover the rich history and culture of Istanbul with our guided tour through ancient mosques, bazaars, and historical landmarks.",
            image: null,
            images: JSON.stringify(["tour1.jpg", "tour2.jpg", "tour3.jpg"]),
            videos: null,
            video_links: null,
        },
        {
            title: "Safari Wildlife Experience",
            location_name: "Serengeti National Park",
            location_link: "https://maps.google.com/?q=Serengeti+National+Park",
            price: "USD 200",
            category: "Nature & Wildlife",
            category_id: categoryMap["nature & wildlife"],
            details: "Embark on an unforgettable safari adventure to witness the Big Five in their natural habitat. Professional guides and comfortable vehicles included.",
            image: null,
            images: JSON.stringify(["safari1.jpg", "safari2.jpg"]),
            videos: null,
            video_links: JSON.stringify(["https://youtube.com/watch?v=example2"]),
        },
        {
            title: "Broadway Show Tickets",
            location_name: "Times Square, New York",
            location_link: "https://maps.google.com/?q=Times+Square+New+York",
            price: "USD 120",
            category: "Entertainment",
            category_id: categoryMap["entertainment"],
            details: "Enjoy world-class Broadway performances with premium seating. Multiple shows available including musicals, dramas, and comedies.",
            image: null,
            images: JSON.stringify(["show1.jpg"]),
            videos: null,
            video_links: null,
        },
    ];

    for (const activity of activities) {
        try {
            await ActivityModel.insertActivity({
                ...activity,
                created_at: new Date(),
            });
            console.log(`  ✓ Added activity: ${activity.title}`);
        } catch (err) {
            console.error(`  ✗ Error adding activity ${activity.title}:`, err.message);
        }
    }
}

// Seed Cities
async function seedCities() {
    console.log("🌱 Seeding cities...");
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
        try {
            await new Promise((resolve, reject) => {
                City.create(city, (err, result) => {
                    if (err) {
                        if (err.code !== "ER_DUP_ENTRY") reject(err);
                        else resolve();
                    } else resolve();
                });
            });
            console.log(`  ✓ Added city: ${city.name}`);
        } catch (err) {
            console.error(`  ✗ Error adding city ${city.name}:`, err.message);
        }
    }
}

// Seed City Tour Categories
async function seedCityTourCategories() {
    console.log("🌱 Seeding city tour categories...");
    const categories = [
        { name: "City Highlights", cityName: "Dubai", image: "highlights.jpg" },
        { name: "Food Tours", cityName: "Dubai", image: "food.jpg" },
        { name: "Night Tours", cityName: "Dubai", image: "night.jpg" },
        { name: "Historical Tours", cityName: "Paris", image: "historical.jpg" },
        { name: "Art & Culture", cityName: "Paris", image: "art.jpg" },
        { name: "Shopping Tours", cityName: "Tokyo", image: "shopping.jpg" },
    ];

    for (const cat of categories) {
        try {
            await new Promise((resolve, reject) => {
                CityTourCategory.create(cat, (err, result) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
            console.log(`  ✓ Added city tour category: ${cat.name} (${cat.cityName})`);
        } catch (err) {
            console.error(`  ✗ Error adding category ${cat.name}:`, err.message);
        }
    }
}

// Seed City Packages
async function seedCityPackages() {
    console.log("🌱 Seeding city packages...");
    
    // Get categories
    const categories = await new Promise((resolve, reject) => {
        CityTourCategory.getAll((err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });

    const categoryMap = {};
    categories.forEach(cat => {
        if (cat.cityName) {
            const key = `${cat.name.toLowerCase()}-${cat.cityName.toLowerCase()}`;
            categoryMap[key] = cat.id;
        }
    });

    const packages = [
        {
            title: "Dubai City Highlights Tour",
            cityName: "Dubai",
            categoryId: categoryMap["city highlights-dubai"] || null,
            cityImage: "dubai-highlights.jpg",
            locationUrl: "https://maps.google.com/?q=Dubai",
            duration: "4 hours",
            price: 89.99,
            images: JSON.stringify(["package1.jpg", "package2.jpg"]),
            details: "Explore the iconic landmarks of Dubai including Burj Khalifa, Dubai Mall, and Palm Jumeirah. Includes professional guide and transportation.",
        },
        {
            title: "Dubai Food & Culture Walk",
            cityName: "Dubai",
            categoryId: categoryMap["food tours-dubai"] || null,
            cityImage: "dubai-food.jpg",
            locationUrl: "https://maps.google.com/?q=Dubai+Food+District",
            duration: "3 hours",
            price: 65.00,
            images: JSON.stringify(["food1.jpg", "food2.jpg"]),
            details: "Taste authentic Emirati cuisine and learn about local food culture. Visit traditional markets and modern restaurants.",
        },
        {
            title: "Paris Historical Walking Tour",
            cityName: "Paris",
            categoryId: categoryMap["historical tours-paris"] || null,
            cityImage: "paris-historical.jpg",
            locationUrl: "https://maps.google.com/?q=Paris",
            duration: "5 hours",
            price: 75.00,
            images: JSON.stringify(["paris1.jpg", "paris2.jpg"]),
            details: "Discover the rich history of Paris through its iconic monuments, charming streets, and hidden gems. Expert local guide included.",
        },
        {
            title: "Tokyo Shopping Experience",
            cityName: "Tokyo",
            categoryId: categoryMap["shopping tours-tokyo"] || null,
            cityImage: "tokyo-shopping.jpg",
            locationUrl: "https://maps.google.com/?q=Tokyo+Shopping",
            duration: "6 hours",
            price: 95.00,
            images: JSON.stringify(["tokyo1.jpg", "tokyo2.jpg"]),
            details: "Explore Tokyo's best shopping districts from traditional markets to modern malls. Includes shopping guide and tips.",
        },
    ];

    for (const pkg of packages) {
        try {
            await new Promise((resolve, reject) => {
                CityPackage.create(pkg, (err, result) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
            console.log(`  ✓ Added city package: ${pkg.title}`);
        } catch (err) {
            console.error(`  ✗ Error adding package ${pkg.title}:`, err.message);
        }
    }
}

// Seed Hotels
async function seedHotels() {
    console.log("🌱 Seeding hotels...");
    const hotels = [
        {
            hotel_name: "Grand Luxury Hotel",
            address: "123 Main Street, Dubai, UAE",
            map_link: "https://maps.google.com/?q=Grand+Luxury+Hotel+Dubai",
            description: "A luxurious 5-star hotel in the heart of Dubai with stunning views and world-class amenities.",
            facilities: "Swimming Pool, Spa, Gym, Restaurant, Bar, Free WiFi, Parking, Airport Shuttle",
            rooms: JSON.stringify([
                { type: "Deluxe Room", price: 200, amenities: ["WiFi", "TV", "Mini Bar"] },
                { type: "Suite", price: 400, amenities: ["WiFi", "TV", "Mini Bar", "Jacuzzi", "Balcony"] },
                { type: "Presidential Suite", price: 800, amenities: ["WiFi", "TV", "Mini Bar", "Jacuzzi", "Balcony", "Butler Service"] },
            ]),
            images: JSON.stringify(["hotel1.jpg", "hotel2.jpg", "hotel3.jpg"]),
        },
        {
            hotel_name: "Seaside Resort",
            address: "456 Beach Road, Maldives",
            map_link: "https://maps.google.com/?q=Seaside+Resort+Maldives",
            description: "Beautiful beachfront resort with private villas and direct beach access. Perfect for a relaxing getaway.",
            facilities: "Private Beach, Water Sports, Spa, Restaurant, Bar, Free WiFi, Airport Transfer",
            rooms: JSON.stringify([
                { type: "Beach Villa", price: 300, amenities: ["WiFi", "TV", "Private Pool", "Beach Access"] },
                { type: "Water Villa", price: 500, amenities: ["WiFi", "TV", "Private Pool", "Direct Ocean Access"] },
            ]),
            images: JSON.stringify(["resort1.jpg", "resort2.jpg"]),
        },
        {
            hotel_name: "City Center Hotel",
            address: "789 Downtown Avenue, New York, USA",
            map_link: "https://maps.google.com/?q=City+Center+Hotel+New+York",
            description: "Modern hotel in the heart of Manhattan, close to major attractions and business districts.",
            facilities: "Fitness Center, Business Center, Restaurant, Bar, Free WiFi, Parking, Concierge",
            rooms: JSON.stringify([
                { type: "Standard Room", price: 150, amenities: ["WiFi", "TV", "Work Desk"] },
                { type: "Executive Room", price: 250, amenities: ["WiFi", "TV", "Work Desk", "Lounge Access"] },
            ]),
            images: JSON.stringify(["cityhotel1.jpg", "cityhotel2.jpg"]),
        },
    ];

    for (const hotel of hotels) {
        try {
            await HotelModel.insertHotel({
                ...hotel,
                created_at: new Date(),
            });
            console.log(`  ✓ Added hotel: ${hotel.hotel_name}`);
        } catch (err) {
            console.error(`  ✗ Error adding hotel ${hotel.hotel_name}:`, err.message);
        }
    }
}

// Seed Holiday Categories
async function seedHolidayCategories() {
    console.log("🌱 Seeding holiday categories...");
    const categories = [
        { name: "Europe" },
        { name: "Asia" },
        { name: "Beach" },
        { name: "Adventure" },
        { name: "Family" },
        { name: "Luxury" },
    ];

    for (const cat of categories) {
        try {
            await HolidayCategoryModel.create(cat);
            console.log(`  ✓ Added holiday category: ${cat.name}`);
        } catch (err) {
            if (err.code !== "ER_DUP_ENTRY") {
                console.error(`  ✗ Error adding holiday category ${cat.name}:`, err.message);
            }
        }
    }
}

// Seed Cruise Categories
async function seedCruiseCategories() {
    console.log("🌱 Seeding cruise categories...");
    const categories = [
        { name: "Mediterranean" },
        { name: "Caribbean" },
        { name: "Adventure" },
        { name: "Luxury" },
        { name: "Family" },
    ];

    for (const cat of categories) {
        try {
            await CruiseCategoryModel.create(cat);
            console.log(`  ✓ Added cruise category: ${cat.name}`);
        } catch (err) {
            if (err.code !== "ER_DUP_ENTRY") {
                console.error(`  ✗ Error adding cruise category ${cat.name}:`, err.message);
            }
        }
    }
}

// Seed Holiday Packages
async function seedHolidayPackages() {
    console.log("🌱 Seeding holiday packages...");
    const packages = [
        {
            title: "European Adventure - 7 Days",
            destination: "Paris, Rome, Barcelona",
            duration: "7 days / 6 nights",
            price: 2500.00,
            category: "Europe",
            details: "Explore three of Europe's most beautiful cities. Includes flights, hotels, breakfast, and guided tours.",
            images: JSON.stringify(["europe1.jpg", "europe2.jpg", "europe3.jpg"]),
        },
        {
            title: "Tropical Paradise - Maldives",
            destination: "Maldives",
            duration: "5 days / 4 nights",
            price: 1800.00,
            category: "Beach",
            details: "Relax in luxury water villas with crystal-clear waters. Includes all meals, water sports, and spa access.",
            images: JSON.stringify(["maldives1.jpg", "maldives2.jpg"]),
        },
        {
            title: "Asian Discovery Tour",
            destination: "Tokyo, Singapore, Bangkok",
            duration: "10 days / 9 nights",
            price: 3200.00,
            category: "Asia",
            details: "Experience the best of Asia with cultural tours, amazing food, and modern cities. All transportation and hotels included.",
            images: JSON.stringify(["asia1.jpg", "asia2.jpg", "asia3.jpg"]),
        },
        {
            title: "Safari Adventure - Kenya",
            destination: "Nairobi, Masai Mara",
            duration: "6 days / 5 nights",
            price: 2200.00,
            category: "Adventure",
            details: "Witness the Great Migration and Big Five. Includes game drives, accommodation, and all meals.",
            images: JSON.stringify(["safari1.jpg", "safari2.jpg"]),
        },
    ];

    for (const pkg of packages) {
        try {
            await HolidayPackageModel.create(pkg);
            console.log(`  ✓ Added holiday package: ${pkg.title}`);
        } catch (err) {
            console.error(`  ✗ Error adding holiday package ${pkg.title}:`, err.message);
        }
    }
}

// Seed Cruise Packages
async function seedCruisePackages() {
    console.log("🌱 Seeding cruise packages...");
    const cruises = [
        {
            title: "Mediterranean Cruise - 7 Nights",
            departure_port: "Barcelona, Spain",
            departure_dates: JSON.stringify(["2024-06-15", "2024-07-20", "2024-08-10"]),
            price: 1500.00,
            image: "mediterranean-cruise.jpg",
            banner_video_url: "https://youtube.com/watch?v=mediterranean",
            category: "Mediterranean",
            details: "Sail through the beautiful Mediterranean visiting Spain, France, Italy, and Greece. All meals and entertainment included.",
        },
        {
            title: "Caribbean Paradise Cruise",
            departure_port: "Miami, USA",
            departure_dates: JSON.stringify(["2024-05-01", "2024-06-15", "2024-07-30"]),
            price: 1800.00,
            image: "caribbean-cruise.jpg",
            banner_video_url: "https://youtube.com/watch?v=caribbean",
            category: "Caribbean",
            details: "Explore tropical islands, pristine beaches, and vibrant cultures. Includes shore excursions and all onboard activities.",
        },
        {
            title: "Alaska Adventure Cruise",
            departure_port: "Seattle, USA",
            departure_dates: JSON.stringify(["2024-07-01", "2024-08-15"]),
            price: 2200.00,
            image: "alaska-cruise.jpg",
            banner_video_url: "https://youtube.com/watch?v=alaska",
            category: "Adventure",
            details: "Witness glaciers, wildlife, and stunning natural beauty. Expert naturalists on board.",
        },
    ];

    for (const cruise of cruises) {
        try {
            await createCruise(cruise);
            console.log(`  ✓ Added cruise: ${cruise.title}`);
        } catch (err) {
            console.error(`  ✗ Error adding cruise ${cruise.title}:`, err.message);
        }
    }
}

// Seed Visas
async function seedVisas() {
    console.log("🌱 Seeding visas...");
    const visas = [
        {
            country: "United States",
            price: 185.00,
            subject: "Tourist Visa",
            image: "usa-visa.jpg",
            overview: "Apply for a US tourist visa to explore America's iconic landmarks, national parks, and vibrant cities. Processing time: 2-3 weeks.",
        },
        {
            country: "United Kingdom",
            price: 120.00,
            subject: "Standard Visitor Visa",
            image: "uk-visa.jpg",
            overview: "Visit the UK for tourism, business, or to see family and friends. Valid for up to 6 months. Processing time: 3 weeks.",
        },
        {
            country: "Schengen Area",
            price: 80.00,
            subject: "Schengen Visa",
            image: "schengen-visa.jpg",
            overview: "Travel to 27 European countries with a single Schengen visa. Includes France, Germany, Italy, Spain, and more. Processing time: 2-4 weeks.",
        },
        {
            country: "Australia",
            price: 150.00,
            subject: "Tourist Visa",
            image: "australia-visa.jpg",
            overview: "Explore Australia's stunning landscapes, beaches, and cities. Electronic visa available for many nationalities. Processing time: 1-2 weeks.",
        },
        {
            country: "Japan",
            price: 45.00,
            subject: "Tourist Visa",
            image: "japan-visa.jpg",
            overview: "Discover Japan's unique culture, technology, and natural beauty. Visa-free for many countries, or apply for tourist visa. Processing time: 1 week.",
        },
        {
            country: "Dubai/UAE",
            price: 100.00,
            subject: "Tourist Visa",
            image: "dubai-visa.jpg",
            overview: "Visit Dubai and the UAE for tourism or business. Fast processing available. Valid for 30-90 days depending on type.",
        },
    ];

    for (const visa of visas) {
        try {
            await insertVisa(visa);
            console.log(`  ✓ Added visa: ${visa.country}`);
        } catch (err) {
            console.error(`  ✗ Error adding visa ${visa.country}:`, err.message);
        }
    }
}

// Main seeding function
async function seedAll() {
    console.log("🚀 Starting database seeding...\n");
    
    try {
        // Wait a bit for tables to be created
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        await seedActivityCategories();
        await seedActivities();
        await seedCities();
        await seedCityTourCategories();
        await seedCityPackages();
        await seedHolidayCategories();
        await seedHotels();
        await seedHolidayPackages();
        await seedCruiseCategories();
        await seedCruisePackages();
        await seedVisas();
        
        console.log("\n✅ Database seeding completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("\n❌ Error during seeding:", error);
        process.exit(1);
    }
}

// Run seeding
seedAll();

