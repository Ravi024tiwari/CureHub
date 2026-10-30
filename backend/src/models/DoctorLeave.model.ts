import mongoose, { Schema, Document, Model } from "mongoose";
import { DoctorLeaveStatus, DoctorLeaveType } from "../constants/index.js";

export { DoctorLeaveStatus, DoctorLeaveType };

export interface IDoctorLeave extends Document {
  doctorId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  startDateTime: Date;
  endDateTime: Date;
  leaveType: DoctorLeaveType;
  reason?: string;
  status: DoctorLeaveStatus;
  approvedBy?: mongoose.Types.ObjectId | null;
  rejectionReason?: string | null;
  affectedAppointmentsCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const doctorLeaveSchema = new Schema<IDoctorLeave>(
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

    startDateTime: {
      type: Date,
      required: [true, "Start date-time is required"],
    },

    endDateTime: {
      type: Date,
      required: [true, "End date-time is required"],
    },

    leaveType: {
      type: String,
      enum: Object.values(DoctorLeaveType),
      required: [true, "Leave type is required"],
    },

    reason: {
      type: String,
      trim: true,
      maxlength: [500, "Reason cannot exceed 500 characters"],
      default: "Personal Leave",
    },

    status: {
      type: String,
      enum: Object.values(DoctorLeaveStatus),
      default: DoctorLeaveStatus.PENDING,
      index: true,
    },

    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    rejectionReason: {
      type: String,
      trim: true,
      maxlength: [500, "Rejection reason cannot exceed 500 characters"],
      default: null,
    },

    affectedAppointmentsCount: {
      type: Number,
      default: 0,
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

// Compound indexes for fast conflict lookup and hospital admin queries
doctorLeaveSchema.index({
  doctorId: 1,
  hospitalId: 1,
  startDateTime: 1,
  endDateTime: 1,
});

doctorLeaveSchema.index({
  hospitalId: 1,
  status: 1,
  createdAt: -1,
});

doctorLeaveSchema.index({
  doctorId: 1,
  status: 1,
  startDateTime: 1,
});

// Validation: End date-time must be strictly after start date-time
doctorLeaveSchema.path("endDateTime").validate(function (this: any, value: Date) {
  return value > this.startDateTime;
}, "End date-time must be after start date-time");

export const DoctorLeave: Model<IDoctorLeave> = mongoose.model<IDoctorLeave>(
  "DoctorLeave",
  doctorLeaveSchema
);

export default DoctorLeave;

