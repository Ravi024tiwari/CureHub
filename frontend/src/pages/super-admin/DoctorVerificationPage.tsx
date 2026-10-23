import { useEffect, useState, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShieldCheck,
  ChevronDown,
  CheckCircle2,
  X,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useSuperAdminStore } from '@/store/superAdminStore'
import { useDoctorVerificationStore } from '@/store/doctorVerificationStore'

import { SuperAdminSidebar } from '@/components/super-admin/SuperAdminSidebar'
import { SuperAdminHeader } from '@/components/super-admin/SuperAdminHeader'
import { SuperAdminMobileNav } from '@/components/super-admin/SuperAdminMobileNav'

import {
  DoctorVerificationKpiGrid,
  DoctorVerificationFilterBar,
  DoctorVerificationCard,
  DoctorVerificationDetailPanel,
} from '@/components/super-admin/verifications'

export const DoctorVerificationPage: FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const {
    isSidebarCollapsed,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    toggleSidebar,
  } = useSuperAdminStore()

  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  const {
    doctors,
    pagination,
    selectedDoctor,
    setSelectedDoctor,
    fetchStats,
    fetchDoctors,
    fetchHospitals,
    filters,
    setFilters,
    isLoading,
    actionMessage,
    clearActionMessage,
  } = useDoctorVerificationStore()

  // On mobile screens, toggle between list view and details view
  const [mobileActiveView, setMobileActiveView] = useState<'list' | 'detail'>('list')
  const [isSortOpen, setIsSortOpen] = useState(false)

  // Initial Real Data Fetching from Database
  useEffect(() => {
    fetchStats()
    fetchDoctors(1)
    fetchHospitals()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto clear action message after 4 seconds
  useEffect(() => {
    if (actionMessage) {
      const timer = setTimeout(() => {
        clearActionMessage()
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [actionMessage, clearActionMessage])

  const sortLabels = {
    newest: 'Newest First',
    oldest: 'Oldest First',
    experience_desc: 'Most Experienced',
  }

  const handleSelectDoctor = (doc: any) => {
    setSelectedDoctor(doc)
    setMobileActiveView('detail')
  }

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

      {/* 3. Main Body - Independent Scroll Container */}
      <div className="flex-1 h-screen overflow-y-auto overflow-x-hidden overscroll-contain flex flex-col min-w-0 transition-all duration-300">
        {/* Top Header */}
        <SuperAdminHeader onToggleSidebar={toggleSidebar} />

        {/* Page Content Body */}
        <main className="flex-1 w-full max-w-[1750px] mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5 sm:space-y-6 pb-28 sm:pb-24 lg:pb-12">
          {/* Header Title matching mockup */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="size-5 stroke-[2.3]" />
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Doctor Verification
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Review and verify doctor profiles, documents and hospital join requests.
              </p>
            </div>

            <button
              onClick={() => {
                fetchStats()
                fetchDoctors()
              }}
              className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 shadow-2xs transition-all cursor-pointer"
            >
              <RefreshCw className={`size-3 text-slate-400 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
              <span>Refresh Data</span>
            </button>
          </div>

          {/* Action Notification Alert */}
          {actionMessage && (
            <div
              className={`p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between shadow-xs animate-in slide-in-from-top-3 duration-200 ${
                actionMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
                {actionMessage.type === 'success' ? (
                  <CheckCircle2 className="size-4.5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="size-4.5 text-rose-600 shrink-0" />
                )}
                <span>{actionMessage.text}</span>
              </div>
              <button
                onClick={clearActionMessage}
                className="p-1 rounded-lg hover:bg-black/5 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
          )}

          {/* 1. Top 4 Verification KPI Cards */}
          <DoctorVerificationKpiGrid />

          {/* 2. Responsive Real-Time Filter Bar */}
          <DoctorVerificationFilterBar />

          {/* 3. Master-Detail Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
            {/* Left Column: Doctor Requests List */}
            <div
              className={`lg:col-span-6 xl:col-span-5 space-y-3 flex flex-col ${
                mobileActiveView === 'detail' ? 'hidden lg:flex' : 'flex'
              }`}
            >
              {/* List Header: Counter and Sort By Dropdown matching mockup */}
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-black text-slate-700">
                  Showing {pagination.totalDocs}{' '}
                  {filters.status === 'ALL'
                    ? 'requests'
                    : `${filters.status.toLowerCase()} requests`}
                </span>

                {/* Sort Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsSortOpen((p) => !p)}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-2xs"
                  >
                    <span className="text-slate-400 font-semibold">Sort by:</span>
                    <span>{sortLabels[filters.sortBy]}</span>
                    <ChevronDown className="size-3 text-slate-400" />
                  </button>

                  {isSortOpen && (
                    <div className="absolute right-0 mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-xl p-1 z-30 animate-in fade-in zoom-in-95 duration-150">
                      {(['newest', 'oldest', 'experience_desc'] as const).map((sb) => (
                        <button
                          key={sb}
                          onClick={() => {
                            setFilters({ sortBy: sb })
                            setIsSortOpen(false)
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                            filters.sortBy === sb
                              ? 'bg-blue-50 text-blue-700 font-bold'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {sortLabels[sb]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Doctors List Items */}
              {isLoading ? (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
                  <div className="size-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-bold text-slate-500">
                    Querying doctor verification records from database...
                  </p>
                </div>
              ) : doctors.length > 0 ? (
                <div className="space-y-2.5">
                  {doctors.map((doc) => (
                    <DoctorVerificationCard
                      key={doc._id}
                      doctor={doc}
                      isSelected={selectedDoctor?._id === doc._id}
                      onSelect={() => handleSelectDoctor(doc)}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center space-y-2 shadow-2xs">
                  <ShieldCheck className="size-10 text-slate-300 mx-auto" />
                  <h4 className="text-sm font-black text-slate-700">No Doctors Found</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    No doctor registration requests match the selected filters in the database.
                  </p>
                </div>
              )}

              {/* Pagination Controls */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs text-xs">
                  <button
                    disabled={!pagination.hasPrevPage || isLoading}
                    onClick={() => fetchDoctors(pagination.currentPage - 1)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none font-bold transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="size-3.5" />
                    <span>Previous</span>
                  </button>

                  <span className="font-bold text-slate-500 text-[11px]">
                    Page {pagination.currentPage} of {pagination.totalPages}
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
            </div>

            {/* Right Column: Doctor Detail Panel */}
            <div
              className={`lg:col-span-6 xl:col-span-7 h-auto lg:sticky lg:top-20 ${
                mobileActiveView === 'list' ? 'hidden lg:block' : 'block'
              }`}
            >
              <DoctorVerificationDetailPanel
                doctor={selectedDoctor}
                isMobileView={true}
                onBack={() => setMobileActiveView('list')}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Fixed Mobile Bottom Navigation */}
      <SuperAdminMobileNav />
    </div>
  )
}

export default DoctorVerificationPage
