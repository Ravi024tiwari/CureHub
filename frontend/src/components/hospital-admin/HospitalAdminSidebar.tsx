import { type FC } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Activity,
  LayoutDashboard,
  Building2,
  Stethoscope,
  UserPlus,
  Calendar,
  Settings,
  X,
  ChevronRight,
  PanelLeftClose,
} from 'lucide-react'
import { useHospitalAdminStore } from '@/store/hospitalAdminStore'

interface HospitalAdminSidebarProps {
  isMobileDrawer?: boolean
  onCloseDrawer?: () => void
}

export const HospitalAdminSidebar: FC<HospitalAdminSidebarProps> = ({
  isMobileDrawer = false,
  onCloseDrawer,
}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { kpis, topHospitals, selectedHospitalId, setIsSidebarCollapsed } = useHospitalAdminStore()

  const currentPath = location.pathname

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/hospital-admin/dashboard',
      alias: ['/dashboard', '/hospital-admin'],
    },
    {
      id: 'hospitals',
      label: 'Hospitals',
      icon: Building2,
      path: '/hospital-admin/hospitals',
    },
    {
      id: 'doctors',
      label: 'Doctors',
      icon: Stethoscope,
      path: '/hospital-admin/doctors',
    },
    {
      id: 'join-requests',
      label: 'Join Requests',
      icon: UserPlus,
      path: '/hospital-admin/join-requests',
      badge: kpis.pendingJoinRequests,
    },
    {
      id: 'appointments',
      label: 'Appointments',
      icon: Calendar,
      path: '/hospital-admin/appointments',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: '/hospital-admin/settings',
    },
  ]

  const activeHospital =
    topHospitals.find((h) => h.id === selectedHospitalId) || topHospitals[0] || {
      name: 'Apollo Multispeciality',
      city: 'Bilaspur, Chhattisgarh',
    }

  const handleNavigation = (path: string) => {
    if (onCloseDrawer) onCloseDrawer()
    navigate(path)
  }

  const sidebarContent = (
    <div className="flex flex-col flex-1 min-h-0 justify-between h-full">
      <div className="flex flex-col flex-1 min-h-0">
        {/* Brand Header matching mockup */}
        <div className="p-5 flex items-center justify-between border-b border-slate-100/80 shrink-0">
          <div
            onClick={() => handleNavigation('/hospital-admin/dashboard')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="size-9 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <Activity className="size-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900 block leading-none">
                Care<span className="text-blue-600">Plus</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block mt-1">
                Hospital Admin
              </span>
            </div>
          </div>

          {isMobileDrawer ? (
            <button
              onClick={onCloseDrawer}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
              title="Close Navigation"
            >
              <X className="size-5" />
            </button>
          ) : (
            <button
              onClick={() => setIsSidebarCollapsed(true)}
              className="hidden lg:flex p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
              title="Collapse Sidebar"
              aria-label="Collapse Sidebar"
            >
              <PanelLeftClose className="size-4.5" />
            </button>
          )}
        </div>

        {/* Navigation Items List */}
        <nav className="p-3 space-y-1 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-200">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              currentPath === item.path ||
              (item.alias && item.alias.includes(currentPath)) ||
              (item.id === 'dashboard' && (currentPath === '/dashboard' || currentPath === '/hospital-admin')) ||
              (item.id === 'hospitals' && currentPath.startsWith('/hospital-admin/hospitals'))

            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer group ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-semibold'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`size-4.5 transition-colors ${
                      isActive
                        ? 'text-blue-600 stroke-[2.3]'
                        : 'text-slate-400 group-hover:text-slate-700'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500 text-white shadow-xs">
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Bottom Hospital Branch Card matching mockup */}
      <div className="p-4 border-t border-slate-100 shrink-0">
        <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/50 border border-blue-100/80 rounded-2xl p-3.5 relative overflow-hidden group hover:border-blue-200 transition-all">
          {/* Subtle Hospital Illustration Icon */}
          <div className="size-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center mb-2.5">
            <Building2 className="size-5 stroke-[2.2]" />
          </div>

          <h4 className="text-xs font-black text-slate-900 truncate leading-snug">
            {activeHospital.name}
          </h4>

          <div className="flex items-center gap-1.5 mt-1 text-[11px]">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-emerald-700">Active</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 truncate">{activeHospital.city}</span>
          </div>

          <div
            onClick={() => handleNavigation('/hospital-admin/hospitals')}
            className="mt-2.5 flex items-center justify-between text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer pt-2 border-t border-blue-100/60"
          >
            <span>Switch Facility</span>
            <ChevronRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  )

  if (isMobileDrawer) {
    return (
      <div className="fixed inset-0 z-50 flex lg:hidden animate-in fade-in duration-200">
        {/* Backdrop overlay */}
        <div
          onClick={onCloseDrawer}
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity cursor-pointer"
        />

        {/* Drawer slide-in */}
        <aside className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-left duration-300">
          {sidebarContent}
        </aside>
      </div>
    )
  }

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col justify-between h-screen shrink-0 sticky top-0">
      {sidebarContent}
    </aside>
  )
}
export default HospitalAdminSidebar
