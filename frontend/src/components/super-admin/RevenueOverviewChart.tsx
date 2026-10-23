import { useState, type FC } from 'react'
import { ChevronDown, IndianRupee } from 'lucide-react'
import { useSuperAdminStore } from '@/store/superAdminStore'

export const RevenueOverviewChart: FC = () => {
  const { revenueTrend, revenueFilter, setRevenueFilter } = useSuperAdminStore()
  const [hoveredMonth, setHoveredMonth] = useState<string>('Oct')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const filterOptions = ['This Year', 'Quarterly', 'Last 6 Months']

  const width = 460
  const height = 180
  const paddingX = 25
  const paddingY = 25
  const maxRevenue = 1800000

  const points = revenueTrend.map((d, i) => {
    const x = paddingX + (i / (revenueTrend.length - 1)) * (width - 2 * paddingX)
    const y = height - paddingY - (d.revenue / maxRevenue) * (height - 2 * paddingY)
    return { x, y, ...d }
  })

  // Generate smooth SVG curve
  const curvePath = points.reduce((acc, curr, idx) => {
    if (idx === 0) return `M ${curr.x} ${curr.y}`
    const prev = points[idx - 1]
    const cpX = (prev.x + curr.x) / 2
    return `${acc} C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`
  }, '')

  // Area path with bottom close
  const areaPath = `${curvePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`

  const activePoint = points.find((p) => p.month === hoveredMonth) || points[9]

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
      {/* Header & Filter */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
            Revenue Overview
          </h3>
          <p className="text-[11px] text-slate-400 font-medium">
            Platform consultation fees and commission flow
          </p>
        </div>

        {/* Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsFilterOpen((prev) => !prev)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-lg text-xs font-semibold text-slate-700 transition-all cursor-pointer"
          >
            <span>{revenueFilter}</span>
            <ChevronDown className="size-3 text-slate-400" />
          </button>

          {isFilterOpen && (
            <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-xl shadow-lg p-1 z-20">
              {filterOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setRevenueFilter(opt)
                    setIsFilterOpen(false)
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold ${
                    revenueFilter === opt
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SVG Chart Area */}
      <div className="relative w-full overflow-hidden">
        {/* Highlight Peak Badge matching mockup (₹ 12.4L / +32%) */}
        {activePoint && (
          <div
            style={{
              left: `${(activePoint.x / width) * 100}%`,
              top: `${(activePoint.y / height) * 100 - 15}%`,
            }}
            className="absolute -translate-x-1/2 -translate-y-full bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-xl shadow-md border border-emerald-200 text-left pointer-events-none z-10 whitespace-nowrap animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center gap-1 text-xs font-black text-slate-900">
              <IndianRupee className="size-3 text-emerald-600 stroke-[2.5]" />
              <span>{activePoint.revenueFormatted}</span>
              <span className="text-[10px] text-emerald-600 font-extrabold">+32%</span>
            </div>
          </div>
        )}

        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 overflow-visible">
          <defs>
            <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={width - paddingX}
            y2={paddingY}
            stroke="#F1F5F9"
            strokeDasharray="3 3"
          />
          <line
            x1={paddingX}
            y1={height / 2}
            x2={width - paddingX}
            y2={height / 2}
            stroke="#F1F5F9"
            strokeDasharray="3 3"
          />
          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke="#E2E8F0"
          />

          {/* Area fill & Stroke curve */}
          <path d={areaPath} fill="url(#emeraldGrad)" />
          <path d={curvePath} fill="none" stroke="#10B981" strokeWidth="2.5" />

          {/* Data Points */}
          {points.map((pt) => {
            const isHovered = hoveredMonth === pt.month
            return (
              <circle
                key={pt.month}
                cx={pt.x}
                cy={pt.y}
                r={isHovered ? 5.5 : 3.5}
                fill="#10B981"
                stroke="#FFFFFF"
                strokeWidth="2"
                className="cursor-pointer transition-all duration-200"
                onClick={() => setHoveredMonth(pt.month)}
                onMouseEnter={() => setHoveredMonth(pt.month)}
              />
            )
          })}
        </svg>

        {/* X Axis Months */}
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 pt-1 border-t border-slate-100">
          {revenueTrend.map((d) => (
            <span
              key={d.month}
              onClick={() => setHoveredMonth(d.month)}
              onMouseEnter={() => setHoveredMonth(d.month)}
              className={`cursor-pointer transition-colors ${
                hoveredMonth === d.month ? 'text-emerald-700 font-black' : 'text-slate-400'
              }`}
            >
              {d.month}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default RevenueOverviewChart
