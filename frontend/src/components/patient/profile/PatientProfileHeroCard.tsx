import { type FC } from 'react'
import {
  Camera,
  ShieldCheck,
  HeartPulse,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Sparkles,
  Droplet,
  CheckCircle2,
} from 'lucide-react'

interface PatientProfileHeroCardProps {
  name: string
  email: string
  phoneNumber?: string
  avatar?: string
  bloodGroup?: string | null
  gender?: string | null
  dateOfBirth?: string | null
  city?: string
  totalReports?: number
  completeness: number
  onOpenAvatarModal: () => void
}

export const PatientProfileHeroCard: FC<PatientProfileHeroCardProps> = ({
  name,
  email,
  phoneNumber,
  avatar,
  bloodGroup,
  gender,
  dateOfBirth,
  city,
  totalReports = 0,
  completeness,
  onOpenAvatarModal,
}) => {
  // Compute approximate age if DOB available
  const calculateAge = (dobStr?: string | null) => {
    if (!dobStr) return null
    try {
      const birth = new Date(dobStr)
      if (isNaN(birth.getTime())) return null
      const now = new Date()
      let age = now.getFullYear() - birth.getFullYear()
      const m = now.getMonth() - birth.getMonth()
      if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
        age--
      }
      return age > 0 ? `${age} yrs` : null
    } catch {
      return null
    }
  }

  const ageDisplay = calculateAge(dateOfBirth)

  return (
    <div className="relative rounded-3xl bg-gradient-to-br from-white via-slate-50/80 to-[#eef3ff]/60 border border-slate-200/90 p-5 sm:p-7 shadow-lg shadow-[#5170f4]/5 overflow-hidden">
      {/* Decorative ambient background blur */}
      <div className="absolute top-0 right-0 w-80 h-44 bg-[#637ff5]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-60 h-32 bg-[#7a94fd]/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-start justify-between gap-6 sm:gap-8">
        {/* Left Side: Avatar & Core Identity */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-6">
          {/* Avatar with Interactive Upload Trigger */}
          <div className="relative group shrink-0">
            <div className="size-24 sm:size-28 rounded-3xl overflow-hidden ring-4 ring-white shadow-xl shadow-[#5170f4]/15 bg-gradient-to-tr from-[#5170f4] to-[#7a94fd] flex items-center justify-center text-white font-black text-3xl">
              {avatar ? (
                <img
                  src={avatar}
                  alt={name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <span>{name ? name.charAt(0).toUpperCase() : 'P'}</span>
              )}
            </div>

            {/* Camera Floating Button */}
            <button
              type="button"
              onClick={onOpenAvatarModal}
              className="absolute -bottom-1.5 -right-1.5 size-9 rounded-2xl bg-white hover:bg-[#eef3ff] text-[#5170f4] border border-[#c8d7fd] shadow-md flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-110 active:scale-95"
              title="Change profile picture"
            >
              <Camera className="size-4.5 stroke-[2.2]" />
            </button>
          </div>

          {/* User Details */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {name || 'Patient User'}
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-[11px] font-extrabold shadow-2xs">
                <ShieldCheck className="size-3.5 text-emerald-600" />
                <span>Verified Patient</span>
              </span>
            </div>

            {/* Email, Phone & Location badges */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-1.5">
                <Mail className="size-3.5 text-[#637ff5] shrink-0" />
                <span>{email || 'No email attached'}</span>
              </div>
              {phoneNumber && (
                <div className="flex items-center gap-1.5">
                  <Phone className="size-3.5 text-emerald-600 shrink-0" />
                  <span>{phoneNumber}</span>
                </div>
              )}
              {city && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-rose-500 shrink-0" />
                  <span>{city}</span>
                </div>
              )}
            </div>

            {/* Clinical Highlights Pills */}
            <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              {bloodGroup && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-black">
                  <Droplet className="size-3 text-rose-500 fill-rose-500" />
                  <span>Blood Group: {bloodGroup}</span>
                </span>
              )}
              {gender && (
                <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold capitalize">
                  {gender.toLowerCase()}
                </span>
              )}
              {ageDisplay && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold">
                  <Calendar className="size-3" />
                  <span>{ageDisplay}</span>
                </span>
              )}
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#eef3ff] text-[#5170f4] text-xs font-bold border border-[#c8d7fd]/60">
                <HeartPulse className="size-3 text-[#637ff5]" />
                <span>{totalReports} Reports Linked</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Profile Completeness Meter Card */}
        <div className="w-full sm:w-auto lg:min-w-[240px] p-4 sm:p-5 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-[#637ff5]" />
              <span>Profile Health</span>
            </span>
            <span className="text-sm font-black text-[#5170f4]">
              {completeness}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#5170f4] via-[#637ff5] to-emerald-500 transition-all duration-700"
              style={{ width: `${Math.min(100, Math.max(10, completeness))}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
            {completeness >= 90
              ? 'Excellent! Your clinical profile is complete for seamless OPD visits.'
              : 'Add your emergency contact and medical history to reach 100% complete.'}
          </p>

          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 pt-0.5">
            <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
            <span>Ayushman Bharat (ABHA) Ready</span>
          </div>
        </div>
      </div>
    </div>
  )
}
