import { Request, Response } from "express";
import mongoose from "mongoose";
import { Hospital } from "../models/Hospital.model.js";
import { HospitalAdminProfile } from "../models/HospitalAdminProfile.model.js";
import { DoctorProfile } from "../models/DoctorProfile.model.js";
import { Appointment } from "../models/Appointment.model.js";
import { Payment } from "../models/Payment.model.js";
import {
  HospitalJoinRequest,
  JoinRequestStatus,
} from "../models/HospitalJoinRequest.model.js";
import {
  VerificationStatus,
  AppointmentStatus,
  PaymentStatus,
} from "../constants/index.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const generateUniqueSlug = async (name: string): Promise<string> => {
  const baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  let slug = baseSlug || "hospital";
  let counter = 1;

  while (await Hospital.findOne({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};


export const createHospital = asyncHandler(async (req: Request, res: Response) => {
  const adminUserId = req.user?.userId;

  if (!adminUserId) {
    throw new ApiError(401, "Authentication required");
  }

  const existingHospitalForAdmin = await Hospital.findOne({
    hospitalAdminId: adminUserId,
  });

  if (existingHospitalForAdmin) {
    throw new ApiError(
      409,
      "You have already created a hospital. Please manage or update your existing hospital profile."
    );
  }

  const {
    name,
    licenseNumber,
    licenseDocumentUrl,
    images,
    address,
    contactEmail,
    contactPhone,
    departments,
    establishmentYear,
    totalBeds,
    website,
    openingTime,
    closingTime,
    isEmergency24x7,
    description,
  } = req.body;


  if (!name || !name.trim()) {
    throw new ApiError(400, "Hospital name is required")
  }

  if (!licenseNumber || !licenseNumber.trim()) {
    throw new ApiError(400, "Hospital government license number is required");
  }

  if (!licenseDocumentUrl || !licenseDocumentUrl.trim()) {
    throw new ApiError(400, "Hospital license proof document URL is required");
  }

  if (
    !address ||
    !address.street ||
    !address.city ||
    !address.state ||
    !address.zipCode
  ) {
    throw new ApiError(
      400,
      "Complete hospital address (street, city, state, zipCode) is required"
    );
  }

  if (!contactEmail || !contactPhone) {
    throw new ApiError(400, "Contact email and contact phone number are required");
  }

  // Validate unique licenseNumber
  const existingLicense = await Hospital.findOne({
    licenseNumber: licenseNumber.trim(),
  });

  if (existingLicense) {
    throw new ApiError(
      409,
      "A hospital with this government license number is already registered"
    );
  }

  // Generate unique slug
  const slug = await generateUniqueSlug(name);

  
  const hospital = await Hospital.create({
    name: name.trim(),
    slug,
    hospitalAdminId: new mongoose.Types.ObjectId(adminUserId),
    licenseNumber: licenseNumber.trim(),
    licenseDocumentUrl: licenseDocumentUrl.trim(),
    images: {
      coverImage: images?.coverImage || "",
      gallery: Array.isArray(images?.gallery) ? images.gallery : [],
    },
    address: {
      street: address.street.trim(),
      city: address.city.trim(),
      state: address.state.trim(),
      zipCode: address.zipCode.trim(),
      country: address.country?.trim() || "India",
    },
    contactEmail: contactEmail.toLowerCase().trim(),
    contactPhone: contactPhone.trim(),
    departments:
      Array.isArray(departments) && departments.length > 0
        ? departments
        : ["General Medicine"],
    establishmentYear: establishmentYear ? Number(establishmentYear) : undefined,
    totalBeds: totalBeds ? Number(totalBeds) : 10,
    website: website?.trim() || "",
    openingTime: openingTime?.trim() || "09:00",
    closingTime: closingTime?.trim() || "23:59",
    isEmergency24x7: isEmergency24x7 !== undefined ? Boolean(isEmergency24x7) : true,
    description: description?.trim() || "",
    verificationStatus: VerificationStatus.PENDING,
  });

  // Link newly created hospital to HospitalAdminProfile
  await HospitalAdminProfile.findOneAndUpdate(
    { userId: adminUserId },
    { hospitalId: hospital._id }
  );

  return res.status(201).json(
    new ApiResponse(
      201,
      hospital,
      "Hospital profile created successfully. It is pending Super Admin verification."
    )
  );
});


export const getMyHospital = asyncHandler(async (req: Request, res: Response) => {
  const adminUserId = req.user?.userId;

  const hospital = await Hospital.findOne({ hospitalAdminId: adminUserId })
    .populate("hospitalAdminId", "name email phoneNumber avatar")
    .populate("verifiedBy", "name email");

  if (!hospital) {
    return res.status(200).json(
      new ApiResponse(200, null, "No hospital profile created yet for this account.")
    );
  }

  return res.status(200).json(
    new ApiResponse(200, hospital, "Hospital profile retrieved successfully.")
  );
});


export const getHospitalDashboard = asyncHandler(async (req: Request, res: Response) => {
  const adminUserId = req.user?.userId;
  const currentYear = parseInt(req.query.year as string) || new Date().getFullYear();

  const startOfYear = new Date(currentYear, 0, 1);
  const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  // 1. Fetch Affiliated Hospital
  const hospital = await Hospital.findOne({ hospitalAdminId: adminUserId })
    .populate("hospitalAdminId", "name email phoneNumber avatar")
    .populate("verifiedBy", "name email");

  if (!hospital) {
    return res.status(200).json(
      new ApiResponse(
        200,
        { hasHospital: false, hospital: null },
        "No hospital profile found for this administrator account."
      )
    );
  }

  // 2. Parallel Aggregations & Query Execution
  const [
    // Doctors Count
    approvedDoctorsCount,
    pendingJoinRequestsCount,

    // Appointment Metrics
    totalAppointments,
    completedAppointments,
    upcomingAppointments,
    cancelledAppointments,
    rescheduleRequiredAppointments,

    // Patient Metrics
    uniquePatientsList,
    newPatientsThisMonthList,

    // Financial / Revenue Metrics
    revenueTotalAgg,
    revenueMonthAgg,
    refundTotalAgg,

    // Monthly Financial Trends (Jan - Dec)
    monthlyFinancialAgg,

    // Monthly Appointment & Patient Trends (Jan - Dec)
    monthlyAppointmentsAgg,

    // Department Performance Breakdown
    departmentStatsAgg,

    // Top Rated Doctors in this Hospital
    topDoctors,

    // Urgent Queues: Pending Doctor Join Requests
    pendingDoctorRequests,

    // Recent 5 Hospital Appointments
    recentAppointments,
  ] = await Promise.all([
    // Doctors
    DoctorProfile.countDocuments({
      hospitalId: hospital._id,
      hospitalAffiliationStatus: "APPROVED",
    }),
    HospitalJoinRequest.countDocuments({
      hospitalId: hospital._id,
      status: JoinRequestStatus.PENDING,
    }),

    // Appointments
    Appointment.countDocuments({ hospitalId: hospital._id }),
    Appointment.countDocuments({
      hospitalId: hospital._id,
      status: AppointmentStatus.COMPLETED,
    }),
    Appointment.countDocuments({
      hospitalId: hospital._id,
      status: AppointmentStatus.CONFIRMED,
    }),
    Appointment.countDocuments({
      hospitalId: hospital._id,
      status: {
        $in: [
          AppointmentStatus.CANCELLED_BY_PATIENT,
          AppointmentStatus.CANCELLED_BY_DOCTOR,
        ],
      },
    }),
    Appointment.countDocuments({
      hospitalId: hospital._id,
      status: AppointmentStatus.RESCHEDULE_REQUIRED,
    }),

    // Patient Metrics (Distinct patient IDs)
    Appointment.distinct("patientId", { hospitalId: hospital._id }),
    Appointment.distinct("patientId", {
      hospitalId: hospital._id,
      createdAt: { $gte: startOfMonth },
    }),

    // Total Completed Revenue (All Time)
    Payment.aggregate([
      { $match: { hospitalId: hospital._id, status: PaymentStatus.COMPLETED } },
      { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
    ]),

    // Revenue for Current Month
    Payment.aggregate([
      {
        $match: {
          hospitalId: hospital._id,
          status: PaymentStatus.COMPLETED,
          createdAt: { $gte: startOfMonth },
        },
      },
      { $group: { _id: null, monthRevenue: { $sum: "$amount" } } },
    ]),

    // Total Refunded
    Payment.aggregate([
      { $match: { hospitalId: hospital._id, status: PaymentStatus.REFUNDED } },
      { $group: { _id: null, totalRefunded: { $sum: "$amount" } } },
    ]),

    // 12-Month Financial Aggregation (Revenue & Refunds by Month)
    Payment.aggregate([
      {
        $match: {
          hospitalId: hospital._id,
          createdAt: { $gte: startOfYear, $lte: endOfYear },
          status: { $in: [PaymentStatus.COMPLETED, PaymentStatus.REFUNDED] },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            status: "$status",
          },
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]),

    // 12-Month Appointment Activity Aggregation
    Appointment.aggregate([
      {
        $match: {
          hospitalId: hospital._id,
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

    // Department Distribution
    DoctorProfile.aggregate([
      {
        $match: {
          hospitalId: hospital._id,
          hospitalAffiliationStatus: "APPROVED",
        },
      },
      {
        $group: {
          _id: "$department",
          doctorCount: { $sum: 1 },
          averageFee: { $avg: "$consultationFee" },
          averageRating: { $avg: "$ratingAverage" },
        },
      },
      { $sort: { doctorCount: -1 } },
    ]),

    // Top 5 Doctors in Hospital
    DoctorProfile.find({
      hospitalId: hospital._id,
      hospitalAffiliationStatus: "APPROVED",
    })
      .populate("userId", "name email phoneNumber avatar")
      .select("department specialization consultationFee ratingAverage")
      .sort({ ratingAverage: -1 })
      .limit(5),

    // Urgent: Latest 5 Pending Join Requests
    HospitalJoinRequest.find({
      hospitalId: hospital._id,
      status: JoinRequestStatus.PENDING,
    })
      .populate({
        path: "doctorId",
        select:
          "department specialization qualifications experienceYears medicalCouncilRegistrationNumber consultationFee",
        populate: { path: "userId", select: "name email phoneNumber avatar" },
      })
      .sort({ createdAt: -1 })
      .limit(5),

    // Recent 5 Appointments
    Appointment.find({ hospitalId: hospital._id })
      .populate({
        path: "doctorId",
        select: "department",
        populate: { path: "userId", select: "name avatar" },
      })
      .populate("patientId", "name email phoneNumber avatar")
      .select("appointmentNumber date startTime endTime status symptoms consultationFee createdAt")
      .sort({ createdAt: -1 })
      .limit(5),
  ]);

  // 3. Financial Totals Calculations
  const totalRevenue = revenueTotalAgg[0]?.totalRevenue || 0;
  const revenueThisMonth = revenueMonthAgg[0]?.monthRevenue || 0;
  const totalRefunded = refundTotalAgg[0]?.totalRefunded || 0;
  const netRevenue = Math.max(0, totalRevenue - totalRefunded);

  // 4. Format 12-Month Financial Trends (Jan - Dec)
  const monthlyRevenueTrends = monthNames.map((name, index) => {
    const monthNum = index + 1;
    const completedPayments = monthlyFinancialAgg.find(
      (p) => p._id.month === monthNum && p._id.status === PaymentStatus.COMPLETED
    );
    const refundedPayments = monthlyFinancialAgg.find(
      (p) => p._id.month === monthNum && p._id.status === PaymentStatus.REFUNDED
    );

    const grossRevenue = completedPayments?.totalAmount || 0;
    const refunded = refundedPayments?.totalAmount || 0;
    const net = Math.max(0, grossRevenue - refunded);

    return {
      month: name,
      monthNumber: monthNum,
      grossRevenue,
      refunded,
      netRevenue: net,
      transactionsCount: completedPayments?.count || 0,
    };
  });

  // 5. Format 12-Month Patient & Appointment Activity (Jan - Dec)
  const monthlyPatientTrends = monthNames.map((name, index) => {
    const monthNum = index + 1;
    const monthAppts = monthlyAppointmentsAgg.filter((a) => a._id.month === monthNum);

    const booked = monthAppts.reduce((sum, item) => sum + item.count, 0);
    const completed =
      monthAppts.find((a) => a._id.status === AppointmentStatus.COMPLETED)?.count || 0;
    const cancelled = monthAppts
      .filter((a) =>
        [
          AppointmentStatus.CANCELLED_BY_PATIENT,
          AppointmentStatus.CANCELLED_BY_DOCTOR,
        ].includes(a._id.status)
      )
      .reduce((sum, item) => sum + item.count, 0);
    const rescheduled =
      monthAppts.find((a) => a._id.status === AppointmentStatus.RESCHEDULE_REQUIRED)?.count || 0;

    return {
      month: name,
      monthNumber: monthNum,
      bookedAppointments: booked,
      completedConsultations: completed,
      cancelledAppointments: cancelled,
      rescheduledAppointments: rescheduled,
    };
  });

  // 6. Format Department Stats
  const departmentsData = departmentStatsAgg.map((dept) => ({
    name: dept._id || "General Medicine",
    doctorCount: dept.doctorCount,
    averageConsultationFee: Math.round(dept.averageFee || 0),
    averageRating: Math.round((dept.averageRating || 0) * 10) / 10,
  }));

  // 7. Resolution Rate
  const totalResolved = completedAppointments + cancelledAppointments;
  const completionRate =
    totalResolved > 0 ? Math.round((completedAppointments / totalResolved) * 100) : 100;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        hasHospital: true,
        year: currentYear,

        // Hospital Profile Overview
        hospital: {
          id: hospital._id,
          name: hospital.name,
          slug: hospital.slug,
          verificationStatus: hospital.verificationStatus,
          address: hospital.address,
          totalBeds: hospital.totalBeds,
          departments: hospital.departments,
          contactPhone: hospital.contactPhone,
          contactEmail: hospital.contactEmail,
          isEmergency24x7: hospital.isEmergency24x7,
          verified: hospital.verificationStatus === VerificationStatus.APPROVED,
        },

        // 1. Executive Summary Cards (KPIs)
        kpis: {
          doctors: {
            totalAffiliated: approvedDoctorsCount,
            pendingJoinRequests: pendingJoinRequestsCount,
          },
          patients: {
            totalTreatedUnique: uniquePatientsList.length,
            newPatientsThisMonth: newPatientsThisMonthList.length,
          },
          appointments: {
            totalBooked: totalAppointments,
            completed: completedAppointments,
            upcomingConfirmed: upcomingAppointments,
            totalCancelled: cancelledAppointments,
            rescheduleRequired: rescheduleRequiredAppointments,
            completionRate: `${completionRate}%`,
          },
          financials: {
            totalGrossRevenue: totalRevenue,
            netRevenue,
            revenueThisMonth,
            totalRefunded,
            currency: "INR",
          },
        },

        // 2. Time-Series Visual Graphs (12 Months Jan - Dec)
        charts: {
          monthlyRevenue: monthlyRevenueTrends,
          monthlyPatientsAndAppointments: monthlyPatientTrends,
        },

        // 3. Departmental Distribution (For Bar / Pie Charts)
        departments: departmentsData,

        // 4. Top Performing Doctors in Hospital
        topDoctors,

        // 5. Actionable Review Queues & Recent Consultations
        queues: {
          pendingDoctorRequests,
          recentAppointments,
        },
      },
      "Hospital admin dashboard retrieved successfully."
    )
  );
});



export const updateMyHospital = asyncHandler(async (req: Request, res: Response) => {
  const adminUserId = req.user?.userId;

  const hospital = await Hospital.findOne({ hospitalAdminId: adminUserId });

  if (!hospital) {
    throw new ApiError(404, "Hospital profile not found for this administrator account.");
  }

  const {
    name,
    images,
    address,
    contactEmail,
    contactPhone,
    departments,
    establishmentYear,
    totalBeds,
    website,
    openingTime,
    closingTime,
    isEmergency24x7,
    description,
    licenseDocumentUrl,
  } = req.body;

  if (name && name.trim() && name.trim() !== hospital.name) {
    hospital.name = name.trim();
    hospital.slug = await generateUniqueSlug(name);
  }

  if (images) {
    if (images.coverImage !== undefined) hospital.images.coverImage = images.coverImage;
    if (Array.isArray(images.gallery)) hospital.images.gallery = images.gallery;
  }

  if (address) {
    if (address.street) hospital.address.street = address.street.trim();
    if (address.city) hospital.address.city = address.city.trim();
    if (address.state) hospital.address.state = address.state.trim();
    if (address.zipCode) hospital.address.zipCode = address.zipCode.trim();
    if (address.country) hospital.address.country = address.country.trim();
  }

  if (contactEmail) hospital.contactEmail = contactEmail.toLowerCase().trim();
  if (contactPhone) hospital.contactPhone = contactPhone.trim();
  if (Array.isArray(departments) && departments.length > 0) {
    hospital.departments = departments;
  }
  if (establishmentYear !== undefined) {
    hospital.establishmentYear = Number(establishmentYear);
  }
  if (totalBeds !== undefined) {
    hospital.totalBeds = Number(totalBeds);
  }
  if (website !== undefined) hospital.website = website.trim();
  if (openingTime !== undefined) hospital.openingTime = openingTime.trim();
  if (closingTime !== undefined) hospital.closingTime = closingTime.trim();
  if (isEmergency24x7 !== undefined) {
    hospital.isEmergency24x7 = Boolean(isEmergency24x7);
  }
  if (description !== undefined) hospital.description = description.trim();
  if (licenseDocumentUrl !== undefined) {
    hospital.licenseDocumentUrl = licenseDocumentUrl.trim();
  }

  await hospital.save();

  return res.status(200).json(
    new ApiResponse(200, hospital, "Hospital profile updated successfully.")
  );
});

/**
 * Public All users: Get list of verified hospitals
 */
export const getAllHospitals = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.max(1, Math.min(50, parseInt(req.query.limit as string) || 10));
  const skip = (page - 1) * limit;

  const { city, department, search } = req.query;

  const filter: any = {
    isActive: true,
    verificationStatus: VerificationStatus.APPROVED,
  };

  if (city && typeof city === "string") {
    filter["address.city"] = new RegExp(city.trim(), "i");
  }

  if (department && typeof department === "string") {
    filter.departments = { $in: [new RegExp(department.trim(), "i")] };
  }

  if (search && typeof search === "string") {
    const searchRegex = new RegExp(search.trim(), "i");
    filter.$or = [
      { name: searchRegex },
      { "address.city": searchRegex },
      { departments: searchRegex },
    ];
  }

  const [hospitals, totalDocs] = await Promise.all([
    Hospital.find(filter)
      .select("-licenseDocumentUrl -verifiedBy")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Hospital.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalDocs / limit) || 1;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        hospitals,
        pagination: {
          totalDocs,
          totalPages,
          currentPage: page,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      "Hospitals retrieved successfully"
    )
  );
});

/**
 * Public / All users: Get hospital by slug
 */
export const getHospitalBySlug = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;

  const hospital = await Hospital.findOne({
    slug: slug.toLowerCase().trim(),
    isActive: true,
  });

  if (!hospital) {
    throw new ApiError(404, "Hospital not found");
  }

  return res.status(200).json(
    new ApiResponse(200, hospital, "Hospital retrieved successfully")
  );
});

/**
 * Public / All users: Get hospital by ID
 */
export const getHospitalById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid hospital ID format");
  }

  const hospital = await Hospital.findById(id);

  if (!hospital) {
    throw new ApiError(404, "Hospital not found");
  }

  return res.status(200).json(
    new ApiResponse(200, hospital, "Hospital retrieved successfully")
  );
});
