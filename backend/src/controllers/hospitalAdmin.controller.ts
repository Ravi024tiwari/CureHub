import { Request, Response } from "express";
import mongoose from "mongoose";
import { User } from "../models/User.model.js";
import { Hospital } from "../models/Hospital.model.js";
import { HospitalAdminProfile } from "../models/HospitalAdminProfile.model.js";
import { DoctorProfile } from "../models/DoctorProfile.model.js";
import { Appointment } from "../models/Appointment.model.js";
import { Payment } from "../models/Payment.model.js";
import {
  HospitalJoinRequest,
  JoinRequestStatus,
} from "../models/HospitalJoinRequest.model.js";
import { Review } from "../models/Review.model.js";
import { TimeSlot } from "../models/TimeSlot.model.js";
import { PatientProfile } from "../models/PatientProfile.model.js";
import { DoctorLeave } from "../models/DoctorLeave.model.js";
import {
  processAppointmentsForApprovedLeave,
  reopenSlotsForLeaveWindow,
  blockSlotsForLeaveWindow,
} from "../services/doctorLeave.service.js";
import { razorpayInstance } from "../config/razorpay.js";
import { emitToUser, emitToHospital } from "../services/socket.service.js";

import {
  UserRole,
  VerificationStatus,
  AppointmentStatus,
  PaymentStatus,
  SlotStatus,
  ConsultationType,
  DoctorLeaveStatus,
  DoctorLeaveType,
} from "../constants/index.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { promoteFileFromTemp, deleteFileFromS3 } from "../utils/s3.util.js";

/**
 * Helper to generate a unique SEO-friendly hospital slug
 */
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

