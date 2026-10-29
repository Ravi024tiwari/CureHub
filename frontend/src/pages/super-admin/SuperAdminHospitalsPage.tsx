import { useState, useEffect, useRef, type FC } from 'react'
import { SuperAdminSidebar } from '@/components/super-admin/SuperAdminSidebar'
import { SuperAdminHeader } from '@/components/super-admin/SuperAdminHeader'
import { SuperAdminMobileNav } from '@/components/super-admin/SuperAdminMobileNav'
import { HospitalCard } from '@/components/patient/HospitalCard'
import { HospitalFiltersSidebar } from '@/components/patient/HospitalFiltersSidebar'
import { HospitalDetailView } from '@/components/patient/HospitalDetailView'
import { HospitalCardSkeleton } from '@/components/patient/HospitalCardSkeleton'
import { LoadingStation } from '@/components/common/LoadingStation'
import { useSuperAdminStore } from '@/store/superAdminStore'
import { useHospitalStore } from '@/store/hospitalStore'

import {
  Search,
  MapPin,
  Filter,
  Building2,
  Clock,
  Heart,
  Baby,
  Sparkles,
  ShieldCheck,
  Check,
  ChevronDown,
  X,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react'

export const SuperAdminHospitalsPage: FC = () => {
  // Super Admin Layout
  const {
    isSidebarCollapsed,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    toggleSidebar,
  } = useSuperAdminStore()

  // Layout State
  const [isFiltersSidebarOpen, setIsFiltersSidebarOpen] = useState(false)
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false)

  // Live Hospital Store (reused from platform hospitals store)
  const {
    hospitals,
    totalHospitals,
    selectedHospital,
    isLoadingInitial,
    isLoadingMore,
    hasMore,
    searchQuery,
    selectedCity,
    activeQuickPill,
    selectedHospitalTypes,
    selectedDepartments,
    selectedFacilities,
    distanceRadius,
    minYear,
    maxYear,
    sortBy,
    setSearchQuery,
    setSelectedCity,
    setActiveQuickPill,
    setSelectedHospitalTypes,
    setSelectedDepartments,
    setSelectedFacilities,
    setDistanceRadius,
    setYearRange,
    setSortBy,
    setSelectedHospital,
    toggleFavoriteHospital,
    clearAllFilters,
    fetchHospitals,
    fetchNextPage,
  } = useHospitalStore()

  const observerTarget = useRef<HTMLDivElement>(null)

  // City options
  const cityOptions = [
    'All Cities',
    'Bilaspur, Chhattisgarh',
    'Raipur, Chhattisgarh',
    'New Delhi, NCR',
    'Mumbai, Maharashtra',
    'Bengaluru, Karnataka',
  ]

  // Quick category pills
  const quickPills = [
    { id: 'all', label: 'All Hospitals', icon: Building2 },
    { id: 'emergency', label: '24/7 Emergency', icon: Clock },
    { id: 'cardiac', label: 'Cardiac Care', icon: Heart },
    { id: 'maternity', label: 'Maternity', icon: Baby },
    { id: 'top-rated', label: 'Top Rated', icon: Sparkles },
    { id: 'nabh', label: 'NABH Accredited', icon: ShieldCheck },
  ]

  // Fetch hospitals on initial mount and when filters change
  useEffect(() => {
    fetchHospitals(1, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchQuery,
    selectedCity,
    activeQuickPill,
    selectedHospitalTypes,
    selectedDepartments,
    selectedFacilities,
    distanceRadius,
    minYear,
    maxYear,
    sortBy,
  ])

  // Reset selected hospital on unmount
  useEffect(() => {
    return () => {
      setSelectedHospital(null)
    }
  }, [setSelectedHospital])

  // Infinite Scroll Intersection Observer
  useEffect(() => {
    const target = observerTarget.current
    if (!target || !hasMore || isLoadingInitial || isLoadingMore || hospitals.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore && hasMore && hospitals.length > 0) {
          fetchNextPage()
        }
      },
      { threshold: 0.1, rootMargin: '120px' }
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [hasMore, isLoadingMore, isLoadingInitial, hospitals.length, fetchNextPage])

  // Count active filters
  const activeFiltersCount =
    (selectedCity !== 'All Cities' ? 1 : 0) +
    (activeQuickPill !== 'all' ? 1 : 0) +
    selectedHospitalTypes.length +
    selectedDepartments.length +
    selectedFacilities.length +
    (distanceRadius !== 'within-10km' ? 1 : 0) +
    (minYear !== 1800 || maxYear !== 2026 ? 1 : 0)

  return (
    <div className="h-screen w-full overflow-hidden bg-[#F8FAFC] text-slate-900 flex selection:bg-blue-100 selection:text-blue-700 antialiased font-sans">
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

      {/* 3. Main Body Scroll Container */}
      <div className="flex-1 h-screen overflow-y-auto overflow-x-hidden flex flex-col min-w-0 transition-all duration-300">
        <SuperAdminHeader onToggleSidebar={toggleSidebar} />

        <main className="flex-1 max-w-[1520px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5 pb-24 md:pb-12">
          {/* Detailed Hospital View Mode */}
          {selectedHospital ? (
            <div className="animate-in fade-in duration-200">
              <HospitalDetailView
                hospital={selectedHospital}
                onBack={() => setSelectedHospital(null)}
                onBookAppointment={() => {}}
              />
            </div>
          ) : (
            <div className="space-y-5">
              {/* Top Page Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Registered Hospitals
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                    Browse all verified hospitals and medical centers registered across the platform.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200/80 shadow-2xs">
                    {totalHospitals} Total Hospitals
                  </span>
                  <button
                    type="button"
                    onClick={() => fetchHospitals(1, true)}
                    className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 transition-colors shadow-2xs cursor-pointer"
                    title="Refresh hospitals list"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Search & Location Filter Bar */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3 sm:p-4 space-y-3">
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                  {/* Search Input */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search hospitals by name, specialty, address..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-9 py-2.5 bg-slate-50/80 focus:bg-white text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder:text-slate-400"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* City Dropdown */}
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsCityDropdownOpen((prev) => !prev)}
                      className="w-full md:w-56 flex items-center justify-between px-3.5 py-2.5 bg-slate-50/80 hover:bg-slate-100/70 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="truncate">{selectedCity}</span>
                      </div>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                          isCityDropdownOpen ? 'rotate-180 text-blue-600' : ''
                        }`}
                      />
                    </button>

                    {isCityDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-20"
                          onClick={() => setIsCityDropdownOpen(false)}
                        />
                        <div className="absolute right-0 top-full mt-1.5 w-60 bg-white rounded-xl border border-slate-200 shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-150">
                          {cityOptions.map((city) => (
                            <button
                              key={city}
                              type="button"
                              onClick={() => {
                                setSelectedCity(city)
                                setIsCityDropdownOpen(false)
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-left transition-colors cursor-pointer ${
                                selectedCity === city
                                  ? 'bg-blue-50 text-blue-600 font-bold'
                                  : 'text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <span>{city}</span>
                              {selectedCity === city && (
                                <Check className="w-3.5 h-3.5 text-blue-600" />
                              )}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Filter Sidebar Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setIsFiltersSidebarOpen(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50/80 hover:bg-slate-100/70 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 transition-all cursor-pointer relative shrink-0"
                  >
                    <Filter className="w-4 h-4 text-blue-600" />
                    <span>Filters</span>
                    {activeFiltersCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-blue-600 text-white">
                        {activeFiltersCount}
                      </span>
                    )}
                  </button>

                  {/* Sort Dropdown */}
                  <div className="relative shrink-0">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2.5 bg-slate-50/80 hover:bg-slate-100/70 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                    >
                      <option value="relevance">Sort: Relevance</option>
                      <option value="rating">Highest Rated</option>
                      <option value="beds">Most Beds</option>
                      <option value="newest">Recently Added</option>
                    </select>
                  </div>
                </div>

                {/* Quick Category Pills Strip */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-slate-100">
                  {quickPills.map((pill) => {
                    const Icon = pill.icon
                    const isActive = activeQuickPill === pill.id
                    return (
                      <button
                        key={pill.id}
                        type="button"
                        onClick={() => setActiveQuickPill(pill.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100/70 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                        <span>{pill.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Main Hospital Grid Content Area */}
              {isLoadingInitial ? (
                <div className="space-y-6">
                  {/* Interactive Live Sync Status Banner */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50/50 to-blue-50/30 border border-blue-200/80 shadow-2xs flex items-center justify-between animate-in fade-in duration-300">
                    <div className="flex items-center gap-3.5">
                      <div className="relative size-9 flex items-center justify-center shrink-0">
                        <div className="size-9 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                        <div className="absolute size-2.5 rounded-full bg-blue-600 animate-pulse" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">
                          Syncing Platform Hospital Registry...
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Fetching verified hospitals, bed counts, and department capacities
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-black border border-blue-200/80 hidden sm:inline-block">
                      Live Sync
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    <HospitalCardSkeleton count={6} />
                  </div>
                </div>
              ) : hospitals.length > 0 ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {hospitals.map((hospital) => (
                      <HospitalCard
                        key={hospital._id}
                        hospital={hospital}
                        onViewDetails={(hosp) => setSelectedHospital(hosp)}
                        onToggleFavorite={toggleFavoriteHospital}
                      />
                    ))}

                    {/* Shimmer skeleton cards during scroll loading */}
                    {isLoadingMore && (
                      <HospitalCardSkeleton count={3} />
                    )}
                  </div>

                  {/* Infinite scroll sentinel & Loading indicator */}
                  <div ref={observerTarget} className="py-6 flex flex-col items-center justify-center">
                    {isLoadingMore && (
                      <LoadingStation
                        variant="pill"
                        title="Loading more hospitals..."
                        subtitle="Retrieving real-time hospital records & departments"
                        badgeText="Live Sync"
                      />
                    )}
                    {!hasMore && hospitals.length > 0 && !isLoadingInitial && (
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-emerald-800 text-xs font-bold shadow-2xs animate-in fade-in duration-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>You have viewed all {totalHospitals || hospitals.length} registered hospitals</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center space-y-3 shadow-2xs">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">No Hospitals Found</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    No registered hospitals matched your search terms or active filter criteria. Try resetting your filters.
                  </p>
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Slide-over Filter Drawer */}
      {isFiltersSidebarOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Filter Hospitals</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFiltersSidebarOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <HospitalFiltersSidebar
                selectedCity={selectedCity}
                onSelectCity={setSelectedCity}
                distanceRadius={distanceRadius}
                onSelectDistance={setDistanceRadius}
                selectedTypes={selectedHospitalTypes}
                onToggleType={(type) => {
                  setSelectedHospitalTypes(
                    selectedHospitalTypes.includes(type)
                      ? selectedHospitalTypes.filter((t) => t !== type)
                      : [...selectedHospitalTypes, type]
                  )
                }}
                selectedDepartments={selectedDepartments}
                onToggleDepartment={(dept) => {
                  setSelectedDepartments(
                    selectedDepartments.includes(dept)
                      ? selectedDepartments.filter((d) => d !== dept)
                      : [...selectedDepartments, dept]
                  )
                }}
                selectedFacilities={selectedFacilities}
                onToggleFacility={(fac) => {
                  setSelectedFacilities(
                    selectedFacilities.includes(fac)
                      ? selectedFacilities.filter((f) => f !== fac)
                      : [...selectedFacilities, fac]
                  )
                }}
                minYear={minYear}
                maxYear={maxYear}
                onChangeYearRange={setYearRange}
                onClearAll={clearAllFilters}
              />
            </div>

            <div className="p-4 border-t border-slate-100 flex items-center gap-2">
              <button
                type="button"
                onClick={clearAllFilters}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={() => setIsFiltersSidebarOpen(false)}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 4. Mobile Bottom Tab Bar Navigation */}
      <SuperAdminMobileNav />
    </div>
  )
}

export default SuperAdminHospitalsPage