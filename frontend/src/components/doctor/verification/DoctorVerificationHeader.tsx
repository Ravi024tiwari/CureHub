import type { FC } from 'react'
import {
  Menu,
  Bell,
  LogOut,
  ShieldAlert,
  ShieldCheck,
  Clock,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DoctorVerificationHeaderProps {
  doctorName?: string
  verificationStatus?: 'INCOMPLETE' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
  avatarUrl?: string
  onToggleMobileMenu?: () => void
  onLogout?: () => void
}

export const DoctorVerificationHeader: FC<DoctorVerificationHeaderProps> = ({
  doctorName = 'Doctor',
  verificationStatus = 'INCOMPLETE',
  avatarUrl,
  onToggleMobileMenu,
  onLogout,
}) => {
  const getStatusPill = () => {
    switch (verificationStatus) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="size-3.5 text-emerald-600" />
            Verified & Approved
          </span>
        )
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="size-3.5 text-blue-600" />
            Under Admin Review
          </span>
        )
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <ShieldAlert className="size-3.5 text-rose-600" />
            Action Required
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Sparkles className="size-3.5 text-amber-600" />
            Profile Incomplete
          </span>
        )
    }
  }

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-xs">
      {/* Left: Mobile Menu Trigger & Page Title */}
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            <Menu className="size-5" />
          </button>
        )}

        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Complete Your Doctor Profile
            </h1>
            <div className="hidden sm:inline-block">{getStatusPill()}</div>
          </div>
          <p className="text-xs text-slate-500 hidden sm:block">
            Please fill in your professional details to get verified. Once verified by our admin team, you will get access to all features.
          </p>
        </div>
      </div>

      {/* Right: Notifications & Doctor Profile / Logout */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notification Bell */}
        <div className="relative">
          <button
            type="button"
            title="Notifications"
            className="size-9 rounded-xl border border-slate-200/80 hover:bg-slate-50 text-slate-600 flex items-center justify-center transition-colors"
          >
            <Bell className="size-4.5" />
          </button>
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-blue-600 ring-2 ring-white" />
        </div>

        {/* Doctor Summary Pill */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="size-9 rounded-full bg-gradient-to-tr from-blue-600 to-sky-400 text-white font-bold text-xs flex items-center justify-center overflow-hidden ring-2 ring-blue-100 shadow-xs">
            {avatarUrl ? (
              <img src={avatarUrl} alt={doctorName} className="size-full object-cover" />
            ) : (
              <span>{doctorName.charAt(0) || 'D'}</span>
            )}
          </div>

          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-tight">
              {doctorName.startsWith('Dr.') ? doctorName : `Dr. ${doctorName}`}
            </p>
            <p className="text-[11px] text-slate-400">Complete Your Profile</p>
          </div>
        </div>

        {/* Logout Button */}
        {onLogout && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="size-9 p-0 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Sign out of doctor portal"
          >
            <LogOut className="size-4" />
          </Button>
        )}
      </div>
    </header>
  )
}
