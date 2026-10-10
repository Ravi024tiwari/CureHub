import mongoose, { Schema, Document, Model } from "mongoose";
import { VerificationStatus } from "../constants/index.js";

export interface IDoctorScheduleRule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
}

export interface IDoctorProfile extends Document {
  userId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  department: string;
  specialization: string[];
  qualifications: string[];
  medicalCouncilRegistrationNumber: string;
  licenseDocumentUrl?: string;
  experienceYears: number;
  consultationFee: number;
  bio?: string;
  scheduleRules: IDoctorScheduleRule[];
  verificationStatus: VerificationStatus;
  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
  rejectionReason?: string;
  ratingAverage: number;
  reviewCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DoctorProfileSchema = new Schema<IDoctorProfile>(
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
      required: [true, "Hospital affiliation is required"],
      index: true,
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
      index: true,
    },
    specialization: {
      type: [String],
      default: [],
    },
    qualifications: {
      type: [String],
      default: [],
    },
    medicalCouncilRegistrationNumber: {
      type: String,
      required: [true, "Medical council registration number is required"],
      unique: true,
      trim: true,
      index: true,
    },
    licenseDocumentUrl: {
      type: String,
      default: "",
    },
    experienceYears: {
      type: Number,
      min: [0, "Experience cannot be negative"],
      default: 0,
    },
    consultationFee: {
      type: Number,
      min: [0, "Consultation fee cannot be negative"],
      default: 0,
    },
    bio: {
      type: String,
      trim: true,
      default: "",
    },
    scheduleRules: [
      {
        dayOfWeek: {
          type: Number,
          required: true,
          min: 0,
          max: 6,
        },
        startTime: {
          type: String,
          required: true,
          match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Start time must be HH:mm (24hr format)"],
        },
        endTime: {
          type: String,
          required: true,
          match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "End time must be HH:mm (24hr format)"],
        },
        slotDurationMinutes: {
          type: Number,
          default: 30,
          min: 10,
          max: 50,
        },
      },
    ],
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
    ratingAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
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

export const DoctorProfile: Model<IDoctorProfile> = mongoose.model<IDoctorProfile>(
  "DoctorProfile",
  DoctorProfileSchema
);
