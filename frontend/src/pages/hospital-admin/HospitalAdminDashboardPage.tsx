import { useEffect, useState, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, ChevronDown, CheckCircle2, X } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useHospitalAdminStore } from '@/store/hospitalAdminStore'

// Components
import { HospitalAdminLayout } from '@/components/hospital-admin/HospitalAdminLayout'
import { KpiMetricsGrid } from '@/components/hospital-admin/KpiMetricsGrid'
import { AppointmentsChartCard } from '@/components/hospital-admin/AppointmentsChartCard'
import { StatusDonutChartCard } from '@/components/hospital-admin/StatusDonutChartCard'
import { TopHospitalsCard } from '@/components/hospital-admin/TopHospitalsCard'
import { DepartmentDistributionCard } from '@/components/hospital-admin/DepartmentDistributionCard'
import { RecentActivityCard } from '@/components/hospital-admin/RecentActivityCard'
import { PendingJoinRequestsCard } from '@/components/hospital-admin/PendingJoinRequestsCard'
import { DoctorApplicationModal } from '@/components/hospital-admin/DoctorApplicationModal'

export const HospitalAdminDashboardPage: FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const {
    fetchDashboard,
    selectedDateRange,
    setSelectedDateRange,
    actionSuccessMessage,
    clearActionSuccessMessage,
  } = useHospitalAdminStore()

  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false)

  useEffect(() => {
    if (user && !user.isAccountApproved) {
      navigate('/hospital-admin/verification', { replace: true })
      return
    }
    fetchDashboard()
  }, [user, fetchDashboard, navigate])

  const dateOptions = ['Oct 2026', 'Sep 2026', 'Aug 2026', 'Q3 2026', 'Year 2026']

  // Auto-dismiss notification after 4 seconds
  useEffect(() => {
    if (actionSuccessMessage) {
      const timer = setTimeout(() => {
        clearActionSuccessMessage()
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [actionSuccessMessage, clearActionSuccessMessage])

  return (
    <HospitalAdminLayout>
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Action Success Alert Notification */}
        {actionSuccessMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between shadow-xs animate-in slide-in-from-top-3 duration-200">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
              <CheckCircle2 className="size-4.5 text-emerald-600 shrink-0" />
              <span>{actionSuccessMessage}</span>
            </div>
            <button
              onClick={clearActionSuccessMessage}
              className="p-1 text-emerald-600 hover:text-emerald-900 rounded-lg hover:bg-emerald-100/60 transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {/* Welcome Hero Bar matching mockup */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Hospital Operations Overview
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Real-time monitoring across appointments, departmental occupancy, and staff
              affiliations.
            </p>
          </div>

          {/* Quick Date Range Filter Dropdown */}
          <div className="relative self-start sm:self-auto">
            <button
              onClick={() => setIsDateMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl text-xs sm:text-sm font-bold text-slate-700 shadow-2xs cursor-pointer transition-all"
            >
              <Calendar className="size-4 text-blue-600" />
              <span>{selectedDateRange}</span>
              <ChevronDown className="size-3.5 text-slate-400" />
            </button>

            {isDateMenuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-200/90 rounded-2xl shadow-xl p-1.5 z-20 animate-in fade-in zoom-in-95 duration-150">
                {dateOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setSelectedDateRange(opt)
                      setIsDateMenuOpen(false)
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      selectedDateRange === opt
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* KPI Metrics 4-Card Grid */}
        <KpiMetricsGrid />

        {/* Analytics Section: Appointments Bar Chart + Status Donut */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 min-w-0">
            <AppointmentsChartCard />
          </div>
          <div className="min-w-0">
            <StatusDonutChartCard />
          </div>
        </div>

        {/* Two-Column Middle Section: Facilities + Distribution + Activity + Requests */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Left 8-col Section: Top Performing Hospitals + Department Occupancy */}
          <div className="xl:col-span-8 space-y-6 min-w-0">
            <TopHospitalsCard />
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              <DepartmentDistributionCard />
            </div>
          </div>

          {/* Right 4-col Section: Activity Timeline & Doctor Join Requests */}
          <div className="xl:col-span-4 space-y-6 min-w-0">
            <RecentActivityCard />
            <PendingJoinRequestsCard />
          </div>
        </div>
      </main>

      {/* Doctor Detail / Affiliation Modal */}
      <DoctorApplicationModal />
    </HospitalAdminLayout>
  )
}

export default HospitalAdminDashboardPage
