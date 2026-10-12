import { Request, Response } from "express";
import mongoose from "mongoose";
import { DoctorProfile } from "../models/DoctorProfile.model.js";
import { Appointment } from "../models/Appointment.model.js";
import { TimeSlot } from "../models/TimeSlot.model.js";
import { Hospital } from "../models/Hospital.model.js";
import { User } from "../models/User.model.js";
import {
  HospitalJoinRequest,
  JoinRequestStatus,
} from "../models/HospitalJoinRequest.model.js";
import {
  AppointmentStatus,
  SlotStatus,
  VerificationStatus,
} from "../constants/index.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Helper to fetch DoctorProfile for the authenticated user
 */
const getDoctorProfileByUserId = async (userId: string) => {
  const doctor = await DoctorProfile.findOne({ userId });
  if (!doctor) {
    throw new ApiError(404, "Doctor profile not found for this account.");
  }
  return doctor;
};

// ==========================================
// 1. DOCTOR PROFILE & DETAILS
// ==========================================

/**
 * Get logged-in doctor profile details with hospital & user info
 */
export const getMyDoctorProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const doctor = await DoctorProfile.findOne({ userId })
    .populate("userId", "name email phoneNumber avatar role isEmailVerified")
    .populate("hospitalId", "name slug address contactPhone contactEmail verified");

  if (!doctor) {
    throw new ApiError(404, "Doctor profile not found");
  }

  return res.status(200).json(
    new ApiResponse(200, doctor, "Doctor profile retrieved successfully")
  );
});

/**
 * Update logged-in doctor profile (fee, bio, specialization, department, schedule rules)
 */
export const updateDoctorProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const doctor = await getDoctorProfileByUserId(userId);

  const {
    department,
    specialization,
    qualifications,
    experienceYears,
    consultationFee,
    bio,
    scheduleRules,
    name,
    phoneNumber,
  } = req.body;

  // Update base User fields if provided
  if (name || phoneNumber) {
    const user = await User.findById(userId);
    if (user) {
      if (name && name.trim()) user.name = name.trim();
      if (phoneNumber && phoneNumber.trim()) user.phoneNumber = phoneNumber.trim();
      await user.save();
    }
  }

  // Update DoctorProfile fields
  if (department && department.trim()) doctor.department = department.trim();
  if (Array.isArray(specialization)) doctor.specialization = specialization;
  if (Array.isArray(qualifications)) doctor.qualifications = qualifications;
  if (experienceYears !== undefined) doctor.experienceYears = Math.max(0, Number(experienceYears));
  if (consultationFee !== undefined) doctor.consultationFee = Math.max(0, Number(consultationFee));
  if (bio !== undefined) doctor.bio = bio.trim();
  if (Array.isArray(scheduleRules)) doctor.scheduleRules = scheduleRules;

  await doctor.save();

  const populatedDoctor = await DoctorProfile.findById(doctor._id)
    .populate("userId", "name email phoneNumber avatar")
    .populate("hospitalId", "name slug address");

  return res.status(200).json(
    new ApiResponse(200, populatedDoctor, "Doctor profile updated successfully")
  );
});

// ==========================================
// 2. DOCTOR PRODUCTION DASHBOARD & ANALYTICS
// ==========================================

/**
 * Production-grade dashboard metrics:
 * - Summary KPI cards (Today's counts, lifetime counts, revenue, ratings)
 * - Next upcoming patient consultation
 * - Monthly appointment & revenue trends (Jan - Dec)
 * - Yearly analytics
 * - Status distribution breakdown
 */
