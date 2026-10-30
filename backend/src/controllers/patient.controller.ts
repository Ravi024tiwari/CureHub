import { Request, Response } from "express";
import path from "path";
import mongoose from "mongoose";
import { Appointment } from "../models/Appointment.model.js";
import { Payment } from "../models/Payment.model.js";
import { PatientProfile } from "../models/PatientProfile.model.js";
import { AppointmentStatus, PaymentStatus, Gender, BloodGroup } from "../constants/index.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadFileToS3 } from "../utils/s3.util.js";

/**
 * Patient: Comprehensive Dashboard Overview
 * Returns quick stats, next upcoming appointment card, and recent activity
 */
export const getPatientDashboard = asyncHandler(async (req: Request, res: Response) => {
  const patientId = new mongoose.Types.ObjectId(req.user?.userId);
  const todayStr = new Date().toISOString().split("T")[0];

  // Parallel execution of dashboard statistics for maximum performance
  const [
    totalBooked,
    upcomingCount,
    completedCount,
    cancelledCount,
    paymentStats,
    patientProfile,
    nextAppointment,
    recentAppointments,
  ] = await Promise.all([
    Appointment.countDocuments({ patientId }),
    Appointment.countDocuments({
      patientId,
      date: { $gte: todayStr },
      status: {
        $in: [
          AppointmentStatus.CONFIRMED,
          AppointmentStatus.PENDING_PAYMENT,
          AppointmentStatus.CHECKED_IN,
        ],
      },
    }),
    Appointment.countDocuments({ patientId, status: AppointmentStatus.COMPLETED }),
    Appointment.countDocuments({
      patientId,
      status: {
        $in: [
          AppointmentStatus.CANCELLED_BY_PATIENT,
          AppointmentStatus.CANCELLED_BY_DOCTOR,
        ],
      },
    }),
    Payment.aggregate([
      {
        $match: {
          patientId,
          status: PaymentStatus.COMPLETED,
        },
      },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: "$amount" },
        },
      },
    ]),
    PatientProfile.findOne({ userId: patientId }).select("reports"),
    // Next upcoming appointment card
    Appointment.findOne({
      patientId,
      date: { $gte: todayStr },
      status: {
        $in: [
          AppointmentStatus.CONFIRMED,
          AppointmentStatus.PENDING_PAYMENT,
          AppointmentStatus.CHECKED_IN,
        ],
      },
    })
      .sort({ date: 1, startTime: 1 })
      .populate({
        path: "doctorId",
        select: "department specialization consultationFee ratingAverage",
        populate: { path: "userId", select: "name avatar phoneNumber" },
      })
      .populate("hospitalId", "name slug address contactPhone"),
    // Last 5 recent appointments
    Appointment.find({ patientId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({
        path: "doctorId",
        select: "department specialization",
        populate: { path: "userId", select: "name avatar" },
      })
      .populate("hospitalId", "name address"),
  ]);

  const totalSpent = paymentStats.length > 0 ? paymentStats[0].totalSpent : 0;
  const totalReports = patientProfile?.reports?.length || 0;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        statistics: {
          totalBooked,
          upcomingCount,
          completedCount,
          cancelledCount,
          totalSpent,
          totalReports,
        },
        nextAppointment,
        recentAppointments,
      },
      "Patient dashboard data retrieved successfully"
    )
  );
});

/**
 * Fetches all completed consultation prescriptions across all appointments
 */
export const getPatientPrescriptions = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.user?.userId;
  if (!patientId) throw new ApiError(401, "Unauthorized");

  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.max(1, Math.min(50, parseInt(req.query.limit as string) || 10));
  const skip = (page - 1) * limit;

  const query = {
    patientId: new mongoose.Types.ObjectId(patientId),
    status: AppointmentStatus.COMPLETED,
    "prescription.issuedAt": { $exists: true },
  };

  const [totalCount, appointments] = await Promise.all([
    Appointment.countDocuments(query),
    Appointment.find(query)
      .select("appointmentNumber date startTime endTime symptoms type prescription doctorId hospitalId createdAt")
      .populate({
        path: "doctorId",
        select: "department specialization qualifications consultationFee ratingAverage",
        populate: { path: "userId", select: "name avatar email phoneNumber" },
      })
      .populate("hospitalId", "name slug address contactPhone contactEmail")
      .sort({ "prescription.issuedAt": -1 })
      .skip(skip)
      .limit(limit),
  ]);

  // Transform into clean prescription locker card models
  const prescriptions = appointments.map((appt) => {
    const doc = appt.doctorId as any;
    const hosp = appt.hospitalId as any;
    const rx = appt.prescription;

    return {
      appointmentId: appt._id,
      appointmentNumber: appt.appointmentNumber,
      consultationDate: appt.date,
      consultationTime: `${appt.startTime} - ${appt.endTime}`,
      consultationType: appt.type,
      symptoms: appt.symptoms,
      prescription: {
        diagnosis: rx?.diagnosis || "Consultation Completed",
        issuedAt: rx?.issuedAt,
        medicinesCount: rx?.medicines?.length || 0,
        medicines: rx?.medicines || [],
        notes: rx?.notes || "",
      },
      doctor: {
        id: doc?._id,
        name: doc?.userId?.name ? `Dr. ${doc.userId.name}` : "Doctor",
        avatar: doc?.userId?.avatar || null,
        department: doc?.department || "General",
        qualifications: doc?.qualifications || [],
        specialization: doc?.specialization || [],
      },
      hospital: hosp
        ? {
            id: hosp._id,
            name: hosp.name,
            address: hosp.address,
            contactPhone: hosp.contactPhone,
          }
        : null,
      downloadPdfUrl: `/api/appointments/${appt._id}/prescription/download`,
      previewPdfUrl: `/api/appointments/${appt._id}/prescription/download?inline=true`,
    };
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        prescriptions,
      },
      "Patient prescription locker retrieved successfully."
    )
  );
});



