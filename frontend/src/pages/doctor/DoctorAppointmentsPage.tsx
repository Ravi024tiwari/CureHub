import { useEffect, useState, type FC } from 'react'
import { AlertCircle, RefreshCw, X } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useDoctorStore } from '@/store/doctorStore'
import { toast } from '@/components/common'
import { DoctorSidebar, DoctorHeader } from '@/components/doctor/dashboard'
import {
  DoctorAppointmentsHeader,
  DoctorAppointmentsKpiCards,
  DoctorAppointmentsQueue,
  DoctorAppointmentsCalendarNav,
  DoctorPatientDossier,
  DoctorPrescriptionModal,
  DoctorRecentConsultationsTable,
} from '@/components/doctor/appointments'
import type { DoctorAppointmentItem } from '@/services/doctorService'

export const DoctorAppointmentsPage: FC = () => {
  const { user } = useAuthStore()
  const {
    appointments,
    recentCompletedAppointments,
    appointmentCounts,
    selectedAppointment,
    isAppointmentsLoading,
    appointmentError,
    appointmentTab,
    appointmentSelectedDate,
    appointmentSearchQuery,
    fetchDoctorAppointments,
    setSelectedAppointment,
    setAppointmentTab,
    setAppointmentSelectedDate,
    setAppointmentSearchQuery,
    updateAppointmentStatusAction,
    completeAppointmentAction,
    dashboardData,
    fetchDoctorDashboard,
  } = useDoctorStore()

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isMobileDossierOpen, setIsMobileDossierOpen] = useState(false)
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false)
  const [isPrescriptionSubmitting, setIsPrescriptionSubmitting] = useState(false)

  // Cancel prompt state
  const [appointmentToCancel, setAppointmentToCancel] = useState<DoctorAppointmentItem | null>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [isCancelling, setIsCancelling] = useState(false)

  // Initial load
  useEffect(() => {
    fetchDoctorAppointments()
    if (!dashboardData) {
      fetchDoctorDashboard()
    }
  }, [])

  // Doctor header info
  const doctorInfo = dashboardData?.doctorInfo
  const doctorName =
    doctorInfo?.name ||
    (user?.name ? (user.name.startsWith('Dr.') ? user.name : `Dr. ${user.name}`) : 'Doctor')
  const department = doctorInfo?.department || 'General OPD'
  const avatar = doctorInfo?.avatar || user?.avatar || null

  // Handlers
  const handleRefresh = () => {
    fetchDoctorAppointments()
    toast.info('Appointments queue updated from live clinic database.')
  }

  const handleSearchChange = (query: string) => {
    setAppointmentSearchQuery(query)
    fetchDoctorAppointments({ search: query, page: 1 })
  }

  const handleClearDateFilter = () => {
    setAppointmentSelectedDate(null)
  }

  const handleSelectAppointment = (appt: DoctorAppointmentItem) => {
    setSelectedAppointment(appt)
    // On non-XL devices, automatically pop up the dossier modal/drawer
    if (window.innerWidth < 1280) {
      setIsMobileDossierOpen(true)
    }
  }

  const handleCheckIn = async (appt: DoctorAppointmentItem) => {
    const success = await updateAppointmentStatusAction(appt._id, 'CHECKED_IN')
    if (success) {
      const patientName = appt.patientDetails?.fullName || appt.patientId?.name || 'Patient'
      toast.success(`${patientName} marked as checked in at clinic OPD.`)
    } else {
      toast.error('Unable to update patient status.')
    }
  }

  const handleStartConsultation = async (appt: DoctorAppointmentItem) => {
    if (appt.status !== 'IN_PROGRESS') {
      const success = await updateAppointmentStatusAction(appt._id, 'IN_PROGRESS')
      if (success) {
        const patientName = appt.patientDetails?.fullName || appt.patientId?.name || 'Patient'
        toast.info(`Consultation started for ${patientName}. Consultation in progress.`)
      }
    }
    setSelectedAppointment(appt)
    setIsPrescriptionModalOpen(true)
  }

  const handleCancelPrompt = (appt: DoctorAppointmentItem) => {
    setAppointmentToCancel(appt)
    setCancelReason('')
  }

  const handleConfirmCancel = async () => {
    if (!appointmentToCancel) return
    if (!cancelReason.trim()) {
      toast.error('Please specify a cancellation or no-show reason.')
      return
    }

    setIsCancelling(true)
    const success = await updateAppointmentStatusAction(
      appointmentToCancel._id,
      'CANCELLED_BY_DOCTOR',
      cancelReason.trim()
    )
    setIsCancelling(false)

    if (success) {
      toast.warning('Appointment cancelled. The time slot has been released back to schedule.')
      setAppointmentToCancel(null)
      setCancelReason('')
    } else {
      toast.error('Failed to cancel appointment.')
    }
  }

  const handlePrescriptionSubmit = async (prescriptionData: any) => {
    if (!selectedAppointment) return
    setIsPrescriptionSubmitting(true)
    const success = await completeAppointmentAction(selectedAppointment._id, prescriptionData)
    setIsPrescriptionSubmitting(false)

    if (success) {
      const patientName =
        selectedAppointment.patientDetails?.fullName ||
        selectedAppointment.patientId?.name ||
        'Patient'
      toast.success(
        `Consultation completed! Digital prescription generated and issued for ${patientName}.`
      )
      setIsPrescriptionModalOpen(false)
    } else {
      toast.error('Could not complete consultation. Please check required fields.')
    }
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-[#F8FAFC] text-slate-900 flex selection:bg-blue-100 selection:text-blue-700 antialiased">
      {/* 1. Desktop Persistent Sidebar */}
      <div className="hidden lg:block h-screen shrink-0">
        <DoctorSidebar />
      </div>

      {/* 2. Mobile Drawer Sidebar */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative z-50 w-64 max-w-[80vw] h-full shadow-2xl animate-in slide-in-from-left duration-200">
            <DoctorSidebar onCloseMobile={() => setIsMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* 3. Main Body Scroll Container */}
      <div className="flex-1 h-screen overflow-y-auto overflow-x-hidden overscroll-contain flex flex-col min-w-0 transition-all">
        {/* Top Header */}
        <DoctorHeader
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
          doctorName={doctorName}
          department={department}
          avatar={avatar}
        />

        {/* Appointments Main Content Container */}
        <main className="flex-1 w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-6 pb-20">
          {/* Error Banner if any */}
          {appointmentError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold shadow-xs">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="size-5 text-rose-600 shrink-0" />
                <span>{appointmentError}</span>
              </div>
              <button
                type="button"
                onClick={handleRefresh}
                className="px-3 py-1 rounded-xl bg-white border border-rose-200 text-rose-700 font-bold hover:bg-rose-100/50 cursor-pointer text-xs flex items-center gap-1.5"
              >
                <RefreshCw className="size-3" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* Top Header Card with Search & Controls */}
          <DoctorAppointmentsHeader
            searchQuery={appointmentSearchQuery}
            onSearchChange={handleSearchChange}
            onRefresh={handleRefresh}
            isLoading={isAppointmentsLoading}
            totalCount={appointments.length}
            selectedDate={appointmentSelectedDate}
            onClearDateFilter={handleClearDateFilter}
          />

          {/* KPI Summary Cards */}
          <DoctorAppointmentsKpiCards
            counts={appointmentCounts}
            activeTab={appointmentTab}
            onSelectTab={(tab) => setAppointmentTab(tab)}
          />

          {/* Main 3-Column Interactive Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
            {/* Column 1: Queue (Tabs + List of Real Appointment Cards) */}
            <div className="lg:col-span-7 xl:col-span-5 space-y-6">
              <DoctorAppointmentsQueue
                appointments={appointments}
                counts={appointmentCounts}
                activeTab={appointmentTab}
                onTabChange={(tab) => setAppointmentTab(tab)}
                selectedAppointment={selectedAppointment}
                onSelectAppointment={handleSelectAppointment}
                onStartConsultation={handleStartConsultation}
                onCheckIn={handleCheckIn}
                isLoading={isAppointmentsLoading}
              />
            </div>

            {/* Column 2: Calendar Navigator & Gauge */}
            <div className="lg:col-span-5 xl:col-span-3 space-y-4">
              <DoctorAppointmentsCalendarNav
                selectedDate={appointmentSelectedDate}
                onSelectDate={(date) => setAppointmentSelectedDate(date)}
                counts={appointmentCounts}
                onRefresh={handleRefresh}
              />
            </div>

            {/* Column 3: Active Patient Clinical Dossier (Persistent on XL screens) */}
            <div className="hidden xl:block xl:col-span-4 sticky top-6">
              <DoctorPatientDossier
                appointment={selectedAppointment}
                onStartConsultation={handleStartConsultation}
                onCheckIn={handleCheckIn}
                onCancelAppointment={handleCancelPrompt}
                onOpenPrescription={(appt) => {
                  setSelectedAppointment(appt)
                  setIsPrescriptionModalOpen(true)
                }}
              />
            </div>
          </div>

          {/* Bottom Table: Recent Completed Consultations */}
          <DoctorRecentConsultationsTable
            recentCompleted={recentCompletedAppointments}
            onSelectAppointment={handleSelectAppointment}
          />
        </main>
      </div>

      {/* 4. Mobile & Tablet Slide-Up Patient Dossier Drawer */}
      {isMobileDossierOpen && selectedAppointment && (
        <div className="fixed inset-0 z-50 xl:hidden flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileDossierOpen(false)}
          />
          <div className="relative z-50 w-full max-w-lg mx-auto max-h-[88vh] bg-white rounded-t-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-200">
            <DoctorPatientDossier
              appointment={selectedAppointment}
              onStartConsultation={(appt) => {
                setIsMobileDossierOpen(false)
                handleStartConsultation(appt)
              }}
              onCheckIn={handleCheckIn}
              onCancelAppointment={(appt) => {
                setIsMobileDossierOpen(false)
                handleCancelPrompt(appt)
              }}
              onOpenPrescription={(appt) => {
                setIsMobileDossierOpen(false)
                setSelectedAppointment(appt)
                setIsPrescriptionModalOpen(true)
              }}
              onCloseMobile={() => setIsMobileDossierOpen(false)}
            />
          </div>
        </div>
      )}

      {/* 5. Prescription Modal */}
      <DoctorPrescriptionModal
        isOpen={isPrescriptionModalOpen}
        onClose={() => setIsPrescriptionModalOpen(false)}
        appointment={selectedAppointment}
        onSubmit={handlePrescriptionSubmit}
        isSubmitting={isPrescriptionSubmitting}
      />

      {/* 6. Cancel / No-Show Dialog Modal */}
      {appointmentToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setAppointmentToCancel(null)}
          />
          <div className="relative z-50 w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Cancel / Mark No-Show
              </h3>
              <button
                type="button"
                onClick={() => setAppointmentToCancel(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              Are you sure you want to cancel appointment #
              {appointmentToCancel.appointmentNumber || appointmentToCancel._id.slice(-6).toUpperCase()}
              ? The booking time slot will be freed immediately.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                Cancellation Reason <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Specify reason (e.g. Patient did not arrive / Emergency schedule conflict)..."
                className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 text-xs font-medium text-slate-800 outline-hidden resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setAppointmentToCancel(null)}
                disabled={isCancelling}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-60 flex items-center gap-1.5"
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
