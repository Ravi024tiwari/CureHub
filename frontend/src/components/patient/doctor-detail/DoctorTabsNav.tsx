import { type FC } from 'react'
import {
  FileText,
  GraduationCap,
  Calendar,
  Star,
  Building2,
  FileBadge,
} from 'lucide-react'

export type DoctorProfileTabKey =
  | 'overview'
  | 'education'
  | 'schedule'
  | 'reviews'
  | 'hospital'
  | 'documents'

interface DoctorTabsNavProps {
  activeTab: DoctorProfileTabKey
  onSelectTab: (tab: DoctorProfileTabKey) => void
  reviewCount?: number
}

export const DoctorTabsNav: FC<DoctorTabsNavProps> = ({
  activeTab,
  onSelectTab,
  reviewCount = 124,
}) => {
  const tabs: { key: DoctorProfileTabKey; label: string; icon: any }[] = [
    { key: 'overview', label: 'Overview', icon: FileText },
    { key: 'education', label: 'Education & Experience', icon: GraduationCap },
    { key: 'schedule', label: 'Schedule', icon: Calendar },
    { key: 'reviews', label: `Reviews (${reviewCount})`, icon: Star },
    { key: 'hospital', label: 'Hospital Info', icon: Building2 },
    { key: 'documents', label: 'Documents', icon: FileBadge },
  ]

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-1.5 overflow-x-auto scrollbar-none">
      <nav className="flex items-center gap-1 min-w-max">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => onSelectTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer select-none ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Icon className={`size-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