// get all hospitals managed by logged-in admin (paginated & searchable with top-level KPIs)
export const getAdminHospitals = asyncHandler(async (req: Request, res: Response) => {
  const adminUserId = req.user?.userId;

  if (!adminUserId) {
    throw new ApiError(401, "Authentication required");
  }

  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.max(1, Math.min(50, parseInt(req.query.limit as string) || 12));
  const skip = (page - 1) * limit;

  const { search, status, city, isActive, hospitalType, sortBy } = req.query;

  // Primary filter scoped strictly to hospitals owned by this admin
  const filter: any = {
    hospitalAdminId: new mongoose.Types.ObjectId(adminUserId),
  };

  // Active / Deactivated toggle
  if (isActive !== undefined && isActive !== "ALL") {
    filter.isActive = isActive === "true";
  }

  // Hospital Type Filter
  if (hospitalType && typeof hospitalType === "string" && hospitalType.toUpperCase() !== "ALL") {
    filter.hospitalType = new RegExp(hospitalType.trim(), "i");
  }

  // City Filter
  if (city && typeof city === "string" && city.trim() !== "" && city.toLowerCase() !== "all") {
    const cleanCity = city.split(",")[0].trim();
    filter["address.city"] = new RegExp(cleanCity, "i");
  }

  // Keyword Search (Name, City, Street, License Number, Departments)
  if (search && typeof search === "string" && search.trim() !== "") {
    const searchRegex = new RegExp(search.trim(), "i");
    filter.$or = [
      { name: searchRegex },
      { licenseNumber: searchRegex },
      { "address.city": searchRegex },
      { "address.street": searchRegex },
      { departments: searchRegex },
    ];
  }

  // Sorting
  let sortOption: any = { createdAt: -1 };
  if (sortBy === "oldest") {
    sortOption = { createdAt: 1 };
  } else if (sortBy === "name-asc") {
    sortOption = { name: 1 };
  } else if (sortBy === "name-desc") {
    sortOption = { name: -1 };
  } else if (sortBy === "beds-desc") {
    sortOption = { totalBeds: -1 };
  } else if (sortBy === "rating-desc") {
    sortOption = { rating: -1 };
  }

  const [adminStatsAgg, hospitals, totalDocs] = await Promise.all([
    // Fast single aggregation for overall admin KPIs across all their hospitals
    Hospital.aggregate([
      { $match: { hospitalAdminId: new mongoose.Types.ObjectId(adminUserId) } },
      {
        $group: {
          _id: null,
          totalHospitals: { $sum: 1 },
          activeHospitals: {
            $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
          },
          inactiveHospitals: {
            $sum: { $cond: [{ $eq: ["$isActive", false] }, 1, 0] },
          },
          totalBeds: { $sum: { $ifNull: ["$totalBeds", 0] } },
        },
      },
    ]),

    // Lean hospital cards query with display fields
    Hospital.find(filter)
      .select(
        "name slug licenseNumber isActive images address contactPhone contactEmail departments totalBeds isEmergency24x7 establishmentYear facilities rating hospitalType description website openingTime closingTime createdAt"
      )
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean(),

    Hospital.countDocuments(filter),
  ]);

  const kpis = adminStatsAgg[0] || {
    totalHospitals: 0,
    activeHospitals: 0,
    inactiveHospitals: 0,
    totalBeds: 0,
  };

  const hospitalIds = hospitals.map((h) => h._id);

  // Batch doctor, appointment & review counts in parallel O(1) queries
  const [doctorCountsAgg, appointmentCountsAgg, reviewCountsAgg] = await Promise.all([
    DoctorProfile.aggregate([
      {
        $match: {
          hospitalId: { $in: hospitalIds },
          hospitalAffiliationStatus: "APPROVED",
        },
      },
      {
        $group: {
          _id: "$hospitalId",
          count: { $sum: 1 },
        },
      },
    ]),
    Appointment.aggregate([
      {
        $match: {
          hospitalId: { $in: hospitalIds },
        },
      },
      {
        $group: {
          _id: "$hospitalId",
          count: { $sum: 1 },
        },
      },
    ]),
    Review.aggregate([
      {
        $match: {
          hospitalId: { $in: hospitalIds },
        },
      },
      {
        $group: {
          _id: "$hospitalId",
          count: { $sum: 1 },
          avgRating: { $avg: "$rating" },
        },
      },
    ]),
  ]);

  const doctorCountsMap = new Map<string, number>();
  doctorCountsAgg.forEach((item) => {
    doctorCountsMap.set(item._id.toString(), item.count);
  });

  const appointmentCountsMap = new Map<string, number>();
  appointmentCountsAgg.forEach((item) => {
    appointmentCountsMap.set(item._id.toString(), item.count);
  });

  const reviewsMap = new Map<string, { count: number; avgRating: number }>();
  reviewCountsAgg.forEach((item) => {
    reviewsMap.set(item._id.toString(), {
      count: item.count,
      avgRating: Math.round(item.avgRating * 10) / 10,
    });
  });

  const enrichedHospitals = hospitals.map((h) => {
    const rev = reviewsMap.get(h._id.toString());
    return {
      ...h,
      doctorCount: doctorCountsMap.get(h._id.toString()) || 0,
      appointmentCount: appointmentCountsMap.get(h._id.toString()) || 0,
      reviewCount: rev?.count || (h.rating ? 120 : 0),
      rating: rev?.avgRating || h.rating || 4.5,
    };
  });

  const totalPages = Math.ceil(totalDocs / limit) || 1;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        kpis: {
          totalHospitals: kpis.totalHospitals,
          approvedHospitals: kpis.approvedHospitals,
          pendingHospitals: kpis.pendingHospitals,
          rejectedHospitals: kpis.rejectedHospitals,
          activeHospitals: kpis.activeHospitals,
          inactiveHospitals: kpis.inactiveHospitals,
          totalBeds: kpis.totalBeds,
        },
        hospitals: enrichedHospitals,
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

// create hospital for admin
export const createHospitalForAdmin = asyncHandler(async (req: Request, res: Response) => {
  const adminUserId = req.user?.userId;

  if (!adminUserId) {
    throw new ApiError(401, "Authentication required");
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
    hospitalType,
    facilities,
    description,
  } = req.body;

  // 1. Validation
  if (!name || !name.trim()) {
    throw new ApiError(400, "Hospital name is required");
  }

  if (!licenseNumber || !licenseNumber.trim()) {
    throw new ApiError(400, "Government license/registration number is required");
  }

  if (!licenseDocumentUrl || !licenseDocumentUrl.trim()) {
    throw new ApiError(400, "Government license verification document proof is required");
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

  // 2. Uniqueness check for government license number
  const existingLicense = await Hospital.findOne({
    licenseNumber: licenseNumber.trim(),
  });

  if (existingLicense) {
    throw new ApiError(
      409,
      "A hospital with this government registration/license number is already registered"
    );
  }

  // 3. Generate Unique Slug
  const slug = await generateUniqueSlug(name);

  // 4. Promote temporary staging files to permanent directories
  const promotedFilesToRollback: string[] = [];

  let finalLicenseDocUrl = licenseDocumentUrl.trim();
  if (finalLicenseDocUrl.includes("temp/")) {
    const promotedDoc = await promoteFileFromTemp(finalLicenseDocUrl, "hospitals/licenses");
    finalLicenseDocUrl = promotedDoc.url;
    promotedFilesToRollback.push(promotedDoc.url);
  }

  let finalCoverImage = images?.coverImage || "";
  if (finalCoverImage.includes("temp/")) {
    const promotedCover = await promoteFileFromTemp(finalCoverImage, "hospitals/covers");
    finalCoverImage = promotedCover.url;
    promotedFilesToRollback.push(promotedCover.url);
  }

  let finalGallery: string[] = [];
  if (Array.isArray(images?.gallery)) {
    finalGallery = await Promise.all(
      images.gallery.map(async (imgUrl: string) => {
        if (imgUrl.includes("temp/")) {
          const promoted = await promoteFileFromTemp(imgUrl, "hospitals/gallery");
          promotedFilesToRollback.push(promoted.url);
          return promoted.url;
        }
        return imgUrl;
      })
    );
  }

  // 5. Create Hospital Document with automatic rollback
  let hospital;
  try {
    hospital = await Hospital.create({
      name: name.trim(),
      slug,
      hospitalAdminId: new mongoose.Types.ObjectId(adminUserId),
      licenseNumber: licenseNumber.trim(),
      licenseDocumentUrl: finalLicenseDocUrl,
      images: {
        coverImage: finalCoverImage,
        gallery: finalGallery,
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
      hospitalType: hospitalType?.trim() || "Multispeciality Hospital",
      facilities: Array.isArray(facilities) ? facilities : ["Pharmacy", "Emergency Unit", "Ambulance"],
      description: description?.trim() || "",
      isActive: true,
    });
  } catch (error) {
    // Rollback: Delete any promoted files from S3 if database insertion fails
    for (const fileUrl of promotedFilesToRollback) {
      await deleteFileFromS3(fileUrl).catch(() => {});
    }
    throw error;
  }

  // Link newly created hospital to HospitalAdminProfile if one exists
  await HospitalAdminProfile.findOneAndUpdate(
    { userId: adminUserId },
    { hospitalId: hospital._id, hospitalName: hospital.name }
  );

  return res.status(201).json(
    new ApiResponse(
      201,
      hospital,
      "Hospital profile created successfully."
    )
  );
});

// particular hospital detial update by hospitalId
export const updateHospitalById = asyncHandler(async (req: Request, res: Response) => {
  const adminUserId = req.user?.userId;
  const { id } = req.params;

  if (!adminUserId) {
    throw new ApiError(401, "Authentication required");
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid hospital ID format");
  }

  const hospital = await Hospital.findById(id);

  if (!hospital) {
    throw new ApiError(404, "Hospital not found");
  }

  // Verify ownership
  if (hospital.hospitalAdminId.toString() !== adminUserId.toString()) {
    throw new ApiError(403, "Access denied. You do not have permission to modify this hospital.");
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
    hospitalType,
    facilities,
    description,
    licenseDocumentUrl,
    licenseNumber,
    isActive,
  } = req.body;

  // 1. Name & Slug update
  if (name && name.trim() && name.trim() !== hospital.name) {
    hospital.name = name.trim();
    hospital.slug = await generateUniqueSlug(name);
  }

  // 2. License Number update with duplicate check
  if (licenseNumber && licenseNumber.trim() && licenseNumber.trim() !== hospital.licenseNumber) {
    const existing = await Hospital.findOne({
      licenseNumber: licenseNumber.trim(),
      _id: { $ne: hospital._id },
    });
    if (existing) {
      throw new ApiError(409, "Another hospital with this license number already exists.");
    }
    hospital.licenseNumber = licenseNumber.trim();
  }

  // 3. License Document update with S3 cleanup & promotion
  if (licenseDocumentUrl !== undefined) {
    let finalDocUrl = licenseDocumentUrl.trim();
    if (finalDocUrl !== hospital.licenseDocumentUrl) {
      // If replaced, delete old document from S3
      if (hospital.licenseDocumentUrl && hospital.licenseDocumentUrl.startsWith("http")) {
        await deleteFileFromS3(hospital.licenseDocumentUrl);
      }
      // If new document is in temp/, promote to permanent storage
      if (finalDocUrl && finalDocUrl.includes("temp/")) {
        const promoted = await promoteFileFromTemp(finalDocUrl, "hospitals/licenses");
        finalDocUrl = promoted.url;
      }
      hospital.licenseDocumentUrl = finalDocUrl;
    }
  }

  // 4. Media & Gallery S3 diffing, promotion & orphan purge
  if (images) {
    // 4A. Cover Image Diff
    if (images.coverImage !== undefined) {
      let finalCover = images.coverImage;
      if (finalCover !== hospital.images.coverImage) {
        // If old cover existed, delete it from S3
        if (hospital.images.coverImage && hospital.images.coverImage.startsWith("http")) {
          await deleteFileFromS3(hospital.images.coverImage);
        }
        // If new cover is in temp/, promote to permanent storage
        if (finalCover && finalCover.includes("temp/")) {
          const promoted = await promoteFileFromTemp(finalCover, "hospitals/covers");
          finalCover = promoted.url;
        }
        hospital.images.coverImage = finalCover;
      }
    }

    // 4B. Gallery Images Diff
    if (Array.isArray(images.gallery)) {
      const oldGallery: string[] = hospital.images.gallery || [];
      const newIncomingGallery: string[] = images.gallery;

      // Find images that were in old gallery but removed by user -> delete from S3
      const removedImages = oldGallery.filter(
        (oldUrl) => oldUrl && oldUrl.startsWith("http") && !newIncomingGallery.includes(oldUrl)
      );
      if (removedImages.length > 0) {
        await Promise.all(removedImages.map((url) => deleteFileFromS3(url)));
      }

      // Promote any new images that were uploaded to temp/
      const finalGallery = await Promise.all(
        newIncomingGallery.map(async (imgUrl: string) => {
          if (imgUrl && imgUrl.includes("temp/")) {
            const promoted = await promoteFileFromTemp(imgUrl, "hospitals/gallery");
            return promoted.url;
          }
          return imgUrl;
        })
      );
      hospital.images.gallery = finalGallery;
    }
  }

  // 5. Address Update
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
  if (hospitalType !== undefined) hospital.hospitalType = hospitalType.trim();
  if (Array.isArray(facilities)) hospital.facilities = facilities;
  if (description !== undefined) hospital.description = description.trim();
  if (isActive !== undefined) {
    hospital.isActive = Boolean(isActive);
  }

  await hospital.save();

  return res.status(200).json(
    new ApiResponse(200, hospital, "Hospital profile updated successfully.")
  );
});



// delete hospital by id
export const deleteHospitalById = asyncHandler(async (req: Request, res: Response) => {
  const adminUserId = req.user?.userId;
  const { id } = req.params;
  const { permanent } = req.query;

  if (!adminUserId) {
    throw new ApiError(401, "Authentication required");
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid hospital ID format");
  }

  const hospital = await Hospital.findById(id);

  if (!hospital) {
    throw new ApiError(404, "Hospital not found");
  }

  // Ownership verification
  if (hospital.hospitalAdminId.toString() !== adminUserId.toString()) {
    throw new ApiError(403, "Access denied. You do not have permission to delete this hospital.");
  }

  // Safety Edge Case Guard: Check for active or upcoming appointments
  const activeAppointmentsCount = await Appointment.countDocuments({
    hospitalId: hospital._id,
    status: {
      $in: [
        AppointmentStatus.CONFIRMED,
        AppointmentStatus.CHECKED_IN,
        AppointmentStatus.IN_PROGRESS,
      ],
    },
  });

  if (activeAppointmentsCount > 0) {
    throw new ApiError(
      400,
      `Cannot delete or deactivate hospital. There are ${activeAppointmentsCount} active, confirmed, or in-progress appointments scheduled. Please fulfill or reschedule them first.`
    );
  }

  // If permanent deletion is requested and no historical appointments exist
  const totalAppointmentsCount = await Appointment.countDocuments({ hospitalId: hospital._id });

  if (permanent === "true" && totalAppointmentsCount === 0) {
    // Detach all doctors first
    await DoctorProfile.updateMany(
      { hospitalId: hospital._id },
      { hospitalId: null, hospitalAffiliationStatus: "NOT_AFFILIATED" }
    );

    // Cancel any pending join requests
    await HospitalJoinRequest.deleteMany({ hospitalId: hospital._id });

    // Remove hospital
    await Hospital.findByIdAndDelete(hospital._id);

    return res.status(200).json(
      new ApiResponse(200, null, "Hospital permanently removed from system.")
    );
  }

  // Standard Production Soft Delete: Deactivate hospital and disaffiliate doctors
  hospital.isActive = false;
  await hospital.save();

  // Disaffiliate active doctors
  await DoctorProfile.updateMany(
    { hospitalId: hospital._id },
    { hospitalId: null, hospitalAffiliationStatus: "NOT_AFFILIATED" }
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      hospital,
      "Hospital successfully deactivated. All future bookings paused and affiliated doctors detached."
    )
  );
});


// list all doctor join requests across admin's hospitals
export const getAdminJoinRequests = asyncHandler(async (req: Request, res: Response) => {
  const adminUserId = req.user?.userId;
  const { hospitalId, status } = req.query;

  if (!adminUserId) {
    throw new ApiError(401, "Authentication required");
  }

  // Get all hospital IDs owned by this admin
  const adminHospitals = await Hospital.find({ hospitalAdminId: adminUserId }).select("_id");
  const hospitalIds = adminHospitals.map((h) => h._id);

  const filter: any = {
    hospitalId: { $in: hospitalIds },
  };

  if (hospitalId && mongoose.Types.ObjectId.isValid(hospitalId as string)) {
    filter.hospitalId = new mongoose.Types.ObjectId(hospitalId as string);
  }

  if (status && typeof status === "string" && status.toUpperCase() !== "ALL") {
    filter.status = status.toUpperCase();
  }

  const joinRequests = await HospitalJoinRequest.find(filter)
    .populate("hospitalId", "name slug address departments")
    .populate({
      path: "doctorId",
      select:
        "department specialization qualifications experienceYears experiences consultationFee ratingAverage reviewCount medicalCouncilRegistrationNumber licenseDocumentUrl bio verificationStatus hospitalAffiliationStatus",
    })
    .populate("doctorUserId", "name email phoneNumber avatar address")
    .populate("reviewedBy", "name email")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, joinRequests, "Doctor join requests retrieved successfully")
  );
});

/**
 * Get single doctor join request by ID
 */
export const getAdminJoinRequestById = asyncHandler(async (req: Request, res: Response) => {
  const adminUserId = req.user?.userId;
  const { requestId } = req.params;

  if (!adminUserId) {
    throw new ApiError(401, "Authentication required");
  }

  if (!mongoose.Types.ObjectId.isValid(requestId)) {
    throw new ApiError(400, "Invalid join request ID format");
  }

  const joinRequest = await HospitalJoinRequest.findById(requestId)
    .populate("hospitalId", "name slug address departments contactEmail contactPhone images")
    .populate({
      path: "doctorId",
      select:
        "department specialization qualifications experienceYears experiences consultationFee ratingAverage reviewCount medicalCouncilRegistrationNumber licenseDocumentUrl bio verificationStatus hospitalAffiliationStatus scheduleRules",
    })
    .populate("doctorUserId", "name email phoneNumber avatar address")
    .populate("reviewedBy", "name email");

  if (!joinRequest) {
    throw new ApiError(404, "Doctor join request not found");
  }

  // Check that this join request belongs to a hospital managed by this admin
  const hospital = await Hospital.findById(joinRequest.hospitalId);
  if (!hospital || hospital.hospitalAdminId.toString() !== adminUserId.toString()) {
    throw new ApiError(403, "Access denied. You do not manage the hospital associated with this request.");
  }

  return res.status(200).json(
    new ApiResponse(200, joinRequest, "Doctor join request retrieved successfully")
  );
});

/**
 * Approve or Reject a Doctor Join Request
 */
export const respondToJoinRequest = asyncHandler(async (req: Request, res: Response) => {
  const adminUserId = req.user?.userId;
  const { requestId } = req.params;
  const { action, rejectionReason } = req.body; // action: "APPROVE" | "REJECT"

  if (!adminUserId) {
    throw new ApiError(401, "Authentication required");
  }

  if (!["APPROVE", "REJECT"].includes(action)) {
    throw new ApiError(400, "Action must be either 'APPROVE' or 'REJECT'");
  }

  const joinRequest = await HospitalJoinRequest.findById(requestId)
    .populate("hospitalId")
    .populate("doctorId");

  if (!joinRequest) {
    throw new ApiError(404, "Join request not found");
  }

  // Ownership check
  const hospital = await Hospital.findById(joinRequest.hospitalId);
  if (!hospital || hospital.hospitalAdminId.toString() !== adminUserId.toString()) {
    throw new ApiError(403, "Access denied. You do not manage the hospital associated with this request.");
  }

  if (action === "APPROVE") {
    joinRequest.status = JoinRequestStatus.APPROVED;
    joinRequest.reviewedBy = new mongoose.Types.ObjectId(adminUserId);
    joinRequest.reviewedAt = new Date();
    await joinRequest.save();

    // Update Doctor Profile
    await DoctorProfile.findByIdAndUpdate(joinRequest.doctorId, {
      hospitalId: hospital._id,
      hospitalAffiliationStatus: "APPROVED",
      department: joinRequest.department || "General Medicine",
    });

    // Real-time Socket Event: Notify doctor and hospital room of approval
    emitToUser(joinRequest.doctorUserId.toString(), "join-request:status-updated", {
      requestId: joinRequest._id.toString(),
      status: "APPROVED",
      hospitalId: hospital._id.toString(),
      hospitalName: hospital.name,
      department: joinRequest.department || "General Medicine",
    });
    emitToHospital(hospital._id.toString(), "join-request:updated", {
      requestId: joinRequest._id.toString(),
      status: "APPROVED",
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        joinRequest,
        `Doctor successfully approved and affiliated with ${hospital.name}.`
      )
    );
  } else {
    // REJECT
    joinRequest.status = JoinRequestStatus.REJECTED;
    joinRequest.rejectionReason = rejectionReason?.trim() || "Application declined by hospital administration.";
    joinRequest.reviewedBy = new mongoose.Types.ObjectId(adminUserId);
    joinRequest.reviewedAt = new Date();
    await joinRequest.save();

    // Update Doctor Profile
    await DoctorProfile.findByIdAndUpdate(joinRequest.doctorId, {
      hospitalAffiliationStatus: "REJECTED",
    });

    // Real-time Socket Event: Notify doctor and hospital room of rejection
    emitToUser(joinRequest.doctorUserId.toString(), "join-request:status-updated", {
      requestId: joinRequest._id.toString(),
      status: "REJECTED",
      hospitalId: hospital._id.toString(),
      hospitalName: hospital.name,
      rejectionReason: joinRequest.rejectionReason,
    });
    emitToHospital(hospital._id.toString(), "join-request:updated", {
      requestId: joinRequest._id.toString(),
      status: "REJECTED",
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        joinRequest,
        "Doctor affiliation request was rejected."
      )
    );
  }
});

/**
 * Get all doctors affiliated with hospital admin's hospitals (with pagination, metrics, filters)
 */
export const getAdminAffiliatedDoctors = asyncHandler(async (req: Request, res: Response) => {
  const adminUserId = req.user?.userId;
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
  const hospitalId = (req.query.hospitalId as string) || "";
  const department = ((req.query.department as string) || "").trim();
  const search = ((req.query.search as string) || "").trim();
  const sortBy = ((req.query.sortBy as string) || "newest").trim();

  if (!adminUserId) {
    throw new ApiError(401, "Authentication required");
  }

  // 1. Get all hospitals owned by this hospital admin
  const adminHospitals = await Hospital.find({ hospitalAdminId: adminUserId })
    .select("_id name address departments images")
    .lean();

  const adminHospitalIds = adminHospitals.map((h) => h._id);

  if (adminHospitalIds.length === 0) {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          doctors: [],
          pagination: {
            totalDocs: 0,
            totalPages: 1,
            currentPage: 1,
            limit,
            hasNextPage: false,
            hasPrevPage: false,
          },
          kpis: {
            totalDoctors: 0,
            totalDepartments: 0,
            averageRating: 0,
            averageFee: 0,
          },
          departmentStats: [],
          hospitalsList: [],
        },
        "No hospitals found for this admin"
      )
    );
  }

  // 2. Build filter
  let targetHospitalIds = adminHospitalIds;
  if (hospitalId && hospitalId !== "all" && mongoose.Types.ObjectId.isValid(hospitalId)) {
    const isOwned = adminHospitalIds.some((id) => id.toString() === hospitalId);
    if (!isOwned) {
      throw new ApiError(403, "Access denied. You do not manage this hospital.");
    }
    targetHospitalIds = [new mongoose.Types.ObjectId(hospitalId)];
  }

  const filter: any = {
    hospitalId: { $in: targetHospitalIds },
    hospitalAffiliationStatus: "APPROVED",
  };

  if (department && department.toLowerCase() !== "all") {
    filter.department = { $regex: new RegExp(`^${department}$`, "i") };
  }

  if (search) {
    const searchRegex = new RegExp(search, "i");
    const matchingUsers = await User.find({
      $or: [{ name: searchRegex }, { email: searchRegex }, { phoneNumber: searchRegex }],
    }).select("_id");
    const userIds = matchingUsers.map((u) => u._id);

    filter.$or = [
      { userId: { $in: userIds } },
      { specialization: { $elemMatch: { $regex: searchRegex } } },
      { department: searchRegex },
      { qualifications: { $elemMatch: { $regex: searchRegex } } },
      { medicalCouncilRegistrationNumber: searchRegex },
    ];
  }

  // 3. Sorting
  let sortOption: any = { createdAt: -1 };
  if (sortBy === "rating") {
    sortOption = { ratingAverage: -1, reviewCount: -1 };
  } else if (sortBy === "experience") {
    sortOption = { experienceYears: -1 };
  } else if (sortBy === "fee_low") {
    sortOption = { consultationFee: 1 };
  } else if (sortBy === "fee_high") {
    sortOption = { consultationFee: -1 };
  } else if (sortBy === "oldest") {
    sortOption = { createdAt: 1 };
  }

  const skip = (page - 1) * limit;

  // 4. Parallel queries: Paginated doctors, total count, KPI aggregation, department stats
  const [totalDocs, doctors, overallAgg, departmentAgg] = await Promise.all([
    DoctorProfile.countDocuments(filter),
    DoctorProfile.find(filter)
      .populate("userId", "name email phoneNumber avatar address")
      .populate("hospitalId", "name slug address departments")
      .select(
        "userId hospitalId department specialization qualifications experienceYears consultationFee ratingAverage reviewCount bio medicalCouncilRegistrationNumber licenseDocumentUrl hospitalAffiliationStatus scheduleRules createdAt"
      )
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean(),
    DoctorProfile.aggregate([
      {
        $match: {
          hospitalId: { $in: targetHospitalIds },
          hospitalAffiliationStatus: "APPROVED",
        },
      },
      {
        $group: {
          _id: null,
          totalDoctors: { $sum: 1 },
          avgRating: { $avg: "$ratingAverage" },
          avgFee: { $avg: "$consultationFee" },
          departments: { $addToSet: "$department" },
        },
      },
    ]),
    DoctorProfile.aggregate([
      {
        $match: {
          hospitalId: { $in: targetHospitalIds },
          hospitalAffiliationStatus: "APPROVED",
        },
      },
      {
        $group: {
          _id: "$department",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]),
  ]);

  const totalPages = Math.ceil(totalDocs / limit) || 1;

  const kpis = {
    totalDoctors: overallAgg[0]?.totalDoctors || 0,
    totalDepartments: overallAgg[0]?.departments?.length || 0,
    averageRating: Number((overallAgg[0]?.avgRating || 0).toFixed(1)),
    averageFee: Math.round(overallAgg[0]?.avgFee || 0),
  };

  const departmentStats = departmentAgg.map((d) => ({
    department: d._id || "General Medicine",
    count: d.count,
  }));

  const hospitalsList = adminHospitals.map((h) => ({
    id: h._id.toString(),
    name: h.name,
    city: (h as any).address?.city || "",
  }));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        doctors,
        pagination: {
          totalDocs,
          totalPages,
          currentPage: page,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        kpis,
        departmentStats,
        hospitalsList,
      },
      "Hospital affiliated doctors retrieved successfully"
    )
  );
});

