import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

dotenv.config();

const isDev =
  !process.env.NODE_ENV ||
  process.env.NODE_ENV === "development" ||
  process.env.NODE_ENV === "test";

/**
 * Rate Limiter Configurations
 *
 * For multi-instance deployments, swap to Redis store (rate-limit-redis).
 */

/**
 * Auth Rate Limiter
 * Applied to: /api/auth/login, /api/auth/register/*
 * Limit: 10 requests per 15 minutes per IP (500 in dev)
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 500 : 10,
  skip: (req) => req.method === 'OPTIONS',
  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message:
      "Too many authentication attempts from this IP. Please try again after 15 minutes.",
  },
});

/**
 * Booking Rate Limiter
 * Applied to: /api/appointments/initiate
 * Limit: 5 requests per 10 minutes per IP
 * Prevents slot scalping and rapid booking attempts
 */
export const bookingRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: isDev ? 500 : 5,
  skip: (req) => req.method === 'OPTIONS',
  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message:
      "Too many booking attempts. Please wait 10 minutes before trying again.",
  },
});

/**
 * Payment Verification Rate Limiter
 * Applied to: /api/appointments/verify-payment
 * Limit: 10 requests per 15 minutes per IP
 * Prevents signature brute-force attacks
 */
export const paymentVerifyRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 500 : 10,
  skip: (req) => req.method === 'OPTIONS',
  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message:
      "Too many payment verification attempts. Please try again after 15 minutes.",
  },
});

/**
 * Global API Rate Limiter
 * Applied to: All routes (app-level)
 * Limit: 100 requests per 15 minutes per IP (10000 in dev)
 * Acts as a safety net for all endpoints
 */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 10000 : 100,
  skip: (req) => req.method === 'OPTIONS',
  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message:
      "Too many requests from this IP. Please slow down and try again later.",
  },
});
