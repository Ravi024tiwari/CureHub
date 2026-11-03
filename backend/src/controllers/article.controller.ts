import { Request, Response } from "express";
import crypto from "crypto";
import mongoose from "mongoose";
import { HealthArticle, ArticleStatus, ArticleCategory } from "../models/HealthArticle.model.js";
import { DoctorProfile } from "../models/DoctorProfile.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Generate a clean URL-friendly unique slug from title
 */
const generateSlug = (title: string): string => {
  const base = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const suffix = crypto.randomBytes(3).toString("hex");
  return `${base.slice(0, 70)}-${suffix}`;
};

/**
 * Approximate reading time based on 200 words per minute
 */
const computeReadTimeMinutes = (content: string): number => {
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
};

// ==========================================
// 1. DOCTOR CONTROLLER ACTIONS
// ==========================================

/**
 * Doctor: Create a new Health Article (DRAFT or PUBLISHED)
 */
export const createArticle = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) throw new ApiError(401, "Authentication required");

  const doctor = await DoctorProfile.findOne({ userId });
  if (!doctor) {
    throw new ApiError(404, "Doctor profile not found. Only registered doctors can author articles.");
  }

  const {
    title,
    category,
    summary,
    content,
    coverImage,
    additionalImages = [],
    referenceLinks = [],
    tags = [],
    status = ArticleStatus.PUBLISHED,
  } = req.body;

  if (!title || !title.trim()) {
    throw new ApiError(400, "Article title is required");
  }
  if (!category || !category.trim()) {
    throw new ApiError(400, "Article category is required");
  }
  if (!summary || !summary.trim()) {
    throw new ApiError(400, "Article summary preview is required");
  }
  if (!content || !content.trim()) {
    throw new ApiError(400, "Article content body is required");
  }
  if (!coverImage || !coverImage.trim()) {
    throw new ApiError(400, "Article cover image URL is required");
  }

  const slug = generateSlug(title.trim());
  const readTimeMinutes = computeReadTimeMinutes(content);

  const cleanTags = Array.isArray(tags)
    ? tags
        .map((t: string) => t.trim().toLowerCase())
        .filter((t: string) => t.length > 0)
    : [];

  const cleanReferences = Array.isArray(referenceLinks)
    ? referenceLinks.filter((r: any) => r && r.title && r.url)
    : [];

  const article = await HealthArticle.create({
    title: title.trim(),
    slug,
    doctorId: doctor._id,
    doctorUserId: new mongoose.Types.ObjectId(userId),
    category: category.trim(),
    summary: summary.trim(),
    content: content.trim(),
    coverImage: coverImage.trim(),
    additionalImages: Array.isArray(additionalImages) ? additionalImages : [],
    referenceLinks: cleanReferences,
    tags: cleanTags,
    readTimeMinutes,
    status: status === ArticleStatus.DRAFT ? ArticleStatus.DRAFT : ArticleStatus.PUBLISHED,
    publishedAt: status === ArticleStatus.PUBLISHED ? new Date() : undefined,
  });

  const populated = await HealthArticle.findById(article._id)
    .populate({
      path: "doctorId",
      select: "department specialization qualifications experienceYears consultationFee hospitalId",
      populate: { path: "hospitalId", select: "name slug address" },
    })
    .populate("doctorUserId", "name avatar email");

  return res.status(201).json(
    new ApiResponse(201, populated, "Health article created successfully")
  );
});

/**
 * Doctor: Get all articles authored by logged-in doctor with performance analytics
 */
export const getMyDoctorArticles = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) throw new ApiError(401, "Authentication required");

  const doctor = await DoctorProfile.findOne({ userId });
  if (!doctor) throw new ApiError(404, "Doctor profile not found");

  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
  const status = req.query.status as string;
  const search = req.query.search as string;

  const filter: any = { doctorId: doctor._id };
  if (status && status !== "ALL" && Object.values(ArticleStatus).includes(status as ArticleStatus)) {
    filter.status = status;
  }
  if (search && search.trim()) {
    filter.$or = [
      { title: { $regex: search.trim(), $options: "i" } },
      { summary: { $regex: search.trim(), $options: "i" } },
      { category: { $regex: search.trim(), $options: "i" } },
    ];
  }

  const [articles, totalCount, draftCount, publishedCount, statsAgg] = await Promise.all([
    HealthArticle.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    HealthArticle.countDocuments(filter),
    HealthArticle.countDocuments({ doctorId: doctor._id, status: ArticleStatus.DRAFT }),
    HealthArticle.countDocuments({ doctorId: doctor._id, status: ArticleStatus.PUBLISHED }),
    HealthArticle.aggregate([
      { $match: { doctorId: doctor._id } },
      {
        $group: {
          _id: null,
          totalViews: { $sum: "$viewsCount" },
          totalLikes: { $sum: "$likesCount" },
        },
      },
    ]),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        articles,
        analytics: {
          totalArticles: draftCount + publishedCount,
          publishedCount,
          draftCount,
          totalViews: statsAgg[0]?.totalViews || 0,
          totalLikes: statsAgg[0]?.totalLikes || 0,
        },
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit) || 1,
          hasMore: page * limit < totalCount,
        },
      },
      "Doctor articles retrieved successfully"
    )
  );
});

