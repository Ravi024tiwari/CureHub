import { Request, Response } from "express";
import mongoose from "mongoose";
import { User } from "../models/User.model.js";
import { PatientProfile } from "../models/PatientProfile.model.js";
import { DoctorProfile } from "../models/DoctorProfile.model.js";
import { HospitalAdminProfile } from "../models/HospitalAdminProfile.model.js";
import { UserRole, VerificationStatus, Gender, BloodGroup } from "../constants/index.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadFileToS3, deleteFileFromS3 } from "../utils/s3.util.js";
import { emitToSuperAdmins } from "../services/socket.service.js";

/**
 * Helper to safely parse multipart form array/object fields
 */
const safeParse = (data: any, fallback: any = undefined) => {
  if (data === undefined || data === null) return fallback;
  if (typeof data !== "string") return data;
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
};

/**
 * Helper to safely parse string array fields from JSON array, stringified JSON, or comma-separated string
 */
const parseStringArray = (data: any): string[] | undefined => {
  if (data === undefined) return undefined;
  if (data === null || data === "") return [];
  const parsed = safeParse(data);
  if (Array.isArray(parsed)) {
    return parsed.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof parsed === "string") {
    return parsed.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return undefined;
};

/**
 * PATIENT: Get Logged-in Patient Profile (User identity + PatientProfile clinical details)
 */
export const getPatientProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    throw new ApiError(401, "Unauthorized: Authentication required");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID format");
  }

  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw new ApiError(404, "User account not found");
  }

  let profile = await PatientProfile.findOne({ userId });
  if (!profile) {
    profile = await PatientProfile.create({ userId });
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      { user, profile },
      "Patient profile retrieved successfully"
    )
  );
});

/**
 * PATIENT: Update Profile (Personal info, address, medical history, avatar)
 */
