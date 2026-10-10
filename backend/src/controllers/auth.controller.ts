import { Request, Response } from "express";
import { User } from "../models/User.model.js";
import { PatientProfile } from "../models/PatientProfile.model.js";
import { DoctorProfile } from "../models/DoctorProfile.model.js";
import { Hospital } from "../models/Hospital.model.js";
import { UserRole, VerificationStatus } from "../constants/index.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateToken, getCookieOptions } from "../utils/jwt.js";

const checkDuplicateUser = async (email: string, phoneNumber: string) => {
  const existingUser = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { phoneNumber }],
  });

  if (existingUser) {
    if (existingUser.email === email.toLowerCase()) {
      throw new ApiError(409, "A user with this email already exists");
    }
    throw new ApiError(409, "A user with this phone number already exists");
  }
};


export const registerPatient = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, phoneNumber, avatar } = req.body;

  if (!name || !email || !password || !phoneNumber) {
    throw new ApiError(400, "Name, email, password, and phone number are required.");
  }

  await checkDuplicateUser(email, phoneNumber);

  // 1. Create Base User
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    phoneNumber: phoneNumber.trim(),
    role: UserRole.PATIENT,
    avatar: avatar || "",
    isAccountApproved: true,
  });

  let profile;
  try {
    // 2. Initialize empty Patient Profile (can be completed in Profile Update)
    profile = await PatientProfile.create({
      userId: user._id,
    });
  } catch (error) {
    await User.findByIdAndDelete(user._id);
    throw error;
  }

  // 3. Issue Token & Cookie
  const token = generateToken({
    userId: user._id.toString(),
    role: user.role,
    email: user.email,
  });

  res.cookie("token", token, getCookieOptions());

  return res.status(201).json(
    new ApiResponse(
      201,
      { user, profile, token },
      "Patient registered successfully"
    )
  );
});


export const registerDoctor = asyncHandler(async (req: Request, res: Response) => {
  const {
    name,
    email,
    password,
    phoneNumber,
    avatar,
    hospitalId,
    department,
    medicalCouncilRegistrationNumber,
  } = req.body;

  if (!name || !email || !password || !phoneNumber) {
    throw new ApiError(400, "Name, email, password, and phone number are required.");
  }

  if (!hospitalId || !department || !medicalCouncilRegistrationNumber) {
    throw new ApiError(
      400,
      "Doctor onboarding requires: hospitalId, department, and medicalCouncilRegistrationNumber."
    );
  }

  // Verify affiliated hospital exists
  const targetHospital = await Hospital.findById(hospitalId);
  if (!targetHospital) {
    throw new ApiError(404, "The specified affiliated hospital was not found.");
  }

  // Check if medical council registration number is unique
  const existingLicense = await DoctorProfile.findOne({
    medicalCouncilRegistrationNumber: medicalCouncilRegistrationNumber.trim(),
  });
  if (existingLicense) {
    throw new ApiError(
      409,
      "A doctor with this Medical Council Registration Number already exists."
    );
  }

  await checkDuplicateUser(email, phoneNumber);

  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    phoneNumber: phoneNumber.trim(),
    role: UserRole.DOCTOR,
    avatar: avatar || "",
    isAccountApproved: false, // Must be verified by Super Admin
  });

  let profile;
  try {
    // 2. Initialize Doctor Profile with onboarding essentials
    profile = await DoctorProfile.create({
      userId: user._id,
      hospitalId,
      department: department.trim(),
      medicalCouncilRegistrationNumber: medicalCouncilRegistrationNumber.trim(),
      verificationStatus: VerificationStatus.PENDING,
    });
  } catch (error) {
    await User.findByIdAndDelete(user._id);
    throw error;
  }

  // 3. Issue Token & Cookie
  const token = generateToken({
    userId: user._id.toString(),
    role: user.role,
    email: user.email,
  });

  res.cookie("token", token, getCookieOptions());

  return res.status(201).json(
    new ApiResponse(
      201,
      { user, profile, token },
      "Doctor registered successfully. Account is pending Super Admin verification."
    )
  );
});


export const registerHospitalAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, phoneNumber, avatar } = req.body;

  if (!name || !email || !password || !phoneNumber) {
    throw new ApiError(400, "Name, email, password, and phone number are required.");
  }

  await checkDuplicateUser(email, phoneNumber);

  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    phoneNumber: phoneNumber.trim(),
    role: UserRole.HOSPITAL_ADMIN,
    avatar: avatar || "",
    isAccountApproved: false, // Requires Super Admin approval
  });

  // 2. Issue Token & Cookie
  const token = generateToken({
    userId: user._id.toString(),
    role: user.role,
    email: user.email,
  });

  res.cookie("token", token, getCookieOptions());

  return res.status(201).json(
    new ApiResponse(
      201,
      { user, profile: null, token },
      "Hospital Admin registered successfully. Account is pending Super Admin verification."
    )
  );
});


export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Please provide email and password");
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Your account has been deactivated. Please contact support.");
  }

  let profileData: any = null;
  if (user.role === UserRole.PATIENT) {
    profileData = await PatientProfile.findOne({ userId: user._id });
  } else if (user.role === UserRole.DOCTOR) {
    profileData = await DoctorProfile.findOne({ userId: user._id }).populate("hospitalId", "name slug address");
  } else if (user.role === UserRole.HOSPITAL_ADMIN) {
    profileData = await Hospital.findOne({ hospitalAdminId: user._id });
  }

  const token = generateToken({
    userId: user._id.toString(),
    role: user.role,
    email: user.email,
  });

  res.cookie("token", token, getCookieOptions());

  return res.status(200).json(
    new ApiResponse(
      200,
      { user, profile: profileData, token },
      "Logged in successfully"
    )
  );
});


export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie("token", getCookieOptions());
  return res.status(200).json(new ApiResponse(200, null, "Logged out successfully"));
});


export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User account not found");
  }

  let profileData: any = null;
  if (user.role === UserRole.PATIENT) {
    profileData = await PatientProfile.findOne({ userId: user._id });
  } else if (user.role === UserRole.DOCTOR) {
    profileData = await DoctorProfile.findOne({ userId: user._id }).populate(
      "hospitalId",
      "name slug address verificationStatus"
    );
  } else if (user.role === UserRole.HOSPITAL_ADMIN) {
    profileData = await Hospital.findOne({ hospitalAdminId: user._id });
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      { user, profile: profileData },
      "Profile retrieved successfully"
    )
  );
});
