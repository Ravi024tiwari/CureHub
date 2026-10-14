import { Request, Response } from "express";
import mongoose from "mongoose";
import { User } from "../models/User.model.js";
import { DoctorProfile } from "../models/DoctorProfile.model.js";
import { HospitalAdminProfile } from "../models/HospitalAdminProfile.model.js";
import { Hospital } from "../models/Hospital.model.js";
import { Appointment } from "../models/Appointment.model.js";
import { VerificationStatus, UserRole, AppointmentStatus } from "../constants/index.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


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

  // If there is an associated hospital, sync its status as well
  const affiliatedHospital = await Hospital.findOne({
    $or: [
      { hospitalAdminId: hospitalAdminProfile.userId },
      ...(hospitalAdminProfile.hospitalId ? [{ _id: hospitalAdminProfile.hospitalId }] : []),
    ],
  });

  if (affiliatedHospital) {
    affiliatedHospital.verificationStatus = status;
    affiliatedHospital.verifiedBy = new mongoose.Types.ObjectId(adminId);
    affiliatedHospital.verifiedAt = new Date();
    if (status === VerificationStatus.REJECTED) {
      affiliatedHospital.rejectionReason = rejectionReason?.trim() || "";
    } else if (status === VerificationStatus.SUSPENDED) {
      affiliatedHospital.isActive = false;
    }
    await affiliatedHospital.save();
  }

  const populatedProfile = await HospitalAdminProfile.findById(hospitalAdminProfile._id)
    .populate("userId", "name email phoneNumber avatar isAccountApproved isActive role")
    .populate("hospitalId", "name slug address verificationStatus");

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
  const limit = Math.max(1, Math.min(15, parseInt(req.query.limit as string) || 10));
  const skip = (page - 1) * limit;

  const status = req.query.status as VerificationStatus | undefined;
  const search = req.query.search as string | undefined;
  const hospitalId = req.query.hospitalId as string | undefined;

  const query: any = {};

  if (status && Object.values(VerificationStatus).includes(status)) {
    query.verificationStatus = status;
  }

  if (hospitalId && isValidObjectId(hospitalId)) {
    query.hospitalId = hospitalId;
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

  const [doctors, totalDocs] = await Promise.all([
    DoctorProfile.find(query)
      .populate("userId", "name email phoneNumber avatar isAccountApproved isActive createdAt")
      .populate("hospitalId", "name slug address")
      .sort({ createdAt: -1 })
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
      .populate("hospitalId", "name slug address contactEmail contactPhone verificationStatus")
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

  // Month names for time-series charts
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // ── Parallel Execution of All Platform Metrics ─────────────────────────────
  const [
    // 1. User & Patient Metrics
    totalUsers,
    totalPatients,
    activePatients,
    newPatientsThisMonth,

    // 2. Doctor Metrics & Verification Breakdown
    totalDoctors,
    approvedDoctors,
    pendingDoctors,
    rejectedDoctors,
    suspendedDoctors,
    affiliatedDoctors,
    pendingAffiliationDoctors,
    unaffiliatedDoctors,

    // 3. Hospital Metrics
    totalHospitals,
    verifiedHospitals,
    pendingHospitals,
    pendingHospitalAdmins,

    // 4. Appointment Operations
    totalAppointments,
    completedAppointments,
    upcomingConfirmedAppointments,
    cancelledByPatientAppointments,
    cancelledByDoctorAppointments,
    rescheduleRequiredAppointments,

    // 5. Monthly User Registrations Aggregation
    userGrowthAgg,

    // 6. Monthly Hospital Onboarding Aggregation
    hospitalGrowthAgg,

    // 7. Monthly Appointment Activity Aggregation
    appointmentActivityAgg,

    // 8. Department Distribution (Top Specialties)
    departmentAgg,

    // 9. Top Verified Hospitals by Bed Capacity
    topHospitals,

    // 10. Urgent Action Queues (Latest 5 pending doctors & admins)
    recentPendingDoctors,
    recentPendingHospitalAdmins,
  ] = await Promise.all([
    // 1. Users
    User.countDocuments(),
    User.countDocuments({ role: UserRole.PATIENT }),
    User.countDocuments({ role: UserRole.PATIENT, isActive: true }),
    User.countDocuments({ role: UserRole.PATIENT, createdAt: { $gte: startOfMonth } }),

    // 2. Doctors
    DoctorProfile.countDocuments(),
    DoctorProfile.countDocuments({ verificationStatus: VerificationStatus.APPROVED }),
    DoctorProfile.countDocuments({ verificationStatus: VerificationStatus.PENDING }),
    DoctorProfile.countDocuments({ verificationStatus: VerificationStatus.REJECTED }),
    DoctorProfile.countDocuments({ verificationStatus: VerificationStatus.SUSPENDED }),
    DoctorProfile.countDocuments({ hospitalAffiliationStatus: "APPROVED" }),
    DoctorProfile.countDocuments({ hospitalAffiliationStatus: "PENDING_APPROVAL" }),
    DoctorProfile.countDocuments({ hospitalAffiliationStatus: "NOT_AFFILIATED" }),

    // 3. Hospitals
    Hospital.countDocuments(),
    Hospital.countDocuments({ verified: true }),
    Hospital.countDocuments({ verified: false }),
    HospitalAdminProfile.countDocuments({ verificationStatus: VerificationStatus.PENDING }),

    // 4. Appointments
    Appointment.countDocuments(),
    Appointment.countDocuments({ status: AppointmentStatus.COMPLETED }),
    Appointment.countDocuments({ status: AppointmentStatus.CONFIRMED }),
    Appointment.countDocuments({ status: AppointmentStatus.CANCELLED_BY_PATIENT }),
    Appointment.countDocuments({ status: AppointmentStatus.CANCELLED_BY_DOCTOR }),
    Appointment.countDocuments({ status: AppointmentStatus.RESCHEDULE_REQUIRED }),

    // 5. Monthly User Growth Aggregation
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

    // 6. Monthly Hospital Growth Aggregation
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

    // 7. Monthly Appointment Activity Aggregation
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

    // 8. Department Distribution (Top 8 specialties)
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

    // 9. Top 5 Hospitals by Capacity
    Hospital.find({ verified: true })
      .select("name address.city address.state totalBeds icuBeds emergencyServices contactPhone")
      .sort({ totalBeds: -1 })
      .limit(5),

    // 10. Urgent Action Queues
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
  ]);

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
    };
  });

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

  // ── Assemble Final Production Response ─────────────────────────────────────
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        year: currentYear,

        // 1. Executive KPI Summary Cards
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
            verified: verifiedHospitals,
            pending: pendingHospitals,
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
            pendingVerificationsQueue: pendingDoctors + pendingHospitalAdmins,
          },
        },

        // 2. Time-Series Graphs (12-Month Arrays for Line / Bar Charts)
        charts: {
          monthlyUserGrowth,
          monthlyAppointmentTrends,
        },

        // 3. Segmented Distribution Breakdowns (For Doughnut / Pie Charts)
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

        // 4. Hospital Capacity Highlights
        topHospitalsByCapacity: topHospitals,

        // 5. Actionable Review Queues (Immediate Attention Needed)
        actionQueues: {
          pendingDoctors: recentPendingDoctors,
          pendingHospitalAdmins: recentPendingHospitalAdmins,
        },
      },
      "Admin dashboard analytics retrieved successfully"
    )
  );
});

