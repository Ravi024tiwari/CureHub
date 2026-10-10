import jwt from "jsonwebtoken";
import { CookieOptions } from "express";
import { UserRole } from "../constants/index.js";

export interface JwtPayload {
  userId: string;
  role: UserRole;
  email: string;
}

const getJwtSecret = (): string => {
  return process.env.JWT_SECRET! 
};

export const generateToken = (payload: JwtPayload): string => {
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign(payload, getJwtSecret(), { expiresIn: expiresIn as any });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, getJwtSecret()) as JwtPayload;
};

// Production-grade secure HTTP-only cookie configuration
export const getCookieOptions = (): CookieOptions => ({
  httpOnly: true, // Prevents XSS attacks from reading the token
  secure: process.env.NODE_ENV === "production", // HTTPS only in production
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Protects against CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});
