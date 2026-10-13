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
import { authRateLimiter } from "../middleware/rateLimiter.middleware.js";

const authRouter = Router();

authRouter.post("/register/patient", authRateLimiter, registerPatient);
authRouter.post("/register/doctor", authRateLimiter, registerDoctor);
authRouter.post("/register/hospital-admin", authRateLimiter, registerHospitalAdmin);

authRouter.post("/login", authRateLimiter, login);
authRouter.post("/logout", logout);
authRouter.get("/me", authenticateToken, getMe);

export default authRouter;

