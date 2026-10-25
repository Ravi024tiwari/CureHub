import type { FC } from 'react'
import { ExternalLink, CalendarClock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export const DoctorScheduleHeader: FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const handleViewProfile = () => {
    if (user?._id) {
      navigate(`/patient/doctors/${user._id}`)
    } else {
      navigate('/patient/doctors')
    }
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2.5">
          <div className="size-10 rounded-2xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600 shadow-2xs">
            <CalendarClock className="size-5 stroke-[2.2]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Schedule & Availability Management
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-3xl pl-0 sm:pl-12">
          Manage your weekly clinic routine, OPD timings, slot duration, and leaves. Your schedule
          helps patients book appointments easily.
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0 self-start sm:self-center pl-0 sm:pl-0">
        <button
          type="button"
          onClick={handleViewProfile}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 text-slate-700 hover:text-blue-600 font-bold text-xs sm:text-sm transition-all shadow-2xs cursor-pointer hover:shadow-xs active:scale-[0.98]"
        >
          <ExternalLink className="size-4 text-blue-600" />
          <span>View Public Profile</span>
        </button>
      </div>
    </div>
  )
}
