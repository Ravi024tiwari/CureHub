import { useState, type FC } from 'react'
import { ChevronDown, Calendar, CheckCircle2, XCircle, RotateCcw, AlertCircle } from 'lucide-react'
import { useSuperAdminStore } from '@/store/superAdminStore'

export const AppointmentsOverviewChart: FC = () => {
  const { appointmentsOverview, appointmentsFilter, setAppointmentsFilter } = useSuperAdminStore()
  const [hoveredMonth, setHoveredMonth] = useState<string>('Oct')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const filterOptions = ['This Year', 'Last 6 Months', 'This Quarter']

  // Max scale reference for 2,000
  const maxScale = 2200
  const chartHeightPx = 150

  const activeStat =
    appointmentsOverview.find((s) => s.month === hoveredMonth) || appointmentsOverview[9]
  const totalActive = activeStat
    ? activeStat.completed + activeStat.cancelled + activeStat.rescheduled + activeStat.noShow
    : 0

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-5 shadow-2xs flex flex-col justify-between">
      {/* 1. Header & Filter Dropdown */}
      <div className="flex items-start sm:items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
            Appointments Overview
          </h3>
          <p className="text-[11px] text-slate-400 font-medium">
            Monthly distribution of patient consultations
          </p>
        </div>

        {/* Filter Dropdown */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setIsFilterOpen((prev) => !prev)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-2xs"
          >
            <span>{appointmentsFilter}</span>
            <ChevronDown className={`size-3 text-slate-400 transition-transform ${isFilterOpen ? 'rotate-180 text-blue-600' : ''}`} />
          </button>

          {isFilterOpen && (
            <div className="absolute right-0 mt-1.5 w-36 bg-white border border-slate-200 rounded-2xl shadow-xl p-1 z-30 animate-in fade-in zoom-in-95 duration-150">
              {filterOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setAppointmentsFilter(opt)
                    setIsFilterOpen(false)
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
                    appointmentsFilter === opt
                      ? 'bg-blue-50 text-blue-700 font-bold'
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

      {/* 2. Responsive Legend Pills */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap mb-3 text-[11px] font-bold">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50/70 border border-blue-100/80 text-blue-800">
          <span className="size-2 rounded-full bg-blue-600 shrink-0" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-orange-50/70 border border-orange-100/80 text-orange-800">
          <span className="size-2 rounded-full bg-orange-500 shrink-0" />
          <span>Cancelled</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-50/70 border border-rose-100/80 text-rose-800">
          <span className="size-2 rounded-full bg-rose-500 shrink-0" />
          <span>Rescheduled</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-sky-50/70 border border-sky-100/80 text-sky-800">
          <span className="size-2 rounded-full bg-sky-400 shrink-0" />
          <span>No-show</span>
        </div>
      </div>

      {/* 3. Interactive Detail Panel (Responsive Grid, Never Clips on Small Screens) */}
      {activeStat && (
        <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-2.5 sm:p-3 mb-3.5 shadow-2xs">
          <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-200/60">
            <div className="flex items-center gap-1.5 font-black text-xs text-slate-800">
              <Calendar className="size-3.5 text-blue-600" />
              <span>{activeStat.month} 2026</span>
              <span className="text-[10px] text-slate-400 font-semibold">(Tap or hover any bar)</span>
            </div>
            <span className="text-xs font-black text-blue-600">
              {totalActive.toLocaleString()} Total
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
            <div className="flex items-center justify-between bg-white px-2.5 py-1 rounded-xl border border-blue-100 shadow-2xs">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 truncate">
                <CheckCircle2 className="size-3 text-blue-600 shrink-0" />
                <span className="truncate">Completed</span>
              </div>
              <span className="font-mono font-black text-xs text-blue-700 ml-1">
                {activeStat.completed}
              </span>
            </div>

            <div className="flex items-center justify-between bg-white px-2.5 py-1 rounded-xl border border-orange-100 shadow-2xs">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 truncate">
                <XCircle className="size-3 text-orange-500 shrink-0" />
                <span className="truncate">Cancelled</span>
              </div>
              <span className="font-mono font-black text-xs text-orange-700 ml-1">
                {activeStat.cancelled}
              </span>
            </div>

            <div className="flex items-center justify-between bg-white px-2.5 py-1 rounded-xl border border-rose-100 shadow-2xs">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 truncate">
                <RotateCcw className="size-3 text-rose-500 shrink-0" />
                <span className="truncate">Rescheduled</span>
              </div>
              <span className="font-mono font-black text-xs text-rose-700 ml-1">
                {activeStat.rescheduled}
              </span>
            </div>

            <div className="flex items-center justify-between bg-white px-2.5 py-1 rounded-xl border border-sky-100 shadow-2xs">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 truncate">
                <AlertCircle className="size-3 text-sky-500 shrink-0" />
                <span className="truncate">No-show</span>
              </div>
              <span className="font-mono font-black text-xs text-sky-700 ml-1">
                {activeStat.noShow}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 4. Chart Track Area with Explicit Baseline & Labels */}
      <div className="w-full">
        {/* Bars Container */}
        <div className="flex items-end gap-1 sm:gap-2 h-38 sm:h-44 relative">
          {/* Y Axis Reference Numbers */}
          <div className="flex flex-col justify-between h-full pr-1 sm:pr-2 text-[9px] font-semibold text-slate-400 select-none shrink-0 pb-1">
            <span>2,000</span>
            <span>1,500</span>
            <span>1,000</span>
            <span>500</span>
            <span>0</span>
          </div>

          {/* Dotted horizontal background guidelines */}
          <div className="absolute left-7 right-0 inset-y-0 pointer-events-none flex flex-col justify-between pb-1">
            <div className="w-full border-b border-dashed border-slate-100" />
            <div className="w-full border-b border-dashed border-slate-100" />
            <div className="w-full border-b border-dashed border-slate-100" />
            <div className="w-full border-b border-dashed border-slate-100" />
            <div className="w-full border-b border-slate-200" />
          </div>

          {/* Monthly Stacked Bars */}
          <div className="flex-1 flex items-end justify-between gap-1 sm:gap-2 h-full z-10">
            {appointmentsOverview.map((item) => {
              const isSelected = hoveredMonth === item.month
              const total = item.completed + item.cancelled + item.rescheduled + item.noShow
              const totalHeight = Math.max(12, Math.min(chartHeightPx, (total / maxScale) * chartHeightPx))

              const hCompleted = (item.completed / total) * totalHeight
              const hCancelled = (item.cancelled / total) * totalHeight
              const hRescheduled = (item.rescheduled / total) * totalHeight
              const hNoShow = (item.noShow / total) * totalHeight

              return (
                <div
                  key={item.month}
                  onClick={() => setHoveredMonth(item.month)}
                  onMouseEnter={() => setHoveredMonth(item.month)}
                  className="flex-1 flex flex-col items-center justify-end h-full cursor-pointer group py-1"
                >
                  {/* Stacked bar cylinder */}
                  <div
                    style={{ height: `${totalHeight}px` }}
                    className={`w-full max-w-[20px] rounded-t-md flex flex-col-reverse overflow-hidden transition-all duration-200 ${
                      isSelected
                        ? 'ring-2 ring-blue-500 shadow-md shadow-blue-500/30 brightness-110'
                        : 'opacity-85 group-hover:opacity-100 group-hover:scale-y-[1.02]'
                    }`}
                  >
                    <div style={{ height: `${hCompleted}px` }} className="bg-blue-600 w-full" />
                    <div style={{ height: `${hCancelled}px` }} className="bg-orange-500 w-full" />
                    <div style={{ height: `${hRescheduled}px` }} className="bg-rose-500 w-full" />
                    <div style={{ height: `${hNoShow}px` }} className="bg-sky-400 w-full" />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 5. Separate X Axis Row: Month labels directly below each bar (Never Cut Off) */}
        <div className="flex items-center justify-between pl-7 pt-2 select-none border-t border-slate-200">
          {appointmentsOverview.map((item) => {
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

export default AppointmentsOverviewChart
