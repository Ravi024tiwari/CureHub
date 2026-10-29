import { Request, Response } from "express";
import mongoose from "mongoose";
import { Appointment } from "../models/Appointment.model.js";
import { DoctorProfile } from "../models/DoctorProfile.model.js";
import { TimeSlot } from "../models/TimeSlot.model.js";
import { Payment } from "../models/Payment.model.js";
import { AppointmentStatus, SlotStatus, PaymentStatus, UserRole } from "../constants/index.js";
import { Hospital } from "../models/Hospital.model.js";
import { generatePrescriptionPdfBuffer } from "../services/prescriptionPdf.service.js";
import { razorpayInstance } from "../config/razorpay.js";

import { isDoctorOnLeave } from "../services/doctorLeave.service.js";
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

  const { status, timeline, dateFrom, dateTo, search } = req.query;

  const query: any = { patientId };

  // Status Filter with Category Handling
  if (status) {
    const s = String(status).toLowerCase();
    if (s === "upcoming") {
      query.status = {
        $in: [
          AppointmentStatus.CONFIRMED,
          AppointmentStatus.PENDING_PAYMENT,
          AppointmentStatus.CHECKED_IN,
          AppointmentStatus.RESCHEDULE_REQUIRED,
        ],
      };
    } else if (s === "completed") {
      query.status = AppointmentStatus.COMPLETED;
    } else if (s === "cancelled") {
      query.status = {
        $in: [
          AppointmentStatus.CANCELLED_BY_PATIENT,
          AppointmentStatus.CANCELLED_BY_DOCTOR,
        ],
      };
    } else if (Object.values(AppointmentStatus).includes(status as AppointmentStatus)) {
      query.status = status;
    }
  }

  const todayStr = new Date().toISOString().split("T")[0];

  // Timeline Filter: 'upcoming' vs 'past'
  if (timeline === "upcoming") {
    query.date = { $gte: todayStr };
    if (!query.status) {
      query.status = {
        $in: [
          AppointmentStatus.CONFIRMED,
          AppointmentStatus.PENDING_PAYMENT,
          AppointmentStatus.CHECKED_IN,
        ],
      };
    }
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

  // Search filter
  if (search && typeof search === "string" && search.trim()) {
    const searchRegex = new RegExp(search.trim(), "i");
    query.$or = [
      { appointmentNumber: searchRegex },
      { symptoms: searchRegex },
    ];
  }

  const sortOrder: any =
    timeline === "upcoming" || String(status).toLowerCase() === "upcoming"
      ? { date: 1, startTime: 1 }
      : { date: -1, startTime: -1 };

  const [
    appointments,
    totalDocs,
    allCount,
    upcomingCount,
    completedCount,
    cancelledCount,
  ] = await Promise.all([
    Appointment.find(query)
      .populate({
        path: "doctorId",
        select: "department specialization consultationFee ratingAverage reviewCount bio experienceYears",
        populate: { path: "userId", select: "name avatar phoneNumber email" },
      })
      .populate("hospitalId", "name slug address contactPhone contactEmail website images image")
      .populate("slotId", "date startTime endTime")
      .sort(sortOrder)
      .skip(skip)
      .limit(limit),
    Appointment.countDocuments(query),
    Appointment.countDocuments({ patientId }),
    Appointment.countDocuments({
      patientId,
      status: {
        $in: [
          AppointmentStatus.CONFIRMED,
          AppointmentStatus.PENDING_PAYMENT,
          AppointmentStatus.CHECKED_IN,
          AppointmentStatus.RESCHEDULE_REQUIRED,
        ],
      },
    }),
    Appointment.countDocuments({
      patientId,
      status: AppointmentStatus.COMPLETED,
    }),
    Appointment.countDocuments({
      patientId,
      status: {
        $in: [
          AppointmentStatus.CANCELLED_BY_PATIENT,
          AppointmentStatus.CANCELLED_BY_DOCTOR,
        ],
      },
    }),
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
        counts: {
          all: allCount,
          upcoming: upcomingCount,
          completed: completedCount,
          cancelled: cancelledCount,
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

  // Check if this cancellation is due to doctor leave (RESCHEDULE_REQUIRED)
  const isDoctorLeaveCancellation = appointment.status === AppointmentStatus.RESCHEDULE_REQUIRED;

  // 2-DAY (48-HOUR) CANCELLATION RULE (WAIVED if doctor is on leave)
  if (!isDoctorLeaveCancellation) {
    const appointmentDateTime = parseAppointmentDateTime(appointment.date, appointment.startTime);
    const diffMilliseconds = appointmentDateTime.getTime() - Date.now();
    const diffHours = diffMilliseconds / (1000 * 60 * 60);

    if (diffHours < 48) {
      throw new ApiError(
        400,
        "Cancellation policy violation: Appointments can only be cancelled at least 2 days (48 hours) prior to the scheduled appointment time."
      );
    }
  }

  // Update appointment status: if doctor leave, mark as CANCELLED_BY_DOCTOR so refund is 100% justified
  appointment.status = isDoctorLeaveCancellation
    ? AppointmentStatus.CANCELLED_BY_DOCTOR
    : AppointmentStatus.CANCELLED_BY_PATIENT;

  appointment.cancellation = {
    cancelledBy: new mongoose.Types.ObjectId(patientId),
    reason: isDoctorLeaveCancellation
      ? `Patient requested refund due to doctor leave: ${appointment.doctorLeaveReason || "Doctor unavailable"}`
      : reason?.trim() || "Cancelled by patient",
    cancelledAt: new Date(),
  };

  appointment.rescheduleDeadline = null;
  await appointment.save();

  // Release the booked time slot back to AVAILABLE for other patients (if not already unavailable)
  const slot = await TimeSlot.findById(appointment.slotId);
  if (slot && slot.status !== SlotStatus.UNAVAILABLE) {
    slot.status = SlotStatus.AVAILABLE;
    slot.lockedByPatientId = null;
    slot.lockedAt = null;
    slot.lockExpiresAt = null;
    await slot.save();
  }

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
          reason: isDoctorLeaveCancellation
            ? "Doctor on leave - 100% refund initiated"
            : reason?.trim() || "Patient cancelled appointment",
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
    payment.status = PaymentStatus.FAILED;
    await payment.save();
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      appointment,
      isDoctorLeaveCancellation
        ? "Appointment cancelled due to doctor leave. 100% full refund has been initiated to your original payment method."
        : "Appointment cancelled successfully. Time slot has been released and refund has been initiated."
    )
  );
});

