import { useState, useEffect, type FC } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import {
  ChevronRight,
  ArrowLeft,
  Loader2,
  Stethoscope,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

// Patient Navigation Components
import { PatientSidebar } from '@/components/patient/PatientSidebar'
import { PatientHeader } from '@/components/patient/PatientHeader'
import { MobileBottomNav } from '@/components/patient/MobileBottomNav'

// Super Admin Navigation Components
import { SuperAdminSidebar } from '@/components/super-admin/SuperAdminSidebar'
import { SuperAdminHeader } from '@/components/super-admin/SuperAdminHeader'
import { SuperAdminMobileNav } from '@/components/super-admin/SuperAdminMobileNav'
import { useSuperAdminStore } from '@/store/superAdminStore'

// Doctor Profile Sub-components
import { DoctorProfileHeader } from '@/components/patient/doctor-detail/DoctorProfileHeader'
import {
  DoctorTabsNav,
  type DoctorProfileTabKey,
} from '@/components/patient/doctor-detail/DoctorTabsNav'
import { DoctorQuickInfoSidebar } from '@/components/patient/doctor-detail/DoctorQuickInfoSidebar'
import { DoctorOverviewTab } from '@/components/patient/doctor-detail/DoctorOverviewTab'
import { DoctorEducationTab } from '@/components/patient/doctor-detail/DoctorEducationTab'
import { DoctorScheduleTab } from '@/components/patient/doctor-detail/DoctorScheduleTab'
import { DoctorReviewsTab } from '@/components/patient/doctor-detail/DoctorReviewsTab'
import { DoctorHospitalInfoTab } from '@/components/patient/doctor-detail/DoctorHospitalInfoTab'
import { DoctorDocumentsTab } from '@/components/patient/doctor-detail/DoctorDocumentsTab'
import { ContactDoctorModal } from '@/components/patient/doctor-detail/ContactDoctorModal'
import { BookAppointmentModal } from '@/components/patient/BookAppointmentModal'

import { useDoctorStore } from '@/store/doctorStore'
import { useAppointmentStore } from '@/store/appointmentStore'
import { useAuthStore } from '@/store/authStore'
import { UserRole } from '@/types/auth'
import type { AppointmentCardData } from '@/types/patient'

export const DoctorDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()

  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN
  const locationState = location.state as
    | { from?: string; hospitalId?: string; hospitalName?: string }
    | undefined
  const fromHospital = locationState?.from === 'hospital'
  const hospitalName = locationState?.hospitalName

  // Super Admin Layout state
  const {
    isSidebarCollapsed,
    isMobileSidebarOpen: isSuperAdminMobileOpen,
    setIsMobileSidebarOpen: setIsSuperAdminMobileOpen,
    toggleSidebar,
  } = useSuperAdminStore()

  // Guard: If logged in as Hospital Admin, securely redirect to Hospital Admin Doctor Detail Page
  useEffect(() => {
    if (user?.role === UserRole.HOSPITAL_ADMIN && id) {
      navigate(`/hospital-admin/doctors/${id}`, { replace: true })
    }
  }, [user, id, navigate])

  // App Layout State for Patient
  const [isPatientDrawerOpen, setIsPatientDrawerOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<DoctorProfileTabKey>('overview')

  // Modals
  const [isBookModalOpen, setIsBookModalOpen] = useState(false)
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)

  // Doctor Store (with persistent storage & database syncing)
  const {
    currentDoctorDetail,
    isDetailLoading,
    detailError,
    fetchDoctorDetailById,
    favoriteDoctorIds,
    toggleFavorite,
    selectedCity,
    setSelectedCity,
  } = useDoctorStore()

  // Appointment Store for adding booked appointment
  const { addAppointmentLocally } = useAppointmentStore()

  // Fetch from database on mount or ID change
  useEffect(() => {
    if (id) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      fetchDoctorDetailById(id)
    }
  }, [id, fetchDoctorDetailById])

  // Check if we have persistent or loaded doctor details
  const doctor =
    currentDoctorDetail && currentDoctorDetail._id === id
      ? currentDoctorDetail
      : currentDoctorDetail
  const isFavorite = doctor ? favoriteDoctorIds.includes(doctor._id) : false

  const handleBack = () => {
    if (fromHospital) {
      navigate(-1)
    } else if (isSuperAdmin) {
      navigate('/super-admin/hospitals')
    } else {
      navigate('/patient/doctors')
    }
  }

  const handleAppointmentBooked = (newAppt: AppointmentCardData) => {
    if (addAppointmentLocally) {
      addAppointmentLocally(newAppt)
    }
    setIsBookModalOpen(false)
    alert(
      `Appointment Confirmed with ${doctor?.name || 'the doctor'} on ${newAppt.date} at ${newAppt.time}!`
    )
  }

  // --- Content Layout ---
  const mainContent = (
    <main className="max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-6">
      {/* Breadcrumbs Navigation */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500">
          <button
            type="button"
            onClick={handleBack}
            className="hover:text-blue-600 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="size-3.5 sm:hidden" />
            <span>
              {fromHospital
                ? hospitalName || 'Hospital'
                : isSuperAdmin
                  ? 'Hospitals'
                  : 'Doctors'}
            </span>
          </button>
          <ChevronRight className="size-3.5 text-slate-400" />
          <span className="text-slate-900 font-bold truncate">
            {doctor?.name || 'Doctor Profile'}
          </span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="text-xs text-blue-600 hover:bg-blue-50 cursor-pointer hidden sm:flex items-center gap-1"
        >
          <ArrowLeft className="size-3.5" />
          <span>
            {fromHospital
              ? `Back to ${hospitalName || 'Hospital'}`
              : isSuperAdmin
                ? 'Back to Hospitals'
                : 'Back to Doctors'}
          </span>
        </Button>
      </div>

      {/* Loading State when no persistent doctor is available yet */}
      {isDetailLoading && !doctor ? (
        <div className="bg-white rounded-3xl p-16 border border-slate-200/90 text-center space-y-4 shadow-sm max-w-lg mx-auto">
          <Loader2 className="size-10 animate-spin text-blue-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">
              Retrieving Doctor Specifications & Credentials...
            </h3>
            <p className="text-xs text-slate-500">
              Fetching verified clinical data and consultation schedules from database
            </p>
          </div>
        </div>
      ) : detailError && !doctor ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200/90 text-center space-y-3 shadow-sm max-w-lg mx-auto">
          <Stethoscope className="size-10 text-rose-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">Doctor Profile Not Found</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {detailError || 'The requested doctor credentials could not be located.'}
          </p>
          <div className="pt-2 flex justify-center gap-2">
            <Button
              onClick={() => id && fetchDoctorDetailById(id)}
              className="rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="size-3.5" />
              <span>Retry</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleBack}
              className="rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
            >
              {fromHospital ? 'Back to Hospital' : 'Browse All Doctors'}
            </Button>
          </div>
        </div>
      ) : doctor ? (
        <>
          {/* 1. Doctor Profile Hero Header Card */}
          <DoctorProfileHeader
            doctor={doctor}
            isFavorite={isFavorite}
            onToggleFavorite={() => toggleFavorite(doctor._id)}
            onBookAppointment={() => !isSuperAdmin && setIsBookModalOpen(true)}
            onContactDoctor={() => setIsContactModalOpen(true)}
          />

          {/* 2. Interactive Navigation Tabs */}
          <DoctorTabsNav
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            reviewCount={doctor.reviewCount || 124}
          />

          {/* 3. Main Grid Layout: Left Tab Content (Col 8 on lg/xl), Right Sidebar (Col 4 on lg/xl) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Content Area (Col 8) */}
            <div className="lg:col-span-8 space-y-6">
              {activeTab === 'overview' && (
                <DoctorOverviewTab
                  doctor={doctor}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onBookAppointment={() => !isSuperAdmin && setIsBookModalOpen(true)}
                />
              )}

              {activeTab === 'education' && <DoctorEducationTab doctor={doctor} />}

              {activeTab === 'schedule' && (
                <DoctorScheduleTab
                  doctor={doctor}
                  onBookAppointment={() => !isSuperAdmin && setIsBookModalOpen(true)}
                />
              )}

              {activeTab === 'reviews' && <DoctorReviewsTab doctor={doctor} />}

              {activeTab === 'hospital' && <DoctorHospitalInfoTab doctor={doctor} />}

              {activeTab === 'documents' && <DoctorDocumentsTab doctor={doctor} />}
            </div>

            {/* Right Sticky Sidebar (Col 4) */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-5">
              <DoctorQuickInfoSidebar
                doctor={doctor}
                onBookAppointment={() => !isSuperAdmin && setIsBookModalOpen(true)}
                onContactDoctor={() => setIsContactModalOpen(true)}
                onViewDocument={() => setActiveTab('documents')}
              />
            </div>
          </div>
        </>
      ) : null}
    </main>
  )

  // -------------------------------------------------------------
  // Role Branch A: Super Admin view (Preserves Super Admin Shell)
  // -------------------------------------------------------------
  if (isSuperAdmin) {
    return (
      <div className="h-screen w-full overflow-hidden bg-[#F8FAFC] text-slate-900 flex selection:bg-blue-100 selection:text-blue-700 antialiased font-sans">
        {/* Desktop Collapsible Sidebar */}
        <div
          className={`hidden lg:block h-screen transition-all duration-300 ease-in-out shrink-0 ${
            isSidebarCollapsed ? 'w-0 opacity-0 -ml-2 pointer-events-none' : 'w-64 opacity-100'
          }`}
        >
          <SuperAdminSidebar />
        </div>

        {/* Mobile Drawer Sidebar */}
        {isSuperAdminMobileOpen && (
          <SuperAdminSidebar
            isMobileDrawer={true}
            onCloseDrawer={() => setIsSuperAdminMobileOpen(false)}
          />
        )}

        {/* Main Body Scroll Container */}
        <div className="flex-1 h-screen overflow-y-auto overflow-x-hidden flex flex-col min-w-0 transition-all duration-300">
          <SuperAdminHeader onToggleSidebar={toggleSidebar} />
          <div className="flex-1 pb-24 md:pb-12">{mainContent}</div>
        </div>

        {/* Super Admin Mobile Bottom Bar */}
        <SuperAdminMobileNav />
      </div>
    )
  }

  // -------------------------------------------------------------
  // Role Branch B: Patient / Public view
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans text-slate-800 antialiased">
      {/* Top Header - Full brand navigation header */}
      <PatientHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCity={selectedCity}
        onSelectCity={setSelectedCity}
        onToggleSidebar={() => setIsPatientDrawerOpen(!isPatientDrawerOpen)}
        isSidebarOpen={isPatientDrawerOpen}
      />

      <div className="flex-1 flex w-full">
        {/* Collapsible Slide-out Sidebar Drawer for All Screen Sizes */}
        {isPatientDrawerOpen && (
          <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
              onClick={() => setIsPatientDrawerOpen(false)}
            />
            {/* Slide-out Drawer */}
            <div className="relative z-10 animate-in slide-in-from-left duration-200">
              <PatientSidebar
                activeTab="doctors"
                onSelectTab={(tab) => {
                  setIsPatientDrawerOpen(false)
                  if (tab === 'home') navigate('/patient/home')
                  if (tab === 'doctors') navigate('/patient/doctors')
                  if (tab === 'hospitals') navigate('/patient/hospitals')
                  if (tab === 'appointments') navigate('/patient/appointments')
                  if (tab === 'records') navigate('/patient/records')
                }}
                isMobileDrawer={true}
                onCloseDrawer={() => setIsPatientDrawerOpen(false)}
                onOpenBookingModal={() => {
                  setIsPatientDrawerOpen(false)
                  setIsBookModalOpen(true)
                }}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-10">
          {mainContent}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeTab="doctors"
        onSelectTab={(tab) => {
          if (tab === 'home') navigate('/patient/home')
          if (tab === 'doctors') navigate('/patient/doctors')
          if (tab === 'hospitals') navigate('/patient/hospitals')
          if (tab === 'appointments') navigate('/patient/appointments')
          if (tab === 'records') navigate('/patient/records')
        }}
      />

      {/* Patient Modals */}
      {doctor && (
        <>
          <BookAppointmentModal
            isOpen={isBookModalOpen}
            onClose={() => setIsBookModalOpen(false)}
            preselectedDoctor={doctor}
            preselectedHospital={doctor.hospitalId || null}
            onAppointmentBooked={handleAppointmentBooked}
          />

          <ContactDoctorModal
            isOpen={isContactModalOpen}
            onClose={() => setIsContactModalOpen(false)}
            doctor={doctor}
            onBookAppointment={() => setIsBookModalOpen(true)}
          />
        </>
      )}
    </div>
  )
}

export default DoctorDetailPage
