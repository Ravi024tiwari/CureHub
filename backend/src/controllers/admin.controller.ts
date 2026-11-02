import { Request, Response } from "express";
import mongoose from "mongoose";
import { User } from "../models/User.model.js";
import { DoctorProfile } from "../models/DoctorProfile.model.js";
import { HospitalAdminProfile } from "../models/HospitalAdminProfile.model.js";
import { Hospital } from "../models/Hospital.model.js";
import { Appointment } from "../models/Appointment.model.js";
import { Payment } from "../models/Payment.model.js";
import { DoctorLeave } from "../models/DoctorLeave.model.js";
import { VerificationStatus, UserRole, AppointmentStatus, PaymentStatus } from "../constants/index.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { emitToUser, emitToSuperAdmins } from "../services/socket.service.js";


const buildPaginationMeta = (
  totalDocs: number,
  page: number,
  limit: number
) => {
  const totalPages = Math.ceil(totalDocs / limit) || 1;
  return {
    totalDocs,
    totalPages,
    currentPage: page,
    limit,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};


const isValidObjectId = (id: string) => mongoose.Types.ObjectId.isValid(id);


export const verifyDoctor = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, rejectionReason } = req.body;
  const adminId = req.user?.userId;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid doctor ID format");
  }

  if (!status || !Object.values(VerificationStatus).includes(status)) {
    throw new ApiError(
      400,
      `Status must be one of: ${Object.values(VerificationStatus).join(", ")}`
    );
  }

  if (status === VerificationStatus.REJECTED && (!rejectionReason || !rejectionReason.trim())) {
    throw new ApiError(400, "A rejection reason is required when rejecting a doctor application.");
  }

  // Find doctor profile by profile _id or referenced userId
  const doctorProfile = await DoctorProfile.findOne({
    $or: [{ _id: id }, { userId: id }],
  });

  if (!doctorProfile) {
    throw new ApiError(404, "Doctor profile not found");
  }

  const doctorUser = await User.findById(doctorProfile.userId);
  if (!doctorUser) {
    throw new ApiError(404, "Associated user account for doctor not found");
  }

  // Update DoctorProfile verification state
  doctorProfile.verificationStatus = status;
  doctorProfile.verifiedBy = new mongoose.Types.ObjectId(adminId);
  doctorProfile.verifiedAt = new Date();
  doctorProfile.rejectionReason =
    status === VerificationStatus.REJECTED ? rejectionReason.trim() : "";
  if (status === VerificationStatus.REJECTED) {
    doctorProfile.isSubmitted = false;
  }

  await doctorProfile.save();

  // Sync state with User account
  if (status === VerificationStatus.APPROVED) {
    doctorUser.isAccountApproved = true;
    doctorUser.approvedBy = new mongoose.Types.ObjectId(adminId);
    doctorUser.approvedAt = new Date();
    doctorUser.isActive = true;
  } else if (status === VerificationStatus.SUSPENDED) {
    doctorUser.isAccountApproved = false;
    doctorUser.isActive = false;
  } else {
    // REJECTED or PENDING
    doctorUser.isAccountApproved = false;
    doctorUser.approvedBy = undefined;
    doctorUser.approvedAt = undefined;
  }

  await doctorUser.save();

  const populatedProfile = await DoctorProfile.findById(doctorProfile._id)
    .populate("userId", "name email phoneNumber avatar isAccountApproved isActive role")
    .populate("hospitalId", "name slug address");

  // Real-time Socket Event: Notify doctor immediately and notify all Super Admins
  emitToUser(doctorProfile.userId.toString(), "verification:doctor:status-updated", {
    status,
    isAccountApproved: doctorUser.isAccountApproved,
    rejectionReason: doctorProfile.rejectionReason || "",
  });
  emitToSuperAdmins("verification:doctor:updated", {
    doctorId: doctorProfile._id.toString(),
    status,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      populatedProfile,
      `Doctor verification status successfully updated to '${status}'`
    )
  );
});

/**
 * Update hospital admin verification status (Approve, Reject, Suspend)
 */
export const verifyHospitalAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, rejectionReason } = req.body;
  const adminId = req.user?.userId;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid hospital admin ID format");
  }

  if (!status || !Object.values(VerificationStatus).includes(status)) {
    throw new ApiError(
      400,
      `Status must be one of: ${Object.values(VerificationStatus).join(", ")}`
    );
  }

  if (status === VerificationStatus.REJECTED && (!rejectionReason || !rejectionReason.trim())) {
    throw new ApiError(
      400,
      "A rejection reason is required when rejecting a hospital admin application."
    );
  }


  const hospitalAdminProfile = await HospitalAdminProfile.findOne({
    $or: [{ _id: id }, { userId: id }],
  });

  if (!hospitalAdminProfile) {
    throw new ApiError(404, "Hospital admin profile not found");
  }

  const adminUser = await User.findById(hospitalAdminProfile.userId);
  if (!adminUser) {
    throw new ApiError(404, "Associated user account for hospital admin not found");
  }

  // Update HospitalAdminProfile verification state
  hospitalAdminProfile.verificationStatus = status;
  hospitalAdminProfile.verifiedBy = new mongoose.Types.ObjectId(adminId);
  hospitalAdminProfile.verifiedAt = new Date();
  hospitalAdminProfile.rejectionReason =
    status === VerificationStatus.REJECTED ? rejectionReason.trim() : "";

  await hospitalAdminProfile.save();

  // Sync state with User account
  if (status === VerificationStatus.APPROVED) {
    adminUser.isAccountApproved = true;
    adminUser.approvedBy = new mongoose.Types.ObjectId(adminId);
    adminUser.approvedAt = new Date();
    adminUser.isActive = true;
  } else if (status === VerificationStatus.SUSPENDED) {
    adminUser.isAccountApproved = false;
    adminUser.isActive = false;
  } else {
    // REJECTED or PENDING
    adminUser.isAccountApproved = false;
    adminUser.approvedBy = undefined;
    adminUser.approvedAt = undefined;
  }

  await adminUser.save();

  // If there is an associated hospital and the admin account is suspended, deactivate it
  const affiliatedHospital = await Hospital.findOne({
    $or: [
      { hospitalAdminId: hospitalAdminProfile.userId },
      ...(hospitalAdminProfile.hospitalId ? [{ _id: hospitalAdminProfile.hospitalId }] : []),
    ],
  });

  if (affiliatedHospital) {
    if (status === VerificationStatus.SUSPENDED) {
      affiliatedHospital.isActive = false;
      await affiliatedHospital.save();
    }
  }

  const populatedProfile = await HospitalAdminProfile.findById(hospitalAdminProfile._id)
    .populate("userId", "name email phoneNumber avatar isAccountApproved isActive role")
    .populate("hospitalId", "name slug address");

  // Real-time Socket Event: Notify hospital admin immediately and notify all Super Admins
  emitToUser(hospitalAdminProfile.userId.toString(), "verification:hospital-admin:status-updated", {
    status,
    isAccountApproved: adminUser.isAccountApproved,
    rejectionReason: hospitalAdminProfile.rejectionReason || "",
  });
  emitToSuperAdmins("verification:hospital-admin:updated", {
    adminId: hospitalAdminProfile._id.toString(),
    status,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      { profile: populatedProfile, hospital: affiliatedHospital },
      `Hospital Admin verification status successfully updated to '${status}'`
    )
  );
});

/**
 *  Get list of doctors with filtering, search, and pagination
 */
