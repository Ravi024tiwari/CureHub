import { useState, useEffect, useRef, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { PatientHeader } from '@/components/patient/PatientHeader'
import { PatientSidebar } from '@/components/patient/PatientSidebar'
import { HospitalCard } from '@/components/patient/HospitalCard'
import { HospitalFiltersSidebar } from '@/components/patient/HospitalFiltersSidebar'
import { HospitalDetailView } from '@/components/patient/HospitalDetailView'
import { BookAppointmentModal } from '@/components/patient/BookAppointmentModal'
import { MobileBottomNav } from '@/components/patient/MobileBottomNav'
import { IndustrialSpinner } from '@/components/ui/IndustrialSpinner'
import { Button } from '@/components/ui/button'
import { useHospitalStore } from '@/store/hospitalStore'
import { useDoctorStore } from '@/store/doctorStore'
import type { HospitalCardData, DoctorCardData, AppointmentCardData } from '@/types/patient'

import {
  Search,
  MapPin,
  Filter,
  ArrowUpDown,
  Building2,
  Clock,
  Activity,
  Heart,
  Baby,
  Sparkles,
  ShieldCheck,
  Check,
  ChevronDown,
  X,
  CheckCircle2,
} from 'lucide-react'

import hospitalHeroImg from '@/assets/apollo-hospital.jpg'

export const FindHospitalsPage: FC = () => {
  const navigate = useNavigate()

  // Layout State
  const [isSidebarDrawerOpen, setIsSidebarDrawerOpen] = useState(false)
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false)

  // Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [preselectedHospital, setPreselectedHospital] = useState<HospitalCardData | null>(null)
  const [preselectedDoctor, setPreselectedDoctor] = useState<DoctorCardData | null>(null)

  // Doctor Store
  const { doctors } = useDoctorStore()

  // Live Hospital Store
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

  // Quick category pills matching mockup
  const quickPills = [
    { id: 'all', label: 'All Hospitals', icon: Building2 },
    { id: 'emergency', label: '24x7 Emergency', icon: Clock },
    { id: 'multi-speciality', label: 'Multi-Speciality', icon: ShieldCheck },
    { id: 'Cardiology', label: 'Cardiology', icon: Heart },
    { id: 'Orthopedics', label: 'Orthopedics', icon: Activity },
    { id: 'Pediatrics', label: 'Pediatrics', icon: Baby },
    { id: 'Gynecology', label: 'Gynecology', icon: Heart },
    { id: 'Dermatology', label: 'Dermatology', icon: Sparkles },
  ]

  // Fetch hospitals on initial mount and when filters change
  useEffect(() => {
    fetchHospitals(1, true)
  }, [
    selectedCity,
    activeQuickPill,
    selectedHospitalTypes,
    selectedDepartments,
    selectedFacilities,
    sortBy,
    minYear,
    maxYear,
  ])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchHospitals(1, true)
    }, 350)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Infinite Scroll IntersectionObserver with prefetch margin
  useEffect(() => {
    const target = observerTarget.current
    if (!target || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore && hasMore) {
          fetchNextPage()
        }
      },
      { threshold: 0.1, rootMargin: '300px' }
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [hasMore, isLoadingMore, fetchNextPage])

  const handleOpenBooking = (hospital: HospitalCardData, doctor?: DoctorCardData) => {
    setPreselectedHospital(hospital)
    if (doctor) setPreselectedDoctor(doctor)
    setIsBookingModalOpen(true)
  }

  const handleAppointmentBooked = (_appt: AppointmentCardData) => {
    setIsBookingModalOpen(false)
    alert(`Appointment successfully booked! You can view it in your dashboard.`)
  }

  return (
    <div className="min-h-screen bg-[#f8fbff] text-slate-900 selection:bg-blue-100 selection:text-blue-700 flex flex-col antialiased">
      {/* Top Header */}
      <PatientHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCity={selectedCity}
        onSelectCity={setSelectedCity}
        onToggleSidebar={() => setIsSidebarDrawerOpen(!isSidebarDrawerOpen)}
      />

      <div className="flex-1 flex w-full">
        {/* Slide-out Sidebar Drawer for Mobile & Desktop Drawer */}
        {isSidebarDrawerOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
              onClick={() => setIsSidebarDrawerOpen(false)}
            />
            <div className="relative z-10 animate-in slide-in-from-left duration-200">
              <PatientSidebar
                activeTab="hospitals"
                onSelectTab={(tab) => {
                  if (tab === 'home') navigate('/patient/home')
                  if (tab === 'doctors') navigate('/patient/doctors')
                  setIsSidebarDrawerOpen(false)
                }}
                isMobileDrawer={true}
                onCloseDrawer={() => setIsSidebarDrawerOpen(false)}
                onOpenBookingModal={() => setIsBookingModalOpen(true)}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 pb-28 md:pb-12">
          <main className="flex-1 w-full max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8 2xl:px-10 py-5 sm:py-7 space-y-6 sm:space-y-8">
            {/* If a Hospital is Selected for Detail View, render Detail Page */}
            {selectedHospital ? (
              <HospitalDetailView
                hospital={selectedHospital}
                onBack={() => setSelectedHospital(null)}
                onBookAppointment={handleOpenBooking}
              />
            ) : (
              <>
                {/* 1. HERO SECTION ("Find Trusted Hospitals") */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-50/95 via-sky-50/80 to-indigo-50/85 border border-blue-100/90 p-6 sm:p-8 lg:p-10 shadow-sm">
                  <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                    {/* Left Title & Search Form */}
                    <div className="w-full lg:max-w-3xl xl:max-w-4xl space-y-4">
                      <div className="space-y-1.5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/80 border border-blue-200 text-blue-700 text-[11px] font-bold tracking-wide uppercase">
                          <ShieldCheck className="size-3.5" />
                          Verified Healthcare Network
                        </span>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                          Find Trusted <span className="text-blue-600">Hospitals</span>
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
                          Discover verified hospitals, compare facilities and book appointments for quality healthcare across Chhattisgarh and top metropolitan centers.
                        </p>
                      </div>

                      {/* Main Search Bar with Location Dropdown */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          fetchHospitals()
                        }}
                        className="pt-1 relative"
                      >
                        <div className="bg-white p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-200/90 flex flex-col sm:flex-row items-center gap-2 sm:gap-3 transition-all focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100">
                          {/* Search Input */}
                          <div className="relative flex-1 w-full flex items-center">
                            <Search className="size-4.5 text-blue-600 shrink-0 ml-3 mr-2.5" />
                            <input
                              type="text"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder="Search hospital name, city, department..."
                              className="w-full py-2 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
                            />
                            {searchQuery && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSearchQuery('')
                                  fetchHospitals()
                                }}
                                className="p-1 mr-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
                              >
                                <X className="size-3.5" />
                              </button>
                            )}
                          </div>

                          {/* Location Dropdown */}
                          <div className="relative w-full sm:w-auto">
                            <button
                              type="button"
                              onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                              className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2 px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 shrink-0 transition-colors cursor-pointer"
                            >
                              <div className="flex items-center gap-1.5">
                                <MapPin className="size-3.5 text-blue-600 shrink-0" />
                                <span className="truncate max-w-[130px]">
                                  {selectedCity.split(',')[0]}
                                </span>
                              </div>
                              <ChevronDown className="size-3 text-slate-400" />
                            </button>

                            {isCityDropdownOpen && (
                              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 z-50 animate-in fade-in zoom-in-95">
                                <p className="text-[10px] font-bold text-slate-400 px-3 py-1.5 uppercase tracking-wider">
                                  Select City
                                </p>
                                {cityOptions.map((city) => (
                                  <button
                                    key={city}
                                    type="button"
                                    onClick={() => {
                                      setSelectedCity(city)
                                      setIsCityDropdownOpen(false)
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer ${
                                      selectedCity === city
                                        ? 'bg-blue-50 text-blue-700 font-bold'
                                        : 'text-slate-700 hover:bg-slate-50'
                                    }`}
                                  >
                                    <span>{city}</span>
                                    {selectedCity === city && (
                                      <Check className="size-3.5 text-blue-600" />
                                    )}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Search Button */}
                          <Button
                            type="submit"
                            className="w-full sm:w-auto px-7 py-2.5 h-11 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 active:scale-98 transition-all cursor-pointer shrink-0 flex items-center justify-center gap-1.5"
                          >
                            <Search className="size-4" />
                            <span>Search</span>
                          </Button>
                        </div>
                      </form>
                    </div>

                    {/* Right Visual Image */}
                    <div className="relative shrink-0 hidden lg:block">
                      <div className="absolute -inset-4 rounded-full bg-gradient-to-tr from-blue-200/50 via-sky-100/60 to-indigo-200/40 blur-2xl -z-10" />
                      <div className="size-48 sm:size-52 rounded-3xl overflow-hidden ring-4 ring-white shadow-2xl relative bg-blue-100">
                        <img
                          src={hospitalHeroImg}
                          alt="Hospital Network"
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quick Specialty / Category Filter Pills matching mockup */}
                  <div className="pt-6 mt-6 border-t border-blue-200/50">
                    <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar scroll-smooth py-1">
                      {quickPills.map((pill) => {
                        const Icon = pill.icon
                        const isSelected = activeQuickPill === pill.id

                        return (
                          <button
                            key={pill.id}
                            type="button"
                            onClick={() => setActiveQuickPill(pill.id)}
                            className={`group relative flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all duration-300 shrink-0 cursor-pointer ${
                              isSelected
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 scale-[1.02] border border-blue-500 ring-2 ring-blue-400/30'
                                : 'bg-white/90 hover:bg-white text-slate-700 border border-slate-200/90 hover:border-blue-300 shadow-2xs hover:shadow-xs hover:-translate-y-0.5'
                            }`}
                          >
                            <Icon className={`size-4 ${isSelected ? 'text-white' : 'text-blue-600'}`} />
                            <span>{pill.label}</span>
                            {isSelected && (
                              <div className="size-1.5 rounded-full bg-white animate-pulse" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* 2. MAIN 2-COLUMN LAYOUT: Filters Sidebar (Col 3) + Hospital Cards Grid (Col 9) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
                  {/* Desktop Filters Sidebar */}
                  <aside className="hidden lg:block lg:col-span-3 sticky top-20">
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
                  </aside>

                  {/* Right Hospitals Area */}
                  <div className="lg:col-span-9 space-y-5">
                    {/* Results Top Status Bar: Count + Sort + Mobile Filter Toggle */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-slate-900">
                          Showing {hospitals.length > 0 ? `1 - ${hospitals.length}` : '0'} of {totalHospitals} hospitals
                        </span>
                        {activeQuickPill !== 'all' && (
                          <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                            {activeQuickPill}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2.5">
                        {/* Mobile Filter Toggle Button */}
                        <button
                          type="button"
                          onClick={() => setIsMobileFiltersOpen(true)}
                          className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <Filter className="size-3.5 text-blue-600" />
                          <span>Filters</span>
                        </button>

                        {/* Sort Dropdown */}
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-slate-400 font-medium hidden sm:inline">
                            Sort by:
                          </span>
                          <div className="relative">
                            <select
                              value={sortBy}
                              onChange={(e) => setSortBy(e.target.value)}
                              className="pl-2.5 pr-7 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 font-semibold text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer appearance-none"
                            >
                              <option value="relevance">Relevance</option>
                              <option value="rating">Rating (High to Low)</option>
                              <option value="beds">Most Beds</option>
                              <option value="name">Hospital Name (A-Z)</option>
                            </select>
                            <ArrowUpDown className="absolute right-2 top-1/2 -translate-y-1/2 size-3 text-slate-400 pointer-events-none" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Hospitals Cards Grid */}
                    {isLoadingInitial ? (
                      <div className="bg-gradient-to-b from-slate-50/90 via-white to-slate-50/90 rounded-3xl p-14 sm:p-16 border border-slate-200/80 text-center space-y-4 shadow-xs max-w-md mx-auto">
                        <div className="py-2 flex justify-center">
                          <IndustrialSpinner
                            size="xl"
                            color="brand"
                            animationMode="chaser"
                            withReflection={true}
                            label="Loading verified hospitals..."
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold tracking-wide uppercase">
                            <span className="size-1.5 rounded-full bg-blue-600 animate-ping" />
                            <span>Facility Registry Sync</span>
                          </div>
                          <h4 className="text-base font-bold text-slate-900">Loading verified hospitals...</h4>
                          <p className="text-xs text-slate-500 max-w-xs mx-auto">
                            Fetching accredited healthcare facilities and partner hospitals
                          </p>
                        </div>
                      </div>
                    ) : hospitals.length === 0 ? (
                      <div className="bg-white rounded-3xl p-14 border border-slate-200/80 text-center space-y-3">
                        <Building2 className="size-12 text-slate-300 mx-auto" />
                        <h3 className="text-base font-bold text-slate-900">No hospitals found</h3>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                          No authorized healthcare facilities matched your selected filters. Try clearing filters or searching for another city.
                        </p>
                        <Button
                          onClick={clearAllFilters}
                          variant="outline"
                          className="rounded-xl text-xs font-semibold text-blue-600 border-blue-200 hover:bg-blue-50 cursor-pointer"
                        >
                          Clear All Filters
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 min-[1680px]:grid-cols-4 gap-5 sm:gap-6">
                          {hospitals.map((hospital) => (
                            <HospitalCard
                              key={hospital._id}
                              hospital={hospital}
                              onViewDetails={(h) => setSelectedHospital(h)}
                              onBookAppointment={(h) => handleOpenBooking(h)}
                              onToggleFavorite={(id) => toggleFavoriteHospital(id)}
                            />
                          ))}

                          {/* Smooth Skeleton Cards while loading next batch */}
                          {isLoadingMore && (
                            <>
                              {[1, 2, 3].map((idx) => (
                                <div
                                  key={`scroll-hosp-skeleton-${idx}`}
                                  className="bg-white rounded-3xl border border-slate-200/70 overflow-hidden flex flex-col justify-between animate-pulse shadow-2xs"
                                >
                                  <div className="h-48 bg-slate-200/80 w-full" />
                                  <div className="p-5 space-y-4">
                                    <div className="space-y-2">
                                      <div className="w-3/4 h-5 rounded-md bg-slate-200" />
                                      <div className="w-1/2 h-3.5 rounded-md bg-slate-100" />
                                    </div>
                                    <div className="flex gap-2">
                                      <div className="w-16 h-4 rounded-md bg-slate-100" />
                                      <div className="w-20 h-4 rounded-md bg-slate-100" />
                                    </div>
                                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                      <div className="w-24 h-4 rounded-md bg-slate-100" />
                                      <div className="w-20 h-8 rounded-xl bg-slate-200" />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </>
                          )}
                        </div>

                        {/* Bottom Section: Infinite Scroll Sentinel, Progress & Load More Station */}
                        <div className="pt-4 pb-8 text-center space-y-4">
                          {/* Invisible sentinel for smooth auto-fetch when scrolling */}
                          {hasMore && !isLoadingInitial && (
                            <div ref={observerTarget} className="h-1 opacity-0 pointer-events-none" />
                          )}

                          {/* Interactive Production-Grade Load More Station */}
                          {hasMore && !isLoadingInitial && (
                            <div className="bg-gradient-to-b from-slate-50/90 via-slate-100/60 to-slate-50/90 border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all duration-300 max-w-lg mx-auto space-y-4 animate-in fade-in duration-300">
                              <div className="space-y-2 flex flex-col items-center">
                                <div className="flex items-center justify-between w-full max-w-xs text-xs font-semibold text-slate-500 px-1">
                                  <span>Directory Progress</span>
                                  <span className="font-bold text-slate-800">
                                    {hospitals.length} / {totalHospitals}
                                  </span>
                                </div>
                                {totalHospitals > 0 && (
                                  <div className="w-full max-w-xs h-2 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-blue-600 transition-all duration-500 rounded-full"
                                      style={{
                                        width: `${Math.min(100, Math.round((hospitals.length / totalHospitals) * 100))}%`,
                                      }}
                                    />
                                  </div>
                                )}
                                <span className="text-[11px] text-slate-400">
                                  Scroll down to seamlessly load more partner hospitals
                                </span>
                              </div>

                              <Button
                                onClick={() => fetchNextPage()}
                                disabled={isLoadingMore}
                                className="w-full sm:w-auto px-6 h-11 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer inline-flex items-center justify-center gap-2"
                              >
                                {isLoadingMore ? (
                                  <>
                                    <IndustrialSpinner size="sm" color="white" />
                                    <span>Retrieving Hospital Profiles...</span>
                                  </>
                                ) : (
                                  <>
                                    <span>Load Next Hospitals ({Math.max(0, totalHospitals - hospitals.length)} remaining)</span>
                                  </>
                                )}
                              </Button>
                            </div>
                          )}

                          {/* End of Directory indicator when all hospitals have loaded */}
                          {!hasMore && hospitals.length > 0 && !isLoadingInitial && (
                            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-slate-100/90 border border-slate-200/80 text-xs font-semibold text-slate-600">
                              <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                              <span>You have viewed all {totalHospitals} accredited hospitals in this directory</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Slide-over Drawer */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileFiltersOpen(false)}
          />
          <div className="relative z-10 w-full max-w-xs bg-white h-full shadow-2xl flex flex-col p-4 animate-in slide-in-from-right duration-200 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <span className="font-extrabold text-slate-900 text-sm">Hospital Filters</span>
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="size-4" />
              </button>
            </div>
            <HospitalFiltersSidebar
              selectedCity={selectedCity}
              onSelectCity={setSelectedCity}
              distanceRadius={distanceRadius}
              onSelectDistance={setDistanceRadius}
              selectedTypes={selectedHospitalTypes}
              onToggleType={(t) =>
                setSelectedHospitalTypes(
                  selectedHospitalTypes.includes(t)
                    ? selectedHospitalTypes.filter((x) => x !== t)
                    : [...selectedHospitalTypes, t]
                )
              }
              selectedDepartments={selectedDepartments}
              onToggleDepartment={(d) =>
                setSelectedDepartments(
                  selectedDepartments.includes(d)
                    ? selectedDepartments.filter((x) => x !== d)
                    : [...selectedDepartments, d]
                )
              }
              selectedFacilities={selectedFacilities}
              onToggleFacility={(f) =>
                setSelectedFacilities(
                  selectedFacilities.includes(f)
                    ? selectedFacilities.filter((x) => x !== f)
                    : [...selectedFacilities, f]
                )
              }
              minYear={minYear}
              maxYear={maxYear}
              onChangeYearRange={setYearRange}
              onClearAll={clearAllFilters}
            />
            <div className="pt-4 mt-auto">
              <Button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="w-full bg-blue-600 text-white font-bold text-xs rounded-xl h-10"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Appointment Modal */}
      {isBookingModalOpen && (
        <BookAppointmentModal
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false)
            setPreselectedDoctor(null)
            setPreselectedHospital(null)
          }}
          preselectedHospital={preselectedHospital}
          preselectedDoctor={preselectedDoctor}
          doctorsList={preselectedDoctor ? [preselectedDoctor] : doctors}
          onAppointmentBooked={handleAppointmentBooked}
        />
      )}

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab="hospitals"
        onSelectTab={(tab) => {
          if (tab === 'home') navigate('/patient/home')
          if (tab === 'doctors') navigate('/patient/doctors')
          if (tab === 'hospitals') navigate('/patient/hospitals')
          if (tab === 'profile') alert('Profile section active')
        }}
      />
    </div>
  )
}
