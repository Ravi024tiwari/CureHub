import { Router } from "express";
import {
  getPatientDashboard,
  getPatientPrescriptions,
  getPatientReports,
  uploadPatientReport,
  deletePatientReport,
  toggleReportFavorite,
  getPatientMedicalHistory,
  updatePatientMedicalHistory,
} from "../controllers/patient.controller.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.middleware.js";
import { uploadSingleReport } from "../middleware/upload.middleware.js";
import { UserRole } from "../constants/index.js";

const patientRouter = Router();

// Protect all patient routes with JWT authentication & PATIENT role authorization
patientRouter.use(authenticateToken, authorizeRoles(UserRole.PATIENT));

// 1. Patient Dashboard overview
patientRouter.get("/dashboard", getPatientDashboard);

// 2. Prescription Locker (EHR History across all completed consultations)
patientRouter.get("/prescriptions", getPatientPrescriptions);

// 3. Medical Reports Vault (EHR Lab Tests, Scans, Diagnostic Reports)
patientRouter.get("/reports", getPatientReports);
patientRouter.post("/reports", uploadSingleReport, uploadPatientReport);
patientRouter.delete("/reports/:reportId", deletePatientReport);
patientRouter.patch("/reports/:reportId/favorite", toggleReportFavorite);

// 4. Medical History & Chronic Conditions (Allergies, Surgeries, Medications, Emergency Contact)
patientRouter.get("/medical-history", getPatientMedicalHistory);
patientRouter.patch("/medical-history", updatePatientMedicalHistory);

export default patientRouter;