export const getDoctorsForVerification = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 20));
  const skip = (page - 1) * limit;

  const status = req.query.status as VerificationStatus | undefined;
  const search = req.query.search as string | undefined;
  const hospitalId = req.query.hospitalId as string | undefined;
  const specialization = req.query.specialization as string | undefined;
  const dateFilter = req.query.dateFilter as string | undefined;
  const sortBy = req.query.sortBy as string | undefined;

  const query: any = {};

  if (status && Object.values(VerificationStatus).includes(status)) {
    query.verificationStatus = status;
  } else {
    // Exclude incomplete/unsubmitted profiles from Super Admin verification queue
    query.verificationStatus = { $ne: VerificationStatus.INCOMPLETE };
  }

  if (hospitalId && isValidObjectId(hospitalId)) {
    query.hospitalId = hospitalId;
  }

  if (specialization && specialization !== "ALL") {
    query.specialization = specialization;
  }

  if (dateFilter && dateFilter !== "ALL") {
    const now = new Date();
    if (dateFilter === "today") {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      query.createdAt = { $gte: startOfDay };
    } else if (dateFilter === "week") {
      const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      query.createdAt = { $gte: startOfWeek };
    } else if (dateFilter === "month") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      query.createdAt = { $gte: startOfMonth };
    }
  }

  // If searching by name/email/phone, match via User collection first
  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), "i");
    const matchingUsers = await User.find({
      role: UserRole.DOCTOR,
      $or: [{ name: searchRegex }, { email: searchRegex }, { phoneNumber: searchRegex }],
    }).select("_id");

    const userIds = matchingUsers.map((u) => u._id);

    query.$or = [
      { userId: { $in: userIds } },
      { department: searchRegex },
      { medicalCouncilRegistrationNumber: searchRegex },
    ];
  }

  let sortOptions: any = { createdAt: -1 };
  if (sortBy === "oldest") {
    sortOptions = { createdAt: 1 };
  } else if (sortBy === "experience_desc") {
    sortOptions = { experienceYears: -1, createdAt: -1 };
  }

  const [doctors, totalDocs] = await Promise.all([
    DoctorProfile.find(query)
      .populate("userId", "name email phoneNumber avatar isAccountApproved isActive createdAt")
      .populate("hospitalId", "name slug address contactEmail contactPhone")
      .populate("verifiedBy", "name email role")
      .sort(sortOptions)
      .skip(skip)
      .limit(limit),
    DoctorProfile.countDocuments(query),
  ]);

  const pagination = buildPaginationMeta(totalDocs, page, limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      { doctors, pagination },
      "Doctors retrieved successfully"
    )
  );
});

/**
 *  Get single doctor verification detail
 */
export const getDoctorVerificationDetails = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid doctor ID format");
  }

  const doctor = await DoctorProfile.findOne({
    $or: [{ _id: id }, { userId: id }],
  })
    .populate("userId", "name email phoneNumber avatar isAccountApproved isActive createdAt")
    .populate("hospitalId", "name slug address contactEmail contactPhone")
    .populate("verifiedBy", "name email role");

  if (!doctor) {
    throw new ApiError(404, "Doctor profile not found");
  }

  return res.status(200).json(
    new ApiResponse(200, doctor, "Doctor verification details retrieved successfully")
  );
});

/**
 *  Get list of hospital admins with filtering, search, and pagination
 */
export const getHospitalAdminsForVerification = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 10));
  const skip = (page - 1) * limit;

  const status = req.query.status as VerificationStatus | undefined;
  const search = req.query.search as string | undefined;

  const query: any = {};

  if (status && Object.values(VerificationStatus).includes(status)) {
    query.verificationStatus = status;
  }

  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), "i");
    const matchingUsers = await User.find({
      role: UserRole.HOSPITAL_ADMIN,
      $or: [{ name: searchRegex }, { email: searchRegex }, { phoneNumber: searchRegex }],
    }).select("_id");

    const userIds = matchingUsers.map((u) => u._id);

    query.$or = [
      { userId: { $in: userIds } },
      { hospitalName: searchRegex },
      { hospitalRegistrationNumber: searchRegex },
      { designation: searchRegex },
    ];
  }

  const [hospitalAdmins, totalDocs] = await Promise.all([
    HospitalAdminProfile.find(query)
      .populate("userId", "name email phoneNumber avatar isAccountApproved isActive createdAt")
      .populate("hospitalId", "name slug address")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    HospitalAdminProfile.countDocuments(query),
  ]);

  const pagination = buildPaginationMeta(totalDocs, page, limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      { hospitalAdmins, pagination },
      "Hospital Admins retrieved successfully"
    )
  );
});

/**
 *  Get single hospital admin verification detail
 */
export const getHospitalAdminVerificationDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      throw new ApiError(400, "Invalid hospital admin ID format");
    }

    const hospitalAdmin = await HospitalAdminProfile.findOne({
      $or: [{ _id: id }, { userId: id }],
    })
      .populate("userId", "name email phoneNumber avatar isAccountApproved isActive createdAt")
      .populate("hospitalId", "name slug address contactEmail contactPhone")
      .populate("verifiedBy", "name email role");

    if (!hospitalAdmin) {
      throw new ApiError(404, "Hospital admin profile not found");
    }

    // Check if an associated Hospital record exists
    const affiliatedHospital = await Hospital.findOne({
      $or: [
        { hospitalAdminId: hospitalAdmin.userId },
        ...(hospitalAdmin.hospitalId ? [{ _id: hospitalAdmin.hospitalId }] : []),
      ],
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        { hospitalAdmin, hospital: affiliatedHospital },
        "Hospital admin verification details retrieved successfully"
      )
    );
  }
);

/**
 * Legacy Verification Stats (Retained for backward compatibility)
 */
export const getVerificationStats = asyncHandler(async (_req: Request, res: Response) => {
  const [
    pendingDoctors,
    approvedDoctors,
    rejectedDoctors,
    totalDoctors,
    pendingAdmins,
    approvedAdmins,
    rejectedAdmins,
    totalAdmins,
  ] = await Promise.all([
    DoctorProfile.countDocuments({ verificationStatus: VerificationStatus.PENDING }),
    DoctorProfile.countDocuments({ verificationStatus: VerificationStatus.APPROVED }),
    DoctorProfile.countDocuments({ verificationStatus: VerificationStatus.REJECTED }),
    DoctorProfile.countDocuments(),
    HospitalAdminProfile.countDocuments({ verificationStatus: VerificationStatus.PENDING }),
    HospitalAdminProfile.countDocuments({ verificationStatus: VerificationStatus.APPROVED }),
    HospitalAdminProfile.countDocuments({ verificationStatus: VerificationStatus.REJECTED }),
    HospitalAdminProfile.countDocuments(),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        doctors: {
          pending: pendingDoctors,
          approved: approvedDoctors,
          rejected: rejectedDoctors,
          total: totalDoctors,
        },
        hospitalAdmins: {
          pending: pendingAdmins,
          approved: approvedAdmins,
          rejected: rejectedAdmins,
          total: totalAdmins,
        },
        summary: {
          totalPending: pendingDoctors + pendingAdmins,
          totalApproved: approvedDoctors + approvedAdmins,
          totalRejected: rejectedDoctors + rejectedAdmins,
          grandTotal: totalDoctors + totalAdmins,
        },
      },
      "Verification statistics retrieved successfully"
    )
  );
});


