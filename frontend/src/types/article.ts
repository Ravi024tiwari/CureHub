export const ArticleStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
} as const

export type ArticleStatus = (typeof ArticleStatus)[keyof typeof ArticleStatus]

export const ARTICLE_CATEGORIES = [
  'All',
  'General Health',
  'Cardiology',
  'Dermatology',
  'Nutrition & Diet',
  'Mental Health',
  'Pediatrics',
  'Orthopedics',
  'Neurology',
  'Diabetes & Endocrinology',
  "Women's Health",
  'Fitness & Lifestyle',
] as const

export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number]

export interface ReferenceLink {
  title: string
  url: string
}

export interface DoctorAuthorInfo {
  _id: string
  userId?: {
    _id: string
    name: string
    avatar?: string
    email?: string
    phoneNumber?: string
  }
  name?: string
  avatar?: string
  department?: string
  specialization?: string[]
  qualifications?: string[]
  experienceYears?: number
  consultationFee?: number
  hospitalId?: {
    _id: string
    name: string
    slug?: string
    address?: {
      city?: string
      state?: string
    }
    contactPhone?: string
    images?: string[]
  }
  bio?: string
  about?: string
}

export interface HealthArticleItem {
  _id: string
  title: string
  slug: string
  doctorId: DoctorAuthorInfo
  doctorUserId?: {
    _id: string
    name: string
    avatar?: string
    email?: string
  }
  category: string
  summary: string
  content: string
  coverImage: string
  additionalImages?: string[]
  referenceLinks?: ReferenceLink[]
  tags?: string[]
  readTimeMinutes: number
  status: ArticleStatus
  viewsCount: number
  likesCount: number
  likedByUserIds?: string[]
  isFeatured?: boolean
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

export interface ArticlesPagination {
  page: number
  limit: number
  totalCount: number
  totalPages: number
  hasMore: boolean
}

export interface ArticlesResponse {
  articles: HealthArticleItem[]
  pagination: ArticlesPagination
}

export interface CategoryCount {
  name: string
  count: number
}

export interface ArticleDetailResponse {
  article: HealthArticleItem
  relatedArticles: HealthArticleItem[]
}
