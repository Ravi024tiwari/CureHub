import { type FC } from 'react'
import { Building2, Clock, CheckCircle2, XCircle, TrendingUp } from 'lucide-react'
import { useHospitalAdminJoinRequestsStore } from '@/store/hospitalAdminJoinRequestsStore'

export const JoinRequestKpis: FC = () => {
  const { requests, selectedStatus, setSelectedStatus } = useHospitalAdminJoinRequestsStore()

  const total = requests.length
  const pending = requests.filter((r) => r.status === 'PENDING').length
  const approved = requests.filter((r) => r.status === 'APPROVED').length
  const rejected = requests.filter((r) => r.status === 'REJECTED').length

  const pendingPct = total > 0 ? ((pending / total) * 100).toFixed(1) : '0'
  const approvedPct = total > 0 ? ((approved / total) * 100).toFixed(1) : '0'
  const rejectedPct = total > 0 ? ((rejected / total) * 100).toFixed(1) : '0'

  const kpis = [
    {
      id: 'ALL',
      title: 'Total Requests',
      value: total,
      subtext: `${total} submitted this session`,
      subtextTrend: total > 0,
      icon: Building2,
      iconBg: 'bg-blue-50 text-blue-600 border border-blue-100',
      activeRing: 'ring-2 ring-blue-500 bg-blue-50/20 border-blue-300',
    },
    {
      id: 'PENDING',
      title: 'Pending',
      value: pending,
      subtext: pending === 0 ? 'All caught up' : `${pendingPct}% of total`,
      icon: Clock,
      iconBg: 'bg-amber-50 text-amber-600 border border-amber-100',
      activeRing: 'ring-2 ring-amber-500 bg-amber-50/20 border-amber-300',
    },
    {
      id: 'APPROVED',
      title: 'Approved',
      value: approved,
      subtext: `${approvedPct}% of total`,
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
      activeRing: 'ring-2 ring-emerald-500 bg-emerald-50/20 border-emerald-300',
    },
    {
      id: 'REJECTED',
      title: 'Rejected',
      value: rejected,
      subtext: `${rejectedPct}% of total`,
      icon: XCircle,
      iconBg: 'bg-rose-50 text-rose-600 border border-rose-100',
      activeRing: 'ring-2 ring-rose-500 bg-rose-50/20 border-rose-300',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
      {kpis.map((kpi) => {
        const Icon = kpi.icon
        const isActive = selectedStatus === kpi.id

        return (
          <div
            key={kpi.id}
            onClick={() => setSelectedStatus(kpi.id)}
            className={`bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-200 flex items-center justify-between cursor-pointer group select-none ${
              isActive ? `${kpi.activeRing} shadow-sm` : 'hover:border-slate-300/80'
            }`}
          >
            <div className="space-y-1 sm:space-y-1.5 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-slate-500 group-hover:text-slate-800 transition-colors">
                  {kpi.title}
                </span>
                {isActive && (
                  <span className="size-1.5 rounded-full bg-blue-600 animate-pulse" />
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {kpi.value}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-slate-500 truncate">
                {kpi.subtextTrend && (
                  <TrendingUp className="size-3.5 text-emerald-600 shrink-0 inline" />
                )}
                <span className={kpi.subtextTrend ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                  {kpi.subtext}
                </span>
              </div>
            </div>

            <div
              className={`size-11 sm:size-13 rounded-2xl flex items-center justify-center shrink-0 ${kpi.iconBg} shadow-2xs group-hover:scale-105 transition-transform`}
            >
              <Icon className="size-5 sm:size-6 stroke-[2.2]" />
            </div>
          </div>
        )
      })}
    </div>
  )
}
export default JoinRequestKpis
