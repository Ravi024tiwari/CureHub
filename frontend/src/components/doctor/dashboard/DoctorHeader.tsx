import { useState, useRef, useEffect, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  LogOut,
  User,
  Settings,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

interface DoctorHeaderProps {
  onToggleMobileSidebar: () => void
  doctorName?: string
  department?: string
  avatar?: string | null
}

export const DoctorHeader: FC<DoctorHeaderProps> = ({
  onToggleMobileSidebar,
  doctorName = 'Doctor',
  department = 'General OPD',
  avatar,
}) => {
  const navigate = useNavigate()
  const { logout } = useAuthStore()
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 h-16 shrink-0 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      {/* Left: Mobile Toggle & Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          aria-label="Open mobile navigation"
        >
          <Menu className="size-5" />
        </button>

        {/* Search Bar matching mockup */}
        <div className="relative w-full hidden sm:block">
          <Search className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search patients, appointments, medical records..."
            className="w-full pl-9.5 pr-4 py-2 bg-slate-50/90 hover:bg-slate-100/70 focus:bg-white border border-slate-200/80 focus:border-blue-500 rounded-xl text-xs sm:text-sm font-medium placeholder:text-slate-400 outline-none transition-all shadow-2xs focus:ring-3 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* Right: Notification Bell & Doctor Profile */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <div className="relative">
          <button
            type="button"
            className="size-10 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-600 transition-colors cursor-pointer relative shadow-2xs"
            aria-label="Notifications"
          >
            <Bell className="size-4.5" />
            <span className="absolute -top-1 -right-1 size-4 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center shadow-xs">
              3
            </span>
          </button>
        </div>

        {/* Doctor Profile Chip & Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsProfileMenuOpen((p) => !p)}
            className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all cursor-pointer"
          >
            <div className="size-9 rounded-xl overflow-hidden bg-gradient-to-tr from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-black text-sm border border-slate-200/80 shrink-0 shadow-2xs">
              {avatar ? (
                <img src={avatar} alt={doctorName} className="size-full object-cover" />
              ) : (
                <span>{doctorName.replace('Dr. ', '').charAt(0) || 'D'}</span>
              )}
            </div>

            <div className="text-left hidden md:block">
              <div className="flex items-center gap-1">
                <span className="text-xs font-black text-slate-900 truncate max-w-[150px]">
                  {doctorName}
                </span>
                <ChevronDown className="size-3 text-slate-400" />
              </div>
              <p className="text-[10px] text-slate-400 font-semibold truncate max-w-[150px]">
                {department}
              </p>
            </div>
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-2.5 border-b border-slate-100 mb-1">
                <p className="text-xs font-black text-slate-900 truncate">{doctorName}</p>
                <p className="text-[10px] text-slate-400 font-medium truncate">{department}</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsProfileMenuOpen(false)
                  navigate('/doctor/profile')
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer"
              >
                <User className="size-3.5" />
                <span>My Profile</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsProfileMenuOpen(false)
                  navigate('/doctor/settings')
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Settings className="size-3.5" />
                <span>Settings</span>
              </button>

              <div className="my-1 border-t border-slate-100" />

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut className="size-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default DoctorHeader
