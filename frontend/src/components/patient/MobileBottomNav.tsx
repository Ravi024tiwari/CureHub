import { type FC } from 'react'
import { Home, Stethoscope, Building2, Calendar, User } from 'lucide-react'

interface MobileBottomNavProps {
  activeTab: string
  onSelectTab: (tab: string) => void
}

export const MobileBottomNav: FC<MobileBottomNavProps> = ({ activeTab, onSelectTab }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'doctors', label: 'Doctors', icon: Stethoscope },
    { id: 'hospitals', label: 'Hospitals', icon: Building2 },
    { id: 'appointments', label: 'Appts', icon: Calendar },
    { id: 'profile', label: 'Profile', icon: User },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 md:hidden shadow-lg shadow-slate-900/10">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
                isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <Icon className={`size-5 transition-transform ${isActive ? 'stroke-[2.4] scale-110' : 'stroke-[1.8]'}`} />
              <span className={`text-[10px] tracking-tight mt-0.5 ${isActive ? 'font-bold' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
