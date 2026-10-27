import { type FC } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Activity,
  LayoutDashboard,
  ShieldCheck,
  Stethoscope,
  Building2,
  Building,
  BarChart3,
  FileText,
  Headphones,
  X,
  PanelLeftClose,
} from 'lucide-react'
import { useSuperAdminStore } from '@/store/superAdminStore'

interface SuperAdminSidebarProps {
  isMobileDrawer?: boolean
  onCloseDrawer?: () => void
}

export const SuperAdminSidebar: FC<SuperAdminSidebarProps> = ({
  isMobileDrawer = false,
  onCloseDrawer,
}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { kpis, setIsSidebarCollapsed } = useSuperAdminStore()

  const currentPath = location.pathname

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/super-admin/dashboard',
      alias: ['/dashboard', '/super-admin'],
    },
    {
      id: 'verifications',
      label: 'Verifications',
      icon: ShieldCheck,
      path: '/super-admin/verifications',
      badge: kpis.pendingVerifications || 18,
    },
    {
      id: 'doctors',
      label: 'Doctors',
      icon: Stethoscope,
      path: '/super-admin/doctors',
    },
    {
      id: 'hospital-admins',
      label: 'Hospital Admins',
      icon: Building2,
      path: '/super-admin/hospital-admins',
    },
    {
      id: 'hospitals',
      label: 'Hospitals',
      icon: Building,
      path: '/super-admin/hospitals',
    },
    {
      id: 'analytics',
      label: 'Reports & Analytics',
      icon: BarChart3,
      path: '/super-admin/analytics',
    },
    {
      id: 'audit-logs',
      label: 'Audit Logs',
      icon: FileText,
      path: '/super-admin/audit-logs',
    },
  ]

  const handleNavigation = (path: string) => {
    if (onCloseDrawer) onCloseDrawer()
    navigate(path)
  }

  const sidebarContent = (
    <div className="flex flex-col flex-1 min-h-0 justify-between h-full bg-white select-none">
      <div className="flex flex-col flex-1 min-h-0">
        {/* Brand Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100/90 shrink-0">
          <div
            onClick={() => handleNavigation('/super-admin/dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="size-9 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <Activity className="size-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900 block leading-none">
                Care<span className="text-blue-600">Plus</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block mt-1">
                Super Admin
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
        <nav className="p-3 space-y-0.5 overflow-y-auto overscroll-contain flex-1 scrollbar-thin scrollbar-thumb-slate-200">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              currentPath === item.path ||
              (item.alias && item.alias.includes(currentPath))

            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer group ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-bold shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`size-4 transition-colors ${
                      isActive
                        ? 'text-blue-600 stroke-[2.3]'
                        : 'text-slate-400 group-hover:text-slate-700'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500 text-white shadow-2xs">
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Bottom Help Widget Matching Mockup */}
      <div className="p-4 border-t border-slate-100 shrink-0">
        <div className="bg-gradient-to-br from-blue-50/80 via-sky-50/50 to-indigo-50/60 border border-blue-100/80 rounded-2xl p-4 text-center space-y-2.5">
          <div className="size-9 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md shadow-blue-500/25">
            <Headphones className="size-4.5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900">Need Help?</h4>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
              Get 24/7 support for platform administration.
            </p>
          </div>
          <button
            onClick={() => alert('CarePlus Super Admin Technical Support: support@careplus.org | +91 1800-419-7000')}
            className="w-full py-1.5 px-3 bg-white hover:bg-slate-50 border border-blue-200/80 text-blue-600 font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer hover:border-blue-300"
          >
            Contact Support
          </button>
        </div>
      </div>
    </div>
  )

  if (isMobileDrawer) {
    return (
      <div className="fixed inset-0 z-50 flex lg:hidden animate-in fade-in duration-200">
        <div
          onClick={onCloseDrawer}
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity cursor-pointer"
        />
        <aside className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-left duration-300">
          {sidebarContent}
        </aside>
      </div>
    )
  }

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col justify-between h-full shrink-0 select-none">
      {sidebarContent}
    </aside>
  )
}

export default SuperAdminSidebar
