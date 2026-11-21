const mongoose = require('mongoose');

let reconnectTimer = null;
let isConnecting = false;

/**
 * Establishes connection to MongoDB database using the environment-provided MONGO_URI.
 * Includes non-blocking automatic background retry logic to prevent container crash-loops on Render.
 * @returns {Promise<mongoose.Connection|null>}
 */
const connectDB = async () => {
    if (isConnecting) return null;
    if (mongoose.connection.readyState === 1) return mongoose.connection;

    isConnecting = true;
    const mongoUri = process.env.MONGO_URI;
    const isProduction = process.env.NODE_ENV === 'production';

    if (!mongoUri) {
        console.warn('[DATABASE_WARN] MONGO_URI environment variable is not defined.');
        console.warn('[DATABASE_ACTION] Please set MONGO_URI in your environment (.env locally or Render Dashboard).');
        isConnecting = false;
        return null;
    }

    try {
        console.log('[DATABASE] Connecting to MongoDB at configured MONGO_URI...');
        const conn = await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000,
            autoIndex: !isProduction, // Enable autoIndex in dev, disable in production for performance
        });

        console.log(`[DATABASE_SUCCESS] MongoDB Connected: ${conn.connection.host}`);
        isConnecting = false;

        if (reconnectTimer) {
            clearTimeout(reconnectTimer);
            reconnectTimer = null;
        }

        return conn;
    } catch (error) {
        console.warn(`[DATABASE_WARN] Could not connect to MongoDB: ${error.message}`);
        console.warn('[DATABASE_ACTION] Please ensure your MongoDB Atlas cluster is online and MONGO_URI is valid.');
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
};

/**
 * Disconnects from MongoDB database.
 * @returns {Promise<void>}
 */
const disconnectDB = async () => {
    try {
        if (reconnectTimer) {
            clearTimeout(reconnectTimer);
            reconnectTimer = null;
        }
        await mongoose.connection.close();
        console.log('[DATABASE] MongoDB connection closed successfully.');
    } catch (error) {
        console.error(`[DATABASE_ERROR] Error during disconnection: ${error.message}`);
    }
};

module.exports = {
    connectDB,
    disconnectDB,
};