export const getAdminDashboardAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const currentYear = parseInt(req.query.year as string) || new Date().getFullYear();
  const startOfYear = new Date(currentYear, 0, 1);
  const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  // Month names for time-series charts
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Utility helpers
  const formatCurrency = (amount: number): string => {
    if (amount >= 10000000) {
      return `₹ ${(amount / 10000000).toFixed(1)}Cr`;
    }
    if (amount >= 100000) {
      return `₹ ${(amount / 100000).toFixed(1)}L`;
    }
    if (amount >= 1000) {
      return `₹ ${(amount / 1000).toFixed(1)}K`;
    }
    return `₹ ${amount.toLocaleString()}`;
  };

  const calculateTrend = (current: number, previous: number): string => {
    if (previous === 0) {
      return current > 0 ? "+100%" : "0%";
    }
    const pct = Math.round(((current - previous) / previous) * 100);
    return `${pct >= 0 ? "+" : ""}${pct}%`;
  };

  const formatTimeAgo = (date?: Date): string => {
    if (!date) return "Recently";
    const diffMs = Date.now() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 60) return `${Math.max(1, diffMins)}m ago`;
    const diffHours = Math.floor(diffMins / (1000 * 60 * 60));
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffMins / (1000 * 60 * 60 * 24));
    return `${diffDays}d ago`;
  };

  // ── Parallel Execution of All Platform Metrics ─────────────────────────────
  const [
    // 1. User & Patient Metrics
    totalUsers,
    totalPatients,
    activePatients,
    newPatientsThisMonth,
    newPatientsPrevMonth,
    totalHospitalAdmins,
    totalSuperAdmins,

    // 2. Doctor Metrics & Verification Breakdown
    totalDoctors,
    approvedDoctors,
    pendingDoctors,
    rejectedDoctors,
    suspendedDoctors,
    newDoctorsThisMonth,
    newDoctorsPrevMonth,
    affiliatedDoctors,
    pendingAffiliationDoctors,
    unaffiliatedDoctors,

    // 3. Hospital Metrics
    totalHospitals,
    activeHospitals,
    newHospitalsThisMonth,
    newHospitalsPrevMonth,
    pendingHospitalAdmins,

    // 4. Appointment Operations
    totalAppointments,
    completedAppointments,
    upcomingConfirmedAppointments,
    cancelledByPatientAppointments,
    cancelledByDoctorAppointments,
    rescheduleRequiredAppointments,
    newAppointmentsThisMonth,
    newAppointmentsPrevMonth,

    // 5. Payment & Revenue Metrics
    totalPaymentRevenueAgg,
    paymentRevenueThisMonthAgg,
    paymentRevenuePrevMonthAgg,
    monthlyRevenueAgg,
    appointmentFeeFallbackAgg,

    // 6. Time-Series Aggregations
    userGrowthAgg,
    hospitalGrowthAgg,
    appointmentActivityAgg,

    // 7. Department Distribution (Top Specialties)
    departmentAgg,

    // 8. Hospital Appointment Counts Aggregation for ranking
    hospitalAppointmentCountsAgg,

    // 9. Top Hospitals
    hospitalsList,

    // 10. Recent Appointments (Populated)
    recentAppointmentsDocs,

    // 11. Urgent Action Queues
    recentPendingDoctors,
    recentPendingHospitalAdmins,

    // 12. Live Platform Activity Sources
    latestUsers,
    latestAppointments,
    latestDoctorLeaves,
    latestHospitals,
  ] = await Promise.all([
    // 1. Users
    User.countDocuments(),
    User.countDocuments({ role: UserRole.PATIENT }),
    User.countDocuments({ role: UserRole.PATIENT, isActive: true }),
    User.countDocuments({ role: UserRole.PATIENT, createdAt: { $gte: startOfMonth } }),
    User.countDocuments({ role: UserRole.PATIENT, createdAt: { $gte: startOfPrevMonth, $lte: endOfPrevMonth } }),
    User.countDocuments({ role: UserRole.HOSPITAL_ADMIN }),
    User.countDocuments({ role: UserRole.SUPER_ADMIN }),

    // 2. Doctors
    DoctorProfile.countDocuments(),
    DoctorProfile.countDocuments({ verificationStatus: VerificationStatus.APPROVED }),
    DoctorProfile.countDocuments({ verificationStatus: VerificationStatus.PENDING }),
    DoctorProfile.countDocuments({ verificationStatus: VerificationStatus.REJECTED }),
    DoctorProfile.countDocuments({ verificationStatus: VerificationStatus.SUSPENDED }),
    DoctorProfile.countDocuments({ createdAt: { $gte: startOfMonth } }),
    DoctorProfile.countDocuments({ createdAt: { $gte: startOfPrevMonth, $lte: endOfPrevMonth } }),
    DoctorProfile.countDocuments({ hospitalAffiliationStatus: "APPROVED" }),
    DoctorProfile.countDocuments({ hospitalAffiliationStatus: "PENDING_APPROVAL" }),
    DoctorProfile.countDocuments({ hospitalAffiliationStatus: "NOT_AFFILIATED" }),

    // 3. Hospitals
    Hospital.countDocuments(),
    Hospital.countDocuments({ isActive: true }),
    Hospital.countDocuments({ createdAt: { $gte: startOfMonth } }),
    Hospital.countDocuments({ createdAt: { $gte: startOfPrevMonth, $lte: endOfPrevMonth } }),
    HospitalAdminProfile.countDocuments({ verificationStatus: VerificationStatus.PENDING }),

    // 4. Appointments
    Appointment.countDocuments(),
    Appointment.countDocuments({ status: AppointmentStatus.COMPLETED }),
    Appointment.countDocuments({ status: AppointmentStatus.CONFIRMED }),
    Appointment.countDocuments({ status: AppointmentStatus.CANCELLED_BY_PATIENT }),
    Appointment.countDocuments({ status: AppointmentStatus.CANCELLED_BY_DOCTOR }),
    Appointment.countDocuments({ status: AppointmentStatus.RESCHEDULE_REQUIRED }),
    Appointment.countDocuments({ createdAt: { $gte: startOfMonth } }),
    Appointment.countDocuments({ createdAt: { $gte: startOfPrevMonth, $lte: endOfPrevMonth } }),

    // 5. Payment & Revenue
    Payment.aggregate([
      { $match: { status: PaymentStatus.COMPLETED } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Payment.aggregate([
      { $match: { status: PaymentStatus.COMPLETED, createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Payment.aggregate([
      { $match: { status: PaymentStatus.COMPLETED, createdAt: { $gte: startOfPrevMonth, $lte: endOfPrevMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Payment.aggregate([
      {
        $match: {
          status: PaymentStatus.COMPLETED,
          createdAt: { $gte: startOfYear, $lte: endOfYear },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          revenue: { $sum: "$amount" },
        },
      },
    ]),
    Appointment.aggregate([
      { $match: { status: AppointmentStatus.COMPLETED, consultationFee: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: "$consultationFee" } } },
    ]),

    // 6. Time-Series Aggregations
    User.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfYear, $lte: endOfYear },
          role: { $in: [UserRole.PATIENT, UserRole.DOCTOR, UserRole.HOSPITAL_ADMIN] },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            role: "$role",
          },
          count: { $sum: 1 },
        },
      },
    ]),

    Hospital.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfYear, $lte: endOfYear },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
    ]),

    Appointment.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfYear, $lte: endOfYear },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            status: "$status",
          },
          count: { $sum: 1 },
        },
      },
    ]),

    // 7. Department Distribution (Top 8 specialties)
    DoctorProfile.aggregate([
      { $match: { verificationStatus: VerificationStatus.APPROVED } },
      {
        $group: {
          _id: "$department",
          doctorCount: { $sum: 1 },
          averageExperience: { $avg: "$experienceYears" },
          averageRating: { $avg: "$ratingAverage" },
        },
      },
      { $sort: { doctorCount: -1 } },
      { $limit: 8 },
    ]),

    // 8. Hospital Appointments Count Aggregation
    Appointment.aggregate([
      { $match: { hospitalId: { $ne: null } } },
      { $group: { _id: "$hospitalId", appointmentsCount: { $sum: 1 } } },
      { $sort: { appointmentsCount: -1 } },
    ]),

    // 9. Hospitals List
    Hospital.find()
      .select("name address images totalBeds rating")
      .limit(10),

    // 10. Recent Appointments (Latest 5)
    Appointment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({ path: "patientId", select: "name avatar email phoneNumber" })
      .populate({
        path: "doctorId",
        populate: { path: "userId", select: "name avatar" },
        select: "department specialization userId",
      })
      .populate("hospitalId", "name address"),

    // 11. Urgent Action Queues
    DoctorProfile.find({ verificationStatus: VerificationStatus.PENDING })
      .populate("userId", "name email phoneNumber avatar createdAt")
      .select("department specialization medicalCouncilRegistrationNumber experienceYears createdAt")
      .sort({ createdAt: -1 })
      .limit(5),

    HospitalAdminProfile.find({ verificationStatus: VerificationStatus.PENDING })
      .populate("userId", "name email phoneNumber avatar createdAt")
      .select("hospitalName hospitalRegistrationNumber designation createdAt")
      .sort({ createdAt: -1 })
      .limit(5),

    // 12. Live Platform Activity Sources
    User.find()
      .sort({ createdAt: -1 })
      .limit(4)
      .select("name role createdAt"),

    Appointment.find()
      .sort({ createdAt: -1 })
      .limit(4)
      .populate("patientId", "name")
      .select("patientDetails createdAt status patientId"),

    DoctorLeave.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .populate({ path: "doctorId", populate: { path: "userId", select: "name" } })
      .select("status createdAt doctorId"),

    Hospital.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select("name createdAt"),
  ]);

  // ── Calculate Platform Revenue ──────────────────────────────────────────────
  let totalRevenue = totalPaymentRevenueAgg[0]?.total || 0;
  let revenueThisMonth = paymentRevenueThisMonthAgg[0]?.total || 0;
  let revenuePrevMonth = paymentRevenuePrevMonthAgg[0]?.total || 0;

  // Fallback to completed appointments consultation fee if payment records not yet seeded
  if (totalRevenue === 0 && appointmentFeeFallbackAgg[0]?.total) {
    totalRevenue = appointmentFeeFallbackAgg[0].total;
  }

  // ── Format Monthly User Growth Trend (Jan - Dec) ───────────────────────────
  const monthlyUserGrowth = monthNames.map((name, index) => {
    const monthNum = index + 1;
    const patients =
      userGrowthAgg.find(
        (u) => u._id.month === monthNum && u._id.role === UserRole.PATIENT
      )?.count || 0;
    const doctors =
      userGrowthAgg.find(
        (u) => u._id.month === monthNum && u._id.role === UserRole.DOCTOR
      )?.count || 0;
    const hospitalAdmins =
      userGrowthAgg.find(
        (u) => u._id.month === monthNum && u._id.role === UserRole.HOSPITAL_ADMIN
      )?.count || 0;
    const hospitals =
      hospitalGrowthAgg.find((h) => h._id.month === monthNum)?.count || 0;

    return {
      month: name,
      monthNumber: monthNum,
      patients,
      doctors,
      hospitalAdmins,
      hospitals,
      totalNewUsers: patients + doctors + hospitalAdmins,
    };
  });

  // ── Format Monthly Appointment Activity Trend (Jan - Dec) ──────────────────
  const monthlyAppointmentTrends = monthNames.map((name, index) => {
    const monthNum = index + 1;
    const monthAppointments = appointmentActivityAgg.filter(
      (a) => a._id.month === monthNum
    );

    const booked = monthAppointments.reduce((sum, item) => sum + item.count, 0);
    const completed =
      monthAppointments.find(
        (a) => a._id.status === AppointmentStatus.COMPLETED
      )?.count || 0;
    const cancelled =
      monthAppointments
        .filter((a) =>
          [
            AppointmentStatus.CANCELLED_BY_PATIENT,
            AppointmentStatus.CANCELLED_BY_DOCTOR,
          ].includes(a._id.status)
        )
        .reduce((sum, item) => sum + item.count, 0);
    const rescheduled =
      monthAppointments.find(
        (a) => a._id.status === AppointmentStatus.RESCHEDULE_REQUIRED
      )?.count || 0;

    return {
      month: name,
      monthNumber: monthNum,
      booked,
      completed,
      cancelled,
      rescheduled,
      noShow: monthAppointments.find((a) => a._id.status === AppointmentStatus.NO_SHOW)?.count || 0,
    };
  });

  // ── Format Monthly Revenue Trend (Jan - Dec) ───────────────────────────────
  const monthlyRevenueTrend = monthNames.map((name, index) => {
    const monthNum = index + 1;
    const monthRev = monthlyRevenueAgg.find((r) => r._id.month === monthNum)?.revenue || 0;
    return {
      month: name,
      revenue: monthRev,
      revenueFormatted: formatCurrency(monthRev),
    };
  });

  // ── Format Monthly Hospital Onboarding Trend (Jan - Dec) ───────────────────
  const monthlyHospitalTrend = monthNames.map((name, index) => {
    const monthNum = index + 1;
    const count = hospitalGrowthAgg.find((h) => h._id.month === monthNum)?.count || 0;
    return {
      month: name,
      count,
    };
  });

  // ── Format Role Distribution with Percentages ──────────────────────────────
  const safeTotalUsers = totalUsers || (totalPatients + totalDoctors + totalHospitalAdmins + totalSuperAdmins);
  const patientsPct = safeTotalUsers > 0 ? Math.round((totalPatients / safeTotalUsers) * 1000) / 10 : 0;
  const doctorsPct = safeTotalUsers > 0 ? Math.round((totalDoctors / safeTotalUsers) * 1000) / 10 : 0;
  const adminsPct = safeTotalUsers > 0 ? Math.round((totalHospitalAdmins / safeTotalUsers) * 1000) / 10 : 0;
  const superAdminsPct = safeTotalUsers > 0 ? Math.max(0, Math.round((100 - patientsPct - doctorsPct - adminsPct) * 10) / 10) : 0;

  const roleDistribution = [
    { role: "Patients", count: totalPatients, percentage: patientsPct, color: "#3B82F6", bg: "bg-blue-500" },
    { role: "Doctors", count: totalDoctors, percentage: doctorsPct, color: "#10B981", bg: "bg-emerald-500" },
    { role: "Hospital Admins", count: totalHospitalAdmins, percentage: adminsPct, color: "#EC4899", bg: "bg-pink-500" },
    { role: "Super Admins", count: totalSuperAdmins, percentage: superAdminsPct, color: "#F59E0B", bg: "bg-amber-500" },
  ];

  // ── Format Top Performing Hospitals ────────────────────────────────────────
  const hospitalCountsMap = new Map<string, number>();
  hospitalAppointmentCountsAgg.forEach((item: any) => {
    if (item._id) {
      hospitalCountsMap.set(item._id.toString(), item.appointmentsCount);
    }
  });

  const topHospitals = hospitalsList
    .map((hosp: any) => {
      const id = hosp._id.toString();
      const appointmentsCount = hospitalCountsMap.get(id) || 0;
      const city = [hosp.address?.city, hosp.address?.state].filter(Boolean).join(", ") || "India";
      return {
        id,
        name: hosp.name,
        city,
        image: hosp.images?.coverImage || "",
        rating: hosp.rating || 4.5,
        appointmentsCount,
      };
    })
    .sort((a, b) => b.appointmentsCount - a.appointmentsCount || b.rating - a.rating)
    .slice(0, 5);

  // ── Format Recent Appointments ─────────────────────────────────────────────
  const mapStatusToDisplay = (status: AppointmentStatus): "Completed" | "Scheduled" | "Cancelled" | "Rescheduled" => {
    switch (status) {
      case AppointmentStatus.COMPLETED:
        return "Completed";
      case AppointmentStatus.CONFIRMED:
      case AppointmentStatus.PENDING_PAYMENT:
    case AppointmentStatus.CHECKED_IN:
    case AppointmentStatus.IN_PROGRESS:
        return "Scheduled";
      case AppointmentStatus.CANCELLED_BY_PATIENT:
      case AppointmentStatus.CANCELLED_BY_DOCTOR:
        return "Cancelled";
      case AppointmentStatus.RESCHEDULE_REQUIRED:
        return "Rescheduled";
      default:
        return "Scheduled";
    }
  };

  const recentAppointments = recentAppointmentsDocs.map((apt: any) => {
    const patient = apt.patientId;
    const doctor = apt.doctorId;
    const doctorUser = doctor?.userId;
    const aptDate = apt.date || (apt.createdAt ? new Date(apt.createdAt).toISOString().split("T")[0] : "");
    const timeStr = apt.startTime ? `${aptDate}, ${apt.startTime}` : "Scheduled";

    return {
      id: apt._id.toString(),
      patientName: patient?.name || apt.patientDetails?.fullName || "Patient",
      patientAvatar: patient?.avatar || "",
      department: doctor?.department || "General Consultation",
      status: mapStatusToDisplay(apt.status),
      time: timeStr,
      doctorName: doctorUser?.name ? `Dr. ${doctorUser.name}` : "Doctor",
      doctorAvatar: doctorUser?.avatar || "",
    };
  });

  // ── Format Pending Verifications Queue ─────────────────────────────────────
  const doctorVerificationsFormatted = recentPendingDoctors.map((doc: any) => ({
    id: doc._id.toString(),
    name: (doc.userId as any)?.name ? `Dr. ${(doc.userId as any).name}` : "Doctor Specialist",
    avatar: (doc.userId as any)?.avatar || "",
    type: "Doctor Verification" as const,
    category: "doctor" as const,
    timeAgo: formatTimeAgo(doc.createdAt),
    status: "Pending" as const,
    departmentOrCity: `${doc.department || "General"} • ${doc.medicalCouncilRegistrationNumber || "Reg. Pending"}`,
    registrationNumber: doc.medicalCouncilRegistrationNumber || "",
  }));

  const hospitalVerificationsFormatted = recentPendingHospitalAdmins.map((admin: any) => ({
    id: admin._id.toString(),
    name: admin.hospitalName || (admin.userId as any)?.name || "Hospital Facility",
    avatar: (admin.userId as any)?.avatar || "",
    type: "Hospital Verification" as const,
    category: "hospital" as const,
    timeAgo: formatTimeAgo(admin.createdAt),
    status: "Pending" as const,
    departmentOrCity: `${admin.hospitalAddress || admin.hospitalName || "Hospital"} • Reg: ${admin.hospitalRegistrationNumber || "Pending"}`,
    registrationNumber: admin.hospitalRegistrationNumber || "",
  }));

  const pendingVerifications = [
    ...doctorVerificationsFormatted,
    ...hospitalVerificationsFormatted,
  ].slice(0, 5);

  // ── Format Live Recent Activity Stream ─────────────────────────────────────
  const activityList: Array<{ id: string; title: string; type: "doctor" | "hospital" | "leave" | "appointment" | "verification"; timestamp: string; date: Date }> = [];

  latestUsers.forEach((u: any) => {
    activityList.push({
      id: `act-user-${u._id}`,
      title: `New ${u.role === UserRole.DOCTOR ? "doctor" : u.role === UserRole.HOSPITAL_ADMIN ? "hospital admin" : "patient"} registered: ${u.name}`,
      type: u.role === UserRole.DOCTOR ? "doctor" : u.role === UserRole.HOSPITAL_ADMIN ? "hospital" : "doctor",
      timestamp: formatTimeAgo(u.createdAt),
      date: u.createdAt || new Date(),
    });
  });

  latestAppointments.forEach((a: any) => {
    const patientName = (a.patientId as any)?.name || a.patientDetails?.fullName || "Patient";
    activityList.push({
      id: `act-apt-${a._id}`,
      title: `New appointment booked by ${patientName}`,
      type: "appointment",
      timestamp: formatTimeAgo(a.createdAt),
      date: a.createdAt || new Date(),
    });
  });

  latestDoctorLeaves.forEach((l: any) => {
    const docName = (l.doctorId as any)?.userId?.name ? `Dr. ${(l.doctorId as any).userId.name}` : "Doctor";
    activityList.push({
      id: `act-leave-${l._id}`,
      title: `${docName} submitted leave request (${l.status.toLowerCase()})`,
      type: "leave",
      timestamp: formatTimeAgo(l.createdAt),
      date: l.createdAt || new Date(),
    });
  });

  latestHospitals.forEach((h: any) => {
    activityList.push({
      id: `act-hosp-${h._id}`,
      title: `Hospital facility onboarded: ${h.name}`,
      type: "hospital",
      timestamp: formatTimeAgo(h.createdAt),
      date: h.createdAt || new Date(),
    });
  });

  const recentActivities = activityList
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .map(({ id, title, type, timestamp }) => ({ id, title, type, timestamp }));

  // ── Format Department Distribution ─────────────────────────────────────────
  const departmentDistribution = departmentAgg.map((dept) => ({
    department: dept._id || "General Medicine",
    doctorCount: dept.doctorCount,
    averageExperienceYears: Math.round((dept.averageExperience || 0) * 10) / 10,
    averageRating: Math.round((dept.averageRating || 0) * 10) / 10,
  }));

  // ── Calculate Health Percentages ───────────────────────────────────────────
  const totalResolvedAppointments =
    completedAppointments +
    cancelledByPatientAppointments +
    cancelledByDoctorAppointments;

  const completionRate =
    totalResolvedAppointments > 0
      ? Math.round((completedAppointments / totalResolvedAppointments) * 100)
      : 100;

  const cancellationRate =
    totalResolvedAppointments > 0
      ? Math.round(
          ((cancelledByPatientAppointments + cancelledByDoctorAppointments) /
            totalResolvedAppointments) *
            100
        )
      : 0;

  // ── Executive Super Admin KPIs ─────────────────────────────────────────────
  const totalPendingVerifications = pendingDoctors + pendingHospitalAdmins;
  const kpis = {
    totalHospitals,
    totalHospitalsTrend: calculateTrend(newHospitalsThisMonth, newHospitalsPrevMonth),
    hospitalsMonthDelta: `+${newHospitalsThisMonth} this month`,

    totalDoctors,
    totalDoctorsTrend: calculateTrend(newDoctorsThisMonth, newDoctorsPrevMonth),
    doctorsMonthDelta: `+${newDoctorsThisMonth} this month`,

    totalPatients,
    totalPatientsTrend: calculateTrend(newPatientsThisMonth, newPatientsPrevMonth),
    patientsMonthDelta: `+${newPatientsThisMonth} this month`,

    totalAppointments,
    totalAppointmentsTrend: calculateTrend(newAppointmentsThisMonth, newAppointmentsPrevMonth),
    appointmentsMonthDelta: `+${newAppointmentsThisMonth} this month`,

    totalRevenue,
    totalRevenueFormatted: formatCurrency(totalRevenue),
    totalRevenueTrend: calculateTrend(revenueThisMonth, revenuePrevMonth),
    revenueMonthDelta: `+${formatCurrency(revenueThisMonth)} this month`,

    pendingVerifications: totalPendingVerifications,
    pendingVerificationsTrend: totalPendingVerifications > 0 ? `${totalPendingVerifications} pending` : "0 pending",
    pendingBreakdown: `${pendingDoctors} doctors • ${pendingHospitalAdmins} hospitals`,
  };

  // ── Assemble Final Production Response ─────────────────────────────────────
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        year: currentYear,

        // Direct Frontend Store Keys (100% Real Live MongoDB Data)
        kpis,
        appointmentsOverview: monthlyAppointmentTrends,
        userGrowth: monthlyUserGrowth,
        roleDistribution,
        revenueTrend: monthlyRevenueTrend,
        hospitalTrend: monthlyHospitalTrend,
        topHospitals,
        recentAppointments,
        pendingVerifications,
        recentActivities,

        // Backward compatibility structures
        summary: {
          totalPlatformUsers: totalUsers,
          patients: {
            total: totalPatients,
            active: activePatients,
            newThisMonth: newPatientsThisMonth,
          },
          doctors: {
            total: totalDoctors,
            approved: approvedDoctors,
            pending: pendingDoctors,
            rejected: rejectedDoctors,
            suspended: suspendedDoctors,
          },
          hospitals: {
            total: totalHospitals,
            verified: activeHospitals,
            pending: pendingHospitalAdmins,
          },
          appointments: {
            totalBooked: totalAppointments,
            completed: completedAppointments,
            upcomingConfirmed: upcomingConfirmedAppointments,
            totalCancelled:
              cancelledByPatientAppointments + cancelledByDoctorAppointments,
            cancelledByPatient: cancelledByPatientAppointments,
            cancelledByDoctor: cancelledByDoctorAppointments,
            rescheduleRequired: rescheduleRequiredAppointments,
          },
          operationalHealth: {
            completionRate: `${completionRate}%`,
            cancellationRate: `${cancellationRate}%`,
            pendingVerificationsQueue: totalPendingVerifications,
          },
        },
        charts: {
          monthlyUserGrowth,
          monthlyAppointmentTrends,
        },
        distribution: {
          departments: departmentDistribution,
          doctorAffiliations: {
            approvedAffiliated: affiliatedDoctors,
            pendingHospitalApproval: pendingAffiliationDoctors,
            unaffiliated: unaffiliatedDoctors,
          },
          doctorVerifications: {
            approved: approvedDoctors,
            pending: pendingDoctors,
            rejected: rejectedDoctors,
            suspended: suspendedDoctors,
          },
          appointmentStatusBreakdown: {
            completed: completedAppointments,
            upcoming: upcomingConfirmedAppointments,
            cancelled:
              cancelledByPatientAppointments + cancelledByDoctorAppointments,
            rescheduleRequired: rescheduleRequiredAppointments,
          },
        },
        topHospitalsByCapacity: topHospitals,
        actionQueues: {
          pendingDoctors: recentPendingDoctors,
          pendingHospitalAdmins: recentPendingHospitalAdmins,
        },
      },
      "Admin dashboard analytics retrieved successfully"
    )
  );
});