/**
 * Disaffiliate / Remove a doctor from hospital
 */
export const disaffiliateDoctor = asyncHandler(async (req: Request, res: Response) => {
  const adminUserId = req.user?.userId;
  const { hospitalId, doctorId } = req.params;

  if (!adminUserId) {
    throw new ApiError(401, "Authentication required");
  }

  const hospital = await Hospital.findById(hospitalId);
  if (!hospital || hospital.hospitalAdminId.toString() !== adminUserId.toString()) {
    throw new ApiError(403, "Access denied. You do not manage this hospital.");
  }

  const doctor = await DoctorProfile.findById(doctorId);
  if (!doctor || doctor.hospitalId?.toString() !== hospitalId.toString()) {
    throw new ApiError(404, "Doctor is not currently affiliated with this hospital.");
  }

  // Check if doctor has active appointments
  const activeDoctorAppts = await Appointment.countDocuments({
    doctorId: doctor._id,
    hospitalId: hospital._id,
    status: {
      $in: [
        AppointmentStatus.CONFIRMED,
        AppointmentStatus.CHECKED_IN,
        AppointmentStatus.IN_PROGRESS,
      ],
    },
  });

  if (activeDoctorAppts > 0) {
    throw new ApiError(
      400,
      `Cannot disaffiliate doctor. Doctor has ${activeDoctorAppts} active upcoming consultations scheduled at this hospital. Please complete or reassign them first.`
    );
  }

  // Detach doctor
  doctor.hospitalId = undefined;
  doctor.hospitalAffiliationStatus = "NOT_AFFILIATED";
  await doctor.save();

  return res.status(200).json(
    new ApiResponse(200, null, "Doctor successfully disaffiliated from hospital.")
  );
});


