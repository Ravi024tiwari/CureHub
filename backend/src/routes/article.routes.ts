import { Router } from "express";
import {
  createArticle,
  getMyDoctorArticles,
  getDoctorArticleById,
  updateArticle,
  deleteArticle,
  getPublishedArticles,
  getArticleCategories,
  getArticleBySlug,
  toggleLikeArticle,
} from "../controllers/article.controller.js";
import {
  authenticateToken,
  authorizeRoles,
  requireApprovedAccount,
} from "../middleware/auth.middleware.js";
import { UserRole } from "../constants/index.js";

const articleRouter = Router();

// ==========================================
// 1. DOCTOR SPECIFIC ROUTES (PROTECTED)
// ==========================================
// Only verified doctors can author, view their own drafts, and manage articles
articleRouter.post(
  "/doctor",
  authenticateToken,
  authorizeRoles(UserRole.DOCTOR),
  requireApprovedAccount,
  createArticle
);

articleRouter.get(
  "/doctor/my-articles",
  authenticateToken,
  authorizeRoles(UserRole.DOCTOR),
  requireApprovedAccount,
  getMyDoctorArticles
);

articleRouter.get(
  "/doctor/:id",
  authenticateToken,
  authorizeRoles(UserRole.DOCTOR),
  requireApprovedAccount,
  getDoctorArticleById
);

articleRouter.put(
  "/doctor/:id",
  authenticateToken,
  authorizeRoles(UserRole.DOCTOR),
  requireApprovedAccount,
  updateArticle
);

articleRouter.delete(
  "/doctor/:id",
  authenticateToken,
  authorizeRoles(UserRole.DOCTOR),
  requireApprovedAccount,
  deleteArticle
);

// ==========================================
// 2. PUBLIC & PATIENT ROUTES
// ==========================================
articleRouter.get("/", getPublishedArticles);
articleRouter.get("/categories", getArticleCategories);
articleRouter.get("/:slugOrId", getArticleBySlug);
articleRouter.post("/:id/like", authenticateToken, toggleLikeArticle);

export default articleRouter;
