import { Router } from "express";
import {
  getPatientProfile,
  updatePatientProfile,
  uploadPatientReport,
  deletePatientReport,
  updateDoctorProfile,
  updateHospitalAdminProfile,
  getHospitalAdminProfile,
} from "../controllers/profile.controller.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.middleware.js";

import {
  uploadSingleAvatar,
  uploadSingleReport,
  uploadDoctorFiles,
  uploadHospitalAdminFiles,
} from "../middleware/upload.middleware.js";

import { UserRole } from "../constants/index.js";

const profileRouter = Router();

profileRouter.use(authenticateToken);

// ================= PATIENT PROFILE ROUTES =================
profileRouter.get(
  "/patient",
  authorizeRoles(UserRole.PATIENT),
  getPatientProfile
);

profileRouter.patch(
  "/patient",
  authorizeRoles(UserRole.PATIENT),
  uploadSingleAvatar,
  updatePatientProfile
);

profileRouter.post(
  "/patient/reports",
  authorizeRoles(UserRole.PATIENT),
  uploadSingleReport,
  uploadPatientReport
);

profileRouter.delete(
  "/patient/reports/:reportId",
  authorizeRoles(UserRole.PATIENT),
  deletePatientReport
);

// ================= DOCTOR PROFILE ROUTES =================
profileRouter.patch(
  "/doctor",
  authorizeRoles(UserRole.DOCTOR),
  uploadDoctorFiles,
  updateDoctorProfile
);

// ================= HOSPITAL ADMIN PROFILE ROUTES =================
profileRouter.get(
  "/hospital-admin",
  authorizeRoles(UserRole.HOSPITAL_ADMIN),
  getHospitalAdminProfile
);

profileRouter.patch(
  "/hospital-admin",
  authorizeRoles(UserRole.HOSPITAL_ADMIN),
  uploadHospitalAdminFiles,
  updateHospitalAdminProfile
);

export default profileRouter;
