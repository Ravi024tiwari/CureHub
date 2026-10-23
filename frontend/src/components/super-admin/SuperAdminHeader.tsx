import { useState, useRef, useEffect, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Calendar,
  Bell,
  ChevronDown,
  Menu,
  LogOut,
  Settings,
  User,
  X,
  Check,
  ShieldCheck,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useSuperAdminStore } from '@/store/superAdminStore'
import drRameshImg from '@/assets/dr-amit-singh.jpg'

interface SuperAdminHeaderProps {
  onToggleSidebar?: () => void
}

export const SuperAdminHeader: FC<SuperAdminHeaderProps> = ({ onToggleSidebar }) => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const {
    searchQuery,
    setSearchQuery,
    selectedDateRange,
    setSelectedDateRange,
    toggleSidebar,
    isSidebarCollapsed,
    recentActivities,
  } = useSuperAdminStore()

  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isNotifOpen, setIsNotifOpen] = useState(false)

  const dateRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  const dateOptions = [
    'Jan 01, 2026 - Dec 31, 2026',
    'Last 6 Months (May - Oct 2026)',
    'This Month (October 2026)',
    'Third Quarter (Q3 2026)',
  ]

  // Click outside to dismiss dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) {
        setIsDateMenuOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const adminName = user?.name || 'Dr. Ramesh Kumar'
  const adminAvatar = user?.avatar || drRameshImg

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-slate-100">
      <div className="w-full max-w-[1750px] mx-auto px-3.5 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-3 sm:gap-4">
        {/* Left Section: Responsive Menu Toggle & Global Search Bar */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-1 max-w-xl">
          <button
            type="button"
            onClick={onToggleSidebar || toggleSidebar}
            className={`p-2 rounded-xl transition-all cursor-pointer shrink-0 flex items-center justify-center border shadow-2xs group ${
              isSidebarCollapsed
                ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 ring-2 ring-blue-100'
                : 'bg-slate-50/80 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border-slate-200/80'
            }`}
            title={isSidebarCollapsed ? 'Open navigation sidebar' : 'Close / Toggle navigation sidebar'}
            aria-label="Toggle navigation sidebar"
          >
            <Menu className="size-5 transition-transform group-hover:scale-105" />
          </button>

          {/* Search Box matching mockup */}
          <div className="relative flex-1">
            <Search className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search platform..."
              className="w-full pl-9.5 pr-8 py-2 bg-slate-50/80 hover:bg-slate-100/70 border border-slate-200/80 rounded-full text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
                title="Clear Search"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Section: Date Range, Notifications & Super Admin Profile */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Date Range Selector (Responsive: Compact on Mobile, Full Pill on md+) */}
          <div className="relative" ref={dateRef}>
            {/* Desktop / Tablet Pill */}
            <button
              type="button"
              onClick={() => setIsDateMenuOpen((prev) => !prev)}
              className="hidden md:flex items-center gap-2 px-3.5 py-2 bg-slate-50/90 hover:bg-slate-100 border border-slate-200/80 rounded-full text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-2xs"
            >
              <Calendar className="size-3.5 text-blue-600" />
              <span className="truncate max-w-[190px]">{selectedDateRange}</span>
              <ChevronDown
                className={`size-3 text-slate-400 transition-transform duration-200 ${
                  isDateMenuOpen ? 'rotate-180 text-blue-600' : ''
                }`}
              />
            </button>

            {/* Mobile Compact Calendar Button */}
            <button
              type="button"
              onClick={() => setIsDateMenuOpen((prev) => !prev)}
              className="md:hidden size-9 rounded-full bg-slate-50/80 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors relative cursor-pointer shadow-2xs"
              title={`Date Range: ${selectedDateRange}`}
            >
              <Calendar className="size-4 text-blue-600" />
            </button>

            {isDateMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 max-w-[85vw] bg-white border border-slate-200/90 rounded-2xl shadow-xl p-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Select Time Range
                </div>
                {dateOptions.map((opt) => {
                  const isSel = selectedDateRange === opt
                  return (
                    <button
                      key={opt}
                      onClick={() => {
                        setSelectedDateRange(opt)
                        setIsDateMenuOpen(false)
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isSel
                          ? 'bg-blue-50 text-blue-700 font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{opt}</span>
                      {isSel && <Check className="size-3.5 text-blue-600" />}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Notification Bell matching mockup */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen((prev) => !prev)}
              className="size-9.5 rounded-full bg-slate-50/80 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors relative cursor-pointer shadow-2xs"
              title="Notifications"
            >
              <Bell className="size-4" />
              <span className="absolute -top-0.5 -right-0.5 size-4.5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-white">
                5
              </span>
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200/90 rounded-2xl shadow-xl p-3 z-40 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h4 className="text-xs font-bold text-slate-900">Platform Alerts (5 New)</h4>
                  <span className="text-[10px] font-semibold text-blue-600 cursor-pointer hover:underline">
                    Mark all read
                  </span>
                </div>
                <div className="space-y-2 mt-2 max-h-64 overflow-y-auto scrollbar-thin">
                  {recentActivities.slice(0, 5).map((act) => (
                    <div
                      key={act.id}
                      className="p-2 rounded-xl hover:bg-slate-50 text-xs transition-colors cursor-pointer"
                    >
                      <p className="font-bold text-slate-800">{act.title}</p>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        {act.timestamp}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Super Admin Profile Pill matching mockup */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 bg-slate-50/80 hover:bg-slate-100 border border-slate-200/80 rounded-full transition-all cursor-pointer shadow-2xs group"
            >
              <div className="size-7.5 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-xs overflow-hidden">
                <img src={adminAvatar} alt={adminName} className="size-full object-cover" />
              </div>

              <div className="text-left hidden sm:block">
                <span className="text-xs font-extrabold text-slate-900 block leading-tight truncate max-w-[130px]">
                  {adminName}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 block -mt-0.5">
                  Super Admin
                </span>
              </div>

              <ChevronDown
                className={`size-3 text-slate-400 transition-transform duration-200 ${
                  isProfileMenuOpen ? 'rotate-180 text-blue-600' : ''
                }`}
              />
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200/90 rounded-2xl shadow-xl p-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 truncate">{adminName}</p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {user?.email || 'superadmin@careplus.org'}
                  </p>
                </div>

                <div className="space-y-0.5 mt-1">
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false)
                      navigate('/super-admin/settings')
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <User className="size-3.5 text-slate-400" />
                    <span>My Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false)
                      navigate('/super-admin/settings')
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <Settings className="size-3.5 text-slate-400" />
                    <span>Platform Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false)
                      navigate('/super-admin/verifications')
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <ShieldCheck className="size-3.5 text-blue-600" />
                    <span>Verification Desk</span>
                  </button>

                  <div className="h-px bg-slate-100 my-1" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="size-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default SuperAdminHeader
