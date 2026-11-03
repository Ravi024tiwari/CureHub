import { create } from 'zustand'
import { articleService } from '@/services/articleService'
import type {
  HealthArticleItem,
  CategoryCount,
  ArticleDetailResponse,
} from '@/types/article'

export interface ArticleState {
  articles: HealthArticleItem[]
  featuredArticle: HealthArticleItem | null
  selectedCategory: string
  searchQuery: string
  selectedTag: string | null
  sortBy: 'latest' | 'popular' | 'likes'
  page: number
  limit: number
  totalCount: number
  hasMore: boolean
  categories: CategoryCount[]

  // Article reading view state
  activeArticle: HealthArticleItem | null
  relatedArticles: HealthArticleItem[]
  likedArticleIds: string[]

  isLoading: boolean
  isLoadingDetail: boolean
  error: string | null

  // Actions
  fetchArticles: (resetPage?: boolean) => Promise<void>
  fetchNextPage: () => Promise<void>
  fetchCategories: () => Promise<void>
  fetchArticleBySlug: (slugOrId: string) => Promise<ArticleDetailResponse | null>
  setSelectedCategory: (category: string) => void
  setSearchQuery: (query: string) => void
  setSelectedTag: (tag: string | null) => void
  setSortBy: (sortBy: 'latest' | 'popular' | 'likes') => void
  clearFilters: () => void
  toggleLike: (articleId: string) => Promise<void>
}

export const useArticleStore = create<ArticleState>((set, get) => ({
  articles: [],
  featuredArticle: null,
  selectedCategory: 'All',
  searchQuery: '',
  selectedTag: null,
  sortBy: 'latest',
  page: 1,
  limit: 12,
  totalCount: 0,
  hasMore: false,
  categories: [],

  activeArticle: null,
  relatedArticles: [],
  likedArticleIds: [],

  isLoading: false,
  isLoadingDetail: false,
  error: null,

  fetchArticles: async (resetPage = false) => {
    const pageToFetch = resetPage ? 1 : get().page
    const { selectedCategory, searchQuery, selectedTag, sortBy, limit } = get()

    set({ isLoading: true, error: null, ...(resetPage ? { page: 1 } : {}) })

    try {
      const data = await articleService.getArticles({
        page: pageToFetch,
        limit,
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        search: searchQuery.trim() || undefined,
        tag: selectedTag || undefined,
        sortBy,
      })

      const rawArticles = data.articles || []
      const featured = rawArticles.find((a) => a.isFeatured) || rawArticles[0] || null

      set({
        articles: pageToFetch === 1 ? rawArticles : [...get().articles, ...rawArticles],
        featuredArticle: featured,
        totalCount: data.pagination?.totalCount || 0,
        hasMore: data.pagination?.hasMore || false,
        isLoading: false,
      })
    } catch (err: any) {
      console.error('Failed to fetch articles:', err)
      set({ isLoading: false, error: err.message || 'Failed to load health articles' })
    }
  },

  fetchNextPage: async () => {
    const { hasMore, isLoading, page } = get()
    if (!hasMore || isLoading) return

    set({ page: page + 1 })
    await get().fetchArticles(false)
  },

  fetchCategories: async () => {
    try {
      const data = await articleService.getCategories()
      set({ categories: data.categories || [] })
    } catch (err) {
      console.error('Failed to load article categories:', err)
    }
  },

  fetchArticleBySlug: async (slugOrId: string) => {
    set({ isLoadingDetail: true, error: null })
    try {
      const data = await articleService.getArticleBySlug(slugOrId)
      if (data && data.article) {
        set({
          activeArticle: data.article,
          relatedArticles: data.relatedArticles || [],
          isLoadingDetail: false,
        })
        return data
      }
      set({ isLoadingDetail: false })
      return null
    } catch (err: any) {
      console.error('Failed to fetch article detail:', err)
      set({
        isLoadingDetail: false,
        error: err.message || 'Article not found',
      })
      return null
    }
  },

  setSelectedCategory: (category) => {
    set({ selectedCategory: category, page: 1 })
    get().fetchArticles(true)
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query, page: 1 })
    get().fetchArticles(true)
  },

  setSelectedTag: (tag) => {
    set({ selectedTag: tag, page: 1 })
    get().fetchArticles(true)
  },

  setSortBy: (sortBy) => {
    set({ sortBy, page: 1 })
    get().fetchArticles(true)
  },

  clearFilters: () => {
    set({
      selectedCategory: 'All',
      searchQuery: '',
      selectedTag: null,
      sortBy: 'latest',
      page: 1,
    })
    get().fetchArticles(true)
  },

  toggleLike: async (articleId: string) => {
    // Optimistic toggle
    const currentLiked = get().likedArticleIds.includes(articleId)
    const newLikedIds = currentLiked
      ? get().likedArticleIds.filter((id) => id !== articleId)
      : [...get().likedArticleIds, articleId]

    set((state) => ({
      likedArticleIds: newLikedIds,
      articles: state.articles.map((a) =>
        a._id === articleId
          ? { ...a, likesCount: Math.max(0, a.likesCount + (currentLiked ? -1 : 1)) }
          : a
      ),
      activeArticle:
        state.activeArticle && state.activeArticle._id === articleId
          ? {
              ...state.activeArticle,
              likesCount: Math.max(
                0,
                state.activeArticle.likesCount + (currentLiked ? -1 : 1)
              ),
            }
          : state.activeArticle,
    }))

    try {
      await articleService.toggleLike(articleId)
    } catch (err) {
      console.error('Failed to toggle like on server:', err)
    }
  },
}))