/**
 * Patient: Reschedule appointment
 * - Normal: Must be 2 days (48 hrs) prior & new slot with same doctor must be available
 * - Doctor Leave (RESCHEDULE_REQUIRED): 48-hr rule is WAIVED. Patient can pick any slot with same doctor within the 7-day priority window for FREE.
 */
export const rescheduleAppointment = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.user?.userId;
  const { id } = req.params;
  const { newSlotId, date, startTime } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid appointment ID format.");
  }

  const appointment = await Appointment.findOne({ _id: id, patientId });
  if (!appointment) {
    throw new ApiError(404, "Appointment not found or you are not authorized to reschedule it.");
  }

  if (
    appointment.status !== AppointmentStatus.CONFIRMED &&
    appointment.status !== AppointmentStatus.PENDING_PAYMENT &&
    appointment.status !== AppointmentStatus.RESCHEDULE_REQUIRED
  ) {
    throw new ApiError(
      400,
      `Cannot reschedule an appointment with status: ${appointment.status}. Only confirmed or leave-affected appointments can be rescheduled.`
    );
  }

  const isLeaveReschedule = appointment.status === AppointmentStatus.RESCHEDULE_REQUIRED;

  // 1. If Doctor Leave: Check that the 7-day priority window has not expired
  if (isLeaveReschedule) {
    if (appointment.rescheduleDeadline && new Date() > appointment.rescheduleDeadline) {
      throw new ApiError(
        400,
        "The 7-day free priority reschedule window for this appointment has expired. Please cancel the appointment to claim your full refund."
      );
    }
  } else {
    // 2. Standard reschedule: Enforce 2-DAY (48-HOUR) RULE
    const currentApptDateTime = parseAppointmentDateTime(appointment.date, appointment.startTime);
    const diffHours = (currentApptDateTime.getTime() - Date.now()) / (1000 * 60 * 60);

    if (diffHours < 48) {
      throw new ApiError(
        400,
        "Reschedule policy violation: Standard appointments can only be rescheduled at least 2 days (48 hours) prior to the scheduled appointment time."
      );
    }
  }

  let lockedNewSlot: any = null;

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

  if (date && startTime) {
    // =========================================================================
    // APPROACH 1: On-Demand Virtual Reschedule (date + startTime)
    // =========================================================================
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new ApiError(400, "Date must be in YYYY-MM-DD format.");
    }
    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(startTime)) {
      throw new ApiError(400, "Start time must be in HH:mm 24-hour format.");
    }

    const slotDateTime = parseAppointmentDateTime(date, startTime);
    if (slotDateTime.getTime() <= Date.now()) {
      throw new ApiError(400, "Cannot reschedule to a slot in the past.");
    }

    const doctor = await DoctorProfile.findById(appointment.doctorId);
    if (!doctor || !doctor.isActive) {
      throw new ApiError(404, "The affiliated doctor is currently not accepting appointments.");
    }

    // Verify doctor not on leave
    const { onLeave: isDocOnLeave, leave: conflictingLeave } = await isDoctorOnLeave(appointment.doctorId, date, startTime);
    const isOnLeave = isDocOnLeave || doctor.leaves?.some((l: any) => l.date === date);
    if (isOnLeave) {
      throw new ApiError(400, "The doctor is on leave on this date. Please pick another date.");
    }

    // Check doctor schedule rules for dayOfWeek
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

    // Guard: check if already booked or actively locked
    const existingSlot = await TimeSlot.findOne({ doctorId: doctor._id, date, startTime });
    if (existingSlot) {
      if (existingSlot.status === SlotStatus.BOOKED || existingSlot.status === SlotStatus.UNAVAILABLE) {
        throw new ApiError(409, "The selected time slot is already booked. Please choose another time.");
      }
      if (
        existingSlot.status === SlotStatus.LOCKED &&
        existingSlot.lockExpiresAt &&
        existingSlot.lockExpiresAt > new Date()
      ) {
        throw new ApiError(409, "This time slot is currently being booked. Please select another slot.");
      }
    }

    // Concurrency lock and mark as BOOKED directly since this is an immediate confirmed reschedule
    try {
      lockedNewSlot = await TimeSlot.findOneAndUpdate(
        {
          doctorId: doctor._id,
          date,
          startTime,
          $or: [
            { status: SlotStatus.AVAILABLE },
            { status: SlotStatus.LOCKED, lockExpiresAt: { $lte: new Date() } },
          ],
        },
        {
          $set: {
            hospitalId: doctor.hospitalId,
            endTime: computedEndTime,
            status: SlotStatus.BOOKED,
            lockedByPatientId: new mongoose.Types.ObjectId(patientId),
            lockedAt: new Date(),
            lockExpiresAt: null,
          },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
    } catch (err: any) {
      if (err.code === 11000) {
        throw new ApiError(409, "The selected new slot was just booked. Please pick another slot.");
      }
      throw err;
    }
  } else if (newSlotId) {
    // =========================================================================
    // APPROACH 2: Legacy Pre-Existing Slot (newSlotId)
    // =========================================================================
    if (!mongoose.Types.ObjectId.isValid(newSlotId)) {
      throw new ApiError(400, "Invalid new slot ID format.");
    }

    const newSlot = await TimeSlot.findById(newSlotId);
    if (!newSlot) {
      throw new ApiError(404, "Requested new time slot not found");
    }

    if (newSlot.status !== SlotStatus.AVAILABLE) {
      throw new ApiError(409, "The selected new time slot is not available. Please choose another slot.");
    }

    if (newSlot.doctorId.toString() !== appointment.doctorId.toString()) {
      throw new ApiError(400, "Appointments can only be rescheduled with the same affiliated doctor.");
    }

    const newSlotDateTime = parseAppointmentDateTime(newSlot.date, newSlot.startTime);
    if (newSlotDateTime.getTime() <= Date.now()) {
      throw new ApiError(400, "Cannot reschedule to a slot in the past.");
    }

    lockedNewSlot = await TimeSlot.findOneAndUpdate(
      { _id: newSlot._id, status: SlotStatus.AVAILABLE },
      {
        status: SlotStatus.BOOKED,
        lockedByPatientId: new mongoose.Types.ObjectId(patientId),
        lockedAt: new Date(),
      },
      { new: true }
    );
  } else {
    throw new ApiError(400, "Please provide either (date, startTime) or a newSlotId to reschedule.");
  }

  if (!lockedNewSlot) {
    throw new ApiError(409, "The selected new slot was just booked. Please pick another slot.");
  }

  // Release the old slot back to AVAILABLE (unless it was marked UNAVAILABLE because of doctor leave)
  const oldSlot = await TimeSlot.findById(appointment.slotId);
  if (oldSlot && oldSlot.status !== SlotStatus.UNAVAILABLE) {
    oldSlot.status = SlotStatus.AVAILABLE;
    oldSlot.lockedByPatientId = null;
    oldSlot.lockedAt = null;
    await oldSlot.save();
  }

  // Record audit history
  if (!appointment.rescheduleHistory) {
    appointment.rescheduleHistory = [];
  }
  appointment.rescheduleHistory.push({
    previousSlotId: appointment.slotId,
    previousDate: appointment.date,
    previousStartTime: appointment.startTime,
    previousEndTime: appointment.endTime,
    reason: isLeaveReschedule
      ? `Rescheduled for free due to doctor leave: ${appointment.doctorLeaveReason || "Personal Leave"}`
      : "Patient requested reschedule",
    rescheduledAt: new Date(),
  });

  // Update appointment with new schedule
  appointment.slotId = lockedNewSlot._id;
  appointment.date = lockedNewSlot.date;
  appointment.startTime = lockedNewSlot.startTime;
  appointment.endTime = lockedNewSlot.endTime;
  appointment.status = AppointmentStatus.CONFIRMED; // Restored to CONFIRMED!
  appointment.rescheduleDeadline = null;
  appointment.doctorLeaveReason = null;

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
      isLeaveReschedule
        ? "Appointment rescheduled successfully to the new time slot at zero additional charge."
        : "Appointment rescheduled successfully to the new time slot."
    )
  );
});

