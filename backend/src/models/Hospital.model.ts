import mongoose, { Schema, Document, Model } from "mongoose";
import { VerificationStatus } from "../constants/index.js";

export interface IHospitalImages {
  coverImage: string;
  gallery: string[];
}

export interface IHospitalAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface IHospital extends Document {
  name: string;
  slug: string;
  hospitalAdminId: mongoose.Types.ObjectId;
  licenseNumber: string;
  licenseDocumentUrl: string;
  images: IHospitalImages;
  address: IHospitalAddress;
  contactEmail: string;
  contactPhone: string;
  departments: string[];
  verificationStatus: VerificationStatus;
  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
  rejectionReason?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HospitalSchema = new Schema<IHospital>(
  {
    name: {
      type: String,
      required: [true, "Hospital name is required"],
      trim: true,
      maxlength: [150, "Hospital name cannot exceed 150 characters"],
    },
    slug: {
      type: String,
      required: [true, "Hospital slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    hospitalAdminId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Hospital Admin ID is required"],
      index: true,
    },
    licenseNumber: {
      type: String,
      required: [true, "Government license/registration number is required"],
      unique: true,
      trim: true,
      index: true,
    },
    licenseDocumentUrl: {
      type: String,
      required: [true, "License document proof is required"],
    },
    images: {
      coverImage: {
        type: String,
        default: "",
      },
      gallery: {
        type: [String],
        default: [],
      },
    },
    address: {
      street: { type: String, required: [true, "Street address is required"], trim: true },
      city: { type: String, required: [true, "City is required"], trim: true, index: true },
      state: { type: String, required: [true, "State is required"], trim: true },
      zipCode: { type: String, required: [true, "Zip/PIN code is required"], trim: true },
      country: { type: String, default: "India", trim: true },
    },
    contactEmail: {
      type: String,
      required: [true, "Contact email is required"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid contact email"],
    },
    contactPhone: {
      type: String,
      required: [true, "Contact phone number is required"],
      trim: true,
    },
    departments: {
      type: [String],
      default: ["General Medicine"],
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

export const Hospital: Model<IHospital> = mongoose.model<IHospital>(
  "Hospital",
  HospitalSchema
);
