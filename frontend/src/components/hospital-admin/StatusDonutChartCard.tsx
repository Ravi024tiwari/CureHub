import { useState, type FC } from 'react'
import { CheckCircle2, Activity } from 'lucide-react'
import { useHospitalAdminStore } from '@/store/hospitalAdminStore'

export const StatusDonutChartCard: FC = () => {
  const { statusBreakdown } = useHospitalAdminStore()
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null)

  // SVG Donut metrics calculation
  const size = 124
  const strokeWidth = 14
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  const total = statusBreakdown.total || 0
  const completed = statusBreakdown.completed || 0
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 100

  // Segments calculation
  const segments = [
    {
      label: 'Completed',
      count: statusBreakdown.completed,
      pct: statusBreakdown.completedPct,
      color: '#10b981', // emerald-500
      hoverColor: '#059669',
      dotBg: 'bg-emerald-500',
      activeBg: 'bg-emerald-50/90 border-emerald-300 text-emerald-950',
    },
    {
      label: 'Upcoming',
      count: statusBreakdown.upcoming,
      pct: statusBreakdown.upcomingPct,
      color: '#3b82f6', // blue-500
      hoverColor: '#2563eb',
      dotBg: 'bg-blue-500',
      activeBg: 'bg-blue-50/90 border-blue-300 text-blue-950',
    },
    {
      label: 'Cancelled',
      count: statusBreakdown.cancelled,
      pct: statusBreakdown.cancelledPct,
      color: '#f43f5e', // rose-500
      hoverColor: '#e11d48',
      dotBg: 'bg-rose-500',
      activeBg: 'bg-rose-50/90 border-rose-300 text-rose-950',
    },
    {
      label: 'Pending',
      count: statusBreakdown.pending,
      pct: statusBreakdown.pendingPct,
      color: '#f59e0b', // amber-500
      hoverColor: '#d97706',
      dotBg: 'bg-amber-500',
      activeBg: 'bg-amber-50/90 border-amber-300 text-amber-950',
    },
  ]

  let accumulatedPercent = 0

  const activeSegmentData = hoveredSegment
    ? segments.find((s) => s.label === hoveredSegment)
    : null

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between h-full relative overflow-hidden w-full min-w-0">
      {/* 1. Header */}
      <div className="flex items-start justify-between gap-2.5 mb-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate">
            Appointments by Status
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5 leading-snug line-clamp-1">
            Real-time fulfillment & scheduling distribution
          </p>
        </div>

        {/* Operational Status Pill */}
        {total === 0 ? (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200/90 flex items-center gap-1.5 shrink-0 shadow-2xs">
            <span className="size-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span>Ready for Intake</span>
          </span>
        ) : statusBreakdown.pending > 0 ? (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5 shrink-0 shadow-2xs">
            <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>{statusBreakdown.pending} Action Needed</span>
          </span>
        ) : (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 shrink-0 shadow-2xs">
            <CheckCircle2 className="size-3 text-emerald-600" />
            <span>100% Fulfilled</span>
          </span>
        )}
      </div>

      {/* 2. Donut & Interactive 2x2 Legend Section */}
      <div className="py-2 my-auto flex flex-col items-center justify-center w-full min-w-0">
        {/* SVG Donut with Hover Micro-Interactions */}
        <div className="relative size-32 shrink-0 flex items-center justify-center my-1">
          <svg className="size-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
            {/* Background ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#f1f5f9"
              strokeWidth={strokeWidth}
              fill="transparent"
            />

            {/* Empty state decorative accent ring if total === 0 */}
            {total === 0 && (
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#e2e8f0"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
            )}

            {/* Slices when total > 0 */}
            {total > 0 &&
              segments.map((seg) => {
                if (seg.pct <= 0) return null
                const strokeDasharray = `${(seg.pct / 100) * circumference} ${circumference}`
                const strokeDashoffset = -((accumulatedPercent / 100) * circumference)
                accumulatedPercent += seg.pct
                const isHovered = hoveredSegment === seg.label

                return (
                  <circle
                    key={seg.label}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={isHovered ? seg.hoverColor : seg.color}
                    strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    fill="transparent"
                    onMouseEnter={() => setHoveredSegment(seg.label)}
                    onMouseLeave={() => setHoveredSegment(null)}
                    className="transition-all duration-300 cursor-pointer"
                  />
                )
              })}
          </svg>

          {/* Center Dynamic Metric Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none transition-all duration-200">
            {activeSegmentData ? (
              <div className="flex flex-col items-center animate-in zoom-in-95 duration-100">
                <span className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                  {activeSegmentData.count}
                </span>
                <span className="text-[11px] font-bold text-slate-600 mt-1 leading-none">
                  {activeSegmentData.label}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 mt-0.5">
                  ({activeSegmentData.pct}%)
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                  {total}
                </span>
                <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                  Total
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 2x2 Interactive Status Pills Grid */}
        <div className="grid grid-cols-2 gap-2 w-full mt-3">
          {segments.map((item) => {
            const isHovered = hoveredSegment === item.label

            return (
              <div
                key={item.label}
                onMouseEnter={() => setHoveredSegment(item.label)}
                onMouseLeave={() => setHoveredSegment(null)}
                className={`p-2.5 rounded-2xl transition-all duration-200 cursor-pointer border flex flex-col justify-between ${
                  isHovered
                    ? `${item.activeBg} shadow-2xs scale-[1.02]`
                    : 'bg-slate-50/70 hover:bg-slate-100/70 border-slate-100/90 hover:border-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className={`size-2 rounded-full ${item.dotBg} shrink-0 transition-transform duration-200 ${
                      isHovered ? 'scale-125 ring-2 ring-white' : ''
                    }`}
                  />
                  <span
                    className={`text-[11px] truncate transition-colors ${
                      isHovered ? 'font-bold' : 'font-semibold text-slate-600'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>

                <div className="flex items-baseline justify-between mt-1.5 pt-1 border-t border-slate-200/50">
                  <span
                    className={`text-sm tracking-tight ${
                      isHovered ? 'font-black' : 'font-bold text-slate-800'
                    }`}
                  >
                    {item.count}
                  </span>
                  <span
                    className={`text-[10px] font-medium transition-colors ${
                      isHovered ? 'text-inherit font-bold' : 'text-slate-400'
                    }`}
                  >
                    ({item.pct}%)
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 3. Bottom Fulfillment Efficiency Metric Bar */}
      <div className="pt-3 border-t border-slate-100 mt-2 w-full min-w-0">
        <div className="flex items-center justify-between text-xs mb-1.5 gap-2 min-w-0">
          <span className="font-bold text-slate-600 flex items-center gap-1.5 min-w-0 truncate">
            <Activity className="size-3.5 text-blue-600 shrink-0" />
            <span className="truncate">Fulfillment Rate</span>
          </span>
          <span className="font-black text-slate-900 text-xs shrink-0 whitespace-nowrap">
            {total > 0 ? `${completionRate}% completed` : '100% capacity ready'}
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            style={{ width: `${total > 0 ? Math.min(100, Math.max(5, completionRate)) : 100}%` }}
            className={`h-full rounded-full transition-all duration-500 max-w-full ${
              total === 0
                ? 'bg-blue-400'
                : completionRate >= 75
                ? 'bg-emerald-500'
                : 'bg-blue-500'
            }`}
          />
        </div>
      </div>
    </div>
  )
}
export default StatusDonutChartCard
