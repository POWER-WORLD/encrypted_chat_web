const mongoose = require('mongoose');

let memoryServerInstance = null;
let reconnectTimer = null;
let isConnecting = false;

/**
 * Establishes connection to MongoDB database.
 * Supports external MongoDB connection (URI) with automated local
 * in-memory fallback for local development and non-blocking background
 * retries for production deployment on Render.
 * @returns {Promise<mongoose.Connection|null>}
 */
const connectDB = async () => {
    if (isConnecting) return null;
    if (mongoose.connection.readyState === 1) return mongoose.connection;

    isConnecting = true;
    let mongoUri = process.env.MONGO_URI;
    const isProduction = process.env.NODE_ENV === 'production';
    const isExplicitMemory = mongoUri === 'memory' || process.env.USE_MEMORY_DB === 'true';

    // 1. If explicit memory mode requested (useful for local zero-config testing)
    if (isExplicitMemory) {
        isConnecting = false;
        return await startMemoryServer();
    }

    // 2. Attempt connection to provided external URI if available
    if (mongoUri) {
        try {
            console.log('[DATABASE] Connecting to MongoDB at configured MONGO_URI...');
            const conn = await mongoose.connect(mongoUri, {
                serverSelectionTimeoutMS: 5000,
                autoIndex: true,
            });

            console.log(`[DATABASE_SUCCESS] MongoDB Connected: ${conn.connection.host}`);
            isConnecting = false;
            if (reconnectTimer) {
                clearTimeout(reconnectTimer);
                reconnectTimer = null;
            }
            return conn;
        } catch (error) {
            console.warn(`[DATABASE_WARN] Could not connect to external MONGO_URI (${error.message}).`);

            if (isProduction) {
                console.warn('[DATABASE_NOTICE] Production environment: maintaining HTTP/WebSocket service online without crash loop.');
                console.warn('[DATABASE_DIAGNOSTIC] ACTION REQUIRED: The MongoDB Atlas domain is unreachable or does not exist (querySrv ENOTFOUND).');
                console.warn('[DATABASE_DIAGNOSTIC] Please update MONGO_URI in your Render Dashboard -> Environment tab with an active MongoDB Atlas cluster URI.');
                console.log('[DATABASE_RETRY] Scheduling background reconnection attempt in 15 seconds...');

                isConnecting = false;
                if (!reconnectTimer) {
                    reconnectTimer = setTimeout(() => {
                        reconnectTimer = null;
                        connectDB().catch(() => {});
                    }, 15000);
                }
                return null;
            }

            console.log('[DATABASE_NOTICE] Non-production environment detected. Activating local in-memory MongoDB fallback...');
        }
    } else {
        if (isProduction) {
            console.warn('[DATABASE_WARN] MONGO_URI environment variable is not defined in production.');
            console.warn('[DATABASE_DIAGNOSTIC] ACTION REQUIRED: Please define MONGO_URI in Render Dashboard (Environment tab).');
            isConnecting = false;
            return null;
        }
        console.log('[DATABASE_NOTICE] No MONGO_URI provided. Starting local in-memory MongoDB engine...');
    }

    isConnecting = false;
    // 3. Graceful Local Fallback: MongoMemoryServer for development & offline testing
    return await startMemoryServer();
};

/**
 * Spins up an in-memory MongoDB instance and connects Mongoose
 * @returns {Promise<mongoose.Connection>}
 */
const startMemoryServer = async () => {
    try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        if (!memoryServerInstance) {
            console.log('[DATABASE] Initializing MongoMemoryServer...');
            memoryServerInstance = await MongoMemoryServer.create();
        }

        const inMemoryUri = memoryServerInstance.getUri();
        const conn = await mongoose.connect(inMemoryUri, {
            autoIndex: true,
        });

        console.log(`[DATABASE_SUCCESS] Local In-Memory MongoDB Connected: ${inMemoryUri}`);

        // Seed demo accounts so login/chat works out of the box
        try {
            const { seedDatabase } = require('./seed');
            await seedDatabase({ force: false });
        } catch (seedErr) {
            console.warn('[DATABASE_WARN] Auto-seeding skipped:', seedErr.message);
        }

        return conn;
    } catch (err) {
        console.error('[DATABASE_ERROR] Failed to start in-memory MongoDB engine:', err.message);
        throw err;
    }
};

/**
 * Disconnects from MongoDB database and tears down any active in-memory engine.
 * @returns {Promise<void>}
 */
const disconnectDB = async () => {
    try {
        if (reconnectTimer) {
            clearTimeout(reconnectTimer);
            reconnectTimer = null;
        }
        await mongoose.connection.close();
        if (memoryServerInstance) {
            await memoryServerInstance.stop();
            memoryServerInstance = null;
            console.log('[DATABASE] MongoMemoryServer stopped.');
        }
        console.log('[DATABASE] MongoDB connection closed.');
    } catch (error) {
        console.error(`[DATABASE_ERROR] Error during disconnection: ${error.message}`);
    }
};

module.exports = {
    connectDB,
    disconnectDB,
};