/**
 * Get all doctors directory for Super Admin with advanced filters, search, and metrics
 */
export const getAllDoctorsForAdmin = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 12));
  const skip = (page - 1) * limit;

  const search = req.query.search as string | undefined;
  const status = req.query.status as string | undefined;
  const accountStatus = req.query.accountStatus as string | undefined;
  const hospitalId = req.query.hospitalId as string | undefined;
  const department = req.query.department as string | undefined;
  const specialization = req.query.specialization as string | undefined;
  const sortBy = req.query.sortBy as string | undefined;

  const query: any = {};

  // 1. Verification status filter
  if (status && status !== "ALL" && Object.values(VerificationStatus).includes(status as VerificationStatus)) {
    query.verificationStatus = status;
  }

  // 2. Hospital filter
  if (hospitalId && hospitalId !== "ALL" && isValidObjectId(hospitalId)) {
    query.hospitalId = hospitalId;
  }

  // 3. Department filter
  if (department && department !== "ALL") {
    query.department = new RegExp(`^${department}$`, "i");
  }

  // 4. Specialization filter
  if (specialization && specialization !== "ALL") {
    query.specialization = specialization;
  }

  // 5. User matching filter (search name/email/phone & accountStatus active/inactive)
  const userQuery: any = { role: UserRole.DOCTOR };
  let hasUserFilter = false;

  if (accountStatus === "active") {
    userQuery.isActive = true;
    hasUserFilter = true;
  } else if (accountStatus === "inactive") {
    userQuery.isActive = false;
    hasUserFilter = true;
  }

  if (search && search.trim()) {
    hasUserFilter = true;
    const searchRegex = new RegExp(search.trim(), "i");
    userQuery.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { phoneNumber: searchRegex },
    ];
  }

  if (hasUserFilter) {
    const matchingUsers = await User.find(userQuery).select("_id");
    const userIds = matchingUsers.map((u) => u._id);

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { userId: { $in: userIds } },
        { department: searchRegex },
        { medicalCouncilRegistrationNumber: searchRegex },
        { specialization: searchRegex },
      ];
    } else {
      query.userId = { $in: userIds };
    }
  }

  // Sorting
  let sortOptions: any = { createdAt: -1 };
  if (sortBy === "oldest") {
    sortOptions = { createdAt: 1 };
  } else if (sortBy === "experience_desc") {
    sortOptions = { experienceYears: -1, createdAt: -1 };
  } else if (sortBy === "rating_desc") {
    sortOptions = { ratingAverage: -1, reviewCount: -1 };
  } else if (sortBy === "fee_desc") {
    sortOptions = { consultationFee: -1 };
  } else if (sortBy === "fee_asc") {
    sortOptions = { consultationFee: 1 };
  }

  // Fetch doctors and global counts for directory stats
  const [doctors, totalDocs, totalAll, totalActive, totalDisabled, totalPending] = await Promise.all([
    DoctorProfile.find(query)
      .populate("userId", "name email phoneNumber avatar isAccountApproved isActive role createdAt")
      .populate("hospitalId", "name slug address contactEmail contactPhone ratingAverage")
      .populate("verifiedBy", "name email role")
      .sort(sortOptions)
      .skip(skip)
      .limit(limit),
    DoctorProfile.countDocuments(query),
    DoctorProfile.countDocuments(),
    DoctorProfile.countDocuments({ verificationStatus: VerificationStatus.APPROVED }),
    User.countDocuments({ role: UserRole.DOCTOR, isActive: false }),
    DoctorProfile.countDocuments({ verificationStatus: VerificationStatus.PENDING }),
  ]);

  const pagination = buildPaginationMeta(totalDocs, page, limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        doctors,
        pagination,
        stats: {
          total: totalAll,
          active: totalActive,
          disabled: totalDisabled,
          pending: totalPending,
        },
      },
      "Doctors retrieved successfully"
    )
  );
});

