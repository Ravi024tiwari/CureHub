import { Request, Response } from "express";
import mongoose from "mongoose";
import { Hospital } from "../models/Hospital.model.js";
import { HospitalAdminProfile } from "../models/HospitalAdminProfile.model.js";
import { VerificationStatus } from "../constants/index.js";
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
