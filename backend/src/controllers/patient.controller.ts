import { Request, Response } from "express";
import mongoose from "mongoose";
import { Appointment } from "../models/Appointment.model.js";
import { Payment } from "../models/Payment.model.js";
import { PatientProfile } from "../models/PatientProfile.model.js";
import { AppointmentStatus, PaymentStatus } from "../constants/index.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

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
