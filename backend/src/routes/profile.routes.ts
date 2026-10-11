import { Router } from "express";
import { updatePatientProfile, uploadPatientReport, deletePatientReport, updateDoctorProfile, updateHospitalAdminProfile,
} from "../controllers/profile.controller.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.middleware.js";

import { uploadSingleAvatar, uploadSingleReport, uploadDoctorFiles, uploadHospitalAdminFiles,
} from "../middleware/upload.middleware.js";

import { UserRole } from "../constants/index.js";

const profileRouter = Router();

profileRouter.use(authenticateToken);


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
profileRouter.patch(
  "/hospital-admin",
  authorizeRoles(UserRole.HOSPITAL_ADMIN),
  uploadHospitalAdminFiles,
  updateHospitalAdminProfile
);

export default profileRouter;
