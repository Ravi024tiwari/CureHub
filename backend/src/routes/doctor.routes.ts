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
  getDoctorLeaves,
  cancelDoctorLeave,
  getDoctorSlots,
  getAvailableSlotsForDoctor,
  generateDoctorSlots,
  toggleSlotAvailability,
  getAvailableHospitals,
  sendHospitalJoinRequest,
  getMyHospitalAffiliation,
  getHospitalDoctorRequests,
  respondToDoctorRequest,
} from "../controllers/doctor.controller.js";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.middleware.js";
import { UserRole } from "../constants/index.js";

const doctorRouter = Router();

// ==========================================
// DOCTOR PROTECTED ROUTES (Role: DOCTOR)
// ==========================================

// Profile management
doctorRouter.get( "/profile", authenticateToken, authorizeRoles(UserRole.DOCTOR),getMyDoctorProfile );

doctorRouter.patch( "/profile", authenticateToken, authorizeRoles(UserRole.DOCTOR),updateDoctorProfile) ;

// Dashboard & Analytics
doctorRouter.get(
  "/dashboard",
  authenticateToken,
  authorizeRoles(UserRole.DOCTOR),
  getDoctorDashboard
);

// Appointments Management
doctorRouter.get(
  "/appointments",
  authenticateToken,
  authorizeRoles(UserRole.DOCTOR),
  getDoctorAppointments
);

doctorRouter.get(
  "/appointments/:id",
  authenticateToken,
  authorizeRoles(UserRole.DOCTOR),
  getDoctorAppointmentById
);

doctorRouter.patch(
  "/appointments/:id/status",
  authenticateToken,
  authorizeRoles(UserRole.DOCTOR),
  updateAppointmentStatus
);

doctorRouter.post(
  "/appointments/:id/complete",
  authenticateToken,
  authorizeRoles(UserRole.DOCTOR),
  completeAppointmentWithPrescription
);

// Doctor Leaves Management
doctorRouter.post(
  "/leaves",
  authenticateToken,
  authorizeRoles(UserRole.DOCTOR),
  applyDoctorLeave
);

doctorRouter.get(
  "/leaves",
  authenticateToken,
  authorizeRoles(UserRole.DOCTOR),
  getDoctorLeaves
);

doctorRouter.delete(
  "/leaves/:date",
  authenticateToken,
  authorizeRoles(UserRole.DOCTOR),
  cancelDoctorLeave
);

// Slot Generation & Availability Management
doctorRouter.get(
  "/slots",
  authenticateToken,
  authorizeRoles(UserRole.DOCTOR),
  getDoctorSlots
);

doctorRouter.post(
  "/slots/generate",
  authenticateToken,
  authorizeRoles(UserRole.DOCTOR),
  generateDoctorSlots
);

doctorRouter.patch(
  "/slots/:slotId/toggle",
  authenticateToken,
  authorizeRoles(UserRole.DOCTOR),
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
  getMyHospitalAffiliation
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
