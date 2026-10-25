import type { FC } from 'react'
import { Calendar, Clock, CheckCircle2, XCircle } from 'lucide-react'
import type { DoctorAppointmentCounts } from '@/services/doctorService'

interface DoctorAppointmentsKpiCardsProps {
  counts: DoctorAppointmentCounts
  activeTab: 'today' | 'upcoming' | 'past'
  onSelectTab: (tab: 'today' | 'upcoming' | 'past') => void
}

export const DoctorAppointmentsKpiCards: FC<DoctorAppointmentsKpiCardsProps> = ({
  counts,
  activeTab,
  onSelectTab,
}) => {
  const cards = [
    {
      id: 'today' as const,
      label: "Today's Queue",
      value: counts.today,
      subtitle: `${counts.todayWaiting} waiting`,
      icon: Calendar,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50 border border-blue-100',
      activeClasses:
        activeTab === 'today'
          ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20 shadow-xs'
          : 'bg-white border-slate-200/90 hover:border-blue-200 hover:shadow-2xs',
      badgeText: counts.todayInProgress > 0 ? 'Consulting' : 'In Clinic',
      badgeStyle: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      id: 'upcoming' as const,
      label: 'Upcoming',
      value: counts.upcoming,
      subtitle: 'Scheduled',
      icon: Clock,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50 border border-amber-100',
      activeClasses:
        activeTab === 'upcoming'
          ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20 shadow-xs'
          : 'bg-white border-slate-200/90 hover:border-amber-200 hover:shadow-2xs',
      badgeText: 'Future',
      badgeStyle: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      id: 'past' as const,
      label: 'Completed',
      value: counts.completed,
      subtitle: 'Discharged',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50 border border-emerald-100',
      activeClasses:
        activeTab === 'past'
          ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20 shadow-xs'
          : 'bg-white border-slate-200/90 hover:border-emerald-200 hover:shadow-2xs',
      badgeText: 'Treated',
      badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      id: 'cancelled' as const,
      label: 'Cancelled / Missed',
      value: counts.cancelled,
      subtitle: `${counts.todayCancelled} today`,
      icon: XCircle,
      iconColor: 'text-rose-600',
      iconBg: 'bg-rose-50 border border-rose-100',
      activeClasses: 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-2xs',
      badgeText: 'Released',
      badgeStyle: 'bg-rose-50 text-rose-700 border-rose-200',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        const isClickable = card.id !== 'cancelled'
        return (
          <button
            key={card.id}
            type="button"
            onClick={() => isClickable && onSelectTab(card.id as any)}
            className={`w-full text-left p-3 sm:p-4 rounded-2xl border transition-all duration-200 select-none flex items-center gap-3 sm:gap-3.5 group relative overflow-hidden ${
              card.activeClasses
            } ${isClickable ? 'cursor-pointer hover:scale-[1.01]' : 'cursor-default'}`}
          >
            {/* Left Icon */}
            <div
              className={`size-10 sm:size-11 rounded-xl flex items-center justify-center shrink-0 ${card.iconBg} ${card.iconColor} transition-transform group-hover:scale-105 shadow-2xs`}
            >
              <Icon className="size-5 stroke-[2.2]" />
            </div>

            {/* Metric Details */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1.5">
                <span className="text-[11px] sm:text-xs font-bold text-slate-500 truncate leading-none">
                  {card.label}
                </span>
                <span
                  className={`text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-md border shrink-0 hidden xs:inline-block ${card.badgeStyle}`}
                >
                  {card.badgeText}
                </span>
              </div>

              <div className="flex items-baseline gap-1.5 sm:gap-2 mt-1 sm:mt-1.5">
                <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
                  {card.value}
                </span>
                <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate leading-none">
                  {card.subtitle}
                </span>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
