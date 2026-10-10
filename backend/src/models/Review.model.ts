import mongoose, { Schema, Document, Model } from "mongoose";
import { DoctorProfile } from "./DoctorProfile.model.js";

export interface IReview extends Document {
  appointmentId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  rating: number; // 1 to 5
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReviewModel extends Model<IReview> {
  calcAverageRatings(doctorId: mongoose.Types.ObjectId): Promise<void>;
}

const ReviewSchema = new Schema<IReview, IReviewModel>(
  {
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      required: [true, "Appointment ID is required"],
      unique: true,
      index: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "DoctorProfile",
      required: [true, "Doctor ID is required"],
      index: true,
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Patient ID is required"],
      index: true,
    },
    hospitalId: {
      type: Schema.Types.ObjectId,
      ref: "Hospital",
      required: [true, "Hospital ID is required"],
      index: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    comment: {
      type: String,
      required: [true, "Review comment is required"],
      trim: true,
      maxlength: [1000, "Review comment cannot exceed 1000 characters"],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

// Static method to automatically calculate and update Doctor's ratingAverage and reviewCount
ReviewSchema.statics.calcAverageRatings = async function (
  doctorId: mongoose.Types.ObjectId
): Promise<void> {
  const stats = await this.aggregate([
    {
      $match: { doctorId },
    },
    {
      $group: {
        _id: "$doctorId",
        ratingCount: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  if (stats.length > 0) {
    await DoctorProfile.findByIdAndUpdate(doctorId, {
      ratingAverage: Math.round(stats[0].avgRating * 10) / 10, // Round to 1 decimal place (e.g. 4.8)
      reviewCount: stats[0].ratingCount,
    });
  } else {
    // If no reviews left, reset to zero
    await DoctorProfile.findByIdAndUpdate(doctorId, {
      ratingAverage: 0,
      reviewCount: 0,
    });
  }
};

// Post-save hook: recalculate ratings after a new review is added or updated
ReviewSchema.post("save", async function () {
  const Review = this.constructor as IReviewModel;
  await Review.calcAverageRatings(this.doctorId);
});

export const Review: IReviewModel = mongoose.model<IReview, IReviewModel>(
  "Review",
  ReviewSchema
);
