import { useState, useEffect, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen,
  Clock,
  Heart,
  Eye,
  ArrowRight,
} from 'lucide-react'
import apiClient from '@/services/apiClient'

export interface ArticlePreviewItem {
  _id: string
  slug: string
  title: string
  summary: string
  category: string
  readTimeMinutes: number
  coverImage: string
  viewsCount: number
  likesCount: number
  publishedAt: string
  doctorUserId?: {
    _id: string
    name: string
    avatar?: string
  }
}

const FALLBACK_ARTICLES: ArticlePreviewItem[] = [
  {
    _id: 'art-1',
    slug: 'early-warning-signs-heart-attack',
    title: 'Recognizing Early Warning Signs of Cardiovascular Distress',
    summary:
      'Crucial clinical indicators of coronary insufficiency, atypical symptoms in women, and emergency response protocols.',
    category: 'Cardiology',
    readTimeMinutes: 5,
    coverImage:
      'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80',
    viewsCount: 2450,
    likesCount: 184,
    publishedAt: '2026-10-28T00:00:00.000Z',
    doctorUserId: {
      _id: 'doc-user-1',
      name: 'Dr. Priya Sharma',
      avatar: '',
    },
  },
  {
    _id: 'art-2',
    slug: 'managing-blood-sugar-through-nutrition',
    title: 'Evidence-Based Nutrition for Long-Term Glycemic Control',
    summary:
      'How dietary fiber, low-glycemic indexing, and timed meals optimize insulin sensitivity without restrictive crash diets.',
    category: 'Diabetes & Endocrinology',
    readTimeMinutes: 6,
    coverImage:
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80',
    viewsCount: 3120,
    likesCount: 240,
    publishedAt: '2026-10-30T00:00:00.000Z',
    doctorUserId: {
      _id: 'doc-user-2',
      name: 'Dr. Rajesh Verma',
      avatar: '',
    },
  },
  {
    _id: 'art-3',
    slug: 'pediatric-immunity-seasonal-protection',
    title: 'Building Resilient Pediatric Immunity: Pediatrician Guidelines',
    summary:
      'Vaccination timelines, micronutrient supplementation, and sleep hygiene strategies for seasonal infection defense.',
    category: 'Pediatrics',
    readTimeMinutes: 4,
    coverImage:
      'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&w=1200&q=80',
    viewsCount: 1980,
    likesCount: 165,
    publishedAt: '2026-11-01T00:00:00.000Z',
    doctorUserId: {
      _id: 'doc-user-3',
      name: 'Dr. Sneha Patel',
      avatar: '',
    },
  },
]

export const LandingArticlesSection: FC = () => {
  const navigate = useNavigate()
  const [articles, setArticles] = useState<ArticlePreviewItem[]>(FALLBACK_ARTICLES)

  useEffect(() => {
    async function loadArticles() {
      try {
        const res: any = await apiClient.get('/articles', {
          params: { limit: 3, sortBy: 'popular' },
        })
        if (res && res.data && res.data.articles && res.data.articles.length > 0) {
          setArticles(res.data.articles)
        }
      } catch (err) {
        // Retain fallback articles
      }
    }
    loadArticles()
  }, [])

  return (
    <section id="articles" className="py-20 sm:py-28 bg-[#f8fbff] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 border-b border-slate-200/80 pb-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-black">
              <BookOpen className="size-3.5 text-blue-600" />
              <span>Doctor-Verified Health Intelligence</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
              Evidence-Based Health Articles & Guides
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl leading-relaxed">
              Read actionable medical insights, preventative wellness strategies, and clinical discoveries authored directly by verified CarePlus physicians.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/patient/articles')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer shrink-0"
          >
            <span>Explore All Health Articles</span>
            <ArrowRight className="size-3.5" />
          </button>
        </div>

        {/* 3 Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.slice(0, 3).map((article) => {
            const doctorName =
              article.doctorUserId?.name ||
              (article as any).doctorId?.name ||
              'Dr. Specialist'

            const formattedDate = article.publishedAt
              ? new Date(article.publishedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Recently'

            return (
              <div
                key={article._id}
                onClick={() => navigate(`/patient/articles/${article.slug || article._id}`)}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-md shadow-blue-900/5 hover:border-blue-400 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  {/* Cover Image */}
                  <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={article.coverImage}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[10px] font-black text-blue-700 shadow-xs border border-white/80">
                      {article.category}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 sm:p-6 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3 text-slate-400" />
                        <span>{article.readTimeMinutes || 4} min read</span>
                      </span>
                      <span>{formattedDate}</span>
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                      {article.title}
                    </h3>

                    <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">
                      {article.summary}
                    </p>
                  </div>
                </div>

                {/* Footer with Doctor Attribution & Metrics */}
                <div className="p-4 px-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-7 rounded-full bg-blue-600 text-white font-black text-[11px] flex items-center justify-center">
                      {doctorName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-bold text-slate-800 truncate max-w-[140px]">
                      {doctorName}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400 font-semibold">
                    <span className="flex items-center gap-1">
                      <Eye className="size-3.5" />
                      <span>{article.viewsCount || 0}</span>
                    </span>
                    <span className="flex items-center gap-1 text-rose-500">
                      <Heart className="size-3.5 fill-rose-500" />
                      <span>{article.likesCount || 0}</span>
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
