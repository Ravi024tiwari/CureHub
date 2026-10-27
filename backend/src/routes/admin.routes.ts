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
  getAllDoctorsForAdmin,
  toggleDoctorAccountStatus,
  getAllHospitalAdminsForAdmin,
  getHospitalAdminDetailsForAdmin,
  toggleHospitalAdminAccountStatus,
  exportHospitalAdminsList,
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

// Full Doctor Directory & Management routes
adminRouter.get("/doctors", getAllDoctorsForAdmin);
adminRouter.get("/doctors/:id", getDoctorVerificationDetails);
adminRouter.patch("/doctors/:id/status", toggleDoctorAccountStatus);

// Hospital Admin verification routes
adminRouter.get("/verifications/hospital-admins", getHospitalAdminsForVerification);
adminRouter.get("/verifications/hospital-admins/:id", getHospitalAdminVerificationDetails);
adminRouter.patch("/verifications/hospital-admins/:id", verifyHospitalAdmin);

// Full Hospital Admin Directory & Management routes
adminRouter.get("/hospital-admins", getAllHospitalAdminsForAdmin);
adminRouter.get("/hospital-admins/export", exportHospitalAdminsList);
adminRouter.get("/hospital-admins/:id", getHospitalAdminDetailsForAdmin);
adminRouter.patch("/hospital-admins/:id/status", toggleHospitalAdminAccountStatus);

export default adminRouter;

