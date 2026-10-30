import { useEffect, type FC } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Activity,
  LayoutDashboard,
  Building2,
  Stethoscope,
  UserPlus,
  Calendar,
  CalendarOff,
  User,
  X,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { useHospitalAdminStore } from '@/store/hospitalAdminStore'

export interface HospitalAdminSidebarProps {
  isMobileDrawer?: boolean
  onCloseDrawer?: () => void
  className?: string
}

export const HospitalAdminSidebar: FC<HospitalAdminSidebarProps> = ({
  isMobileDrawer = false,
  onCloseDrawer,
  className = '',
}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const {
    kpis,
    topHospitals,
    selectedHospitalId,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
  } = useHospitalAdminStore()

  const currentPath = location.pathname

  // Lock body scroll and handle Escape key when mobile drawer is open
  useEffect(() => {
    if (!isMobileDrawer) return

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onCloseDrawer) {
        onCloseDrawer()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMobileDrawer, onCloseDrawer])

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
      id: 'leaves',
      label: 'Leave Requests',
      icon: CalendarOff,
      path: '/hospital-admin/leaves',
      alias: ['/hospital-admin/leaves', '/hospital-admin/doctor-leaves'],
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      path: '/hospital-admin/profile',
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

  const isItemActive = (item: (typeof navItems)[0]) => {
    if (currentPath === item.path) return true
    if (item.alias && item.alias.includes(currentPath)) return true
    if (item.id === 'dashboard' && (currentPath === '/dashboard' || currentPath === '/hospital-admin')) return true
    if (item.id === 'hospitals' && currentPath.startsWith('/hospital-admin/hospitals')) return true
    if (item.id === 'doctors' && currentPath.startsWith('/hospital-admin/doctors')) return true
    if (item.id === 'join-requests' && currentPath.startsWith('/hospital-admin/join-requests')) return true
    if (item.id === 'appointments' && currentPath.startsWith('/hospital-admin/appointments')) return true
    if (item.id === 'leaves' && currentPath.startsWith('/hospital-admin/leaves')) return true
    if (item.id === 'profile' && currentPath.startsWith('/hospital-admin/profile')) return true
    return false
  }

  // -------------------------------------------------------------
  // 1. MOBILE DRAWER OVERLAY VIEW (< 1024px)
  // -------------------------------------------------------------
  if (isMobileDrawer) {
    return (
      <div
        className="fixed inset-0 z-50 flex lg:hidden animate-in fade-in duration-200"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Menu"
      >
        {/* Backdrop overlay */}
        <div
          onClick={onCloseDrawer}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity cursor-pointer"
        />

        {/* Drawer slide-in panel */}
        <aside className="relative w-72 sm:w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-left duration-300">
          <div className="flex flex-col flex-1 min-h-0">
            {/* Brand Header */}
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100 shrink-0">
              <div
                onClick={() => handleNavigation('/hospital-admin/dashboard')}
                className="flex items-center gap-3 cursor-pointer select-none group"
              >
                <div className="size-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
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

              <button
                type="button"
                onClick={onCloseDrawer}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
                title="Close Navigation"
                aria-label="Close Navigation"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Navigation Items */}
            <nav className="p-3 space-y-1.5 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-200">
              <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Menu Navigation
              </div>
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = isItemActive(item)

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer group ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 shadow-2xs font-extrabold border-l-4 border-blue-600'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-semibold'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`size-5 transition-colors ${
                          isActive
                            ? 'text-blue-600 stroke-[2.3]'
                            : 'text-slate-400 group-hover:text-slate-700'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500 text-white shadow-xs animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Bottom Hospital Branch Card */}
          <div className="p-4 border-t border-slate-100 shrink-0 bg-slate-50/50">
            <div className="bg-gradient-to-br from-blue-50/90 to-indigo-50/60 border border-blue-100/90 rounded-2xl p-3.5 relative overflow-hidden group hover:border-blue-200 transition-all shadow-xs">
              <div className="size-9 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center mb-2">
                <Building2 className="size-4.5 stroke-[2.2]" />
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

              <button
                type="button"
                onClick={() => handleNavigation('/hospital-admin/hospitals')}
                className="w-full mt-2.5 pt-2 border-t border-blue-100/70 flex items-center justify-between text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                <span>Switch Facility</span>
                <ChevronRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </aside>
      </div>
    )
  }

  // -------------------------------------------------------------
  // 2. DESKTOP VIEW (COLLAPSED MINI-RAIL: w-20)
  // -------------------------------------------------------------
  if (isSidebarCollapsed) {
    return (
      <aside
        className={`hidden lg:flex flex-col justify-between h-screen shrink-0 bg-white border-r border-slate-200/80 sticky top-0 z-20 select-none w-20 transition-[width] duration-300 ease-in-out ${className}`}
        aria-label="Collapsed Hospital Admin Navigation"
      >
        <div className="flex flex-col flex-1 min-h-0 items-center">
          {/* Brand Header (Icon Only) */}
          <div className="h-18 flex items-center justify-center border-b border-slate-100/80 w-full shrink-0">
            <button
              type="button"
              onClick={() => handleNavigation('/hospital-admin/dashboard')}
              className="size-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 hover:scale-105 transition-transform cursor-pointer group relative"
              title="CarePlus Hospital Admin Dashboard"
            >
              <Activity className="size-5 stroke-[2.5]" />
              {/* Tooltip on hover */}
              <div className="absolute left-[calc(100%+14px)] top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                <span>CarePlus Hospital Admin</span>
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-slate-900" />
              </div>
            </button>
          </div>

          {/* Navigation Items (Icon Only Rail with Tooltips) */}
          <nav className="p-2.5 space-y-2 overflow-y-auto flex-1 w-full flex flex-col items-center scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = isItemActive(item)

              return (
                <div key={item.id} className="relative group w-full flex justify-center">
                  <button
                    type="button"
                    onClick={() => handleNavigation(item.path)}
                    className={`size-11 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 font-extrabold shadow-2xs ring-1 ring-blue-200'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                    aria-label={item.label}
                  >
                    {/* Active vertical accent pill on left */}
                    {isActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 bg-blue-600 rounded-r-full" />
                    )}

                    <Icon
                      className={`size-5 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-blue-600 stroke-[2.3]' : 'text-slate-500'
                      }`}
                    />

                    {/* Mini Badge dot for pending count */}
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="absolute top-1.5 right-1.5 size-2.5 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
                    )}
                  </button>

                  {/* Interactive Floating Tooltip */}
                  <div className="absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-150 z-50 flex items-center gap-2">
                    <span>{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-extrabold">
                        {item.badge}
                      </span>
                    )}
                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-slate-900" />
                  </div>
                </div>
              )
            })}
          </nav>
        </div>

        {/* Bottom Section (Compact Hospital Icon & Expand Button) */}
        <div className="p-2 border-t border-slate-100 flex flex-col items-center gap-2 shrink-0 bg-slate-50/50">
          {/* Facility compact icon */}
          <div className="relative group">
            <button
              type="button"
              onClick={() => handleNavigation('/hospital-admin/hospitals')}
              className="size-11 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/80 text-blue-600 flex items-center justify-center cursor-pointer hover:border-blue-300 relative transition-all"
              title="Switch Hospital Branch"
            >
              <Building2 className="size-5 stroke-[2.2]" />
              <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
            </button>

            {/* Tooltip */}
            <div className="absolute left-[calc(100%+12px)] bottom-0 px-3.5 py-2.5 bg-slate-900 text-white text-xs rounded-xl shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-150 z-50">
              <p className="font-bold text-white">{activeHospital.name}</p>
              <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5 mt-0.5">
                <span className="size-1.5 rounded-full bg-emerald-400" /> Active Facility
              </p>
              <p className="text-[10px] text-slate-400 mt-1">{activeHospital.city}</p>
              <div className="mt-2 pt-1.5 border-t border-slate-800 text-[10px] font-bold text-blue-400 flex items-center justify-between">
                <span>Switch facility</span>
                <ChevronRight className="size-3" />
              </div>
              <div className="absolute -left-1 bottom-3 border-y-4 border-y-transparent border-r-4 border-r-slate-900" />
            </div>
          </div>

          {/* Expand Toggle Button */}
          <div className="relative group w-full flex justify-center">
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(false)}
              className="size-11 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer flex items-center justify-center"
              title="Expand sidebar (Ctrl+B)"
              aria-label="Expand sidebar"
            >
              <PanelLeftOpen className="size-5" />
            </button>

            {/* Expand Tooltip */}
            <div className="absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 flex items-center gap-2">
              <span>Expand sidebar</span>
              <kbd className="px-1 text-[10px] bg-slate-800 rounded text-slate-300 font-mono">
                Ctrl+B
              </kbd>
              <div className="absolute -left-1 top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-slate-900" />
            </div>
          </div>
        </div>
      </aside>
    )
  }

  // -------------------------------------------------------------
  // 3. DESKTOP VIEW (EXPANDED FULL SIDEBAR: w-64)
  // -------------------------------------------------------------
  return (
    <aside
      className={`hidden lg:flex flex-col justify-between h-screen shrink-0 bg-white border-r border-slate-200/80 sticky top-0 z-20 select-none w-64 transition-[width] duration-300 ease-in-out ${className}`}
      aria-label="Hospital Admin Sidebar Navigation"
    >
      <div className="flex flex-col flex-1 min-h-0">
        {/* Brand Header */}
        <div className="h-18 px-5 flex items-center justify-between border-b border-slate-100/80 shrink-0">
          <div
            onClick={() => handleNavigation('/hospital-admin/dashboard')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="size-9.5 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
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

          <button
            type="button"
            onClick={() => setIsSidebarCollapsed(true)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
            title="Collapse Sidebar (Ctrl+B)"
            aria-label="Collapse Sidebar"
          >
            <PanelLeftClose className="size-4.5" />
          </button>
        </div>

        {/* Navigation Items List */}
        <nav className="p-3 space-y-1 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-200">
          <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = isItemActive(item)

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer group relative ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 shadow-2xs font-extrabold border-l-4 border-blue-600'
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

      {/* Bottom Section: Active Facility Card & Collapse Row */}
      <div className="p-4 border-t border-slate-100 shrink-0 bg-slate-50/50 space-y-2">
        <div className="bg-gradient-to-br from-blue-50/90 to-indigo-50/60 border border-blue-100/90 rounded-2xl p-3.5 relative overflow-hidden group hover:border-blue-200 transition-all shadow-xs">
          <div className="size-9 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center mb-2">
            <Building2 className="size-4.5 stroke-[2.2]" />
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

          <button
            type="button"
            onClick={() => handleNavigation('/hospital-admin/hospitals')}
            className="w-full mt-2.5 pt-2 border-t border-blue-100/70 flex items-center justify-between text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
          >
            <span>Switch Facility</span>
            <ChevronRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Footer collapse button with keyboard shortcut hint */}
        <button
          type="button"
          onClick={() => setIsSidebarCollapsed(true)}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer group"
          title="Collapse sidebar (Ctrl+B)"
        >
          <div className="flex items-center gap-2">
            <PanelLeftClose className="size-3.5" />
            <span>Collapse</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[9px] font-mono bg-white border border-slate-200 rounded text-slate-400 group-hover:text-slate-600">
            Ctrl+B
          </kbd>
        </button>
      </div>
    </aside>
  )
}

export default HospitalAdminSidebar
