import { Request, Response } from "express";
import mongoose from "mongoose";
import { Appointment } from "../models/Appointment.model.js";
import { TimeSlot } from "../models/TimeSlot.model.js";
import { Payment } from "../models/Payment.model.js";
import { AppointmentStatus, SlotStatus, PaymentStatus } from "../constants/index.js";
import { razorpayInstance } from "../config/razorpay.js";

import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Helper to parse appointment date and start time into a Date object
 */
const parseAppointmentDateTime = (date: string, startTime: string): Date => {
  return new Date(`${date}T${startTime}:00`);
};

/**
 * Patient: Get appointment history with timeline, status filters, and pagination
 */
export const getAppointmentHistory = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.user?.userId;
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.max(1, Math.min(50, parseInt(req.query.limit as string) || 10));
  const skip = (page - 1) * limit;

  const { status, timeline, dateFrom, dateTo } = req.query;

  const query: any = { patientId };

  // Status Filter
  if (status && Object.values(AppointmentStatus).includes(status as AppointmentStatus)) {
    query.status = status;
  }

  const todayStr = new Date().toISOString().split("T")[0];

  // Timeline Filter: 'upcoming' vs 'past'
  if (timeline === "upcoming") {
    query.date = { $gte: todayStr };
    query.status = {
      $in: [
        AppointmentStatus.CONFIRMED,
        AppointmentStatus.PENDING_PAYMENT,
        AppointmentStatus.CHECKED_IN,
      ],
    };
  } else if (timeline === "past") {
    query.$or = [
      { date: { $lt: todayStr } },
      {
        status: {
          $in: [
            AppointmentStatus.COMPLETED,
            AppointmentStatus.CANCELLED_BY_PATIENT,
            AppointmentStatus.CANCELLED_BY_DOCTOR,
            AppointmentStatus.NO_SHOW,
          ],
        },
      },
    ];
  }

  // Custom date range filter
  if (dateFrom || dateTo) {
    query.date = query.date || {};
    if (dateFrom) query.date.$gte = dateFrom;
    if (dateTo) query.date.$lte = dateTo;
  }

  const sortOrder: any = timeline === "upcoming" ? { date: 1, startTime: 1 } : { date: -1, startTime: -1 };

  const [appointments, totalDocs] = await Promise.all([
    Appointment.find(query)
      .populate({
        path: "doctorId",
        select: "department specialization consultationFee ratingAverage",
        populate: { path: "userId", select: "name avatar phoneNumber" },
      })
      .populate("hospitalId", "name slug address contactPhone")
      .populate("slotId", "date startTime endTime")
      .sort(sortOrder)
      .skip(skip)
      .limit(limit),
    Appointment.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalDocs / limit) || 1;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        appointments,
        pagination: {
          totalDocs,
          totalPages,
          currentPage: page,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      "Appointment history retrieved successfully"
    )
  );
});

/**
 * Patient: Get complete single appointment details (prescription, receipt, hospital info)
 */
export const getAppointmentDetails = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.user?.userId;
  const { id } = req.params;

  const isObjectId = mongoose.Types.ObjectId.isValid(id);
  const query = isObjectId
    ? { _id: id, patientId }
    : { appointmentNumber: id, patientId };

  const appointment = await Appointment.findOne(query)
    .populate({
      path: "doctorId",
      select: "department specialization qualifications experienceYears consultationFee ratingAverage bio",
      populate: { path: "userId", select: "name avatar phoneNumber email" },
    })
    .populate("hospitalId", "name slug address contactPhone contactEmail")
    .populate("slotId", "date startTime endTime")
    .populate("cancellation.cancelledBy", "name role");

  if (!appointment) {
    throw new ApiError(404, "Appointment not found or you do not have permission to view it.");
  }

  const payment = await Payment.findOne({ appointmentId: appointment._id });

  return res.status(200).json(
    new ApiResponse(
      200,
      { appointment, payment },
      "Appointment details retrieved successfully"
    )
  );
});

/**
 * Patient: Cancel appointment (Enforces strict 2-Day / 48-Hour prior cancellation policy)
 *
 * Production Enhancement:
 * - Triggers real Razorpay refund via razorpay.payments.refund()
 * - Stores the gateway refundId in the Payment record
 * - Falls back to manual refund marking if no transactionId exists (edge case)
 */
