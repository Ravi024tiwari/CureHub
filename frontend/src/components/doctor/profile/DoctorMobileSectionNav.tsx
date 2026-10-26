import React from 'react'
import {
  User,
  GraduationCap,
  Briefcase,
  CalendarClock,
  Building2,
  FileText,
  ChevronRight,
} from 'lucide-react'
import type { DoctorProfileTabKey } from './DoctorProfileTabs'

interface DoctorMobileSectionNavProps {
  activeTab: DoctorProfileTabKey
  onSelectTab: (tab: DoctorProfileTabKey) => void
  qualificationsCount?: number
  experienceCount?: number
}

export const DoctorMobileSectionNav: React.FC<DoctorMobileSectionNavProps> = ({
  activeTab,
  onSelectTab,
  qualificationsCount = 2,
  experienceCount = 2,
}) => {
  const sections = [
    {
      key: 'personal' as DoctorProfileTabKey,
      label: 'Basic Information',
      icon: User,
    },
    {
      key: 'qualifications' as DoctorProfileTabKey,
      label: 'Qualifications',
      icon: GraduationCap,
      badge: qualificationsCount,
    },
    {
      key: 'experience' as DoctorProfileTabKey,
      label: 'Experience',
      icon: Briefcase,
      badge: experienceCount,
    },
    {
      key: 'schedule' as DoctorProfileTabKey,
      label: 'Schedule & Availability',
      icon: CalendarClock,
    },
    {
      key: 'hospital' as DoctorProfileTabKey,
      label: 'Hospital Affiliation',
      icon: Building2,
    },
    {
      key: 'documents' as DoctorProfileTabKey,
      label: 'Documents',
      icon: FileText,
    },
  ]

  return (
    <div className="lg:hidden space-y-2">
      {sections.map((sec) => {
        const Icon = sec.icon
        const isSelected = activeTab === sec.key

        return (
          <button
            key={sec.key}
            type="button"
            onClick={() => onSelectTab(sec.key)}
            className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
              isSelected
                ? 'bg-blue-50/90 border-blue-300 shadow-xs text-blue-900 font-bold'
                : 'bg-white border-slate-200/90 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`size-8 rounded-xl flex items-center justify-center ${
                  isSelected ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'
                }`}
              >
                <Icon className="size-4" />
              </div>
              <span className="text-xs font-bold">{sec.label}</span>
            </div>

            <div className="flex items-center gap-2">
              {typeof sec.badge === 'number' && sec.badge > 0 && (
                <span className="size-5 rounded-full bg-blue-100 text-blue-700 font-black text-[10px] flex items-center justify-center">
                  {sec.badge}
                </span>
              )}
              <ChevronRight
                className={`size-4 ${
                  isSelected ? 'text-blue-600' : 'text-slate-400'
                }`}
              />
            </div>
          </button>
        )
      })}
    </div>
  )
}
