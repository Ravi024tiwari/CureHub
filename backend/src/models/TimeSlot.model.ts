import mongoose, { Schema, Document, Model } from "mongoose";
import { SlotStatus } from "../constants/index.js";

export interface ITimeSlot extends Document {
  doctorId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  date: string; // ISO date format "YYYY-MM-DD"
  startTime: string; // "09:00" (24-hour format)
  endTime: string; // "09:30" (24-hour format)
  status: SlotStatus;
  lockedAt?: Date;
  lockExpiresAt?: Date; // Auto-releases lock after checkout timeout (e.g., 5-10 minutes)
  lockedByPatientId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TimeSlotSchema = new Schema<ITimeSlot>(
  {
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "DoctorProfile",
      required: [true, "Doctor ID is required"],
      index: true,
    },
    hospitalId: {
      type: Schema.Types.ObjectId,
      ref: "Hospital",
      required: [true, "Hospital ID is required"],
      index: true,
    },
    date: {
      type: String,
      required: [true, "Date (YYYY-MM-DD) is required"],
      match: [/^\d{4}-\d{2}-\d{2}$/, "Date must follow YYYY-MM-DD format"],
      index: true,
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Start time must be HH:mm (24hr format)"],
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "End time must be HH:mm (24hr format)"],
    },
    status: {
      type: String,
      enum: Object.values(SlotStatus),
      default: SlotStatus.AVAILABLE,
      index: true,
    },
    lockedAt: {
      type: Date,
      default: null,
    },
    lockExpiresAt: {
      type: Date,
      default: null,
    },
    lockedByPatientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

// CRITICAL PRODUCTION INDEX: Prevents duplicate slots for the same doctor at the same date & time!
TimeSlotSchema.index(
  { doctorId: 1, date: 1, startTime: 1 },
  { unique: true }
);

// Fast calendar availability index
TimeSlotSchema.index({ doctorId: 1, date: 1, status: 1 });

export const TimeSlot: Model<ITimeSlot> = mongoose.model<ITimeSlot>(
  "TimeSlot",
  TimeSlotSchema
);
