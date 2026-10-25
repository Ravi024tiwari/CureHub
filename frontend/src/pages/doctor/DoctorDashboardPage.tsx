import { useEffect, useState, type FC } from 'react'
import { AlertCircle } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useDoctorStore } from '@/store/doctorStore'
import {
  DoctorSidebar,
  DoctorHeader,
  DoctorGreetingBanner,
  DoctorPracticeKpiGrid,
  DoctorQuickActions,
  DoctorMonthlyAnalyticsChart,
  DoctorNextAppointmentCard,
  DoctorRecentConsultations,
  DoctorPatientFeedbackCard,
  DoctorUpcomingLeavesCard,
} from '@/components/doctor/dashboard'

export const DoctorDashboardPage: FC = () => {
  const { user } = useAuthStore()
  const {
    dashboardData,
    isDashboardLoading,
    dashboardError,
    fetchDoctorDashboard,
  } = useDoctorStore()

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  useEffect(() => {
    fetchDoctorDashboard()
  }, [])

  const doctorInfo = dashboardData?.doctorInfo
  const doctorName =
    doctorInfo?.name ||
    (user?.name ? (user.name.startsWith('Dr.') ? user.name : `Dr. ${user.name}`) : 'Doctor')
  const department = doctorInfo?.department || 'General OPD'
  const avatar = doctorInfo?.avatar || user?.avatar || null
  const hospital = doctorInfo?.hospital

  return (
    <div className="h-screen w-full overflow-hidden bg-[#F8FAFC] text-slate-900 flex selection:bg-blue-100 selection:text-blue-700 antialiased">
      {/* 1. Desktop Persistent Sidebar */}
      <div className="hidden lg:block h-screen shrink-0">
        <DoctorSidebar />
      </div>

      {/* 2. Mobile Drawer Sidebar */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative z-50 w-64 max-w-[80vw] h-full shadow-2xl animate-in slide-in-from-left duration-200">
            <DoctorSidebar onCloseMobile={() => setIsMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* 3. Main Body Scroll Container */}
      <div className="flex-1 h-screen overflow-y-auto overflow-x-hidden overscroll-contain flex flex-col min-w-0 transition-all">
        {/* Top Header */}
        <DoctorHeader
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
          doctorName={doctorName}
          department={department}
          avatar={avatar}
        />

        {/* Dashboard Content Container */}
        <main className="flex-1 w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5 sm:space-y-6 pb-16 sm:pb-20">
          {/* Error Banner if any */}
          {dashboardError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold shadow-xs">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="size-5 text-rose-600 shrink-0" />
                <span>{dashboardError}</span>
              </div>
              <button
                type="button"
                onClick={fetchDoctorDashboard}
                className="px-3 py-1 rounded-xl bg-white border border-rose-200 text-rose-700 font-bold hover:bg-rose-100/50 cursor-pointer text-xs"
              >
                Retry
              </button>
            </div>
          )}

          {/* Loading Skeleton / State */}
          {isDashboardLoading && !dashboardData ? (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
              <div className="size-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs sm:text-sm font-bold text-slate-500">
                Loading practice analytics and clinical overview...
              </p>
            </div>
          ) : (
            <>
              {/* 1. Doctor Greeting & Verified Hospital Banner */}
              <DoctorGreetingBanner
                doctorName={doctorName}
                avatar={avatar}
                department={department}
                hospitalName={hospital?.name}
                hospitalCity={hospital?.city}
                todayAppointmentsCount={dashboardData?.kpis?.today?.total || 0}
                lifetimePatientsCount={dashboardData?.kpis?.lifetime?.totalPatientsTreated || 0}
              />

              {/* 2. Top Practice KPIs Row */}
              <DoctorPracticeKpiGrid
                todayTotal={dashboardData?.kpis?.today?.total}
                todayCompleted={dashboardData?.kpis?.today?.completed}
                totalPatientsTreated={dashboardData?.kpis?.lifetime?.totalPatientsTreated}
                averageRating={dashboardData?.reviewsSummary?.average || doctorInfo?.ratingAverage}
                reviewCount={dashboardData?.reviewsSummary?.total || doctorInfo?.reviewCount}
                totalCompletedLifetime={dashboardData?.kpis?.lifetime?.totalCompleted}
              />

              {/* 3. Main Workspace Grid (8 cols + 4 cols on Desktop) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
                {/* Left Column: Quick Actions, Monthly Analytics, Recent Consultations (8 cols) */}
                <div className="lg:col-span-8 space-y-5 sm:space-y-6">
                  {/* Quick Clinical Practice Actions */}
                  <DoctorQuickActions />

                  {/* Monthly Trend Analytics Graph (Jan - Dec) */}
                  <DoctorMonthlyAnalyticsChart
                    monthlyStats={dashboardData?.analytics?.monthlyStats}
                    currentYear={dashboardData?.analytics?.currentYear}
                  />

                  {/* Recent In-Clinic Treated Consultations */}
                  <DoctorRecentConsultations
                    consultations={dashboardData?.recentConsultations}
                  />
                </div>

                {/* Right Column: Next OPD Patient, Patient Feedback, Upcoming Leaves (4 cols) */}
                <div className="lg:col-span-4 space-y-5 sm:space-y-6">
                  {/* Next Upcoming OPD Patient Card */}
                  <DoctorNextAppointmentCard
                    appointment={dashboardData?.nextUpcomingAppointment}
                  />

                  {/* Patient Ratings & Verified Testimonials */}
                  <DoctorPatientFeedbackCard
                    averageRating={dashboardData?.reviewsSummary?.average || doctorInfo?.ratingAverage}
                    totalReviews={dashboardData?.reviewsSummary?.total || doctorInfo?.reviewCount}
                    ratingBreakdown={dashboardData?.reviewsSummary?.ratingBreakdown}
                    recentReviews={dashboardData?.reviewsSummary?.recentReviews}
                  />

                  {/* Upcoming Approved Leaves Card */}
                  <DoctorUpcomingLeavesCard
                    leaves={dashboardData?.upcomingLeaves}
                  />
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default DoctorDashboardPage
