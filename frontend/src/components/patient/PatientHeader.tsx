import { useState, useRef, useEffect, type FC } from 'react'
import {
  Search,
  MapPin,
  Bell,
  ChevronDown,
  Menu,
  Activity,
  LogOut,
  User,
  Settings,
  CheckCircle2,
  Clock,
  Sparkles,
  X,
  Building2,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { UserRole } from '@/types/auth'
import { useNavigate } from 'react-router-dom'

interface PatientHeaderProps {
  searchQuery: string
  onSearchChange: (q: string) => void
  selectedCity: string
  onSelectCity: (city: string) => void
  onToggleSidebar: () => void
  isSidebarOpen?: boolean
}

export const PatientHeader: FC<PatientHeaderProps> = ({
  searchQuery,
  onSearchChange,
  selectedCity,
  onSelectCity,
  onToggleSidebar,
}) => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const [isCityOpen, setIsCityOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)

  const cityRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  const cities = [
    'All Cities',
    'Bilaspur, Chhattisgarh',
    'Raipur, Chhattisgarh',
    'New Delhi, NCR',
    'Mumbai, Maharashtra',
    'Bengaluru, Karnataka',
  ]

  const notifications = [
    {
      id: '1',
      title: 'Appointment Confirmed',
      desc: 'Dr. Priya Sharma confirmed for Mon, 20 Oct at 10:30 AM.',
      time: '15m ago',
      icon: CheckCircle2,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      id: '2',
      title: 'Prescription Available',
      desc: 'Dr. Amit Singh uploaded your post-consultation prescription.',
      time: '2h ago',
      icon: Sparkles,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      id: '3',
      title: 'Upcoming Reminder',
      desc: 'Blood test scheduled at Apollo Multispeciality tomorrow morning.',
      time: '1d ago',
      icon: Clock,
      color: 'text-amber-600 bg-amber-50',
    },
  ]

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setIsCityOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await logout()
    navigate('/login')
  }

  const patientName = user?.name || 'Ravi Tiwari'
  const roleLabel =
    user?.role === UserRole.HOSPITAL_ADMIN
      ? 'Hospital Admin'
      : user?.role === UserRole.DOCTOR
      ? 'Doctor'
      : user?.role === UserRole.SUPER_ADMIN
      ? 'Super Admin'
      : 'Patient'

  const verifiedBadgeText =
    user?.role === UserRole.HOSPITAL_ADMIN
      ? 'Hospital Administrator'
      : user?.role === UserRole.DOCTOR
      ? 'Verified Doctor'
      : user?.role === UserRole.SUPER_ADMIN
      ? 'Super Admin'
      : 'Verified Patient'

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 px-3 sm:px-6 lg:px-8 2xl:px-10 py-2.5 sm:py-3 transition-all shadow-2xs">
      <div className="w-full max-w-[1720px] mx-auto flex items-center justify-between gap-2 sm:gap-6">
        {/* Left: Brand Logo & Sidebar Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-200/70 transition-all cursor-pointer active:scale-95"
            title="Toggle Navigation Menu"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="size-5" />
          </button>

          {/* CarePlus Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer select-none"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="size-8 sm:size-9 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25 shrink-0">
              <Activity className="size-4.5 sm:size-5 stroke-[2.5]" />
            </div>
            <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900">
              Care<span className="text-blue-600">Plus</span>
            </span>
          </div>
        </div>

        {/* Center: Global Search Bar (Hidden on Mobile to prevent squishing, visible md+) */}
        <div className="hidden md:flex flex-1 max-w-xl lg:max-w-2xl mx-2 lg:mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 stroke-[2]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search hospitals, doctors, services..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm font-medium bg-slate-50 border border-slate-200/90 rounded-full text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Section: Mobile Search Toggle + Location + Notifications + Interactive Profile */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Mobile Search Icon Button */}
          <button
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className={`md:hidden p-2 rounded-xl transition-all cursor-pointer active:scale-95 ${
              isMobileSearchOpen
                ? 'bg-blue-50 text-blue-600 border border-blue-200'
                : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'
            }`}
            title="Search"
            aria-label="Toggle Mobile Search"
          >
            <Search className="size-5 stroke-[2]" />
          </button>

          {/* Location Selector Pill (Desktop) */}
          <div className="relative" ref={cityRef}>
            <button
              onClick={() => setIsCityOpen(!isCityOpen)}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-all cursor-pointer"
            >
              <MapPin className="size-3.5 text-blue-600 shrink-0" />
              <span className="truncate max-w-[130px] sm:max-w-[160px]">{selectedCity}</span>
              <ChevronDown className="size-3 text-slate-400 shrink-0" />
            </button>

            {isCityOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Select Location
                </div>
                {cities.map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      onSelectCity(city)
                      setIsCityOpen(false)
                    }}
                    className={`w-full px-3 py-2 text-left text-xs font-medium flex items-center justify-between hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                      selectedCity === city ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>{city}</span>
                    {selectedCity === city && <CheckCircle2 className="size-3.5 text-blue-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Button & Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-blue-600 transition-all cursor-pointer active:scale-95"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="size-5 stroke-[2]" />
              <span className="absolute top-1.5 right-1.5 size-2 sm:size-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-[calc(100vw-24px)] max-w-xs sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900">Notifications</span>
                  <span className="text-[11px] font-medium text-blue-600 cursor-pointer hover:underline">
                    Mark all read
                  </span>
                </div>
                <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
                  {notifications.map((item) => {
                    const Icon = item.icon
                    return (
                      <div key={item.id} className="p-3 hover:bg-slate-50 transition-colors rounded-xl cursor-pointer">
                        <div className="flex gap-2.5 items-start">
                          <div className={`size-7 rounded-lg ${item.color} flex items-center justify-center shrink-0 mt-0.5`}>
                            <Icon className="size-4" />
                          </div>
                          <div className="space-y-0.5 flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h5 className="text-xs font-bold text-slate-900 truncate">{item.title}</h5>
                              <span className="text-[10px] text-slate-400 shrink-0">{item.time}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">{item.desc}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Interactive User Profile Pill & Avatar */}
          <div className="relative shrink-0" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-0.5 sm:px-2.5 sm:py-1.5 rounded-full hover:bg-slate-100 active:scale-95 transition-all cursor-pointer border border-transparent hover:border-slate-200 group"
              aria-label="User Profile"
            >
              {/* Vibrant Gradient Avatar with Ring & Status Indicator */}
              <div className="relative shrink-0">
                <div className="size-8 sm:size-9 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 text-white font-black text-xs sm:text-sm flex items-center justify-center shadow-sm shadow-blue-500/25 ring-2 ring-white group-hover:ring-blue-400 group-hover:shadow-blue-500/30 transition-all select-none">
                  {patientName.charAt(0).toUpperCase()}
                </div>
                {/* Active Status Badge */}
                <span className="absolute -bottom-0.5 -right-0.5 size-2.5 bg-emerald-500 ring-2 ring-white rounded-full" />
              </div>

              {/* Desktop Name & Role */}
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
                  {patientName}
                </p>
                <p className="text-[10px] font-semibold text-emerald-600 leading-none flex items-center gap-1 mt-0.5">
                  <span className="size-1.5 rounded-full bg-emerald-500"></span>
                  {roleLabel}
                </p>
              </div>

              <ChevronDown
                className={`size-3 text-slate-400 hidden sm:block transition-transform duration-200 ${
                  isProfileOpen ? 'rotate-180 text-blue-600' : ''
                }`}
              />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3.5 py-3 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50 rounded-t-2xl">
                  <div className="size-10 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 text-white font-extrabold text-sm flex items-center justify-center shadow-xs shrink-0">
                    {patientName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{patientName}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email || 'patient@curehealth.org'}</p>
                    <span className="inline-block mt-0.5 text-[9px] font-bold text-blue-700 bg-blue-100/80 px-1.5 py-0.5 rounded-full">
                      {verifiedBadgeText}
                    </span>
                  </div>
                </div>

                <div className="py-1">
                  {user?.role === UserRole.HOSPITAL_ADMIN && (
                    <button
                      onClick={() => {
                        setIsProfileOpen(false)
                        navigate('/hospital-admin/dashboard')
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs text-blue-700 hover:bg-blue-50 flex items-center gap-2.5 font-bold transition-colors cursor-pointer"
                    >
                      <Building2 className="size-4 text-blue-600" />
                      <span>Hospital Admin Portal</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setIsProfileOpen(false)
                      alert(`Profile: ${patientName} | Status: Active | Role: ${roleLabel}`)
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2.5 font-medium transition-colors cursor-pointer"
                  >
                    <User className="size-4 text-slate-400" />
                    <span>View Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false)
                      alert('Health notifications and privacy settings')
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2.5 font-medium transition-colors cursor-pointer"
                  >
                    <Settings className="size-4 text-slate-400" />
                    <span>Settings</span>
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={handleSignOut}
                    className="w-full px-3.5 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 font-semibold transition-colors cursor-pointer"
                  >
                    <LogOut className="size-4 text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Expandable Search Bar (Smoothly opens below header without squeezing navbar) */}
      {isMobileSearchOpen && (
        <div className="md:hidden pt-2.5 pb-1 border-t border-slate-100 mt-2 animate-in slide-in-from-top-2 duration-150">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 stroke-[2]" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search doctors, hospitals, services..."
              className="w-full pl-10 pr-9 py-2 text-xs font-medium bg-slate-50 border border-slate-200/90 rounded-full text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
            />
            {searchQuery ? (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="size-3.5" />
              </button>
            ) : (
              <button
                onClick={() => setIsMobileSearchOpen(false)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

