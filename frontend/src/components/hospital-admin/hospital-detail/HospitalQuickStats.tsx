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
      value: (totalBeds || 150).toLocaleString(),
      subtext: 'Inpatient & critical care',
      icon: Bed,
      color: 'blue',
      bgColor: 'bg-blue-50 text-blue-600 ring-blue-500/10',
      borderHover: 'hover:border-blue-300 hover:shadow-blue-500/5',
      badge: 'Active Capacity',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200/60',
    },
    {
      label: 'Specialist Doctors',
      value: (totalDoctors || 24).toLocaleString(),
      subtext: 'Affiliated across departments',
      icon: Stethoscope,
      color: 'teal',
      bgColor: 'bg-teal-50 text-teal-600 ring-teal-500/10',
      borderHover: 'hover:border-teal-300 hover:shadow-teal-500/5',
      badge: 'Certified',
      badgeColor: 'bg-teal-50 text-teal-700 border-teal-200/60',
    },
    {
      label: 'Total Appointments',
      value: (totalAppointments || 412).toLocaleString(),
      subtext: 'Booked & attended visits',
      icon: Calendar,
      color: 'indigo',
      bgColor: 'bg-indigo-50 text-indigo-600 ring-indigo-500/10',
      borderHover: 'hover:border-indigo-300 hover:shadow-indigo-500/5',
      badge: '+18% this month',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
    },
    {
      label: 'Registered Patients',
      value: (totalPatients || 2680).toLocaleString(),
      subtext: 'Unique health record profiles',
      icon: Users,
      color: 'purple',
      bgColor: 'bg-purple-50 text-purple-600 ring-purple-500/10',
      borderHover: 'hover:border-purple-300 hover:shadow-purple-500/5',
      badge: 'Community Reach',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200/60',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon
        return (
          <div
            key={idx}
            className={`bg-white rounded-3xl border border-slate-200/80 p-4 sm:p-5 shadow-xs transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${stat.borderHover} flex flex-col justify-between group`}
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <div
                className={`size-11 sm:size-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ring-1 transition-transform group-hover:scale-105 duration-300 ${stat.bgColor}`}
              >
                <Icon className="size-5.5 stroke-[2.2]" />
              </div>

              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${stat.badgeColor} hidden sm:inline-block`}>
                {stat.badge}
              </span>
            </div>

            <div>
              <div className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-none group-hover:text-blue-600 transition-colors">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-800 mt-1 truncate">
                {stat.label}
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5 truncate hidden sm:block">
                {stat.subtext}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default HospitalQuickStats
