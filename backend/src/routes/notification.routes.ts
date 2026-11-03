import { Router } from "express";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../controllers/notification.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const notificationRouter = Router();

// Protect all notification routes with JWT authentication
notificationRouter.use(authenticateToken);

notificationRouter.get("/", getUserNotifications);
notificationRouter.patch("/read-all", markAllNotificationsAsRead);
notificationRouter.patch("/:id/read", markNotificationAsRead);
notificationRouter.delete("/:id", deleteNotification);

export default notificationRouter;
