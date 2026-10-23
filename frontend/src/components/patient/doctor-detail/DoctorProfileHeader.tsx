import { useState, type FC } from 'react'
import {
  CheckCircle2,
  Building2,
  MapPin,
  Briefcase,
  IndianRupee,
  Star,
  CalendarPlus,
  PhoneCall,
  Heart,
  Share2,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { DoctorDetailData } from '@/types/patient'

import drAmitImg from '@/assets/dr-amit-singh.jpg'
import drPriyaImg from '@/assets/dr-priya-sharma.jpg'
import drRajeshImg from '@/assets/dr-rajesh-verma.jpg'
import drSnehaImg from '@/assets/dr-sneha-patel.jpg'

interface DoctorProfileHeaderProps {
  doctor: DoctorDetailData
  isFavorite: boolean
  onToggleFavorite: () => void
  onBookAppointment: () => void
  onContactDoctor: () => void
}

export const DoctorProfileHeader: FC<DoctorProfileHeaderProps> = ({
  doctor,
  isFavorite,
  onToggleFavorite,
  onBookAppointment,
  onContactDoctor,
}) => {
  const [copied, setCopied] = useState(false)

  // Map portrait image fallback
  const getAvatar = () => {
    if (doctor.avatar && !doctor.avatar.includes('default')) return doctor.avatar
    const lower = (doctor.name || '').toLowerCase()
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

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${doctor.name} - CureHealth`,
          text: `Consult with ${doctor.name}, ${doctor.specialty} at ${doctor.hospitalName}.`,
          url: window.location.href,
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      }
    } catch {
      // User cancelled share
    }
  }

  const avatarSrc = getAvatar()
  const hospitalLoc = doctor.hospitalLocation || 'Civil Lines, Bilaspur, Chhattisgarh'
  const primaryQualification = doctor.qualifications?.[0] || 'MBBS, MD'
  const specializations = doctor.specialization?.length
    ? doctor.specialization
    : [doctor.specialty || doctor.department || 'Cardiology']

  const ratingVal = (doctor.ratingAverage || doctor.rating || 4.8).toFixed(1)
  const reviewCount = doctor.reviewCount || 124

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-6 lg:p-7 relative overflow-hidden transition-all duration-300 hover:shadow-md space-y-4 sm:space-y-5">
      {/* Top action icons for mobile & desktop */}
      <div className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 flex items-center gap-1.5 sm:gap-2 z-10">
        <button
          type="button"
          onClick={handleShare}
          className="size-8 sm:size-9 rounded-xl sm:rounded-2xl bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-blue-600 border border-slate-200/70 flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
          title="Share Doctor Profile"
        >
          {copied ? <Check className="size-3.5 sm:size-4 text-emerald-600" /> : <Share2 className="size-3.5 sm:size-4" />}
        </button>

        <button
          type="button"
          onClick={onToggleFavorite}
          className={`size-8 sm:size-9 rounded-xl sm:rounded-2xl border flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95 ${
            isFavorite
              ? 'bg-rose-50 border-rose-200 text-rose-500'
              : 'bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 border-slate-200/70'
          }`}
          title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
        >
          <Heart className={`size-3.5 sm:size-4 transition-transform ${isFavorite ? 'fill-rose-500 scale-110' : ''}`} />
        </button>
      </div>

      {/* Profile Header Row: Avatar + Core Info */}
      <div className="flex flex-row items-start gap-3.5 sm:gap-5 pr-20 sm:pr-24 lg:pr-0">
        {/* Avatar Squircle with Live Status Indicator */}
        <div className="relative size-20 sm:size-28 lg:size-32 rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-100 ring-2 sm:ring-4 ring-slate-100 shadow-md shrink-0">
          <img
            src={avatarSrc}
            alt={doctor.name}
            className="w-full h-full object-cover object-top"
          />
          {doctor.isActive !== false && (
            <span
              className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 size-3 sm:size-4 rounded-full bg-emerald-500 ring-2 ring-white shadow-xs"
              title="Active & Available"
            />
          )}
        </div>

        {/* Identity & Subtitles */}
        <div className="min-w-0 flex-1 space-y-1 sm:space-y-1.5 pt-0.5">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-snug truncate">
              {doctor.name}
            </h1>

            {doctor.verificationStatus?.toLowerCase().includes('verif') || doctor.verificationStatus === 'APPROVED' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs shrink-0">
                <CheckCircle2 className="size-3 text-emerald-600" />
                <span>Verified</span>
              </span>
            ) : null}

            {doctor.isActive !== false && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs shrink-0">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Active</span>
              </span>
            )}
          </div>

          <p className="text-xs sm:text-base font-bold text-blue-600 truncate">
            {doctor.specialty || doctor.department || 'Specialist'}
          </p>

          <p className="text-[11px] sm:text-sm text-slate-500 font-medium truncate">
            {primaryQualification}
          </p>
        </div>
      </div>

      {/* Key Metrics & Highlights: Interactive 4-Box Grid on all devices */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 pt-1">
        {/* Hospital Card */}
        <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-50/80 hover:bg-blue-50/50 border border-slate-200/60 transition-all flex items-center gap-2.5">
          <div className="size-8 sm:size-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Building2 className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
              Hospital
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-900 truncate block" title={doctor.hospitalName}>
              {doctor.hospitalName}
            </span>
          </div>
        </div>

        {/* Location Card */}
        <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-50/80 hover:bg-emerald-50/50 border border-slate-200/60 transition-all flex items-center gap-2.5">
          <div className="size-8 sm:size-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <MapPin className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
              Location
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-900 truncate block" title={hospitalLoc}>
              {hospitalLoc.split(',')[0] || hospitalLoc}
            </span>
          </div>
        </div>

        {/* Experience Card */}
        <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-50/80 hover:bg-indigo-50/50 border border-slate-200/60 transition-all flex items-center gap-2.5">
          <div className="size-8 sm:size-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <Briefcase className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
              Experience
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-900 truncate block">
              {doctor.experienceYears}+ Years
            </span>
          </div>
        </div>

        {/* Fee & Rating Card */}
        <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-50/80 hover:bg-amber-50/50 border border-slate-200/60 transition-all flex items-center gap-2.5">
          <div className="size-8 sm:size-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <IndianRupee className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
              Consultation Fee
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-900 truncate block">
              ₹{doctor.consultationFee || 500}
            </span>
          </div>
        </div>
      </div>

      {/* Specialization Tags (Horizontal scroll on mobile, flex-wrap on desktop) */}
      <div className="pt-0.5">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 -mx-1 px-1">
          {specializations.map((spec, idx) => (
            <span
              key={idx}
              className="px-2.5 sm:px-3 py-1 rounded-xl text-[11px] sm:text-xs font-semibold bg-blue-50/80 text-blue-700 border border-blue-100 whitespace-nowrap shrink-0 hover:bg-blue-100 transition-colors"
            >
              {spec}
            </span>
          ))}
        </div>
      </div>

      {/* Rating & Action CTA Buttons: Responsive Layout */}
      <div className="pt-2 sm:pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Rating Display */}
        <div className="flex items-center justify-between sm:justify-start gap-2">
          <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200/80 text-slate-900 font-black text-xs sm:text-sm shadow-2xs">
            <Star className="size-3.5 sm:size-4 fill-amber-400 text-amber-400" />
            <span>{ratingVal}</span>
          </div>
          <span className="text-xs text-slate-500 font-semibold">
            ({reviewCount} verified reviews)
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
          <Button
            onClick={onBookAppointment}
            className="h-10 sm:h-11 px-4 sm:px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2"
          >
            <CalendarPlus className="size-4" />
            <span>Book Appointment</span>
          </Button>

          <Button
            variant="outline"
            onClick={onContactDoctor}
            className="h-10 sm:h-11 px-3.5 sm:px-5 rounded-2xl border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm hover:border-slate-400 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2"
          >
            <PhoneCall className="size-4 text-blue-600" />
            <span>Contact Doctor</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
