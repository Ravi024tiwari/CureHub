import { Router } from "express";
import {
  getAdminHospitals,
  createHospitalForAdmin,
  updateHospitalById,
  deleteHospitalById,
  getAdminJoinRequests,
  getAdminJoinRequestById,
  respondToJoinRequest,
  disaffiliateDoctor,
  getAdminAffiliatedDoctors,
  getHospitalAdminPortalDashboard,
  getAdminAppointments,
  getAdminAppointmentById,
  cancelAdminAppointment,
  rescheduleAdminAppointment,
  bookAdminAppointment,
} from "../controllers/hospitalAdmin.controller.js";
import {
  getHospitalById,
  getHospitalDoctors,
} from "../controllers/hospital.controller.js";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.middleware.js";
import { UserRole } from "../constants/index.js";

const hospitalAdminRouter = Router();

// Secure all routes with authentication and role authorization
hospitalAdminRouter.use(authenticateToken);
hospitalAdminRouter.use(
  authorizeRoles(UserRole.HOSPITAL_ADMIN, UserRole.SUPER_ADMIN)
);

// ── 1. Dashboard & Analytics ────────────────────────────────────────────────
hospitalAdminRouter.get("/dashboard", getHospitalAdminPortalDashboard);

// ── 2. Multi-Hospital Management (CRUD) ─────────────────────────────────────
hospitalAdminRouter.get("/hospitals", getAdminHospitals);
hospitalAdminRouter.post("/hospitals", createHospitalForAdmin);
hospitalAdminRouter.get("/hospitals/:id", getHospitalById);
hospitalAdminRouter.get("/hospitals/:id/doctors", getHospitalDoctors);
hospitalAdminRouter.put("/hospitals/:id", updateHospitalById);
hospitalAdminRouter.patch("/hospitals/:id", updateHospitalById);
hospitalAdminRouter.delete("/hospitals/:id", deleteHospitalById);

// ── 3. Doctor Affiliations & Join Requests ──────────────────────────────────
hospitalAdminRouter.get("/doctors", getAdminAffiliatedDoctors);
hospitalAdminRouter.get("/join-requests", getAdminJoinRequests);
hospitalAdminRouter.get("/join-requests/:requestId", getAdminJoinRequestById);
hospitalAdminRouter.patch("/join-requests/:requestId", respondToJoinRequest);
hospitalAdminRouter.delete(
  "/hospitals/:hospitalId/doctors/:doctorId",
  disaffiliateDoctor
);


// ── 4. Hospital Admin Appointments ───────────────────────────────────────────
hospitalAdminRouter.get("/appointments", getAdminAppointments);
hospitalAdminRouter.post("/appointments", bookAdminAppointment);
hospitalAdminRouter.get("/appointments/:appointmentId", getAdminAppointmentById);
hospitalAdminRouter.patch(
  "/appointments/:appointmentId/cancel",
  cancelAdminAppointment
);
hospitalAdminRouter.patch(
  "/appointments/:appointmentId/reschedule",
  rescheduleAdminAppointment
);

export default hospitalAdminRouter;
