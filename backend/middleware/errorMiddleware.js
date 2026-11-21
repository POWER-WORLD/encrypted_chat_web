/**
 * 404 Not Found Middleware
 * Intercepts requests to unregistered routes and passes 404 error to error handler.
 */
const notFound = (req, res, next) => {
    const error = new Error(`Resource Not Found - ${req.method} ${req.originalUrl}`);
    res.status(404);
    next(error);
};

/**
 * Global Error Handling Middleware
 * Normalizes error responses, formats status codes, and sanitizes stack traces in production.
 */
const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message || 'Internal Server Error';

    // Mongoose bad ObjectId format (CastError)
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        statusCode = 400;
        message = `Invalid ID format for resource: ${err.value}`;
    }

    // Mongoose schema validation failure
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors)
            .map((val) => val.message)
            .join(', ');
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue || {})[0] || 'field';
        message = `Duplicate field value entered: A record with that ${field} already exists.`;
    }

    // JWT token parsing / expiration errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid authentication token';
    }
    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Authentication token has expired';
    }

    res.status(statusCode).json({
        success: false,
        message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = {
    notFound,
    errorHandler,
};
