import type { FC } from 'react'
import { Calendar, Users, Star, CheckCircle2 } from 'lucide-react'

interface DoctorPracticeKpiGridProps {
  todayTotal?: number
  todayCompleted?: number
  totalPatientsTreated?: number
  averageRating?: number
  reviewCount?: number
  totalCompletedLifetime?: number
}

export const DoctorPracticeKpiGrid: FC<DoctorPracticeKpiGridProps> = ({
  todayTotal = 0,
  todayCompleted = 0,
  totalPatientsTreated = 0,
  averageRating = 4.8,
  reviewCount = 0,
  totalCompletedLifetime = 0,
}) => {
  const cards = [
    {
      id: 'today-appointments',
      title: "Today's Appointments",
      value: todayTotal.toLocaleString(),
      subtext: `${todayCompleted} completed today`,
      icon: Calendar,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
      borderColor: 'border-slate-200/90 hover:border-blue-200',
    },
    {
      id: 'total-patients',
      title: 'Total Patients',
      value: totalPatientsTreated.toLocaleString(),
      subtext: 'Lifetime treated cases',
      icon: Users,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
      borderColor: 'border-slate-200/90 hover:border-emerald-200',
    },
    {
      id: 'average-rating',
      title: 'Average Rating',
      value: (averageRating || 4.8).toFixed(1),
      subtext: reviewCount > 0 ? `From ${reviewCount} reviews` : 'Top Rated Practitioner',
      icon: Star,
      iconColor: 'text-amber-500 fill-amber-500',
      iconBg: 'bg-amber-50',
      borderColor: 'border-slate-200/90 hover:border-amber-200',
    },
    {
      id: 'completed-consultations',
      title: 'Completed Consultations',
      value: totalCompletedLifetime.toLocaleString(),
      subtext: 'Clinical sessions verified',
      icon: CheckCircle2,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-50',
      borderColor: 'border-slate-200/90 hover:border-purple-200',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.id}
            className={`bg-white rounded-2xl border p-3.5 sm:p-5 transition-all shadow-2xs hover:shadow-xs group select-none ${card.borderColor}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1 min-w-0 flex-1">
                <span className="text-[11px] sm:text-xs font-bold text-slate-500 block tracking-tight truncate">
                  {card.title}
                </span>
                <p className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {card.value}
                </p>
                <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium block truncate">
                  {card.subtext}
                </span>
              </div>

              <div
                className={`size-9 sm:size-11 rounded-xl sm:rounded-2xl ${card.iconBg} flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform`}
              >
                <Icon className={`size-4.5 sm:size-5.5 ${card.iconColor}`} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default DoctorPracticeKpiGrid
