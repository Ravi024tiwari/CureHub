import mongoose, { Schema, Document, Model } from "mongoose";
import { VerificationStatus } from "../constants/index.js";

export interface IHospitalAdminProfile extends Document {
  userId: mongoose.Types.ObjectId;
  hospitalId?: mongoose.Types.ObjectId;
  hospitalName: string;
  hospitalRegistrationNumber: string;
  designation: string;
  governmentIdType?: string;
  governmentIdNumber?: string;
  identityProofUrl?: string;
  authorizationLetterUrl?: string;
  email?: string;
  phone?: string;
  qualifications?: string[];
  verificationStatus: VerificationStatus;
  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
  rejectionReason?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HospitalAdminProfileSchema = new Schema<IHospitalAdminProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      unique: true,
      index: true,
    },
    hospitalId: {
      type: Schema.Types.ObjectId,
      ref: "Hospital",
      default: null,
      index: true,
    },
    hospitalName: {
      type: String,
      required: [true, "Hospital name is required"],
      trim: true,
      maxlength: [150, "Hospital name cannot exceed 150 characters"],
      index: true,
    },
    hospitalRegistrationNumber: {
      type: String,
      required: [true, "Hospital government registration/license number is required"],
      unique: true,
      trim: true,
      index: true,
    },
    designation: {
      type: String,
      required: [true, "Hospital Admin designation is required"],
      trim: true,
      maxlength: [100, "Designation cannot exceed 100 characters"],
    },
    governmentIdType: {
      type: String,
      trim: true,
      default: "",
    },
    governmentIdNumber: {
      type: String,
      trim: true,
      default: "",
    },
    identityProofUrl: {
      type: String,
      default: "",
    },
    authorizationLetterUrl: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    qualifications: {
      type: [String],
      default: [],
    },
    verificationStatus: {
      type: String,
      enum: Object.values(VerificationStatus),
      default: VerificationStatus.PENDING,
      index: true,
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
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

export const HospitalAdminProfile: Model<IHospitalAdminProfile> =
  mongoose.model<IHospitalAdminProfile>(
    "HospitalAdminProfile",
    HospitalAdminProfileSchema
  );