/**
 * Toggle Doctor Active/Disabled Status (Freeze/Unfreeze account with optional reason)
 */
export const toggleDoctorAccountStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isActive, reason } = req.body;
  const adminId = req.user?.userId;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid doctor ID format");
  }

  const doctorProfile = await DoctorProfile.findOne({
    $or: [{ _id: id }, { userId: id }],
  });

  if (!doctorProfile) {
    throw new ApiError(404, "Doctor profile not found");
  }

  const doctorUser = await User.findById(doctorProfile.userId);
  if (!doctorUser) {
    throw new ApiError(404, "Associated user account for doctor not found");
  }

  const nextActiveState = typeof isActive === "boolean" ? isActive : !doctorUser.isActive;

  doctorUser.isActive = nextActiveState;
  if (!nextActiveState) {
    // If disabling, record suspension/disable reason
    doctorProfile.rejectionReason = reason?.trim() || "Account disabled by Super Admin";
    doctorProfile.verificationStatus = VerificationStatus.SUSPENDED;
    doctorUser.isAccountApproved = false;
  } else {
    // Re-enabling
    doctorUser.isAccountApproved = true;
    doctorProfile.verificationStatus = VerificationStatus.APPROVED;
    doctorProfile.rejectionReason = "";
  }

  doctorProfile.verifiedBy = new mongoose.Types.ObjectId(adminId);
  doctorProfile.verifiedAt = new Date();

  await Promise.all([doctorUser.save(), doctorProfile.save()]);

  const populatedProfile = await DoctorProfile.findById(doctorProfile._id)
    .populate("userId", "name email phoneNumber avatar isAccountApproved isActive role")
    .populate("hospitalId", "name slug address contactEmail contactPhone");

  return res.status(200).json(
    new ApiResponse(
      200,
      populatedProfile,
      `Doctor account has been ${nextActiveState ? "activated" : "disabled"} successfully`
    )
  );
});


