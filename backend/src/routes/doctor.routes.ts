import { Router } from "express";
import {
  getMyDoctorProfile,
  updateDoctorProfile,
  getDoctorDashboard,
  getDoctorAppointments,
  getDoctorAppointmentById,
  updateAppointmentStatus,
  completeAppointmentWithPrescription,
  applyDoctorLeave,
  getDoctorLeaveAffectedAppointments,
  getDoctorLeaves,
  cancelDoctorLeave,
  getDoctorSlots,
  getAvailableSlotsForDoctor,
  generateDoctorSlots,
  toggleSlotAvailability,
  getAvailableHospitals,
  getDoctorHospitalDetail,
  sendHospitalJoinRequest,
  getMyHospitalAffiliation,
  getHospitalDoctorRequests,
  respondToDoctorRequest,
  getPublicDoctors,
  getPublicDoctorById,
} from "../controllers/doctor.controller.js";
import {
  authenticateToken,
  authorizeRoles,
  requireApprovedAccount,
} from "../middleware/auth.middleware.js";
import { UserRole } from "../constants/index.js";

const doctorRouter = Router();

// ==========================================
// PUBLIC DOCTORS DIRECTORY (Pagination & Discovery)
// ==========================================
doctorRouter.get("/", getPublicDoctors);
doctorRouter.get("/details/:doctorId", getPublicDoctorById);

// ==========================================
// DOCTOR PROTECTED ROUTES (Role: DOCTOR)
// ==========================================

// Profile management
doctorRouter.get("/profile", authenticateToken, authorizeRoles(UserRole.DOCTOR), getMyDoctorProfile);
doctorRouter.patch("/profile", authenticateToken, authorizeRoles(UserRole.DOCTOR), updateDoctorProfile);

// Dashboard & Analytics
doctorRouter.get(
  "/dashboard",
  authenticateToken,
  authorizeRoles(UserRole.DOCTOR),
  requireApprovedAccount,
  getDoctorDashboard
);

// Appointments Management
doctorRouter.get(
  "/appointments",
  authenticateToken,
  authorizeRoles(UserRole.DOCTOR),
  requireApprovedAccount,
  getDoctorAppointments
);

doctorRouter.get(
  "/appointments/:id",
  authenticateToken,
  authorizeRoles(UserRole.DOCTOR),
  requireApprovedAccount,
  getDoctorAppointmentById
);

doctorRouter.patch(
  "/appointments/:id/status",
  authenticateToken,
  authorizeRoles(UserRole.DOCTOR),
  requireApprovedAccount,
  updateAppointmentStatus
);

doctorRouter.post(
  "/appointments/:id/complete",
  authenticateToken,
  authorizeRoles(UserRole.DOCTOR),
  requireApprovedAccount,
  completeAppointmentWithPrescription
);

// Doctor Leaves Management
doctorRouter.get(
  "/leaves/affected-appointments",
  authenticateToken,
  authorizeRoles(UserRole.DOCTOR),
  requireApprovedAccount,
  getDoctorLeaveAffectedAppointments
);

doctorRouter.get(
  "/leaves",
  authenticateToken,
  authorizeRoles(UserRole.DOCTOR),
  requireApprovedAccount,
  getDoctorLeaves
);

doctorRouter.post(
  "/leaves",
  authenticateToken,
  authorizeRoles(UserRole.DOCTOR),
  requireApprovedAccount,
  applyDoctorLeave
);

doctorRouter.delete(
  "/leaves/:id",
  authenticateToken,
  authorizeRoles(UserRole.DOCTOR),
  requireApprovedAccount,
  cancelDoctorLeave
);

doctorRouter.patch(
  "/leaves/:id/cancel",
  authenticateToken,
  authorizeRoles(UserRole.DOCTOR),
  requireApprovedAccount,
  cancelDoctorLeave
);

// Slot Generation & Availability Management
doctorRouter.get(
  "/slots",
  authenticateToken,
  authorizeRoles(UserRole.DOCTOR),
  requireApprovedAccount,
  getDoctorSlots
);

doctorRouter.post(
  "/slots/generate",
  authenticateToken,
  authorizeRoles(UserRole.DOCTOR),
  requireApprovedAccount,
  generateDoctorSlots
);

doctorRouter.patch(
  "/slots/:slotId/toggle",
  authenticateToken,
  authorizeRoles(UserRole.DOCTOR),
  requireApprovedAccount,
  toggleSlotAvailability
);

// Hospital Affiliation & Join Requests
doctorRouter.get(
  "/hospitals/available",
  authenticateToken,
  authorizeRoles(UserRole.DOCTOR),
  getAvailableHospitals
);

doctorRouter.post(
  "/hospitals/join-request",
  authenticateToken,
  authorizeRoles(UserRole.DOCTOR),
  sendHospitalJoinRequest
);

doctorRouter.get(
  "/hospitals/my-affiliation",
  authenticateToken,
  authorizeRoles(UserRole.DOCTOR),
  requireApprovedAccount,
  getMyHospitalAffiliation
);

doctorRouter.get(
  "/hospitals/:hospitalId",
  authenticateToken,
  authorizeRoles(UserRole.DOCTOR),
  getDoctorHospitalDetail
);

// ==========================================
// HOSPITAL ADMIN ROUTES (Manage Doctor Join Requests)
// ==========================================

doctorRouter.get(
  "/hospital-admin/doctor-requests",
  authenticateToken,
  authorizeRoles(UserRole.HOSPITAL_ADMIN),
  getHospitalDoctorRequests
);

doctorRouter.patch(
  "/hospital-admin/doctor-requests/:requestId",
  authenticateToken,
  authorizeRoles(UserRole.HOSPITAL_ADMIN),
  respondToDoctorRequest
);

// ==========================================
// PUBLIC / PATIENT ON-DEMAND SLOTS ROUTE
// ==========================================
doctorRouter.get("/:doctorId/available-slots", getAvailableSlotsForDoctor);

export default doctorRouter;
