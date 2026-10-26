import { Request, Response } from "express";
import mongoose from "mongoose";
import { User } from "../models/User.model.js";
import { PatientProfile } from "../models/PatientProfile.model.js";
import { DoctorProfile } from "../models/DoctorProfile.model.js";
import { HospitalAdminProfile } from "../models/HospitalAdminProfile.model.js";
import { UserRole, VerificationStatus } from "../constants/index.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadFileToS3, deleteFileFromS3 } from "../utils/s3.util.js";

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
 * PATIENT: Update Profile (Personal info, address, medical history, avatar)
 */
export const updatePatientProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

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
    phoneNumber,
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

  // 1. Handle Avatar upload to S3
  if (req.file) {
    const s3Result = await uploadFileToS3(req.file, "avatars/patients", `patient-${userId}`);
    // Clean up old avatar from S3 if exists
    if (user.avatar && user.avatar.includes("amazonaws.com")) {
      await deleteFileFromS3(user.avatar);
    }
    user.avatar = s3Result.url;
  }

  // 2. Update base User fields
  if (name && name.trim()) user.name = name.trim();
  if (phoneNumber && phoneNumber.trim()) user.phoneNumber = phoneNumber.trim();
  await user.save();

  // 3. Update PatientProfile fields
  if (dateOfBirth) profile.dateOfBirth = new Date(dateOfBirth);
  if (gender) profile.gender = gender;
  if (bloodGroup) profile.bloodGroup = bloodGroup;

  const parsedAddress = safeParse(address);
  if (parsedAddress) {
    profile.address = {
      street: parsedAddress.street ?? profile.address?.street ?? "",
      city: parsedAddress.city ?? profile.address?.city ?? "",
      state: parsedAddress.state ?? profile.address?.state ?? "",
      zipCode: parsedAddress.zipCode ?? profile.address?.zipCode ?? "",
      country: parsedAddress.country ?? profile.address?.country ?? "India",
    };
  }

  const parsedAllergies = safeParse(allergies);
  if (Array.isArray(parsedAllergies)) profile.allergies = parsedAllergies;

  const parsedChronic = safeParse(chronicDiseases);
  if (Array.isArray(parsedChronic)) profile.chronicDiseases = parsedChronic;

  const parsedSurgeries = safeParse(pastSurgeries);
  if (Array.isArray(parsedSurgeries)) profile.pastSurgeries = parsedSurgeries;

  const parsedMeds = safeParse(currentMedications);
  if (Array.isArray(parsedMeds)) profile.currentMedications = parsedMeds;

  const parsedEmergency = safeParse(emergencyContact);
  if (parsedEmergency) {
    profile.emergencyContact = {
      name: parsedEmergency.name ?? profile.emergencyContact?.name ?? "",
      relationship:
        parsedEmergency.relationship ?? profile.emergencyContact?.relationship ?? "",
      phoneNumber:
        parsedEmergency.phoneNumber ?? profile.emergencyContact?.phoneNumber ?? "",
    };
  }

  await profile.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      { user, profile },
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
