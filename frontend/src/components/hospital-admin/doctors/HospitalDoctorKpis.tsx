import { type FC } from 'react'
import {
  Stethoscope,
  Building2,
  Star,
  IndianRupee,
} from 'lucide-react'
import { useHospitalAdminDoctorsStore } from '@/store/hospitalAdminDoctorsStore'

export const HospitalDoctorKpis: FC = () => {
  const { kpis, isLoading } = useHospitalAdminDoctorsStore()

  const cards = [
    {
      title: 'Affiliated Doctors',
      value: kpis.totalDoctors.toLocaleString(),
      subtext: 'Active on duty',
      badge: 'Verified Staff',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200/60',
      icon: Stethoscope,
      iconBg: 'bg-blue-50 text-blue-600 ring-blue-500/10',
      hoverBorder: 'hover:border-blue-300',
    },
    {
      title: 'Clinical Departments',
      value: kpis.totalDepartments.toLocaleString(),
      subtext: 'Specialties covered',
      badge: 'Multi-Specialty',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
      icon: Building2,
      iconBg: 'bg-indigo-50 text-indigo-600 ring-indigo-500/10',
      hoverBorder: 'hover:border-indigo-300',
    },
    {
      title: 'Average Doctor Rating',
      value: kpis.averageRating > 0 ? kpis.averageRating.toFixed(1) : '4.8',
      subtext: 'Patient satisfaction score',
      badge: '★ Top Tier',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200/60',
      icon: Star,
      iconBg: 'bg-amber-50 text-amber-500 ring-amber-500/10',
      hoverBorder: 'hover:border-amber-300',
    },
    {
      title: 'Avg. Consultation Fee',
      value: `₹${(kpis.averageFee || 650).toLocaleString()}`,
      subtext: 'Per outpatient visit',
      badge: 'Standard OPD',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
      icon: IndianRupee,
      iconBg: 'bg-emerald-50 text-emerald-600 ring-emerald-500/10',
      hoverBorder: 'hover:border-emerald-300',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
      {cards.map((card, idx) => {
        const Icon = card.icon
        return (
          <div
            key={idx}
            className={`bg-white rounded-3xl border border-slate-200/80 p-4 sm:p-5 shadow-xs transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${card.hoverBorder} flex flex-col justify-between group`}
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <div
                className={`size-11 sm:size-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ring-1 transition-transform group-hover:scale-105 duration-300 ${card.iconBg}`}
              >
                <Icon className="size-5.5 stroke-[2.2]" />
              </div>

              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${card.badgeColor} hidden sm:inline-block`}
              >
                {card.badge}
              </span>
            </div>

            <div>
              <div className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-none group-hover:text-blue-600 transition-colors">
                {isLoading ? (
                  <div className="h-7 w-16 bg-slate-200 rounded-md animate-pulse" />
                ) : (
                  card.value
                )}
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-800 mt-1 truncate">
                {card.title}
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5 truncate hidden sm:block">
                {card.subtext}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default HospitalDoctorKpis
