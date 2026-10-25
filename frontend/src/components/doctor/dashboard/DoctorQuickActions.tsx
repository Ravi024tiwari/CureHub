import type { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarPlus,
  FileText,
  UploadCloud,
  Clock,
  CalendarOff,
  BarChart3,
  Sparkles,
} from 'lucide-react'

export const DoctorQuickActions: FC = () => {
  const navigate = useNavigate()

  const actions = [
    {
      label: 'New Appointment',
      desc: 'Book OPD Walk-in',
      icon: CalendarPlus,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50 group-hover:bg-blue-600 group-hover:text-white',
      path: '/doctor/appointments',
    },
    {
      label: 'Add Prescription',
      desc: 'Issue digital Rx',
      icon: FileText,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-50 group-hover:bg-purple-600 group-hover:text-white',
      path: '/doctor/prescriptions',
    },
    {
      label: 'Upload Report',
      desc: 'Lab / Radiology files',
      icon: UploadCloud,
      iconColor: 'text-sky-600',
      iconBg: 'bg-sky-50 group-hover:bg-sky-600 group-hover:text-white',
      path: '/doctor/reports',
    },
    {
      label: 'Manage Schedule',
      desc: 'Configure OPD hours',
      icon: Clock,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50 group-hover:bg-amber-600 group-hover:text-white',
      path: '/doctor/schedule',
    },
    {
      label: 'Mark Leave',
      desc: 'Request off-duty',
      icon: CalendarOff,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50 group-hover:bg-emerald-600 group-hover:text-white',
      path: '/doctor/leaves',
    },
    {
      label: 'View Analytics',
      desc: 'Practice performance',
      icon: BarChart3,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white',
      path: '/doctor/reports',
    },
  ]

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Sparkles className="size-4.5 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900">Quick Actions</h3>
            <p className="text-[11px] text-slate-400 font-medium">
              Frequent clinical practice shortcuts
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {actions.map((act) => {
          const Icon = act.icon
          return (
            <button
              key={act.label}
              type="button"
              onClick={() => navigate(act.path)}
              className="p-3.5 rounded-2xl bg-slate-50/80 hover:bg-white border border-slate-200/70 hover:border-blue-300 hover:shadow-sm transition-all duration-200 text-left flex flex-col justify-between gap-3 group cursor-pointer"
            >
              <div
                className={`size-10 rounded-xl ${act.iconBg} flex items-center justify-center transition-colors shadow-2xs`}
              >
                <Icon className={`size-5 ${act.iconColor} group-hover:text-white transition-colors`} />
              </div>
              <div>
                <p className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                  {act.label}
                </p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5 truncate">
                  {act.desc}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default DoctorQuickActions
