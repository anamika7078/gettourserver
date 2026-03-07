/*
    Improved MySQL connection handling:
    - Ensures database exists
    - Uses a connection pool (prevents single idle connection timeout)
    - Adds lightweight keepalive ping
    - Handles common disconnect errors gracefully
*/

const dotenv = require("dotenv");
const mysql = require("mysql2");
dotenv.config();

const {
    DB_HOST,
    DB_USER,
    DB_PASSWORD,
    DB_NAME,
    DB_CONNECTION_LIMIT = 10,
} = process.env;

// First ensure the database exists using a temporary connection
function ensureDatabase(callback) {
    const tmp = mysql.createConnection({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
        multipleStatements: true,
    });
    tmp.connect((err) => {
        if (err) return callback(err);
        tmp.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``, (createErr) => {
            if (createErr) return callback(createErr);
            tmp.end();
            callback(null);
        });
    });
}

// Create pool after DB exists
let pool; // exported later
ensureDatabase((err) => {
    if (err) {
        console.error("❌ Failed ensuring database:", err.message);
        process.exit(1);
    }
    pool = mysql.createPool({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
        waitForConnections: true,
        connectionLimit: parseInt(DB_CONNECTION_LIMIT, 10),
        queueLimit: 0,
        multipleStatements: true,
    });
    console.log(`✅ MySQL pool ready (db: ${DB_NAME})`);

    // Keepalive ping every 15 minutes to avoid idle disconnect (adjust if needed)
    const KEEPALIVE_MS = 15 * 60 * 1000;
    setInterval(() => {
        pool.query("SELECT 1", (e) => {
            if (e) console.warn("⚠️ Keepalive query failed:", e.code || e.message);
        });
    }, KEEPALIVE_MS).unref();
});

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
const originalEnsureCb = ensureDatabase;
// We already call ensureDatabase earlier; append flush inside existing callback by wrapping
// (Simpler: add flush directly after pool creation above.) Add hook below by monkey patching ensureDatabase if needed.
// Flush occurs just after pool creation in the ensureDatabase callback block.

// Modify existing ensureDatabase callback injection: easiest is append setTimeout flush once pool ready
const FLUSH_CHECK_MS = 250;
const flushInterval = setInterval(() => {
    if (pool) {
        flushPending();
        clearInterval(flushInterval);
    }
}, FLUSH_CHECK_MS);
flushInterval.unref();

module.exports = dbInterface;
