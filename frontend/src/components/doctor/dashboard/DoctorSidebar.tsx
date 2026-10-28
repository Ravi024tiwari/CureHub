import type { FC } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Calendar,
  FileText,
  FileCheck2,
  CalendarOff,
  Clock,
  UserCheck,
  Settings,
  Headphones,
  HeartPulse,
  ExternalLink,
  Building2,
  type LucideIcon,
} from 'lucide-react'

interface NavItem {
  label: string
  icon: LucideIcon
  path: string
  badge?: string | number
}

interface DoctorSidebarProps {
  onCloseMobile?: () => void
}

export const DoctorSidebar: FC<DoctorSidebarProps> = ({ onCloseMobile }) => {
  const location = useLocation()
  const navigate = useNavigate()

  const navItems: NavItem[] = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Appointments', icon: Calendar, path: '/doctor/appointments' },
    { label: 'Hospitals', icon: Building2, path: '/doctor/hospitals' },
    { label: 'My Schedule', icon: Clock, path: '/doctor/schedule' },
    { label: 'Prescriptions', icon: FileText, path: '/doctor/prescriptions' },
    { label: 'Medical Reports', icon: FileCheck2, path: '/doctor/reports' },
    { label: 'Leave Management', icon: CalendarOff, path: '/doctor/leaves' },
    { label: 'My Profile', icon: UserCheck, path: '/doctor/profile' },
    { label: 'Settings', icon: Settings, path: '/doctor/settings' },
  ]

  const handleNav = (path: string) => {
    navigate(path)
    if (onCloseMobile) onCloseMobile()
  }

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-200/90 flex flex-col justify-between h-full select-none">
      {/* Top Brand & Portal Header */}
      <div>
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <HeartPulse className="size-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg text-slate-900 tracking-tight">CarePlus</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60 inline-block">
                Doctor Portal
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items List */}
        <div className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              location.pathname === item.path ||
              (item.path === '/dashboard' && location.pathname === '/')

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => handleNav(item.path)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/70 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`size-4.5 ${
                      isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="size-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Bottom Help & Support Box matching mockup */}
      <div className="p-4 border-t border-slate-100 space-y-3">
        <div className="bg-gradient-to-br from-blue-50/70 to-indigo-50/40 border border-blue-100 rounded-2xl p-3.5 text-center space-y-2">
          <div className="size-9 rounded-xl bg-white text-blue-600 flex items-center justify-center mx-auto shadow-xs border border-blue-100">
            <Headphones className="size-4.5 stroke-[2.2]" />
          </div>
          <div>
            <h5 className="text-xs font-black text-slate-900">Need Help?</h5>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Get 24/7 clinical & platform support from CarePlus team.
            </p>
          </div>
          <button
            type="button"
            onClick={() => alert('Support line: support@careplus.health | Emergency Desk: 1800-CARE-PLUS')}
            className="w-full py-1.5 px-3 bg-white hover:bg-blue-600 hover:text-white text-blue-700 text-xs font-bold rounded-xl border border-blue-200/80 shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Contact Support</span>
            <ExternalLink className="size-3" />
          </button>
        </div>
      </div>
    </aside>
  )
}

export default DoctorSidebar
