import { Request, Response } from "express";
import crypto from "crypto";
import mongoose from "mongoose";
import { Appointment } from "../models/Appointment.model.js";
import { TimeSlot } from "../models/TimeSlot.model.js";
import { DoctorProfile } from "../models/DoctorProfile.model.js";
import { Payment, PaymentMethod } from "../models/Payment.model.js";
import {
  AppointmentStatus,
  SlotStatus,
  PaymentStatus,
  ConsultationType,
} from "../constants/index.js";
import { razorpayInstance, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from "../config/razorpay.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


/** Slot hold duration in milliseconds (5 minutes) */
const SLOT_LOCK_DURATION_MS = 5 * 60 * 1000;


/**
 * Generate unique appointment number: APT-YYYYMMDD-XXXX
 */

const generateAppointmentNumber = (date: string): string => {
  const cleanDate = date.replace(/-/g, "");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `APT-${cleanDate}-${randomSuffix}`;
};

/**
 * Parse appointment date + start time into a Date object
 */
const parseAppointmentDateTime = (date: string, startTime: string): Date => {
  return new Date(`${date}T${startTime}:00`);
};

/**
 * Release expired slot locks
 *
 * Scans for slots that were locked but whose lockExpiresAt has passed.
 * Resets them to AVAILABLE and marks any associated pending appointments/payments as failed.
 *
 * Called before every initiation to garbage-collect stale locks.
 */
export const releaseExpiredSlotLocks = async (): Promise<void> => {
  const now = new Date();

  // Find and release all expired locked slots
  const expiredSlots = await TimeSlot.find({
    status: SlotStatus.LOCKED,
    lockExpiresAt: { $lte: now },
  });

  if (expiredSlots.length === 0) return;

  const expiredSlotIds = expiredSlots.map((s) => s._id);

  // Batch release: Reset slots to AVAILABLE
  await TimeSlot.updateMany(
    { _id: { $in: expiredSlotIds } },
    {
      status: SlotStatus.AVAILABLE,
      lockedByPatientId: null,
      lockedAt: null,
      lockExpiresAt: null,
    }
  );

  // Mark associated pending-payment appointments as expired
  await Appointment.updateMany(
    {
      slotId: { $in: expiredSlotIds },
      status: AppointmentStatus.PENDING_PAYMENT,
    },
    {
      status: AppointmentStatus.CANCELLED_BY_PATIENT,
      cancellation: {
        reason: "Payment not completed within 5-minute window. Slot released automatically.",
        cancelledAt: now,
      },
    }
  );

  // Mark associated pending payments as failed
  await Payment.updateMany(
    {
      appointmentId: {
        $in: await Appointment.find({
          slotId: { $in: expiredSlotIds },
        }).distinct("_id"),
      },
      status: PaymentStatus.PENDING,
    },
    { status: PaymentStatus.FAILED }
  );
};


export const initiateBooking = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.user?.userId;
  const { slotId, doctorId, date, startTime, symptoms, type } = req.body;

  if (!symptoms || !symptoms.trim()) {
    throw new ApiError(400, "Symptoms or reason for consultation is required.");
  }

  // ── Garbage-collect expired locks before proceeding ─────────────────────
  await releaseExpiredSlotLocks();

  let lockedSlot: any = null;
  let doctor: any = null;
  let targetDate = date;
  let targetStartTime = startTime;

  const now = new Date();
  const lockExpiresAt = new Date(now.getTime() + SLOT_LOCK_DURATION_MS);

  // Helper conversions for timing
  const toMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };

  const toTimeString = (totalMinutes: number) => {
    const h = Math.floor(totalMinutes / 60)
      .toString()
      .padStart(2, "0");
    const m = (totalMinutes % 60).toString().padStart(2, "0");
    return `${h}:${m}`;
  };

  // =========================================================================
  // APPROACH 1: On-Demand Virtual Booking (doctorId, date, startTime provided)
  // =========================================================================
  if (doctorId && date && startTime) {
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      throw new ApiError(400, "Invalid doctor ID format.");
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new ApiError(400, "Date must be in YYYY-MM-DD format.");
    }
    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(startTime)) {
      throw new ApiError(400, "Start time must be in HH:mm 24-hour format.");
    }

    const slotDateTime = parseAppointmentDateTime(date, startTime);
    if (slotDateTime.getTime() <= Date.now()) {
      throw new ApiError(400, "Cannot book an appointment for a past date or time.");
    }

    doctor = await DoctorProfile.findById(doctorId);
    if (!doctor || !doctor.isActive) {
      throw new ApiError(404, "The requested doctor is currently not accepting appointments.");
    }
    if (!doctor.hospitalId) {
      throw new ApiError(400, "The requested doctor is currently not affiliated with an active hospital.");
    }

    // Verify doctor is not on leave
    const isOnLeave = doctor.leaves?.some((leave: any) => leave.date === date);
    if (isOnLeave) {
      throw new ApiError(400, "The doctor is on leave on this date. Please select another date.");
    }

    // Verify startTime matches doctor's schedule rules and compute endTime
    const [y, m, d] = date.split("-").map(Number);
    const dayOfWeek = new Date(y, m - 1, d).getDay();

    const matchingRule = doctor.scheduleRules?.find((r: any) => {
      if (r.dayOfWeek !== dayOfWeek) return false;
      const startMin = toMinutes(r.startTime);
      const endMin = toMinutes(r.endTime);
      const slotMin = toMinutes(startTime);
      return slotMin >= startMin && slotMin < endMin;
    });

    if (!matchingRule) {
      throw new ApiError(
        400,
        "The selected time does not fall within the doctor's active consultation hours for this day."
      );
    }

    const duration = matchingRule.slotDurationMinutes || 30;
    const computedEndTime = toTimeString(toMinutes(startTime) + duration);

    // Guard: Check if already booked or actively locked
    const existingSlot = await TimeSlot.findOne({ doctorId: doctor._id, date, startTime });
    if (existingSlot) {
      if (existingSlot.status === SlotStatus.BOOKED || existingSlot.status === SlotStatus.UNAVAILABLE) {
        throw new ApiError(409, "This time slot is no longer available. Please select another slot.");
      }
      if (
        existingSlot.status === SlotStatus.LOCKED &&
        existingSlot.lockExpiresAt &&
        existingSlot.lockExpiresAt > now
      ) {
        throw new ApiError(
          409,
          "This time slot is currently being booked by another patient. Please wait or select another slot."
        );
      }
    }

    // Atomic Lock & Upsert with concurrency guard
    try {
      lockedSlot = await TimeSlot.findOneAndUpdate(
        {
          doctorId: doctor._id,
          date,
          startTime,
          $or: [
            { status: SlotStatus.AVAILABLE },
            { status: SlotStatus.LOCKED, lockExpiresAt: { $lte: now } },
          ],
        },
        {
          $set: {
            hospitalId: doctor.hospitalId,
            endTime: computedEndTime,
            status: SlotStatus.LOCKED,
            lockedByPatientId: new mongoose.Types.ObjectId(patientId),
            lockedAt: now,
            lockExpiresAt,
          },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
    } catch (err: any) {
      if (err.code === 11000) {
        throw new ApiError(
          409,
          "This slot was just selected by another patient. Please choose another slot."
        );
      }
      throw err;
    }
  } else if (slotId) {
    // =========================================================================
    // APPROACH 2: Legacy Pre-Existing Slot (slotId provided)
    // =========================================================================
    if (!mongoose.Types.ObjectId.isValid(slotId)) {
      throw new ApiError(400, "Invalid slot ID format.");
    }

    const slot = await TimeSlot.findById(slotId);
    if (!slot) {
      throw new ApiError(404, "Requested time slot not found.");
    }

    if (slot.status !== SlotStatus.AVAILABLE) {
      throw new ApiError(409, "This time slot is no longer available. Please select another slot.");
    }

    const slotDateTime = parseAppointmentDateTime(slot.date, slot.startTime);
    if (slotDateTime.getTime() <= Date.now()) {
      throw new ApiError(400, "Cannot book an appointment for a past date or time.");
    }

    doctor = await DoctorProfile.findById(slot.doctorId);
    if (!doctor || !doctor.isActive) {
      throw new ApiError(404, "The requested doctor is currently not accepting appointments.");
    }

    const isOnLeave = doctor.leaves?.some((leave: any) => leave.date === slot.date);
    if (isOnLeave) {
      throw new ApiError(400, "The doctor is on leave on this date. Please select another date.");
    }

    targetDate = slot.date;
    targetStartTime = slot.startTime;

    lockedSlot = await TimeSlot.findOneAndUpdate(
      { _id: slot._id, status: SlotStatus.AVAILABLE },
      {
        status: SlotStatus.LOCKED,
        lockedByPatientId: new mongoose.Types.ObjectId(patientId),
        lockedAt: now,
        lockExpiresAt,
      },
      { new: true }
    );
  } else {
    throw new ApiError(
      400,
      "Please provide either (doctorId, date, startTime) for on-demand booking, or a valid slotId."
    );
  }

  if (!lockedSlot) {
    throw new ApiError(
      409,
      "This slot was just taken by another patient. Please choose a different slot."
    );
  }

  // ── 6. Create Appointment in PENDING_PAYMENT status ────────────────────
  const appointmentNumber = generateAppointmentNumber(lockedSlot.date);
  const consultationFee = doctor.consultationFee || 200;

  let appointment;
  try {
    appointment = await Appointment.create({
      appointmentNumber,
      patientId: new mongoose.Types.ObjectId(patientId),
      doctorId: doctor._id,
      hospitalId: lockedSlot.hospitalId || doctor.hospitalId,
      slotId: lockedSlot._id,
      date: lockedSlot.date,
      startTime: lockedSlot.startTime,
      endTime: lockedSlot.endTime,
      type: type || ConsultationType.IN_PERSON,
      status: AppointmentStatus.PENDING_PAYMENT,
      symptoms: symptoms.trim(),
      consultationFee,
    });
  } catch (error) {
    // Rollback: Release the locked slot on failure
    await TimeSlot.findByIdAndUpdate(lockedSlot._id, {
      status: SlotStatus.AVAILABLE,
      lockedByPatientId: null,
      lockedAt: null,
      lockExpiresAt: null,
    });
    throw error;
  }

  // ── 7. Create Razorpay Order ───────────────────────────────────────────
  //    Amount must be in paise (₹500 = 50000 paise)
  let razorpayOrder;
  try {
    razorpayOrder = await razorpayInstance.orders.create({
      amount: consultationFee * 100, // Convert INR to paise
      currency: "INR",
      receipt: appointment.appointmentNumber,
      notes: {
        appointmentId: appointment._id.toString(),
        patientId: patientId!,
        doctorId: doctor._id.toString(),
      },
    });
  } catch (error) {
    // Rollback: Release slot and delete appointment if Razorpay fails
    await TimeSlot.findByIdAndUpdate(lockedSlot._id, {
      status: SlotStatus.AVAILABLE,
      lockedByPatientId: null,
      lockedAt: null,
      lockExpiresAt: null,
    });
    await Appointment.findByIdAndDelete(appointment._id);
    throw new ApiError(502, "Payment gateway error. Could not create order. Please try again.");
  }

  // ── 8. Create Payment record in PENDING status ─────────────────────────
  await Payment.create({
    appointmentId: appointment._id,
    patientId: new mongoose.Types.ObjectId(patientId),
    doctorId: doctor._id,
    hospitalId: appointment.hospitalId,
    amount: consultationFee,
    currency: "INR",
    status: PaymentStatus.PENDING,
    gateway: "RAZORPAY",
    orderId: razorpayOrder.id,
  });

  // ── 9. Return Razorpay checkout payload to frontend ────────────────────
  return res.status(201).json(
    new ApiResponse(
      201,
      {
        appointment: {
          _id: appointment._id,
          appointmentNumber: appointment.appointmentNumber,
          date: appointment.date,
          startTime: appointment.startTime,
          endTime: appointment.endTime,
          consultationFee,
          status: appointment.status,
        },
        razorpay: {
          orderId: razorpayOrder.id,
          keyId: RAZORPAY_KEY_ID,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
        },
        slotLockExpiresAt: lockExpiresAt.toISOString(),
      },
      "Booking initiated. Complete payment within 5 minutes to confirm your appointment."
    )
  );
});

