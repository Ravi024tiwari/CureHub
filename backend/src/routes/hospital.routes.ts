import { Router } from "express";
import {createHospital,getMyHospital,updateMyHospital,getAllHospitals,getHospitalBySlug,getHospitalById,
} from "../controllers/hospital.controller.js";

import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

import { UserRole } from "../constants/index.js";

const hospitalRouter = Router();

// Hospital Admin specific routes (creating & managing their affiliated hospital)
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

// Public routes for hospital discovery
hospitalRouter.get("/", getAllHospitals);
hospitalRouter.get("/slug/:slug", getHospitalBySlug);
hospitalRouter.get("/:id", getHospitalById);

export default hospitalRouter;
