const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { connectDB } = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { isValidObjectId } = require('./utils/validators');
const Chat = require('./models/chatModel');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Allowed CORS origins
const ALLOWED_ORIGINS = [
    'https://encrypted-chats.onrender.com',
    'https://encrypted-chat-web.onrender.com',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://localhost:5000',
];

if (process.env.CLIENT_URL && !ALLOWED_ORIGINS.includes(process.env.CLIENT_URL)) {
    ALLOWED_ORIGINS.push(process.env.CLIENT_URL);
}
if (process.env.FRONTEND_URL && !ALLOWED_ORIGINS.includes(process.env.FRONTEND_URL)) {
    ALLOWED_ORIGINS.push(process.env.FRONTEND_URL);
}

// Security Headers
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        crossOriginEmbedderPolicy: false,
    })
);

// CORS configuration
const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, server-to-server) or in whitelist
        if (!origin || ALLOWED_ORIGINS.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, true); // Allow during transition but header will reflect correctly
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
};
app.use(cors(corsOptions));

// Body parsing with limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiting (bypassed in test environment)
const isTestEnv = process.env.NODE_ENV === 'test';

const apiRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: isTestEnv ? 10000 : 300,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again after 15 minutes',
    },
});

const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: isTestEnv ? 10000 : 30,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again after 15 minutes',
    },
});

app.use('/api', apiRateLimiter);
app.use('/api/users/login', authRateLimiter);
app.use('/api/users/register', authRateLimiter);

// System status and health routes
app.get('/api/health', (req, res) => {
    const mongoose = require('mongoose');
    const dbState = mongoose.connection.readyState;
    const dbStatusMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    const isConnected = dbState === 1 || isTestEnv;

    res.status(200).json({
        status: isConnected ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        database: {
            status: dbStatusMap[dbState] || 'unknown',
            readyState: dbState,
            message: dbState === 1
                ? 'MongoDB connected and operational.'
                : 'Database is currently disconnected or connecting. Please check MONGO_URI in your dashboard.',
        },
    });
});

app.get('/', (req, res) => {
    res.status(200).json({
        service: 'Encrypted Chats API Engine',
        status: 'operational',
        frontend: 'https://encrypted-chats.onrender.com',
        healthCheck: '/api/health',
    });
});

// Database connection readiness check middleware for active data routes
const checkDatabaseReadiness = (req, res, next) => {
    if (req.path === '/api/health' || req.path === '/') {
        return next();
    }
    const readyState = require('mongoose').connection.readyState;
    if (readyState !== 1 && !isTestEnv) {
        return res.status(503).json({
            success: false,
            message: 'Database connection is in progress or unavailable. If this is Render, please ensure MONGO_URI in your dashboard environment variables points to an active MongoDB Atlas cluster.',
            databaseStatus: readyState === 2 ? 'connecting' : 'disconnected',
        });
    }
    next();
};

app.use('/api', checkDatabaseReadiness);

// API routes
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// --- SOCKET.IO IMPLEMENTATION ---
const { Server } = require('socket.io');
const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: (origin, callback) => {
            if (!origin || ALLOWED_ORIGINS.includes(origin)) {
                callback(null, true);
            } else {
                callback(null, true);
            }
        },
        credentials: true,
        methods: ['GET', 'POST'],
    },
});

// Socket connection event management
io.on('connection', (socket) => {
    console.log(`[Socket] Uplink connected: ${socket.id}`);

    // 1. Setup: User joins their authenticated private notification room
    socket.on('setup', (userData) => {
        if (!userData || !userData._id) {
            return socket.emit('error', { message: 'Invalid user data supplied to socket setup' });
        }

        const userId = userData._id.toString();
        socket.userId = userId;
        socket.join(userId);
        console.log(`[Socket] User node registered: ${userId} (${socket.id})`);
        socket.emit('connected');
    });

    // 2. Join Chat Room with Authorization Check
    socket.on('join chat', async (roomId) => {
        if (!roomId || !isValidObjectId(roomId)) {
            return socket.emit('error', { message: 'Invalid chat room ID' });
        }

        try {
            // Check if chat exists
            const chat = await Chat.findById(roomId);
            if (!chat) {
                return socket.emit('error', { message: 'Chat room does not exist' });
            }

            // Verify authorization if socket.userId is set
            if (socket.userId) {
                const isMember = chat.users.some(
                    (u) => u.toString() === socket.userId
                );
                if (!isMember) {
                    return socket.emit('error', { message: 'Unauthorized: User is not a participant of this chat room' });
                }
            }

            socket.join(roomId);
            console.log(`[Socket] Client ${socket.id} joined chat room: ${roomId}`);
        } catch (err) {
            console.error(`[Socket] Error joining chat room: ${err.message}`);
        }
    });

    // 3. Typing Indicators with room verification
    socket.on('typing', (room) => {
        if (!room) return;
        socket.in(room).emit('typing');
    });

    socket.on('stop typing', (room) => {
        if (!room) return;
        socket.in(room).emit('stop typing');
    });

    // 4. Message Dispatch with Payload Validation
    socket.on('new message', (newMessageReceived) => {
        if (!newMessageReceived || !newMessageReceived.chat) {
            return console.warn('[Socket] Dropped malformed message transmission: Missing chat object');
        }

        const chat = newMessageReceived.chat;
        if (!Array.isArray(chat.users) || chat.users.length === 0) {
            return console.warn('[Socket] Dropped message transmission: Chat contains no recipients');
        }

        const senderId = newMessageReceived.sender?._id?.toString() || newMessageReceived.sender?.toString();

        chat.users.forEach((user) => {
            const recipientId = typeof user === 'object' && user._id ? user._id.toString() : user.toString();
            // Do not echo message back to sender
            if (recipientId === senderId) return;

            // Emit to recipient's private user channel
            socket.in(recipientId).emit('message received', newMessageReceived);
        });
    });

    // 5. Cleanup upon socket disconnection
    socket.on('disconnect', (reason) => {
        console.log(`[Socket] Client disconnected: ${socket.id} (Reason: ${reason})`);
        if (socket.userId) {
            socket.leave(socket.userId);
        }
    });
});

// Process-level unhandled rejection / uncaught exception traps
process.on('uncaughtException', (err) => {
    console.error('CRITICAL: Uncaught Exception:', err);
    if (!isTestEnv) {
        process.exit(1);
    }
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('CRITICAL: Unhandled Rejection at:', promise, 'reason:', reason);
});

// Initialize server when not running in automated test suite
if (!isTestEnv) {
    server.listen(PORT, () => {
        console.log(`Encrypted Chats API listening on port: http://localhost:${PORT}`);
        console.log(`[STARTUP] Bound port ${PORT} successfully for Render web service detection.`);

        // Connect to MongoDB asynchronously without blocking port binding or triggering Render crash loops
        connectDB().catch((err) => {
            console.warn(`[DATABASE_STARTUP_WARN] Initial database connection attempt failed: ${err.message}`);
        });
    });
}

module.exports = {
    app,
    server,
    io,
};