/**
 * Download or Preview Official Prescription PDF for a Completed Appointment
 */

export const downloadPrescriptionPdf = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const userRole = req.user?.role;
  const { id } = req.params;
  const inline = req.query.inline === "true";

  if (!userId) {
    throw new ApiError(401, "Authentication required to access prescription.");
  }

  const isObjectId = mongoose.Types.ObjectId.isValid(id);
  const query = isObjectId ? { _id: id } : { appointmentNumber: id };

  const appointment = await Appointment.findOne(query)
    .populate({
      path: "doctorId",
      select: "department specialization qualifications medicalCouncilRegistrationNumber experienceYears consultationFee userId",
      populate: { path: "userId", select: "name email phoneNumber avatar" },
    })
    .populate("hospitalId", "name slug address contactPhone contactEmail licenseNumber hospitalAdminId")
    .populate("patientId", "name email phoneNumber avatar gender age");

  if (!appointment) {
    throw new ApiError(404, "Appointment not found.");
  }

  // 1. Strict Multi-Tier Role Authorization
  const patientUserId = appointment.patientId?._id?.toString() || appointment.patientId?.toString();
  const doctor = appointment.doctorId as any;
  const doctorUserId = doctor?.userId?._id?.toString() || doctor?.userId?.toString();
  const hospital = appointment.hospitalId as any;
  const hospitalAdminUserId = hospital?.hospitalAdminId?.toString();

  const isPatient = patientUserId === userId;
  const isDoctor = doctorUserId === userId;
  const isHospitalAdmin = hospitalAdminUserId === userId;
  const isSuperAdmin = userRole === UserRole.SUPER_ADMIN;

  if (!isPatient && !isDoctor && !isHospitalAdmin && !isSuperAdmin) {
    throw new ApiError(403, "Access denied. You do not have permission to view or download this prescription.");
  }

  // 2. Lifecycle Status Verification
  if (appointment.status !== AppointmentStatus.COMPLETED) {
    throw new ApiError(
      400,
      `Prescription is only available after the consultation is completed. Current status: '${appointment.status}'.`
    );
  }

  // 3. Clinical Prescription Integrity Check
  if (
    !appointment.prescription ||
    (!appointment.prescription.diagnosis &&
      (!appointment.prescription.medicines || appointment.prescription.medicines.length === 0))
  ) {
    throw new ApiError(404, "No prescription record found for this completed appointment.");
  }

  // 4. Generate Production Streaming PDF Buffer
  const pdfBuffer = await generatePrescriptionPdfBuffer(appointment);

  const filename = `Prescription-${appointment.appointmentNumber}.pdf`;
  const disposition = inline ? "inline" : "attachment";

  // 5. Send Professional HTTP Headers
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `${disposition}; filename="${filename}"`);
  res.setHeader("Content-Length", pdfBuffer.length);
  res.setHeader("Cache-Control", "private, no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  return res.end(pdfBuffer);
});