/**
 * Patient: Fetch all uploaded medical reports with optional category filter
 */
export const getPatientReports = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.user?.userId;
  if (!patientId) throw new ApiError(401, "Unauthorized");

  const { category } = req.query;

  const profile = await PatientProfile.findOne({ userId: patientId });
  let reports = profile?.reports || [];

  // Filter by category if supplied (case-insensitive)
  if (category && typeof category === "string") {
    const filterCat = category.trim().toLowerCase();
    reports = reports.filter(
      (r) => r.category && r.category.toLowerCase() === filterCat
    );
  }

  // Sort by newest uploaded first
  reports = [...reports].sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalReports: reports.length,
        reports,
      },
      "Medical reports retrieved successfully."
    )
  );
});

/**
 * Patient: Upload / Add a new medical report to health vault
 */
export const uploadPatientReport = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.user?.userId;
  const {
    title,
    fileUrl,
    fileType,
    fileSize,
    category,
    doctorName,
    hospitalName,
    notes,
    tags,
  } = req.body;

  if (!patientId) throw new ApiError(401, "Unauthorized");

  if (!title || !title.trim()) {
    throw new ApiError(400, "Report title is required (e.g. 'CBC Blood Test', 'Chest X-Ray').");
  }

  let resolvedFileUrl = fileUrl ? String(fileUrl).trim() : "";
  let resolvedFileType = fileType ? String(fileType).trim().toUpperCase() : "PDF";
  let resolvedFileSize = fileSize ? String(fileSize).trim() : "245 KB";

  if (req.file) {
    try {
      const s3Result = await uploadFileToS3(req.file, "patients/reports");
      resolvedFileUrl = s3Result.url;
      const ext = path.extname(req.file.originalname).replace(".", "").toUpperCase();
      resolvedFileType = ext || "PDF";
      const sizeMb = (req.file.size / (1024 * 1024)).toFixed(1);
      resolvedFileSize = `${sizeMb} MB`;
    } catch (s3Err) {
      console.warn("Failed uploading report to AWS S3, fallback to local reference:", s3Err);
      if (!resolvedFileUrl) {
        resolvedFileUrl = `/uploads/reports/${req.file.originalname}`;
      }
      const ext = path.extname(req.file.originalname).replace(".", "").toUpperCase();
      resolvedFileType = ext || "PDF";
      const sizeMb = (req.file.size / (1024 * 1024)).toFixed(1);
      resolvedFileSize = `${sizeMb} MB`;
    }
  }

  if (!resolvedFileUrl) {
    throw new ApiError(400, "Report file or valid file URL is required.");
  }

  const newReport = {
    title: title.trim(),
    fileUrl: resolvedFileUrl,
    fileType: resolvedFileType,
    category: category ? category.trim() : "General",
    fileSize: resolvedFileSize,
    doctorName: doctorName ? String(doctorName).trim() : "",
    hospitalName: hospitalName ? String(hospitalName).trim() : "",
    notes: notes ? String(notes).trim() : "",
    tags: Array.isArray(tags)
      ? tags
      : typeof tags === "string"
      ? tags.split(",").map((t: string) => t.trim()).filter(Boolean)
      : [],
    isFavorite: false,
    uploadedAt: new Date(),
  };

  const updatedProfile = await PatientProfile.findOneAndUpdate(
    { userId: patientId },
    { $push: { reports: newReport } },
    { new: true, upsert: true }
  );

  // Retrieve the newly pushed report (the last element in reports array)
  const createdReport = updatedProfile.reports[updatedProfile.reports.length - 1];

  return res.status(201).json(
    new ApiResponse(
      201,
      createdReport,
      "Medical report uploaded and stored in health vault successfully."
    )
  );
});

/**
 * Patient: Delete a medical report from health vault by its unique report ID
 */
