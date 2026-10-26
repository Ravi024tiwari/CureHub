import multer from "multer";
import { Request } from "express";
import path from "path";
import { ApiError } from "../utils/apiError.js";

const storage = multer.memoryStorage();

// Allowed image extensions
const ALLOWED_IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".svg",
  ".jfif",
];

// Allowed document extensions
const ALLOWED_DOCUMENT_EXTENSIONS = [
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
];

const imageFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const isMimeValid = file.mimetype.startsWith("image/");
  const isExtValid = ALLOWED_IMAGE_EXTENSIONS.includes(ext);

  // Allow if either mimetype is an image or extension is a valid image extension
  if (isMimeValid || isExtValid) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        `Invalid image format (${file.mimetype || "unknown"}). Allowed formats: JPG, JPEG, PNG, WEBP, GIF, SVG`
      )
    );
  }
};

const documentFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const isMimeValid =
    file.mimetype === "application/pdf" || file.mimetype.startsWith("image/");
  const isExtValid = ALLOWED_DOCUMENT_EXTENSIONS.includes(ext);

  if (isMimeValid || isExtValid) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        `Invalid document format (${file.mimetype || "unknown"}). Allowed formats: PDF, JPG, PNG, WEBP`
      )
    );
  }
};

export const uploadImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: imageFileFilter,
});

export const uploadDocument = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: documentFileFilter,
});

export const uploadSingleAvatar = uploadImage.single("avatar");

export const uploadSingleReport = uploadDocument.single("report");

export const uploadDoctorFiles = uploadDocument.fields([
  { name: "avatar", maxCount: 1 },
  { name: "licenseDocument", maxCount: 1 },
]);

export const uploadHospitalAdminFiles = uploadDocument.fields([
  { name: "avatar", maxCount: 1 },
  { name: "identityProof", maxCount: 1 },
  { name: "authorizationLetter", maxCount: 1 },
  { name: "additionalDoc", maxCount: 1 },
]);

export const uploadHospitalImages = uploadImage.fields([
  { name: "coverImage", maxCount: 1 },
  { name: "gallery", maxCount: 5 },
]);
