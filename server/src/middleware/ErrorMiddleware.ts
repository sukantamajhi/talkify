// errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import logger from '../../logger';
import { CommonMessages } from '../utils/messages';

// Custom error interface for better type checking
interface CustomError extends Error {
    status?: number;
    code?: string;
}

function errorHandler(
    err: CustomError,
    req: Request,
    res: Response,
    next: NextFunction
): void {
    // Log the error using your logger (ensure the logger has the .error method)
    logger.error(err, '<<-- Error in handling request');

    // Set default error code and message if not provided
    const errorCode = err.code || 'ERROR';
    const errorMessage = err.message || err || CommonMessages.ERROR;

    // Determine the status code
    const statusCode = err.status || 500;

    const stack = process.env.NODE_ENV === 'production' ? '🥞' : err.stack;

    // Send the error response in the desired format
    res.status(statusCode).json({
        error: true,
        code: errorCode,
        message: errorMessage,
        stack,
    });
}

export default errorHandler;
