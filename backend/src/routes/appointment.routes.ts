import { Router } from "express";
import {
  bookAppointment,
  getAppointmentHistory,
  getAppointmentDetails,
  getPatientDashboard,
  cancelAppointment,
  rescheduleAppointment,
} from "../controllers/appointment.controller.js";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.middleware.js";
import { UserRole } from "../constants/index.js";

const appointmentRouter = Router();

// All appointment routes require authentication
appointmentRouter.use(authenticateToken);

// Patient Dashboard overview
appointmentRouter.get("/my-dashboard", authorizeRoles(UserRole.PATIENT),getPatientDashboard );

// Patient Appointment History with filters & pagination
appointmentRouter.get( "/my-history", authorizeRoles(UserRole.PATIENT), getAppointmentHistory );

// Book new appointment
appointmentRouter.post( "/book", authorizeRoles(UserRole.PATIENT), bookAppointment );

// Particular appointment details (accessible by appointment participants)
appointmentRouter.get( "/:id", getAppointmentDetails );

// Cancel appointment (Enforces 2-day prior policy)
appointmentRouter.patch( "/:id/cancel", authorizeRoles(UserRole.PATIENT),cancelAppointment );

// Reschedule appointment (Enforces 2-day prior policy)
appointmentRouter.patch( "/:id/reschedule", authorizeRoles(UserRole.PATIENT), rescheduleAppointment );

export default appointmentRouter;
