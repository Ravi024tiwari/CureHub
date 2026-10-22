import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";
import { ApiError } from "../utils/apiError.js";
import { UserRole } from "../constants/index.js";
import { User } from "../models/User.model.js";

/**
 * Validates JWT access token from cookie or Authorization header
 */
export const authenticateToken = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  let token: string | undefined;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new ApiError(401, "Authentication required. Please log in to continue.")
    );
  }

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    next(new ApiError(401, "Invalid or expired authorization token"));
  }
};

/**
 * Optional token authentication: populates req.user if a valid token is present,
 * but does not reject the request if no token is provided.
 */
export const optionalAuthenticateToken = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  let token: string | undefined;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (token) {
    try {
      const payload = verifyToken(token);
      req.user = payload;
    } catch {
      // invalid token ignored for optional auth
    }
  }

  next();
};

/**
 * Restricts access to specified user roles
 */
export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(
        new ApiError(401, "Authentication required. Please log in to continue.")
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Forbidden: Role '${req.user.role}' is not authorized to access this resource`
        )
      );
    }

    next();
  };
};

/**
 * Ensures that accounts requiring admin approval (DOCTOR, HOSPITAL_ADMIN)
 * have been verified and approved before accessing restricted actions.
 */
export const requireApprovedAccount = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      return next(
        new ApiError(401, "Authentication required. Please log in to continue.")
      );
    }

    // SUPER_ADMIN and PATIENT accounts are pre-approved by system rules
    if (
      req.user.role === UserRole.SUPER_ADMIN ||
      req.user.role === UserRole.PATIENT
    ) {
      return next();
    }

    const user = await User.findById(req.user.userId).select(
      "isAccountApproved isActive role"
    );

    if (!user) {
      return next(new ApiError(404, "User account not found"));
    }

    if (!user.isActive) {
      return next(
        new ApiError(
          403,
          "Your account has been deactivated. Please contact support."
        )
      );
    }

    if (!user.isAccountApproved) {
      return next(
        new ApiError(
          403,
          "Your account is pending verification and approval by the Super Admin."
        )
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};
