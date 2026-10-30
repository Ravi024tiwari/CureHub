import mongoose, { Schema, Document, Model } from "mongoose";
import { AppointmentStatus, ConsultationType } from "../constants/index.js";

export interface IPrescriptionMedicine {
  name: string;
  dosage: string; 
  frequency: string; 
  duration: string; 
  instructions?: string;
}

export interface IPrescription {
  diagnosis?: string;
  medicines: IPrescriptionMedicine[];
  notes?: string;
  issuedAt: Date;
}

export interface ICancellationDetails {
  cancelledBy?: mongoose.Types.ObjectId;
  reason: string;
  cancelledAt: Date;
}

export interface IRescheduleHistory {
  previousSlotId?: mongoose.Types.ObjectId;
  previousDate: string;
  previousStartTime: string;
  previousEndTime?: string;
  reason?: string;
  rescheduledAt: Date;
}

export interface IPatientDetails {
  fullName: string;
  age?: number;
  gender?: string;
  isDependent?: boolean;
  relationship?: string;
}

export interface IAppointment extends Document {
  appointmentNumber: string; // e.g., "APT-20261010-8472"
  patientId: mongoose.Types.ObjectId; // Ref: User
  doctorId: mongoose.Types.ObjectId; // Ref: DoctorProfile
  hospitalId: mongoose.Types.ObjectId; // Ref: Hospital
  slotId: mongoose.Types.ObjectId; // Ref: TimeSlot (Unique per appointment)
  date: string; // "YYYY-MM-DD"
  startTime: string; // "09:00"
  endTime: string; // "09:30"
  type: ConsultationType;
  status: AppointmentStatus;
  symptoms: string;
  consultationFee: number; // Stored snapshot of fee at booking time
  patientDetails?: IPatientDetails;
  prescription?: IPrescription;
  cancellation?: ICancellationDetails;
  rescheduleDeadline?: Date | null;
  doctorLeaveReason?: string | null;
  rescheduleHistory?: IRescheduleHistory[];
  isReviewed?: boolean;
  reviewId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    appointmentNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Patient ID is required"],
      index: true,
    },
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
    slotId: {
      type: Schema.Types.ObjectId,
      ref: "TimeSlot",
      required: [true, "TimeSlot ID is required"],
      index: true,
    },
    date: {
      type: String,
      required: [true, "Appointment date is required"],
      match: [/^\d{4}-\d{2}-\d{2}$/, "Date must follow YYYY-MM-DD format"],
      index: true,
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
    },
    type: {
      type: String,
      enum: Object.values(ConsultationType),
      default: ConsultationType.IN_PERSON,
    },
    status: {
      type: String,
      enum: Object.values(AppointmentStatus),
      default: AppointmentStatus.PENDING_PAYMENT,
      index: true,
    },
    symptoms: {
      type: String,
      required: [true, "Symptoms/reason for appointment is required"],
      trim: true,
    },
    consultationFee: {
      type: Number,
      required: true,
      min: 0,
    },
    patientDetails: {
      fullName: { type: String, trim: true },
      age: { type: Number },
      gender: { type: String, trim: true },
      isDependent: { type: Boolean, default: false },
      relationship: { type: String, trim: true },
    },
    prescription: {
      diagnosis: { type: String, trim: true },
      medicines: [
        {
          name: { type: String, required: true },
          dosage: { type: String, required: true },
          frequency: { type: String, required: true },
          duration: { type: String, required: true },
          instructions: { type: String, default: "" },
        },
      ],
      notes: { type: String, default: "" },
      issuedAt: { type: Date, default: null },
    },
    cancellation: {
      cancelledBy: { type: Schema.Types.ObjectId, ref: "User" },
      reason: { type: String, default: "" },
      cancelledAt: { type: Date, default: null },
    },
    rescheduleDeadline: {
      type: Date,
      default: null,
      index: true,
    },
    doctorLeaveReason: {
      type: String,
      default: null,
    },
    isReviewed: {
      type: Boolean,
      default: false,
      index: true,
    },
    reviewId: {
      type: Schema.Types.ObjectId,
      ref: "Review",
      default: null,
    },
    rescheduleHistory: [
      {
        previousSlotId: { type: Schema.Types.ObjectId, ref: "TimeSlot" },
        previousDate: { type: String, required: true },
        previousStartTime: { type: String, required: true },
        previousEndTime: { type: String, default: "" },
        reason: { type: String, default: "" },
        rescheduledAt: { type: Date, default: Date.now },
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

// Fast query index for doctor daily schedule
AppointmentSchema.index({ doctorId: 1, date: 1, status: 1 });
AppointmentSchema.index({ patientId: 1, date: 1, status: 1 });
// Fast query index for hospital admin appointments & analytics
AppointmentSchema.index({ hospitalId: 1, date: -1, status: 1 });
AppointmentSchema.index({ hospitalId: 1, doctorId: 1, date: -1 });

export const Appointment: Model<IAppointment> = mongoose.model<IAppointment>(
  "Appointment",
  AppointmentSchema
);
