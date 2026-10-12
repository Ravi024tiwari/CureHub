import mongoose, { Schema, Document, Model } from "mongoose";

export enum JoinRequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export interface IHospitalJoinRequest extends Document {
  doctorId: mongoose.Types.ObjectId;
  doctorUserId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  department: string;
  message?: string;
  status: JoinRequestStatus;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const HospitalJoinRequestSchema = new Schema<IHospitalJoinRequest>(
  {
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "DoctorProfile",
      required: [true, "Doctor Profile ID is required"],
      index: true,
    },
    doctorUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Doctor User ID is required"],
      index: true,
    },
    hospitalId: {
      type: Schema.Types.ObjectId,
      ref: "Hospital",
      required: [true, "Hospital ID is required"],
      index: true,
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
    },
    message: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: Object.values(JoinRequestStatus),
      default: JoinRequestStatus.PENDING,
      index: true,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: "",
      trim: true,
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

// Compound index to optimize finding existing pending requests
HospitalJoinRequestSchema.index({ doctorId: 1, hospitalId: 1, status: 1 });

export const HospitalJoinRequest: Model<IHospitalJoinRequest> =
  mongoose.model<IHospitalJoinRequest>("HospitalJoinRequest", HospitalJoinRequestSchema);