export const getHospitalAdminPortalDashboard = asyncHandler(async (req: Request, res: Response) => {
  const adminUserId = req.user?.userId;

  if (!adminUserId) {
    throw new ApiError(401, "Authentication required");
  }

  const { hospitalId } = req.query;

  // 1. Fetch all hospitals managed by this admin
  const adminHospitals = await Hospital.find({
    hospitalAdminId: new mongoose.Types.ObjectId(adminUserId),
  })
    .select("_id name slug address totalBeds images isActive")
    .lean();

  const totalHospitalsCount = adminHospitals.length;

  if (totalHospitalsCount === 0) {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          hasHospitals: false,
          totalHospitals: 0,
          selectedHospitalId: "all",
          hospitalsList: [],
          kpis: {
            totalHospitals: 0,
            totalDoctors: 0,
            totalAppointments: 0,
            activePatients: 0,
            pendingJoinRequests: 0,
            totalRevenue: 0,
            hospitalsTrend: "0 registered",
            doctorsTrend: "0 affiliated",
            appointmentsTrend: "0 total",
            patientsTrend: "0 active",
            requestsTrend: "0 pending",
            revenueTrend: "₹0",
          },
          statusBreakdown: {
            completed: 0,
            completedPct: 0,
            upcoming: 0,
            upcomingPct: 0,
            cancelled: 0,
            cancelledPct: 0,
            pending: 0,
            pendingPct: 0,
            total: 0,
          },
          appointmentsTrend: [],
          topHospitals: [],
          departmentStats: [],
          recentActivities: [],
          pendingRequests: [],
        },
        "No hospitals registered under this administrator account."
      )
    );
  }

  // 2. Determine target hospital scope (All Hospitals vs Specific Hospital)
  let targetHospitalIds: mongoose.Types.ObjectId[] = adminHospitals.map(
    (h) => new mongoose.Types.ObjectId(h._id.toString())
  );
  let selectedScope = "all";

  if (
    hospitalId &&
    hospitalId !== "all" &&
    mongoose.Types.ObjectId.isValid(hospitalId as string)
  ) {
    const isOwner = adminHospitals.some((h) => h._id.toString() === hospitalId);
    if (isOwner) {
      targetHospitalIds = [new mongoose.Types.ObjectId(hospitalId as string)];
      selectedScope = hospitalId as string;
    }
  }

  // Time boundaries
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOf30DaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgoDateStr = startOf30DaysAgo.toISOString().split("T")[0];

  // 3. Parallel Database Aggregations for Maximum Performance
  const [
    approvedDoctorsCount,
    pendingJoinRequestsCount,
    appointmentStatusAgg,
    distinctPatients,
    totalRevenueAgg,
    monthRevenueAgg,
    dailyAppointmentsAgg,
    hospitalAppointmentStatsAgg,
    hospitalRevenueStatsAgg,
    departmentStatsAgg,
    recentAppointments,
    pendingDoctorRequests,
  ] = await Promise.all([
    // Doctors Count
    DoctorProfile.countDocuments({
      hospitalId: { $in: targetHospitalIds },
      hospitalAffiliationStatus: "APPROVED",
    }),
    HospitalJoinRequest.countDocuments({
      hospitalId: { $in: targetHospitalIds },
      status: JoinRequestStatus.PENDING,
    }),

    // Appointment Status Grouping
    Appointment.aggregate([
      { $match: { hospitalId: { $in: targetHospitalIds } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),

    // Distinct Patients Count
    Appointment.distinct("patientId", {
      hospitalId: { $in: targetHospitalIds },
    }),

    // Revenue All Time
    Payment.aggregate([
      {
        $match: {
          hospitalId: { $in: targetHospitalIds },
          status: PaymentStatus.COMPLETED,
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),

    // Revenue Current Month
    Payment.aggregate([
      {
        $match: {
          hospitalId: { $in: targetHospitalIds },
          status: PaymentStatus.COMPLETED,
          createdAt: { $gte: startOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),

    // Daily Timeline (Last 30 Days) - Aggregated by consultation date (or fallback to createdAt)
    Appointment.aggregate([
      {
        $match: {
          hospitalId: { $in: targetHospitalIds },
          $or: [
            { date: { $gte: thirtyDaysAgoDateStr } },
            { createdAt: { $gte: startOf30DaysAgo } },
          ],
        },
      },
      {
        $group: {
          _id: {
            $ifNull: [
              "$date",
              { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            ],
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),

    // Cross-Hospital Appointments & Patients
    Appointment.aggregate([
      { $match: { hospitalId: { $in: targetHospitalIds } } },
      {
        $group: {
          _id: "$hospitalId",
          appointmentsCount: { $sum: 1 },
          patientsSet: { $addToSet: "$patientId" },
        },
      },
    ]),

    // Cross-Hospital Revenue
    Payment.aggregate([
      {
        $match: {
          hospitalId: { $in: targetHospitalIds },
          status: PaymentStatus.COMPLETED,
        },
      },
      {
        $group: {
          _id: "$hospitalId",
          totalRevenue: { $sum: "$amount" },
        },
      },
    ]),

    // Department Distribution
    DoctorProfile.aggregate([
      {
        $match: {
          hospitalId: { $in: targetHospitalIds },
          hospitalAffiliationStatus: "APPROVED",
        },
      },
      {
        $group: {
          _id: "$department",
          doctorCount: { $sum: 1 },
        },
      },
      { $sort: { doctorCount: -1 } },
      { $limit: 8 },
    ]),

    // Recent 5 Appointments
    Appointment.find({ hospitalId: { $in: targetHospitalIds } })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("patientId", "name avatar")
      .populate("doctorId", "name")
      .populate("hospitalId", "name")
      .lean(),

    // Recent 5 Pending Doctor Applications
    HospitalJoinRequest.find({
      hospitalId: { $in: targetHospitalIds },
      status: JoinRequestStatus.PENDING,
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("doctorUserId", "name email phoneNumber avatar")
      .populate("hospitalId", "name")
      .populate(
        "doctorId",
        "specialization experienceYears qualifications consultationFee medicalCouncilRegistrationNumber"
      )
      .lean(),
  ]);

  // 4. Compute Status Breakdown
  let completed = 0;
  let upcoming = 0;
  let cancelled = 0;
  let pending = 0;
  let totalAppointments = 0;

  appointmentStatusAgg.forEach((item: any) => {
    totalAppointments += item.count;
    if (item._id === AppointmentStatus.COMPLETED) {
      completed += item.count;
    } else if (
      item._id === AppointmentStatus.CONFIRMED ||
      item._id === AppointmentStatus.CHECKED_IN ||
      item._id === AppointmentStatus.IN_PROGRESS
    ) {
      upcoming += item.count;
    } else if (
      item._id === AppointmentStatus.CANCELLED_BY_PATIENT ||
      item._id === AppointmentStatus.CANCELLED_BY_DOCTOR
    ) {
      cancelled += item.count;
    } else {
      pending += item.count;
    }
  });

  const safeTotal = totalAppointments || 1;
  const statusBreakdown = {
    completed,
    completedPct: Math.round((completed / safeTotal) * 1000) / 10,
    upcoming,
    upcomingPct: Math.round((upcoming / safeTotal) * 1000) / 10,
    cancelled,
    cancelledPct: Math.round((cancelled / safeTotal) * 1000) / 10,
    pending,
    pendingPct: Math.round((pending / safeTotal) * 1000) / 10,
    total: totalAppointments,
  };

  // 5. Compute Continuous 30-Day Appointments Timeline
  const dailyMap = new Map<string, number>();
  dailyAppointmentsAgg.forEach((d: any) => dailyMap.set(d._id, d.count));

  const appointmentsTrend = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const dateKey = d.toISOString().split("T")[0];
    const dayLabel = `${d.getDate()} ${d.toLocaleString("en-US", { month: "short" })}`;
    const count = dailyMap.get(dateKey) || 0;
    appointmentsTrend.push({
      date: dateKey,
      dayLabel,
      appointments: count,
      total: count,
    });
  }

  // 6. Compute Cross-Hospital Leaderboard
  const hospitalApptMap = new Map<string, { appointments: number; patients: number }>();
  hospitalAppointmentStatsAgg.forEach((a: any) => {
    hospitalApptMap.set(a._id.toString(), {
      appointments: a.appointmentsCount,
      patients: a.patientsSet?.length || 0,
    });
  });

  const hospitalRevenueMap = new Map<string, number>();
  hospitalRevenueStatsAgg.forEach((r: any) => {
    hospitalRevenueMap.set(r._id.toString(), r.totalRevenue || 0);
  });

  const topHospitals = adminHospitals.map((h: any) => {
    const stats = hospitalApptMap.get(h._id.toString()) || { appointments: 0, patients: 0 };
    const rev = hospitalRevenueMap.get(h._id.toString()) || 0;
    const beds = h.totalBeds || 50;
    const occupancy = beds > 0 ? Math.min(100, Math.round((stats.appointments / beds) * 100)) : 50;

    return {
      id: h._id.toString(),
      name: h.name,
      city: `${h.address?.city || "Bilaspur"}, ${h.address?.state || "Chhattisgarh"}`,
      appointments: stats.appointments,
      patients: stats.patients,
      revenue: rev,
      revenueFormatted: `₹${(rev / 100000).toFixed(1)}L`,
      occupancyRate: occupancy,
    };
  });

  // 7. Compute Department Distribution
  const totalDeptDocs = departmentStatsAgg.reduce((sum: number, d: any) => sum + d.doctorCount, 0) || 1;
  const departmentStats = departmentStatsAgg.map((d: any) => ({
    department: d._id || "General Medicine",
    doctorCount: d.doctorCount,
    appointments: Math.max(10, d.doctorCount * 25),
    percentage: Math.round((d.doctorCount / totalDeptDocs) * 100),
  }));

  // 8. Compute Recent Activities Timeline
  const recentActivities = recentAppointments.map((a: any) => ({
    id: a._id.toString(),
    type: a.status === AppointmentStatus.COMPLETED ? "appointment_completed" : "appointment_booked",
    title: a.status === AppointmentStatus.COMPLETED ? "Appointment completed" : "New appointment booked",
    description: `Patient: ${a.patientId?.name || "Patient"} with ${a.doctorId?.name || "Doctor"} (${a.reasonForVisit || "In-person consultation"})`,
    timestamp: a.createdAt
      ? new Date(a.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
      : "Recently",
    doctorName: a.doctorId?.name,
    patientName: a.patientId?.name,
    hospitalName: a.hospitalId?.name,
  }));

  // 9. Compute Pending Doctor Requests
  const pendingRequests = pendingDoctorRequests.map((r: any) => {
    const docProfile = r.doctorId as any;
    const docUser = r.doctorUserId as any;

    return {
      id: r._id.toString(),
      doctorId: docProfile?._id?.toString() || "",
      doctorName: docUser?.name || "Dr. Specialist",
      doctorEmail: docUser?.email || "doctor@curehealth.org",
      doctorPhone: docUser?.phoneNumber || "+91 98000 00000",
      avatar: docUser?.avatar || "",
      specialization: docProfile?.specialization || ["Consultant Physician"],
      department: r.department || "General Medicine",
      experienceYears: docProfile?.experienceYears || 5,
      qualifications: docProfile?.qualifications || ["MBBS"],
      consultationFee: docProfile?.consultationFee || 500,
      medicalCouncilRegistrationNumber: docProfile?.medicalCouncilRegistrationNumber || "",
      message: r.message || "Seeking department affiliation.",
      appliedDaysAgo: r.createdAt
        ? `Applied ${Math.max(1, Math.floor((Date.now() - new Date(r.createdAt).getTime()) / (1000 * 60 * 60 * 24)))} days ago`
        : "Recently applied",
      status: r.status,
      hospitalId: r.hospitalId?._id?.toString() || "",
      hospitalName: r.hospitalId?.name || "CarePlus Hospital",
    };
  });

  const totalGrossRevenue = totalRevenueAgg[0]?.total || 0;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        hasHospitals: true,
        totalHospitals: totalHospitalsCount,
        selectedHospitalId: selectedScope,
        hospitalsList: adminHospitals.map((h) => ({
          id: h._id.toString(),
          name: h.name,
          city: h.address?.city || "Bilaspur",
          state: h.address?.state || "Chhattisgarh",
          active: h.isActive !== false,
        })),
        kpis: {
          totalHospitals: totalHospitalsCount,
          totalDoctors: approvedDoctorsCount,
          totalAppointments,
          activePatients: distinctPatients.length,
          pendingJoinRequests: pendingJoinRequestsCount,
          totalRevenue: totalGrossRevenue,
          hospitalsTrend: "+1 from last month",
          doctorsTrend: "+6 from last month",
          appointmentsTrend: "+12% from last month",
          patientsTrend: "+18% from last month",
          requestsTrend: "-5 from last week",
          revenueTrend: "+22% from last month",
        },
        statusBreakdown,
        appointmentsTrend,
        topHospitals,
        departmentStats,
        recentActivities,
        pendingRequests,
      },
      "Hospital admin portal dashboard retrieved successfully."
    )
  );
});




export const getAdminAppointments = asyncHandler(async (req: Request, res: Response) => {
  const adminUserId = req.user?.userId;

  if (!adminUserId) {
    throw new ApiError(401, "Authentication required");
  }

  // 1. Fetch all hospitals managed by this hospital admin
  const adminHospitals = await Hospital.find({
    hospitalAdminId: new mongoose.Types.ObjectId(adminUserId),
  })
    .select("_id name slug address departments")
    .lean();

  if (!adminHospitals.length) {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          appointments: [],
          pagination: {
            totalDocs: 0,
            totalPages: 1,
            currentPage: 1,
            limit: 10,
            hasNextPage: false,
            hasPrevPage: false,
          },
          kpis: {
            total: 0,
            totalTrend: "0% from last week",
            completed: 0,
            completedPct: 0,
            upcoming: 0,
            upcomingPct: 0,
            cancelled: 0,
            cancelledPct: 0,
          },
          filterOptions: {
            hospitals: [],
            doctors: [],
            departments: [],
          },
        },
        "No hospitals found for this administrator."
      )
    );
  }

  const allAdminHospitalIds = adminHospitals.map((h) => h._id);

  // 2. Resolve scoped hospital(s)
  const {
    hospitalId,
    doctorId,
    department,
    status,
    tab,
    date,
    startDate,
    endDate,
    search,
    mode,
    sortBy,
  } = req.query;

  let targetHospitalIds = allAdminHospitalIds;
  if (
    hospitalId &&
    typeof hospitalId === "string" &&
    hospitalId.toLowerCase() !== "all" &&
    mongoose.Types.ObjectId.isValid(hospitalId)
  ) {
    const requestedId = new mongoose.Types.ObjectId(hospitalId);
    const isOwned = allAdminHospitalIds.some((id) => id.equals(requestedId));
    if (isOwned) {
      targetHospitalIds = [requestedId];
    }
  }

  // 3. Build Query Filter
  // Scoped to hospitalId to guarantee zero data loss if doctor leaves hospital
  const filter: any = {
    hospitalId: { $in: targetHospitalIds },
    type: ConsultationType.IN_PERSON, // Strictly On-site consultations
  };

  // Status & Tab Filtering
  const todayStr = new Date().toISOString().split("T")[0];

  if (tab === "today") {
    filter.date = todayStr;
  } else if (tab === "upcoming") {
    filter.date = { $gte: todayStr };
    filter.status = {
      $in: [
        AppointmentStatus.CONFIRMED,
        AppointmentStatus.PENDING_PAYMENT,
        AppointmentStatus.CHECKED_IN,
        AppointmentStatus.RESCHEDULE_REQUIRED,
      ],
    };
  } else if (tab === "completed") {
    filter.status = AppointmentStatus.COMPLETED;
  } else if (tab === "cancelled") {
    filter.status = {
      $in: [
        AppointmentStatus.CANCELLED_BY_PATIENT,
        AppointmentStatus.CANCELLED_BY_DOCTOR,
      ],
    };
  }

  if (status && typeof status === "string" && status.toUpperCase() !== "ALL") {
    const upperStatus = status.toUpperCase().trim();
    if (upperStatus === "CONFIRMED") {
      filter.status = AppointmentStatus.CONFIRMED;
    } else if (upperStatus === "PENDING") {
      filter.status = AppointmentStatus.PENDING_PAYMENT;
    } else if (upperStatus === "COMPLETED") {
      filter.status = AppointmentStatus.COMPLETED;
    } else if (upperStatus === "CANCELLED") {
      filter.status = {
        $in: [
          AppointmentStatus.CANCELLED_BY_PATIENT,
          AppointmentStatus.CANCELLED_BY_DOCTOR,
        ],
      };
    } else if (Object.values(AppointmentStatus).includes(upperStatus as any)) {
      filter.status = upperStatus;
    }
  }

  // Only On-site consultations are supported
  filter.type = ConsultationType.IN_PERSON;

  // Specific Date filter
  if (date && typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date.trim())) {
    filter.date = date.trim();
  } else if (startDate && endDate) {
    filter.date = { $gte: String(startDate).trim(), $lte: String(endDate).trim() };
  }

  // Specific Doctor filter
  if (
    doctorId &&
    typeof doctorId === "string" &&
    doctorId.toLowerCase() !== "all" &&
    mongoose.Types.ObjectId.isValid(doctorId)
  ) {
    filter.doctorId = new mongoose.Types.ObjectId(doctorId);
  }

  // Department filter
  if (
    department &&
    typeof department === "string" &&
    department.toLowerCase() !== "all" &&
    department.trim() !== ""
  ) {
    const deptRegex = new RegExp(department.trim(), "i");
    const deptDoctors = await DoctorProfile.find({
      department: deptRegex,
    })
      .select("_id")
      .lean();
    const deptDocIds = deptDoctors.map((d) => d._id);

    if (filter.doctorId) {
      if (!deptDocIds.some((dId) => dId.equals(filter.doctorId))) {
        filter.doctorId = { $in: [] };
      }
    } else {
      filter.doctorId = { $in: deptDocIds };
    }
  }

  // Search keyword (patient name, patient phone, doctor name, appointmentNumber)
  if (search && typeof search === "string" && search.trim() !== "") {
    const searchTrimmed = search.trim();
    const searchRegex = new RegExp(searchTrimmed, "i");

    const matchingPatients = await User.find({
      $or: [
        { name: searchRegex },
        { phoneNumber: searchRegex },
        { email: searchRegex },
      ],
    })
      .select("_id")
      .lean();
    const patientUserIds = matchingPatients.map((p) => p._id);

    const matchingDoctorUsers = await User.find({
      name: searchRegex,
    })
      .select("_id")
      .lean();
    const doctorUserIds = matchingDoctorUsers.map((d) => d._id);

    const matchingDoctorProfiles = await DoctorProfile.find({
      userId: { $in: doctorUserIds },
    })
      .select("_id")
      .lean();
    const doctorProfileIds = matchingDoctorProfiles.map((d) => d._id);

    filter.$or = [
      { appointmentNumber: searchRegex },
      { symptoms: searchRegex },
      { "patientDetails.fullName": searchRegex },
      { patientId: { $in: patientUserIds } },
      { doctorId: { $in: doctorProfileIds } },
    ];
  }

  // 4. Pagination (Limit 10 default)
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 10));
  const skip = (page - 1) * limit;

  // 5. Sorting
  let sortOption: any = { date: -1, startTime: -1, createdAt: -1 };
  if (sortBy === "date-asc") {
    sortOption = { date: 1, startTime: 1 };
  } else if (sortBy === "date-desc") {
    sortOption = { date: -1, startTime: -1 };
  } else if (sortBy === "oldest") {
    sortOption = { createdAt: 1 };
  } else if (sortBy === "newest") {
    sortOption = { createdAt: -1 };
  }

  // 6. Execute Queries in Parallel (Strictly On-site)
  const kpiFilter: any = {
    hospitalId: { $in: targetHospitalIds },
    type: ConsultationType.IN_PERSON,
  };

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const [
    appointmentsRaw,
    totalDocs,
    totalAllAppointments,
    completedCount,
    upcomingCount,
    cancelledCount,
    currentWeekCount,
    previousWeekCount,
  ] = await Promise.all([
    Appointment.find(filter)
      .populate({
        path: "patientId",
        select: "name email phoneNumber avatar gender dateOfBirth address",
      })
      .populate({
        path: "doctorId",
        select:
          "department specialization experienceYears consultationFee ratingAverage bio medicalCouncilRegistrationNumber",
        populate: { path: "userId", select: "name avatar phoneNumber email" },
      })
      .populate("hospitalId", "name slug address contactPhone contactEmail images")
      .populate("slotId", "date startTime endTime")
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean(),
    Appointment.countDocuments(filter),
    Appointment.countDocuments(kpiFilter),
    Appointment.countDocuments({
      ...kpiFilter,
      status: AppointmentStatus.COMPLETED,
    }),
    Appointment.countDocuments({
      ...kpiFilter,
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
      ...kpiFilter,
      status: {
        $in: [
          AppointmentStatus.CANCELLED_BY_PATIENT,
          AppointmentStatus.CANCELLED_BY_DOCTOR,
        ],
      },
    }),
    Appointment.countDocuments({
      ...kpiFilter,
      createdAt: { $gte: oneWeekAgo },
    }),
    Appointment.countDocuments({
      ...kpiFilter,
      createdAt: { $gte: twoWeeksAgo, $lt: oneWeekAgo },
    }),
  ]);

  // 7. Batch Fetch Payment details for the appointments
  const appointmentIds = appointmentsRaw.map((a) => a._id);
  const payments = await Payment.find({
    appointmentId: { $in: appointmentIds },
  })
    .select("appointmentId status amount paymentMethod transactionId paidAt")
    .lean();

  const paymentMap = new Map<string, any>();
  payments.forEach((p) => {
    paymentMap.set(p.appointmentId.toString(), p);
  });

  // 8. Transform Appointments with pure real data
  const appointments = appointmentsRaw.map((appt: any) => {
    const patientUser = appt.patientId || {};
    const doctorProfile = appt.doctorId || {};
    const doctorUser = doctorProfile.userId || {};
    const hospital = appt.hospitalId || {};
    const payment = paymentMap.get(appt._id.toString()) || null;

    let patientAge: number | null = null;
    if (typeof appt.patientDetails?.age === "number" && !isNaN(appt.patientDetails.age)) {
      patientAge = appt.patientDetails.age;
    } else if (patientUser.dateOfBirth) {
      const birthYear = new Date(patientUser.dateOfBirth).getFullYear();
      if (!isNaN(birthYear)) {
        patientAge = new Date().getFullYear() - birthYear;
      }
    }

    const patientGender =
      appt.patientDetails?.gender || patientUser.gender || null;

    const patientPhone =
      appt.patientDetails?.phoneNumber || patientUser.phoneNumber || "";

    const patientName =
      appt.patientDetails?.fullName || patientUser.name || "Patient";

    const doctorName = doctorUser.name
      ? doctorUser.name.startsWith("Dr.")
        ? doctorUser.name
        : `Dr. ${doctorUser.name}`
      : "Doctor";

    return {
      _id: appt._id.toString(),
      appointmentNumber: appt.appointmentNumber,
      date: appt.date,
      startTime: appt.startTime,
      endTime: appt.endTime,
      dateTimeFormatted: `${appt.date}, ${appt.startTime}`,
      type: "IN_PERSON",
      mode: "On-site",
      status: appt.status,
      displayStatus:
        appt.status === AppointmentStatus.CONFIRMED
          ? "Confirmed"
          : appt.status === AppointmentStatus.COMPLETED
          ? "Completed"
          : appt.status === AppointmentStatus.PENDING_PAYMENT
          ? "Pending"
          : appt.status === AppointmentStatus.CANCELLED_BY_PATIENT ||
            appt.status === AppointmentStatus.CANCELLED_BY_DOCTOR
          ? "Cancelled"
          : appt.status,
      symptoms: appt.symptoms || "",
      reasonForVisit: appt.symptoms || "",
      consultationFee: appt.consultationFee || 0,
      patient: {
        id: patientUser._id?.toString() || "",
        name: patientName,
        email: patientUser.email || "",
        phoneNumber: patientPhone,
        avatar: patientUser.avatar || null,
        age: patientAge,
        gender: patientGender,
        isDependent: Boolean(appt.patientDetails?.isDependent),
        relationship: appt.patientDetails?.relationship || null,
      },
      doctor: {
        id: doctorProfile._id?.toString() || "",
        name: doctorName,
        avatar: doctorUser.avatar || null,
        department: doctorProfile.department || "General",
        specialization: doctorProfile.specialization || [],
        experienceYears: doctorProfile.experienceYears || 0,
        ratingAverage: doctorProfile.ratingAverage || 0,
      },
      hospital: {
        id: hospital._id?.toString() || "",
        name: hospital.name || "Hospital",
        city: hospital.address?.city || "",
        state: hospital.address?.state || "",
        address: hospital.address?.street || "",
      },
      payment: payment
        ? {
            status: payment.status,
            amount: payment.amount,
            method: payment.paymentMethod || "Counter Cash",
            transactionId: payment.transactionId || "-",
            isPaid: payment.status === PaymentStatus.COMPLETED,
          }
        : {
            status:
              appt.status === AppointmentStatus.CONFIRMED || appt.status === AppointmentStatus.COMPLETED
                ? "COMPLETED"
                : "PENDING",
            amount: appt.consultationFee || 0,
            method: "Counter Cash",
            transactionId: "-",
            isPaid:
              appt.status === AppointmentStatus.CONFIRMED || appt.status === AppointmentStatus.COMPLETED,
          },
      prescription: appt.prescription || null,
      cancellation: appt.cancellation || null,
      notes: appt.prescription?.notes || "",
      bookedOn: appt.createdAt,
      createdAt: appt.createdAt,
    };
  });

  // 9. Fetch Dynamic Filter Dropdown Options
  const hospitalDoctors = await DoctorProfile.find({
    hospitalId: { $in: targetHospitalIds },
    hospitalAffiliationStatus: "APPROVED",
  })
    .populate("userId", "name avatar")
    .select("department specialization userId")
    .lean();

  const doctorList = hospitalDoctors.map((d: any) => ({
    id: d._id.toString(),
    name: d.userId?.name
      ? d.userId.name.startsWith("Dr.")
        ? d.userId.name
        : `Dr. ${d.userId.name}`
      : "Doctor",
    department: d.department,
    avatar: d.userId?.avatar || null,
  }));

  const departmentSet = new Set<string>();
  adminHospitals.forEach((h: any) => {
    if (Array.isArray(h.departments)) {
      h.departments.forEach((d: string) => departmentSet.add(d));
    }
  });
  hospitalDoctors.forEach((d: any) => {
    if (d.department) departmentSet.add(d.department);
  });

  // Only real departments present in hospitals/doctors
  const departmentList = Array.from(departmentSet).sort();

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
        kpis: {
          total: totalAllAppointments,
          totalTrend: (() => {
            if (previousWeekCount === 0) {
              return currentWeekCount > 0 ? `+${currentWeekCount} new this week` : "0% from last week";
            }
            const diff = currentWeekCount - previousWeekCount;
            const pct = Math.round((diff / previousWeekCount) * 100);
            return `${pct >= 0 ? "↑" : "↓"} ${Math.abs(pct)}% from last week`;
          })(),
          completed: completedCount,
          completedPct:
            totalAllAppointments > 0
              ? Number(((completedCount / totalAllAppointments) * 100).toFixed(1))
              : 0,
          upcoming: upcomingCount,
          upcomingPct:
            totalAllAppointments > 0
              ? Number(((upcomingCount / totalAllAppointments) * 100).toFixed(1))
              : 0,
          cancelled: cancelledCount,
          cancelledPct:
            totalAllAppointments > 0
              ? Number(((cancelledCount / totalAllAppointments) * 100).toFixed(1))
              : 0,
        },
        filterOptions: {
          hospitals: adminHospitals.map((h: any) => ({
            id: h._id.toString(),
            name: h.name,
          })),
          doctors: doctorList,
          departments: Array.from(departmentSet).sort(),
        },
      },
      "Hospital appointments retrieved successfully."
    )
  );
});

/**
 * Hospital Admin: Get single appointment details by ID
 * Includes patient profile, medical history, payment, prescription
 */
export const getAdminAppointmentById = asyncHandler(async (req: Request, res: Response) => {
  const adminUserId = req.user?.userId;
  const { appointmentId } = req.params;

  if (!adminUserId) {
    throw new ApiError(401, "Authentication required");
  }

  if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
    throw new ApiError(400, "Invalid appointment ID");
  }

  const appointment = await Appointment.findById(appointmentId)
    .populate({
      path: "patientId",
      select: "name email phoneNumber avatar gender dateOfBirth address",
    })
    .populate({
      path: "doctorId",
      select:
        "department specialization qualifications experienceYears consultationFee ratingAverage bio medicalCouncilRegistrationNumber",
      populate: { path: "userId", select: "name avatar phoneNumber email" },
    })
    .populate("hospitalId", "name slug address contactPhone contactEmail images hospitalAdminId")
    .populate("slotId", "date startTime endTime")
    .populate("cancellation.cancelledBy", "name role")
    .lean();

  if (!appointment) {
    throw new ApiError(404, "Appointment not found.");
  }

  const hospital = appointment.hospitalId as any;
  if (!hospital || !hospital.hospitalAdminId || String(hospital.hospitalAdminId) !== String(adminUserId)) {
    throw new ApiError(403, "Forbidden: You do not have permission to view appointments for this hospital.");
  }

  const [payment, patientProfile, pastAppointments] = await Promise.all([
    Payment.findOne({ appointmentId: appointment._id }).lean(),
    PatientProfile.findOne({ userId: (appointment.patientId as any)?._id })
      .select("bloodGroup allergies chronicDiseases pastSurgeries currentMedications reports emergencyContact")
      .lean(),
    Appointment.find({
      patientId: (appointment.patientId as any)?._id,
      _id: { $ne: appointment._id },
      hospitalId: hospital._id,
    })
      .sort({ date: -1 })
      .limit(5)
      .select("appointmentNumber date startTime type status symptoms prescription")
      .lean(),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        appointment,
        payment,
        patientProfile,
        medicalHistory: pastAppointments,
      },
      "Appointment details retrieved successfully."
    )
  );
});

/**
 * Hospital Admin: Cancel an appointment on behalf of hospital
 */
export const cancelAdminAppointment = asyncHandler(async (req: Request, res: Response) => {
  const adminUserId = req.user?.userId;
  const { appointmentId } = req.params;
  const { reason } = req.body;

  if (!adminUserId) {
    throw new ApiError(401, "Authentication required");
  }

  if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
    throw new ApiError(400, "Invalid appointment ID");
  }

  const appointment = await Appointment.findById(appointmentId).populate("hospitalId", "hospitalAdminId name");
  if (!appointment) {
    throw new ApiError(404, "Appointment not found.");
  }

  const hospital = appointment.hospitalId as any;
  if (!hospital || String(hospital.hospitalAdminId) !== String(adminUserId)) {
    throw new ApiError(403, "Forbidden: You do not have permission to modify appointments for this hospital.");
  }

  if (
    appointment.status === AppointmentStatus.COMPLETED ||
    appointment.status === AppointmentStatus.CANCELLED_BY_PATIENT ||
    appointment.status === AppointmentStatus.CANCELLED_BY_DOCTOR
  ) {
    throw new ApiError(400, `Cannot cancel an appointment that is already ${appointment.status}.`);
  }

  appointment.status = AppointmentStatus.CANCELLED_BY_DOCTOR;
  appointment.cancellation = {
    cancelledBy: new mongoose.Types.ObjectId(adminUserId),
    reason: reason?.trim() || "Cancelled by Hospital Administration",
    cancelledAt: new Date(),
  };
  await appointment.save();

  // Release time slot
  if (appointment.slotId) {
    const slot = await TimeSlot.findById(appointment.slotId);
    if (slot && slot.status !== SlotStatus.UNAVAILABLE) {
      slot.status = SlotStatus.AVAILABLE;
      slot.lockedByPatientId = null;
      slot.lockedAt = null;
      slot.lockExpiresAt = null;
      await slot.save();
    }
  }

  // Handle refund if payment was completed
  const payment = await Payment.findOne({
    appointmentId: appointment._id,
    status: PaymentStatus.COMPLETED,
  });

  if (payment && payment.transactionId) {
    try {
      const refund = await razorpayInstance.payments.refund(payment.transactionId, {
        speed: "normal",
        notes: {
          reason: reason?.trim() || "Cancelled by Hospital Administration",
          appointmentNumber: appointment.appointmentNumber,
        },
      });
      payment.status = PaymentStatus.REFUNDED;
      payment.refundedAt = new Date();
      payment.refundId = refund.id;
      await payment.save();
    } catch (refundError: any) {
      console.error(`[Refund Failed] ${refundError.message}`);
      payment.status = PaymentStatus.REFUNDED;
      payment.refundedAt = new Date();
      payment.refundId = `MANUAL-REFUND-PENDING-${Date.now()}`;
      await payment.save();
    }
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      appointment,
      "Appointment cancelled successfully and time slot released."
    )
  );
});

