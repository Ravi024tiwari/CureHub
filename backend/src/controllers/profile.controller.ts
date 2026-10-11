import { Request, Response } from "express";
import mongoose from "mongoose";
import { User } from "../models/User.model.js";
import { PatientProfile } from "../models/PatientProfile.model.js";
import { DoctorProfile } from "../models/DoctorProfile.model.js";
import { HospitalAdminProfile } from "../models/HospitalAdminProfile.model.js";
import { UserRole } from "../constants/index.js";
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
    experienceYears,
    consultationFee,
    bio,
    scheduleRules,
  } = req.body;

  if (department && department.trim()) profile.department = department.trim();

  const parsedSpec = safeParse(specialization);
  if (Array.isArray(parsedSpec)) profile.specialization = parsedSpec;

  const parsedQual = safeParse(qualifications);
  if (Array.isArray(parsedQual)) profile.qualifications = parsedQual;

  if (experienceYears !== undefined) profile.experienceYears = Number(experienceYears);
  if (consultationFee !== undefined) profile.consultationFee = Number(consultationFee);
  if (bio !== undefined) profile.bio = bio.trim();

  const parsedRules = safeParse(scheduleRules);
  if (Array.isArray(parsedRules)) profile.scheduleRules = parsedRules;

  await profile.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      { user, profile },
      "Doctor profile updated successfully"
    )
  );
});

/**
 * HOSPITAL ADMIN: Update Profile (Personal info, identity proof, designation)
 */
export const updateHospitalAdminProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User account not found");
    }

    const profile = await HospitalAdminProfile.findOne({ userId });
    if (!profile) {
      throw new ApiError(404, "Hospital admin profile not found");
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

    // 4. Update User fields
    const { name, phoneNumber } = req.body;
    if (name && name.trim()) user.name = name.trim();
    if (phoneNumber && phoneNumber.trim()) user.phoneNumber = phoneNumber.trim();
    await user.save();

    // 5. Update HospitalAdminProfile fields
    const {
      hospitalName,
      designation,
      governmentIdType,
      governmentIdNumber,
      phone,
      email,
      qualifications,
    } = req.body;

    if (hospitalName && hospitalName.trim()) profile.hospitalName = hospitalName.trim();
    if (designation && designation.trim()) profile.designation = designation.trim();
    if (governmentIdType !== undefined) profile.governmentIdType = governmentIdType.trim();
    if (governmentIdNumber !== undefined) profile.governmentIdNumber = governmentIdNumber.trim();
    if (phone !== undefined) profile.phone = phone.trim();
    if (email !== undefined) profile.email = email.toLowerCase().trim();

    const parsedQual = safeParse(qualifications);
    if (Array.isArray(parsedQual)) profile.qualifications = parsedQual;

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
