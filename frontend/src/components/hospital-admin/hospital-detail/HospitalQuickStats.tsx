import { type FC } from 'react'
import {
  Bed,
  Stethoscope,
  Calendar,
  Users,
} from 'lucide-react'

interface HospitalQuickStatsProps {
  totalBeds: number
  totalDoctors: number
  totalAppointments: number
  totalPatients: number
}

export const HospitalQuickStats: FC<HospitalQuickStatsProps> = ({
  totalBeds,
  totalDoctors,
  totalAppointments,
  totalPatients,
}) => {
  const stats = [
    {
      label: 'Total Beds',
      value: totalBeds.toLocaleString(),
      icon: Bed,
      color: 'blue',
      bgColor: 'bg-blue-50 text-blue-600 ring-blue-500/10',
      borderHover: 'hover:border-blue-200',
    },
    {
      label: 'Doctors',
      value: totalDoctors.toLocaleString(),
      icon: Stethoscope,
      color: 'teal',
      bgColor: 'bg-teal-50 text-teal-600 ring-teal-500/10',
      borderHover: 'hover:border-teal-200',
    },
    {
      label: 'Total Appointments',
      value: totalAppointments.toLocaleString(),
      icon: Calendar,
      color: 'indigo',
      bgColor: 'bg-indigo-50 text-indigo-600 ring-indigo-500/10',
      borderHover: 'hover:border-indigo-200',
    },
    {
      label: 'Total Patients',
      value: totalPatients.toLocaleString(),
      icon: Users,
      color: 'purple',
      bgColor: 'bg-purple-50 text-purple-600 ring-purple-500/10',
      borderHover: 'hover:border-purple-200',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon
        return (
          <div
            key={idx}
            className={`bg-white rounded-3xl border border-slate-200/80 p-4 sm:p-5 shadow-xs transition-all duration-300 hover:shadow-md ${stat.borderHover} flex items-center gap-3.5 group`}
          >
            <div
              className={`size-12 sm:size-13 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ring-1 transition-transform group-hover:scale-105 duration-300 ${stat.bgColor}`}
            >
              <Icon className="size-6 stroke-[2.2]" />
            </div>

            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none group-hover:text-blue-600 transition-colors">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-500 mt-1 truncate">
                {stat.label}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
