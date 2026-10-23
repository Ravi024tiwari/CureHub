import type { FC } from 'react'
import { User, Stethoscope, Building2, CheckCircle2 } from 'lucide-react'
import { UserRole } from '@/types/auth'
import type { RoleType } from '@/types/auth'
import { cn } from '@/lib/utils'

interface RoleSelectorProps {
  selectedRole: RoleType
  onSelectRole: (role: RoleType) => void
}

export const RoleSelector: FC<RoleSelectorProps> = ({
  selectedRole,
  onSelectRole,
}) => {
  const roles = [
    {
      id: UserRole.PATIENT,
      title: 'Patient',
      description: 'Book appointments & health',
      icon: User,
    },
    {
      id: UserRole.DOCTOR,
      title: 'Doctor',
      description: 'Consult patients & practice',
      icon: Stethoscope,
    },
    {
      id: UserRole.HOSPITAL_ADMIN,
      title: 'Hospital Admin',
      description: 'Manage hospital & staff',
      icon: Building2,
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-2.5 w-full">
      {roles.map((item) => {
        const IconComponent = item.icon
        const isSelected = selectedRole === item.id
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectRole(item.id)}
            className={cn(
              "relative flex flex-col items-center text-center p-2.5 sm:p-3 rounded-2xl border-2 transition-all duration-200 cursor-pointer group",
              isSelected
                ? "border-blue-600 bg-blue-50/60 shadow-sm shadow-blue-500/10"
                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50 text-slate-600"
            )}
          >
            {isSelected && (
              <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2">
                <CheckCircle2 className="size-3.5 text-blue-600" />
              </div>
            )}
            <div
              className={cn(
                "size-9 rounded-xl flex items-center justify-center mb-1.5 transition-colors",
                isSelected
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                  : "bg-blue-50 text-blue-600 group-hover:bg-blue-100"
              )}
            >
              <IconComponent className="size-4.5" />
            </div>
            <span
              className={cn(
                "font-bold text-xs sm:text-sm tracking-tight leading-tight",
                isSelected ? "text-slate-900" : "text-slate-700"
              )}
            >
              {item.title}
            </span>
            <span className="text-[10px] text-slate-500 leading-tight mt-0.5 line-clamp-2 hidden sm:block">
              {item.description}
            </span>
          </button>
        )
      })}
    </div>
  )
}