export const updatePatientProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    throw new ApiError(401, "Unauthorized: Authentication required");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID format");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User account not found");
  }

  let profile = await PatientProfile.findOne({ userId });
  if (!profile) {
    profile = await PatientProfile.create({ userId });
  }

  const {
    name,
    email,
    phoneNumber,
    avatar,
    dateOfBirth,
    gender,
    bloodGroup,
    address,
    allergies,
    chronicDiseases,
    pastSurgeries,
    currentMedications,
    emergencyContact,
  } = req.body;


  if (name !== undefined) {
    const trimmedName = String(name).trim();
    if (!trimmedName) {
      throw new ApiError(400, "Name cannot be empty");
    }
    if (trimmedName.length > 100) {
      throw new ApiError(400, "Name cannot exceed 100 characters");
    }
    user.name = trimmedName;
  }

  if (email !== undefined) {
    const trimmedEmail = String(email).trim().toLowerCase();
    if (!trimmedEmail) {
      throw new ApiError(400, "Email cannot be empty");
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmedEmail)) {
      throw new ApiError(400, "Please provide a valid email address");
    }
    if (trimmedEmail !== user.email) {
      const emailInUse = await User.findOne({
        email: trimmedEmail,
        _id: { $ne: userId },
      });
      if (emailInUse) {
        throw new ApiError(409, "Email address is already registered by another account");
      }
      user.email = trimmedEmail;
      user.isEmailVerified = false;
    }
  }

  // Phone Number update (with duplicate check & standard format check)
  if (phoneNumber !== undefined) {
    const trimmedPhone = String(phoneNumber).trim();
    if (!trimmedPhone) {
      throw new ApiError(400, "Phone number cannot be empty");
    }
    const phoneDigits = trimmedPhone.replace(/[\s-]/g, "");
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(phoneDigits)) {
      throw new ApiError(400, "Please provide a valid 10-15 digit phone number");
    }
    if (trimmedPhone !== user.phoneNumber) {
      const phoneInUse = await User.findOne({
        phoneNumber: trimmedPhone,
        _id: { $ne: userId },
      });
      if (phoneInUse) {
        throw new ApiError(409, "Phone number is already registered by another account");
      }
      user.phoneNumber = trimmedPhone;
    }
  }

  // Avatar upload via multipart file OR avatar URL string in body
  if (req.file) {
    try {
      const s3Result = await uploadFileToS3(req.file, "avatars/patients", `patient-${userId}`);
      if (user.avatar && user.avatar.includes("amazonaws.com")) {
        await deleteFileFromS3(user.avatar).catch((delErr) =>
          console.warn("Could not delete old avatar from S3:", delErr)
        );
      }
      user.avatar = s3Result.url;
    } catch (s3Err) {
      console.warn("Failed uploading avatar to AWS S3, falling back to data URL:", s3Err);
      user.avatar = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    }
  } else if (avatar !== undefined) {
    user.avatar = typeof avatar === "string" ? avatar.trim() : "";
  }

  // ─────────────────────────────────────────────────────────────────
  // VALIDATE & UPDATE PATIENT PROFILE CLINICAL FIELDS
  // ─────────────────────────────────────────────────────────────────

  // Date of Birth
  if (dateOfBirth !== undefined) {
    if (!dateOfBirth || dateOfBirth === "null" || dateOfBirth === "undefined") {
      profile.dateOfBirth = null as any;
    } else {
      const parsedDate = new Date(dateOfBirth);
      if (isNaN(parsedDate.getTime())) {
        throw new ApiError(400, "Invalid date of birth format. Please use YYYY-MM-DD");
      }
      if (parsedDate > new Date()) {
        throw new ApiError(400, "Date of birth cannot be in the future");
      }
      if (parsedDate.getFullYear() < 1900) {
        throw new ApiError(400, "Please provide a valid date of birth after 1900");
      }
      profile.dateOfBirth = parsedDate;
    }
  }

  // Gender
  if (gender !== undefined) {
    if (!gender || gender === "null" || gender === "undefined") {
      profile.gender = null as any;
    } else {
      const normalizedGender = String(gender).trim().toUpperCase();
      if (!Object.values(Gender).includes(normalizedGender as Gender)) {
        throw new ApiError(
          400,
          `Invalid gender. Allowed values: ${Object.values(Gender).join(", ")}`
        );
      }
      profile.gender = normalizedGender as Gender;
    }
  }

  // Blood Group
  if (bloodGroup !== undefined) {
    if (!bloodGroup || bloodGroup === "null" || bloodGroup === "undefined") {
      profile.bloodGroup = null as any;
    } else {
      const normalizedBlood = String(bloodGroup).trim().toUpperCase();
      if (!Object.values(BloodGroup).includes(normalizedBlood as BloodGroup)) {
        throw new ApiError(
          400,
          `Invalid blood group. Allowed values: ${Object.values(BloodGroup).join(", ")}`
        );
      }
      profile.bloodGroup = normalizedBlood as BloodGroup;
    }
  }

  // Address (handles nested object, stringified JSON, or flat street/city/state/zipCode/country fields)
  let rawAddress = safeParse(address);
  if (!rawAddress || typeof rawAddress !== "object") {
    if (
      req.body.street !== undefined ||
      req.body.city !== undefined ||
      req.body.state !== undefined ||
      req.body.zipCode !== undefined ||
      req.body.country !== undefined
    ) {
      rawAddress = {
        street: req.body.street,
        city: req.body.city,
        state: req.body.state,
        zipCode: req.body.zipCode,
        country: req.body.country,
      };
    }
  }

  if (rawAddress && typeof rawAddress === "object") {
    profile.address = {
      street:
        rawAddress.street !== undefined
          ? String(rawAddress.street).trim()
          : (profile.address?.street || ""),
      city:
        rawAddress.city !== undefined
          ? String(rawAddress.city).trim()
          : (profile.address?.city || ""),
      state:
        rawAddress.state !== undefined
          ? String(rawAddress.state).trim()
          : (profile.address?.state || ""),
      zipCode:
        rawAddress.zipCode !== undefined
          ? String(rawAddress.zipCode).trim()
          : (profile.address?.zipCode || ""),
      country:
        rawAddress.country !== undefined
          ? String(rawAddress.country).trim()
          : (profile.address?.country || "India"),
    };
  }

  // Clinical Arrays (handles Array, stringified JSON, or comma-separated string)
  const parsedAllergies = parseStringArray(allergies);
  if (parsedAllergies !== undefined) profile.allergies = parsedAllergies;

  const parsedChronic = parseStringArray(chronicDiseases);
  if (parsedChronic !== undefined) profile.chronicDiseases = parsedChronic;

  const parsedSurgeries = parseStringArray(pastSurgeries);
  if (parsedSurgeries !== undefined) profile.pastSurgeries = parsedSurgeries;

  const parsedMeds = parseStringArray(currentMedications);
  if (parsedMeds !== undefined) profile.currentMedications = parsedMeds;

  // Emergency Contact (handles nested object, stringified JSON, or flat emergencyContactName/Phone fields)
  let rawEmergency = safeParse(emergencyContact);
  if (!rawEmergency || typeof rawEmergency !== "object") {
    if (
      req.body.emergencyContactName !== undefined ||
      req.body.emergencyContactRelationship !== undefined ||
      req.body.emergencyContactPhone !== undefined
    ) {
      rawEmergency = {
        name: req.body.emergencyContactName,
        relationship: req.body.emergencyContactRelationship,
        phoneNumber: req.body.emergencyContactPhone,
      };
    }
  }

  if (rawEmergency && typeof rawEmergency === "object") {
    profile.emergencyContact = {
      name:
        rawEmergency.name !== undefined
          ? String(rawEmergency.name).trim()
          : (profile.emergencyContact?.name || ""),
      relationship:
        rawEmergency.relationship !== undefined
          ? String(rawEmergency.relationship).trim()
          : (profile.emergencyContact?.relationship || ""),
      phoneNumber:
        rawEmergency.phoneNumber !== undefined
          ? String(rawEmergency.phoneNumber).trim()
          : (profile.emergencyContact?.phoneNumber || ""),
    };
  }

  // ─────────────────────────────────────────────────────────────────
  // 3. PERSIST BOTH USER & PATIENT PROFILE DOCUMENTS
  // ─────────────────────────────────────────────────────────────────
  await user.save();
  await profile.save();

  // Return clean, sanitized response without password
  const userObj = user.toJSON();

  return res.status(200).json(
    new ApiResponse(
      200,
      { user: userObj, profile },
      "Patient profile updated successfully"
    )
  );
});

