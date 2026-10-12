import { Router } from "express";
import {
  createReview,
  updateReview,
  deleteReview,
  getDoctorReviews,
  getMyReviews,
} from "../controllers/review.controller.js";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.middleware.js";
import { UserRole } from "../constants/index.js";

const reviewRouter = Router();

// Public route to view doctor reviews and rating distribution analytics
reviewRouter.get("/doctor/:doctorId", getDoctorReviews);

// Protected Patient routes
reviewRouter.post(
  "/",
  authenticateToken,
  authorizeRoles(UserRole.PATIENT),
  createReview
);

reviewRouter.get(
  "/my-reviews",
  authenticateToken,
  authorizeRoles(UserRole.PATIENT),
  getMyReviews
);

reviewRouter.patch(
  "/:id",
  authenticateToken,
  authorizeRoles(UserRole.PATIENT),
  updateReview
);

reviewRouter.delete(
  "/:id",
  authenticateToken,
  authorizeRoles(UserRole.PATIENT),
  deleteReview
);

export default reviewRouter;