export const getDoctorDashboard = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const doctor = await getDoctorProfileByUserId(userId);

  const todayStr = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
  const currentYear = new Date().getFullYear();

  // 1. Parallel execution for primary KPI counters
  const [
    todayAppointments,
    allAppointments,
    distinctPatients,
    nextUpcomingAppointment,
  ] = await Promise.all([
    // Today's appointments
    Appointment.find({ doctorId: doctor._id, date: todayStr }),
    // All lifetime appointments
    Appointment.find({ doctorId: doctor._id }),
    // Distinct treated patients
    Appointment.distinct("patientId", {
      doctorId: doctor._id,
      status: AppointmentStatus.COMPLETED,
    }),
    // Next upcoming appointment today
    Appointment.findOne({
      doctorId: doctor._id,
      date: todayStr,
      status: { $in: [AppointmentStatus.CONFIRMED, AppointmentStatus.IN_PROGRESS] },
    })
      .sort({ startTime: 1 })
      .populate("patientId", "name email phoneNumber avatar"),
  ]);

  // Today's KPI calculations
  const todayTotal = todayAppointments.length;
  const todayCompleted = todayAppointments.filter(
    (a) => a.status === AppointmentStatus.COMPLETED
  ).length;
  const todayPending = todayAppointments.filter((a) =>
    [AppointmentStatus.CONFIRMED, AppointmentStatus.IN_PROGRESS].includes(a.status)
  ).length;
  const todayCancelled = todayAppointments.filter((a) =>
    [
      AppointmentStatus.CANCELLED_BY_PATIENT,
      AppointmentStatus.CANCELLED_BY_DOCTOR,
      AppointmentStatus.NO_SHOW,
    ].includes(a.status)
  ).length;

  // Lifetime KPI calculations
  const totalAppointments = allAppointments.length;
  const totalCompleted = allAppointments.filter(
    (a) => a.status === AppointmentStatus.COMPLETED
  ).length;
  const totalRevenue = allAppointments
    .filter((a) => a.status === AppointmentStatus.COMPLETED)
    .reduce((sum, a) => sum + (a.consultationFee || 0), 0);

  // Status Distribution
  const statusDistribution: Record<string, number> = {
    CONFIRMED: 0,
    IN_PROGRESS: 0,
    COMPLETED: 0,
    CANCELLED_BY_PATIENT: 0,
    CANCELLED_BY_DOCTOR: 0,
    NO_SHOW: 0,
  };
  allAppointments.forEach((a) => {
    if (statusDistribution[a.status] !== undefined) {
      statusDistribution[a.status]++;
    }
  });

  // 2. Monthly Trend Analytics for Current Year (Jan - Dec)
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const monthlyStats = monthNames.map((name, index) => ({
    month: name,
    monthNumber: index + 1,
    appointments: 0,
    completed: 0,
    cancelled: 0,
    revenue: 0,
  }));

  allAppointments.forEach((a) => {
    if (a.date && a.date.startsWith(`${currentYear}-`)) {
      const monthPart = parseInt(a.date.split("-")[1], 10);
      if (monthPart >= 1 && monthPart <= 12) {
        const item = monthlyStats[monthPart - 1];
        item.appointments++;
        if (a.status === AppointmentStatus.COMPLETED) {
          item.completed++;
          item.revenue += a.consultationFee || 0;
        } else if (
          a.status === AppointmentStatus.CANCELLED_BY_PATIENT ||
          a.status === AppointmentStatus.CANCELLED_BY_DOCTOR
        ) {
          item.cancelled++;
        }
      }
    }
  });

  // 3. Yearly Trend Analytics (Past 5 Years)
  const yearlyStatsMap: Record<number, { year: number; appointments: number; revenue: number }> =
    {};
  for (let y = currentYear - 4; y <= currentYear; y++) {
    yearlyStatsMap[y] = { year: y, appointments: 0, revenue: 0 };
  }

  allAppointments.forEach((a) => {
    if (a.date) {
      const year = parseInt(a.date.split("-")[0], 10);
      if (yearlyStatsMap[year]) {
        yearlyStatsMap[year].appointments++;
        if (a.status === AppointmentStatus.COMPLETED) {
          yearlyStatsMap[year].revenue += a.consultationFee || 0;
        }
      }
    }
  });
  const yearlyStats = Object.values(yearlyStatsMap);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        doctorInfo: {
          id: doctor._id,
          ratingAverage: doctor.ratingAverage,
          reviewCount: doctor.reviewCount,
          department: doctor.department,
          hospitalAffiliationStatus: doctor.hospitalAffiliationStatus,
        },
        kpis: {
          today: {
            total: todayTotal,
            completed: todayCompleted,
            pending: todayPending,
            cancelled: todayCancelled,
          },
          lifetime: {
            totalAppointments,
            totalCompleted,
            totalPatientsTreated: distinctPatients.length,
            totalRevenue,
          },
        },
        nextUpcomingAppointment,
        analytics: {
          currentYear,
          monthlyStats,
          yearlyStats,
          statusDistribution,
        },
      },
      "Doctor dashboard metrics retrieved successfully"
    )
  );
});

