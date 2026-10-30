import { type FC } from 'react'
import {
  Activity,
  Home,
  UserCheck,
  Building2,
  Calendar,
  FileText,
  BookOpen,
  CalendarPlus,
  Search,
  UploadCloud,
  Headphones,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { usePatientStore } from '@/store/patientStore'

interface PatientSidebarProps {
  activeTab: string
  onSelectTab: (tab: string) => void
  isMobileDrawer?: boolean
  onCloseDrawer?: () => void
  onOpenBookingModal?: () => void
  onOpenUploadModal?: () => void
}

export const PatientSidebar: FC<PatientSidebarProps> = ({
  activeTab,
  onSelectTab,
  isMobileDrawer = false,
  onCloseDrawer,
  onOpenBookingModal,
  onOpenUploadModal,
}) => {
  const navigate = useNavigate()
  const totalReports = usePatientStore((s) => s.records.length)

  // Primary navigation links - clean production grade (prescriptions, lab tests, and health services
  // are consolidated inside Medical Reports to eliminate UI redundancy)
  const mainNavItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/patient/home' },
    { id: 'appointments', label: 'Appointments', icon: Calendar, path: '/patient/appointments' },
    { id: 'doctors', label: 'Find Doctors', icon: UserCheck, path: '/patient/doctors' },
    { id: 'hospitals', label: 'Hospitals', icon: Building2, path: '/patient/hospitals' },
    {
      id: 'records',
      label: 'Medical Reports',
      icon: FileText,
      path: '/patient/records',
      badge: totalReports > 0 ? String(totalReports) : undefined,
    },
    { id: 'articles', label: 'Health Articles', icon: BookOpen },
  ]

  const quickActionItems = [
    { id: 'quick-book', label: 'Book Appointment', icon: CalendarPlus, action: onOpenBookingModal },
    { id: 'quick-doctors', label: 'Find Doctors', icon: Search, path: '/patient/doctors' },
    { id: 'quick-hospitals', label: 'Find Hospitals', icon: Building2, path: '/patient/hospitals' },
    { id: 'quick-upload', label: 'Upload Report', icon: UploadCloud, action: onOpenUploadModal },
  ]

  const handleNavClick = (item: (typeof mainNavItems)[0]) => {
    onSelectTab(item.id)
    if (item.path) {
      navigate(item.path)
    }
    if (onCloseDrawer) {
      onCloseDrawer()
    }
  }

  const handleQuickAction = (item: (typeof quickActionItems)[0]) => {
    if (item.action) {
      item.action()
    } else if (item.path) {
      navigate(item.path)
    }
    if (onCloseDrawer) {
      onCloseDrawer()
    }
  }

  return (
    <aside
      className={`h-full flex flex-col bg-white border-r border-slate-100 select-none overflow-y-auto ${
        isMobileDrawer ? 'w-72 p-5' : 'w-64 p-5'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between pb-5 mb-2 border-b border-slate-100">
        <div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => {
            navigate('/patient/home')
            if (onCloseDrawer) onCloseDrawer()
          }}
        >
          <div className="size-9 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
            <Activity className="size-5 stroke-[2.5]" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-900">
            Care<span className="text-blue-600">Plus</span>
          </span>
        </div>

        {onCloseDrawer && (
          <button
            onClick={onCloseDrawer}
            className="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close sidebar"
          >
            <X className="size-5" />
          </button>
        )}
      </div>

      {/* Main Navigation Links */}
      <div className="space-y-1 py-2">
        {mainNavItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer text-left ${
                isActive
                  ? 'bg-blue-50 text-blue-600 font-bold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <Icon
                  className={`size-4.5 shrink-0 transition-transform ${
                    isActive ? 'text-blue-600 stroke-[2.2]' : 'text-slate-400 stroke-[1.8]'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Quick Actions Section */}
      <div className="pt-5 mt-2 border-t border-slate-100">
        <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          Quick Actions
        </p>
        <div className="space-y-1">
          {quickActionItems.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action)}
                className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer text-left"
              >
                <Icon className="size-4 text-slate-400 shrink-0 stroke-[1.8]" />
                <span className="truncate">{action.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Need Help Support Card */}
      <div className="mt-auto pt-6">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-100/70 text-center space-y-2">
          <div className="size-9 rounded-full bg-blue-600 text-white mx-auto flex items-center justify-center shadow-sm">
            <Headphones className="size-4.5 stroke-[2]" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Need Help?</h4>
            <p className="text-[11px] text-slate-500">Get 24/7 medical support</p>
          </div>
          <Button
            size="sm"
            onClick={() => alert('CarePlus 24/7 Emergency Medical Helpline: 1800-200-CARE (2273)')}
            className="w-full h-8 text-xs font-semibold rounded-xl bg-white hover:bg-blue-600 hover:text-white text-blue-600 border border-blue-200 shadow-xs transition-all cursor-pointer"
          >
            Contact Support
          </Button>
        </div>
      </div>
    </aside>
  )
}
