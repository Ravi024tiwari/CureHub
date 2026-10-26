import { type FC } from 'react'
import { Clock, CheckCircle2, XCircle, Building2 } from 'lucide-react'
import { useHospitalAdminVerificationStore } from '@/store/hospitalAdminVerificationStore'

export const HospitalAdminVerificationKpiGrid: FC = () => {
  const { stats, filters, setFilters } = useHospitalAdminVerificationStore()

  const cards = [
    {
      id: 'pending',
      title: 'Pending Verification',
      count: stats.pending,
      subtext:
        stats.pending === 1
          ? '1 application pending'
          : `${stats.pending} awaiting review`,
      icon: Clock,
      statusValue: 'PENDING' as const,
      color: 'amber',
      bgGrad: 'from-amber-500/10 via-amber-500/5 to-transparent',
      borderColor: 'border-amber-300 ring-2 ring-amber-500/30',
      iconBg: 'bg-amber-100 text-amber-600',
      textColor: 'text-amber-900',
      badgeColor: 'text-amber-600',
      isActive: filters.status === 'PENDING',
    },
    {
      id: 'approved',
      title: 'Approved',
      count: stats.approved,
      subtext: `${stats.approved} verified hospital admins`,
      icon: CheckCircle2,
      statusValue: 'APPROVED' as const,
      color: 'emerald',
      bgGrad: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      borderColor: 'border-emerald-300 ring-2 ring-emerald-500/30',
      iconBg: 'bg-emerald-100 text-emerald-600',
      textColor: 'text-emerald-900',
      badgeColor: 'text-emerald-600',
      isActive: filters.status === 'APPROVED',
    },
    {
      id: 'rejected',
      title: 'Rejected',
      count: stats.rejected,
      subtext: `${stats.rejected} rejected applications`,
      icon: XCircle,
      statusValue: 'REJECTED' as const,
      color: 'rose',
      bgGrad: 'from-rose-500/10 via-rose-500/5 to-transparent',
      borderColor: 'border-rose-300 ring-2 ring-rose-500/30',
      iconBg: 'bg-rose-100 text-rose-600',
      textColor: 'text-rose-900',
      badgeColor: 'text-rose-600',
      isActive: filters.status === 'REJECTED',
    },
    {
      id: 'total',
      title: 'Total Requests',
      count: stats.total,
      subtext: `${stats.total} total submissions`,
      icon: Building2,
      statusValue: 'ALL' as const,
      color: 'purple',
      bgGrad: 'from-purple-500/10 via-purple-500/5 to-transparent',
      borderColor: 'border-purple-300 ring-2 ring-purple-500/30',
      iconBg: 'bg-purple-100 text-purple-600',
      textColor: 'text-purple-900',
      badgeColor: 'text-purple-600',
      isActive: filters.status === 'ALL',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.id}
            role="button"
            tabIndex={0}
            onClick={() => setFilters({ status: card.statusValue })}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setFilters({ status: card.statusValue })
              }
            }}
            className={`bg-white rounded-2xl border p-4 sm:p-5 transition-all duration-200 cursor-pointer relative overflow-hidden group select-none shadow-2xs hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 ${
              card.isActive
                ? `${card.borderColor} shadow-sm`
                : 'border-slate-200/80 hover:border-slate-300'
            }`}
          >
            {/* Ambient background glow */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${card.bgGrad} pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity`}
            />

            <div className="relative flex items-center justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <span className="text-[11px] sm:text-xs font-bold text-slate-500 block tracking-tight truncate">
                  {card.title}
                </span>
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-2xl sm:text-3xl font-black tracking-tight ${card.textColor}`}
                  >
                    {card.count.toLocaleString()}
                  </span>
                </div>
                <span
                  className={`text-[11px] font-semibold block truncate ${card.badgeColor}`}
                >
                  {card.subtext}
                </span>
              </div>

              <div
                className={`size-11 sm:size-12 rounded-2xl ${card.iconBg} flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform duration-200`}
              >
                <Icon className="size-5 sm:size-6 stroke-[2.2]" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default HospitalAdminVerificationKpiGrid