// ==========================================
// 3. DOCTOR APPOINTMENTS MANAGEMENT
// ==========================================

/**
 * Get all appointments for logged-in doctor with:
 * - Pagination
 * - Tab filters: 'today' | 'upcoming' | 'past' | 'all'
 * - Specific status filter
 * - Sorting: newest/upcoming on top
 */
export const getDoctorAppointments = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const doctor = await getDoctorProfileByUserId(userId);

  const { tab = "today", status, date, search } = req.query;
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.max(1, Math.min(50, parseInt(req.query.limit as string) || 10));
  const skip = (page - 1) * limit;

  const todayStr = new Date().toISOString().split("T")[0];

  const query: any = { doctorId: doctor._id };

  // 1. Tab-based Date / State filtering
  if (tab === "today") {
    query.date = todayStr;
  } else if (tab === "upcoming") {
    query.$or = [
      { date: { $gt: todayStr } },
      {
        date: todayStr,
        status: { $in: [AppointmentStatus.CONFIRMED, AppointmentStatus.IN_PROGRESS] },
      },
    ];
  } else if (tab === "past") {
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

  // 2. Exact date override if provided
  if (date && typeof date === "string") {
    query.date = date;
  }

  // 3. Specific status filter
  if (status && typeof status === "string") {
    query.status = status;
  }

  // Determine sorting strategy:
  // For 'today' and 'upcoming': sort earliest time slot first
  // For 'past' and 'all': sort most recent date on top
  const sortOption: any =
    tab === "today" || tab === "upcoming"
      ? { date: 1, startTime: 1 }
      : { date: -1, startTime: -1 };

  const [appointments, totalDocs] = await Promise.all([
    Appointment.find(query)
      .populate("patientId", "name email phoneNumber avatar")
      .populate("hospitalId", "name slug address")
      .populate("slotId", "startTime endTime status")
      .sort(sortOption)
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
      "Doctor appointments retrieved successfully"
    )
  );
});

/**
 * Get single appointment details for doctor
 */
export const getDoctorAppointmentById = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { id } = req.params;

  if (!userId) throw new ApiError(401, "Unauthorized");
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid appointment ID format");
  }

  const doctor = await getDoctorProfileByUserId(userId);

  const appointment = await Appointment.findOne({
    _id: id,
    doctorId: doctor._id,
  })
    .populate("patientId", "name email phoneNumber avatar dateOfBirth gender bloodGroup")
    .populate("hospitalId", "name slug address contactPhone")
    .populate("slotId", "date startTime endTime status");

  if (!appointment) {
    throw new ApiError(404, "Appointment not found or not assigned to you.");
  }

  return res.status(200).json(
    new ApiResponse(200, appointment, "Appointment details retrieved successfully")
  );
});

/**
 * Update appointment status state-machine:
 * - IN_PROGRESS: Consultation is ongoing
 * - NO_SHOW: Patient did not attend
 * - CANCELLED_BY_DOCTOR: Doctor cancelled with reason (releases time slot)
 */
