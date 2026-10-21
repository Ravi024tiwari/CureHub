import { type FC } from 'react'
import {
  Stethoscope,
  Heart,
  Sparkles,
  Bone,
  Baby,
  Smile,
  Activity,
  Layers,
  ChevronRight,
} from 'lucide-react'
import { useHospitalAdminStore } from '@/store/hospitalAdminStore'

export const DepartmentDistributionCard: FC = () => {
  const { departmentStats } = useHospitalAdminStore()

  const getDeptIcon = (name: string) => {
    const n = name.toLowerCase()
    if (n.includes('general')) return Stethoscope
    if (n.includes('cardio')) return Heart
    if (n.includes('dermat')) return Sparkles
    if (n.includes('ortho')) return Bone
    if (n.includes('pediat')) return Baby
    if (n.includes('gynec')) return Smile
    if (n.includes('neuro')) return Activity
    return Layers
  }

  const getIconColor = (name: string) => {
    const n = name.toLowerCase()
    if (n.includes('general')) return 'text-blue-500 bg-blue-50'
    if (n.includes('cardio')) return 'text-rose-500 bg-rose-50'
    if (n.includes('dermat')) return 'text-amber-500 bg-amber-50'
    if (n.includes('ortho')) return 'text-cyan-500 bg-cyan-50'
    if (n.includes('pediat')) return 'text-purple-500 bg-purple-50'
    if (n.includes('gynec')) return 'text-pink-500 bg-pink-50'
    if (n.includes('neuro')) return 'text-indigo-500 bg-indigo-50'
    return 'text-slate-500 bg-slate-50'
  }

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-2xs flex flex-col gap-3 overflow-hidden h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
            Department Wise Appointments
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Speciality patient intake distribution
          </p>
        </div>
        <button className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer transition-colors shrink-0">
          <span>View All</span>
          <ChevronRight className="size-3.5" />
        </button>
      </div>

      {/* Department Rows matching mockup */}
      <div className="space-y-2.5 pt-1">
        {departmentStats.slice(0, 6).map((dept) => {
          const Icon = getDeptIcon(dept.department)
          const colorClass = getIconColor(dept.department)

          return (
            <div key={dept.department} className="flex items-center gap-2.5 text-xs group">
              {/* Icon */}
              <div
                className={`size-6 rounded-lg ${colorClass} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}
              >
                <Icon className="size-3.5 stroke-[2.2]" />
              </div>

              {/* Department Name */}
              <span className="flex-1 min-w-[70px] font-bold text-slate-700 truncate group-hover:text-slate-900 transition-colors text-xs">
                {dept.department}
              </span>

              {/* Count */}
              <span className="w-8 text-right font-mono font-bold text-slate-900 shrink-0 text-xs">
                {dept.appointments}
              </span>

              {/* Percentage */}
              <span className="w-7 text-right font-mono text-[10px] text-slate-400 shrink-0">
                {dept.percentage}%
              </span>

              {/* Horizontal Bar */}
              <div className="w-14 sm:w-20 md:w-24 h-2 bg-slate-100 rounded-full overflow-hidden shrink-0">
                <div
                  style={{ width: `${Math.min(100, dept.percentage * 3.5)}%` }}
                  className="h-full bg-blue-600 rounded-full group-hover:bg-blue-700 transition-all duration-300"
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
export default DepartmentDistributionCard
