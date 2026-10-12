import { Request, Response } from "express";
import mongoose from "mongoose";
import { Appointment } from "../models/Appointment.model.js";
import { TimeSlot } from "../models/TimeSlot.model.js";
import { DoctorProfile } from "../models/DoctorProfile.model.js";
import { PatientProfile } from "../models/PatientProfile.model.js";
import { Payment, PaymentMethod } from "../models/Payment.model.js";
import { AppointmentStatus, SlotStatus, PaymentStatus, ConsultationType } from "../constants/index.js";

import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Helper to generate a unique appointment number: APT-YYYYMMDD-XXXX
 */
const generateAppointmentNumber = (date: string): string => {
  const cleanDate = date.replace(/-/g, "");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `APT-${cleanDate}-${randomSuffix}`;
};

/**
 * Helper to parse appointment date and start time into a Date object
 */
const parseAppointmentDateTime = (date: string, startTime: string): Date => {
  return new Date(`${date}T${startTime}:00`);
};

/**
 * Patient: Book a new Doctor appointment
 */
export const bookAppointment = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.user?.userId;
  const { slotId, symptoms, type, paymentMethod } = req.body;

  if (!slotId || !symptoms || !symptoms.trim()) {
    throw new ApiError(400, "Time slot and symptoms/reason for consultation are required.");
  }

  if (!mongoose.Types.ObjectId.isValid(slotId)) {
    throw new ApiError(400, "Invalid slot ID format");
  }

  // 1. Fetch requested slot
  const slot = await TimeSlot.findById(slotId);
  if (!slot) {
    throw new ApiError(404, "Requested time slot not found");
  }

  if (slot.status !== SlotStatus.AVAILABLE) {
    throw new ApiError(409, "This time slot is no longer available. Please select another slot.");
  }

  // 2. Prevent past slots from being booked
  const slotDateTime = parseAppointmentDateTime(slot.date, slot.startTime);
  if (slotDateTime.getTime() <= Date.now()) {
    throw new ApiError(400, "Cannot book an appointment for a past date or time.");
  }

  // 3. Double Booking Guard: Ensure patient does not already have an active appointment at this date & time
  const existingActiveAppointment = await Appointment.findOne({
    patientId,
    date: slot.date,
    startTime: slot.startTime,
    status: {
      $nin: [
        AppointmentStatus.CANCELLED_BY_PATIENT,
        AppointmentStatus.CANCELLED_BY_DOCTOR,
      ],
    },
  });

  if (existingActiveAppointment) {
    throw new ApiError(
      409,
      "You already have an active appointment scheduled at this exact date and time."
    );
  }

  // 4. Fetch DoctorProfile to snapshot current consultation fee & hospital info
  const doctor = await DoctorProfile.findById(slot.doctorId);
  if (!doctor || !doctor.isActive) {
    throw new ApiError(404, "The requested doctor is currently not accepting appointments.");
  }

  // 5. Concurrency Protection: Atomically lock and book the slot
  const lockedSlot = await TimeSlot.findOneAndUpdate(
    { _id: slot._id, status: SlotStatus.AVAILABLE },
    {
      status: SlotStatus.BOOKED,
      lockedByPatientId: new mongoose.Types.ObjectId(patientId),
      lockedAt: new Date(),
    },
    { new: true }
  );

  if (!lockedSlot) {
    throw new ApiError(
      409,
      "This slot was just booked by another patient. Please choose a different slot."
    );
  }

  // 6. Generate unique appointment number & create Appointment
  const appointmentNumber = generateAppointmentNumber(slot.date);
  const consultationFee = doctor.consultationFee || 200;

  let appointment;
  try {
    appointment = await Appointment.create({
      appointmentNumber,
      patientId: new mongoose.Types.ObjectId(patientId),
      doctorId: doctor._id,
      hospitalId: slot.hospitalId || doctor.hospitalId,
      slotId: slot._id,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      type: type || ConsultationType.IN_PERSON,
      status: AppointmentStatus.CONFIRMED,
      symptoms: symptoms.trim(),
      consultationFee,
    });
  } catch (error) {
    // Rollback slot status on appointment creation failure
    await TimeSlot.findByIdAndUpdate(slot._id, {
      status: SlotStatus.AVAILABLE,
      lockedByPatientId: null,
      lockedAt: null,
    });
    throw error;
  }

  // 7. Create Payment record for consultation fee
  const randomTxn = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const payment = await Payment.create({
    appointmentId: appointment._id,
    patientId: new mongoose.Types.ObjectId(patientId),
    doctorId: doctor._id,
    hospitalId: appointment.hospitalId,
    amount: consultationFee,
    currency: "INR",
    status: PaymentStatus.COMPLETED,
    paymentMethod: paymentMethod || PaymentMethod.UPI,
    gateway: "RAZORPAY",
    transactionId: randomTxn,
    paidAt: new Date(),
  });

  const populatedAppointment = await Appointment.findById(appointment._id)
    .populate({
      path: "doctorId",
      select: "department specialization consultationFee ratingAverage reviewCount",
      populate: { path: "userId", select: "name avatar phoneNumber" },
    })
    .populate("hospitalId", "name slug address contactPhone contactEmail")
    .populate("slotId", "date startTime endTime");

  return res.status(201).json(
    new ApiResponse(
      201,
      { appointment: populatedAppointment, payment },
      "Appointment booked successfully!"
    )
  );
});

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
 * Patient: Comprehensive Dashboard overview (Counters, next appointment, recent activity)
 */