export const updateAppointmentStatus = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { id } = req.params;
  const { status, reason } = req.body;

  if (!userId) throw new ApiError(401, "Unauthorized");
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid appointment ID format");
  }

  const doctor = await getDoctorProfileByUserId(userId);

  const appointment = await Appointment.findOne({
    _id: id,
    doctorId: doctor._id,
  });

  if (!appointment) {
    throw new ApiError(404, "Appointment not found or not assigned to you.");
  }

  // Prevent modifying already completed or cancelled appointments
  if (
    appointment.status === AppointmentStatus.COMPLETED ||
    appointment.status === AppointmentStatus.CANCELLED_BY_PATIENT ||
    appointment.status === AppointmentStatus.CANCELLED_BY_DOCTOR
  ) {
    throw new ApiError(
      400,
      `Cannot change status of an appointment that is already '${appointment.status}'.`
    );
  }

  // Disallow marking COMPLETED directly through this endpoint (Must use /complete with prescription)
  if (status === AppointmentStatus.COMPLETED) {
    throw new ApiError(
      400,
      "To complete an appointment, please submit the consultation prescription via POST /api/doctors/appointments/:id/complete."
    );
  }

  // Handle Cancellation by Doctor
  if (status === AppointmentStatus.CANCELLED_BY_DOCTOR) {
    if (!reason || !reason.trim()) {
      throw new ApiError(400, "Cancellation reason is mandatory when doctor cancels.");
    }
    appointment.status = AppointmentStatus.CANCELLED_BY_DOCTOR;
    appointment.cancellation = {
      cancelledBy: new mongoose.Types.ObjectId(userId),
      reason: reason.trim(),
      cancelledAt: new Date(),
    };

    // Release the time slot back so others can book or doctor can re-open
    await TimeSlot.findByIdAndUpdate(appointment.slotId, {
      status: SlotStatus.AVAILABLE,
      lockedByPatientId: null,
      lockedAt: null,
    });
  } else if (
    status === AppointmentStatus.IN_PROGRESS ||
    status === AppointmentStatus.NO_SHOW ||
    status === AppointmentStatus.CHECKED_IN
  ) {
    appointment.status = status;
  } else {
    throw new ApiError(400, `Invalid status transition to '${status}'.`);
  }

  await appointment.save();

  return res.status(200).json(
    new ApiResponse(200, appointment, `Appointment status updated to ${appointment.status}`)
  );
});

/**
 * Complete Appointment & Issue Digital Prescription
 * - Marks status = COMPLETED
 * - Saves diagnosis, prescribed medicines, and advice notes
 */
export const completeAppointmentWithPrescription = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { diagnosis, medicines, notes } = req.body;

    if (!userId) throw new ApiError(401, "Unauthorized");
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid appointment ID format");
    }

    if (!diagnosis || !diagnosis.trim()) {
      throw new ApiError(400, "Diagnosis is required to complete the consultation.");
    }

    if (!Array.isArray(medicines) || medicines.length === 0) {
      throw new ApiError(
        400,
        "At least one prescribed medicine or treatment item is required."
      );
    }

    // Validate medicines structure
    for (const med of medicines) {
      if (!med.name || !med.dosage || !med.frequency || !med.duration) {
        throw new ApiError(
          400,
          "Each prescribed medicine must include name, dosage, frequency, and duration."
        );
      }
    }

    const doctor = await getDoctorProfileByUserId(userId);

    const appointment = await Appointment.findOne({
      _id: id,
      doctorId: doctor._id,
    });

    if (!appointment) {
      throw new ApiError(404, "Appointment not found or not assigned to you.");
    }

    if (
      appointment.status === AppointmentStatus.CANCELLED_BY_PATIENT ||
      appointment.status === AppointmentStatus.CANCELLED_BY_DOCTOR ||
      appointment.status === AppointmentStatus.NO_SHOW
    ) {
      throw new ApiError(
        400,
        `Cannot issue prescription for an appointment with status '${appointment.status}'.`
      );
    }

    // Set prescription & complete status
    appointment.status = AppointmentStatus.COMPLETED;
    appointment.prescription = {
      diagnosis: diagnosis.trim(),
      medicines: medicines.map((m: any) => ({
        name: m.name.trim(),
        dosage: m.dosage.trim(),
        frequency: m.frequency.trim(),
        duration: m.duration.trim(),
        instructions: m.instructions?.trim() || "",
      })),
      notes: notes?.trim() || "",
      issuedAt: new Date(),
    };

    await appointment.save();

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate("patientId", "name email phoneNumber avatar")
      .populate("hospitalId", "name address contactPhone");

    return res.status(200).json(
      new ApiResponse(
        200,
        populatedAppointment,
        "Consultation completed and digital prescription issued successfully."
      )
    );
  }
);

