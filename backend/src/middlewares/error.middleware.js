import { NODE_ENV } from "../config/env.config.js";

export default (err, req, res, next) => {

    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    if (statusCode === 500) {
      console.log(`500 - Internal Server Error - ${req.method} ${req.originalUrl} - ${err.message}`, {
            url: req.originalUrl,
            method: req.method,
            ip: req.ip,
            stack: err.stack
        });
    } else {
        console.log(`${statusCode} - ${message} - ${req.method} ${req.originalUrl}`, {
            url: req.originalUrl,
            method: req.method,
            ip: req.ip
        });
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(NODE_ENV === "development" && { stack: err.stack }),
    });
}