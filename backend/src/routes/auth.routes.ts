import { Router } from "express";
import {
  registerPatient,
  registerDoctor,
  registerHospitalAdmin,
  login,
  logout,
  getMe,
} from "../controllers/auth.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const authRouter = Router();

authRouter.post("/register/patient", registerPatient);
authRouter.post("/register/doctor", registerDoctor);
authRouter.post("/register/hospital-admin", registerHospitalAdmin);

authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/me", authenticateToken, getMe);

export default authRouter;
