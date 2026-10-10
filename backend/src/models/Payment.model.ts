import mongoose, { Schema, Document, Model } from "mongoose";
import { PaymentStatus } from "../constants/index.js";

export enum PaymentMethod {
  CARD = "CARD",
  UPI = "UPI",
  NET_BANKING = "NET_BANKING",
  WALLET = "WALLET",
  CASH_AT_CLINIC = "CASH_AT_CLINIC",
}

export interface IPayment extends Document {
  appointmentId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod?: PaymentMethod;
  gateway: string; // e.g., "STRIPE", "RAZORPAY"
  transactionId?: string; // Gateway transaction reference ID
  orderId?: string; // Gateway order reference ID
  refundId?: string;
  receiptUrl?: string;
  paidAt?: Date;
  refundedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      required: [true, "Appointment ID is required"],
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
    amount: {
      type: Number,
      required: [true, "Payment amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    currency: {
      type: String,
      default: "INR",
      uppercase: true,
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
      default: PaymentMethod.UPI,
    },
    gateway: {
      type: String,
      default: "RAZORPAY",
    },
    transactionId: {
      type: String,
      sparse: true,
      unique: true, // Guarantees idempotency (prevents duplicate transaction processing)
    },
    orderId: {
      type: String,
      index: true,
    },
    refundId: {
      type: String,
      default: null,
    },
    receiptUrl: {
      type: String,
      default: "",
    },
    paidAt: {
      type: Date,
      default: null,
    },
    refundedAt: {
      type: Date,
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

export const Payment: Model<IPayment> = mongoose.model<IPayment>(
  "Payment",
  PaymentSchema
);
