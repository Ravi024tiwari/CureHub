import { useState, useRef, useEffect, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Bell,
  ChevronDown,
  Building2,
  Check,
  Menu,
  LogOut,
  Settings,
  User,
  X,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useHospitalAdminStore } from '@/store/hospitalAdminStore'

interface HospitalAdminHeaderProps {
  onToggleSidebar?: () => void
}

export const HospitalAdminHeader: FC<HospitalAdminHeaderProps> = ({ onToggleSidebar }) => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const {
    selectedHospitalId,
    setSelectedHospitalId,
    topHospitals,
    searchQuery,
    setSearchQuery,
    recentActivities,
  } = useHospitalAdminStore()

  const [isHospitalMenuOpen, setIsHospitalMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isNotifOpen, setIsNotifOpen] = useState(false)

  const hospitalRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (hospitalRef.current && !hospitalRef.current.contains(e.target as Node)) {
        setIsHospitalMenuOpen(false)
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

  const selectedHospitalName =
    selectedHospitalId === 'all'
      ? 'All Hospitals'
      : topHospitals.find((h) => h.id === selectedHospitalId)?.name || 'All Hospitals'

  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-3 sm:gap-4">
        {/* Left Section: Mobile Menu Toggle & Search Bar */}
        <div className="flex items-center gap-3 flex-1 max-w-lg">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shrink-0"
              title="Open Navigation"
            >
              <Menu className="size-5" />
            </button>
          )}

          {/* Search Box matching mockup */}
          <div className="relative flex-1">
            <Search className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hospitals, doctors, patients..."
              className="w-full pl-9.5 pr-8 py-2 bg-slate-50/80 hover:bg-slate-100/70 border border-slate-200/80 rounded-full text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Section: Hospital Switcher, Notifications, Admin Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Hospital Switcher Dropdown */}
          <div className="relative" ref={hospitalRef}>
            <button
              type="button"
              onClick={() => setIsHospitalMenuOpen((prev) => !prev)}
              className="hidden sm:flex items-center gap-2 px-3.5 py-2 bg-slate-50/90 hover:bg-slate-100 border border-slate-200/80 rounded-full text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-2xs"
            >
              <Building2 className="size-4 text-blue-600" />
              <span className="truncate max-w-[140px] md:max-w-[180px]">
                {selectedHospitalName}
              </span>
              <ChevronDown
                className={`size-3.5 text-slate-400 transition-transform duration-200 ${
                  isHospitalMenuOpen ? 'rotate-180 text-blue-600' : ''
                }`}
              />
            </button>

            {isHospitalMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200/90 rounded-2xl shadow-xl p-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Select Facility Scope
                </div>
                <button
                  onClick={() => {
                    setSelectedHospitalId('all')
                    setIsHospitalMenuOpen(false)
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    selectedHospitalId === 'all'
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="size-3.5 text-blue-600" />
                    <span>All Hospitals (Overview)</span>
                  </div>
                  {selectedHospitalId === 'all' && <Check className="size-3.5 text-blue-600" />}
                </button>

                <div className="h-px bg-slate-100 my-1" />

                {topHospitals.map((h) => {
                  const isSel = selectedHospitalId === h.id
                  return (
                    <button
                      key={h.id}
                      onClick={() => {
                        setSelectedHospitalId(h.id)
                        setIsHospitalMenuOpen(false)
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isSel
                          ? 'bg-blue-50 text-blue-700 font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex flex-col text-left">
                        <span className="truncate max-w-[160px]">{h.name}</span>
                        <span className="text-[10px] text-slate-400">{h.city}</span>
                      </div>
                      {isSel && <Check className="size-3.5 text-blue-600 shrink-0" />}
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
              <span className="absolute -top-0.5 -right-0.5 size-4.5 bg-rose-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center ring-2 ring-white">
                3
              </span>
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200/90 rounded-2xl shadow-xl p-3 z-40 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h4 className="text-xs font-bold text-slate-900">Notifications (3 New)</h4>
                  <span className="text-[10px] font-semibold text-blue-600 cursor-pointer hover:underline">
                    Mark all read
                  </span>
                </div>
                <div className="space-y-2 mt-2 max-h-60 overflow-y-auto scrollbar-thin">
                  {recentActivities.slice(0, 3).map((act) => (
                    <div
                      key={act.id}
                      className="p-2 rounded-xl hover:bg-slate-50 text-xs transition-colors cursor-pointer"
                    >
                      <p className="font-bold text-slate-800">{act.title}</p>
                      <p className="text-slate-500 text-[11px] mt-0.5">{act.description}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {act.timestamp}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Admin Profile Pill matching mockup */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 bg-slate-50/80 hover:bg-slate-100 border border-slate-200/80 rounded-full transition-all cursor-pointer shadow-2xs group"
            >
              <div className="size-7.5 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-xs overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Admin" className="size-full object-cover" />
                ) : (
                  <span>{user?.name?.charAt(0) || 'R'}</span>
                )}
              </div>

              <div className="text-left hidden md:block">
                <span className="text-xs font-extrabold text-slate-900 block leading-tight truncate max-w-[120px]">
                  {user?.name || 'Dr. Ramesh Kumar'}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 block -mt-0.5">
                  Hospital Admin
                </span>
              </div>

              <ChevronDown
                className={`size-3.5 text-slate-400 transition-transform duration-200 ${
                  isProfileMenuOpen ? 'rotate-180 text-blue-600' : ''
                }`}
              />
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200/90 rounded-2xl shadow-xl p-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {user?.name || 'Dr. Ramesh Kumar'}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {user?.email || 'admin@curehealth.org'}
                  </p>
                </div>

                <div className="space-y-0.5 mt-1">
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false)
                      navigate('/hospital-admin/settings')
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <User className="size-3.5 text-slate-400" />
                    <span>My Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false)
                      navigate('/hospital-admin/settings')
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <Settings className="size-3.5 text-slate-400" />
                    <span>Settings</span>
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
