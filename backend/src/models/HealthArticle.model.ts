import mongoose, { Schema, Document, Model } from "mongoose";
import { ArticleStatus, ArticleCategory } from "../constants/index.js";

export { ArticleStatus, ArticleCategory };

export interface IReferenceLink {
  title: string;
  url: string;
}

export interface IHealthArticle extends Document {
  title: string;
  slug: string;
  doctorId: mongoose.Types.ObjectId;
  doctorUserId: mongoose.Types.ObjectId;
  category: ArticleCategory | string;
  summary: string;
  content: string;
  coverImage: string;
  additionalImages: string[];
  referenceLinks: IReferenceLink[];
  tags: string[];
  readTimeMinutes: number;
  status: ArticleStatus;
  viewsCount: number;
  likesCount: number;
  likedByUserIds: mongoose.Types.ObjectId[];
  isFeatured: boolean;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const referenceLinkSchema = new Schema<IReferenceLink>(
  {
    title: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const healthArticleSchema = new Schema<IHealthArticle>(
  {
    title: {
      type: String,
      required: [true, "Article title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      required: [true, "Article slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "DoctorProfile",
      required: [true, "Doctor profile reference is required"],
      index: true,
    },
    doctorUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Doctor User ID reference is required"],
      index: true,
    },
    category: {
      type: String,
      enum: Object.values(ArticleCategory),
      default: ArticleCategory.GENERAL_HEALTH,
      required: [true, "Article category is required"],
      index: true,
    },
    summary: {
      type: String,
      required: [true, "Article summary is required"],
      trim: true,
      maxlength: [500, "Summary cannot exceed 500 characters"],
    },
    content: {
      type: String,
      required: [true, "Article content is required"],
    },
    coverImage: {
      type: String,
      required: [true, "Article cover image URL is required"],
      trim: true,
    },
    additionalImages: {
      type: [String],
      default: [],
    },
    referenceLinks: {
      type: [referenceLinkSchema],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    readTimeMinutes: {
      type: Number,
      default: 3,
      min: 1,
    },
    status: {
      type: String,
      enum: Object.values(ArticleStatus),
      default: ArticleStatus.PUBLISHED,
      index: true,
    },
    viewsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    likesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    likedByUserIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// High-speed compound queries for patient browsing and doctor feeds
healthArticleSchema.index({ status: 1, category: 1, publishedAt: -1 });
healthArticleSchema.index({ doctorId: 1, status: 1, createdAt: -1 });
healthArticleSchema.index({ title: "text", summary: "text", tags: "text" });

export const HealthArticle: Model<IHealthArticle> =
  mongoose.models.HealthArticle ||
  mongoose.model<IHealthArticle>("HealthArticle", healthArticleSchema);