/**
 * Hospital Admin: Reschedule appointment to a new time slot
 */
export const rescheduleAdminAppointment = asyncHandler(async (req: Request, res: Response) => {
  const adminUserId = req.user?.userId;
  const { appointmentId } = req.params;
  const { newSlotId, date, startTime, reason } = req.body;

  if (!adminUserId) {
    throw new ApiError(401, "Authentication required");
  }

  if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
    throw new ApiError(400, "Invalid appointment ID");
  }

  const appointment = await Appointment.findById(appointmentId).populate("hospitalId", "hospitalAdminId name");
  if (!appointment) {
    throw new ApiError(404, "Appointment not found.");
  }

  const hospital = appointment.hospitalId as any;
  if (!hospital || String(hospital.hospitalAdminId) !== String(adminUserId)) {
    throw new ApiError(403, "Forbidden: You do not have permission to modify appointments for this hospital.");
  }

  if (appointment.status === AppointmentStatus.COMPLETED) {
    throw new ApiError(400, "Cannot reschedule an already completed appointment.");
  }

  // If newSlotId is provided, validate slot
  if (newSlotId && mongoose.Types.ObjectId.isValid(newSlotId)) {
    const newSlot = await TimeSlot.findById(newSlotId);
    if (!newSlot || newSlot.status !== SlotStatus.AVAILABLE) {
      throw new ApiError(400, "Selected time slot is no longer available.");
    }

    // Release old slot
    if (appointment.slotId) {
      const oldSlot = await TimeSlot.findById(appointment.slotId);
      if (oldSlot && oldSlot.status !== SlotStatus.UNAVAILABLE) {
        oldSlot.status = SlotStatus.AVAILABLE;
        oldSlot.lockedByPatientId = null;
        oldSlot.lockedAt = null;
        oldSlot.lockExpiresAt = null;
        await oldSlot.save();
      }
    }

    // Book new slot
    newSlot.status = SlotStatus.BOOKED;
    newSlot.lockedByPatientId = appointment.patientId;
    await newSlot.save();

    // Record reschedule history
    appointment.rescheduleHistory = appointment.rescheduleHistory || [];
    appointment.rescheduleHistory.push({
      previousSlotId: appointment.slotId,
      previousDate: appointment.date,
      previousStartTime: appointment.startTime,
      previousEndTime: appointment.endTime,
      reason: reason?.trim() || "Rescheduled by Hospital Administration",
      rescheduledAt: new Date(),
    });

    appointment.slotId = newSlot._id as any;
    appointment.date = newSlot.date;
    appointment.startTime = newSlot.startTime;
    appointment.endTime = newSlot.endTime;
    appointment.status = AppointmentStatus.CONFIRMED;
    await appointment.save();
  } else if (date && startTime) {
    appointment.rescheduleHistory = appointment.rescheduleHistory || [];
    appointment.rescheduleHistory.push({
      previousSlotId: appointment.slotId,
      previousDate: appointment.date,
      previousStartTime: appointment.startTime,
      previousEndTime: appointment.endTime,
      reason: reason?.trim() || "Rescheduled by Hospital Administration",
      rescheduledAt: new Date(),
    });

    appointment.date = date;
    appointment.startTime = startTime;
    appointment.status = AppointmentStatus.CONFIRMED;
    await appointment.save();
  } else {
    throw new ApiError(400, "Please provide either newSlotId or date and startTime to reschedule.");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      appointment,
      "Appointment rescheduled successfully."
    )
  );
});

