import { useEffect, useRef, useState, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Filter,
  Plus,
  Calendar,
  CheckCircle2,
  X,
  LayoutGrid,
  List,
  Clock,
  CalendarDays,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { IndustrialSpinner } from '@/components/ui/IndustrialSpinner'
import { PatientHeader } from '@/components/patient/PatientHeader'
import { PatientSidebar } from '@/components/patient/PatientSidebar'
import { MobileBottomNav } from '@/components/patient/MobileBottomNav'
import { AppointmentCard } from '@/components/patient/AppointmentCard'
import { AppointmentDetailView } from '@/components/patient/AppointmentDetailView'
import { AppointmentFiltersDrawer } from '@/components/patient/AppointmentFiltersDrawer'
import { CancelAppointmentModal } from '@/components/patient/CancelAppointmentModal'
import { RescheduleAppointmentModal } from '@/components/patient/RescheduleAppointmentModal'
import { BookAppointmentModal } from '@/components/patient/BookAppointmentModal'
import { WriteReviewModal } from '@/components/patient/appointments/WriteReviewModal'
import { useAppointmentStore } from '@/store/appointmentStore'
import { useDoctorStore } from '@/store/doctorStore'
import type { AppointmentCardData, AppointmentFilterTab } from '@/types/patient'

export const PatientAppointmentsPage: FC = () => {
  const navigate = useNavigate()

  // Layout State
  const [isSidebarDrawerOpen, setIsSidebarDrawerOpen] = useState(false)
  const [isFiltersDrawerOpen, setIsFiltersDrawerOpen] = useState(false)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<any>(null)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [reviewTargetAppointment, setReviewTargetAppointment] = useState<AppointmentCardData | null>(null)

  const handleOpenReviewModal = (appt: AppointmentCardData) => {
    setReviewTargetAppointment(appt)
    setIsReviewModalOpen(true)
  }

  const handleReviewSubmitted = (updatedAppt: AppointmentCardData) => {
    updateAppointmentLocally(updatedAppt)
    if (selectedAppointment?._id === updatedAppt._id) {
      setSelectedAppointment(updatedAppt)
    }
  }

  // Live Appointment Store
  const {
    appointments,
    totalAppointments,
    hasMore,
    isLoadingInitial,
    isLoadingMore,
    counts,
    activeTab,
    searchQuery,
    selectedSpecialty,
    selectedHospital,
    selectedType,
    dateRange,
    selectedAppointment,
    viewMode,
    isCancelModalOpen,
    isRescheduleModalOpen,
    appointmentToCancel,
    appointmentToReschedule,
    setActiveTab,
    setSearchQuery,
    setSelectedSpecialty,
    setSelectedHospital,
    setSelectedType,
    setDateRange,
    setSelectedAppointment,
    setViewMode,
    clearAllFilters,
    openCancelModal,
    closeCancelModal,
    openRescheduleModal,
    closeRescheduleModal,
    fetchAppointments,
    fetchNextPage,
    handleCancelAppointment,
    handleRescheduleAppointment,
    downloadPrescriptionPdf,
    updateAppointmentLocally,
  } = useAppointmentStore()

  const { doctors } = useDoctorStore()
  const observerTarget = useRef<HTMLDivElement>(null)

  // Fetch initial appointments on page mount
  useEffect(() => {
    fetchAppointments(true)
  }, [fetchAppointments])

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

  const handleBookAgain = (appointment: AppointmentCardData) => {
    const matchedDoctor = doctors.find(
      (d) => d._id === appointment.doctorId || d.name === appointment.doctorName
    )
    setSelectedDoctorForBooking(
      matchedDoctor || {
        _id: appointment.doctorId || 'doc-1',
        name: appointment.doctorName,
        specialty: appointment.doctorSpecialty,
        hospitalName: appointment.hospitalName,
        rating: appointment.doctorRating || 4.8,
        reviewCount: appointment.doctorReviewCount || 320,
        experienceYears: 8,
      }
    )
    setIsBookingModalOpen(true)
  }

  const handleAppointmentBooked = (_newAppt: AppointmentCardData) => {
    setIsBookingModalOpen(false)
    fetchAppointments(true)
  }

  return (
    <div className="min-h-screen bg-[#f8fbff] text-slate-900 selection:bg-blue-100 selection:text-blue-700 flex flex-col antialiased">
      {/* Top Header */}
      <PatientHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCity="Bilaspur, Chhattisgarh"
        onSelectCity={() => {}}
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
                activeTab="appointments"
                onSelectTab={(tab) => {
                  if (tab === 'home') navigate('/patient/home')
                  if (tab === 'doctors') navigate('/patient/doctors')
                  if (tab === 'hospitals') navigate('/patient/hospitals')
                  if (tab === 'appointments') setSelectedAppointment(null)
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
          <main className="flex-1 w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10 py-4 sm:py-7 space-y-5 sm:space-y-7">
            {/* If an appointment is selected, render the full Detail View */}
            {selectedAppointment ? (
              <AppointmentDetailView
                appointment={selectedAppointment}
                onBack={() => setSelectedAppointment(null)}
                onReschedule={(appt) => openRescheduleModal(appt)}
                onCancel={(appt) => openCancelModal(appt)}
                onDownloadPrescription={(appt) => downloadPrescriptionPdf(appt)}
                onBookAgain={handleBookAgain}
                onWriteReview={handleOpenReviewModal}
                onPayNow={(appt) => {
                  alert(
                    `Redirecting to secure Razorpay checkout for ${appt.appointmentNumber} (₹${appt.consultationFee || 700})...`
                  )
                }}
              />
            ) : (
              <>
                {/* 1. Header & Book CTA */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4 border-b border-slate-200/80 pb-4 sm:pb-5">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200/80 text-[11px] font-bold text-blue-700">
                      <Sparkles className="size-3 text-blue-600" />
                      <span>CarePlus Patient Dashboard</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                      My Appointments
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium">
                      View and manage all your appointments, check status, access prescriptions and
                      more.
                    </p>
                  </div>

                  <Button
                    onClick={() => {
                      setSelectedDoctorForBooking(null)
                      setIsBookingModalOpen(true)
                    }}
                    className="w-full sm:w-auto h-11 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer inline-flex items-center justify-center gap-2"
                  >
                    <Plus className="size-4 stroke-[3]" />
                    <span>Book New Appointment</span>
                  </Button>
                </div>

                {/* 2. Large Screens KPI Stat Summary Ribbon (Clickable filters) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {[
                    {
                      id: 'all',
                      title: 'Total Appointments',
                      count: counts.all,
                      subtitle: 'Overall visit record',
                      icon: CalendarDays,
                      color: 'text-blue-600',
                      badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
                      activeBorder: 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/40',
                    },
                    {
                      id: 'upcoming',
                      title: 'Upcoming Visits',
                      count: counts.upcoming,
                      subtitle: 'Confirmed & scheduled',
                      icon: Clock,
                      color: 'text-emerald-600',
                      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                      activeBorder: 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/40',
                    },
                    {
                      id: 'completed',
                      title: 'Completed Care',
                      count: counts.completed,
                      subtitle: 'Prescriptions ready',
                      icon: CheckCircle2,
                      color: 'text-teal-600',
                      badgeBg: 'bg-teal-50 text-teal-700 border-teal-200',
                      activeBorder: 'border-teal-500 ring-2 ring-teal-500/20 bg-teal-50/40',
                    },
                    {
                      id: 'cancelled',
                      title: 'Cancelled Records',
                      count: counts.cancelled,
                      subtitle: 'Voided consultations',
                      icon: X,
                      color: 'text-rose-600',
                      badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
                      activeBorder: 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/40',
                    },
                  ].map((kpi) => {
                    const isCurrent = activeTab === kpi.id
                    const IconComponent = kpi.icon
                    return (
                      <button
                        key={kpi.id}
                        type="button"
                        onClick={() => setActiveTab(kpi.id as AppointmentFilterTab)}
                        className={`text-left p-3.5 sm:p-4.5 rounded-2xl sm:rounded-3xl border transition-all duration-200 cursor-pointer group shadow-2xs hover:shadow-md ${
                          isCurrent
                            ? `${kpi.activeBorder} shadow-xs`
                            : 'bg-white border-slate-200/90 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                            {kpi.title}
                          </span>
                          <div
                            className={`size-7 sm:size-8 rounded-xl flex items-center justify-center shrink-0 ${
                              isCurrent ? 'bg-white shadow-xs' : 'bg-slate-100/80 group-hover:bg-slate-200/60'
                            }`}
                          >
                            <IconComponent className={`size-3.5 sm:size-4 ${kpi.color}`} />
                          </div>
                        </div>

                        <div className="mt-2 sm:mt-3 flex items-baseline gap-2">
                          <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                            {kpi.count}
                          </span>
                          <span className="text-[11px] font-medium text-slate-400 truncate">
                            {kpi.subtitle}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* 3. Filter Tabs, View Switcher & Search Bar */}
                <div className="flex flex-col gap-3 sm:gap-4">
                  {/* Category Status Tabs (Pills) */}
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                    {[
                      { id: 'all', label: 'All', count: counts.all },
                      { id: 'upcoming', label: 'Upcoming', count: counts.upcoming },
                      { id: 'completed', label: 'Completed', count: counts.completed },
                      { id: 'cancelled', label: 'Cancelled', count: counts.cancelled },
                    ].map((tab) => {
                      const isSelected = activeTab === tab.id
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveTab(tab.id as AppointmentFilterTab)}
                          className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 sm:gap-2 shrink-0 ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-white border border-slate-200/90 text-slate-700 hover:border-blue-300 hover:bg-slate-50'
                          }`}
                        >
                          <span>{tab.label}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                              isSelected
                                ? 'bg-white/25 text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {tab.count}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Search Bar & Controls: Mobile Stacked & Desktop Inline */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 w-full">
                    {/* Search Input - Full width on mobile, bounded on tablet/desktop */}
                    <div className="relative flex-1 sm:max-w-md lg:max-w-md w-full">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search appointments..."
                        className="w-full pl-9.5 pr-8 py-2.5 text-xs font-semibold bg-white border border-slate-200/90 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                        >
                          <X className="size-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Right Cluster: View Mode Switcher & Filter Button */}
                    <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 w-full sm:w-auto">
                      {/* View Switcher: Interactive Card Grid vs Compact Row List */}
                      <div className="inline-flex items-center p-1 bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
                        <button
                          type="button"
                          onClick={() => setViewMode('grid')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            viewMode === 'grid'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                          }`}
                          title="Display as Cards Grid"
                        >
                          <LayoutGrid className="size-3.5" />
                          <span>Cards</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewMode('list')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            viewMode === 'list'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                          }`}
                          title="Display as Compact Row List"
                        >
                          <List className="size-3.5" />
                          <span>List</span>
                        </button>
                      </div>

                      <Button
                        variant="outline"
                        onClick={() => setIsFiltersDrawerOpen(true)}
                        className="h-9.5 px-3.5 sm:px-4.5 rounded-2xl border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs cursor-pointer inline-flex items-center gap-1.5 shrink-0"
                      >
                        <Filter className="size-3.5 text-blue-600" />
                        <span>Filter</span>
                        {(selectedSpecialty !== 'all' ||
                          selectedHospital !== 'all' ||
                          selectedType !== 'all' ||
                          dateRange.from) && (
                          <span className="size-2 rounded-full bg-blue-600" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Active filter badges display */}
                {(selectedSpecialty !== 'all' ||
                  selectedHospital !== 'all' ||
                  selectedType !== 'all' ||
                  dateRange.from ||
                  searchQuery) && (
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-slate-400 font-semibold text-[11px]">Applied filters:</span>
                    {searchQuery && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-semibold">
                        Search: "{searchQuery}"
                        <button onClick={() => setSearchQuery('')} className="hover:text-blue-900">
                          <X className="size-3" />
                        </button>
                      </span>
                    )}
                    {selectedSpecialty !== 'all' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-semibold">
                        Specialty: {selectedSpecialty}
                        <button onClick={() => setSelectedSpecialty('all')} className="hover:text-blue-900">
                          <X className="size-3" />
                        </button>
                      </span>
                    )}
                    {selectedHospital !== 'all' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-semibold">
                        Hospital: {selectedHospital}
                        <button onClick={() => setSelectedHospital('all')} className="hover:text-blue-900">
                          <X className="size-3" />
                        </button>
                      </span>
                    )}
                    {selectedType !== 'all' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-semibold">
                        Type: {selectedType}
                        <button onClick={() => setSelectedType('all')} className="hover:text-blue-900">
                          <X className="size-3" />
                        </button>
                      </span>
                    )}
                    <button
                      onClick={clearAllFilters}
                      className="text-blue-600 hover:text-blue-700 text-xs font-bold underline ml-1 cursor-pointer"
                    >
                      Reset All
                    </button>
                  </div>
                )}

                {/* 3. Appointment Cards List */}
                {isLoadingInitial ? (
                  <div className="bg-gradient-to-b from-slate-50/90 via-white to-slate-50/90 rounded-3xl p-14 sm:p-16 border border-slate-200/80 text-center space-y-4 shadow-xs max-w-md mx-auto">
                    <div className="py-2 flex justify-center">
                      <IndustrialSpinner
                        size="xl"
                        color="brand"
                        animationMode="chaser"
                        withReflection={true}
                        label="Loading your appointments..."
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-800">
                        Synchronizing clinical bookings
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Accessing verified appointments from database
                      </p>
                    </div>
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-slate-200/80 p-12 sm:p-16 text-center space-y-4 shadow-xs max-w-md mx-auto">
                    <div className="size-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
                      <Calendar className="size-8" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-extrabold text-slate-900">No Appointments Found</h3>
                      <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                        No appointments match your active tab or search filters.
                      </p>
                    </div>
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        onClick={clearAllFilters}
                        className="w-full sm:w-auto text-xs font-bold rounded-xl h-10 px-4 cursor-pointer"
                      >
                        Clear Filters
                      </Button>
                      <Button
                        onClick={() => setIsBookingModalOpen(true)}
                        className="w-full sm:w-auto text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 px-5 shadow-xs cursor-pointer"
                      >
                        Book Appointment
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Appointments Collection with Dynamic View Mode (Grid Cards vs Compact List) */}
                    <div
                      className={
                        viewMode === 'grid'
                          ? 'grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5 sm:gap-6'
                          : 'space-y-4'
                      }
                    >
                      {appointments.map((appointment) => (
                        <AppointmentCard
                          key={appointment._id}
                          appointment={appointment}
                          viewMode={viewMode}
                          onViewDetails={(appt) => setSelectedAppointment(appt)}
                          onReschedule={(appt) => openRescheduleModal(appt)}
                          onCancel={(appt) => openCancelModal(appt)}
                          onDownloadPrescription={(appt) => downloadPrescriptionPdf(appt)}
                          onBookAgain={handleBookAgain}
                          onWriteReview={handleOpenReviewModal}
                          onPayNow={(appt) => {
                            alert(
                              `Redirecting to secure Razorpay checkout for ${appt.appointmentNumber} (₹${appt.consultationFee || 700})...`
                            )
                          }}
                        />
                      ))}
                    </div>

                    {/* Infinite Scroll Sentinel & Production-Grade Load More Station */}
                    <div className="pt-6 pb-8 text-center space-y-4">
                      {/* Invisible sentinel for smooth auto-fetch when scrolling */}
                      {hasMore && !isLoadingInitial && (
                        <div ref={observerTarget} className="h-1 opacity-0 pointer-events-none" />
                      )}

                      {/* Interactive Production-Grade Load More Station */}
                      {hasMore && !isLoadingInitial && (
                        <div className="bg-gradient-to-b from-slate-50/90 via-slate-100/60 to-slate-50/90 border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all duration-300 max-w-lg mx-auto space-y-4 animate-in fade-in duration-300">
                          <div className="space-y-2 flex flex-col items-center">
                            <div className="flex items-center justify-between w-full max-w-xs text-xs font-semibold text-slate-500 px-1">
                              <span>Appointments Progress</span>
                              <span className="font-bold text-slate-800">
                                {appointments.length} / {totalAppointments}
                              </span>
                            </div>
                            {totalAppointments > 0 && (
                              <div className="w-full max-w-xs h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-600 transition-all duration-500 rounded-full"
                                  style={{
                                    width: `${Math.min(100, Math.round((appointments.length / totalAppointments) * 100))}%`,
                                  }}
                                />
                              </div>
                            )}
                            <span className="text-[11px] text-slate-400">
                              Scroll down to seamlessly load next 10 appointments
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
                                <span>Retrieving Next Appointments...</span>
                              </>
                            ) : (
                              <>
                                <span>
                                  Load Next 10 Appointments (
                                  {Math.max(0, totalAppointments - appointments.length)} remaining)
                                </span>
                              </>
                            )}
                          </Button>
                        </div>
                      )}

                      {/* End of Directory indicator when all appointments have loaded */}
                      {!hasMore && appointments.length > 0 && !isLoadingInitial && (
                        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-slate-100/90 border border-slate-200/80 text-xs font-semibold text-slate-600">
                          <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                          <span>
                            You have viewed all {totalAppointments} appointments in this category
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Slide-over Filter Drawer */}
      <AppointmentFiltersDrawer
        isOpen={isFiltersDrawerOpen}
        onClose={() => setIsFiltersDrawerOpen(false)}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab)
          setIsFiltersDrawerOpen(false)
        }}
        selectedSpecialty={selectedSpecialty}
        onSelectSpecialty={setSelectedSpecialty}
        selectedHospital={selectedHospital}
        onSelectHospital={setSelectedHospital}
        selectedType={selectedType}
        onSelectType={setSelectedType}
        dateRange={dateRange}
        onChangeDateRange={setDateRange}
        onClearAll={clearAllFilters}
        counts={counts}
      />

      {/* Cancel Appointment Modal */}
      <CancelAppointmentModal
        isOpen={isCancelModalOpen}
        onClose={closeCancelModal}
        appointment={appointmentToCancel}
        onConfirmCancel={handleCancelAppointment}
      />

      {/* Reschedule Appointment Modal */}
      <RescheduleAppointmentModal
        isOpen={isRescheduleModalOpen}
        onClose={closeRescheduleModal}
        appointment={appointmentToReschedule}
        onConfirmReschedule={handleRescheduleAppointment}
      />

      {/* Verified Consultation Review Modal */}
      {reviewTargetAppointment && (
        <WriteReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => {
            setIsReviewModalOpen(false)
            setReviewTargetAppointment(null)
          }}
          appointment={reviewTargetAppointment}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}

      {/* Book New Appointment Modal */}
      {isBookingModalOpen && (
        <BookAppointmentModal
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false)
            setSelectedDoctorForBooking(null)
          }}
          preselectedDoctor={selectedDoctorForBooking}
          doctorsList={selectedDoctorForBooking ? [selectedDoctorForBooking] : doctors}
          onAppointmentBooked={handleAppointmentBooked}
        />
      )}

      {/* Mobile Sticky Bottom Navigation */}
      <MobileBottomNav
        activeTab="appointments"
        onSelectTab={(tab) => {
          if (tab === 'home') navigate('/patient/home')
          if (tab === 'doctors') navigate('/patient/doctors')
          if (tab === 'hospitals') navigate('/patient/hospitals')
          if (tab === 'appointments') setSelectedAppointment(null)
          if (tab === 'profile') alert('Profile section active')
        }}
      />
    </div>
  )
}
