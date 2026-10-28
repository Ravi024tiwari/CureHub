import { type FC } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Calendar,
  Building2,
  Stethoscope,
  Menu,
} from 'lucide-react'

interface HospitalAdminMobileNavProps {
  onToggleSidebar?: () => void
}

export const HospitalAdminMobileNav: FC<HospitalAdminMobileNavProps> = ({ onToggleSidebar }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/hospital-admin/dashboard',
      alias: ['/dashboard', '/hospital-admin'],
    },
    {
      id: 'appointments',
      label: 'Appointments',
      icon: Calendar,
      path: '/hospital-admin/appointments',
    },
    {
      id: 'doctors',
      label: 'Doctors',
      icon: Stethoscope,
      path: '/hospital-admin/doctors',
    },
    {
      id: 'hospitals',
      label: 'Hospitals',
      icon: Building2,
      path: '/hospital-admin/hospitals',
    },
  ]

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200/90 z-40 px-3 py-2 flex items-center justify-around shadow-lg">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive =
          location.pathname === item.path ||
          (item.alias && item.alias.includes(location.pathname))

        return (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center gap-1 p-1 transition-all relative ${
              isActive ? 'text-blue-600 font-bold' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <div className="relative">
              <Icon className="size-5 stroke-[2.2]" />
            </div>
            <span className="text-[10px] leading-none">{item.label}</span>
          </button>
        )
      })}

      {/* Menu / Drawer Toggle */}
      <button
        onClick={onToggleSidebar}
        className="flex flex-col items-center justify-center gap-1 p-1 text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
      >
        <Menu className="size-5 stroke-[2.2]" />
        <span className="text-[10px] leading-none">More</span>
      </button>
    </div>
  )
}
