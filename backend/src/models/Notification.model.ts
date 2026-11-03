import mongoose, { Schema, Document, Model } from "mongoose";
import { NotificationType, NotificationPriority } from "../constants/index.js";

export { NotificationType, NotificationPriority };

export interface INotificationData {
  appointmentId?: mongoose.Types.ObjectId | string;
  appointmentNumber?: string;
  doctorName?: string;
  leaveId?: mongoose.Types.ObjectId | string;
  leaveReason?: string;
  date?: string;
  time?: string;
  rescheduleDeadline?: Date | string;
  hospitalName?: string;
  actionUrl?: string;
  [key: string]: any;
}

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  data?: INotificationData;
  isRead: boolean;
  readAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Target User ID is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Notification title is required"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Notification message is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      default: NotificationType.SYSTEM,
      index: true,
    },
    priority: {
      type: String,
      enum: Object.values(NotificationPriority),
      default: NotificationPriority.NORMAL,
    },
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast querying of notifications for a user
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", notificationSchema);
