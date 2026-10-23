import { type FC } from 'react'
import { Stethoscope, CheckCircle2, ShieldAlert, Clock } from 'lucide-react'
import { useAdminDoctorsStore } from '@/store/adminDoctorsStore'

export const AdminDoctorsStatsGrid: FC = () => {
  const { stats, filters, setFilters } = useAdminDoctorsStore()

  const cards = [
    {
      id: 'total',
      title: 'Total Doctors',
      count: stats.total,
      subtext: 'Platform clinical workforce',
      icon: Stethoscope,
      filterAction: () => setFilters({ status: 'ALL', accountStatus: 'all' }),
      isActive: filters.status === 'ALL' && filters.accountStatus === 'all',
      bgGrad: 'from-blue-500/10 via-blue-500/5 to-transparent',
      borderColor: 'border-blue-200/80',
      iconBg: 'bg-blue-100 text-blue-600',
      textColor: 'text-blue-900',
      badgeColor: 'text-blue-600',
    },
    {
      id: 'active',
      title: 'Active & Consulting',
      count: stats.active,
      subtext: 'Live OPD & patient consultations',
      icon: CheckCircle2,
      filterAction: () => setFilters({ accountStatus: 'active', status: 'ALL' }),
      isActive: filters.accountStatus === 'active',
      bgGrad: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      borderColor: 'border-emerald-200/80',
      iconBg: 'bg-emerald-100 text-emerald-600',
      textColor: 'text-emerald-900',
      badgeColor: 'text-emerald-600',
    },
    {
      id: 'disabled',
      title: 'Disabled / Suspended',
      count: stats.disabled,
      subtext: 'Account access locked by admin',
      icon: ShieldAlert,
      filterAction: () => setFilters({ accountStatus: 'inactive', status: 'ALL' }),
      isActive: filters.accountStatus === 'inactive',
      bgGrad: 'from-rose-500/10 via-rose-500/5 to-transparent',
      borderColor: 'border-rose-200/80',
      iconBg: 'bg-rose-100 text-rose-600',
      textColor: 'text-rose-900',
      badgeColor: 'text-rose-600',
    },
    {
      id: 'pending',
      title: 'Pending Verification',
      count: stats.pending,
      subtext: 'Awaiting credential review',
      icon: Clock,
      filterAction: () => setFilters({ status: 'PENDING', accountStatus: 'all' }),
      isActive: filters.status === 'PENDING',
      bgGrad: 'from-amber-500/10 via-amber-500/5 to-transparent',
      borderColor: 'border-amber-200/80',
      iconBg: 'bg-amber-100 text-amber-600',
      textColor: 'text-amber-900',
      badgeColor: 'text-amber-600',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.id}
            onClick={card.filterAction}
            className={`bg-white rounded-2xl border p-3 sm:p-4.5 transition-all cursor-pointer relative overflow-hidden group select-none shadow-2xs hover:shadow-md ${
              card.isActive
                ? `${card.borderColor} ring-2 ring-blue-500/30 shadow-xs bg-slate-50/50`
                : 'border-slate-200/80 hover:border-slate-300'
            }`}
          >
            {/* Ambient background glow */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${card.bgGrad} pointer-events-none opacity-40 group-hover:opacity-80 transition-opacity`}
            />

            <div className="relative flex items-start justify-between gap-2">
              <div className="space-y-0.5 sm:space-y-1 min-w-0">
                <span className="text-[11px] sm:text-xs font-bold text-slate-500 block tracking-tight truncate">
                  {card.title}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className={`text-xl sm:text-2xl md:text-3xl font-black tracking-tight ${card.textColor}`}>
                    {card.count.toLocaleString()}
                  </span>
                </div>
                <span className={`text-[10px] sm:text-[11px] font-semibold block truncate ${card.badgeColor}`}>
                  {card.subtext}
                </span>
              </div>

              <div
                className={`size-8 sm:size-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs transition-transform group-hover:scale-105 ${card.iconBg}`}
              >
                <Icon className="size-4 sm:size-5 stroke-[2.3]" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default AdminDoctorsStatsGrid
