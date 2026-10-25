import { useState, type FC } from 'react'
import { BarChart2, IndianRupee } from 'lucide-react'

interface MonthlyStatItem {
  month: string
  monthNumber: number
  appointments: number
  completed: number
  cancelled: number
  revenue: number
}

interface DoctorMonthlyAnalyticsChartProps {
  monthlyStats?: MonthlyStatItem[]
  currentYear?: number
}

export const DoctorMonthlyAnalyticsChart: FC<DoctorMonthlyAnalyticsChartProps> = ({
  monthlyStats = [],
  currentYear = new Date().getFullYear(),
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  // Fallback 12 months if empty
  const defaultMonths = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ]

  const stats =
    monthlyStats.length === 12
      ? monthlyStats
      : defaultMonths.map((m, idx) => ({
          month: m,
          monthNumber: idx + 1,
          appointments: 0,
          completed: 0,
          cancelled: 0,
          revenue: 0,
        }))

  // Calculate maximum value to scale the bars
  const maxAppointments = Math.max(...stats.map((s) => s.appointments), 10)

  // Totals for year
  const totalYearAppointments = stats.reduce((sum, s) => sum + s.appointments, 0)
  const totalYearCompleted = stats.reduce((sum, s) => sum + s.completed, 0)
  const totalYearRevenue = stats.reduce((sum, s) => sum + s.revenue, 0)

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
      {/* Header & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <BarChart2 className="size-4.5 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900">
              Appointments & Practice Overview
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              Monthly patient consultation volume for {currentYear}
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-blue-500" />
            <span>Total Booked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-emerald-500" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-rose-400" />
            <span>Cancelled</span>
          </div>
        </div>
      </div>

      {/* Bar Chart Area */}
      <div className="pt-4 pb-2">
        <div className="h-56 sm:h-64 flex items-end justify-between gap-1.5 sm:gap-2 px-2 relative border-b border-slate-100">
          {stats.map((item, idx) => {
            const heightPercent = Math.max(
              (item.appointments / maxAppointments) * 100,
              item.appointments > 0 ? 8 : 4
            )
            const completedHeight = item.appointments > 0
              ? (item.completed / item.appointments) * 100
              : 0

            const isHovered = hoveredIndex === idx

            return (
              <div
                key={item.month}
                className="flex-1 flex flex-col items-center h-full justify-end relative group cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Tooltip on hover */}
                {isHovered && (
                  <div className="absolute -top-16 z-30 bg-slate-900 text-white p-2 rounded-xl text-[10px] font-bold shadow-xl pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
                    <p className="text-slate-300 font-semibold">{item.month} {currentYear}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-blue-400">{item.appointments} Booked</span>
                      <span>•</span>
                      <span className="text-emerald-400">{item.completed} Treated</span>
                    </div>
                    {item.revenue > 0 && (
                      <p className="text-amber-300 font-mono mt-0.5">₹ {item.revenue.toLocaleString()} Revenue</p>
                    )}
                  </div>
                )}

                {/* Vertical Bar Stack */}
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 relative overflow-hidden flex flex-col justify-end ${
                    isHovered ? 'ring-2 ring-blue-500 shadow-md' : ''
                  } ${
                    item.appointments === 0
                      ? 'bg-slate-100'
                      : 'bg-blue-100'
                  }`}
                >
                  {/* Completed Fill Portion */}
                  {item.completed > 0 && (
                    <div
                      style={{ height: `${completedHeight}%` }}
                      className="w-full bg-gradient-to-t from-emerald-600 to-emerald-500 rounded-t-sm"
                    />
                  )}
                  {/* Cancelled Top Accent */}
                  {item.cancelled > 0 && (
                    <div
                      style={{
                        height: `${Math.min(
                          (item.cancelled / item.appointments) * 100,
                          100 - completedHeight
                        )}%`,
                      }}
                      className="w-full bg-rose-400"
                    />
                  )}
                </div>

                {/* Month Label */}
                <span
                  className={`text-[10px] font-bold mt-2 transition-colors ${
                    isHovered ? 'text-blue-600 font-black' : 'text-slate-400'
                  }`}
                >
                  {item.month}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottom Summary Metrics Row */}
      <div className="pt-2 flex items-center justify-between flex-wrap gap-3 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Year-to-date total:</span>
          <span className="font-black text-slate-800">
            {totalYearAppointments} OPD Consultations
          </span>
          <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 text-[10px]">
            {totalYearCompleted} Treated
          </span>
        </div>

        {totalYearRevenue > 0 && (
          <div className="flex items-center gap-1 font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
            <IndianRupee className="size-3 text-emerald-600" />
            <span>₹ {totalYearRevenue.toLocaleString()} Revenue</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default DoctorMonthlyAnalyticsChart
