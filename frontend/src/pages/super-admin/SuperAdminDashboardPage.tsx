import { useEffect, type FC } from 'react'
import { CheckCircle2, X } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useSuperAdminStore } from '@/store/superAdminStore'

import { SuperAdminSidebar } from '@/components/super-admin/SuperAdminSidebar'
import { SuperAdminHeader } from '@/components/super-admin/SuperAdminHeader'
import { SuperAdminMobileNav } from '@/components/super-admin/SuperAdminMobileNav'

import { SuperAdminKpiGrid } from '@/components/super-admin/SuperAdminKpiGrid'
import { AppointmentsOverviewChart } from '@/components/super-admin/AppointmentsOverviewChart'
import { UserGrowthChart } from '@/components/super-admin/UserGrowthChart'
import { RoleDistributionDonut } from '@/components/super-admin/RoleDistributionDonut'
import { RevenueOverviewChart } from '@/components/super-admin/RevenueOverviewChart'
import { HospitalTrendChart } from '@/components/super-admin/HospitalTrendChart'
import { TopPerformingHospitalsCard } from '@/components/super-admin/TopPerformingHospitalsCard'
import { RecentAppointmentsTable } from '@/components/super-admin/RecentAppointmentsTable'
import { PendingVerificationsCard } from '@/components/super-admin/PendingVerificationsCard'
import { RecentActivityTimeline } from '@/components/super-admin/RecentActivityTimeline'

export const SuperAdminDashboardPage: FC = () => {
  const { user } = useAuthStore()
  const {
    fetchDashboard,
    isSidebarCollapsed,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    toggleSidebar,
    actionNotification,
    clearNotification,
  } = useSuperAdminStore()

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  // Auto clear feedback message
  useEffect(() => {
    if (actionNotification) {
      const timer = setTimeout(() => {
        clearNotification()
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [actionNotification, clearNotification])

  const adminName = user?.name || 'Dr. Ramesh Kumar'

  return (
    <div className="h-screen w-full overflow-hidden bg-[#F8FAFC] text-slate-900 flex selection:bg-blue-100 selection:text-blue-700 antialiased">
      {/* 1. Desktop Persistent Collapsible Sidebar - Independent Fixed Height */}
      <div
        className={`hidden lg:block h-screen transition-all duration-300 ease-in-out shrink-0 ${
          isSidebarCollapsed ? 'w-0 opacity-0 -ml-2 pointer-events-none' : 'w-64 opacity-100'
        }`}
      >
        <SuperAdminSidebar />
      </div>

      {/* 2. Mobile Drawer Sidebar */}
      {isMobileSidebarOpen && (
        <SuperAdminSidebar
          isMobileDrawer={true}
          onCloseDrawer={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* 3. Main Dashboard Body Area - Independent Scroll Container */}
      <div className="flex-1 h-screen overflow-y-auto overflow-x-hidden overscroll-contain flex flex-col min-w-0 transition-all duration-300">
        {/* Top Header with Hamburger Mobile Menu toggle */}
        <SuperAdminHeader onToggleSidebar={toggleSidebar} />

        {/* Scrollable Dashboard Body */}
        <main className="flex-1 w-full max-w-[1750px] mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5 sm:space-y-6 pb-28 sm:pb-24 lg:pb-12">
          {/* Welcome Title matching mockup */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Welcome back, {adminName}! Here's what's happening across the CarePlus platform.
            </p>
          </div>

          {/* Action Notification Alert */}
          {actionNotification && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between shadow-xs animate-in slide-in-from-top-3 duration-200">
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
                <CheckCircle2 className="size-4.5 text-emerald-600 shrink-0" />
                <span>{actionNotification}</span>
              </div>
              <button
                onClick={clearNotification}
                className="p-1 text-emerald-600 hover:text-emerald-800 rounded-lg hover:bg-emerald-100/50 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
          )}

          {/* 1. Top 6 Executive KPI Metric Cards */}
          <SuperAdminKpiGrid />

          {/* 2. Middle Row Analytics: Appointments Overview, User Growth, Role Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
            <div className="lg:col-span-12 xl:col-span-5 flex flex-col">
              <AppointmentsOverviewChart />
            </div>
            <div className="lg:col-span-12 xl:col-span-4 flex flex-col">
              <UserGrowthChart />
            </div>
            <div className="lg:col-span-12 xl:col-span-3 flex flex-col">
              <RoleDistributionDonut />
            </div>
          </div>

          {/* 3. Second Analytics Row: Revenue Overview, Hospital Trend, Top Performing Hospitals */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
            <div className="lg:col-span-12 xl:col-span-5 flex flex-col">
              <RevenueOverviewChart />
            </div>
            <div className="lg:col-span-12 xl:col-span-3 flex flex-col">
              <HospitalTrendChart />
            </div>
            <div className="lg:col-span-12 xl:col-span-4 flex flex-col">
              <TopPerformingHospitalsCard />
            </div>
          </div>

          {/* 4. Bottom Operations Row: Recent Appointments, Pending Verifications, Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
            <div className="lg:col-span-12 xl:col-span-5 flex flex-col">
              <RecentAppointmentsTable />
            </div>
            <div className="lg:col-span-12 xl:col-span-4 flex flex-col">
              <PendingVerificationsCard />
            </div>
            <div className="lg:col-span-12 xl:col-span-3 flex flex-col">
              <RecentActivityTimeline />
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <SuperAdminMobileNav />
    </div>
  )
}

export default SuperAdminDashboardPage
