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
  Building2,
  Stethoscope,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useSuperAdminStore } from '@/store/superAdminStore'
import { useDoctorVerificationStore } from '@/store/doctorVerificationStore'
import { useHospitalAdminVerificationStore } from '@/store/hospitalAdminVerificationStore'

import { SuperAdminSidebar } from '@/components/super-admin/SuperAdminSidebar'
import { SuperAdminHeader } from '@/components/super-admin/SuperAdminHeader'
import { SuperAdminMobileNav } from '@/components/super-admin/SuperAdminMobileNav'

import {
  VerificationPartitionTabs,
  type VerificationPartition,
  DoctorVerificationKpiGrid,
  DoctorVerificationFilterBar,
  DoctorVerificationCard,
  DoctorVerificationDetailPanel,
  HospitalAdminVerificationKpiGrid,
  HospitalAdminVerificationFilterBar,
  HospitalAdminVerificationCard,
  HospitalAdminVerificationDetailPanel,
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

  // Partition Tab State
  const [activePartition, setActivePartition] =
    useState<VerificationPartition>('doctors')

  // Doctor Store
  const {
    stats: doctorStats,
    doctors,
    pagination: doctorPagination,
    selectedDoctor,
    setSelectedDoctor,
    fetchStats: fetchDoctorStats,
    fetchDoctors,
    fetchHospitals,
    filters: doctorFilters,
    setFilters: setDoctorFilters,
    isLoading: isDoctorLoading,
    actionMessage: doctorActionMessage,
    clearActionMessage: clearDoctorActionMessage,
  } = useDoctorVerificationStore()

  // Hospital Admin Store
  const {
    stats: hospitalAdminStats,
    admins: hospitalAdmins,
    pagination: hospitalAdminPagination,
    selectedAdmin,
    setSelectedAdmin,
    fetchStats: fetchHospitalAdminStats,
    fetchAdmins: fetchHospitalAdmins,
    filters: hospitalAdminFilters,
    setFilters: setHospitalAdminFilters,
    isLoading: isHospitalAdminLoading,
    actionMessage: hospitalAdminActionMessage,
    clearActionMessage: clearHospitalAdminActionMessage,
  } = useHospitalAdminVerificationStore()

  // On mobile screens, toggle between list view and details view
  const [mobileActiveView, setMobileActiveView] = useState<'list' | 'detail'>('list')
  const [isSortOpen, setIsSortOpen] = useState(false)

  // Initial Real Data Fetching from Database
  useEffect(() => {
    fetchDoctorStats()
    fetchDoctors(1)
    fetchHospitals()
    fetchHospitalAdminStats()
    fetchHospitalAdmins(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto clear action message after 4 seconds
  useEffect(() => {
    if (doctorActionMessage) {
      const timer = setTimeout(() => {
        clearDoctorActionMessage()
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [doctorActionMessage, clearDoctorActionMessage])

  useEffect(() => {
    if (hospitalAdminActionMessage) {
      const timer = setTimeout(() => {
        clearHospitalAdminActionMessage()
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [hospitalAdminActionMessage, clearHospitalAdminActionMessage])

  const doctorSortLabels = {
    newest: 'Newest First',
    oldest: 'Oldest First',
    experience_desc: 'Most Experienced',
  }

  const adminSortLabels = {
    newest: 'Newest First',
    oldest: 'Oldest First',
  }

  const handleSelectDoctor = (doc: any) => {
    setSelectedDoctor(doc)
    setMobileActiveView('detail')
  }

  const handleSelectAdmin = (admin: any) => {
    setSelectedAdmin(admin)
    setMobileActiveView('detail')
  }

  const handleRefresh = () => {
    if (activePartition === 'doctors') {
      fetchDoctorStats()
      fetchDoctors()
    } else {
      fetchHospitalAdminStats()
      fetchHospitalAdmins()
    }
  }

  const activeActionMessage =
    activePartition === 'doctors' ? doctorActionMessage : hospitalAdminActionMessage
  const handleClearActiveActionMessage =
    activePartition === 'doctors'
      ? clearDoctorActionMessage
      : clearHospitalAdminActionMessage

  const isLoading =
    activePartition === 'doctors' ? isDoctorLoading : isHospitalAdminLoading

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
          {/* Header Title & Refresh Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  {activePartition === 'doctors' ? (
                    <Stethoscope className="size-5 stroke-[2.3]" />
                  ) : (
                    <Building2 className="size-5 stroke-[2.3]" />
                  )}
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {activePartition === 'doctors'
                    ? 'Doctor Verification'
                    : 'Hospital Admin Verification'}
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                {activePartition === 'doctors'
                  ? 'Review and verify doctor profiles, medical licenses, and hospital join requests.'
                  : 'Review and verify hospital administrator profiles, government IDs, and authorization documents.'}
              </p>
            </div>

            <button
              onClick={handleRefresh}
              className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 shadow-2xs transition-all cursor-pointer"
            >
              <RefreshCw
                className={`size-3 text-slate-400 ${
                  isLoading ? 'animate-spin text-blue-600' : ''
                }`}
              />
              <span>Refresh Data</span>
            </button>
          </div>

          {/* Verification Partition Switcher Tabs */}
          <VerificationPartitionTabs
            activePartition={activePartition}
            onChange={(tab) => {
              setActivePartition(tab)
              setMobileActiveView('list')
            }}
            doctorPendingCount={doctorStats.pending}
            hospitalAdminPendingCount={hospitalAdminStats.pending}
          />

          {/* Action Notification Alert */}
          {activeActionMessage && (
            <div
              className={`p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between shadow-xs animate-in slide-in-from-top-3 duration-200 ${
                activeActionMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
                {activeActionMessage.type === 'success' ? (
                  <CheckCircle2 className="size-4.5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="size-4.5 text-rose-600 shrink-0" />
                )}
                <span>{activeActionMessage.text}</span>
              </div>
              <button
                onClick={handleClearActiveActionMessage}
                className="p-1 rounded-lg hover:bg-black/5 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
          )}

          {/* ==================== PARTITION 1: DOCTORS ==================== */}
          {activePartition === 'doctors' && (
            <div className="space-y-5 sm:space-y-6">
              {/* 1. Top 4 Verification KPI Cards */}
              <DoctorVerificationKpiGrid />

              {/* 2. Responsive Real-Time Filter Bar */}
              <DoctorVerificationFilterBar />

              {/* 3. Master-Detail Split Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
                {/* Left Column: Doctor Requests List */}
                <div
                  className={`lg:col-span-5 xl:col-span-4 space-y-3 flex flex-col ${
                    mobileActiveView === 'detail' ? 'hidden lg:flex' : 'flex'
                  }`}
                >
                  {/* List Header: Counter and Sort By Dropdown */}
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-black text-slate-700">
                      Showing {doctorPagination.totalDocs}{' '}
                      {doctorFilters.status === 'ALL'
                        ? 'requests'
                        : `${doctorFilters.status.toLowerCase()} requests`}
                    </span>

                    {/* Sort Dropdown */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsSortOpen((p) => !p)}
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-2xs"
                      >
                        <span className="text-slate-400 font-semibold">Sort by:</span>
                        <span>{doctorSortLabels[doctorFilters.sortBy]}</span>
                        <ChevronDown className="size-3 text-slate-400" />
                      </button>

                      {isSortOpen && (
                        <div className="absolute right-0 mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-xl p-1 z-30 animate-in fade-in zoom-in-95 duration-150">
                          {(['newest', 'oldest', 'experience_desc'] as const).map(
                            (sb) => (
                              <button
                                key={sb}
                                onClick={() => {
                                  setDoctorFilters({ sortBy: sb })
                                  setIsSortOpen(false)
                                }}
                                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                                  doctorFilters.sortBy === sb
                                    ? 'bg-blue-50 text-blue-700 font-bold'
                                    : 'text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                {doctorSortLabels[sb]}
                              </button>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Doctors List Items */}
                  {isDoctorLoading ? (
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
                      <h4 className="text-sm font-black text-slate-700">
                        No Doctors Found
                      </h4>
                      <p className="text-xs text-slate-400 max-w-xs mx-auto">
                        No doctor registration requests match the selected filters in the database.
                      </p>
                    </div>
                  )}

                  {/* Pagination Controls */}
                  {doctorPagination.totalPages > 1 && (
                    <div className="flex items-center justify-between p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs text-xs">
                      <button
                        disabled={!doctorPagination.hasPrevPage || isDoctorLoading}
                        onClick={() => fetchDoctors(doctorPagination.currentPage - 1)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none font-bold transition-colors cursor-pointer"
                      >
                        <ChevronLeft className="size-3.5" />
                        <span>Previous</span>
                      </button>

                      <span className="font-bold text-slate-500 text-[11px]">
                        Page {doctorPagination.currentPage} of{' '}
                        {doctorPagination.totalPages}
                      </span>

                      <button
                        disabled={!doctorPagination.hasNextPage || isDoctorLoading}
                        onClick={() => fetchDoctors(doctorPagination.currentPage + 1)}
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
                  className={`lg:col-span-7 xl:col-span-8 h-auto lg:sticky lg:top-20 ${
                    mobileActiveView === 'list' ? 'hidden lg:block' : 'block'
                  }`}
                >
                  <DoctorVerificationDetailPanel
                    doctor={selectedDoctor}
                    isMobileView={mobileActiveView === 'detail'}
                    onBack={() => setMobileActiveView('list')}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ==================== PARTITION 2: HOSPITAL ADMINS ==================== */}
          {activePartition === 'hospital-admins' && (
            <div className="space-y-5 sm:space-y-6">
              {/* 1. Top 4 Hospital Admin KPI Cards */}
              <HospitalAdminVerificationKpiGrid />

              {/* 2. Responsive Filter Bar */}
              <HospitalAdminVerificationFilterBar />

              {/* 3. Master-Detail Split Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
                {/* Left Column: Hospital Admin Requests List */}
                <div
                  className={`lg:col-span-5 xl:col-span-4 space-y-3 flex flex-col ${
                    mobileActiveView === 'detail' ? 'hidden lg:flex' : 'flex'
                  }`}
                >
                  {/* List Header: Counter and Sort By Dropdown */}
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-black text-slate-700">
                      Showing {hospitalAdminPagination.totalDocs}{' '}
                      {hospitalAdminFilters.status === 'ALL'
                        ? 'requests'
                        : `${hospitalAdminFilters.status.toLowerCase()} requests`}
                    </span>

                    {/* Sort Dropdown */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsSortOpen((p) => !p)}
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-2xs"
                      >
                        <span className="text-slate-400 font-semibold">Sort by:</span>
                        <span>{adminSortLabels[hospitalAdminFilters.sortBy]}</span>
                        <ChevronDown className="size-3 text-slate-400" />
                      </button>

                      {isSortOpen && (
                        <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-xl shadow-xl p-1 z-30 animate-in fade-in zoom-in-95 duration-150">
                          {(['newest', 'oldest'] as const).map((sb) => (
                            <button
                              key={sb}
                              onClick={() => {
                                setHospitalAdminFilters({ sortBy: sb })
                                setIsSortOpen(false)
                              }}
                              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                                hospitalAdminFilters.sortBy === sb
                                  ? 'bg-blue-50 text-blue-700 font-bold'
                                  : 'text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              {adminSortLabels[sb]}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hospital Admin List Items */}
                  {isHospitalAdminLoading ? (
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
                      <div className="size-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-xs font-bold text-slate-500">
                        Querying hospital admin verification records from database...
                      </p>
                    </div>
                  ) : hospitalAdmins.length > 0 ? (
                    <div className="space-y-2.5">
                      {hospitalAdmins.map((admin) => (
                        <HospitalAdminVerificationCard
                          key={admin._id}
                          admin={admin}
                          isSelected={selectedAdmin?._id === admin._id}
                          onSelect={() => handleSelectAdmin(admin)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center space-y-2 shadow-2xs">
                      <Building2 className="size-10 text-slate-300 mx-auto" />
                      <h4 className="text-sm font-black text-slate-700">
                        No Hospital Admins Found
                      </h4>
                      <p className="text-xs text-slate-400 max-w-xs mx-auto">
                        No hospital admin verification applications match the selected filters.
                      </p>
                    </div>
                  )}

                  {/* Pagination Controls */}
                  {hospitalAdminPagination.totalPages > 1 && (
                    <div className="flex items-center justify-between p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs text-xs">
                      <button
                        disabled={
                          !hospitalAdminPagination.hasPrevPage || isHospitalAdminLoading
                        }
                        onClick={() =>
                          fetchHospitalAdmins(
                            hospitalAdminPagination.currentPage - 1
                          )
                        }
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none font-bold transition-colors cursor-pointer"
                      >
                        <ChevronLeft className="size-3.5" />
                        <span>Previous</span>
                      </button>

                      <span className="font-bold text-slate-500 text-[11px]">
                        Page {hospitalAdminPagination.currentPage} of{' '}
                        {hospitalAdminPagination.totalPages}
                      </span>

                      <button
                        disabled={
                          !hospitalAdminPagination.hasNextPage || isHospitalAdminLoading
                        }
                        onClick={() =>
                          fetchHospitalAdmins(
                            hospitalAdminPagination.currentPage + 1
                          )
                        }
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none font-bold transition-colors cursor-pointer"
                      >
                        <span>Next</span>
                        <ChevronRight className="size-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Right Column: Hospital Admin Detail Panel */}
                <div
                  className={`lg:col-span-7 xl:col-span-8 h-auto lg:sticky lg:top-20 ${
                    mobileActiveView === 'list' ? 'hidden lg:block' : 'block'
                  }`}
                >
                  <HospitalAdminVerificationDetailPanel
                    admin={selectedAdmin}
                    isMobileView={mobileActiveView === 'detail'}
                    onBack={() => setMobileActiveView('list')}
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Fixed Mobile Bottom Navigation */}
      <SuperAdminMobileNav />
    </div>
  )
}

export default DoctorVerificationPage
