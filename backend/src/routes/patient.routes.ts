import { Router } from "express";
import { getPatientDashboard } from "../controllers/patient.controller.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.middleware.js";
import { UserRole } from "../constants/index.js";

const patientRouter = Router();

// Protect all patient routes
patientRouter.use(authenticateToken, authorizeRoles(UserRole.PATIENT));

// Patient Dashboard overview
patientRouter.get("/dashboard", getPatientDashboard);

export default patientRouter;
