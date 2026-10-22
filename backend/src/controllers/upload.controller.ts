import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { uploadFileToS3 } from "../utils/s3.util.js";

/**
 * Upload an image or document to temporary storage (S3 temp/ folder)
 * Files in temp/ are subject to automatic 24h purge lifecycle if unpromoted
 */
export const uploadTempMedia = asyncHandler(async (req: Request, res: Response) => {
  const file = req.file;

  if (!file) {
    throw new ApiError(400, "No file provided for upload");
  }

  const folder = (req.body.folder as string) || "temp/hospitals";

  const result = await uploadFileToS3(file, folder);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        url: result.url,
        key: result.key,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
      },
      "File successfully uploaded to temporary storage"
    )
  );
});