// ==========================================
// 4. DOCTOR LEAVES MANAGEMENT (PREVENT BOOKINGS)
// ==========================================

/**
 * Apply for leave on a specific date (YYYY-MM-DD):
 * - Validates date format & future/today
 * - Cancels or marks TimeSlots as UNAVAILABLE on that date
 * - Records leave on doctor profile
 */
export const applyDoctorLeave = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { date, reason } = req.body;

  if (!userId) throw new ApiError(401, "Unauthorized");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new ApiError(400, "Valid date in YYYY-MM-DD format is required.");
  }

  const todayStr = new Date().toISOString().split("T")[0];
  if (date < todayStr) {
    throw new ApiError(400, "Cannot apply for leave on past dates.");
  }

  const doctor = await getDoctorProfileByUserId(userId);

  // Check if leave already exists for this date
  const alreadyOnLeave = doctor.leaves.some((l) => l.date === date);
  if (alreadyOnLeave) {
    throw new ApiError(409, `You have already applied for leave on ${date}.`);
  }

  // Check if there are active confirmed appointments on this date
  const activeAppointments = await Appointment.find({
    doctorId: doctor._id,
    date,
    status: { $in: [AppointmentStatus.CONFIRMED, AppointmentStatus.IN_PROGRESS] },
  });

  // Automatically cancel conflicting appointments with doctor-leave reason
  if (activeAppointments.length > 0) {
    for (const appt of activeAppointments) {
      appt.status = AppointmentStatus.CANCELLED_BY_DOCTOR;
      appt.cancellation = {
        cancelledBy: new mongoose.Types.ObjectId(userId),
        reason: reason?.trim() || "Doctor on approved medical/personal leave",
        cancelledAt: new Date(),
      };
      await appt.save();
    }
  }

  // Mark all unbooked slots on this date as UNAVAILABLE
  await TimeSlot.updateMany(
    { doctorId: doctor._id, date, status: SlotStatus.AVAILABLE },
    { status: SlotStatus.UNAVAILABLE }
  );

  // Add leave to doctor profile
  doctor.leaves.push({
    date,
    reason: reason?.trim() || "Personal Leave",
    createdAt: new Date(),
  });
  await doctor.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        date,
        reason: reason?.trim() || "Personal Leave",
        cancelledAppointmentsCount: activeAppointments.length,
        leaves: doctor.leaves,
      },
      `Leave applied for ${date}. ${activeAppointments.length} conflicting appointments were automatically cancelled.`
    )
  );
});

/**
 * Get all leaves applied by doctor
 */
export const getDoctorLeaves = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const doctor = await getDoctorProfileByUserId(userId);

  return res.status(200).json(
    new ApiResponse(200, doctor.leaves, "Doctor leaves retrieved successfully")
  );
});

/**
 * Cancel a scheduled leave and restore available slots
 */
export const cancelDoctorLeave = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { date } = req.params;

  if (!userId) throw new ApiError(401, "Unauthorized");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new ApiError(400, "Valid date in YYYY-MM-DD format is required.");
  }

  const doctor = await getDoctorProfileByUserId(userId);

  const leaveIndex = doctor.leaves.findIndex((l) => l.date === date);
  if (leaveIndex === -1) {
    throw new ApiError(404, `No scheduled leave found for date ${date}.`);
  }

  doctor.leaves.splice(leaveIndex, 1);
  await doctor.save();

  // Re-enable UNAVAILABLE slots to AVAILABLE
  await TimeSlot.updateMany(
    { doctorId: doctor._id, date, status: SlotStatus.UNAVAILABLE },
    { status: SlotStatus.AVAILABLE }
  );

  return res.status(200).json(
    new ApiResponse(200, doctor.leaves, `Leave for ${date} cancelled. Slots reopened.`)
  );
});

