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
  const limit = Math.max(1, Math.min(50, parseInt(req.query.limit as string) || 10));
  const skip = (page - 1) * limit;

  const { search, status, city, isActive, sortBy } = req.query;

  // Primary filter scoped strictly to hospitals owned by this admin
  const filter: any = {
    hospitalAdminId: new mongoose.Types.ObjectId(adminUserId),
  };

  // Status Filter (PENDING, APPROVED, REJECTED, SUSPENDED)
  if (status && typeof status === "string" && status.toUpperCase() !== "ALL") {
    filter.verificationStatus = status.toUpperCase();
  }

  // Active / Deactivated toggle
  if (isActive !== undefined && isActive !== "ALL") {
    filter.isActive = isActive === "true";
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
          approvedHospitals: {
            $sum: { $cond: [{ $eq: ["$verificationStatus", VerificationStatus.APPROVED] }, 1, 0] },
          },
          pendingHospitals: {
            $sum: { $cond: [{ $eq: ["$verificationStatus", VerificationStatus.PENDING] }, 1, 0] },
          },
          totalBeds: { $sum: { $ifNull: ["$totalBeds", 0] } },
        },
      },
    ]),

    // Lean hospital cards query with essential display fields only
    Hospital.find(filter)
      .select(
        "name slug licenseNumber verificationStatus isActive images.coverImage address.city address.state address.street contactPhone contactEmail departments totalBeds isEmergency24x7 createdAt hospitalType rating"
      )
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean(),

    Hospital.countDocuments(filter),
  ]);

  const kpis = adminStatsAgg[0] || {
    totalHospitals: 0,
    approvedHospitals: 0,
    pendingHospitals: 0,
    totalBeds: 0,
  };

  // Efficient batch doctor count for the returned page items in ONE single O(1) query
  const hospitalIds = hospitals.map((h) => h._id);
  const doctorCountsAgg = await DoctorProfile.aggregate([
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
  ]);

  const doctorCountsMap = new Map<string, number>();
  doctorCountsAgg.forEach((item) => {
    doctorCountsMap.set(item._id.toString(), item.count);
  });

  const enrichedHospitals = hospitals.map((h) => ({
    ...h,
    doctorCount: doctorCountsMap.get(h._id.toString()) || 0,
  }));

  const totalPages = Math.ceil(totalDocs / limit) || 1;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        kpis: {
          totalHospitals: kpis.totalHospitals,
          approvedHospitals: kpis.approvedHospitals,
          pendingHospitals: kpis.pendingHospitals,
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

// get hospital detail by id (with lightweight doctor card fields & metrics)
export const getHospitalDetailById = asyncHandler(async (req: Request, res: Response) => {
  const adminUserId = req.user?.userId;
  const { id } = req.params;

  if (!adminUserId) {
    throw new ApiError(401, "Authentication required");
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid hospital ID format");
  }

  const hospital = await Hospital.findById(id)
    .populate("hospitalAdminId", "name email phoneNumber avatar")
    .populate("verifiedBy", "name email");

  if (!hospital) {
    throw new ApiError(404, "Hospital not found");
  }

  // Ownership security check: verify that this hospital belongs to the logged-in admin
  if (hospital.hospitalAdminId._id.toString() !== adminUserId.toString()) {
    throw new ApiError(403, "Access denied. You do not have permission to manage this hospital.");
  }


  const [doctors, pendingRequestsCount, pendingRequests] = await Promise.all([
    DoctorProfile.find({
      hospitalId: hospital._id,
      hospitalAffiliationStatus: "APPROVED",
    })
      .populate("userId", "name email phoneNumber avatar")
      .select(
        "userId department specialization experienceYears consultationFee ratingAverage medicalCouncilRegistrationNumber hospitalAffiliationStatus createdAt"
      )
      .sort({ createdAt: -1 })
      .lean(),

    HospitalJoinRequest.countDocuments({
      hospitalId: hospital._id,
      status: JoinRequestStatus.PENDING,
    }),

    HospitalJoinRequest.find({
      hospitalId: hospital._id,
      status: JoinRequestStatus.PENDING,
    })
      .populate("doctorUserId", "name email phoneNumber avatar")
      .select("doctorId doctorUserId department message status createdAt")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
  ]);

  // Aggregate in-memory department distribution from doctors
  const departmentCounts: Record<string, number> = {};
  doctors.forEach((doc) => {
    const dept = doc.department || "General Medicine";
    departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
  });

  const departmentsDistribution = Object.entries(departmentCounts).map(([department, count]) => ({
    department,
    doctorCount: count,
  }));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        hospital,
        doctors,
        totalDoctors: doctors.length,
        pendingRequestsCount,
        pendingRequests,
        departmentsDistribution,
      },
      "Hospital detail retrieved successfully"
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

  // 4. Create Hospital Document
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
    hospitalType: hospitalType?.trim() || "Multispeciality Hospital",
    facilities: Array.isArray(facilities) ? facilities : ["Pharmacy", "Emergency Unit", "Ambulance"],
    description: description?.trim() || "",
    verificationStatus: VerificationStatus.PENDING,
    isActive: true,
  });

  // Link newly created hospital to HospitalAdminProfile if one exists
  await HospitalAdminProfile.findOneAndUpdate(
    { userId: adminUserId },
    { hospitalId: hospital._id, hospitalName: hospital.name }
  );

  return res.status(201).json(
    new ApiResponse(
      201,
      hospital,
      "Hospital profile created successfully. It is now submitted for Super Admin verification."
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
    isActive,
  } = req.body;

  // Name & Slug update
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
  if (hospitalType !== undefined) hospital.hospitalType = hospitalType.trim();
  if (Array.isArray(facilities)) hospital.facilities = facilities;
  if (description !== undefined) hospital.description = description.trim();
  if (licenseDocumentUrl !== undefined) {
    hospital.licenseDocumentUrl = licenseDocumentUrl.trim();
  }
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
        "department specialization qualifications experienceYears consultationFee ratingAverage medicalCouncilRegistrationNumber",
    })
    .populate("doctorUserId", "name email phoneNumber avatar")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, joinRequests, "Doctor join requests retrieved successfully")
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

