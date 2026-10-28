import type { FC } from 'react'
import { Building2, Stethoscope, ShieldCheck, Landmark, UserPlus } from 'lucide-react'
import type { DoctorHospitalKpis as KpiType, DoctorHospitalFilterState } from '@/types/doctorHospital'

interface DoctorHospitalKpisProps {
  kpis: KpiType
  filters: DoctorHospitalFilterState
  onSelectType: (type: string) => void
}

export const DoctorHospitalKpis: FC<DoctorHospitalKpisProps> = ({
  kpis,
  filters,
  onSelectType,
}) => {
  const cards = [
    {
      id: 'total',
      label: 'Total Hospitals',
      count: kpis.totalHospitals || 0,
      icon: Building2,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      activeRing: 'ring-2 ring-blue-500 bg-blue-50/60',
      isActive: filters.hospitalType === 'ALL',
      onClick: () => onSelectType('ALL'),
    },
    {
      id: 'multi',
      label: 'Multi-Speciality',
      count: kpis.multiSpeciality || 0,
      icon: Stethoscope,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-100',
      activeRing: 'ring-2 ring-purple-500 bg-purple-50/60',
      isActive: filters.hospitalType.toLowerCase().includes('multi'),
      onClick: () =>
        onSelectType(filters.hospitalType.toLowerCase().includes('multi') ? 'ALL' : 'Multi-Speciality'),
    },
    {
      id: 'private',
      label: 'Private Hospitals',
      count: kpis.privateHospitals || 0,
      icon: ShieldCheck,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      activeRing: 'ring-2 ring-emerald-500 bg-emerald-50/60',
      isActive: filters.hospitalType.toLowerCase() === 'private',
      onClick: () =>
        onSelectType(filters.hospitalType.toLowerCase() === 'private' ? 'ALL' : 'Private'),
    },
    {
      id: 'government',
      label: 'Government Hospitals',
      count: kpis.governmentHospitals || 0,
      icon: Landmark,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      activeRing: 'ring-2 ring-amber-500 bg-amber-50/60',
      isActive: filters.hospitalType.toLowerCase().includes('gov'),
      onClick: () =>
        onSelectType(filters.hospitalType.toLowerCase().includes('gov') ? 'ALL' : 'Government'),
    },
    {
      id: 'open',
      label: 'Open for Requests',
      count: kpis.openForRequests || kpis.totalHospitals || 0,
      icon: UserPlus,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-100',
      activeRing: 'ring-2 ring-rose-500 bg-rose-50/60',
      isActive: false,
      onClick: () => onSelectType('ALL'),
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {cards.map((c) => {
        const Icon = c.icon
        return (
          <button
            key={c.id}
            type="button"
            onClick={c.onClick}
            className={`w-full text-left p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all duration-200 cursor-pointer flex items-center gap-3.5 relative overflow-hidden group ${
              c.isActive ? c.activeRing : 'hover:border-slate-300 hover:scale-[1.01]'
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
              <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight block">
                {c.count}
              </span>
              <span className="text-[11px] sm:text-xs font-semibold text-slate-500 block truncate leading-tight mt-0.5">
                {c.label}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
export default DoctorHospitalKpis
