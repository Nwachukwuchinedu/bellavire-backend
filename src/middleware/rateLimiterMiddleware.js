import rateLimit from "express-rate-limit";

export function createRateLimiter({ windowMs, max, message }) {
    return rateLimit({
        windowMs,
        max,
        message: { message },
        standardHeaders: true,
        legacyHeaders: false,
    });
}