export const getAllHospitalAdminsForAdmin = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.max(1, Math.min(10, parseInt(req.query.limit as string) || 10)); 
  const skip = (page - 1) * limit;

  const status = req.query.status as string | undefined;
  const hospitalType = req.query.hospitalType as string | undefined;
  const state = req.query.state as string | undefined;
  const search = req.query.search as string | undefined;
  const accountStatus = req.query.accountStatus as string | undefined;
  const sortBy = req.query.sortBy as string | undefined;

  const query: any = {};

  // 1. Verification status filter
  if (status && status !== "ALL") {
    const normalizedStatus =
      status.toUpperCase() === "VERIFIED" ? VerificationStatus.APPROVED : status;
    if (Object.values(VerificationStatus).includes(normalizedStatus as VerificationStatus)) {
      query.verificationStatus = normalizedStatus;
    }
  }

  // 2. Hospital Type filter
  if (hospitalType && hospitalType !== "ALL") {
    query.hospitalType = new RegExp(`^${hospitalType.trim()}$`, "i");
  }

  // 3. State / Location filter
  if (state && state !== "ALL" && state.trim()) {
    const stateRegex = new RegExp(state.trim(), "i");
    const stateHospitals = await Hospital.find({
      $or: [{ "address.state": stateRegex }, { "address.city": stateRegex }],
    }).select("_id hospitalAdminId");

    const stateHospitalIds = stateHospitals.map((h) => h._id);
    const stateAdminUserIds = stateHospitals.map((h) => h.hospitalAdminId);

    query.$and = query.$and || [];
    query.$and.push({
      $or: [
        { hospitalAddress: stateRegex },
        { hospitalId: { $in: stateHospitalIds } },
        { userId: { $in: stateAdminUserIds } },
      ],
    });
  }

  // 4. Account active/inactive status filter
  if (accountStatus && accountStatus !== "ALL") {
    const isActiveBool = accountStatus === "active";
    const statusUsers = await User.find({
      role: UserRole.HOSPITAL_ADMIN,
      isActive: isActiveBool,
    }).select("_id");
    const userIds = statusUsers.map((u) => u._id);

    query.$and = query.$and || [];
    query.$and.push({ userId: { $in: userIds } });
  }

  // 5. Global text search (Name, Email, Phone, Hospital Name, Registration, Designation)
  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), "i");

    const [matchingUsers, matchingHospitals] = await Promise.all([
      User.find({
        role: UserRole.HOSPITAL_ADMIN,
        $or: [{ name: searchRegex }, { email: searchRegex }, { phoneNumber: searchRegex }],
      }).select("_id"),
      Hospital.find({
        $or: [
          { name: searchRegex },
          { licenseNumber: searchRegex },
          { "address.city": searchRegex },
          { "address.state": searchRegex },
        ],
      }).select("_id hospitalAdminId"),
    ]);

    const userIds = matchingUsers.map((u) => u._id);
    const matchedHospitalIds = matchingHospitals.map((h) => h._id);
    const matchedAdminUserIdsFromHospital = matchingHospitals.map((h) => h.hospitalAdminId);

    query.$and = query.$and || [];
    query.$and.push({
      $or: [
        { userId: { $in: [...userIds, ...matchedAdminUserIdsFromHospital] } },
        { hospitalId: { $in: matchedHospitalIds } },
        { hospitalName: searchRegex },
        { hospitalRegistrationNumber: searchRegex },
        { designation: searchRegex },
        { hospitalAddress: searchRegex },
      ],
    });
  }

  // Sorting
  let sortOptions: any = { createdAt: -1 };
  if (sortBy === "oldest") {
    sortOptions = { createdAt: 1 };
  } else if (sortBy === "verified_desc") {
    sortOptions = { verifiedAt: -1, createdAt: -1 };
  } else if (sortBy === "name_asc") {
    sortOptions = { hospitalName: 1 };
  } else if (sortBy === "name_desc") {
    sortOptions = { hospitalName: -1 };
  }

  // Time boundaries for growth metrics (last 30 days vs 30-60 days ago)
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // Parallel fetch: data + counts + month-over-month analytics
  const [
    rawHospitalAdmins,
    totalDocs,
    totalVerified,
    totalPending,
    totalRejected,
    totalAll,
    totalHospitalsManaged,
    verifiedLast30,
    verifiedPrev30,
    hospitalsLast30,
    hospitalsPrev30,
  ] = await Promise.all([
    HospitalAdminProfile.find(query)
      .populate("userId", "name email phoneNumber avatar isAccountApproved isActive role createdAt")
      .populate("hospitalId", "name slug address contactEmail contactPhone images hospitalType totalBeds licenseNumber")
      .populate("verifiedBy", "name email role")
      .sort(sortOptions)
      .skip(skip)
      .limit(limit),
    HospitalAdminProfile.countDocuments(query),
    HospitalAdminProfile.countDocuments({ verificationStatus: VerificationStatus.APPROVED }),
    HospitalAdminProfile.countDocuments({ verificationStatus: VerificationStatus.PENDING }),
    HospitalAdminProfile.countDocuments({ verificationStatus: VerificationStatus.REJECTED }),
    HospitalAdminProfile.countDocuments(),
    Hospital.countDocuments({ verificationStatus: VerificationStatus.APPROVED }),
    HospitalAdminProfile.countDocuments({
      verificationStatus: VerificationStatus.APPROVED,
      verifiedAt: { $gte: thirtyDaysAgo },
    }),
    HospitalAdminProfile.countDocuments({
      verificationStatus: VerificationStatus.APPROVED,
      verifiedAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
    }),
    Hospital.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    }),
    Hospital.countDocuments({
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
    }),
  ]);

  // Fallback affiliation: link Hospital if profile.hospitalId is unlinked
  const unlinkedAdminUserIds = rawHospitalAdmins
    .filter((admin) => !admin.hospitalId && admin.userId?._id)
    .map((admin) => (admin.userId as any)._id);

  let unlinkedHospitalsMap: Record<string, any> = {};
  if (unlinkedAdminUserIds.length > 0) {
    const foundHospitals = await Hospital.find({
      hospitalAdminId: { $in: unlinkedAdminUserIds },
    }).select("name slug address contactEmail contactPhone images hospitalType totalBeds licenseNumber verificationStatus hospitalAdminId");

    foundHospitals.forEach((h) => {
      unlinkedHospitalsMap[h.hospitalAdminId.toString()] = h;
    });
  }

  const hospitalAdmins = rawHospitalAdmins.map((admin) => {
    const adminObj = admin.toObject();
    if (!adminObj.hospitalId && adminObj.userId?._id) {
      const fallbackHospital = unlinkedHospitalsMap[adminObj.userId._id.toString()];
      if (fallbackHospital) {
        adminObj.hospitalId = fallbackHospital;
      }
    }
    return adminObj;
  });

  const calcGrowth = (current: number, prev: number) => {
    if (prev === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - prev) / prev) * 100);
  };

  const pagination = buildPaginationMeta(totalDocs, page, limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        hospitalAdmins,
        pagination,
        stats: {
          totalVerified,
          verifiedGrowth: calcGrowth(verifiedLast30, verifiedPrev30),
          hospitalsManaged: totalHospitalsManaged,
          hospitalsGrowth: calcGrowth(hospitalsLast30, hospitalsPrev30),
          pendingVerifications: totalPending,
          rejectedRequests: totalRejected,
          totalAll,
        },
      },
      "Hospital admins retrieved successfully"
    )
  );
});

