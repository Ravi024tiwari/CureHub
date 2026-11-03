import apiClient from './apiClient'
import type {
  HealthArticleItem,
  ArticlesResponse,
  CategoryCount,
  ArticleDetailResponse,
} from '@/types/article'

export interface ArticleQueryParams {
  page?: number
  limit?: number
  category?: string
  search?: string
  tag?: string
  doctorId?: string
  sortBy?: 'latest' | 'popular' | 'likes'
}

export const articleService = {
  // Public / Patient: Get all published articles with filters
  getArticles: async (params?: ArticleQueryParams): Promise<ArticlesResponse> => {
    const res: any = await apiClient.get('/articles', { params })
    return res.data
  },

  // Public / Patient: Get active categories and counts
  getCategories: async (): Promise<{ categories: CategoryCount[] }> => {
    const res: any = await apiClient.get('/articles/categories')
    return res.data
  },

  // Public / Patient: Get single article reading view by slug or id
  getArticleBySlug: async (slugOrId: string): Promise<ArticleDetailResponse> => {
    const res: any = await apiClient.get(`/articles/${slugOrId}`)
    return res.data
  },

  // Patient / User: Toggle like on an article
  toggleLike: async (
    id: string
  ): Promise<{ articleId: string; likesCount: number; hasLiked: boolean }> => {
    const res: any = await apiClient.post(`/articles/${id}/like`)
    return res.data
  },

  // Doctor: Create a new article
  createArticle: async (data: Partial<HealthArticleItem>): Promise<HealthArticleItem> => {
    const res: any = await apiClient.post('/articles/doctor', data)
    return res.data
  },

  // Doctor: Fetch doctor's own authored articles
  getMyDoctorArticles: async (params?: {
    page?: number
    limit?: number
    status?: string
    search?: string
  }): Promise<{
    articles: HealthArticleItem[]
    analytics: {
      totalArticles: number
      publishedCount: number
      draftCount: number
      totalViews: number
      totalLikes: number
    }
    pagination: any
  }> => {
    const res: any = await apiClient.get('/articles/doctor/my-articles', { params })
    return res.data
  },

  // Doctor: Fetch specific article for editing
  getDoctorArticleById: async (id: string): Promise<HealthArticleItem> => {
    const res: any = await apiClient.get(`/articles/doctor/${id}`)
    return res.data
  },

  // Doctor: Update article
  updateArticle: async (
    id: string,
    data: Partial<HealthArticleItem>
  ): Promise<HealthArticleItem> => {
    const res: any = await apiClient.put(`/articles/doctor/${id}`, data)
    return res.data
  },

  // Doctor: Delete article
  deleteArticle: async (id: string): Promise<{ id: string }> => {
    const res: any = await apiClient.delete(`/articles/doctor/${id}`)
    return res.data
  },
}

export default articleService
