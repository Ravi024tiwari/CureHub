import { type FC } from 'react'

interface HospitalCardSkeletonProps {
  count?: number
}

export const HospitalCardSkeleton: FC<HospitalCardSkeletonProps> = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={`hospital-card-skeleton-${idx}`}
          className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between animate-pulse"
        >
          {/* Top image placeholder with shimmer */}
          <div className="relative h-48 w-full bg-slate-200/80 overflow-hidden shrink-0">
            {/* Shimmer sweep effect */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />

            {/* Badges placeholders */}
            <div className="absolute top-3 left-3 w-20 h-6 rounded-full bg-slate-300/80" />
            <div className="absolute top-3 right-3 size-8 rounded-full bg-slate-300/80" />
            <div className="absolute bottom-3 right-3 w-16 h-5 rounded-full bg-slate-300/80" />
          </div>

          {/* Details body */}
          <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              {/* Title & Rating */}
              <div className="w-3/4 h-5 rounded-lg bg-slate-200/90" />
              <div className="flex items-center gap-2">
                <div className="size-3.5 rounded-full bg-slate-200" />
                <div className="w-12 h-3.5 rounded-md bg-slate-200/80" />
                <div className="w-16 h-3.5 rounded-md bg-slate-100" />
              </div>
              {/* Address */}
              <div className="w-5/6 h-3.5 rounded-md bg-slate-100 mt-1" />
            </div>

            {/* Feature tags */}
            <div className="flex gap-2">
              <div className="w-20 h-5 rounded-xl bg-slate-100" />
              <div className="w-24 h-5 rounded-xl bg-slate-100" />
            </div>

            {/* Footer with Bed info and CTA button */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="w-20 h-4 rounded-md bg-slate-100" />
              <div className="w-24 h-8 rounded-xl bg-slate-200/80" />
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

export default HospitalCardSkeleton

