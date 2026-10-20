import { type FC } from 'react'
import { Calendar, Clock, ChevronRight } from 'lucide-react'
import type { AppointmentCardData } from '@/types/patient'

interface AppointmentsWidgetProps {
  appointments: AppointmentCardData[]
  onViewAll: () => void
  onSelectAppointment: (appointment: AppointmentCardData) => void
}

export const AppointmentsWidget: FC<AppointmentsWidgetProps> = ({
  appointments,
  onViewAll,
  onSelectAppointment,
}) => {
  const getStatusBadge = (status: AppointmentCardData['status']) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'Completed':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200'
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200'
    }
  }

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">Upcoming Appointments</h3>
        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
        >
          View All
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {appointments.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            No upcoming appointments found.
          </div>
        ) : (
          appointments.map((appt) => (
            <div
              key={appt._id}
              onClick={() => onSelectAppointment(appt)}
              className="p-3.5 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/20 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-2">
                {/* Doctor Avatar & Info */}
                <div className="flex items-start gap-3">
                  <div className="size-10 rounded-xl overflow-hidden bg-slate-100 shrink-0 ring-1 ring-slate-100">
                    {appt.doctorAvatar ? (
                      <img
                        src={appt.doctorAvatar}
                        alt={appt.doctorName}
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <div className="w-full h-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                        {appt.doctorName.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {appt.doctorName}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-medium">{appt.doctorSpecialty}</p>
                  </div>
                </div>

                {/* Status Badge */}
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
                    appt.status
                  )}`}
                >
                  {appt.status}
                </span>
              </div>

              {/* Date & Hospital details */}
              <div className="mt-3 pt-2.5 border-t border-slate-100/80 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5 font-medium">
                  <Calendar className="size-3 text-slate-400" />
                  <span>{appt.date}</span>
                  <span className="text-slate-300">•</span>
                  <Clock className="size-3 text-slate-400" />
                  <span>{appt.time}</span>
                </div>

                <ChevronRight className="size-3.5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </div>

              <div className="mt-1 text-[10px] text-slate-400 truncate">
                {appt.hospitalName}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
