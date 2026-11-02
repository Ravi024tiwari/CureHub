import { type FC } from 'react'
import {
  ChevronRight,
  UserPlus,
  Building2,
  CalendarCheck2,
  Calendar,
  ShieldCheck,
} from 'lucide-react'
import { useSuperAdminStore } from '@/store/superAdminStore'

export const RecentActivityTimeline: FC = () => {
  const { recentActivities } = useSuperAdminStore()

  const getIconConfig = (type: string) => {
    switch (type) {
      case 'doctor':
        return {
          icon: UserPlus,
          bg: 'bg-emerald-50 text-emerald-600 border-emerald-200/60',
        }
      case 'hospital':
        return {
          icon: Building2,
          bg: 'bg-blue-50 text-blue-600 border-blue-200/60',
        }
      case 'leave':
        return {
          icon: CalendarCheck2,
          bg: 'bg-orange-50 text-orange-600 border-orange-200/60',
        }
      case 'appointment':
        return {
          icon: Calendar,
          bg: 'bg-amber-50 text-amber-600 border-amber-200/60',
        }
      default:
        return {
          icon: ShieldCheck,
          bg: 'bg-emerald-50 text-emerald-600 border-emerald-200/60',
        }
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
            Recent Activity
          </h3>
          <p className="text-[11px] text-slate-400 font-medium">
            Real-time platform events & administrative actions
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-[10px] font-bold">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Updates</span>
        </div>
      </div>

      {/* Activity Timeline List */}
      {recentActivities.length === 0 ? (
        <div className="py-8 text-center flex flex-col items-center justify-center">
          <div className="size-11 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mb-2 shadow-2xs border border-slate-100">
            <ShieldCheck className="size-5 stroke-[2]" />
          </div>
          <p className="text-xs font-bold text-slate-700">No Recent Activity</p>
          <p className="text-[11px] text-slate-400 max-w-[220px] mt-0.5">
            Platform actions and registrations will stream here.
          </p>
        </div>
      ) : (
      <div className="space-y-3 divide-y divide-slate-100">
        {recentActivities.map((act) => {
          const config = getIconConfig(act.type)
          const Icon = config.icon

          return (
            <div
              key={act.id}
              className="pt-2.5 first:pt-0 flex items-center justify-between gap-3 group cursor-pointer hover:bg-slate-50/60 p-1 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`size-8.5 rounded-xl flex items-center justify-center shrink-0 border ${config.bg}`}
                >
                  <Icon className="size-4 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                    {act.title}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0 text-[11px] text-slate-400 font-medium">
                <span>{act.timestamp}</span>
                <ChevronRight className="size-3 text-slate-300 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          )
        })}
      </div>
      )}
    </div>
  )
}

export default RecentActivityTimeline