// ==========================================
// 5. TIME SLOT CREATION & MANAGEMENT
// ==========================================

/**
 * Get doctor's slots for a specific date or date range
 */
export const getDoctorSlots = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { date } = req.query;

  if (!userId) throw new ApiError(401, "Unauthorized");
  const doctor = await getDoctorProfileByUserId(userId);

  const filter: any = { doctorId: doctor._id };
  if (date && typeof date === "string") {
    filter.date = date;
  }

  const slots = await TimeSlot.find(filter).sort({ date: 1, startTime: 1 });

  return res.status(200).json(
    new ApiResponse(200, slots, "Doctor slots retrieved successfully")
  );
});

/**
 * Generate slots for a date (or next N days) based on scheduleRules
 * - Skips dates where doctor is on leave
 * - Upserts slots without disturbing already booked ones
 */
export const generateDoctorSlots = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { date } = req.body;

  if (!userId) throw new ApiError(401, "Unauthorized");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new ApiError(400, "Target date (YYYY-MM-DD) is required.");
  }

  const doctor = await getDoctorProfileByUserId(userId);

  if (!doctor.hospitalId) {
    throw new ApiError(
      400,
      "You must be affiliated with an approved hospital to publish booking slots."
    );
  }

  // Check if doctor is on leave on this target date
  const onLeave = doctor.leaves.some((l) => l.date === date);
  if (onLeave) {
    throw new ApiError(400, `Cannot generate slots: You are on leave on ${date}.`);
  }

  // Parse day of week for the target date (0 = Sunday, 1 = Monday, etc.)
  const targetDateObj = new Date(`${date}T00:00:00Z`);
  const dayOfWeek = targetDateObj.getUTCDay();

  // Find schedule rule matching dayOfWeek
  const rule = doctor.scheduleRules.find((r) => r.dayOfWeek === dayOfWeek);
  if (!rule) {
    throw new ApiError(
      400,
      `No schedule rule defined in your profile for day ${dayOfWeek} (${date}).`
    );
  }

  // Helper to convert "HH:mm" to minutes from midnight
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

  const startMin = toMinutes(rule.startTime);
  const endMin = toMinutes(rule.endTime);
  const duration = rule.slotDurationMinutes || 30;

  const generatedSlots: any[] = [];
  let current = startMin;

  while (current + duration <= endMin) {
    const startTimeStr = toTimeString(current);
    const endTimeStr = toTimeString(current + duration);

    generatedSlots.push({
      doctorId: doctor._id,
      hospitalId: doctor.hospitalId,
      date,
      startTime: startTimeStr,
      endTime: endTimeStr,
      status: SlotStatus.AVAILABLE,
    });

    current += duration;
  }

  if (generatedSlots.length === 0) {
    throw new ApiError(400, "Schedule start and end time do not yield any valid slots.");
  }

  // Bulk write with setOnInsert so existing booked slots are NEVER overwritten
  const bulkOps = generatedSlots.map((slot) => ({
    updateOne: {
      filter: {
        doctorId: slot.doctorId,
        date: slot.date,
        startTime: slot.startTime,
      },
      update: { $setOnInsert: slot },
      upsert: true,
    },
  }));

  const bulkResult = await TimeSlot.bulkWrite(bulkOps);

  const allDateSlots = await TimeSlot.find({
    doctorId: doctor._id,
    date,
  }).sort({ startTime: 1 });

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        date,
        createdCount: bulkResult.upsertedCount,
        totalSlots: allDateSlots.length,
        slots: allDateSlots,
      },
      `Successfully generated ${bulkResult.upsertedCount} new slots for ${date}.`
    )
  );
});

