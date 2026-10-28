import { type FC } from 'react'
import { Building2, ToggleRight, CircleOff, BedDouble } from 'lucide-react'
import { useHospitalBranchesStore } from '@/store/hospitalBranchesStore'

export const HospitalKpiCards: FC = () => {
  const { kpis, filters, setFilter } = useHospitalBranchesStore()

  const cards = [
    {
      id: 'total',
      label: 'Total Hospitals',
      count: kpis.totalHospitals,
      icon: Building2,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      activeRing: 'ring-2 ring-blue-500 bg-blue-50/50',
      isActiveFilter: filters.activeStatus === 'ALL',
      onClick: () => {
        setFilter('activeStatus', 'ALL')
      },
    },
    {
      id: 'active',
      label: 'Active Facilities',
      count: kpis.activeHospitals,
      icon: ToggleRight,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      activeRing: 'ring-2 ring-emerald-500 bg-emerald-50/50',
      isActiveFilter: filters.activeStatus === 'true',
      onClick: () => {
        setFilter('activeStatus', filters.activeStatus === 'true' ? 'ALL' : 'true')
      },
    },
    {
      id: 'inactive',
      label: 'Deactivated',
      count: kpis.inactiveHospitals,
      icon: CircleOff,
      color: 'text-slate-500',
      bg: 'bg-slate-100',
      border: 'border-slate-200',
      activeRing: 'ring-2 ring-slate-400 bg-slate-100/60',
      isActiveFilter: filters.activeStatus === 'false',
      onClick: () => {
        setFilter('activeStatus', filters.activeStatus === 'false' ? 'ALL' : 'false')
      },
    },
    {
      id: 'beds',
      label: 'Total Beds',
      count: kpis.totalBeds ?? 0,
      icon: BedDouble,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-100',
      activeRing: '',
      isActiveFilter: false,
      onClick: () => {},
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((c) => {
        const Icon = c.icon
        return (
          <button
            key={c.id}
            onClick={c.onClick}
            className={`w-full text-left p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all duration-200 cursor-pointer flex items-center gap-3.5 relative overflow-hidden group ${
              c.isActiveFilter ? c.activeRing : 'hover:border-slate-300 hover:scale-[1.01]'
            }`}
          >
            {/* Left Icon Pill */}
            <div
              className={`size-10 sm:size-11 rounded-xl ${c.bg} ${c.color} flex items-center justify-center shrink-0 transition-transform group-hover:scale-105`}
            >
              <Icon className="size-5" />
            </div>

            {/* Metric Info */}
            <div className="min-w-0 flex-1">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-500 block truncate leading-none">
                {c.label}
              </span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight mt-1 block">
                {c.count}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
export default HospitalKpiCards
