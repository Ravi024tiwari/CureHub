import { type FC } from 'react'
import {
  Stethoscope,
  Users,
  ChevronRight,
  Heart,
  Brain,
  Bone,
  Baby,
  Eye,
  Activity,
  Syringe,
  Pill,
} from 'lucide-react'

interface DepartmentItem {
  department: string
  doctorCount: number
}

interface HospitalDepartmentsTabProps {
  departments: DepartmentItem[]
  onSelectDepartment?: (dept: string) => void
}

export const HospitalDepartmentsTab: FC<HospitalDepartmentsTabProps> = ({
  departments,
  onSelectDepartment,
}) => {
  const departmentIcons: Record<string, any> = {
    Cardiology: Heart,
    Neurology: Brain,
    Orthopedics: Bone,
    Pediatrics: Baby,
    Ophthalmology: Eye,
    'General Medicine': Stethoscope,
    Dermatology: Activity,
    Urology: Syringe,
    Gynecology: Pill,
  }

  // Fallback departments if none provided
  const list = departments.length > 0
    ? departments
    : [
        { department: 'Cardiology', doctorCount: 4 },
        { department: 'Neurology', doctorCount: 3 },
        { department: 'Orthopedics', doctorCount: 5 },
        { department: 'Pediatrics', doctorCount: 3 },
        { department: 'General Medicine', doctorCount: 6 },
        { department: 'Dermatology', doctorCount: 2 },
        { department: 'Gynecology', doctorCount: 3 },
        { department: 'Urology', doctorCount: 2 },
      ]

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              Hospital Departments ({list.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive list of medical divisions and specialist doctor staffing.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {list.map((dept, idx) => {
            const Icon = departmentIcons[dept.department] || Stethoscope
            return (
              <div
                key={idx}
                onClick={() => onSelectDepartment?.(dept.department)}
                className="p-5 rounded-2xl border border-slate-200/80 hover:border-blue-300 bg-slate-50/50 hover:bg-white transition-all shadow-2xs hover:shadow-md cursor-pointer group flex items-start gap-4"
              >
                <div className="size-11 rounded-2xl bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex items-center justify-center shrink-0 transition-all duration-300 shadow-2xs">
                  <Icon className="size-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                    {dept.department}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mt-1">
                    <Users className="size-3.5 text-slate-400" />
                    <span>{dept.doctorCount} Doctors</span>
                  </div>
                </div>

                <ChevronRight className="size-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all self-center" />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
