import { Request, Response } from "express";
import mongoose from "mongoose";
import { Review } from "../models/Review.model.js";
import { Appointment } from "../models/Appointment.model.js";
import { DoctorProfile } from "../models/DoctorProfile.model.js";
import { AppointmentStatus } from "../constants/index.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Patient: Create a genuine review for a completed appointment
 */
export const createReview = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.user?.userId;
  const { appointmentId, rating, comment, tags } = req.body;

  if (!appointmentId || !rating || !comment || !comment.trim()) {
    throw new ApiError(400, "Appointment ID, rating (1-5), and feedback comment are required.");
  }

  const numericRating = Number(rating);
  if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
    throw new ApiError(400, "Rating must be a valid number between 1 and 5.");
  }

  if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
    throw new ApiError(400, "Invalid appointment ID format");
  }

  // 1. Verify that appointment exists and belongs to this patient
  const appointment = await Appointment.findOne({
    _id: appointmentId,
    patientId,
  });

  if (!appointment) {
    throw new ApiError(
      404,
      "Appointment not found or you are not authorized to review this consultation."
    );
  }

  // 2. Strict Fraud Protection: Consultation must be COMPLETED
  if (appointment.status !== AppointmentStatus.COMPLETED) {
    throw new ApiError(
      400,
      `Reviews can only be submitted for completed consultations. Current appointment status is '${appointment.status}'.`
    );
  }

  // 3. Spam Protection: Exactly 1 review per consultation
  const existingReview = await Review.findOne({ appointmentId: appointment._id });
  if (existingReview) {
    throw new ApiError(
      409,
      "You have already submitted a review for this consultation. You may update your existing review."
    );
  }

  // 4. Create Review
  const review = await Review.create({
    appointmentId: appointment._id,
    doctorId: appointment.doctorId,
    patientId: new mongoose.Types.ObjectId(patientId),
    hospitalId: appointment.hospitalId,
    rating: numericRating,
    comment: comment.trim(),
    tags: Array.isArray(tags) ? tags : [],
  });

  // 5. Atomically mark Appointment as reviewed
  await Appointment.findByIdAndUpdate(appointment._id, {
    isReviewed: true,
    reviewId: review._id,
  });

  const populatedReview = await Review.findById(review._id)
    .populate("patientId", "name avatar")
    .populate({
      path: "doctorId",
      select: "department specialization consultationFee ratingAverage reviewCount",
      populate: { path: "userId", select: "name avatar" },
    })
    .populate("hospitalId", "name address");

  return res.status(201).json(
    new ApiResponse(
      201,
      populatedReview,
      "Review submitted successfully. Doctor's average rating has been updated."
    )
  );
});

/**
 * Patient: Update existing review
 */
export const updateReview = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.user?.userId;
  const { id } = req.params;
  const { rating, comment, tags } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid review ID format");
  }

  const review = await Review.findOne({
    _id: id,
    patientId,
  });

  if (!review) {
    throw new ApiError(404, "Review not found or you are not authorized to edit it.");
  }

  if (rating !== undefined) {
    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      throw new ApiError(400, "Rating must be between 1 and 5.");
    }
    review.rating = numericRating;
  }

  if (comment !== undefined) {
    if (!comment.trim()) {
      throw new ApiError(400, "Review comment cannot be empty.");
    }
    review.comment = comment.trim();
  }

  if (tags !== undefined && Array.isArray(tags)) {
    review.tags = tags;
  }

  await review.save();

  return res.status(200).json(
    new ApiResponse(200, review, "Review updated successfully.")
  );
});

/**
 * Patient: Delete review
 */
export const deleteReview = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.user?.userId;
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid review ID format");
  }

  const review = await Review.findOne({
    _id: id,
    patientId,
  });

  if (!review) {
    throw new ApiError(404, "Review not found or you are not authorized to delete it.");
  }

  const doctorId = review.doctorId;
  const appointmentId = review.appointmentId;


  // Reset appointment review status
  if (appointmentId) {
    await Appointment.findByIdAndUpdate(appointmentId, {
      isReviewed: false,
      $unset: { reviewId: 1 },
    });
  }


  await Review.deleteOne({ _id: review._id });

  // Recalculate doctor ratings after deletion
  await Review.calcAverageRatings(doctorId);

  return res.status(200).json(
    new ApiResponse(200, null, "Review deleted successfully.")
  );
});

/**
 * Public: Get reviews for a doctor with rating distribution analytics
 */
export const getDoctorReviews = asyncHandler(async (req: Request, res: Response) => {
  const { doctorId } = req.params;
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.max(1, Math.min(50, parseInt(req.query.limit as string) || 10));
  const skip = (page - 1) * limit;

  if (!mongoose.Types.ObjectId.isValid(doctorId)) {
    throw new ApiError(400, "Invalid doctor ID format");
  }

  const doctorObjectId = new mongoose.Types.ObjectId(doctorId);

  // 1. Parallel execution: Doctor profile, reviews list, and distribution analytics
  const [doctor, reviews, totalDocs, distributionStats] = await Promise.all([
    DoctorProfile.findById(doctorId).select("ratingAverage reviewCount"),
    Review.find({ doctorId: doctorObjectId })
      .populate("patientId", "name avatar")
      .populate("hospitalId", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments({ doctorId: doctorObjectId }),
    Review.aggregate([
      { $match: { doctorId: doctorObjectId } },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  if (!doctor) {
    throw new ApiError(404, "Doctor profile not found");
  }

  // 2. Build star rating breakdown (1 to 5 stars)
  const breakdown: Record<number, { count: number; percentage: number }> = {
    5: { count: 0, percentage: 0 },
    4: { count: 0, percentage: 0 },
    3: { count: 0, percentage: 0 },
    2: { count: 0, percentage: 0 },
    1: { count: 0, percentage: 0 },
  };

  distributionStats.forEach((stat) => {
    const star = Math.floor(stat._id);
    if (breakdown[star]) {
      breakdown[star].count = stat.count;
      breakdown[star].percentage =
        totalDocs > 0 ? Math.round((stat.count / totalDocs) * 100) : 0;
    }
  });

  const totalPages = Math.ceil(totalDocs / limit) || 1;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        doctorStats: {
          ratingAverage: doctor.ratingAverage,
          reviewCount: doctor.reviewCount,
          breakdown,
        },
        reviews,
        pagination: {
          totalDocs,
          totalPages,
          currentPage: page,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      "Doctor reviews retrieved successfully"
    )
  );
});

/**
 * Patient: Get all reviews written by logged-in patient
 */
export const getMyReviews = asyncHandler(async (req: Request, res: Response) => {
  const patientId = req.user?.userId;

  const reviews = await Review.find({ patientId })
    .populate({
      path: "doctorId",
      select: "department specialization ratingAverage",
      populate: { path: "userId", select: "name avatar" },
    })
    .populate("hospitalId", "name slug address")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, reviews, "Your reviews retrieved successfully")
  );
});