export const deletePatientReport = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.user?.userId;
  const { reportId } = req.params;

  if (!patientId) throw new ApiError(401, "Unauthorized");

  if (!mongoose.Types.ObjectId.isValid(reportId)) {
    throw new ApiError(400, "Invalid report ID format.");
  }

  const updatedProfile = await PatientProfile.findOneAndUpdate(
    { userId: patientId, "reports._id": reportId },
    { $pull: { reports: { _id: new mongoose.Types.ObjectId(reportId) } } },
    { new: true }
  );

  if (!updatedProfile) {
    throw new ApiError(404, "Report not found or already deleted from your health vault.");
  }

  return res.status(200).json(
    new ApiResponse(200, { reportId }, "Medical report deleted successfully.")
  );
});

/**
 * Patient: Toggle favorite status for a medical report
 */
export const toggleReportFavorite = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.user?.userId;
  const { reportId } = req.params;

  if (!patientId) throw new ApiError(401, "Unauthorized");

  if (!mongoose.Types.ObjectId.isValid(reportId)) {
    throw new ApiError(400, "Invalid report ID format.");
  }

  const profile = await PatientProfile.findOne({
    userId: patientId,
    "reports._id": reportId,
  });

  if (!profile) {
    throw new ApiError(404, "Report not found in your health vault.");
  }

  const report = profile.reports.find((r: any) => r._id.toString() === reportId);
  const newFavStatus = !(report?.isFavorite ?? false);

  await PatientProfile.updateOne(
    { userId: patientId, "reports._id": reportId },
    { $set: { "reports.$.isFavorite": newFavStatus } }
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      { reportId, isFavorite: newFavStatus },
      `Report marked as ${newFavStatus ? "favorite" : "normal"}.`
    )
  );
});

/**
 * Patient: Get complete medical history background
 */
export const getPatientMedicalHistory = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.user?.userId;
  if (!patientId) throw new ApiError(401, "Unauthorized");

  let profile = await PatientProfile.findOne({ userId: patientId })
    .populate("userId", "name email phoneNumber avatar");

  if (!profile) {
    profile = await PatientProfile.create({ userId: new mongoose.Types.ObjectId(patientId) });
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        allergies: profile.allergies || [],
        chronicDiseases: profile.chronicDiseases || [],
        pastSurgeries: profile.pastSurgeries || [],
        currentMedications: profile.currentMedications || [],
        bloodGroup: profile.bloodGroup || null,
        gender: profile.gender || null,
        dateOfBirth: profile.dateOfBirth || null,
        emergencyContact: profile.emergencyContact || { name: "", relationship: "", phoneNumber: "" },
        address: profile.address || null,
      },
      "Patient medical history retrieved successfully."
    )
  );
});

/**
 * Patient: Update medical history, chronic diseases, allergies, and emergency contact
 */
export const updatePatientMedicalHistory = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.user?.userId;
  if (!patientId) throw new ApiError(401, "Unauthorized");

  const {
    allergies,
    chronicDiseases,
    pastSurgeries,
    currentMedications,
    bloodGroup,
    gender,
    dateOfBirth,
    emergencyContact,
    address,
  } = req.body;

  // Validate bloodGroup if provided
  if (bloodGroup && !Object.values(BloodGroup).includes(bloodGroup)) {
    throw new ApiError(400, `Invalid blood group. Allowed: ${Object.values(BloodGroup).join(", ")}`);
  }

  // Validate gender if provided
  if (gender && !Object.values(Gender).includes(gender)) {
    throw new ApiError(400, `Invalid gender. Allowed: ${Object.values(Gender).join(", ")}`);
  }

  const updateFields: any = {};

  if (Array.isArray(allergies)) {
    updateFields.allergies = allergies.map((a: string) => a.trim()).filter(Boolean);
  }
  if (Array.isArray(chronicDiseases)) {
    updateFields.chronicDiseases = chronicDiseases.map((c: string) => c.trim()).filter(Boolean);
  }
  if (Array.isArray(pastSurgeries)) {
    updateFields.pastSurgeries = pastSurgeries.map((s: string) => s.trim()).filter(Boolean);
  }
  if (Array.isArray(currentMedications)) {
    updateFields.currentMedications = currentMedications.map((m: string) => m.trim()).filter(Boolean);
  }
  if (bloodGroup !== undefined) updateFields.bloodGroup = bloodGroup;
  if (gender !== undefined) updateFields.gender = gender;
  if (dateOfBirth !== undefined) updateFields.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
  if (emergencyContact !== undefined) updateFields.emergencyContact = emergencyContact;
  if (address !== undefined) updateFields.address = address;

  const updatedProfile = await PatientProfile.findOneAndUpdate(
    { userId: patientId },
    { $set: updateFields },
    { new: true, upsert: true }
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        allergies: updatedProfile.allergies,
        chronicDiseases: updatedProfile.chronicDiseases,
        pastSurgeries: updatedProfile.pastSurgeries,
        currentMedications: updatedProfile.currentMedications,
        bloodGroup: updatedProfile.bloodGroup,
        gender: updatedProfile.gender,
        dateOfBirth: updatedProfile.dateOfBirth,
        emergencyContact: updatedProfile.emergencyContact,
        address: updatedProfile.address,
      },
      "Patient medical history updated successfully."
    )
  );
});
