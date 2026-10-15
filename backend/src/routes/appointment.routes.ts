import { Router } from "express";
import {
  getAppointmentHistory,
  getAppointmentDetails,
  cancelAppointment,
  rescheduleAppointment,
  downloadPrescriptionPdf,
} from "../controllers/appointment.controller.js";
import {
  initiateBooking,
  verifyPayment,
} from "../controllers/payment.controller.js";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.middleware.js";
import {
  bookingRateLimiter,
  paymentVerifyRateLimiter,
} from "../middleware/rateLimiter.middleware.js";
import { UserRole } from "../constants/index.js";

const appointmentRouter = Router();

// All appointment routes require authentication
appointmentRouter.use(authenticateToken);

// ─── Payment Flow (Razorpay 2-Step Checkout) ─────────────────────────────────

// Step 1: Initiate booking → locks slot for 5 min + creates Razorpay order
appointmentRouter.post(
  "/initiate",
  authorizeRoles(UserRole.PATIENT),
  bookingRateLimiter,
  initiateBooking
);

// Step 2: Verify payment → cryptographic signature check + confirm appointment
appointmentRouter.post(
  "/verify-payment",
  authorizeRoles(UserRole.PATIENT),
  paymentVerifyRateLimiter,
  verifyPayment
);


// Patient Appointment History with filters & pagination
appointmentRouter.get(
  "/my-history",
  authorizeRoles(UserRole.PATIENT),
  getAppointmentHistory
);

// Particular appointment details (accessible by appointment participants)
appointmentRouter.get("/:id", getAppointmentDetails);

// Download or preview digital prescription PDF (Patient, Doctor, Hospital Admin, Super Admin)
appointmentRouter.get("/:id/prescription/download", downloadPrescriptionPdf);
appointmentRouter.get("/:id/download-prescription", downloadPrescriptionPdf);

// Cancel appointment (Enforces 2-day prior policy + Razorpay refund)
appointmentRouter.patch(
  "/:id/cancel",
  authorizeRoles(UserRole.PATIENT),
  cancelAppointment
);

// Reschedule appointment (Enforces 2-day prior policy)
appointmentRouter.patch(
  "/:id/reschedule",
  authorizeRoles(UserRole.PATIENT),
  rescheduleAppointment
);

export default appointmentRouter;
