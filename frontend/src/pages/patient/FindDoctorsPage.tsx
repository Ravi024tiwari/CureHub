import { useState, useEffect, useRef, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { PatientHeader } from '@/components/patient/PatientHeader'
import { PatientSidebar } from '@/components/patient/PatientSidebar'
import { DoctorCard } from '@/components/patient/DoctorCard'
import { DoctorFiltersSidebar } from '@/components/patient/DoctorFiltersSidebar'
import { BookAppointmentModal } from '@/components/patient/BookAppointmentModal'
import { MobileBottomNav } from '@/components/patient/MobileBottomNav'
import type { DoctorCardData, AppointmentCardData } from '@/types/patient'

import {
  Search,
  MapPin,
  Filter,
  ArrowUpDown,
  Stethoscope,
  Heart,
  Sparkles,
  Baby,
  Activity,
  HeartPulse,
  Brain,
  X,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  Star,
  Zap,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { IndustrialSpinner } from '@/components/ui/IndustrialSpinner'
import heroDoctorImg from '@/assets/dr-priya-sharma.jpg'
import { useDoctorStore } from '@/store/doctorStore'

export const FindDoctorsPage: FC = () => {
  const navigate = useNavigate()

  // Layout State
  const [isSidebarDrawerOpen, setIsSidebarDrawerOpen] = useState(false)
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)

  // Live Database Doctor Store Integration
  const {
    doctors,
    totalDoctors,
    hasMore,
    isLoadingInitial,
    isLoadingMore,
    searchQuery,
    selectedCity,
    activeSpecialtyPill,
    selectedSpecializations,
    selectedHospitals,
    selectedConsultationType,
    selectedAvailability,
    maxFee,
    sortBy,
    setSearchQuery,
    setSelectedCity,
    setActiveSpecialtyPill,
    setSelectedSpecializations,
    setSelectedHospitals,
    setSelectedConsultationType,
    setSelectedAvailability,
    setMaxFee,
    setSortBy,
    clearFilters,
    toggleFavorite,
    fetchDoctors,
    fetchNextPage,
  } = useDoctorStore()

  // City Dropdown State
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false)
  const cityOptions = [
    'All Cities',
    'Bilaspur, Chhattisgarh',
    'Raipur, Chhattisgarh',
    'Delhi NCR',
    'Mumbai, Maharashtra',
    'Bengaluru, Karnataka',
  ]

  // Interactive Booking Modal
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<DoctorCardData | null>(null)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const observerTarget = useRef<HTMLDivElement>(null)

  const specialtyPills = [
    {
      id: 'all',
      label: 'All Specialists',
      icon: Stethoscope,
      doctorCount: totalDoctors || 52,
      color: 'text-blue-600',
      iconBg: 'bg-blue-100/80',
    },
    {
      id: 'General Physician',
      label: 'General Physician',
      icon: Stethoscope,
      doctorCount: 12,
      color: 'text-sky-600',
      iconBg: 'bg-sky-100/80',
    },
    {
      id: 'Cardiologist',
      label: 'Cardiologist',
      icon: Heart,
      doctorCount: 8,
      color: 'text-rose-600',
      iconBg: 'bg-rose-100/80',
    },
    {
      id: 'Dermatologist',
      label: 'Dermatologist',
      icon: Sparkles,
      doctorCount: 6,
      color: 'text-amber-600',
      iconBg: 'bg-amber-100/80',
    },
    {
      id: 'Pediatrician',
      label: 'Pediatrician',
      icon: Baby,
      doctorCount: 7,
      color: 'text-cyan-600',
      iconBg: 'bg-cyan-100/80',
    },
    {
      id: 'Orthopedist',
      label: 'Orthopedist',
      icon: Activity,
      doctorCount: 6,
      color: 'text-indigo-600',
      iconBg: 'bg-indigo-100/80',
    },
    {
      id: 'Gynecologist',
      label: 'Gynecologist',
      icon: HeartPulse,
      doctorCount: 5,
      color: 'text-pink-600',
      iconBg: 'bg-pink-100/80',
    },
    {
      id: 'Neurologist',
      label: 'Neurologist',
      icon: Brain,
      doctorCount: 4,
      color: 'text-purple-600',
      iconBg: 'bg-purple-100/80',
    },
  ]

  // Fetch doctors on mount & whenever filters change
  useEffect(() => {
    fetchDoctors(1, true)
  }, [
    activeSpecialtyPill,
    selectedSpecializations,
    selectedHospitals,
    selectedConsultationType,
    selectedAvailability,
    maxFee,
    sortBy,
  ])

  const isInitialSearch = useRef(true)

  // Debounced search query (skips initial mount)
  useEffect(() => {
    if (isInitialSearch.current) {
      isInitialSearch.current = false
      return
    }
    const timer = setTimeout(() => {
      fetchDoctors(1, true)
    }, 350)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Infinite Scroll IntersectionObserver with prefetch margin
  useEffect(() => {
    const target = observerTarget.current
    if (!target || !hasMore || isLoadingInitial || isLoadingMore || doctors.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore && hasMore && doctors.length > 0) {
          fetchNextPage()
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [hasMore, isLoadingMore, isLoadingInitial, doctors.length, fetchNextPage])

  const handleLoadMore = () => {
    fetchNextPage()
  }

  const handleClearFilters = () => {
    clearFilters()
  }

  const handleOpenBooking = (doc: DoctorCardData) => {
    setSelectedDoctorForBooking(doc)
    setIsBookingModalOpen(true)
  }

  const handleAppointmentBooked = (_newAppt: AppointmentCardData) => {
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
        {/* Slide-out Sidebar Drawer */}
        {isSidebarDrawerOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
              onClick={() => setIsSidebarDrawerOpen(false)}
            />
            <div className="relative z-10 animate-in slide-in-from-left duration-200">
              <PatientSidebar
                activeTab="doctors"
                onSelectTab={(tab) => {
                  if (tab === 'home') navigate('/patient/home')
                  if (tab === 'hospitals') navigate('/patient/hospitals')
                  setIsSidebarDrawerOpen(false)
                }}
                isMobileDrawer={true}
                onCloseDrawer={() => setIsSidebarDrawerOpen(false)}
                onOpenBookingModal={() => setIsBookingModalOpen(true)}
              />
            </div>
          </div>
        )}

        {/* Main Page Area */}
        <div className="flex-1 flex flex-col min-w-0 pb-28 md:pb-12">
          <main className="flex-1 w-full max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8 2xl:px-10 py-5 sm:py-7 space-y-6 sm:space-y-8">
            {/* Find Doctors Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-50/95 via-sky-50/80 to-indigo-50/85 border border-blue-100/90 p-6 sm:p-8 lg:p-10 shadow-sm">
              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="w-full lg:max-w-3xl xl:max-w-4xl space-y-4">
                  <div className="space-y-1.5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/80 border border-blue-200 text-blue-700 text-[11px] font-bold tracking-wide uppercase">
                      <Sparkles className="size-3" />
                      Verified Healthcare Directory
                    </span>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                      Find Doctors
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
                      Discover and book appointments with top-rated doctors from trusted hospitals across Bilaspur.
                    </p>
                  </div>

                  {/* Main Search Bar with Location Dropdown */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      fetchDoctors(1, true)
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
                          placeholder="Search doctor name, specialty, hospital..."
                          className="w-full py-2 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
                        />
                        {searchQuery && (
                          <button
                            type="button"
                            onClick={() => {
                              setSearchQuery('')
                              fetchDoctors(1, true)
                            }}
                            className="p-1 mr-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
                          >
                            <X className="size-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Location Selector with Dropdown */}
                      <div className="relative w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                          className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2 px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 shrink-0 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-1.5">
                            <MapPin className="size-3.5 text-blue-600 shrink-0" />
                            <span className="truncate max-w-[130px]">{selectedCity.split(',')[0]}</span>
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
                                {selectedCity === city && <Check className="size-3.5 text-blue-600" />}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Search Action CTA */}
                      <Button
                        type="submit"
                        className="w-full sm:w-auto px-6 py-2.5 h-11 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 active:scale-98 transition-all cursor-pointer shrink-0 flex items-center justify-center gap-1.5"
                      >
                        <Search className="size-4" />
                        <span>Search</span>
                      </Button>
                    </div>
                  </form>

                  {/* Quick Popular Specialty Filters */}
                  <div className="flex items-center gap-2 pt-1 flex-wrap text-xs text-slate-500">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      <Zap className="size-3 text-amber-500 fill-amber-500" />
                      Popular:
                    </span>
                    {['Cardiologist', 'Dermatologist', 'Pediatrician', 'Orthopedist'].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setActiveSpecialtyPill(tag)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                          activeSpecialtyPill === tag
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white/80 hover:bg-white text-slate-700 border-slate-200/80 hover:border-blue-300'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right Hero Visual with Glowing Halo & Floating Trust Badges */}
                <div className="relative shrink-0 hidden lg:block">
                  {/* Backdrop Glow Aura */}
                  <div className="absolute -inset-4 rounded-full bg-gradient-to-tr from-blue-200/50 via-sky-100/60 to-indigo-200/40 blur-2xl -z-10" />

                  {/* Top Floating Badge */}
                  <div className="absolute -top-3 -left-8 z-20 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="size-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <ShieldCheck className="size-4.5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Expert Care</p>
                      <p className="text-xs font-black text-slate-900 leading-tight">Verified Doctors</p>
                    </div>
                  </div>

                  {/* Doctor Image Presentation */}
                  <div className="size-48 sm:size-52 rounded-3xl overflow-hidden ring-4 ring-white shadow-2xl relative bg-blue-100">
                    <img
                      src={heroDoctorImg}
                      alt="Specialist Doctor"
                      className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Bottom Floating Rating Badge */}
                  <div className="absolute -bottom-3 -right-6 z-20 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="size-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                      <Star className="size-4 fill-amber-400 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900 leading-tight">4.9 / 5.0 Rating</p>
                      <p className="text-[10px] text-slate-400 font-medium">10,000+ Consultations</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Specialty Category Cards Row */}
              <div className="pt-6 mt-6 border-t border-blue-200/50 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-600 tracking-wide uppercase">
                    Browse by Specialization
                  </p>
                  <span className="text-[11px] font-semibold text-blue-600 bg-blue-100/70 px-2 py-0.5 rounded-full">
                    {totalDoctors} Specialists Available
                  </span>
                </div>

                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth py-1 snap-x">
                  {specialtyPills.map((pill) => {
                    const Icon = pill.icon
                    const isSelected = activeSpecialtyPill === pill.id

                    return (
                      <button
                        key={pill.id}
                        onClick={() => setActiveSpecialtyPill(pill.id)}
                        className={`group relative flex items-center gap-3 p-2.5 pr-4 rounded-2xl text-xs font-semibold transition-all duration-300 shrink-0 cursor-pointer snap-start ${
                          isSelected
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 scale-[1.02] border border-blue-500 ring-2 ring-blue-400/30'
                            : 'bg-white/90 hover:bg-white text-slate-700 border border-slate-200/90 hover:border-blue-300 shadow-2xs hover:shadow-md hover:-translate-y-0.5'
                        }`}
                      >
                        {/* Colored Icon Badge */}
                        <div
                          className={`size-9 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                            isSelected ? 'bg-white/20 text-white' : `${pill.iconBg} ${pill.color}`
                          }`}
                        >
                          <Icon className="size-4.5" />
                        </div>

                        {/* Title & Count */}
                        <div className="text-left">
                          <p className={`font-bold leading-tight ${isSelected ? 'text-white' : 'text-slate-900 group-hover:text-blue-600 transition-colors'}`}>
                            {pill.label}
                          </p>
                          <p className={`text-[10px] font-medium leading-none mt-0.5 ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                            {pill.doctorCount} Doctors
                          </p>
                        </div>

                        {/* Selected Indicator Dot */}
                        {isSelected && (
                          <div className="size-1.5 rounded-full bg-white animate-pulse ml-0.5" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Main Content: Left Filters + Right Doctors Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
              {/* Desktop Filters Sidebar (Col 3 on lg) */}
              <aside className="hidden lg:block lg:col-span-3 sticky top-20">
                <DoctorFiltersSidebar
                  selectedSpecializations={selectedSpecializations}
                  onToggleSpecialization={(spec) => {
                    setSelectedSpecializations(
                      selectedSpecializations.includes(spec)
                        ? selectedSpecializations.filter((s) => s !== spec)
                        : [...selectedSpecializations, spec]
                    )
                  }}
                  selectedHospitals={selectedHospitals}
                  onToggleHospital={(hosp) => {
                    setSelectedHospitals(
                      selectedHospitals.includes(hosp)
                        ? selectedHospitals.filter((h) => h !== hosp)
                        : [...selectedHospitals, hosp]
                    )
                  }}
                  selectedConsultationType={selectedConsultationType}
                  onSelectConsultationType={setSelectedConsultationType}
                  selectedAvailability={selectedAvailability}
                  onSelectAvailability={setSelectedAvailability}
                  maxFee={maxFee}
                  onChangeMaxFee={setMaxFee}
                  onClearAll={handleClearFilters}
                />
              </aside>

              {/* Right Doctors Area (Col 9 on lg) */}
              <div className="lg:col-span-9 space-y-5">
                {/* Results Header: Count + Sort Dropdown + Mobile Filter Toggle */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-slate-900">
                      Showing {doctors.length > 0 ? `1 - ${doctors.length}` : '0'} of {totalDoctors} doctors
                    </span>
                    {activeSpecialtyPill !== 'all' && (
                      <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                        {activeSpecialtyPill}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5">
                    {/* Mobile Filters Toggle Button */}
                    <button
                      onClick={() => setIsMobileFiltersOpen(true)}
                      className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <Filter className="size-3.5 text-blue-600" />
                      <span>Filters</span>
                    </button>

                    {/* Sort Dropdown */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-400 font-medium hidden sm:inline">Sort by</span>
                      <div className="relative flex items-center">
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="pl-2.5 pr-7 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer appearance-none"
                        >
                          <option value="relevance">Relevance</option>
                          <option value="rating">Rating: High to Low</option>
                          <option value="experience">Experience: Most Experienced</option>
                          <option value="fee_asc">Fees: Low to High</option>
                          <option value="fee_desc">Fees: High to Low</option>
                        </select>
                        <ArrowUpDown className="absolute right-2 size-3 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Doctors Grid: 1 col on mobile, 2 col on tablet/small-desktop, 3 col on large desktop */}
                {isLoadingInitial ? (
                  <div className="bg-gradient-to-b from-slate-50/90 via-white to-slate-50/90 rounded-3xl p-12 sm:p-16 border border-slate-200/80 text-center space-y-5 shadow-xs max-w-md mx-auto">
                    {/* Industrial Spoke Petal Spinner with Ground Mirror Reflection */}
                    <div className="py-2 flex justify-center">
                      <IndustrialSpinner
                        size="xl"
                        color="gray"
                        animationMode="chaser"
                        withReflection={true}
                        label="Loading verified doctors..."
                      />
                    </div>
                    <div className="space-y-1.5">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/70 text-slate-700 text-[11px] font-bold tracking-wide uppercase">
                        <span className="size-1.5 rounded-full bg-slate-600 animate-ping" />
                        <span>Medical Directory Sync</span>
                      </div>
                      <h4 className="text-base font-bold text-slate-800">Loading verified doctors...</h4>
                      <p className="text-xs text-slate-500 max-w-xs mx-auto">
                        Fetching registered healthcare specialists across all departments
                      </p>
                    </div>
                    <div className="w-48 h-1.5 bg-slate-200/80 rounded-full mx-auto overflow-hidden">
                      <div className="h-full bg-slate-700 rounded-full w-2/3 animate-[pulse_1.5s_ease-in-out_infinite]" />
                    </div>
                  </div>
                ) : doctors.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 border border-slate-200/80 text-center space-y-3">
                    <Stethoscope className="size-12 text-slate-300 mx-auto" />
                    <h3 className="text-base font-bold text-slate-900">No doctors found</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      No registered specialists matched your current filter or search criteria.
                    </p>
                    <Button
                      onClick={handleClearFilters}
                      variant="outline"
                      className="rounded-xl text-xs font-semibold text-blue-600 border-blue-200 hover:bg-blue-50 cursor-pointer"
                    >
                      Clear All Filters
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 min-[1680px]:grid-cols-4 gap-5 sm:gap-6">
                    {doctors.map((doctor) => (
                      <DoctorCard
                        key={doctor._id}
                        doctor={doctor}
                        onBookAppointment={handleOpenBooking}
                        onToggleFavorite={(id) => toggleFavorite(id)}
                      />
                    ))}

                    {/* Smooth Skeleton Cards while loading next batch (matches row width) */}
                    {isLoadingMore && (
                      <>
                        {[1, 2, 3, 4].map((idx) => (
                          <div
                            key={`scroll-skeleton-${idx}`}
                            className="bg-white rounded-3xl border border-slate-200/70 p-5 flex flex-col justify-between gap-4 animate-pulse shadow-2xs"
                          >
                            <div className="flex items-start gap-3.5">
                              <div className="size-18 rounded-2xl bg-slate-100 shrink-0" />
                              <div className="flex-1 space-y-2">
                                <div className="w-3/4 h-4.5 rounded-md bg-slate-200/80" />
                                <div className="w-1/2 h-3.5 rounded-md bg-slate-100" />
                                <div className="w-2/3 h-4 rounded-full bg-slate-100" />
                              </div>
                            </div>
                            <div className="space-y-2 pt-3 border-t border-slate-100">
                              <div className="w-5/6 h-3.5 rounded-md bg-slate-100" />
                              <div className="w-2/3 h-3 rounded-md bg-slate-100" />
                            </div>
                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                              <div className="w-20 h-5 rounded-md bg-slate-100" />
                              <div className="w-24 h-5 rounded-full bg-slate-100" />
                            </div>
                            <div className="w-full h-11 rounded-2xl bg-slate-200/60" />
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}

                {/* Bottom Section: Interactive Gray Color UI Load More & Industrial Spinner */}
                <div className="py-8 text-center space-y-4">
                  {/* Invisible sentinel for smooth auto-fetch when scrolling */}
                  {hasMore && !isLoadingInitial && doctors.length > 0 && (
                    <div ref={observerTarget} className="h-1 opacity-0 pointer-events-none" />
                  )}

                  {/* Interactive Production-Grade Load More Station with Industrial Spinning */}
                  {hasMore && !isLoadingInitial && (
                    <div className="bg-gradient-to-b from-slate-50/90 via-slate-100/60 to-slate-50/90 border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all duration-300 max-w-lg mx-auto space-y-4 animate-in fade-in duration-300">
                      {/* Directory Progress Metric */}
                      <div className="space-y-2 flex flex-col items-center">
                        <div className="flex items-center justify-between w-full max-w-xs text-xs font-semibold text-slate-500 px-1">
                          <span>Directory Progress</span>
                          <span className="font-bold text-slate-800">
                            {doctors.length} / {totalDoctors}
                          </span>
                        </div>
                        {totalDoctors > 0 && (
                          <div className="w-full max-w-xs h-2 rounded-full bg-slate-200/90 overflow-hidden shadow-inner">
                            <div
                              className="h-full bg-gradient-to-r from-slate-600 via-slate-700 to-slate-800 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, Math.round((doctors.length / totalDoctors) * 100))}%` }}
                            />
                          </div>
                        )}
                        <p className="text-[11px] text-slate-400 font-medium">
                          Scroll naturally or click below to load the next 10 specialists
                        </p>
                      </div>

                      {/* Interactive Button / Active Spinning State */}
                      {isLoadingMore ? (
                        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm flex flex-col items-center justify-center gap-3 animate-in fade-in zoom-in-95 duration-200">
                          {/* Industrial Spoke Petal Spinner with Mirror Reflection */}
                          <div className="py-1">
                            <IndustrialSpinner
                              size="lg"
                              color="gray"
                              animationMode="chaser"
                              withReflection={true}
                              label="Fetching next batch of doctors..."
                            />
                          </div>
                          <div className="space-y-0.5">
                            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800">
                              <span className="size-1.5 rounded-full bg-slate-600 animate-ping" />
                              <span>Loading Verified Specialists...</span>
                            </div>
                            <p className="text-[11px] text-slate-400">
                              Fetching doctors {doctors.length + 1} to {Math.min(doctors.length + 10, totalDoctors)} from server
                            </p>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={handleLoadMore}
                          className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-2xl font-bold text-xs sm:text-sm cursor-pointer active:scale-95 transition-all duration-300 bg-white hover:bg-slate-900 text-slate-800 hover:text-white border-2 border-slate-200 hover:border-slate-900 shadow-sm hover:shadow-xl hover:shadow-slate-900/15 hover:-translate-y-0.5"
                        >
                          {/* Mini Industrial Spoke Preview inside button */}
                          <div className="size-6 rounded-lg bg-slate-100 group-hover:bg-white/20 text-slate-700 group-hover:text-white flex items-center justify-center transition-colors">
                            <ChevronDown className="size-3.5 group-hover:translate-y-0.5 transition-transform duration-300" />
                          </div>
                          <span>Load Next 10 Doctors</span>
                          {totalDoctors > doctors.length && (
                            <span className="px-2.5 py-0.5 rounded-md bg-slate-100 group-hover:bg-white/20 text-slate-600 group-hover:text-slate-200 text-[11px] font-bold transition-colors">
                              +{Math.min(10, totalDoctors - doctors.length)} more
                            </span>
                          )}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Clean Non-Buffering Completion Badge when all doctors are loaded */}
                  {!hasMore && doctors.length > 0 && !isLoadingInitial && (
                    <div className="flex flex-col items-center justify-center gap-2 py-4 animate-in fade-in duration-300">
                      <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-xs">
                        <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                        <span>All {doctors.length} verified doctors loaded</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium">
                        Showing all {doctors.length} available specialists matching your criteria.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Sticky Bottom Nav */}
      <MobileBottomNav
        activeTab="doctors"
        onSelectTab={(tab) => {
          if (tab === 'home') navigate('/patient/home')
        }}
      />

      {/* Mobile Filters Slide-out Modal */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl p-5 space-y-4 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Filter Specialists</h3>
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="size-5" />
              </button>
            </div>

            <DoctorFiltersSidebar
              selectedSpecializations={selectedSpecializations}
              onToggleSpecialization={(spec) => {
                setSelectedSpecializations(
                  selectedSpecializations.includes(spec)
                    ? selectedSpecializations.filter((s) => s !== spec)
                    : [...selectedSpecializations, spec]
                )
              }}
              selectedHospitals={selectedHospitals}
              onToggleHospital={(hosp) => {
                setSelectedHospitals(
                  selectedHospitals.includes(hosp)
                    ? selectedHospitals.filter((h) => h !== hosp)
                    : [...selectedHospitals, hosp]
                )
              }}
              selectedConsultationType={selectedConsultationType}
              onSelectConsultationType={setSelectedConsultationType}
              selectedAvailability={selectedAvailability}
              onSelectAvailability={setSelectedAvailability}
              maxFee={maxFee}
              onChangeMaxFee={setMaxFee}
              onClearAll={handleClearFilters}
            />

            <Button
              onClick={() => setIsMobileFiltersOpen(false)}
              className="w-full h-11 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer"
            >
              Apply Filters ({doctors.length} Doctors)
            </Button>
          </div>
        </div>
      )}

      {/* 3-Step Appointment Booking Modal */}
      <BookAppointmentModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        preselectedDoctor={selectedDoctorForBooking}
        doctorsList={doctors}
        onAppointmentBooked={handleAppointmentBooked}
      />

      {/* Mobile Sticky Bottom Navigation */}
      <MobileBottomNav
        activeTab="doctors"
        onSelectTab={(tab) => {
          if (tab === 'home') navigate('/patient/home')
          if (tab === 'doctors') navigate('/patient/doctors')
          if (tab === 'hospitals') navigate('/patient/hospitals')
          if (tab === 'profile') setIsSidebarDrawerOpen(true)
        }}
      />
    </div>
  )
}

export default FindDoctorsPage
