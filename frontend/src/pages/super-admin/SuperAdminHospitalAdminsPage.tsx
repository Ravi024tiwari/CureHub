import { useEffect, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2,
  RefreshCw,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Clock,
  Ban,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useSuperAdminStore } from '@/store/superAdminStore'
import { useAdminHospitalAdminsStore } from '@/store/adminHospitalAdminsStore'

import { SuperAdminSidebar } from '@/components/super-admin/SuperAdminSidebar'
import { SuperAdminHeader } from '@/components/super-admin/SuperAdminHeader'
import { SuperAdminMobileNav } from '@/components/super-admin/SuperAdminMobileNav'

import {
  AdminHospitalAdminsStatsGrid,
  AdminHospitalAdminsFilterBar,
  AdminHospitalAdminsTableView,
  AdminHospitalAdminCard,
  AdminHospitalAdminStatusModal,
} from '@/components/super-admin/hospital-admins'

export const SuperAdminHospitalAdminsPage: FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const {
    isSidebarCollapsed,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    toggleSidebar,
  } = useSuperAdminStore()

  const {
    hospitalAdmins,
    stats,
    pagination,
    filters,
    isLoading,
    isExporting,
    actionNotification,
    clearNotification,
    fetchHospitalAdmins,
    setFilters,
    resetFilters,
    exportList,
  } = useAdminHospitalAdminsStore()

  // Protect route
  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  // Initial fetch
  useEffect(() => {
    fetchHospitalAdmins(1)
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

  // Calculate current range showing (e.g. "Showing 1 to 10 of 48 admins")
  const startIndex = pagination.totalDocs === 0 ? 0 : (pagination.currentPage - 1) * pagination.limit + 1
  const endIndex = Math.min(pagination.currentPage * pagination.limit, pagination.totalDocs)

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

      {/* 3. Main Dashboard Body - Scroll Container */}
      <div className="flex-1 h-screen overflow-y-auto overflow-x-hidden overscroll-contain flex flex-col min-w-0 transition-all duration-300">
        <SuperAdminHeader onToggleSidebar={toggleSidebar} />

        <main className="flex-1 w-full max-w-[1750px] mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5 sm:space-y-6 pb-28 sm:pb-24 lg:pb-12">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="size-8.5 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Building2 className="size-5 stroke-[2.3]" />
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Hospital Admins
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Manage verified hospital administrators. View their details, affiliated hospitals, and manage access.
              </p>
            </div>

            {/* Action Buttons: Export + Refresh */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => fetchHospitalAdmins()}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`size-3.5 text-slate-400 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <button
                onClick={exportList}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-60"
              >
                {isExporting ? (
                  <div className="size-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Download className="size-3.5 stroke-[2.5]" />
                )}
                <span>Export List</span>
              </button>
            </div>
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

          {/* Mobile Status Tabs (Quick Filter Pills shown on mobile design) */}
          <div className="flex sm:hidden items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setFilters({ status: 'APPROVED' })}
              className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                filters.status === 'APPROVED'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700'
              }`}
            >
              <ShieldCheck className="size-3.5" />
              <span>Verified ({stats.totalVerified})</span>
            </button>

            <button
              onClick={() => setFilters({ status: 'PENDING' })}
              className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                filters.status === 'PENDING'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700'
              }`}
            >
              <Clock className="size-3.5" />
              <span>Pending ({stats.pendingVerifications})</span>
            </button>

            <button
              onClick={() => setFilters({ status: 'REJECTED' })}
              className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                filters.status === 'REJECTED'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700'
              }`}
            >
              <Ban className="size-3.5" />
              <span>Rejected ({stats.rejectedRequests})</span>
            </button>

            <button
              onClick={() => setFilters({ status: 'ALL' })}
              className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
                filters.status === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700'
              }`}
            >
              <span>All ({stats.totalAll})</span>
            </button>
          </div>

          {/* 1. Top KPI Summary Cards */}
          <AdminHospitalAdminsStatsGrid />

          {/* 2. Interactive Search & Multi-field Filters Bar */}
          <AdminHospitalAdminsFilterBar />

          {/* 3. Hospital Admins List View: Table or Responsive Cards */}
          {isLoading ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-16 text-center space-y-3 shadow-2xs">
              <div className="size-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-500">
                Fetching hospital administrators from platform database...
              </p>
            </div>
          ) : hospitalAdmins.length > 0 ? (
            filters.viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {hospitalAdmins.map((admin) => (
                  <AdminHospitalAdminCard key={admin._id} admin={admin} />
                ))}
              </div>
            ) : (
              <div>
                {/* Desktop/Tablet Table */}
                <div className="hidden md:block">
                  <AdminHospitalAdminsTableView hospitalAdmins={hospitalAdmins} />
                </div>
                {/* Mobile Cards View */}
                <div className="md:hidden space-y-3">
                  {hospitalAdmins.map((admin) => (
                    <AdminHospitalAdminCard key={admin._id} admin={admin} />
                  ))}
                </div>
              </div>
            )
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3 shadow-2xs">
              <Building2 className="size-12 text-slate-300 mx-auto" />
              <h4 className="text-base font-black text-slate-800">
                No Hospital Administrators Found
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No administrators matched your search criteria or selected filters in the platform database.
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

          {/* 4. Interactive Pagination Bar (Matching mockup layout) */}
          {pagination.totalDocs > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs text-xs">
              <span className="font-semibold text-slate-500 text-xs text-center sm:text-left">
                Showing{' '}
                <span className="font-black text-slate-800">{startIndex}</span> to{' '}
                <span className="font-black text-slate-800">{endIndex}</span> of{' '}
                <span className="font-black text-slate-800">{pagination.totalDocs}</span> admins
              </span>

              {/* Page navigation controls */}
              <div className="flex items-center gap-1.5">
                <button
                  disabled={!pagination.hasPrevPage || isLoading}
                  onClick={() => fetchHospitalAdmins(pagination.currentPage - 1)}
                  className="size-8 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-colors cursor-pointer"
                  title="Previous page"
                >
                  <ChevronLeft className="size-4" />
                </button>

                {/* Page numbers */}
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    // Show first, last, and current +/- 1
                    return (
                      p === 1 ||
                      p === pagination.totalPages ||
                      Math.abs(p - pagination.currentPage) <= 1
                    )
                  })
                  .map((pageNum, idx, arr) => {
                    const prev = arr[idx - 1]
                    const showEllipsis = prev && pageNum - prev > 1
                    return (
                      <div key={pageNum} className="flex items-center gap-1.5">
                        {showEllipsis && (
                          <span className="px-1 text-slate-300 font-bold">...</span>
                        )}
                        <button
                          onClick={() => fetchHospitalAdmins(pageNum)}
                          disabled={isLoading}
                          className={`size-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            pagination.currentPage === pageNum
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      </div>
                    )
                  })}

                <button
                  disabled={!pagination.hasNextPage || isLoading}
                  onClick={() => fetchHospitalAdmins(pagination.currentPage + 1)}
                  className="size-8 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-colors cursor-pointer"
                  title="Next page"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Account Enable/Disable Reason Modal */}
      <AdminHospitalAdminStatusModal />

      {/* Fixed Mobile Bottom Navigation */}
      <SuperAdminMobileNav />
    </div>
  )
}

export default SuperAdminHospitalAdminsPage