/**
 * PATIENT: Upload a new medical report to S3
 */
export const uploadPatientReport = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { title, category } = req.body;

  if (!req.file) {
    throw new ApiError(400, "Medical report file is required (PDF or image)");
  }

  if (!title || !title.trim()) {
    throw new ApiError(400, "Report title is required");
  }

  const profile = await PatientProfile.findOne({ userId });
  if (!profile) {
    throw new ApiError(404, "Patient profile not found");
  }

  // Upload report to S3
  const s3Result = await uploadFileToS3(
    req.file,
    "medical-reports",
    `report-${userId}`
  );

  const fileType = req.file.mimetype.includes("pdf") ? "PDF" : "IMAGE";

  const newReport = {
    title: title.trim(),
    fileUrl: s3Result.url,
    fileType,
    category: category?.trim() || "General",
    uploadedAt: new Date(),
  };

  profile.reports.push(newReport as any);
  await profile.save();

  return res.status(201).json(
    new ApiResponse(
      201,
      { report: profile.reports[profile.reports.length - 1] },
      "Medical report uploaded successfully"
    )
  );
});

/**
 * PATIENT: Delete a medical report
 */
export const deletePatientReport = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { reportId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(reportId)) {
    throw new ApiError(400, "Invalid report ID");
  }

  const profile = await PatientProfile.findOne({ userId });
  if (!profile) {
    throw new ApiError(404, "Patient profile not found");
  }

  const reportIndex = profile.reports.findIndex(
    (r: any) => r._id.toString() === reportId
  );

  if (reportIndex === -1) {
    throw new ApiError(404, "Report not found");
  }

  const reportToDelete = profile.reports[reportIndex];

  // Delete from S3
  if (reportToDelete.fileUrl) {
    await deleteFileFromS3(reportToDelete.fileUrl);
  }

  profile.reports.splice(reportIndex, 1);
  await profile.save();

  return res.status(200).json(
    new ApiResponse(200, null, "Medical report deleted successfully")
  );
});

