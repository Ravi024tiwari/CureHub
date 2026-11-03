import { type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { Home, Stethoscope, Building2, Calendar, FileText } from 'lucide-react'

interface MobileBottomNavProps {
  activeTab?: string
  onSelectTab?: (tab: string) => void
}

export const MobileBottomNav: FC<MobileBottomNavProps> = ({ activeTab = 'home', onSelectTab }) => {
  const navigate = useNavigate()

  const tabs = [
    { id: 'home', label: 'Home', icon: Home, path: '/patient/home' },
    { id: 'doctors', label: 'Doctors', icon: Stethoscope, path: '/patient/doctors' },
    { id: 'hospitals', label: 'Hospitals', icon: Building2, path: '/patient/hospitals' },
    { id: 'records', label: 'Records', icon: FileText, path: '/patient/records' },
    { id: 'appointments', label: 'Appts', icon: Calendar, path: '/patient/appointments' },
  ]

  const handleTabClick = (tab: (typeof tabs)[0]) => {
    if (onSelectTab) {
      onSelectTab(tab.id)
    } else if (tab.path) {
      navigate(tab.path)
    }
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 md:hidden shadow-lg shadow-slate-900/10">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
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