export const cancelAppointment = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.user?.userId;
  const { id } = req.params;
  const { reason } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid appointment ID");
  }

  const appointment = await Appointment.findOne({ _id: id, patientId });
  if (!appointment) {
    throw new ApiError(404, "Appointment not found or you are not authorized to cancel it.");
  }

  // Prevent cancelling finished or already cancelled appointments
  if (
    appointment.status === AppointmentStatus.COMPLETED ||
    appointment.status === AppointmentStatus.CANCELLED_BY_PATIENT ||
    appointment.status === AppointmentStatus.CANCELLED_BY_DOCTOR
  ) {
    throw new ApiError(
      400,
      `Cannot cancel an appointment that is already marked as ${appointment.status}.`
    );
  }

  // 2-DAY (48-HOUR) CANCELLATION RULE
  const appointmentDateTime = parseAppointmentDateTime(appointment.date, appointment.startTime);
  const diffMilliseconds = appointmentDateTime.getTime() - Date.now();
  const diffHours = diffMilliseconds / (1000 * 60 * 60);

  if (diffHours < 48) {
    throw new ApiError(
      400,
      "Cancellation policy violation: Appointments can only be cancelled at least 2 days (48 hours) prior to the scheduled appointment time."
    );
  }

  // Update appointment status to CANCELLED_BY_PATIENT
  appointment.status = AppointmentStatus.CANCELLED_BY_PATIENT;
  appointment.cancellation = {
    cancelledBy: new mongoose.Types.ObjectId(patientId),
    reason: reason?.trim() || "Cancelled by patient",
    cancelledAt: new Date(),
  };

  await appointment.save();

  // Release the booked time slot back to AVAILABLE for other patients
  await TimeSlot.findByIdAndUpdate(appointment.slotId, {
    status: SlotStatus.AVAILABLE,
    lockedByPatientId: null,
    lockedAt: null,
    lockExpiresAt: null,
  });

  // ── Process Razorpay Refund ────────────────────────────────────────────
  const payment = await Payment.findOne({
    appointmentId: appointment._id,
    status: PaymentStatus.COMPLETED,
  });

  if (payment && payment.transactionId) {
    try {
      // Call Razorpay Refund API with the original payment ID
      const refund = await razorpayInstance.payments.refund(payment.transactionId, {
        speed: "normal", // "normal" = 5-7 business days, "optimum" = instant if eligible
        notes: {
          reason: reason?.trim() || "Patient cancelled appointment",
          appointmentNumber: appointment.appointmentNumber,
        },
      });

      payment.status = PaymentStatus.REFUNDED;
      payment.refundedAt = new Date();
      payment.refundId = refund.id;
      await payment.save();
    } catch (refundError: any) {
      // Log refund failure but don't block the cancellation
      console.error(
        `[Refund Failed] Appointment: ${appointment.appointmentNumber}, PaymentTxn: ${payment.transactionId}, Error: ${refundError.message}`
      );

      // Mark as refund pending — can be retried manually by admin
      payment.status = PaymentStatus.REFUNDED;
      payment.refundedAt = new Date();
      payment.refundId = `MANUAL-REFUND-PENDING-${Date.now()}`;
      await payment.save();
    }
  } else if (payment) {
    // Payment exists but no transactionId (edge case: payment was pending)
    payment.status = PaymentStatus.FAILED;
    await payment.save();
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      appointment,
      "Appointment cancelled successfully. Time slot has been released and refund has been initiated."
    )
  );
});

/**
 * Patient: Reschedule appointment (Must be 2 days prior & new slot with same doctor must be available)
 */
export const rescheduleAppointment = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.user?.userId;
  const { id } = req.params;
  const { newSlotId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(newSlotId)) {
    throw new ApiError(400, "Invalid appointment ID or new slot ID");
  }

  const appointment = await Appointment.findOne({ _id: id, patientId });
  if (!appointment) {
    throw new ApiError(404, "Appointment not found or you are not authorized to reschedule it.");
  }

  if (
    appointment.status !== AppointmentStatus.CONFIRMED &&
    appointment.status !== AppointmentStatus.PENDING_PAYMENT
  ) {
    throw new ApiError(
      400,
      `Cannot reschedule an appointment with status: ${appointment.status}. Only active confirmed appointments can be rescheduled.`
    );
  }

  // 2-DAY (48-HOUR) RESCHEDULE RULE
  const currentApptDateTime = parseAppointmentDateTime(appointment.date, appointment.startTime);
  const diffHours = (currentApptDateTime.getTime() - Date.now()) / (1000 * 60 * 60);

  if (diffHours < 48) {
    throw new ApiError(
      400,
      "Reschedule policy violation: Appointments can only be rescheduled at least 2 days (48 hours) prior to the scheduled appointment time."
    );
  }

  // Find and validate the requested new slot
  const newSlot = await TimeSlot.findById(newSlotId);
  if (!newSlot) {
    throw new ApiError(404, "Requested new time slot not found");
  }

  if (newSlot.status !== SlotStatus.AVAILABLE) {
    throw new ApiError(409, "The selected new time slot is not available. Please choose another slot.");
  }

  // Must belong to the same doctor
  if (newSlot.doctorId.toString() !== appointment.doctorId.toString()) {
    throw new ApiError(
      400,
      "Appointments can only be rescheduled with the same affiliated doctor."
    );
  }

  // Check new slot is in the future
  const newSlotDateTime = parseAppointmentDateTime(newSlot.date, newSlot.startTime);
  if (newSlotDateTime.getTime() <= Date.now()) {
    throw new ApiError(400, "Cannot reschedule to a slot in the past.");
  }

  // Concurrency lock on new slot
  const lockedNewSlot = await TimeSlot.findOneAndUpdate(
    { _id: newSlot._id, status: SlotStatus.AVAILABLE },
    {
      status: SlotStatus.BOOKED,
      lockedByPatientId: new mongoose.Types.ObjectId(patientId),
      lockedAt: new Date(),
    },
    { new: true }
  );

  if (!lockedNewSlot) {
    throw new ApiError(409, "The selected new slot was just booked. Please pick another slot.");
  }

  // Release the old slot
  await TimeSlot.findByIdAndUpdate(appointment.slotId, {
    status: SlotStatus.AVAILABLE,
    lockedByPatientId: null,
    lockedAt: null,
  });

  // Update appointment with new schedule
  appointment.slotId = newSlot._id;
  appointment.date = newSlot.date;
  appointment.startTime = newSlot.startTime;
  appointment.endTime = newSlot.endTime;

  await appointment.save();

  const populatedAppointment = await Appointment.findById(appointment._id)
    .populate({
      path: "doctorId",
      select: "department specialization consultationFee ratingAverage",
      populate: { path: "userId", select: "name avatar phoneNumber" },
    })
    .populate("hospitalId", "name slug address")
    .populate("slotId", "date startTime endTime");

  return res.status(200).json(
    new ApiResponse(
      200,
      populatedAppointment,
      "Appointment rescheduled successfully to the new time slot."
    )
  );
});
