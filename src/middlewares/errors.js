import { logger } from "../winston.js";

export const errors = (err, req, res, next) => {
    console.log("err")
    // Log the error
    logger.error('Error occurred:', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        userId: req.userinfo?.sub
    });

    // If headers are already sent, delegate to Express's default error handler
    if (res.headersSent) {
        return next(err);
    }

    // Handle operational errors (expected errors)
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }

    // Handle programming or unknown errors
    return res.status(500).json({
        status: 'error',
        message: 'Something went wrong'
    });
};