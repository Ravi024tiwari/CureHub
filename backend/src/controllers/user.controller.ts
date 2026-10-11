import { Request, Response } from "express";
import { User } from "../models/User.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadFileToS3, deleteFileFromS3 } from "../utils/s3.util.js";

/**
 * Update authenticated user's basic profile details (Name, Phone Number, Avatar)
 */
export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User account not found");
  }

  const { name, phoneNumber } = req.body;

  // 1. Handle phone number uniqueness check if phone is being updated
  if (phoneNumber && phoneNumber.trim() && phoneNumber.trim() !== user.phoneNumber) {
    const existingPhone = await User.findOne({
      phoneNumber: phoneNumber.trim(),
      _id: { $ne: user._id },
    });

    if (existingPhone) {
      throw new ApiError(409, "This phone number is already registered with another account");
    }

    user.phoneNumber = phoneNumber.trim();
  }

  // 2. Handle name update
  if (name && name.trim()) {
    user.name = name.trim();
  }

  // 3. Handle avatar upload to S3 if a file is uploaded
  if (req.file) {
    const s3Result = await uploadFileToS3(
      req.file,
      `avatars/${user.role.toLowerCase()}`,
      `user-${user._id}`
    );

    // If an old avatar exists on S3, clean it up
    if (user.avatar && user.avatar.includes("amazonaws.com")) {
      await deleteFileFromS3(user.avatar);
    }

    user.avatar = s3Result.url;
  }

  await user.save();

  return res.status(200).json(
    new ApiResponse(200, user, "Account details updated successfully")
  );
});

/**
 * Dedicated endpoint to update only user's avatar
 */
export const updateAvatar = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!req.file) {
    throw new ApiError(400, "Please provide an image file to update avatar");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User account not found");
  }

  const s3Result = await uploadFileToS3(
    req.file,
    `avatars/${user.role.toLowerCase()}`,
    `user-${user._id}`
  );

  // Clean up old avatar from S3
  if (user.avatar && user.avatar.includes("amazonaws.com")) {
    await deleteFileFromS3(user.avatar);
  }

  user.avatar = s3Result.url;
  await user.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      { avatar: user.avatar },
      "Profile avatar updated successfully"
    )
  );
});

/**
 * Change password for authenticated user (requires current password verification)
 */
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "Both current password and new password are required");
  }

  if (newPassword.length < 6) {
    throw new ApiError(400, "New password must be at least 6 characters long");
  }

  // Find user and explicitly select password field
  const user = await User.findById(userId).select("+password");
  if (!user) {
    throw new ApiError(404, "User account not found");
  }

  // Verify current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(401, "The current password provided is incorrect");
  }

  // Check if new password is identical to old password
  if (currentPassword === newPassword) {
    throw new ApiError(400, "New password cannot be the same as the current password");
  }

  // Update password - pre-save hook on User schema will hash it automatically
  user.password = newPassword;
  await user.save();

  return res.status(200).json(
    new ApiResponse(200, null, "Password changed successfully")
  );
});