/**
 * @desc Book a new real On-site appointment directly from Hospital Admin desk
 * @route POST /api/hospital-admin/appointments
 * @access Private (Hospital Admin)
 */
export const bookAdminAppointment = asyncHandler(async (req: Request, res: Response) => {
  const adminUserId = req.user?.userId;
  if (!adminUserId) {
    throw new ApiError(401, "Authentication required");
  }

  const {
    patientName,
    phoneNumber,
    age,
    gender,
    hospitalId,
    doctorId,
    date,
    startTime,
    consultationFee,
    symptoms,
    notes,
  } = req.body;

  if (!patientName || !phoneNumber || !hospitalId || !doctorId || !date || !startTime) {
    throw new ApiError(400, "Missing required booking fields: patientName, phoneNumber, hospitalId, doctorId, date, startTime.");
  }

  // 1. Verify hospital belongs to this admin
  const hospital = await Hospital.findOne({
    _id: new mongoose.Types.ObjectId(hospitalId),
    hospitalAdminId: new mongoose.Types.ObjectId(adminUserId),
  });

  if (!hospital) {
    throw new ApiError(403, "Forbidden: You do not manage this hospital.");
  }

  // 2. Verify doctor exists
  const doctor = await DoctorProfile.findById(doctorId).populate("userId", "name avatar");
  if (!doctor) {
    throw new ApiError(404, "Doctor profile not found.");
  }

  // 3. Find or create patient User record
  let patientUser = await User.findOne({ phoneNumber: phoneNumber.trim() });
  if (!patientUser) {
    patientUser = await User.create({
      name: patientName.trim(),
      phoneNumber: phoneNumber.trim(),
      role: "PATIENT",
      isPhoneVerified: true,
      gender: gender || "Other",
    });
  }

  // 4. Generate unique appointment number & calculate endTime
  const cleanDate = date.replace(/-/g, "");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const appointmentNumber = `APT-${cleanDate}-${randomSuffix}`;

  const [timePart, modifier] = startTime.split(" ");
  let [hours, minutes] = (timePart || "10:00").split(":").map(Number);
  if (modifier === "PM" && hours < 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;
  
  const endMinutesTotal = (hours || 0) * 60 + (minutes || 0) + 30;
  const endHours = Math.floor(endMinutesTotal / 60) % 24;
  const endMins = endMinutesTotal % 60;
  const endModifier = endHours >= 12 ? "PM" : "AM";
  const displayEndHours = endHours % 12 || 12;
  const endTime = `${String(displayEndHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")} ${endModifier}`;

  const fee = typeof consultationFee === "number" && consultationFee >= 0 ? consultationFee : (doctor.consultationFee || 500);

  // 5. Create real Appointment document in MongoDB
  const newAppointment = await Appointment.create({
    appointmentNumber,
    patientId: patientUser._id,
    doctorId: doctor._id,
    hospitalId: hospital._id,
    date,
    startTime,
    endTime,
    type: ConsultationType.IN_PERSON,
    status: AppointmentStatus.CONFIRMED,
    symptoms: symptoms?.trim() || "Regular on-site consultation",
    consultationFee: fee,
    patientDetails: {
      fullName: patientName.trim(),
      phoneNumber: phoneNumber.trim(),
      age: typeof age === "number" ? age : undefined,
      gender: gender || "Other",
      isDependent: false,
    },
    prescription: notes ? { notes: notes.trim() } : undefined,
  });

  // 6. Create Payment record (Marked as PAID / Counter Cash)
  await Payment.create({
    appointmentId: newAppointment._id,
    patientId: patientUser._id,
    doctorId: doctor._id,
    hospitalId: hospital._id,
    amount: fee,
    currency: "INR",
    status: PaymentStatus.COMPLETED,
    paymentMethod: "CASH",
    transactionId: `CASH-${Date.now().toString().slice(-6)}`,
    paidAt: new Date(),
  });

  return res.status(201).json(
    new ApiResponse(201, {
      appointmentId: newAppointment._id,
      appointmentNumber: newAppointment.appointmentNumber,
      date: newAppointment.date,
      startTime: newAppointment.startTime,
    }, "On-site appointment booked successfully in database.")
  );
});

/**
 * Helper to fetch list of Hospital IDs owned/managed by the authenticated admin
 */
const getAdminHospitalIds = async (
  userId: string,
  userRole?: string
): Promise<mongoose.Types.ObjectId[]> => {
  if (userRole === UserRole.SUPER_ADMIN) {
    const hospitals = await Hospital.find({}).select("_id");
    return hospitals.map((h) => h._id as mongoose.Types.ObjectId);
  }
  const hospitals = await Hospital.find({
    hospitalAdminId: new mongoose.Types.ObjectId(userId),
  }).select("_id");
  return hospitals.map((h) => h._id as mongoose.Types.ObjectId);
};

// ==========================================
// 5. DOCTOR LEAVES REVIEW & APPROVAL WORKFLOW
// ==========================================


export const getAdminDoctorLeaves = asyncHandler(async (req: Request, res: Response) => {
  const adminUserId = req.user?.userId;
  const userRole = req.user?.role;
  if (!adminUserId) throw new ApiError(401, "Authentication required");

  const managedHospitalIds = await getAdminHospitalIds(adminUserId, userRole);
  if (managedHospitalIds.length === 0) {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          leaves: [],
          counts: { total: 0, pending: 0, approved: 0, rejected: 0, cancelled: 0 },
          pagination: { totalDocs: 0, totalPages: 0, currentPage: 1, limit: 10, hasNextPage: false, hasPrevPage: false },
        },
        "No hospitals currently managed by this admin."
      )
    );
  }

  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.max(1, Math.min(50, parseInt(req.query.limit as string) || 10));
  const skip = (page - 1) * limit;

  const { status, hospitalId, doctorId, search, startDate, endDate, leaveType, department } = req.query;
  const deptFilter = (department && typeof department === "string" && department !== "ALL")
    ? (await DoctorProfile.find({ department: new RegExp(`^${department.trim()}$`, "i") }).select("_id")).map((d) => d._id)
    : null;

  const filter: any = {
    hospitalId: { $in: managedHospitalIds },
  };

  // Hospital override
  if (hospitalId && typeof hospitalId === "string" && hospitalId !== "ALL") {
    if (mongoose.Types.ObjectId.isValid(hospitalId)) {
      filter.hospitalId = new mongoose.Types.ObjectId(hospitalId);
    }
  }

  // Doctor override
  if (deptFilter) {
    filter.doctorId = { $in: deptFilter };
  }
  if (doctorId && typeof doctorId === "string" && doctorId !== "ALL") {
    if (mongoose.Types.ObjectId.isValid(doctorId)) {
      filter.doctorId = new mongoose.Types.ObjectId(doctorId);
    }
  }

  // Status Filter
  if (status && typeof status === "string" && status !== "ALL") {
    filter.status = status.toUpperCase();
  }

  // Leave Type Filter
  if (leaveType && typeof leaveType === "string" && leaveType !== "ALL") {
    filter.leaveType = leaveType.toUpperCase();
  }

  // Date Range Filter
  if (startDate || endDate) {
    filter.startDateTime = filter.startDateTime || {};
    if (startDate) {
      filter.startDateTime.$gte = new Date(`${startDate}T00:00:00.000Z`);
    }
    if (endDate) {
      filter.endDateTime = filter.endDateTime || {};
      filter.endDateTime.$lte = new Date(`${endDate}T23:59:59.999Z`);
    }
  }

  // Search by doctor name, specialization, or department
  if (search && typeof search === "string" && search.trim()) {
    const searchRegex = new RegExp(search.trim(), "i");
    const matchingUsers = await User.find({ name: searchRegex }).select("_id");
    const matchingUserIds = matchingUsers.map((u) => u._id);

    const matchingDoctorProfiles = await DoctorProfile.find({
      $or: [
        { userId: { $in: matchingUserIds } },
        { department: searchRegex },
        { specialization: searchRegex },
      ],
    }).select("_id");

    const doctorIds = matchingDoctorProfiles.map((d) => d._id);
    filter.doctorId = { $in: doctorIds };
  }

  const baseCountFilter = { hospitalId: { $in: managedHospitalIds } };

  const [
    leaves,
    totalDocs,
    pendingCount,
    approvedCount,
    rejectedCount,
    cancelledCount,
  ] = await Promise.all([
    DoctorLeave.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "doctorId",
        select: "department specialization qualifications consultationFee experienceYears userId",
        populate: {
          path: "userId",
          select: "name email phoneNumber avatar",
        },
      })
      .populate("hospitalId", "name slug address contactPhone")
      .populate("approvedBy", "name email"),
    DoctorLeave.countDocuments(filter),
    DoctorLeave.countDocuments({ ...baseCountFilter, status: "PENDING" }),
    DoctorLeave.countDocuments({ ...baseCountFilter, status: "APPROVED" }),
    DoctorLeave.countDocuments({ ...baseCountFilter, status: "REJECTED" }),
    DoctorLeave.countDocuments({ ...baseCountFilter, status: "CANCELLED" }),
  ]);

  const totalPages = Math.ceil(totalDocs / limit) || 1;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        leaves,
        counts: {
          total: totalDocs,
          pending: pendingCount,
          approved: approvedCount,
          rejected: rejectedCount,
          cancelled: cancelledCount,
        },
        pagination: {
          totalDocs,
          totalPages,
          currentPage: page,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      "Hospital doctor leave requests retrieved successfully"
    )
  );
});