/**
 * Get single Hospital Admin full details for drawer panel
 */
export const getHospitalAdminDetailsForAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid hospital admin ID format");
  }

  const hospitalAdmin = await HospitalAdminProfile.findOne({
    $or: [{ _id: id }, { userId: id }],
  })
    .populate("userId", "name email phoneNumber avatar isAccountApproved isActive role createdAt")
    .populate("hospitalId", "name slug address contactEmail contactPhone images hospitalType totalBeds licenseNumber openingTime closingTime isEmergency24x7 departments")
    .populate("verifiedBy", "name email role");

  if (!hospitalAdmin) {
    throw new ApiError(404, "Hospital admin profile not found");
  }

  // Find affiliated hospital record if not directly populated
  let affiliatedHospital = hospitalAdmin.hospitalId;
  if (!affiliatedHospital) {
    affiliatedHospital = (await Hospital.findOne({
      hospitalAdminId: hospitalAdmin.userId,
    })) as any;
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        hospitalAdmin,
        hospital: affiliatedHospital,
      },
      "Hospital admin details retrieved successfully"
    )
  );
});

/**
 * Toggle Hospital Admin Active/Disabled account status
 */
export const toggleHospitalAdminAccountStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isActive, reason } = req.body;
  const adminId = req.user?.userId;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid hospital admin ID format");
  }

  const hospitalAdmin = await HospitalAdminProfile.findOne({
    $or: [{ _id: id }, { userId: id }],
  });

  if (!hospitalAdmin) {
    throw new ApiError(404, "Hospital admin profile not found");
  }

  const adminUser = await User.findById(hospitalAdmin.userId);
  if (!adminUser) {
    throw new ApiError(404, "Associated user account for hospital admin not found");
  }

  const nextActiveState = typeof isActive === "boolean" ? isActive : !adminUser.isActive;

  adminUser.isActive = nextActiveState;
  if (!nextActiveState) {
    hospitalAdmin.rejectionReason = reason?.trim() || "Account disabled by Super Admin";
    hospitalAdmin.isActive = false;
    adminUser.isAccountApproved = false;
  } else {
    adminUser.isAccountApproved = true;
    hospitalAdmin.isActive = true;
    hospitalAdmin.rejectionReason = "";
  }

  if (adminId && isValidObjectId(adminId)) {
    hospitalAdmin.verifiedBy = new mongoose.Types.ObjectId(adminId);
  }

  await Promise.all([adminUser.save(), hospitalAdmin.save()]);

  const populatedProfile = await HospitalAdminProfile.findById(hospitalAdmin._id)
    .populate("userId", "name email phoneNumber avatar isAccountApproved isActive role")
    .populate("hospitalId", "name slug address contactEmail contactPhone");

  return res.status(200).json(
    new ApiResponse(
      200,
      populatedProfile,
      `Hospital admin account has been ${nextActiveState ? "activated" : "disabled"} successfully`
    )
  );
});