/**
 * Toggle individual slot availability (AVAILABLE <-> UNAVAILABLE)
 */
export const toggleSlotAvailability = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { slotId } = req.params;

  if (!userId) throw new ApiError(401, "Unauthorized");
  if (!mongoose.Types.ObjectId.isValid(slotId)) {
    throw new ApiError(400, "Invalid slot ID format");
  }

  const doctor = await getDoctorProfileByUserId(userId);

  const slot = await TimeSlot.findOne({
    _id: slotId,
    doctorId: doctor._id,
  });

  if (!slot) {
    throw new ApiError(404, "Slot not found or does not belong to you.");
  }

  if (slot.status === SlotStatus.BOOKED || slot.status === SlotStatus.LOCKED) {
    throw new ApiError(400, `Cannot toggle a slot with status '${slot.status}'.`);
  }

  slot.status =
    slot.status === SlotStatus.AVAILABLE
      ? SlotStatus.UNAVAILABLE
      : SlotStatus.AVAILABLE;

  await slot.save();

  return res.status(200).json(
    new ApiResponse(200, slot, `Slot availability toggled to ${slot.status}`)
  );
});

// ==========================================
// 6. HOSPITAL AFFILIATION & JOIN REQUESTS
// ==========================================

/**
 * Browse available verified hospitals to join
 */
export const getAvailableHospitals = asyncHandler(async (_req: Request, res: Response) => {
  const hospitals = await Hospital.find({
    verificationStatus: VerificationStatus.APPROVED,
    verified: true,
  })
    .select("name slug address contactPhone contactEmail establishedYear")
    .sort({ name: 1 });

  return res.status(200).json(
    new ApiResponse(200, hospitals, "Available hospitals retrieved successfully")
  );
});

/**
 * Doctor submits a Join Request to an approved hospital
 */
export const sendHospitalJoinRequest = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { hospitalId, department, message } = req.body;

  if (!userId) throw new ApiError(401, "Unauthorized");
  if (!hospitalId || !mongoose.Types.ObjectId.isValid(hospitalId)) {
    throw new ApiError(400, "Valid hospital ID is required.");
  }
  if (!department || !department.trim()) {
    throw new ApiError(400, "Department is required.");
  }

  const doctor = await getDoctorProfileByUserId(userId);

  // Verify target hospital exists & is approved
  const hospital = await Hospital.findById(hospitalId);
  if (!hospital || hospital.verificationStatus !== VerificationStatus.APPROVED) {
    throw new ApiError(404, "Target hospital not found or is not currently approved.");
  }

  // Prevent sending duplicate pending requests
  const existingPending = await HospitalJoinRequest.findOne({
    doctorId: doctor._id,
    hospitalId,
    status: JoinRequestStatus.PENDING,
  });

  if (existingPending) {
    throw new ApiError(
      409,
      "You already have a pending affiliation request with this hospital."
    );
  }

  const joinRequest = await HospitalJoinRequest.create({
    doctorId: doctor._id,
    doctorUserId: new mongoose.Types.ObjectId(userId),
    hospitalId,
    department: department.trim(),
    message: message?.trim() || "",
    status: JoinRequestStatus.PENDING,
  });

  doctor.hospitalAffiliationStatus = "PENDING_APPROVAL";
  await doctor.save();

  const populatedRequest = await HospitalJoinRequest.findById(joinRequest._id)
    .populate("hospitalId", "name slug address contactPhone contactEmail")
    .populate({
      path: "doctorId",
      select: "department specialization consultationFee",
      populate: { path: "userId", select: "name avatar" },
    });

  return res.status(201).json(
    new ApiResponse(
      201,
      populatedRequest,
      "Hospital join request submitted successfully. Awaiting Hospital Admin approval."
    )
  );
});

/**
 * Get doctor's current hospital affiliation and request history
 */
