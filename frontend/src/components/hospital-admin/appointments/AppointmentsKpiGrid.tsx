import { type FC } from 'react'
import { Building2, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { useHospitalAdminAppointmentsStore } from '@/store/hospitalAdminAppointmentsStore'

export const AppointmentsKpiGrid: FC = () => {
  const { kpis, isLoading } = useHospitalAdminAppointmentsStore()

  const cards = [
    {
      id: 'total',
      label: 'Total Appointments',
      value: kpis.total,
      trend: kpis.totalTrend || (kpis.total > 0 ? 'Live database total' : 'No records yet'),
      trendColor: 'text-emerald-600 font-semibold',
      icon: Building2,
      iconBg: 'bg-blue-50 text-blue-600',
      borderAccent: 'hover:border-blue-200',
    },
    {
      id: 'completed',
      label: 'Completed',
      value: kpis.completed,
      trend: `${kpis.completedPct}% of total`,
      trendColor: 'text-slate-500 font-medium',
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50 text-emerald-600',
      borderAccent: 'hover:border-emerald-200',
    },
    {
      id: 'upcoming',
      label: 'Upcoming',
      value: kpis.upcoming,
      trend: `${kpis.upcomingPct}% of total`,
      trendColor: 'text-slate-500 font-medium',
      icon: Clock,
      iconBg: 'bg-amber-50 text-amber-600',
      borderAccent: 'hover:border-amber-200',
    },
    {
      id: 'cancelled',
      label: 'Cancelled',
      value: kpis.cancelled,
      trend: `${kpis.cancelledPct}% of total`,
      trendColor: 'text-slate-500 font-medium',
      icon: XCircle,
      iconBg: 'bg-rose-50 text-rose-600',
      borderAccent: 'hover:border-rose-200',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.id}
            className={`bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs transition-all ${card.borderAccent}`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`size-12 rounded-2xl ${card.iconBg} flex items-center justify-center shrink-0 shadow-xs`}
              >
                <Icon className="size-6 stroke-[2.2]" />
              </div>

              <div className="min-w-0 flex-1">
                {isLoading ? (
                  <div className="h-7 w-16 bg-slate-100 rounded-lg animate-pulse" />
                ) : (
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
                    {card.value}
                  </h3>
                )}
                <p className="text-xs font-semibold text-slate-500 mt-1">{card.label}</p>
                <p className={`text-[11px] mt-0.5 ${card.trendColor}`}>{card.trend}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default AppointmentsKpiGrid

