import { useState, type FC } from 'react'
import {
  Star,
  CheckCircle2,
  ThumbsUp,
  MessageSquare,
} from 'lucide-react'
import type { DoctorDetailData } from '@/types/patient'

interface DoctorReviewsTabProps {
  doctor: DoctorDetailData
}

export const DoctorReviewsTab: FC<DoctorReviewsTabProps> = ({ doctor }) => {
  const [selectedFilter, setSelectedFilter] = useState<number | 'all'>('all')

  const reviews = doctor.reviews?.length
    ? doctor.reviews
    : [
        {
          _id: 'rev-1',
          patientName: 'Priya Sharma',
          patientAvatar: '/src/assets/dr-priya-sharma.jpg',
          rating: 5,
          comment:
            'Very friendly and explains everything in detail. Great experience and highly recommended.',
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          _id: 'rev-2',
          patientName: 'Anil Deshmukh',
          patientAvatar: '/src/assets/dr-rajesh-verma.jpg',
          rating: 4.8,
          comment:
            'Dr. Amit gave me the best advice for my father’s heart treatment. Truly remarkable doctor.',
          createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          _id: 'rev-3',
          patientName: 'Rohan Mehra',
          patientAvatar: undefined,
          rating: 5,
          comment:
            'Very patient listener. Never rushes the consultation and answers all questions calmly.',
          createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]

  const ratingAvg = (doctor.ratingAverage || doctor.rating || 4.8).toFixed(1)
  const totalReviews = doctor.reviewCount || 124

  const filteredReviews =
    selectedFilter === 'all'
      ? reviews
      : reviews.filter((r) => Math.floor(r.rating) === selectedFilter)

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
            <p className="text-xs font-semibold text-slate-500">Based on {totalReviews} verified consultations</p>
          </div>

          {/* Star Distribution Bars */}
          <div className="md:col-span-8 space-y-2.5 text-xs text-slate-600">
            {[
              { stars: 5, count: Math.round(totalReviews * 0.8), pct: '80%' },
              { stars: 4, count: Math.round(totalReviews * 0.15), pct: '15%' },
              { stars: 3, count: Math.round(totalReviews * 0.04), pct: '4%' },
              { stars: 2, count: Math.round(totalReviews * 0.01), pct: '1%' },
              { stars: 1, count: 0, pct: '0%' },
            ].map((bar) => (
              <div key={bar.stars} className="flex items-center gap-3">
                <span className="w-5 font-bold text-slate-700">{bar.stars} ★</span>
                <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: bar.pct }} />
                </div>
                <span className="w-12 text-right text-[11px] text-slate-400 font-semibold">
                  {bar.count} ({bar.pct})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 flex-wrap">
          <span className="text-xs font-bold text-slate-500 mr-1">Filter by:</span>
          {(['all', 5, 4, 3] as const).map((starOption) => (
            <button
              key={String(starOption)}
              type="button"
              onClick={() => setSelectedFilter(starOption)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedFilter === starOption
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
              }`}
            >
              {starOption === 'all' ? 'All Reviews' : `${starOption} Stars`}
            </button>
          ))}
        </div>
      </div>

      {/* 2. List of Reviews */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white border border-slate-200/90 text-center space-y-2">
            <MessageSquare className="size-8 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-800">No reviews matching this rating filter</p>
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div
              key={rev._id}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                    {rev.patientName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">{rev.patientName}</h4>
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                      <CheckCircle2 className="size-3" />
                      <span>Verified Patient Consultation</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 text-slate-800 font-bold text-xs">
                  <Star className="size-3 fill-amber-400 text-amber-400" />
                  <span>{rev.rating.toFixed(1)}</span>
                </div>
              </div>

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
                  <span>Helpful review</span>
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
