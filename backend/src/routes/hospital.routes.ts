import { Router } from "express";
import {
  createHospital,
  getMyHospital,
  getHospitalDashboard,
  updateMyHospital,
  getAllHospitals,
  getHospitalBySlug,
  getHospitalById,
  getHospitalDoctors,
} from "../controllers/hospital.controller.js";

import {
  authenticateToken,
  optionalAuthenticateToken,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

import { UserRole } from "../constants/index.js";

const hospitalRouter = Router();

// Hospital Admin Dashboard & Analytics (Revenue, Patients, Doctors, Capacity)
hospitalRouter.get(
  "/dashboard",
  authenticateToken,
  authorizeRoles(UserRole.HOSPITAL_ADMIN),
  getHospitalDashboard
);

hospitalRouter.get(
  "/my-hospital/dashboard",
  authenticateToken,
  authorizeRoles(UserRole.HOSPITAL_ADMIN),
  getHospitalDashboard
);

hospitalRouter.post(
  "/",
  authenticateToken,
  authorizeRoles(UserRole.HOSPITAL_ADMIN),
  createHospital
);

hospitalRouter.get(
  "/my-hospital",
  authenticateToken,
  authorizeRoles(UserRole.HOSPITAL_ADMIN),
  getMyHospital
);

hospitalRouter.put(
  "/my-hospital",
  authenticateToken,
  authorizeRoles(UserRole.HOSPITAL_ADMIN),
  updateMyHospital
);

hospitalRouter.patch(
  "/my-hospital",
  authenticateToken,
  authorizeRoles(UserRole.HOSPITAL_ADMIN),
  updateMyHospital
);

// Public / authenticated routes for hospital discovery & details
hospitalRouter.get("/", getAllHospitals);
hospitalRouter.get("/slug/:slug", getHospitalBySlug);
hospitalRouter.get("/:id", optionalAuthenticateToken, getHospitalById);
hospitalRouter.get("/:id/doctors", optionalAuthenticateToken, getHospitalDoctors);

export default hospitalRouter;
