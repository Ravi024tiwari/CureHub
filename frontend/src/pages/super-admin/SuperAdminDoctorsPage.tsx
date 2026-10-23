import { useEffect, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Stethoscope,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useSuperAdminStore } from '@/store/superAdminStore'
import { useAdminDoctorsStore } from '@/store/adminDoctorsStore'

import { SuperAdminSidebar } from '@/components/super-admin/SuperAdminSidebar'
import { SuperAdminHeader } from '@/components/super-admin/SuperAdminHeader'
import { SuperAdminMobileNav } from '@/components/super-admin/SuperAdminMobileNav'

import {
  AdminDoctorsStatsGrid,
  AdminDoctorsFilterBar,
  AdminDoctorCard,
  AdminDoctorsTableView,
  AdminDoctorDetailDrawer,
  AdminDoctorStatusModal,
} from '@/components/super-admin/doctors'

export const SuperAdminDoctorsPage: FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const {
    isSidebarCollapsed,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    toggleSidebar,
  } = useSuperAdminStore()

  const {
    doctors,
    pagination,
    filters,
    isLoading,
    actionNotification,
    clearNotification,
    fetchDoctors,
    fetchHospitals,
    resetFilters,
  } = useAdminDoctorsStore()

  // Protect route
  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  // Initial data fetch
  useEffect(() => {
    fetchDoctors(1)
    fetchHospitals()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto clear notification
  useEffect(() => {
    if (actionNotification) {
      const timer = setTimeout(() => {
        clearNotification()
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [actionNotification, clearNotification])

  return (
    <div className="h-screen w-full overflow-hidden bg-[#F8FAFC] text-slate-900 flex selection:bg-blue-100 selection:text-blue-700 antialiased">
      {/* 1. Desktop Persistent Collapsible Sidebar */}
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

      {/* 3. Main Dashboard Body - Independent Scroll Container */}
      <div className="flex-1 h-screen overflow-y-auto overflow-x-hidden overscroll-contain flex flex-col min-w-0 transition-all duration-300">
        <SuperAdminHeader onToggleSidebar={toggleSidebar} />

        <main className="flex-1 w-full max-w-[1750px] mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5 sm:space-y-6 pb-28 sm:pb-24 lg:pb-12">
          {/* Header Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Stethoscope className="size-5 stroke-[2.3]" />
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Doctors Management
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Directory, active status governance, and credentials for all platform medical doctors.
              </p>
            </div>

            <button
              onClick={() => fetchDoctors()}
              className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 shadow-2xs transition-all cursor-pointer"
            >
              <RefreshCw className={`size-3 text-slate-400 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
              <span>Refresh List</span>
            </button>
          </div>

          {/* Action Notification Alert */}
          {actionNotification && (
            <div
              className={`p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between shadow-xs animate-in slide-in-from-top-3 duration-200 ${
                actionNotification.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
                {actionNotification.type === 'success' ? (
                  <CheckCircle2 className="size-4.5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="size-4.5 text-rose-600 shrink-0" />
                )}
                <span>{actionNotification.message}</span>
              </div>
              <button
                onClick={clearNotification}
                className="p-1 rounded-lg hover:bg-black/5 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
          )}

          {/* 1. Top 4 Doctors Stats Cards */}
          <AdminDoctorsStatsGrid />

          {/* 2. Interactive Search & Filters Bar */}
          <AdminDoctorsFilterBar />

          {/* 3. Doctors List Display: Grid or Table */}
          {isLoading ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-16 text-center space-y-3">
              <div className="size-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-500">
                Fetching platform doctors from database...
              </p>
            </div>
          ) : doctors.length > 0 ? (
            filters.viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                {doctors.map((doctor) => (
                  <AdminDoctorCard key={doctor._id} doctor={doctor} />
                ))}
              </div>
            ) : (
              <AdminDoctorsTableView doctors={doctors} />
            )
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3 shadow-2xs">
              <Stethoscope className="size-12 text-slate-300 mx-auto" />
              <h4 className="text-base font-black text-slate-700">No Doctors Found</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No doctors matched your search criteria or selected filters in the platform database.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold transition-colors cursor-pointer inline-block"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* 4. Pagination Bar */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs text-xs">
              <button
                disabled={!pagination.hasPrevPage || isLoading}
                onClick={() => fetchDoctors(pagination.currentPage - 1)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none font-bold transition-colors cursor-pointer"
              >
                <ChevronLeft className="size-3.5" />
                <span>Previous</span>
              </button>

              <span className="font-bold text-slate-500 text-[11px]">
                Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalDocs} doctors)
              </span>

              <button
                disabled={!pagination.hasNextPage || isLoading}
                onClick={() => fetchDoctors(pagination.currentPage + 1)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none font-bold transition-colors cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="size-3.5" />
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Slide-over Profile Drawer */}
      <AdminDoctorDetailDrawer />

      {/* Enable/Disable Reason Modal */}
      <AdminDoctorStatusModal />

      {/* Fixed Mobile Bottom Nav */}
      <SuperAdminMobileNav />
    </div>
  )
}

export default SuperAdminDoctorsPage
