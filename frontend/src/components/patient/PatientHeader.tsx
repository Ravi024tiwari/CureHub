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
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
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

  const cityRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  const cities = [
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

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 px-3 sm:px-6 lg:px-8 py-3 transition-all shadow-2xs">
      <div className="w-full flex items-center justify-between gap-3 sm:gap-6">
        {/* Left: Brand Logo & Sidebar Toggle (Far Left) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-200/70 transition-all cursor-pointer"
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
            <div className="size-9 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
              <Activity className="size-5 stroke-[2.5]" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">
              Care<span className="text-blue-600">Plus</span>
            </span>
          </div>
        </div>

        {/* Center: Global Search Bar (Spacious & Centered) */}
        <div className="flex-1 max-w-xl lg:max-w-2xl mx-2">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 stroke-[2]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search hospitals, doctors, services..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm font-medium bg-slate-50 border border-slate-200/90 rounded-full text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* Right Section: Location Pill + Notifications + Profile Pill */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Location Selector Pill */}
          <div className="relative" ref={cityRef}>
            <button
              onClick={() => setIsCityOpen(!isCityOpen)}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-all cursor-pointer"
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
              className="relative p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="size-5 stroke-[2]" />
              <span className="absolute top-1 right-1 size-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                3
              </span>
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
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
                          <div className="space-y-0.5 flex-1">
                            <div className="flex items-center justify-between">
                              <h5 className="text-xs font-bold text-slate-900">{item.title}</h5>
                              <span className="text-[10px] text-slate-400">{item.time}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-snug">{item.desc}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
            >
              <div className="size-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center ring-2 ring-white shadow-xs">
                {patientName.charAt(0).toUpperCase()}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-slate-900 leading-tight">{patientName}</p>
                <p className="text-[10px] text-slate-400 leading-none">Patient</p>
              </div>
              <ChevronDown className="size-3 text-slate-400 hidden sm:block" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{patientName}</p>
                  <p className="text-[11px] text-slate-400">{user?.email || 'patient@curehealth.org'}</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false)
                      alert('Profile: Patient record active. Blood Group: O+, Age: 28')
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2.5 font-medium cursor-pointer"
                  >
                    <User className="size-4 text-slate-400" />
                    <span>View Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false)
                      alert('Health notifications and privacy settings')
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2.5 font-medium cursor-pointer"
                  >
                    <Settings className="size-4 text-slate-400" />
                    <span>Settings</span>
                  </button>
                </div>
                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={handleSignOut}
                    className="w-full px-3 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 font-semibold cursor-pointer"
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
    </header>
  )
}
