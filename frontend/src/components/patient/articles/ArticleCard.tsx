import { type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Clock,
  Eye,
  Heart,
  BadgeCheck,
  ArrowUpRight,
  BookOpen,
} from 'lucide-react'
import type { HealthArticleItem } from '@/types/article'
import { useArticleStore } from '@/store/articleStore'

interface ArticleCardProps {
  article: HealthArticleItem
  featured?: boolean
}

const getCategoryBadgeColor = (category: string) => {
  switch (category) {
    case 'Cardiology':
      return 'bg-rose-50 text-rose-700 border-rose-200'
    case 'Dermatology':
      return 'bg-purple-50 text-purple-700 border-purple-200'
    case 'Nutrition & Diet':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'Mental Health':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200'
    case 'Pediatrics':
      return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'Orthopedics':
      return 'bg-teal-50 text-teal-700 border-teal-200'
    case 'Neurology':
      return 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200'
    case "Women's Health":
      return 'bg-pink-50 text-pink-700 border-pink-200'
    case 'Fitness & Lifestyle':
      return 'bg-cyan-50 text-cyan-700 border-cyan-200'
    default:
      return 'bg-blue-50 text-blue-700 border-blue-200'
  }
}

export const ArticleCard: FC<ArticleCardProps> = ({ article }) => {
  const navigate = useNavigate()
  const { toggleLike, likedArticleIds } = useArticleStore()

  const isLiked = likedArticleIds.includes(article._id)
  const doctorName =
    article.doctorUserId?.name ||
    article.doctorId?.userId?.name ||
    article.doctorId?.name ||
    'Dr. Specialist'
  const doctorAvatar =
    article.doctorUserId?.avatar ||
    article.doctorId?.userId?.avatar ||
    article.doctorId?.avatar
  const doctorSpecialty =
    article.doctorId?.department ||
    article.doctorId?.specialization?.[0] ||
    'Healthcare Specialist'
  const hospitalName =
    article.doctorId?.hospitalId?.name || 'Verified Hospital Partner'

  const formattedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recently published'

  const handleCardClick = () => {
    navigate(`/patient/articles/${article.slug || article._id}`)
  }

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleLike(article._id)
  }

  return (
    <article
      onClick={handleCardClick}
      className="group relative flex flex-col bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-blue-300 transition-all duration-300 overflow-hidden cursor-pointer"
    >
      {/* Cover Image with Category Pill & Read Time Badge */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        {article.coverImage ? (
          <img
            src={article.coverImage}
            alt={article.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              ;(e.target as HTMLElement).style.display = 'none'
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-400">
            <BookOpen className="size-12 stroke-[1.5]" />
          </div>
        )}

        {/* Gradient Overlay for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Top Floating Category & Read Time Pills */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-extrabold border shadow-2xs backdrop-blur-md ${getCategoryBadgeColor(
              article.category
            )}`}
          >
            {article.category}
          </span>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-900/75 text-white backdrop-blur-md shadow-2xs">
            <Clock className="size-3" />
            <span>{article.readTimeMinutes || 3} min read</span>
          </span>
        </div>
      </div>

      {/* Content Body */}
      <div className="flex-1 p-5 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Published Date */}
          <span className="text-[11px] font-bold text-slate-400 tracking-wide uppercase">
            {formattedDate}
          </span>

          {/* Title */}
          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
            {article.title}
          </h3>

          {/* Excerpt Summary */}
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
            {article.summary}
          </p>
        </div>

        {/* Doctor Author Card & Engagement Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          {/* Author Doctor Details */}
          <div className="flex items-center gap-2.5 min-w-0">
            {doctorAvatar ? (
              <img
                src={doctorAvatar}
                alt={doctorName}
                className="size-8 rounded-full object-cover ring-2 ring-white shrink-0"
              />
            ) : (
              <div className="size-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs">
                {doctorName.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-slate-900 truncate">
                  {doctorName}
                </span>
                <BadgeCheck className="size-3.5 text-blue-600 shrink-0" />
              </div>
              <p className="text-[10px] font-medium text-slate-400 truncate">
                {doctorSpecialty} • {hospitalName}
              </p>
            </div>
          </div>

          {/* Engagement Counters: Likes & Views */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Like Button */}
            <button
              type="button"
              onClick={handleLikeClick}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isLiked
                  ? 'bg-rose-50 text-rose-600'
                  : 'text-slate-400 hover:text-rose-500 hover:bg-slate-50'
              }`}
              title="Like this article"
            >
              <Heart
                className={`size-3.5 transition-transform active:scale-125 ${
                  isLiked ? 'fill-rose-500 text-rose-500' : ''
                }`}
              />
              <span className="text-[11px]">{article.likesCount || 0}</span>
            </button>

            {/* Views Count */}
            <div
              className="flex items-center gap-1 text-[11px] text-slate-400 font-semibold px-1"
              title="Article reads"
            >
              <Eye className="size-3.5" />
              <span>{article.viewsCount || 0}</span>
            </div>

            {/* Arrow Action */}
            <div className="size-7 rounded-full bg-slate-50 group-hover:bg-blue-600 text-slate-400 group-hover:text-white flex items-center justify-center transition-colors shrink-0">
              <ArrowUpRight className="size-3.5" />
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

export default ArticleCard
