import { Router } from "express";
import {
  getAdminHospitals,
  getHospitalDetailById,
  createHospitalForAdmin,
  updateHospitalById,
  deleteHospitalById,
  getAdminJoinRequests,
  respondToJoinRequest,
  disaffiliateDoctor,
} from "../controllers/hospitalAdmin.controller.js";
import { getHospitalDashboard } from "../controllers/hospital.controller.js";
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
hospitalAdminRouter.get("/dashboard", getHospitalDashboard);

// ── 2. Multi-Hospital Management (CRUD) ─────────────────────────────────────
hospitalAdminRouter.get("/hospitals", getAdminHospitals);
hospitalAdminRouter.post("/hospitals", createHospitalForAdmin);
hospitalAdminRouter.get("/hospitals/:id", getHospitalDetailById);
hospitalAdminRouter.put("/hospitals/:id", updateHospitalById);
hospitalAdminRouter.patch("/hospitals/:id", updateHospitalById);
hospitalAdminRouter.delete("/hospitals/:id", deleteHospitalById);

// ── 3. Doctor Join Requests & Affiliations ──────────────────────────────────
hospitalAdminRouter.get("/join-requests", getAdminJoinRequests);
hospitalAdminRouter.patch("/join-requests/:requestId", respondToJoinRequest);
hospitalAdminRouter.delete(
  "/hospitals/:hospitalId/doctors/:doctorId",
  disaffiliateDoctor
);

export default hospitalAdminRouter;
