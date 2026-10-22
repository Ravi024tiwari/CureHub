import { Router } from "express";
import { uploadTempMedia } from "../controllers/upload.controller.js";
import { uploadDocument } from "../middleware/upload.middleware.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const uploadRouter = Router();

// Upload any document or image to temporary S3 staging folder
uploadRouter.post(
  "/temp",
  authenticateToken,
  uploadDocument.single("file"),
  uploadTempMedia
);

export default uploadRouter;
