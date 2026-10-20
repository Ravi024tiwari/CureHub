import { type FC } from 'react'
import {
  Stethoscope,
  Heart,
  Sparkles,
  Baby,
  Activity,
  HeartPulse,
  Brain,
  Smile,
  MoreHorizontal,
} from 'lucide-react'

interface SpecialtiesRowProps {
  selectedSpecialty: string | null
  onSelectSpecialty: (specialty: string | null) => void
}

export const SpecialtiesRow: FC<SpecialtiesRowProps> = ({
  selectedSpecialty,
  onSelectSpecialty,
}) => {
  const specialties = [
    {
      id: 'General Physician',
      label: 'General Physician',
      icon: Stethoscope,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100/80 border-blue-100',
      activeBg: 'bg-blue-600 text-white border-blue-600',
    },
    {
      id: 'Cardiology',
      label: 'Cardiologist',
      icon: Heart,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50 hover:bg-rose-100/80 border-rose-100',
      activeBg: 'bg-rose-600 text-white border-rose-600',
    },
    {
      id: 'Dermatology',
      label: 'Dermatologist',
      icon: Sparkles,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 hover:bg-amber-100/80 border-amber-100',
      activeBg: 'bg-amber-600 text-white border-amber-600',
    },
    {
      id: 'Pediatrics',
      label: 'Pediatrician',
      icon: Baby,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50 hover:bg-cyan-100/80 border-cyan-100',
      activeBg: 'bg-cyan-600 text-white border-cyan-600',
    },
    {
      id: 'Orthopedics',
      label: 'Orthopedist',
      icon: Activity,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 hover:bg-indigo-100/80 border-indigo-100',
      activeBg: 'bg-indigo-600 text-white border-indigo-600',
    },
    {
      id: 'Gynecology',
      label: 'Gynecologist',
      icon: HeartPulse,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50 hover:bg-pink-100/80 border-pink-100',
      activeBg: 'bg-pink-600 text-white border-pink-600',
    },
    {
      id: 'Neurology',
      label: 'Neurologist',
      icon: Brain,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 hover:bg-purple-100/80 border-purple-100',
      activeBg: 'bg-purple-600 text-white border-purple-600',
    },
    {
      id: 'Dentistry',
      label: 'Dentist',
      icon: Smile,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 hover:bg-emerald-100/80 border-emerald-100',
      activeBg: 'bg-emerald-600 text-white border-emerald-600',
    },
    {
      id: 'More',
      label: 'More',
      icon: MoreHorizontal,
      color: 'text-slate-600',
      bgColor: 'bg-slate-50 hover:bg-slate-100 border-slate-200/80',
      activeBg: 'bg-slate-800 text-white border-slate-800',
    },
  ]

  const handleClick = (id: string) => {
    if (id === 'More') {
      onSelectSpecialty(null)
      return
    }
    if (selectedSpecialty === id) {
      onSelectSpecialty(null) // toggle off
    } else {
      onSelectSpecialty(id)
    }
  }

  return (
    <div className="w-full">
      {/* Horizontal scroll container with scrollbar hidden */}
      <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth">
        {specialties.map((item) => {
          const Icon = item.icon
          const isSelected = selectedSpecialty === item.id

          return (
            <button
              key={item.id}
              onClick={() => handleClick(item.id)}
              className="flex flex-col items-center gap-2 group shrink-0 cursor-pointer transition-all"
            >
              {/* Circular icon container */}
              <div
                className={`size-13 sm:size-14 rounded-2xl flex items-center justify-center border transition-all duration-200 group-hover:scale-105 shadow-xs ${
                  isSelected ? item.activeBg : `${item.bgColor} ${item.color}`
                }`}
              >
                <Icon className="size-6 stroke-[2]" />
              </div>

              {/* Label */}
              <span
                className={`text-[11px] sm:text-xs font-semibold tracking-tight transition-colors truncate max-w-[80px] text-center ${
                  isSelected ? 'text-blue-600 font-bold' : 'text-slate-600 group-hover:text-slate-900'
                }`}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
