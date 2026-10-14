import { Router } from "express";
import {
  verifyDoctor,
  verifyHospitalAdmin,
  getDoctorsForVerification,
  getDoctorVerificationDetails,
  getHospitalAdminsForVerification,
  getHospitalAdminVerificationDetails,
  getVerificationStats,
  getAdminDashboardAnalytics,
} from "../controllers/admin.controller.js";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.middleware.js";
import { UserRole } from "../constants/index.js";

const adminRouter = Router();

// Protect all admin routes with authentication and SUPER_ADMIN authorization
adminRouter.use(authenticateToken, authorizeRoles(UserRole.SUPER_ADMIN));

// Production Admin Dashboard Analytics & KPIs
adminRouter.get("/dashboard", getAdminDashboardAnalytics);

// Overview verification stats
adminRouter.get("/verifications/stats", getVerificationStats);

// Doctor verification routes
adminRouter.get("/verifications/doctors", getDoctorsForVerification);
adminRouter.get("/verifications/doctors/:id", getDoctorVerificationDetails);
adminRouter.patch("/verifications/doctors/:id", verifyDoctor);

// Hospital Admin verification routes
adminRouter.get("/verifications/hospital-admins", getHospitalAdminsForVerification);
adminRouter.get("/verifications/hospital-admins/:id",getHospitalAdminVerificationDetails);
adminRouter.patch("/verifications/hospital-admins/:id", verifyHospitalAdmin);

export default adminRouter;
