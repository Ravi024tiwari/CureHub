import React from 'react'
import {
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
} from 'lucide-react'
import { useHospitalAdminLeavesStore } from '@/store/hospitalAdminLeavesStore'
import { DoctorLeaveStatus } from '@/types/hospitalAdmin'

export const DoctorLeavesKpiGrid: React.FC = () => {
  const { kpis, isLoading, selectedStatus, setSelectedStatus } = useHospitalAdminLeavesStore()

  const cards = [
    {
      id: 'total',
      statusFilter: 'ALL',
      title: 'Total Requests',
      value: kpis.total,
      topBadge: (
        <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 sm:px-2.5 py-0.5 rounded-full border border-emerald-100">
          <TrendingUp className="size-3" />
          <span>{kpis.totalTrend || '↑ 12%'}</span>
        </span>
      ),
      subtitle: (
        <span className="text-slate-400 font-medium">All applications recorded</span>
      ),
      icon: Building2,
      iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
      activeRing: 'ring-2 ring-blue-500 bg-blue-50/20 border-blue-300',
      pulseColor: 'bg-blue-600',
    },
    {
      id: 'pending',
      statusFilter: DoctorLeaveStatus.PENDING,
      title: 'Pending',
      value: kpis.pending,
      topBadge: (
        <span className="text-[10px] sm:text-[11px] font-bold text-amber-700 bg-amber-50 px-2 sm:px-2.5 py-0.5 rounded-full border border-amber-200">
          {kpis.pendingPercentage}% of total
        </span>
      ),
      subtitle: (
        <span className="text-slate-400 font-medium">Awaiting admin review</span>
      ),
      icon: Clock,
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
      activeRing: 'ring-2 ring-amber-500 bg-amber-50/20 border-amber-300',
      pulseColor: 'bg-amber-500',
    },
    {
      id: 'approved',
      statusFilter: DoctorLeaveStatus.APPROVED,
      title: 'Approved',
      value: kpis.approved,
      topBadge: (
        <span className="text-[10px] sm:text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 sm:px-2.5 py-0.5 rounded-full border border-emerald-200">
          {kpis.approvedPercentage}% of total
        </span>
      ),
      subtitle: (
        <span className="text-slate-400 font-medium">Leaves confirmed & locked</span>
      ),
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      activeRing: 'ring-2 ring-emerald-500 bg-emerald-50/20 border-emerald-300',
      pulseColor: 'bg-emerald-600',
    },
    {
      id: 'rejected',
      statusFilter: DoctorLeaveStatus.REJECTED,
      title: 'Rejected',
      value: kpis.rejected,
      topBadge: (
        <span className="text-[10px] sm:text-[11px] font-bold text-rose-700 bg-rose-50 px-2 sm:px-2.5 py-0.5 rounded-full border border-rose-200">
          {kpis.rejectedPercentage}% of total
        </span>
      ),
      subtitle: (
        <span className="text-slate-400 font-medium">Slots released back</span>
      ),
      icon: XCircle,
      iconBg: 'bg-rose-50 text-rose-600 border-rose-100',
      activeRing: 'ring-2 ring-rose-500 bg-rose-50/20 border-rose-300',
      pulseColor: 'bg-rose-500',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
      {cards.map((card) => {
        const Icon = card.icon
        const isActive = selectedStatus === card.statusFilter

        return (
          <div
            key={card.id}
            onClick={() => setSelectedStatus(card.statusFilter)}
            title={`Click to filter by ${card.title}`}
            className={`bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border transition-all duration-200 cursor-pointer group select-none relative overflow-hidden shadow-2xs hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] ${
              isActive
                ? `${card.activeRing} shadow-xs`
                : 'border-slate-200/80 hover:border-slate-300/90'
            }`}
          >
            {/* Top row: Icon + Top Badge */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <div
                className={`size-11 sm:size-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-2xs group-hover:scale-105 transition-transform ${card.iconBg}`}
              >
                <Icon className="size-5 sm:size-5.5 stroke-[2.2]" />
              </div>

              <div className="flex items-center gap-1.5">
                {isActive && (
                  <span
                    className={`size-1.5 rounded-full ${card.pulseColor} animate-pulse hidden sm:inline-block`}
                  />
                )}
                {card.topBadge}
              </div>
            </div>

            {/* Middle & Bottom: Number, Title, Subtitle */}
            <div className="space-y-0.5 min-w-0">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none group-hover:text-blue-600 transition-colors">
                {isLoading ? (
                  <div className="h-8 w-16 bg-slate-100 rounded-lg animate-pulse" />
                ) : (
                  card.value
                )}
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-800 mt-1 truncate">
                {card.title}
              </div>
              <div className="text-[11px] sm:text-xs font-semibold text-slate-400 mt-0.5 truncate">
                {card.subtitle}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default DoctorLeavesKpiGrid
