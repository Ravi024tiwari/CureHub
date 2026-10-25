import type { FC } from 'react'
import {
  FileEdit,
  LayoutDashboard,
  Calendar,
  Users,
  Clock,
  CalendarOff,
  UserCheck,
  Settings,
  Lock,
  Headphones,
  ExternalLink,
  HeartPulse,
} from 'lucide-react'

interface DoctorPortalSidebarProps {
  onCloseMobile?: () => void
}

export const DoctorPortalSidebar: FC<DoctorPortalSidebarProps> = ({ onCloseMobile }) => {
  const lockedMenuItems = [
    { label: 'Dashboard', icon: LayoutDashboard },
    { label: 'Appointments', icon: Calendar },
    { label: 'Patients', icon: Users },
    { label: 'My Schedule', icon: Clock },
    { label: 'Leave Management', icon: CalendarOff },
    { label: 'Profile', icon: UserCheck },
    { label: 'Settings', icon: Settings },
  ]

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-200/90 flex flex-col justify-between h-full select-none">
      {/* Brand & Portal Header */}
      <div>
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <HeartPulse className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg text-slate-900 tracking-tight">CarePlus</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60 inline-block">
                Doctor Portal
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="p-3 space-y-1">
          {/* Active Navigation: Complete Profile */}
          <div
            onClick={onCloseMobile}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-blue-50 text-blue-700 font-semibold text-sm border border-blue-200/70 shadow-xs cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <FileEdit className="size-4.5 text-blue-600" />
              <span>Complete Profile</span>
            </div>
            <span className="size-2 rounded-full bg-blue-600 animate-pulse" />
          </div>

          <div className="pt-3 pb-1.5 px-3">
            <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Clinical Features
            </p>
          </div>

          {/* Locked Clinical Navigation Items */}
          {lockedMenuItems.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.label}
                title="Locked until Super Admin verifies your doctor account"
                className="group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-slate-500 hover:bg-slate-50/70 transition-colors text-sm font-medium cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <Icon className="size-4.5 text-slate-400/80 group-hover:text-slate-500" />
                  <span className="text-slate-500">{item.label}</span>
                </div>
                <Lock className="size-3.5 text-slate-300 group-hover:text-slate-400 transition-colors" />
              </div>
            )
          })}
        </div>
      </div>

      {/* Need Help / Support Banner */}
      <div className="p-4 border-t border-slate-100 bg-gradient-to-b from-transparent to-slate-50/80">
        <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100/80 space-y-2">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Headphones className="size-3.5" />
            </div>
            <p className="text-xs font-bold text-slate-800">Need Help?</p>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Your profile will be reviewed by our admin team. Contact support if you need any assistance.
          </p>
          <a
            href="mailto:support@careplus.health"
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline pt-0.5"
          >
            <span>Contact Support</span>
            <ExternalLink className="size-3" />
          </a>
        </div>
      </div>
    </aside>
  )
}