/**
 * DOCTOR: Update Profile (Personal info, qualifications, bio, schedule, documents)
 */
export const updateDoctorProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User account not found");
  }

  const profile = await DoctorProfile.findOne({ userId });
  if (!profile) {
    throw new ApiError(404, "Doctor profile not found");
  }

  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

  // 1. Upload Avatar if provided
  if (files?.avatar && files.avatar[0]) {
    const avatarResult = await uploadFileToS3(
      files.avatar[0],
      "avatars/doctors",
      `doctor-${userId}`
    );
    if (user.avatar && user.avatar.includes("amazonaws.com")) {
      await deleteFileFromS3(user.avatar);
    }
    user.avatar = avatarResult.url;
  }

  // 2. Upload Medical Council License Document proof if provided
  if (files?.licenseDocument && files.licenseDocument[0]) {
    const docResult = await uploadFileToS3(
      files.licenseDocument[0],
      "licenses/doctors",
      `license-${userId}`
    );
    if (profile.licenseDocumentUrl && profile.licenseDocumentUrl.includes("amazonaws.com")) {
      await deleteFileFromS3(profile.licenseDocumentUrl);
    }
    profile.licenseDocumentUrl = docResult.url;
  }

  // 3. Update User fields
  const { name, phoneNumber } = req.body;
  if (name && name.trim()) user.name = name.trim();
  if (phoneNumber && phoneNumber.trim()) user.phoneNumber = phoneNumber.trim();
  await user.save();

  // 4. Update DoctorProfile fields
  const {
    department,
    specialization,
    qualifications,
    medicalCouncilRegistrationNumber,
    licenseDocumentUrl,
    experienceYears,
    consultationFee,
    bio,
    scheduleRules,
    isSubmit,
  } = req.body;

  if (department && department.trim()) profile.department = department.trim();
  if (medicalCouncilRegistrationNumber && medicalCouncilRegistrationNumber.trim()) {
    profile.medicalCouncilRegistrationNumber = medicalCouncilRegistrationNumber.trim();
  }
  if (licenseDocumentUrl && licenseDocumentUrl.trim()) {
    profile.licenseDocumentUrl = licenseDocumentUrl.trim();
  }

  const parsedSpec = safeParse(specialization);
  if (Array.isArray(parsedSpec)) profile.specialization = parsedSpec;

  const parsedQual = safeParse(qualifications);
  if (Array.isArray(parsedQual)) profile.qualifications = parsedQual;

  if (experienceYears !== undefined) profile.experienceYears = Number(experienceYears);
  if (consultationFee !== undefined) profile.consultationFee = Number(consultationFee);
  if (bio !== undefined) profile.bio = bio.trim();

  const parsedRules = safeParse(scheduleRules);
  if (Array.isArray(parsedRules)) profile.scheduleRules = parsedRules;

  const shouldSubmit = isSubmit === true || isSubmit === "true";

  if (shouldSubmit) {
    if (profile.verificationStatus === VerificationStatus.APPROVED) {
      throw new ApiError(400, "Your doctor profile is already verified and approved by the Super Admin.");
    }

    const missingFields: string[] = [];
    if (!profile.department || !profile.department.trim()) missingFields.push("Department");
    if (!profile.medicalCouncilRegistrationNumber || !profile.medicalCouncilRegistrationNumber.trim()) {
      missingFields.push("Medical Council Registration Number");
    }
    if (!profile.licenseDocumentUrl || !profile.licenseDocumentUrl.trim()) {
      missingFields.push("License / Registration Proof Document");
    }
    if (!Array.isArray(profile.specialization) || profile.specialization.length === 0) {
      missingFields.push("At least one Specialization");
    }
    if (!Array.isArray(profile.qualifications) || profile.qualifications.length === 0) {
      missingFields.push("At least one Qualification / Degree");
    }
    if (profile.consultationFee === undefined || profile.consultationFee < 0) {
      missingFields.push("Valid Consultation Fee");
    }

    if (missingFields.length > 0) {
      throw new ApiError(
        400,
        `Cannot submit for verification. Please complete the following required fields: ${missingFields.join(", ")}`
      );
    }

    profile.verificationStatus = VerificationStatus.PENDING;
    profile.isSubmitted = true;
    profile.submittedAt = new Date();
    profile.rejectionReason = "";
  }

  await profile.save();

  const message = shouldSubmit
    ? "Doctor profile submitted for Super Admin verification successfully."
    : "Doctor profile updated successfully.";

  return res.status(200).json(
    new ApiResponse(
      200,
      { user, profile },
      message
    )
  );
});

