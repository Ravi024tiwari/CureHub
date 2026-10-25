import type { FC } from 'react'
import { Calendar, CalendarOff, Eye } from 'lucide-react'

export type ScheduleTabType = 'routine' | 'leaves' | 'preview'

interface DoctorScheduleTabsProps {
  activeTab: ScheduleTabType
  onChangeTab: (tab: ScheduleTabType) => void
}

export const DoctorScheduleTabs: FC<DoctorScheduleTabsProps> = ({
  activeTab,
  onChangeTab,
}) => {
  const tabs = [
    { id: 'routine' as const, label: 'Weekly Routine', icon: Calendar },
    { id: 'leaves' as const, label: 'Leaves & Holidays', icon: CalendarOff },
    { id: 'preview' as const, label: 'Live Slot Preview', icon: Eye },
  ]

  return (
    <div className="flex items-center gap-2 p-1.5 bg-slate-100/90 rounded-2xl w-fit max-w-full overflow-x-auto border border-slate-200/80 shadow-2xs">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChangeTab(tab.id)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              isActive
                ? 'bg-white text-blue-600 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Icon className={`size-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
            <span>{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}