// ─── Step 2: Verify Payment ──────────────────────────────────────────────────

/**
 * Patient: Verify Razorpay Payment (Cryptographic Signature Verification)
 *
 * Production Flow:
 * 1. Receive razorpay_order_id, razorpay_payment_id, razorpay_signature from frontend
 * 2. Reconstruct expected signature: HMAC-SHA256(order_id|payment_id, secret)
 * 3. Constant-time compare to prevent timing attacks
 * 4. On success: appointment → CONFIRMED, slot → BOOKED, payment → COMPLETED
 * 5. On failure: 400 error (possible tampering)
 */
export const verifyPayment = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.user?.userId;
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  // ── Input Validation ───────────────────────────────────────────────────
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new ApiError(400, "Missing required payment verification fields: razorpay_order_id, razorpay_payment_id, razorpay_signature.");
  }

  // ── 1. Find the pending payment by Razorpay orderId ────────────────────
  const payment = await Payment.findOne({
    orderId: razorpay_order_id,
    patientId: new mongoose.Types.ObjectId(patientId),
    status: PaymentStatus.PENDING,
  });

  if (!payment) {
    throw new ApiError(404, "No pending payment found for this order. It may have expired or already been processed.");
  }

  // ── 2. Cryptographic Signature Verification ────────────────────────────
  //    Razorpay signs: SHA256 HMAC of "order_id|payment_id" with key_secret
  const expectedSignature = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  // Constant-time comparison to prevent timing attacks
  const isSignatureValid = crypto.timingSafeEqual(
    Buffer.from(expectedSignature, "hex"),
    Buffer.from(razorpay_signature, "hex")
  );

  if (!isSignatureValid) {
    // Mark payment as failed on tampered signature
    await Payment.findByIdAndUpdate(payment._id, {
      status: PaymentStatus.FAILED,
    });

    throw new ApiError(400, "Payment verification failed. Signature mismatch — possible tampering detected.");
  }

  // ── 3. Update Payment → COMPLETED ─────────────────────────────────────
  payment.status = PaymentStatus.COMPLETED;
  payment.transactionId = razorpay_payment_id;
  payment.paidAt = new Date();
  await payment.save();

  // ── 4. Update Appointment → CONFIRMED ──────────────────────────────────
  const appointment = await Appointment.findByIdAndUpdate(
    payment.appointmentId,
    { status: AppointmentStatus.CONFIRMED },
    { new: true }
  )
    .populate({
      path: "doctorId",
      select: "department specialization consultationFee ratingAverage reviewCount",
      populate: { path: "userId", select: "name avatar phoneNumber" },
    })
    .populate("hospitalId", "name slug address contactPhone contactEmail")
    .populate("slotId", "date startTime endTime");

  if (!appointment) {
    throw new ApiError(404, "Associated appointment not found.");
  }

  // ── 5. Update Slot → BOOKED (finalize the hold) ───────────────────────
  await TimeSlot.findByIdAndUpdate(appointment.slotId, {
    status: SlotStatus.BOOKED,
    lockExpiresAt: null, // Clear TTL — slot is now permanently booked
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        appointment,
        payment: {
          _id: payment._id,
          transactionId: payment.transactionId,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          paidAt: payment.paidAt,
          gateway: payment.gateway,
        },
      },
      "Payment verified successfully. Your appointment is confirmed!"
    )
  );
});