/**
 * Export filtered list of Hospital Admins
 */
export const exportHospitalAdminsList = asyncHandler(async (req: Request, res: Response) => {
  const status = req.query.status as string | undefined;
  const hospitalType = req.query.hospitalType as string | undefined;

  const query: any = {};
  if (status && status !== "ALL") {
    const normalizedStatus =
      status.toUpperCase() === "VERIFIED" ? VerificationStatus.APPROVED : status;
    if (Object.values(VerificationStatus).includes(normalizedStatus as VerificationStatus)) {
      query.verificationStatus = normalizedStatus;
    }
  }

  if (hospitalType && hospitalType !== "ALL") {
    query.hospitalType = new RegExp(`^${hospitalType.trim()}$`, "i");
  }

  const admins = await HospitalAdminProfile.find(query)
    .populate("userId", "name email phoneNumber createdAt isActive")
    .populate("hospitalId", "name slug address licenseNumber")
    .sort({ createdAt: -1 })
    .limit(500);

  const exportData = admins.map((admin) => {
    const user: any = admin.userId || {};
    const hospital: any = admin.hospitalId || {};
    return {
      adminId: admin._id,
      name: user.name || "N/A",
      email: user.email || "N/A",
      phone: user.phoneNumber || "N/A",
      designation: admin.designation || "Hospital Administrator",
      hospitalName: hospital.name || admin.hospitalName || "N/A",
      hospitalType: admin.hospitalType || "Private Hospital",
      registrationNumber: hospital.licenseNumber || admin.hospitalRegistrationNumber || "N/A",
      verificationStatus: admin.verificationStatus,
      accountStatus: user.isActive ? "Active" : "Disabled",
      verifiedAt: admin.verifiedAt || null,
      joinedAt: user.createdAt || admin.createdAt,
    };
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      { admins: exportData, total: exportData.length },
      "Hospital admins exported successfully"
    )
  );
});
