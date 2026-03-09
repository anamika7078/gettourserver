/*
    Improved MySQL connection handling:
    - Ensures database exists
    - Uses a connection pool (prevents single idle connection timeout)
    - Adds lightweight keepalive ping
    - Handles common disconnect errors gracefully
    - Supports JSON data mode to skip database connection
*/

const dotenv = require("dotenv");
const mysql = require("mysql2");
dotenv.config();

const {
    DB_HOST,
    DB_USER,
    DB_PASSWORD,
    DB_NAME,
    DB_PORT = 3306,
    DB_CONNECTION_LIMIT = 10,
    DB_SSL = false,
} = process.env;

// First ensure the database exists using a temporary connection
function ensureDatabase(callback) {
    // Validate required environment variables
    if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
        const missing = [];
        if (!DB_HOST) missing.push('DB_HOST');
        if (!DB_USER) missing.push('DB_USER');
        if (!DB_PASSWORD) missing.push('DB_PASSWORD');
        if (!DB_NAME) missing.push('DB_NAME');
        return callback(new Error(`Missing required environment variables: ${missing.join(', ')}`));
    }

    const connectionConfig = {
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
        port: parseInt(DB_PORT, 10),
        multipleStatements: true,
        connectTimeout: 10000, // 10 second timeout
    };

    // Add SSL if required (common for cloud databases)
    if (DB_SSL === 'true' || DB_SSL === true) {
        connectionConfig.ssl = { rejectUnauthorized: false };
    }

    const tmp = mysql.createConnection(connectionConfig);
    tmp.connect((err) => {
        if (err) {
            console.error(`❌ Database connection failed to ${DB_HOST}:`, err.message);
            console.error(`   Error code: ${err.code || 'UNKNOWN'}`);
            return callback(err);
        }
        tmp.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``, (createErr) => {
            if (createErr) {
                console.error(`❌ Failed to create database '${DB_NAME}':`, createErr.message);
                tmp.end();
                return callback(createErr);
            }
            tmp.end();
            callback(null);
        });
    });
}

// Create pool after DB exists
let pool; // exported later

// Create a dummy pool for JSON mode or when database fails
function createDummyPool(message) {
    return {
        query: function(sql, params, callback) {
            const err = new Error(message);
            if (typeof params === 'function') {
                callback = params;
                callback(err);
            } else if (callback) {
                callback(err);
            } else {
                return Promise.reject(err);
            }
        },
        on: function() {},
        getConnection: function(callback) {
            if (callback) callback(new Error(message));
            return Promise.reject(new Error(message));
        }
    };
}

// Skip database initialization if JSON mode is enabled
if (process.env.USE_JSON_DATA === "true" || process.env.USE_JSON_DATA === "1") {
    console.log("📦 JSON data mode enabled - skipping database connection");
    console.log("✅ Server will use JSON files from backend/data/ directory");
    pool = createDummyPool("Database not available - using JSON data mode");
} else {
    // Normal database initialization
    ensureDatabase((err) => {
        if (err) {
            console.error("❌ Failed ensuring database:", err.message);
            console.error("   Please check your database configuration:");
            console.error(`   - DB_HOST: ${DB_HOST ? '✓ Set' : '✗ Missing'}`);
            console.error(`   - DB_USER: ${DB_USER ? '✓ Set' : '✗ Missing'}`);
            console.error(`   - DB_PASSWORD: ${DB_PASSWORD ? '✓ Set' : '✗ Missing'}`);
            console.error(`   - DB_NAME: ${DB_NAME ? '✓ Set' : '✗ Missing'}`);
            console.warn("⚠️  Database connection failed - API will use JSON data fallback");
            // Don't exit - let the app continue with JSON data
            pool = createDummyPool("Database connection failed");
            return;
        }
        
        const poolConfig = {
            host: DB_HOST,
            user: DB_USER,
            password: DB_PASSWORD,
            database: DB_NAME,
            port: parseInt(DB_PORT, 10),
            waitForConnections: true,
            connectionLimit: parseInt(DB_CONNECTION_LIMIT, 10),
            queueLimit: 0,
            multipleStatements: true,
            connectTimeout: 10000,
        };

        // Add SSL if required (common for cloud databases)
        if (DB_SSL === 'true' || DB_SSL === true) {
            poolConfig.ssl = { rejectUnauthorized: false };
        }

        pool = mysql.createPool(poolConfig);
        console.log(`✅ MySQL pool ready (db: ${DB_NAME})`);

        // Keepalive ping every 15 minutes to avoid idle disconnect (adjust if needed)
        const KEEPALIVE_MS = 15 * 60 * 1000;
        setInterval(() => {
            pool.query("SELECT 1", (e) => {
                if (e) console.warn("⚠️ Keepalive query failed:", e.code || e.message);
            });
        }, KEEPALIVE_MS).unref();
    });
}

// Helper to run queries using promises (preferred)
function query(sql, params = []) {
    if (!pool) {
        return Promise.reject(new Error("Pool not initialized yet"));
    }
    return new Promise((resolve, reject) => {
        pool.query(sql, params, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
}

// Graceful error logging for pooled connections
function attachErrorLogging() {
    if (!pool) return;
    pool.on("error", (err) => {
        // Pool-level errors are rare; log them for visibility
        console.error("🛑 MySQL pool error:", err.code, err.message);
    });
}
setTimeout(attachErrorLogging, 5000).unref();

// Backward-compatible export expected by existing models: an object with a `query` method.
// We also queue queries issued before the pool is ready (module load race conditions).
const pendingQueries = [];

function runOrQueue(exec) {
    if (pool) exec(); else pendingQueries.push(exec);
}

function flushPending() {
    if (!pool || pendingQueries.length === 0) return;
    pendingQueries.splice(0).forEach(fn => {
        try { fn(); } catch (e) { console.error("❌ Pending query failed:", e.message); }
    });
}

// Legacy style (sql, callback) or (sql, params, callback) or promise if no callback
function legacyQuery(sql, params, callback) {
    // Normalize arguments
    if (typeof params === 'function') {
        callback = params;
        params = [];
    }
    params = params || [];

    if (typeof callback === 'function') {
        runOrQueue(() => {
            pool.query(sql, params, (err, results) => {
                callback(err, results);
            });
        });
        return; // callback style no return value
    }
    // Promise style
    return new Promise((resolve, reject) => {
        runOrQueue(() => {
            pool.query(sql, params, (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    });
}

// Expose legacyQuery as object with .query method for db.query(...) calls
const dbInterface = {
    query: legacyQuery,
    changeUser: function (_opts, cb) { if (cb) cb(); }, // harmless stub
    escape: (val) => mysql.escape(val),
    format: (sql, inserts) => mysql.format(sql, inserts),
    getPool: () => pool,
};

// After pool initializes flush queued queries
const FLUSH_CHECK_MS = 250;
const flushInterval = setInterval(() => {
    if (pool) {
        flushPending();
        clearInterval(flushInterval);
    }
}, FLUSH_CHECK_MS);
flushInterval.unref();

module.exports = dbInterface;
