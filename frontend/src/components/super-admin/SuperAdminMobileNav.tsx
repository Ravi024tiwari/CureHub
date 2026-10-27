import { type FC } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  Building,
  Stethoscope,
  Menu,
} from 'lucide-react'
import { useSuperAdminStore } from '@/store/superAdminStore'

export const SuperAdminMobileNav: FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { kpis, setIsMobileSidebarOpen } = useSuperAdminStore()
  const currentPath = location.pathname

  const items = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/super-admin/dashboard',
    },
    {
      id: 'hospitals',
      label: 'Hospitals',
      icon: Building2,
      path: '/super-admin/hospitals',
    },
    {
      id: 'admins',
      label: 'Admins',
      icon: Building,
      path: '/super-admin/hospital-admins',
      badge: kpis.pendingVerifications,
    },
    {
      id: 'doctors',
      label: 'Doctors',
      icon: Stethoscope,
      path: '/super-admin/doctors',
    },
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-3 py-1.5 shadow-lg flex items-center justify-around">
      {items.map((item) => {
        const Icon = item.icon
        const isActive =
          item.path === '/super-admin/dashboard'
            ? currentPath === '/super-admin/dashboard' || currentPath === '/super-admin'
            : currentPath.startsWith(item.path)

        return (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer relative ${
              isActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <div className="relative">
              <Icon className={`size-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1 -right-2 size-4 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center ring-2 ring-white">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] leading-none">{item.label}</span>
          </button>
        )
      })}

      <button
        onClick={() => setIsMobileSidebarOpen(true)}
        className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-slate-500 hover:text-slate-900 font-medium transition-all cursor-pointer"
      >
        <Menu className="size-5 stroke-[1.8]" />
        <span className="text-[10px] leading-none">More</span>
      </button>
    </nav>
  )
}

export default SuperAdminMobileNav
