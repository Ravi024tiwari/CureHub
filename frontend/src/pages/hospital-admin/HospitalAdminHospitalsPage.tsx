import { useEffect, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, SearchX } from 'lucide-react'
import { HospitalAdminSidebar } from '@/components/hospital-admin/HospitalAdminSidebar'
import { HospitalAdminHeader } from '@/components/hospital-admin/HospitalAdminHeader'
import { HospitalAdminMobileNav } from '@/components/hospital-admin/HospitalAdminMobileNav'
import { HospitalKpiCards } from '@/components/hospital-admin/hospitals/HospitalKpiCards'
import { HospitalFiltersBar } from '@/components/hospital-admin/hospitals/HospitalFiltersBar'
import { HospitalCard } from '@/components/hospital-admin/hospitals/HospitalCard'
import { HospitalListItem } from '@/components/hospital-admin/hospitals/HospitalListItem'
import { HospitalDetailsModal } from '@/components/hospital-admin/hospitals/HospitalDetailsModal'
import { AddHospitalModal } from '@/components/hospital-admin/hospitals/AddHospitalModal'
import { EditHospitalModal } from '@/components/hospital-admin/hospitals/EditHospitalModal'
import { MobileFilterDrawer } from '@/components/hospital-admin/hospitals/MobileFilterDrawer'
import { useHospitalBranchesStore } from '@/store/hospitalBranchesStore'
import { useHospitalAdminStore } from '@/store/hospitalAdminStore'

export const HospitalAdminHospitalsPage: FC = () => {
  const navigate = useNavigate()
  const { isMobileSidebarOpen, setIsMobileSidebarOpen, isSidebarCollapsed, toggleSidebar } = useHospitalAdminStore()
  const {
    hospitals,
    isLoading,
    viewMode,
    fetchHospitals,
    resetFilters,
  } = useHospitalBranchesStore()

  useEffect(() => {
    fetchHospitals()
  }, [])

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex selection:bg-blue-100 selection:text-blue-700 antialiased">
      {/* 1. Desktop Persistent Collapsible Sidebar */}
      <div
        className={`hidden lg:block transition-all duration-300 ease-in-out shrink-0 overflow-hidden ${
          isSidebarCollapsed ? 'w-0 opacity-0 -ml-2 pointer-events-none' : 'w-64 opacity-100'
        }`}
      >
        <HospitalAdminSidebar />
      </div>

      {/* 2. Mobile Drawer Sidebar */}
      {isMobileSidebarOpen && (
        <HospitalAdminSidebar
          isMobileDrawer={true}
          onCloseDrawer={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* 3. Main Page Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-10 transition-all duration-300">
        {/* Top Header with Hamburger Mobile Menu toggle */}
        <HospitalAdminHeader onToggleSidebar={toggleSidebar} />

        {/* Scrollable Dashboard Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header: Title + Subtitle + Add Hospital Button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Hospitals
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                  Manage all your hospital branches, view status, update details and more.
                </p>
              </div>

              {/* Primary Add New Hospital Button */}
              <button
                onClick={() => navigate('/hospital-admin/hospitals/new')}
                className="w-full sm:w-auto px-4 sm:px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <Plus className="size-4 stroke-[3]" />
                <span>Add New Hospital</span>
              </button>
            </div>

            {/* 6 KPI Status Cards */}
            <HospitalKpiCards />

            {/* Search, Filter & View Mode Controls Bar */}
            <HospitalFiltersBar />

            {/* Hospitals Cards Grid / List View */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-3xl border border-slate-200/80 p-4 h-96 animate-pulse flex flex-col justify-between"
                  >
                    <div className="h-48 bg-slate-100 rounded-2xl" />
                    <div className="space-y-2 mt-4">
                      <div className="h-5 bg-slate-100 rounded-lg w-3/4" />
                      <div className="h-3 bg-slate-100 rounded-lg w-1/2" />
                    </div>
                    <div className="h-10 bg-slate-50 rounded-xl mt-4" />
                  </div>
                ))}
              </div>
            ) : hospitals.length === 0 ? (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-10 sm:p-14 text-center flex flex-col items-center justify-center max-w-md mx-auto">
                <div className="size-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
                  <SearchX className="size-8" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  No Hospitals Found
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  We couldn't find any hospital branches matching your selected filter criteria.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-5 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs transition-colors cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {hospitals.map((hospital, idx) => (
                  <HospitalCard key={hospital._id} hospital={hospital} index={idx} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {hospitals.map((hospital, idx) => (
                  <HospitalListItem key={hospital._id} hospital={hospital} index={idx} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* 3. Interactive Modals & Drawers */}
      <HospitalDetailsModal />
      <AddHospitalModal />
      <EditHospitalModal />
      <MobileFilterDrawer />

      {/* 4. Mobile Bottom Nav Bar */}
      <HospitalAdminMobileNav />
    </div>
  )
}
export default HospitalAdminHospitalsPage