/**
 * Doctor: Get a specific article by ID for editing
 */
export const getDoctorArticleById = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { id } = req.params;

  if (!userId) throw new ApiError(401, "Authentication required");
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid article ID format");

  const doctor = await DoctorProfile.findOne({ userId });
  if (!doctor) throw new ApiError(404, "Doctor profile not found");

  const article = await HealthArticle.findOne({
    _id: new mongoose.Types.ObjectId(id),
    doctorId: doctor._id,
  });

  if (!article) {
    throw new ApiError(404, "Article not found or you are not authorized to edit it");
  }

  return res.status(200).json(new ApiResponse(200, article, "Article retrieved successfully"));
});

/**
 * Doctor: Update an existing article
 */
export const updateArticle = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { id } = req.params;

  if (!userId) throw new ApiError(401, "Authentication required");
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid article ID format");

  const doctor = await DoctorProfile.findOne({ userId });
  if (!doctor) throw new ApiError(404, "Doctor profile not found");

  const article = await HealthArticle.findOne({
    _id: new mongoose.Types.ObjectId(id),
    doctorId: doctor._id,
  });

  if (!article) {
    throw new ApiError(404, "Article not found or you are not authorized to modify it");
  }

  const {
    title,
    category,
    summary,
    content,
    coverImage,
    additionalImages,
    referenceLinks,
    tags,
    status,
  } = req.body;

  if (title !== undefined) article.title = title.trim();
  if (category !== undefined) article.category = category.trim();
  if (summary !== undefined) article.summary = summary.trim();
  if (coverImage !== undefined) article.coverImage = coverImage.trim();
  if (Array.isArray(additionalImages)) article.additionalImages = additionalImages;
  if (Array.isArray(referenceLinks)) {
    article.referenceLinks = referenceLinks.filter((r: any) => r && r.title && r.url);
  }
  if (Array.isArray(tags)) {
    article.tags = tags.map((t: string) => t.trim().toLowerCase()).filter((t: string) => t.length > 0);
  }

  if (content !== undefined) {
    article.content = content.trim();
    article.readTimeMinutes = computeReadTimeMinutes(content);
  }

  if (status !== undefined && Object.values(ArticleStatus).includes(status)) {
    // If transitioning from DRAFT to PUBLISHED for the first time
    if (article.status === ArticleStatus.DRAFT && status === ArticleStatus.PUBLISHED) {
      article.publishedAt = new Date();
    }
    article.status = status;
  }

  await article.save();

  const populated = await HealthArticle.findById(article._id)
    .populate({
      path: "doctorId",
      select: "department specialization qualifications experienceYears consultationFee hospitalId",
      populate: { path: "hospitalId", select: "name slug address" },
    })
    .populate("doctorUserId", "name avatar email");

  return res.status(200).json(new ApiResponse(200, populated, "Article updated successfully"));
});

/**
 * Doctor: Delete an article
 */
export const deleteArticle = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { id } = req.params;

  if (!userId) throw new ApiError(401, "Authentication required");
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid article ID format");

  const doctor = await DoctorProfile.findOne({ userId });
  if (!doctor) throw new ApiError(404, "Doctor profile not found");

  const deleted = await HealthArticle.findOneAndDelete({
    _id: new mongoose.Types.ObjectId(id),
    doctorId: doctor._id,
  });

  if (!deleted) {
    throw new ApiError(404, "Article not found or you are not authorized to delete it");
  }

  return res.status(200).json(new ApiResponse(200, { id }, "Article deleted successfully"));
});

// ==========================================
// 2. PATIENT / PUBLIC CONTROLLER ACTIONS
// ==========================================

/**
 * Patient / Public: Get all published articles with category & keyword filters
 */
