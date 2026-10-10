import mongoose, { Schema, Document, Model } from "mongoose";
import { Gender, BloodGroup } from "../constants/index.js";

export interface IMedicalReport {
  title: string;
  fileUrl: string;
  fileType: string;
  category?: string;
  uploadedAt: Date;
}

export interface IEmergencyContact {
  name: string;
  relationship: string;
  phoneNumber: string;
}

export interface IPatientAddress {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface IPatientProfile extends Document {
  userId: mongoose.Types.ObjectId;
  dateOfBirth?: Date;
  gender?: Gender;
  bloodGroup?: BloodGroup;
  address?: IPatientAddress;
  allergies: string[];
  chronicDiseases: string[];
  pastSurgeries: string[];
  currentMedications: string[];
  emergencyContact?: IEmergencyContact;
  reports: IMedicalReport[];
  createdAt: Date;
  updatedAt: Date;
}

const PatientProfileSchema = new Schema<IPatientProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      unique: true,
      index: true,
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      enum: Object.values(Gender),
      default: null,
    },
    bloodGroup: {
      type: String,
      enum: Object.values(BloodGroup),
      default: null,
    },
    address: {
      street: { type: String, trim: true, default: "" },
      city: { type: String, trim: true, default: "" },
      state: { type: String, trim: true, default: "" },
      zipCode: { type: String, trim: true, default: "" },
      country: { type: String, trim: true, default: "India" },
    },
    allergies: {
      type: [String],
      default: [],
    },
    chronicDiseases: {
      type: [String],
      default: [],
    },
    pastSurgeries: {
      type: [String],
      default: [],
    },
    currentMedications: {
      type: [String],
      default: [],
    },
    emergencyContact: {
      name: { type: String, trim: true, default: "" },
      relationship: { type: String, trim: true, default: "" },
      phoneNumber: { type: String, trim: true, default: "" },
    },
    reports: [
      {
        title: { type: String, required: true, trim: true },
        fileUrl: { type: String, required: true },
        fileType: { type: String, default: "PDF" },
        category: { type: String, default: "General" },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
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

export const PatientProfile: Model<IPatientProfile> = mongoose.model<IPatientProfile>(
  "PatientProfile",
  PatientProfileSchema
);
