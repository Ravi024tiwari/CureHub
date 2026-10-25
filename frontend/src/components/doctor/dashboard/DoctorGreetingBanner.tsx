import type { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CheckCircle2,
  ChevronRight,
  Building2,
  UserCheck,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react'

interface DoctorGreetingBannerProps {
  doctorName?: string
  avatar?: string | null
  department?: string
  hospitalName?: string | null
  hospitalCity?: string | null
  todayAppointmentsCount?: number
  lifetimePatientsCount?: number
}

export const DoctorGreetingBanner: FC<DoctorGreetingBannerProps> = ({
  doctorName = 'Doctor',
  avatar,
  department = 'General OPD',
  hospitalName,
  hospitalCity,
  todayAppointmentsCount = 0,
  lifetimePatientsCount = 0,
}) => {
  const navigate = useNavigate()

  // Dynamic professional greeting without emojis
  const getGreetingText = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  const greetingText = getGreetingText()
  const displayHospital = hospitalName || 'Independent Practice'

  return (
    <div className="bg-gradient-to-br from-white via-white to-blue-50/40 rounded-3xl border border-slate-200/90 p-4.5 sm:p-6 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-5">
      {/* Doctor Identity & Welcome */}
      <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 min-w-0 w-full md:w-auto">
        <div className="size-13 sm:size-16 rounded-2xl overflow-hidden bg-gradient-to-tr from-blue-100 to-indigo-100 shrink-0 border border-slate-200/90 shadow-2xs flex items-center justify-center">
          {avatar ? (
            <img src={avatar} alt={doctorName} className="size-full object-cover" />
          ) : (
            <span className="font-black text-xl sm:text-2xl text-blue-700">
              {doctorName.replace('Dr. ', '').charAt(0) || 'D'}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
              {greetingText}, {doctorName}!
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-50 text-blue-700 border border-blue-200/70 shrink-0">
              <Stethoscope className="size-3 text-blue-600" />
              <span>{department}</span>
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
            Here's your practice overview for today. You have{' '}
            <strong className="text-blue-600 font-bold">{todayAppointmentsCount} OPD appointments</strong>{' '}
            scheduled and <strong className="text-slate-800 font-bold">{lifetimePatientsCount} treated patients</strong>.
          </p>
        </div>
      </div>

      {/* Verified Profile / Practice Card */}
      <div
        onClick={() => navigate('/doctor/profile')}
        className="w-full md:w-auto shrink-0 bg-slate-50/90 hover:bg-blue-50/70 border border-slate-200/80 hover:border-blue-200 rounded-2xl p-3 sm:px-4 sm:py-3 transition-all cursor-pointer flex items-center justify-between gap-3 group shadow-2xs select-none"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-9 sm:size-10 rounded-xl bg-white border border-slate-200/80 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
            <ShieldCheck className="size-4.5 sm:size-5 stroke-[2.2]" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-slate-900">Your Profile</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                <CheckCircle2 className="size-2.5 text-emerald-600 stroke-[2.5]" />
                <span>Verified</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-semibold truncate flex items-center gap-1 mt-0.5">
              {hospitalName ? (
                <Building2 className="size-3 text-blue-500 shrink-0" />
              ) : (
                <UserCheck className="size-3 text-emerald-500 shrink-0" />
              )}
              <span className="truncate">
                {displayHospital} {hospitalCity ? `• ${hospitalCity}` : ''}
              </span>
            </p>
          </div>
        </div>

        <ChevronRight className="size-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
      </div>
    </div>
  )
}

export default DoctorGreetingBanner