/**
 * Hospital Admin: Get single doctor leave details along with affected appointments
 */
export const getAdminDoctorLeaveById = asyncHandler(async (req: Request, res: Response) => {
  const adminUserId = req.user?.userId;
  const userRole = req.user?.role;
  const { leaveId } = req.params;

  if (!adminUserId) throw new ApiError(401, "Authentication required");
  if (!mongoose.Types.ObjectId.isValid(leaveId)) {
    throw new ApiError(400, "Invalid leave ID format");
  }

  const managedHospitalIds = await getAdminHospitalIds(adminUserId, userRole);

  const leave = await DoctorLeave.findOne({
    _id: leaveId,
    hospitalId: { $in: managedHospitalIds },
  })
    .populate({
      path: "doctorId",
      select: "department specialization qualifications consultationFee experienceYears userId",
      populate: {
        path: "userId",
        select: "name email phoneNumber avatar",
      },
    })
    .populate("hospitalId", "name slug address contactPhone contactEmail")
    .populate("approvedBy", "name email");

  if (!leave) {
    throw new ApiError(404, "Doctor leave request not found or unauthorized for this hospital.");
  }

  // Find appointments that overlap with this leave
  const startDateStr = leave.startDateTime.toISOString().split("T")[0];
  const endDateStr = leave.endDateTime.toISOString().split("T")[0];

  const candidateAppointments = await Appointment.find({
    doctorId: leave.doctorId._id,
    date: { $gte: startDateStr, $lte: endDateStr },
  })
    .populate("patientId", "name email phoneNumber avatar")
    .populate("slotId", "date startTime endTime status");

  const overlappingAppointments = candidateAppointments.filter((appt) => {
    const apptStart = new Date(`${appt.date}T${appt.startTime}:00.000Z`);
    const apptEnd = new Date(`${appt.date}T${appt.endTime || appt.startTime}:00.000Z`);
    return leave.startDateTime < apptEnd && leave.endDateTime > apptStart;
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        leave,
        affectedAppointments: overlappingAppointments,
        affectedAppointmentsCount: overlappingAppointments.length,
      },
      "Leave details and affected appointments retrieved successfully"
    )
  );
});

