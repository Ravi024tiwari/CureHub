import React from 'react'
import {
  User,
  GraduationCap,
  Briefcase,
  CalendarClock,
  Building2,
  FileText,
} from 'lucide-react'

export type DoctorProfileTabKey =
  | 'personal'
  | 'qualifications'
  | 'experience'
  | 'schedule'
  | 'hospital'
  | 'documents'

interface DoctorProfileTabsProps {
  activeTab: DoctorProfileTabKey
  onSelectTab: (tab: DoctorProfileTabKey) => void
  qualificationsCount?: number
  experienceCount?: number
}

export const DoctorProfileTabs: React.FC<DoctorProfileTabsProps> = ({
  activeTab,
  onSelectTab,
  qualificationsCount,
  experienceCount,
}) => {
  const tabs = [
    {
      key: 'personal' as DoctorProfileTabKey,
      label: 'Personal & Professional',
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
    <div className="w-full overflow-x-auto no-scrollbar py-1">
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-max p-1 bg-white/80 backdrop-blur-xs rounded-2xl border border-slate-200/80 shadow-2xs">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.key

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onSelectTab(tab.key)}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer select-none ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Icon
                className={`size-4 sm:size-4.5 ${
                  isActive ? 'text-white' : 'text-slate-500'
                }`}
              />
              <span>{tab.label}</span>
              {typeof tab.badge === 'number' && tab.badge > 0 && (
                <span
                  className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