export const getPatientDashboard = asyncHandler(async (req: Request, res: Response) => {
  const patientId = new mongoose.Types.ObjectId(req.user?.userId);
  const todayStr = new Date().toISOString().split("T")[0];

  // 1. Parallel execution of dashboard statistics
  const [
    totalBooked,
    upcomingCount,
    completedCount,
    cancelledCount,
    paymentStats,
    patientProfile,
    nextAppointment,
    recentAppointments,
  ] = await Promise.all([
    Appointment.countDocuments({ patientId }),
    Appointment.countDocuments({
      patientId,
      date: { $gte: todayStr },
      status: {
        $in: [
          AppointmentStatus.CONFIRMED,
          AppointmentStatus.PENDING_PAYMENT,
          AppointmentStatus.CHECKED_IN,
        ],
      },
    }),
    Appointment.countDocuments({ patientId, status: AppointmentStatus.COMPLETED }),
    Appointment.countDocuments({
      patientId,
      status: {
        $in: [
          AppointmentStatus.CANCELLED_BY_PATIENT,
          AppointmentStatus.CANCELLED_BY_DOCTOR,
        ],
      },
    }),
    Payment.aggregate([
      {
        $match: {
          patientId,
          status: PaymentStatus.COMPLETED,
        },
      },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: "$amount" },
        },
      },
    ]),
    PatientProfile.findOne({ userId: patientId }).select("reports"),
    // Next upcoming appointment
    Appointment.findOne({
      patientId,
      date: { $gte: todayStr },
      status: {
        $in: [
          AppointmentStatus.CONFIRMED,
          AppointmentStatus.PENDING_PAYMENT,
          AppointmentStatus.CHECKED_IN,
        ],
      },
    })
      .sort({ date: 1, startTime: 1 })
      .populate({
        path: "doctorId",
        select: "department specialization consultationFee ratingAverage",
        populate: { path: "userId", select: "name avatar phoneNumber" },
      })
      .populate("hospitalId", "name slug address contactPhone"),
    // Last 5 appointments
    Appointment.find({ patientId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({
        path: "doctorId",
        select: "department specialization",
        populate: { path: "userId", select: "name avatar" },
      })
      .populate("hospitalId", "name address"),
  ]);

  const totalSpent = paymentStats.length > 0 ? paymentStats[0].totalSpent : 0;
  const totalReports = patientProfile?.reports?.length || 0;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        statistics: {
          totalBooked,
          upcomingCount,
          completedCount,
          cancelledCount,
          totalSpent,
          totalReports,
        },
        nextAppointment,
        recentAppointments,
      },
      "Patient dashboard data retrieved successfully"
    )
  );
});

/**
 * Patient: Cancel appointment (Enforces strict 2-Day / 48-Hour prior cancellation policy)
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

  // Refund payment if completed
  await Payment.findOneAndUpdate(
    { appointmentId: appointment._id, status: PaymentStatus.COMPLETED },
    {
      status: PaymentStatus.REFUNDED,
      refundedAt: new Date(),
      refundId: `REF-${Date.now()}`,
    }
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      appointment,
      "Appointment cancelled successfully. Time slot has been released and refund processed."
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
