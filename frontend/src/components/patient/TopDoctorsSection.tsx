import { type FC } from 'react'
import { Star, Award, CalendarPlus, Stethoscope, ChevronRight } from 'lucide-react'
import type { DoctorCardData } from '@/types/patient'
import { Button } from '@/components/ui/button'

import { useNavigate } from 'react-router-dom'

interface TopDoctorsSectionProps {
  doctors: DoctorCardData[]
  onSelectDoctor: (doctor: DoctorCardData) => void
  onBookDoctor: (doctor: DoctorCardData) => void
}

export const TopDoctorsSection: FC<TopDoctorsSectionProps> = ({
  doctors,
  onSelectDoctor,
  onBookDoctor,
}) => {
  const navigate = useNavigate()

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
            Top Doctors Near You
          </h2>
          <p className="text-xs text-slate-500">Verified specialists available for in-clinic & video consultation</p>
        </div>
        <button
          onClick={() => navigate('/patient/doctors')}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>View All</span>
          <ChevronRight className="size-3.5" />
        </button>
      </div>

      {/* Responsive Grid: 2 columns so cards are never cramped */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {doctors.map((doc) => (
          <div
            key={doc._id}
            onClick={() => onSelectDoctor(doc)}
            className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-blue-200 transition-all duration-300 flex flex-col justify-between gap-3 group cursor-pointer"
          >
            <div className="flex items-start gap-3.5">
              {/* Doctor Avatar */}
              <div className="relative size-16 sm:size-18 rounded-2xl overflow-hidden bg-slate-100 shrink-0 ring-2 ring-blue-100 shadow-xs">
                {doc.avatar ? (
                  <img
                    src={doc.avatar}
                    alt={doc.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Stethoscope className="size-7" />
                  </div>
                )}
                {/* Available Today Green Pulse */}
                <div className="absolute bottom-1 right-1 size-3 rounded-full bg-emerald-500 ring-2 ring-white shadow-xs" title="Available Today" />
              </div>

              {/* Doctor Basic Details */}
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
                    {doc.name}
                  </h3>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                    Available Today
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-xs font-semibold text-blue-600 leading-snug">
                    {doc.specialty}
                  </p>
                  {doc.qualifications && doc.qualifications.length > 0 && (
                    <span className="text-[10px] text-slate-500 font-medium bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200/60">
                      {doc.qualifications.slice(0, 2).join(', ')}
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 truncate">
                  {doc.hospitalName}
                  {doc.hospitalLocation && ` • ${doc.hospitalLocation.split(',')[0]}`}
                </p>
              </div>
            </div>

            {/* Badges & Action Row */}
            <div className="pt-2 border-t border-slate-100/90 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs flex-wrap">
                {/* Rating Badge */}
                <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200/60 font-bold text-slate-800 text-[11px]">
                  <Star className="size-3 fill-amber-400 text-amber-400" />
                  <span>{doc.rating.toFixed(1)}</span>
                  <span className="text-slate-400 font-normal">({doc.reviewCount})</span>
                </div>

                {/* Experience Badge */}
                <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200/60 text-blue-700 font-semibold text-[11px]">
                  <Award className="size-3 text-blue-600" />
                  <span>{doc.experienceYears}+ yrs</span>
                </div>

                {/* Real Fee Badge */}
                <span className="text-xs font-black text-slate-900 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/80">
                  ₹{doc.consultationFee || 500}
                </span>
              </div>

              {/* Book Button */}
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onBookDoctor(doc)
                }}
                className="h-8 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 transition-all"
              >
                <CalendarPlus className="size-3.5" />
                <span>Book</span>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
