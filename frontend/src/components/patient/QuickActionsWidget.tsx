import { type FC } from 'react'
import {
  CalendarPlus,
  UserCheck,
  Building2,
  FlaskConical,
  Pill,
  UploadCloud,
} from 'lucide-react'

interface QuickActionsWidgetProps {
  onOpenBooking: () => void
  onFindDoctors: () => void
  onFindHospitals: () => void
  onOpenLabTests: () => void
  onOpenPrescriptions: () => void
  onUploadReport: () => void
}

export const QuickActionsWidget: FC<QuickActionsWidgetProps> = ({
  onOpenBooking,
  onFindDoctors,
  onFindHospitals,
  onOpenLabTests,
  onOpenPrescriptions,
  onUploadReport,
}) => {
  const actions = [
    {
      id: 'book',
      label: 'Book Appointment',
      icon: CalendarPlus,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100/70 border-blue-100',
      onClick: onOpenBooking,
    },
    {
      id: 'doctors',
      label: 'Find Doctors',
      icon: UserCheck,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50 hover:bg-cyan-100/70 border-cyan-100',
      onClick: onFindDoctors,
    },
    {
      id: 'hospitals',
      label: 'Find Hospitals',
      icon: Building2,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 hover:bg-indigo-100/70 border-indigo-100',
      onClick: onFindHospitals,
    },
    {
      id: 'lab',
      label: 'Lab Tests',
      icon: FlaskConical,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50 hover:bg-teal-100/70 border-teal-100',
      onClick: onOpenLabTests,
    },
    {
      id: 'prescriptions',
      label: 'Prescriptions',
      icon: Pill,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50 hover:bg-rose-100/70 border-rose-100',
      onClick: onOpenPrescriptions,
    },
    {
      id: 'upload',
      label: 'Upload Report',
      icon: UploadCloud,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 hover:bg-purple-100/70 border-purple-100',
      onClick: onUploadReport,
    },
  ]

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3.5">
      <h3 className="text-sm font-bold text-slate-900 tracking-tight">Quick Actions</h3>

      <div className="grid grid-cols-3 gap-2.5">
        {actions.map((act) => {
          const Icon = act.icon
          return (
            <button
              key={act.id}
              onClick={act.onClick}
              className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-2 text-center transition-all duration-200 group cursor-pointer hover:shadow-xs ${act.bgColor}`}
            >
              <div className={`size-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${act.color}`}>
                <Icon className="size-5 stroke-[2]" />
              </div>
              <span className="text-[11px] font-semibold text-slate-700 leading-tight">
                {act.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
