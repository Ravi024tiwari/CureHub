import { type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Calendar } from 'lucide-react'
import { useSuperAdminStore } from '@/store/superAdminStore'

export const RecentAppointmentsTable: FC = () => {
  const navigate = useNavigate()
  const { recentAppointments } = useSuperAdminStore()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
      case 'Scheduled':
        return 'bg-amber-50 text-amber-700 border-amber-200/60'
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200/60'
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200/60'
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
            Recent Appointments
          </h3>
          <p className="text-[11px] text-slate-400 font-medium">
            Live patient consultations across all hospital OPDs
          </p>
        </div>

        <button
          onClick={() => navigate('/super-admin/appointments')}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-0.5 cursor-pointer"
        >
          <span>View All</span>
          <ChevronRight className="size-3.5" />
        </button>
      </div>

      {/* Appointment Rows */}
      <div className="space-y-2.5 overflow-x-auto">
        {recentAppointments.map((row) => (
          <div
            key={row.id}
            className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors border border-slate-100 min-w-[500px] sm:min-w-0"
          >
            {/* Patient Info */}
            <div className="flex items-center gap-2.5 min-w-[140px] sm:min-w-[160px]">
              <div className="size-9 rounded-full overflow-hidden bg-slate-200 shrink-0 border border-white shadow-2xs">
                {row.patientAvatar ? (
                  <img src={row.patientAvatar} alt={row.patientName} className="size-full object-cover" />
                ) : (
                  <div className="size-full flex items-center justify-center font-bold text-slate-500 text-xs">
                    {row.patientName.charAt(0)}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{row.patientName}</p>
                <p className="text-[10px] text-slate-400 truncate">{row.department}</p>
              </div>
            </div>

            {/* Status Pill */}
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${getStatusBadge(
                row.status
              )}`}
            >
              {row.status}
            </span>

            {/* Appointment Time */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Calendar className="size-3 text-slate-400" />
              <span>{row.time}</span>
            </div>

            {/* Assigned Doctor */}
            <div className="flex items-center gap-2 min-w-[130px] sm:min-w-[150px] justify-end text-right">
              <div className="size-8 rounded-full overflow-hidden bg-blue-50 shrink-0 border border-slate-200/60">
                {row.doctorAvatar ? (
                  <img src={row.doctorAvatar} alt={row.doctorName} className="size-full object-cover" />
                ) : (
                  <div className="size-full flex items-center justify-center text-blue-600 font-bold text-[10px]">
                    Dr
                  </div>
                )}
              </div>
              <div className="text-left min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">{row.doctorName}</p>
                <p className="text-[10px] text-slate-400">Specialist</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RecentAppointmentsTable
