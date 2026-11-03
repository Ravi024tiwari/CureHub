import { type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles,
  Clock,
  BadgeCheck,
  ArrowRight,
  BookOpen,
} from 'lucide-react'
import type { HealthArticleItem } from '@/types/article'

interface ArticleHeroFeaturedProps {
  article: HealthArticleItem | null
}

export const ArticleHeroFeatured: FC<ArticleHeroFeaturedProps> = ({ article }) => {
  const navigate = useNavigate()

  if (!article) return null

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
    'Consultant Physician'
  const hospitalName =
    article.doctorId?.hospitalId?.name || 'CarePlus Partner Hospital'

  const formattedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Featured Today'

  const handleReadClick = () => {
    navigate(`/patient/articles/${article.slug || article._id}`)
  }

  return (
    <div
      onClick={handleReadClick}
      className="group relative rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 bg-slate-900 cursor-pointer min-h-[380px] sm:min-h-[440px] flex flex-col justify-end p-6 sm:p-10 transition-all duration-300 hover:shadow-2xl hover:border-blue-400/40"
    >
      {/* Background Image with Cinematic Dark Gradient */}
      {article.coverImage ? (
        <img
          src={article.coverImage}
          alt={article.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-55"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-blue-950 to-indigo-950 opacity-90 flex items-center justify-center text-blue-500/20">
          <BookOpen className="size-48 stroke-[1]" />
        </div>
      )}

      {/* Multi-Stop Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-transparent hidden md:block" />

      {/* Hero Content Cluster */}
      <div className="relative z-10 max-w-3xl space-y-4">
        {/* Badges: Featured Spotlight + Category + Read Time */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-600 text-white shadow-md shadow-blue-600/30">
            <Sparkles className="size-3.5 fill-white text-white" />
            <span>Featured Medical Guide</span>
          </span>

          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-md border border-white/20">
            {article.category}
          </span>

          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-black/40 text-slate-200 backdrop-blur-md">
            <Clock className="size-3 text-slate-300" />
            <span>{article.readTimeMinutes || 4} min read</span>
          </span>
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight group-hover:text-blue-300 transition-colors">
          {article.title}
        </h2>

        {/* Summary */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-3 max-w-2xl">
          {article.summary}
        </p>

        {/* Author Doctor & CTA Cluster */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Doctor Info */}
          <div className="flex items-center gap-3">
            {doctorAvatar ? (
              <img
                src={doctorAvatar}
                alt={doctorName}
                className="size-11 rounded-full object-cover ring-2 ring-blue-500 shadow-md shrink-0"
              />
            ) : (
              <div className="size-11 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center ring-2 ring-blue-500 shadow-md shrink-0">
                {doctorName.charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <div className="flex items-center gap-1.5 text-white font-bold text-sm">
                <span>{doctorName}</span>
                <BadgeCheck className="size-4 text-blue-400 shrink-0" />
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {doctorSpecialty} • {hospitalName}
              </p>
              <p className="text-[11px] text-slate-500">{formattedDate}</p>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleReadClick()
            }}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white hover:bg-blue-50 text-slate-900 font-black text-xs sm:text-sm shadow-lg transition-all cursor-pointer group-hover:bg-blue-600 group-hover:text-white"
          >
            <span>Read Complete Article</span>
            <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ArticleHeroFeatured