export const getMyHospitalAffiliation = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const doctor = await getDoctorProfileByUserId(userId);

  const [currentHospital, joinRequests] = await Promise.all([
    doctor.hospitalId ? Hospital.findById(doctor.hospitalId) : null,
    HospitalJoinRequest.find({ doctorId: doctor._id })
      .populate("hospitalId", "name slug address contactPhone contactEmail")
      .populate("reviewedBy", "name")
      .sort({ createdAt: -1 }),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        affiliationStatus: doctor.hospitalAffiliationStatus,
        currentHospital,
        requests: joinRequests,
      },
      "Hospital affiliation status retrieved successfully"
    )
  );
});

/**
 * Hospital Admin: View pending doctor join requests for their hospital
 */
export const getHospitalDoctorRequests = asyncHandler(async (req: Request, res: Response) => {
  const hospitalAdminUserId = req.user?.userId;
  if (!hospitalAdminUserId) throw new ApiError(401, "Unauthorized");

  // Find hospital managed by this admin
  const hospital = await Hospital.findOne({ hospitalAdminId: hospitalAdminUserId });
  if (!hospital) {
    throw new ApiError(404, "No hospital found for this Hospital Admin.");
  }

  const requests = await HospitalJoinRequest.find({
    hospitalId: hospital._id,
  })
    .populate({
      path: "doctorId",
      select: "department specialization qualifications experienceYears consultationFee bio ratingAverage",
      populate: { path: "userId", select: "name email phoneNumber avatar" },
    })
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, requests, "Doctor join requests retrieved successfully")
  );
});

/**
 * Hospital Admin: Approve or Reject a doctor join request
 */
export const respondToDoctorRequest = asyncHandler(async (req: Request, res: Response) => {
  const hospitalAdminUserId = req.user?.userId;
  const { requestId } = req.params;
  const { action, rejectionReason } = req.body;

  if (!hospitalAdminUserId) throw new ApiError(401, "Unauthorized");
  if (!mongoose.Types.ObjectId.isValid(requestId)) {
    throw new ApiError(400, "Invalid request ID format");
  }

  if (!["APPROVE", "REJECT"].includes(action)) {
    throw new ApiError(400, "Action must be either 'APPROVE' or 'REJECT'.");
  }

  const hospital = await Hospital.findOne({ hospitalAdminId: hospitalAdminUserId });
  if (!hospital) {
    throw new ApiError(404, "No hospital found for this Hospital Admin.");
  }

  const joinRequest = await HospitalJoinRequest.findOne({
    _id: requestId,
    hospitalId: hospital._id,
  });

  if (!joinRequest) {
    throw new ApiError(404, "Join request not found for your hospital.");
  }

  if (joinRequest.status !== JoinRequestStatus.PENDING) {
    throw new ApiError(400, `This request has already been ${joinRequest.status.toLowerCase()}.`);
  }

  if (action === "APPROVE") {
    joinRequest.status = JoinRequestStatus.APPROVED;
    joinRequest.reviewedBy = new mongoose.Types.ObjectId(hospitalAdminUserId);
    joinRequest.reviewedAt = new Date();
    await joinRequest.save();

    // Link doctor profile to this hospital and approve status
    await DoctorProfile.findByIdAndUpdate(joinRequest.doctorId, {
      hospitalId: hospital._id,
      department: joinRequest.department,
      hospitalAffiliationStatus: "APPROVED",
    });

    return res.status(200).json(
      new ApiResponse(200, joinRequest, "Doctor join request approved. Doctor affiliated successfully.")
    );
  } else {
    joinRequest.status = JoinRequestStatus.REJECTED;
    joinRequest.reviewedBy = new mongoose.Types.ObjectId(hospitalAdminUserId);
    joinRequest.reviewedAt = new Date();
    joinRequest.rejectionReason = rejectionReason?.trim() || "Not meeting current hospital requirements.";
    await joinRequest.save();

    await DoctorProfile.findByIdAndUpdate(joinRequest.doctorId, {
      hospitalAffiliationStatus: "REJECTED",
    });

    return res.status(200).json(
      new ApiResponse(200, joinRequest, "Doctor join request rejected.")
    );
  }
});
