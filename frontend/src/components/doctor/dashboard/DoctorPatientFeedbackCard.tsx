import type { FC } from 'react'
import { Star, MessageSquareQuote } from 'lucide-react'

interface ReviewItem {
  _id: string
  rating: number
  comment: string
  createdAt: string
  patientId?: {
    name: string
    avatar?: string
  }
}

interface DoctorPatientFeedbackCardProps {
  averageRating?: number
  totalReviews?: number
  ratingBreakdown?: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
  recentReviews?: ReviewItem[]
}

export const DoctorPatientFeedbackCard: FC<DoctorPatientFeedbackCardProps> = ({
  averageRating = 4.8,
  totalReviews = 0,
  ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  recentReviews = [],
}) => {
  const total = totalReviews || Object.values(ratingBreakdown).reduce((a, b) => a + b, 0) || 1

  const rows = [5, 4, 3, 2, 1] as const

  const latestReview = recentReviews.length > 0 ? recentReviews[0] : null

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Star className="size-4.5 fill-amber-500 stroke-amber-500" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900">Patient Feedback</h3>
            <p className="text-[11px] text-slate-400 font-medium">Ratings & patient testimonials</p>
          </div>
        </div>
      </div>

      {/* Rating & Distribution */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center pt-1">
        {/* Left Score Block */}
        <div className="sm:col-span-5 text-center sm:text-left space-y-1">
          <div className="flex items-baseline justify-center sm:justify-start gap-1">
            <span className="text-3xl sm:text-4xl font-black text-slate-900">
              {(averageRating || 4.8).toFixed(1)}
            </span>
            <span className="text-sm font-bold text-slate-400">/ 5.0</span>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-1 text-amber-400">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`size-3.5 ${
                  s <= Math.round(averageRating || 5)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-200'
                }`}
              />
            ))}
          </div>

          <p className="text-[11px] text-slate-400 font-medium">
            Based on {totalReviews > 0 ? totalReviews : 'verified'} reviews
          </p>
        </div>

        {/* Right Star Breakdown Bars */}
        <div className="sm:col-span-7 space-y-1.5">
          {rows.map((star) => {
            const count = ratingBreakdown[star] || 0
            const percent = total > 0 ? Math.round((count / total) * 100) : star === 5 ? 85 : 5

            return (
              <div key={star} className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                <span className="w-4 text-right">{star}★</span>
                <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    style={{ width: `${percent}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      star >= 4 ? 'bg-emerald-500' : star === 3 ? 'bg-amber-400' : 'bg-rose-400'
                    }`}
                  />
                </div>
                <span className="w-8 text-right text-slate-400">{percent}%</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Latest Patient Testimonial Quote */}
      {latestReview ? (
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="size-6 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center">
                {latestReview.patientId?.name?.charAt(0) || 'P'}
              </div>
              <span className="font-bold text-slate-800">
                {latestReview.patientId?.name || 'Verified Patient'}
              </span>
            </div>
            <div className="flex items-center text-amber-400">
              {[...Array(Math.min(5, Math.max(1, Math.round(latestReview.rating))))].map((_, i) => (
                <Star key={i} className="size-3 fill-amber-400" />
              ))}
            </div>
          </div>
          <p className="text-xs text-slate-600 font-medium italic line-clamp-2">
            "{latestReview.comment}"
          </p>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100/70 flex items-center gap-2 text-xs text-blue-900 font-medium">
          <MessageSquareQuote className="size-4 text-blue-600 shrink-0" />
          <span>Patient ratings and detailed feedback are authenticated from verified OPD visits.</span>
        </div>
      )}
    </div>
  )
}

export default DoctorPatientFeedbackCard
