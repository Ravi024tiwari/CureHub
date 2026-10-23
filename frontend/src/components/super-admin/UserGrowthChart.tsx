import { useState, type FC } from 'react'
import { ChevronDown } from 'lucide-react'
import { useSuperAdminStore } from '@/store/superAdminStore'

export const UserGrowthChart: FC = () => {
  const { userGrowth, userGrowthFilter, setUserGrowthFilter } = useSuperAdminStore()
  const [hoveredIdx, setHoveredIdx] = useState<number>(7) // Aug/Oct highlight
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const filterOptions = ['This Year', 'Last 6 Months', 'All Time']

  // SVG coordinate calculations
  const width = 420
  const height = 180
  const paddingX = 25
  const paddingY = 20

  const maxVal = 10000

  const getPoints = (key: 'patients' | 'doctors' | 'hospitalAdmins') => {
    return userGrowth.map((d, i) => {
      const x = paddingX + (i / (userGrowth.length - 1)) * (width - 2 * paddingX)
      const y = height - paddingY - (d[key] / maxVal) * (height - 2 * paddingY)
      return { x, y, val: d[key] }
    })
  }

  const patientPoints = getPoints('patients')
  const doctorPoints = getPoints('doctors')
  const adminPoints = getPoints('hospitalAdmins')

  const toSvgPath = (points: { x: number; y: number }[]) => {
    return points.reduce((acc, curr, idx) => {
      if (idx === 0) return `M ${curr.x} ${curr.y}`
      const prev = points[idx - 1]
      const cpX = (prev.x + curr.x) / 2
      return `${acc} C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`
    }, '')
  }

  const patientPath = toSvgPath(patientPoints)
  const doctorPath = toSvgPath(doctorPoints)
  const adminPath = toSvgPath(adminPoints)

  const activeData = userGrowth[hoveredIdx] || userGrowth[7]
  const activePatientPt = patientPoints[hoveredIdx] || patientPoints[7]

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
      {/* Header & Filter */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
            User Growth
          </h3>
          <p className="text-[11px] text-slate-400 font-medium">
            New accounts registered across the platform
          </p>
        </div>

        {/* Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsFilterOpen((prev) => !prev)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-lg text-xs font-semibold text-slate-700 transition-all cursor-pointer"
          >
            <span>{userGrowthFilter}</span>
            <ChevronDown className="size-3 text-slate-400" />
          </button>

          {isFilterOpen && (
            <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-xl shadow-lg p-1 z-20">
              {filterOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setUserGrowthFilter(opt)
                    setIsFilterOpen(false)
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold ${
                    userGrowthFilter === opt
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

      {/* Legend Pills */}
      <div className="flex items-center gap-3 sm:gap-4 flex-wrap mb-2 text-[11px] font-bold">
        <div className="flex items-center gap-1.5 text-slate-600">
          <span className="size-2 rounded-full bg-blue-600" />
          <span>Patients</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600">
          <span className="size-2 rounded-full bg-emerald-500" />
          <span>Doctors</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600">
          <span className="size-2 rounded-full bg-purple-500" />
          <span>Hospital Admins</span>
        </div>
      </div>

      {/* Multi-line SVG Chart */}
      <div className="relative w-full overflow-hidden">
        {/* Floating Callout matching mockup */}
        {activePatientPt && (
          <div
            style={{
              left: `${(activePatientPt.x / width) * 100}%`,
              top: `${(activePatientPt.y / height) * 100 - 18}%`,
            }}
            className="absolute -translate-x-1/2 -translate-y-full bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-xl shadow-md border border-slate-200 text-left pointer-events-none z-10 whitespace-nowrap animate-in fade-in zoom-in-95 duration-150"
          >
            <p className="text-[10px] font-bold text-slate-400">Patients • {activeData.month}</p>
            <div className="flex items-center gap-1 text-xs font-black text-slate-900">
              <span>{activeData.patients.toLocaleString()}</span>
              <span className="text-[10px] text-emerald-600 font-extrabold">+18%</span>
            </div>
          </div>
        )}

        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 overflow-visible">
          {/* Subtle horizontal grid lines */}
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

          {/* Lines */}
          <path d={patientPath} fill="none" stroke="#2563EB" strokeWidth="2.5" />
          <path d={doctorPath} fill="none" stroke="#10B981" strokeWidth="2.2" />
          <path d={adminPath} fill="none" stroke="#A855F7" strokeWidth="2.2" />

          {/* Dots on Hover */}
          {patientPoints.map((pt, i) => (
            <circle
              key={`p-${i}`}
              cx={pt.x}
              cy={pt.y}
              r={hoveredIdx === i ? 5 : 3}
              fill="#2563EB"
              stroke="#FFFFFF"
              strokeWidth="2"
              className="cursor-pointer transition-all"
              onMouseEnter={() => setHoveredIdx(i)}
              onClick={() => setHoveredIdx(i)}
            />
          ))}

          {doctorPoints.map((pt, i) => (
            <circle
              key={`d-${i}`}
              cx={pt.x}
              cy={pt.y}
              r={hoveredIdx === i ? 4.5 : 2.5}
              fill="#10B981"
              stroke="#FFFFFF"
              strokeWidth="2"
              className="cursor-pointer transition-all"
              onMouseEnter={() => setHoveredIdx(i)}
              onClick={() => setHoveredIdx(i)}
            />
          ))}

          {adminPoints.map((pt, i) => (
            <circle
              key={`a-${i}`}
              cx={pt.x}
              cy={pt.y}
              r={hoveredIdx === i ? 4.5 : 2.5}
              fill="#A855F7"
              stroke="#FFFFFF"
              strokeWidth="2"
              className="cursor-pointer transition-all"
              onMouseEnter={() => setHoveredIdx(i)}
              onClick={() => setHoveredIdx(i)}
            />
          ))}
        </svg>

        {/* X Axis Labels */}
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 pt-1 border-t border-slate-100">
          {userGrowth.map((d, i) => (
            <button
              key={d.month}
              type="button"
              onClick={() => setHoveredIdx(i)}
              onMouseEnter={() => setHoveredIdx(i)}
              className={`flex-1 text-center py-0.5 rounded-md cursor-pointer transition-colors ${
                hoveredIdx === i ? 'text-blue-700 bg-blue-50 font-black' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              {d.month}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default UserGrowthChart
