import { useState, type FC } from 'react'
import { ChevronDown } from 'lucide-react'
import { useHospitalAdminStore } from '@/store/hospitalAdminStore'

export const AppointmentsChartCard: FC = () => {
  const { appointmentsTrend, appointmentTimeframe, setAppointmentTimeframe } =
    useHospitalAdminStore()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const maxY = 80 // Max y-axis benchmark matching mockup

  const displayedStats =
    appointmentTimeframe === 'Last 7 Days'
      ? appointmentsTrend.slice(-7)
      : appointmentsTrend

  const totalVisits = displayedStats.reduce((acc, curr) => acc + curr.appointments, 0)
  const avgVisits = Math.round(totalVisits / (displayedStats.length || 1))
  const activeItem = hoveredIndex !== null ? displayedStats[hoveredIndex] : null

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between h-full relative">
      {/* Card Header */}
      <div className="flex flex-col gap-2 mb-2">
        <div className="flex items-start sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Appointments Overview
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5 leading-snug">
              Daily in-person consultation volume across facilities
            </p>
          </div>

          {/* Timeframe Dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/90 rounded-2xl text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs hover:border-slate-300"
            >
              <span>{appointmentTimeframe}</span>
              <ChevronDown className="size-3 text-slate-400" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-36 bg-white border border-slate-200 rounded-2xl shadow-xl p-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                {(['Last 30 Days', 'Last 7 Days', 'This Year'] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => {
                      setAppointmentTimeframe(tf)
                      setIsDropdownOpen(false)
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                      appointmentTimeframe === tf
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Interactive Legend & Hover Inspector */}
        <div className="h-7 flex items-center pt-1">
          {activeItem ? (
            <div className="flex items-center gap-2 text-xs animate-in fade-in duration-150">
              <span className="size-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-slate-900 font-bold text-xs">{activeItem.dayLabel} 2026:</span>
              <span className="text-blue-700 font-black bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 text-xs shadow-2xs">
                {activeItem.appointments} In-person Consultations
              </span>
              <span className="text-[11px] text-slate-400">
                ({activeItem.appointments > avgVisits ? '+' : ''}
                {activeItem.appointments - avgVisits} from avg)
              </span>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-blue-600 shrink-0" />
                <span className="text-slate-700 text-xs font-bold">
                  In-person Hospital Consultations
                </span>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                ({totalVisits.toLocaleString('en-IN')} visits • avg {avgVisits}/day)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Bar Chart Canvas */}
      <div className="relative pt-8 pb-1 my-auto">
        {/* Y-Axis Grid Lines & Labels */}
        <div className="absolute inset-x-0 top-8 bottom-7 flex flex-col justify-between pointer-events-none">
          {[80, 60, 40, 20, 0].map((val) => (
            <div key={val} className="flex items-center w-full">
              <span className="w-5 text-[10px] font-mono font-medium text-slate-400 text-right pr-2">
                {val}
              </span>
              <div className="flex-1 border-b border-slate-100 border-dashed" />
            </div>
          ))}
        </div>

        {/* Bars Container */}
        <div className="ml-6 h-40 flex items-end justify-between gap-[2px] sm:gap-1 relative z-20">
          {displayedStats.map((item, index) => {
            const isHovered = hoveredIndex === index
            const barHeight = Math.min(100, Math.max(6, (item.appointments / maxY) * 100))

            // Clamp tooltip position to prevent clipping at boundaries
            const positionClass =
              index < 3
                ? 'left-0'
                : index > displayedStats.length - 4
                ? 'right-0'
                : 'left-1/2 -translate-x-1/2'

            return (
              <div
                key={item.date}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`flex-1 min-w-0 flex flex-col items-center justify-end h-full relative cursor-pointer group rounded-t-xl transition-colors duration-150 ${
                  isHovered ? 'bg-blue-50/60' : 'hover:bg-slate-50/70'
                }`}
              >
                {/* Floating Glassmorphism Tooltip */}
                {isHovered && (
                  <div
                    className={`absolute -top-13 z-50 pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-95 duration-150 ${positionClass}`}
                  >
                    <div className="bg-slate-900/95 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-1.5 rounded-2xl shadow-xl shadow-slate-900/30 border border-slate-700/60 flex flex-col items-center">
                      <span className="text-slate-300 text-[10px] font-medium leading-none mb-0.5">
                        {item.dayLabel} 2026
                      </span>
                      <div className="flex items-center gap-1.5 font-bold">
                        <span className="size-1.5 rounded-full bg-blue-400" />
                        <span className="text-blue-300 font-black text-xs leading-none">
                          {item.appointments}
                        </span>
                        <span className="text-slate-300 text-[10px] leading-none">Visits</span>
                      </div>
                      {/* Arrow */}
                      <div className="w-1.5 h-1.5 bg-slate-900 rotate-45 -mb-1 mt-0.5 border-r border-b border-slate-700/60" />
                    </div>
                  </div>
                )}

                {/* Single In-Person Hospital Visit Bar with gradient & rounded top */}
                <div className="w-full flex items-end justify-center h-full px-[1px]">
                  <div
                    style={{ height: `${barHeight}%` }}
                    className={`w-full max-w-[6px] sm:max-w-[8px] md:max-w-[10px] bg-gradient-to-t from-blue-600 via-blue-500 to-indigo-500 rounded-t-full transition-all duration-200 ${
                      isHovered
                        ? 'brightness-110 scale-y-105 shadow-md shadow-blue-500/50 ring-2 ring-blue-400/80 ring-offset-1'
                        : 'group-hover:brightness-105'
                    }`}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* X-Axis Milestone Labels matching mockup */}
        <div className="ml-6 mt-2 flex justify-between text-[10px] font-mono font-medium text-slate-400">
          <span>1 Oct</span>
          <span>5 Oct</span>
          <span>10 Oct</span>
          <span>15 Oct</span>
          <span>20 Oct</span>
          <span>25 Oct</span>
          <span>31 Oct</span>
        </div>
      </div>
    </div>
  )
}
export default AppointmentsChartCard
