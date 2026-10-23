import { useState, type FC } from 'react'
import { ChevronDown, Building2 } from 'lucide-react'
import { useSuperAdminStore } from '@/store/superAdminStore'

export const HospitalTrendChart: FC = () => {
  const { hospitalTrend } = useSuperAdminStore()
  const [hoveredMonth, setHoveredMonth] = useState<string>('Oct')
  const [filter, setFilter] = useState('This Year')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const maxVal = 20
  const chartHeightPx = 145

  const activeStat = hospitalTrend.find((h) => h.month === hoveredMonth) || hospitalTrend[9]

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-5 shadow-2xs flex flex-col justify-between">
      {/* 1. Header & Filter */}
      <div className="flex items-start sm:items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
            Hospital Registration Trend
          </h3>
          <p className="text-[11px] text-slate-400 font-medium">
            New facility onboarding rate per month
          </p>
        </div>

        {/* Filter Dropdown */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setIsFilterOpen((prev) => !prev)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-2xs"
          >
            <span>{filter}</span>
            <ChevronDown className={`size-3 text-slate-400 transition-transform ${isFilterOpen ? 'rotate-180 text-blue-600' : ''}`} />
          </button>

          {isFilterOpen && (
            <div className="absolute right-0 mt-1.5 w-32 bg-white border border-slate-200 rounded-2xl shadow-xl p-1 z-30 animate-in fade-in zoom-in-95 duration-150">
              {['This Year', 'Last Year'].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setFilter(opt)
                    setIsFilterOpen(false)
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
                    filter === opt ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Active Month Indicator Banner */}
      {activeStat && (
        <div className="flex items-center justify-between bg-blue-50/70 border border-blue-100 rounded-xl px-3 py-1.5 mb-3 text-xs">
          <span className="font-bold text-slate-800 flex items-center gap-1.5">
            <Building2 className="size-3.5 text-blue-600" />
            {activeStat.month} 2026:
          </span>
          <span className="font-black text-blue-700">{activeStat.count} New Hospitals</span>
        </div>
      )}

      {/* 3. Bar Chart Area */}
      <div className="w-full">
        <div className="flex items-end gap-1 sm:gap-2 h-36 sm:h-40 relative">
          {/* Y Axis Reference Numbers */}
          <div className="flex flex-col justify-between h-full pr-1.5 text-[9px] font-semibold text-slate-400 select-none shrink-0 pb-1">
            <span>20</span>
            <span>15</span>
            <span>10</span>
            <span>5</span>
            <span>0</span>
          </div>

          {/* Dotted grid lines */}
          <div className="absolute left-6 right-0 inset-y-0 pointer-events-none flex flex-col justify-between pb-1">
            <div className="w-full border-b border-dashed border-slate-100" />
            <div className="w-full border-b border-dashed border-slate-100" />
            <div className="w-full border-b border-dashed border-slate-100" />
            <div className="w-full border-b border-dashed border-slate-100" />
            <div className="w-full border-b border-slate-200" />
          </div>

          {/* Monthly Bars */}
          <div className="flex-1 flex items-end justify-between gap-1 sm:gap-2 h-full z-10">
            {hospitalTrend.map((item) => {
              const isHovered = hoveredMonth === item.month
              const barH = Math.max(8, Math.min(chartHeightPx, (item.count / maxVal) * chartHeightPx))

              return (
                <div
                  key={item.month}
                  onClick={() => setHoveredMonth(item.month)}
                  onMouseEnter={() => setHoveredMonth(item.month)}
                  className="flex-1 flex flex-col items-center justify-end h-full cursor-pointer group py-1"
                >
                  <div
                    style={{ height: `${barH}px` }}
                    className={`w-full max-w-[18px] rounded-t-md transition-all duration-200 ${
                      isHovered
                        ? 'bg-blue-600 shadow-md shadow-blue-500/25 ring-2 ring-blue-400'
                        : 'bg-blue-400/90 hover:bg-blue-500'
                    }`}
                  />
                </div>
              )
            })}
          </div>
        </div>

        {/* 4. Separate X Axis Row: Month Labels Directly Aligned Below Bars */}
        <div className="flex items-center justify-between pl-6 pt-2 select-none border-t border-slate-200">
          {hospitalTrend.map((item) => {
            const isSelected = hoveredMonth === item.month
            return (
              <button
                key={item.month}
                type="button"
                onClick={() => setHoveredMonth(item.month)}
                onMouseEnter={() => setHoveredMonth(item.month)}
                className={`flex-1 text-center py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'text-blue-700 bg-blue-50 font-black shadow-2xs'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                {item.month}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default HospitalTrendChart
