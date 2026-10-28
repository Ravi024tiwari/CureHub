import mongoose, { Schema, Document, Model } from "mongoose";
import { VerificationStatus } from "../constants/index.js";

export interface IHospitalAdminProfile extends Document {
  userId: mongoose.Types.ObjectId;
  hospitalId?: mongoose.Types.ObjectId;
  hospitalName?: string;
  hospitalRegistrationNumber?: string;
  designation: string;
  hospitalType?: string;
  hospitalAddress?: string;
  numberOfBeds?: number;
  governmentIdType?: string;
  governmentIdNumber?: string;
  alternatePhone?: string;
  address?: string;
  identityProofUrl?: string;
  authorizationLetterUrl?: string;
  additionalDocUrl?: string;
  qualifications?: string[];
  verificationStatus: VerificationStatus;
  isSubmitted?: boolean;
  submittedAt?: Date;
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
      trim: true,
      maxlength: [150, "Hospital name cannot exceed 150 characters"],
      default: "",
      index: true,
    },
    hospitalRegistrationNumber: {
      type: String,
      trim: true,
      default: undefined,
      sparse: true,
      index: true,
    },
    hospitalType: {
      type: String,
      trim: true,
      default: "Private Hospital",
    },
    hospitalAddress: {
      type: String,
      trim: true,
      default: "",
    },
    numberOfBeds: {
      type: Number,
      default: null,
    },
    designation: {
      type: String,
      trim: true,
      default: "Hospital Administrator",
      maxlength: [100, "Designation cannot exceed 100 characters"],
    },
    governmentIdType: {
      type: String,
      trim: true,
      default: "Aadhaar Card",
    },
    governmentIdNumber: {
      type: String,
      trim: true,
      default: "",
    },
    alternatePhone: {
      type: String,
      trim: true,
      default: "",
    },
    address: {
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
    additionalDocUrl: {
      type: String,
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
    isSubmitted: {
      type: Boolean,
      default: false,
    },
    submittedAt: {
      type: Date,
      default: null,
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
