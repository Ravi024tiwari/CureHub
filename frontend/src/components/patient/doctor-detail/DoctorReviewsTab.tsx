import { useState, useEffect, type FC } from 'react'
import {
  Star,
  ThumbsUp,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react'
import type { DoctorDetailData } from '@/types/patient'
import { fetchDoctorReviewsApi } from '@/services/patientService'

interface DoctorReviewsTabProps {
  doctor: DoctorDetailData
}

export const DoctorReviewsTab: FC<DoctorReviewsTabProps> = ({ doctor }) => {
  const [selectedFilter, setSelectedFilter] = useState<number | 'all'>('all')
  const [realReviews, setRealReviews] = useState<any[] | null>(null)
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let isMounted = true
    const loadReviews = async () => {
      if (!doctor._id) return
      setIsLoading(true)
      try {
        const res = await fetchDoctorReviewsApi(doctor._id, 1, 20)
        if (isMounted && res) {
          if (Array.isArray(res.reviews) && res.reviews.length > 0) {
            setRealReviews(res.reviews)
          }
          if (res.doctorStats) {
            setStats(res.doctorStats)
          }
        }
      } catch (err) {
        console.warn('Could not fetch real reviews from backend, using profile data:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    loadReviews()
    return () => {
      isMounted = false
    }
  }, [doctor._id])

  const reviewsList = realReviews !== null
    ? realReviews.map((r: any) => ({
        _id: r._id,
        patientName: r.patientId?.name || 'Verified Patient',
        patientAvatar: r.patientId?.avatar,
        rating: r.rating || 5,
        comment: r.comment || '',
        tags: r.tags || [],
        createdAt: r.createdAt || new Date().toISOString(),
      }))
    : (doctor.reviews?.length ? doctor.reviews : [])

  const ratingAvg = (
    stats?.ratingAverage ||
    doctor.ratingAverage ||
    doctor.rating ||
    4.8
  ).toFixed(1)

  const totalReviews =
    stats?.reviewCount !== undefined
      ? stats.reviewCount
      : doctor.reviewCount || reviewsList.length

  const filteredReviews =
    selectedFilter === 'all'
      ? reviewsList
      : reviewsList.filter((r) => Math.floor(r.rating) === selectedFilter)

  // Star breakdown calculation
  const breakdown = stats?.breakdown || {
    5: { count: 0, percentage: 80 },
    4: { count: 0, percentage: 15 },
    3: { count: 0, percentage: 3 },
    2: { count: 0, percentage: 1 },
    1: { count: 0, percentage: 1 },
  }

  return (
    <div className="space-y-6">
      {/* 1. Rating Overview & Breakdown Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-7 space-y-6">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="size-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Star className="size-4 fill-amber-400" />
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
            Patient Ratings & Feedback
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Big Score Box */}
          <div className="md:col-span-4 text-center p-6 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
            <div className="text-4xl sm:text-5xl font-black text-slate-900">{ratingAvg}</div>
            <div className="flex items-center justify-center gap-1">
              {[1, 2, 3, 4, 5].map((st) => (
                <Star key={st} className="size-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-xs font-semibold text-slate-500">
              Based on {totalReviews} verified consultations
            </p>
          </div>

          {/* Progress Bars Breakdown */}
          <div className="md:col-span-8 space-y-2.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const b = breakdown[star] || { percentage: 0 }
              const pct = b.percentage || 0
              return (
                <div key={star} className="flex items-center gap-3 text-xs">
                  <span className="w-12 font-bold text-slate-600 shrink-0">{star} stars</span>
                  <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-10 text-right font-medium text-slate-400 text-[11px] shrink-0">
                    {pct}%
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Filter Pills Row */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedFilter === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Reviews ({reviewsList.length})
          </button>
          {[5, 4, 3, 2, 1].map((s) => (
            <button
              key={s}
              onClick={() => setSelectedFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                selectedFilter === s
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Star className="size-3 fill-amber-400 text-amber-400" />
              <span>{s} Star</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. List of Reviews */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white border border-slate-200/90 text-center space-y-2">
            <MessageSquare className="size-8 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-800">
              {isLoading ? 'Loading patient reviews...' : 'No verified reviews matching this filter'}
            </p>
          </div>
        ) : (
          filteredReviews.map((rev: any) => (
            <div
              key={rev._id}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {rev.patientAvatar ? (
                    <img
                      src={rev.patientAvatar}
                      alt={rev.patientName}
                      className="size-10 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="size-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                      {rev.patientName?.charAt(0) || 'P'}
                    </div>
                  )}
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">{rev.patientName}</h4>
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                      <ShieldCheck className="size-3" />
                      <span>Verified Patient Consultation</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 text-slate-800 font-bold text-xs">
                  <Star className="size-3 fill-amber-400 text-amber-400" />
                  <span>{Number(rev.rating).toFixed(1)}</span>
                </div>
              </div>

              {/* Review Tags if any */}
              {rev.tags && rev.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {rev.tags.map((t: string) => (
                    <span
                      key={t}
                      className="px-2.5 py-0.5 bg-slate-50 border border-slate-200/80 rounded-lg text-[10px] font-bold text-slate-600"
                    >
                      ✓ {t}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                "{rev.comment}"
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                <span>
                  {new Date(rev.createdAt).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
                <span className="flex items-center gap-1 text-slate-400 hover:text-blue-600 cursor-pointer">
                  <ThumbsUp className="size-3" />
                  <span>Helpful consultation review</span>
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
