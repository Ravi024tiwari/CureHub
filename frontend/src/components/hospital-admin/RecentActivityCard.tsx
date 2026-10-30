import { useState, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  UserPlus,
  CheckCircle2,
  Building2,
  CalendarCheck,
  UserCheck,
  ChevronRight,
} from 'lucide-react'
import { useHospitalAdminStore } from '@/store/hospitalAdminStore'

export const RecentActivityCard: FC = () => {
  const navigate = useNavigate()
  const { recentActivities } = useHospitalAdminStore()
  const [activeFilter, setActiveFilter] = useState<'all' | 'doctors' | 'appointments'>('all')

  const getActivityStyle = (type: string) => {
    switch (type) {
      case 'doctor_application':
        return {
          icon: UserPlus,
          bg: 'bg-blue-50 text-blue-600',
        }
      case 'appointment_completed':
        return {
          icon: CheckCircle2,
          bg: 'bg-emerald-50 text-emerald-600',
        }
      case 'hospital_updated':
        return {
          icon: Building2,
          bg: 'bg-cyan-50 text-cyan-600',
        }
      case 'appointment_booked':
        return {
          icon: CalendarCheck,
          bg: 'bg-amber-50 text-amber-600',
        }
      case 'doctor_updated':
      default:
        return {
          icon: UserCheck,
          bg: 'bg-indigo-50 text-indigo-600',
        }
    }
  }

  const filteredActivities = recentActivities.filter((act) => {
    if (activeFilter === 'doctors') {
      return act.type === 'doctor_application' || act.type === 'doctor_updated'
    }
    if (activeFilter === 'appointments') {
      return act.type === 'appointment_completed' || act.type === 'appointment_booked'
    }
    return true
  })

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-2xs flex flex-col justify-between overflow-hidden h-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Recent Activity
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Operational timeline & updates
            </p>
          </div>
          <button
            onClick={() => navigate('/hospital-admin/appointments')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="size-3.5" />
          </button>
        </div>

        {/* Micro Category Filters */}
        <div className="flex items-center gap-1.5 pt-1 pb-3 border-b border-slate-100">
          {(
            [
              { key: 'all', label: 'All' },
              { key: 'doctors', label: 'Doctors' },
              { key: 'appointments', label: 'Visits' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveFilter(tab.key)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                activeFilter === tab.key
                  ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="space-y-3 pt-3 flex-1">
        {filteredActivities.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400 font-medium">
            No activities in this category.
          </div>
        ) : (
          filteredActivities.slice(0, 5).map((act) => {
            const { icon: Icon, bg } = getActivityStyle(act.type)

            return (
              <div key={act.id} className="flex items-start justify-between gap-3 text-xs group">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div
                    className={`size-7 rounded-xl ${bg} flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="size-3.5 stroke-[2.2]" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                      {act.title}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {act.description}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap shrink-0 mt-0.5">
                  {act.timestamp}
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
export default RecentActivityCard
