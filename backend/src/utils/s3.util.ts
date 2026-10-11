import { S3Client, PutObjectCommand, DeleteObjectCommand,} from "@aws-sdk/client-s3";

import dotenv from "dotenv";
import path from "path";

dotenv.config();

const region = process.env.AWS_REGION || "us-east-1";
const bucketName = process.env.AWS_S3_BUCKET_NAME || "";

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  console.warn(
    "[AWS S3 Warning]: AWS credentials are missing in environment variables."
  );
}

export const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export interface IS3UploadResult {
  url: string;
  key: string;
}

/**
 * Upload an in-memory file buffer directly to AWS S3
 */
export const uploadFileToS3 = async (
  file: Express.Multer.File,
  folder: string = "general",
  customFileName?: string
): Promise<IS3UploadResult> => {
  if (!bucketName) {
    throw new Error("AWS_S3_BUCKET_NAME is not configured.");
  }

  // Generate clean filename
  const extension = path.extname(file.originalname).toLowerCase();
  const baseName = customFileName
    ? customFileName.replace(/[^a-zA-Z0-9_-]/g, "")
    : path
        .basename(file.originalname, extension)
        .replace(/[^a-zA-Z0-9_-]/g, "");

  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const key = `${folder}/${baseName}-${timestamp}-${randomSuffix}${extension}`;

  const MIME_TYPE_MAP: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".jfif": "image/jpeg",
    ".pdf": "application/pdf",
  };

  const contentType =
    file.mimetype && file.mimetype !== "application/octet-stream"
      ? file.mimetype
      : MIME_TYPE_MAP[extension] || "application/octet-stream";

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: file.buffer,
    ContentType: contentType,
    ContentDisposition: "inline",
  });

  await s3Client.send(command);

  // Return standard public S3 URL
  const url = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;

  return { url, key };
};

/**
 * Delete a file from AWS S3 using either its key or its full URL
 */
export const deleteFileFromS3 = async (fileUrlOrKey: string): Promise<boolean> => {
  if (!fileUrlOrKey || !bucketName) return false;

  try {
    let key = fileUrlOrKey;

    // If a full S3 URL is provided, extract the object key
    if (fileUrlOrKey.startsWith("http")) {
      const urlPattern = new RegExp(
        `https://${bucketName}\\.s3\\.[a-z0-9-]+\\.amazonaws\\.com/(.+)`
      );
      const match = fileUrlOrKey.match(urlPattern);
      if (match && match[1]) {
        key = decodeURIComponent(match[1]);
      } else {
        // Fallback for general URL extraction
        const urlObj = new URL(fileUrlOrKey);
        key = decodeURIComponent(urlObj.pathname.replace(/^\//, ""));
      }
    }

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error(`Failed to delete S3 object: ${fileUrlOrKey}`, error);
    return false;
  }
};