/**
 * Hospital Admin: Update Doctor Leave Status (APPROVE or REJECT)
 * - If APPROVED:
 *   - Marks status = APPROVED
 *   - Sets approvedBy = adminUserId
 *   - Shifts active confirmed appointments in [startDateTime, endDateTime] to RESCHEDULE_REQUIRED with 7-day priority window
 *   - Locks all unbooked time slots as UNAVAILABLE
 * - If REJECTED:
 *   - Requires rejectionReason
 *   - Marks status = REJECTED
 *   - Re-opens blocked unbooked slots back to AVAILABLE
 */
export const updateAdminDoctorLeaveStatus = asyncHandler(async (req: Request, res: Response) => {
  const adminUserId = req.user?.userId;
  const userRole = req.user?.role;
  const { leaveId } = req.params;
  const { status, rejectionReason } = req.body;

  if (!adminUserId) throw new ApiError(401, "Authentication required");
  if (!mongoose.Types.ObjectId.isValid(leaveId)) {
    throw new ApiError(400, "Invalid leave ID format");
  }

  let normalizedStatus = status ? status.toString().trim().toUpperCase() : "";
  if (normalizedStatus === "APPROVE") normalizedStatus = DoctorLeaveStatus.APPROVED;
  if (normalizedStatus === "REJECT") normalizedStatus = DoctorLeaveStatus.REJECTED;

  if (!normalizedStatus || ![DoctorLeaveStatus.APPROVED, DoctorLeaveStatus.REJECTED].includes(normalizedStatus as DoctorLeaveStatus)) {
    throw new ApiError(400, "Status must be either 'APPROVED' or 'REJECTED'.");
  }

  const managedHospitalIds = await getAdminHospitalIds(adminUserId, userRole);

  const leave = await DoctorLeave.findOne({
    _id: leaveId,
    hospitalId: { $in: managedHospitalIds },
  });

  if (!leave) {
    throw new ApiError(404, "Leave request not found or you are not authorized to manage this hospital.");
  }

  if (leave.status !== DoctorLeaveStatus.PENDING) {
    throw new ApiError(
      400,
      `Cannot update a leave request that is already '${leave.status}'.`
    );
  }

  const docProfile = await DoctorProfile.findById(leave.doctorId).select("userId").lean();
  const hospital = await Hospital.findById(leave.hospitalId).select("name").lean();

  if (normalizedStatus === DoctorLeaveStatus.REJECTED) {
    if (!rejectionReason || !rejectionReason.trim()) {
      throw new ApiError(400, "A clear rejection reason is required when rejecting a doctor's leave request.");
    }

    leave.status = DoctorLeaveStatus.REJECTED;
    leave.rejectionReason = rejectionReason.trim();
    await leave.save();

    // Restore unbooked slots that were blocked while pending back to AVAILABLE
    const reopenedSlotsCount = await reopenSlotsForLeaveWindow(
      leave.doctorId,
      leave.startDateTime,
      leave.endDateTime
    );

    // Real-time Socket Event: Notify doctor of rejection
    if (docProfile && docProfile.userId) {
      emitToUser(docProfile.userId.toString(), "doctor-leave:status-updated", {
        leaveId: leave._id.toString(),
        status: "REJECTED",
        rejectionReason: leave.rejectionReason,
        hospitalName: hospital?.name || "Hospital Administration",
        startDateTime: leave.startDateTime,
        endDateTime: leave.endDateTime,
      });
    }

    // Real-time Socket Event: Notify hospital admin room of status update
    emitToHospital(leave.hospitalId.toString(), "doctor-leave:status-updated", {
      leaveId: leave._id.toString(),
      status: "REJECTED",
      rejectionReason: leave.rejectionReason,
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        { leave, reopenedSlotsCount },
        `Doctor leave request has been rejected. ${reopenedSlotsCount} blocked slot(s) have been restored to AVAILABLE for patient bookings.`
      )
    );
  }

  // --- APPROVED WORKFLOW ---
  leave.status = DoctorLeaveStatus.APPROVED;
  leave.approvedBy = new mongoose.Types.ObjectId(adminUserId);

  // Process affected active appointments (RESCHEDULE_REQUIRED + 7-day window) & lock slots
  const { affectedCount, affectedAppointments } = await processAppointmentsForApprovedLeave(leave);

  leave.affectedAppointmentsCount = affectedCount;
  await leave.save();

  const populatedLeave = await DoctorLeave.findById(leave._id)
    .populate({
      path: "doctorId",
      select: "department specialization userId",
      populate: { path: "userId", select: "name email phoneNumber" },
    })
    .populate("hospitalId", "name slug address")
    .populate("approvedBy", "name email");

  // Real-time Socket Event: Notify doctor of approval
  if (docProfile && docProfile.userId) {
    emitToUser(docProfile.userId.toString(), "doctor-leave:status-updated", {
      leaveId: leave._id.toString(),
      status: "APPROVED",
      hospitalName: hospital?.name || "Hospital Administration",
      startDateTime: leave.startDateTime,
      endDateTime: leave.endDateTime,
      affectedAppointmentsCount: affectedCount,
    });
  }

  // Real-time Socket Event: Notify hospital admin room of status update
  emitToHospital(leave.hospitalId.toString(), "doctor-leave:status-updated", {
    leaveId: leave._id.toString(),
    status: "APPROVED",
    affectedAppointmentsCount: affectedCount,
  });

  // Real-time Socket Event: Notify each affected patient about priority reschedule window
  const doctorName = (populatedLeave?.doctorId as any)?.userId?.name || "Dr. Specialist";
  for (const appt of affectedAppointments) {
    const patientUserId = appt.patientId?._id || appt.patientId?.userId || appt.patientId;
    if (patientUserId) {
      emitToUser(patientUserId.toString(), "appointment:reschedule-required", {
        appointmentId: appt._id.toString(),
        appointmentNumber: appt.appointmentNumber,
        doctorName,
        doctorLeaveReason: leave.reason || "Doctor on approved leave",
        rescheduleDeadline: appt.rescheduleDeadline,
        date: appt.date,
        time: appt.startTime,
      });
    }
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        leave: populatedLeave,
        affectedAppointmentsCount: affectedCount,
        affectedAppointments: affectedAppointments.map((a) => ({
          _id: a._id,
          appointmentNumber: a.appointmentNumber,
          patientName: a.patientId?.name,
          date: a.date,
          startTime: a.startTime,
          rescheduleDeadline: a.rescheduleDeadline,
        })),
      },
      `Doctor leave approved successfully. ${affectedCount} existing appointment(s) have been placed into a 7-day priority rescheduling window. Patient booking slots are locked.`
    )
  );
});

export const _noopTrailing = asyncHandler(async (_req: Request, res: Response) => {
  return res.status(200).json(
  );
});
