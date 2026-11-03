import { Request, Response } from "express";
import mongoose from "mongoose";
import { Notification } from "../models/Notification.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Get paginated notifications for the logged-in user with live unread count
 */
export const getUserNotifications = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    throw new ApiError(401, "Authentication required");
  }

  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
  const unreadOnly = req.query.unreadOnly === "true";

  const userObjectId = new mongoose.Types.ObjectId(userId);
  const filter: any = { userId: userObjectId };
  if (unreadOnly) {
    filter.isRead = false;
  }

  const [notifications, totalCount, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ userId: userObjectId, isRead: false }),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        notifications,
        unreadCount,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit) || 1,
          hasMore: page * limit < totalCount,
        },
      },
      "Notifications retrieved successfully"
    )
  );
});

/**
 * Mark a single notification as read
 */
export const markNotificationAsRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { id } = req.params;

  if (!userId) {
    throw new ApiError(401, "Authentication required");
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid notification ID format");
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);
  const notification = await Notification.findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(id), userId: userObjectId },
    { $set: { isRead: true, readAt: new Date() } },
    { new: true }
  ).lean();

  if (!notification) {
    throw new ApiError(404, "Notification not found or unauthorized");
  }

  const unreadCount = await Notification.countDocuments({
    userId: userObjectId,
    isRead: false,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      { notification, unreadCount },
      "Notification marked as read"
    )
  );
});

/**
 * Mark all notifications as read for current user
 */
export const markAllNotificationsAsRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    throw new ApiError(401, "Authentication required");
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);
  const result = await Notification.updateMany(
    { userId: userObjectId, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      { modifiedCount: result.modifiedCount, unreadCount: 0 },
      "All notifications marked as read"
    )
  );
});

/**
 * Delete a notification
 */
export const deleteNotification = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { id } = req.params;

  if (!userId) {
    throw new ApiError(401, "Authentication required");
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid notification ID format");
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);
  const deleted = await Notification.findOneAndDelete({
    _id: new mongoose.Types.ObjectId(id),
    userId: userObjectId,
  });

  if (!deleted) {
    throw new ApiError(404, "Notification not found or unauthorized");
  }

  const unreadCount = await Notification.countDocuments({
    userId: userObjectId,
    isRead: false,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      { unreadCount },
      "Notification deleted successfully"
    )
  );
});
