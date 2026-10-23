import { useState, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Star,
  Heart,
  Award,
  Building2,
  MapPin,
  Video,
  UserCheck,
  CalendarPlus,
} from 'lucide-react'
import type { DoctorCardData } from '@/types/patient'
import { Button } from '@/components/ui/button'

import drPriyaImg from '@/assets/dr-priya-sharma.jpg'
import drRajeshImg from '@/assets/dr-rajesh-verma.jpg'
import drSnehaImg from '@/assets/dr-sneha-patel.jpg'
import drAmitImg from '@/assets/dr-amit-singh.jpg'

interface DoctorCardProps {
  doctor: DoctorCardData
  onBookAppointment: (doctor: DoctorCardData) => void
  onToggleFavorite?: (doctorId: string, isFav: boolean) => void
}

export const DoctorCard: FC<DoctorCardProps> = ({
  doctor,
  onBookAppointment,
  onToggleFavorite,
}) => {
  const navigate = useNavigate()
  const [isFavorite, setIsFavorite] = useState(doctor.isFavorite || false)

  // Map avatar image fallback
  const getAvatar = (doc: DoctorCardData) => {
    if (doc.avatar) return doc.avatar
    const lower = doc.name.toLowerCase()
    if (lower.includes('priya') || lower.includes('neha') || lower.includes('pooja') || lower.includes('kavita') || lower.includes('meenakshi')) {
      return drPriyaImg
    }
    if (lower.includes('rajesh') || lower.includes('vikram') || lower.includes('rohan') || lower.includes('sandeep') || lower.includes('manish')) {
      return drRajeshImg
    }
    if (lower.includes('sneha') || lower.includes('ananya') || lower.includes('sunita') || lower.includes('ritu') || lower.includes('shalini')) {
      return drSnehaImg
    }
    return drAmitImg
  }

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    const nextState = !isFavorite
    setIsFavorite(nextState)
    if (onToggleFavorite) {
      onToggleFavorite(doctor._id, nextState)
    }
  }

  const getAvailabilityBadge = (status?: string) => {
    const s = status || 'Available Today'
    if (s.toLowerCase().includes('today')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    }
    if (s.toLowerCase().includes('tomorrow')) {
      return 'bg-sky-50 text-sky-700 border-sky-200'
    }
    return 'bg-indigo-50 text-indigo-700 border-indigo-200'
  }

  const avatarSrc = getAvatar(doctor)

  return (
    <div
      onClick={() => navigate(`/patient/doctors/${doctor._id}`)}
      className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-blue-300 hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between p-4 sm:p-5 group cursor-pointer relative overflow-hidden"
    >
      {/* Top Profile Header: Avatar on left, Doctor Info beside it, Heart at top-right */}
      <div>
        <div className="flex items-start gap-3.5">
          {/* Doctor Avatar with Live Pulse Status */}
          <div className="relative size-16 sm:size-18 rounded-2xl overflow-hidden bg-slate-100 ring-2 ring-slate-100 group-hover:ring-blue-200 transition-all shrink-0 shadow-xs">
            <img
              src={avatarSrc}
              alt={doctor.name}
              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
            />
            {/* Active Specialist Status Dot */}
            <div
              className="absolute bottom-1 right-1 size-3 rounded-full bg-emerald-500 ring-2 ring-white shadow-xs"
              title={doctor.availableStatus || 'Available Today'}
            />
          </div>

          {/* Doctor Name, Specialty, Rating & Heart */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-1">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight line-clamp-1">
                {doctor.name}
              </h3>

              {/* Heart Favorite */}
              <button
                type="button"
                onClick={handleFavoriteClick}
                className="size-7 sm:size-8 rounded-full bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-125"
                title={isFavorite ? 'Remove favorite' : 'Add to favorites'}
              >
                <Heart
                  className={`size-3.5 sm:size-4 transition-colors ${
                    isFavorite ? 'fill-rose-500 text-rose-500' : ''
                  }`}
                />
              </button>
            </div>

            <p className="text-xs font-semibold text-blue-600 truncate mt-0.5">
              {doctor.specialty}
            </p>

            {/* Rating & Experience Badges */}
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/70 text-slate-900 font-bold text-[11px] shadow-2xs">
                <Star className="size-3 fill-amber-400 text-amber-400" />
                <span>{doctor.rating.toFixed(1)}</span>
                <span className="text-slate-400 font-normal">({doctor.reviewCount})</span>
              </div>

              <div className="flex items-center gap-1 bg-blue-50/80 px-2 py-0.5 rounded-full border border-blue-200/60 text-blue-700 font-semibold text-[11px]">
                <Award className="size-3 text-blue-600 shrink-0" />
                <span>{doctor.experienceYears}+ yrs</span>
              </div>

              {/* Real Doctor Qualifications (e.g. MBBS, MD) */}
              {doctor.qualifications && doctor.qualifications.length > 0 && (
                <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/70">
                  {doctor.qualifications.slice(0, 2).join(', ')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Real Doctor Bio Snippet if available */}
        {doctor.bio && (
          <p className="text-[11px] text-slate-500 line-clamp-1 mt-2.5 font-normal bg-slate-50/80 px-2.5 py-1 rounded-xl border border-slate-100">
            {doctor.bio}
          </p>
        )}

        {/* Facility & Location Details */}
        <div className="space-y-1.5 text-xs text-slate-500 pt-2.5 mt-2.5 border-t border-slate-100">
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 font-medium text-slate-700 truncate">
              <Building2 className="size-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{doctor.hospitalName}</span>
            </div>

            {/* Medical Council Verification Badge */}
            <span
              className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 shrink-0"
              title={doctor.medicalCouncilRegistrationNumber ? `Reg: ${doctor.medicalCouncilRegistrationNumber}` : 'Verified Medical Specialist'}
            >
              <UserCheck className="size-3 text-emerald-600 shrink-0" />
              <span>Verified</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate">
            <MapPin className="size-3 text-slate-400 shrink-0" />
            <span className="truncate">
              {doctor.hospitalLocation || 'Bilaspur, Chhattisgarh'}
              {doctor.distance && ` • ${doctor.distance}`}
            </span>
          </div>
        </div>

        {/* Consultation Modes & Registration Details */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 pt-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xl text-[10px] font-semibold bg-slate-50 text-slate-600 border border-slate-200 shrink-0">
              <UserCheck className="size-3 text-slate-500" />
              <span>In-clinic</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xl text-[10px] font-semibold bg-blue-50/70 text-blue-700 border border-blue-100 shrink-0">
              <Video className="size-3 text-blue-600" />
              <span>Video</span>
            </span>
          </div>

          {doctor.medicalCouncilRegistrationNumber && (
            <span className="text-[9px] font-mono text-slate-400 tracking-wider">
              {doctor.medicalCouncilRegistrationNumber}
            </span>
          )}
        </div>
      </div>

      {/* Footer: Fee, Availability & Book CTA */}
      <div className="pt-3 mt-3 border-t border-slate-100 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-base sm:text-lg font-black text-slate-900">
              ₹{doctor.consultationFee || 500}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">fee</span>
          </div>

          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border shadow-2xs ${getAvailabilityBadge(
              doctor.availableStatus
            )}`}
          >
            {doctor.availableStatus || 'Available Today'}
          </span>
        </div>

        <Button
          onClick={(e) => {
            e.stopPropagation()
            onBookAppointment(doctor)
          }}
          className="w-full h-10 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 group-hover:shadow-lg group-hover:shadow-blue-500/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <CalendarPlus className="size-4" />
          <span>Book Appointment</span>
        </Button>
      </div>
    </div>
  )
}