export const getPublishedArticles = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(48, Math.max(1, parseInt(req.query.limit as string) || 12));
  const { category, search, tag, doctorId, sortBy = "latest" } = req.query;

  const filter: any = { status: ArticleStatus.PUBLISHED };

  if (category && typeof category === "string" && category !== "All") {
    filter.category = category;
  }

  if (tag && typeof tag === "string") {
    filter.tags = tag.toLowerCase().trim();
  }

  if (doctorId && mongoose.Types.ObjectId.isValid(doctorId as string)) {
    filter.doctorId = new mongoose.Types.ObjectId(doctorId as string);
  }

  if (search && typeof search === "string" && search.trim()) {
    const q = search.trim();
    filter.$or = [
      { title: { $regex: q, $options: "i" } },
      { summary: { $regex: q, $options: "i" } },
      { tags: { $in: [new RegExp(q, "i")] } },
      { category: { $regex: q, $options: "i" } },
    ];
  }

  let sortOption: any = { publishedAt: -1 };
  if (sortBy === "popular") {
    sortOption = { viewsCount: -1, likesCount: -1, publishedAt: -1 };
  } else if (sortBy === "likes") {
    sortOption = { likesCount: -1, publishedAt: -1 };
  }

  const [articles, totalCount] = await Promise.all([
    HealthArticle.find(filter)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({
        path: "doctorId",
        select: "department specialization qualifications experienceYears consultationFee hospitalId",
        populate: { path: "hospitalId", select: "name slug address" },
      })
      .populate("doctorUserId", "name avatar")
      .lean(),
    HealthArticle.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        articles,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit) || 1,
          hasMore: page * limit < totalCount,
        },
      },
      "Published health articles retrieved successfully"
    )
  );
});

/**
 * Patient / Public: Get all available categories with article counts
 */
export const getArticleCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categoriesAgg = await HealthArticle.aggregate([
    { $match: { status: ArticleStatus.PUBLISHED } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const predefined = Object.values(ArticleCategory);
  const map = new Map<string, number>();
  categoriesAgg.forEach((c) => {
    if (c._id) map.set(c._id, c.count);
  });

  const categories = predefined.map((cat) => ({
    name: cat,
    count: map.get(cat) || 0,
  }));

  // Add any custom categories present in DB that aren't in enum
  categoriesAgg.forEach((c) => {
    if (c._id && !predefined.includes(c._id as ArticleCategory)) {
      categories.push({ name: c._id, count: c.count });
    }
  });

  return res.status(200).json(
    new ApiResponse(200, { categories }, "Article categories retrieved successfully")
  );
});

/**
 * Patient / Public: Get single article by slug or ID with related articles & view counter increment
 */
export const getArticleBySlug = asyncHandler(async (req: Request, res: Response) => {
  const { slugOrId } = req.params;

  let query: any;
  if (mongoose.Types.ObjectId.isValid(slugOrId)) {
    query = {
      $or: [{ _id: new mongoose.Types.ObjectId(slugOrId) }, { slug: slugOrId.toLowerCase() }],
    };
  } else {
    query = { slug: slugOrId.toLowerCase() };
  }

  // Atomically increment views count for published article
  const article = await HealthArticle.findOneAndUpdate(
    { ...query, status: ArticleStatus.PUBLISHED },
    { $inc: { viewsCount: 1 } },
    { new: true }
  )
    .populate({
      path: "doctorId",
      select:
        "department specialization qualifications experienceYears consultationFee hospitalId bio about",
      populate: { path: "hospitalId", select: "name slug address contactPhone images" },
    })
    .populate("doctorUserId", "name avatar email phoneNumber")
    .lean();

  if (!article) {
    throw new ApiError(404, "Health article not found or has been unpublished.");
  }

  // Fetch 3 related published articles from the same category
  const relatedArticles = await HealthArticle.find({
    category: article.category,
    _id: { $ne: article._id },
    status: ArticleStatus.PUBLISHED,
  })
    .sort({ viewsCount: -1, publishedAt: -1 })
    .limit(3)
    .populate("doctorUserId", "name avatar")
    .select("title slug category summary coverImage readTimeMinutes publishedAt viewsCount likesCount")
    .lean();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        article,
        relatedArticles,
      },
      "Article retrieved successfully"
    )
  );
});

/**
 * Patient / Authenticated User: Toggle Like on an article
 */
export const toggleLikeArticle = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { id } = req.params;

  if (!userId) throw new ApiError(401, "Authentication required to like articles");
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid article ID format");

  const userObjectId = new mongoose.Types.ObjectId(userId);
  const article = await HealthArticle.findById(id);

  if (!article || article.status !== ArticleStatus.PUBLISHED) {
    throw new ApiError(404, "Article not found");
  }

  const alreadyLiked = article.likedByUserIds.some((uid) => uid.equals(userObjectId));

  if (alreadyLiked) {
    article.likedByUserIds = article.likedByUserIds.filter((uid) => !uid.equals(userObjectId));
    article.likesCount = Math.max(0, article.likesCount - 1);
  } else {
    article.likedByUserIds.push(userObjectId);
    article.likesCount = article.likesCount + 1;
  }

  await article.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        articleId: article._id,
        likesCount: article.likesCount,
        hasLiked: !alreadyLiked,
      },
      alreadyLiked ? "Article unliked" : "Article liked"
    )
  );
});