/**
 * HOSPITAL ADMIN: Update Profile (Personal info, identity proof, designation)
 */
/**
 * HOSPITAL ADMIN: Get Profile
 */
export const getHospitalAdminProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User account not found");
    }

    let profile = await HospitalAdminProfile.findOne({ userId })
      .populate("hospitalId")
      .populate("userId", "name email phoneNumber avatar isAccountApproved");
    if (!profile) {
      profile = await HospitalAdminProfile.create({
        userId: user._id,
        designation: "Hospital Administrator",
        verificationStatus: VerificationStatus.PENDING,
      });
      profile = await HospitalAdminProfile.findById(profile._id)
        .populate("hospitalId")
        .populate("userId", "name email phoneNumber avatar isAccountApproved");
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        { user, profile },
        "Hospital Admin profile retrieved successfully"
      )
    );
  }
);

/**
 * HOSPITAL ADMIN: Update Profile / Onboarding Details
 */
export const updateHospitalAdminProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User account not found");
    }

    let profile = await HospitalAdminProfile.findOne({ userId });
    if (!profile) {
      profile = await HospitalAdminProfile.create({
        userId: user._id,
        designation: "Hospital Administrator",
        verificationStatus: VerificationStatus.PENDING,
      });
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    // 1. Upload Avatar if provided
    if (files?.avatar && files.avatar[0]) {
      const avatarResult = await uploadFileToS3(
        files.avatar[0],
        "avatars/hospital-admins",
        `hadmin-${userId}`
      );
      if (user.avatar && user.avatar.includes("amazonaws.com")) {
        await deleteFileFromS3(user.avatar);
      }
      user.avatar = avatarResult.url;
    }

    // 2. Upload Identity Proof if provided
    if (files?.identityProof && files.identityProof[0]) {
      const idResult = await uploadFileToS3(
        files.identityProof[0],
        "proofs/hospital-admins",
        `id-proof-${userId}`
      );
      if (profile.identityProofUrl && profile.identityProofUrl.includes("amazonaws.com")) {
        await deleteFileFromS3(profile.identityProofUrl);
      }
      profile.identityProofUrl = idResult.url;
    }

    // 3. Upload Authorization Letter if provided
    if (files?.authorizationLetter && files.authorizationLetter[0]) {
      const authResult = await uploadFileToS3(
        files.authorizationLetter[0],
        "proofs/hospital-admins",
        `auth-letter-${userId}`
      );
      if (
        profile.authorizationLetterUrl &&
        profile.authorizationLetterUrl.includes("amazonaws.com")
      ) {
        await deleteFileFromS3(profile.authorizationLetterUrl);
      }
      profile.authorizationLetterUrl = authResult.url;
    }

    // 4. Upload Additional Document if provided
    if (files?.additionalDoc && files.additionalDoc[0]) {
      const addDocResult = await uploadFileToS3(
        files.additionalDoc[0],
        "proofs/hospital-admins",
        `add-doc-${userId}`
      );
      if (
        profile.additionalDocUrl &&
        profile.additionalDocUrl.includes("amazonaws.com")
      ) {
        await deleteFileFromS3(profile.additionalDocUrl);
      }
      profile.additionalDocUrl = addDocResult.url;
    }

    // 5. Update User fields (Single Source of Truth for identity and contact)
    const { name, phoneNumber, phone, avatarUrl } = req.body;
    if (name && name.trim()) user.name = name.trim();
    const contactPhone = (phoneNumber || phone || "").trim();
    if (contactPhone) user.phoneNumber = contactPhone;
    if (avatarUrl && avatarUrl.trim()) user.avatar = avatarUrl.trim();
    await user.save();

    // 6. Update HospitalAdminProfile fields (Hospital & Verification specific)
    const {
      hospitalName,
      hospitalRegistrationNumber,
      hospitalType,
      hospitalAddress,
      numberOfBeds,
      designation,
      governmentIdType,
      governmentIdNumber,
      alternatePhone,
      address,
      identityProofUrl,
      authorizationLetterUrl,
      additionalDocUrl,
      qualifications,
      isSubmitted,
    } = req.body;

    if (hospitalName !== undefined) profile.hospitalName = hospitalName.trim();
    if (hospitalRegistrationNumber !== undefined) {
      profile.hospitalRegistrationNumber = hospitalRegistrationNumber.trim() || undefined;
    }
    if (hospitalType !== undefined) profile.hospitalType = hospitalType.trim();
    if (hospitalAddress !== undefined) profile.hospitalAddress = hospitalAddress.trim();
    if (numberOfBeds !== undefined && numberOfBeds !== "") {
      profile.numberOfBeds = Number(numberOfBeds) || undefined;
    }
    if (designation && designation.trim()) profile.designation = designation.trim();
    if (governmentIdType !== undefined) profile.governmentIdType = governmentIdType.trim();
    if (governmentIdNumber !== undefined) profile.governmentIdNumber = governmentIdNumber.trim();
    if (alternatePhone !== undefined) profile.alternatePhone = alternatePhone.trim();
    if (address !== undefined) profile.address = address.trim();
    if (identityProofUrl && identityProofUrl.trim()) profile.identityProofUrl = identityProofUrl.trim();
    if (authorizationLetterUrl && authorizationLetterUrl.trim()) {
      profile.authorizationLetterUrl = authorizationLetterUrl.trim();
    }
    if (additionalDocUrl && additionalDocUrl.trim()) {
      profile.additionalDocUrl = additionalDocUrl.trim();
    }

    const parsedQual = safeParse(qualifications);
    if (Array.isArray(parsedQual)) profile.qualifications = parsedQual;

    if (isSubmitted === true || isSubmitted === "true") {
      profile.isSubmitted = true;
      profile.submittedAt = new Date();
      profile.verificationStatus = VerificationStatus.PENDING;

      // Real-time Socket Event: Alert Super Admins of hospital admin verification submission
      emitToSuperAdmins("verification:hospital-admin:submitted", {
        adminProfileId: profile._id.toString(),
        adminUserId: userId,
        adminName: user?.name || "Hospital Admin",
        submittedAt: profile.submittedAt,
      });
    }

    await profile.save();

    return res.status(200).json(
      new ApiResponse(
        200,
        { user, profile },
        "Hospital Admin profile updated successfully"
      )
    );
  }
);
