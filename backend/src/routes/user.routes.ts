import { Router } from "express";
import {
  updateMe,
  updateAvatar,
  changePassword,
} from "../controllers/user.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { uploadSingleAvatar } from "../middleware/upload.middleware.js";

const userRouter = Router();

userRouter.use(authenticateToken);

// Update basic user profile (name, phone, optional avatar)
userRouter.patch("/me", uploadSingleAvatar, updateMe);

userRouter.patch("/avatar", uploadSingleAvatar, updateAvatar);

// Change password
userRouter.patch("/change-password", changePassword);

export default userRouter;
