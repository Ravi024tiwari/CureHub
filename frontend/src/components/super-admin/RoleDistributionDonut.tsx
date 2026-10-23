import { useState, type FC } from 'react'
import { useSuperAdminStore } from '@/store/superAdminStore'

export const RoleDistributionDonut: FC = () => {
  const { roleDistribution } = useSuperAdminStore()
  const [hoveredRole, setHoveredRole] = useState<string | null>(null)

  const totalUsers = roleDistribution.reduce((acc, curr) => acc + curr.count, 0)

  // Donut SVG parameters
  const size = 160
  const strokeWidth = 22
  const center = size / 2
  const radius = center - strokeWidth / 2
  const circumference = 2 * Math.PI * radius

  // Calculate SVG stroke dashes
  let accumulatedPercent = 0
  const segments = roleDistribution.map((item) => {
    const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`
    const strokeDashoffset = -((accumulatedPercent / 100) * circumference)
    accumulatedPercent += item.percentage
    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
    }
  })

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
      <div>
        <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
          Role-wise User Distribution
        </h3>
        <p className="text-[11px] text-slate-400 font-medium mb-3">
          Active breakdown of platform accounts
        </p>
      </div>

      {/* Donut and Legend Layout */}
      <div className="flex flex-col sm:flex-row items-center gap-4 my-auto">
        {/* SVG Donut Circle */}
        <div className="relative shrink-0 flex items-center justify-center">
          <svg width={size} height={size} className="rotate-[-90deg]">
            {/* Background Circle */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke="#F1F5F9"
              strokeWidth={strokeWidth}
            />

            {/* Colored Segments */}
            {segments.map((seg) => (
              <circle
                key={seg.role}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={seg.color}
                strokeWidth={hoveredRole === seg.role ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={seg.strokeDasharray}
                strokeDashoffset={seg.strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredRole(seg.role)}
                onMouseLeave={() => setHoveredRole(null)}
              />
            ))}
          </svg>

          {/* Center Text Matching Mockup */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-base sm:text-lg font-black text-slate-900 leading-tight">
              {totalUsers.toLocaleString()}
            </span>
            <span className="text-[10px] font-bold text-slate-400">Total Users</span>
          </div>
        </div>

        {/* Legend List Matching Mockup */}
        <div className="flex-1 w-full space-y-2">
          {roleDistribution.map((item) => (
            <div
              key={item.role}
              onMouseEnter={() => setHoveredRole(item.role)}
              onMouseLeave={() => setHoveredRole(null)}
              className={`flex items-center justify-between text-xs py-1 px-1.5 rounded-lg transition-colors cursor-pointer ${
                hoveredRole === item.role ? 'bg-slate-50 font-bold' : 'text-slate-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`size-2.5 rounded-full ${item.bg}`} />
                <span className="font-semibold text-slate-700">{item.role}</span>
              </div>

              <div className="flex items-center gap-2 font-mono">
                <span className="font-bold text-slate-900">{item.count.toLocaleString()}</span>
                <span className="text-[11px] text-slate-400 w-10 text-right">
                  {item.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default RoleDistributionDonut
