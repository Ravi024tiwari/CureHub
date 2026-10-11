import { Request, Response } from "express";
import mongoose from "mongoose";
import { User } from "../models/User.model.js";
import { DoctorProfile } from "../models/DoctorProfile.model.js";
import { HospitalAdminProfile } from "../models/HospitalAdminProfile.model.js";
import { Hospital } from "../models/Hospital.model.js";
import { VerificationStatus, UserRole } from "../constants/index.js";
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

// this is for the stats of the admin dashboard 
//we will update that route in the future
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
