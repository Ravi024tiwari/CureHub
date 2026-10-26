import { type FC } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Home,
  Building2,
  ShieldCheck,
  HelpCircle,
  Headphones,
  X,
  CheckCircle,
  Clock,
  Sparkles,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

interface HospitalAdminPortalSidebarProps {
  isMobileDrawer?: boolean
  onCloseDrawer?: () => void
  onOpenSupport?: () => void
  verificationStatus?: string
}

export const HospitalAdminPortalSidebar: FC<HospitalAdminPortalSidebarProps> = ({
  isMobileDrawer = false,
  onCloseDrawer,
  onOpenSupport,
  verificationStatus = 'INCOMPLETE',
}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()

  const currentPath = location.pathname

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      path: user?.isAccountApproved ? '/hospital-admin/dashboard' : '/hospital-admin/verification',
    },
    {
      id: 'register-hospital',
      label: 'Register Hospital',
      icon: Building2,
      path: '/hospital-admin/verification',
      badge: 'Active',
    },
    {
      id: 'verification-status',
      label: 'Verification Status',
      icon: ShieldCheck,
      path: '/hospital-admin/verification',
      statusBadge: verificationStatus,
    },
    {
      id: 'support',
      label: 'Support',
      icon: HelpCircle,
      action: onOpenSupport,
    },
  ]

  const handleNavClick = (item: typeof navItems[0]) => {
    if (item.action) {
      item.action()
    } else if (item.path) {
      navigate(item.path)
    }
    if (isMobileDrawer && onCloseDrawer) {
      onCloseDrawer()
    }
  }

  const sidebarContent = (
    <aside className="w-64 h-full bg-white border-r border-slate-200 flex flex-col justify-between select-none">
      {/* 1. Header / Brand */}
      <div>
        <div className="h-18 px-5 border-b border-slate-100 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate('/hospital-admin/verification')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                  CarePlus
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60">
                  Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-none">
                Hospital Admin Portal
              </p>
            </div>
          </div>

          {isMobileDrawer && onCloseDrawer && (
            <button
              onClick={onCloseDrawer}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* 2. Navigation Items */}
        <div className="px-3 py-6 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon
            const isSelected =
              item.id === 'register-hospital' ||
              (item.path && currentPath === item.path && item.id !== 'home')

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs border border-blue-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4.5 h-4.5 ${
                      isSelected ? 'text-blue-600' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-600 text-white shadow-xs">
                    {item.badge}
                  </span>
                )}

                {item.statusBadge && item.statusBadge !== 'INCOMPLETE' && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      item.statusBadge === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : item.statusBadge === 'REJECTED'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {item.statusBadge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* 3. Bottom Support Box */}
      <div className="p-4 m-3 rounded-2xl bg-gradient-to-b from-blue-50/80 to-indigo-50/50 border border-blue-100/80 text-center">
        <div className="w-11 h-11 mx-auto -mt-1 mb-2.5 rounded-full bg-white shadow-sm border border-blue-100 flex items-center justify-center text-blue-600">
          <Headphones className="w-5 h-5" />
        </div>
        <h4 className="text-xs font-semibold text-slate-800">Need Help?</h4>
        <p className="text-[11px] text-slate-500 mt-1 mb-3 leading-relaxed">
          Get 24/7 support from CarePlus onboarding team.
        </p>
        <button
          onClick={onOpenSupport}
          className="w-full py-2 px-3 rounded-xl bg-white hover:bg-blue-600 hover:text-white border border-blue-200 text-blue-700 text-xs font-semibold shadow-xs transition-colors"
        >
          Contact Support
        </button>
      </div>
    </aside>
  )

  if (isMobileDrawer) {
    return (
      <div className="fixed inset-0 z-50 flex">
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          onClick={onCloseDrawer}
        />
        <div className="relative z-10 w-72 max-w-[85vw] h-full shadow-2xl animate-in slide-in-from-left duration-200">
          {sidebarContent}
        </div>
      </div>
    )
  }

  return sidebarContent
}
