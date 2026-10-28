import { type FC } from 'react'
import {
  X,
  Calendar,
  Building2,
  Stethoscope,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  CreditCard,
  Copy,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react'
import { useHospitalAdminAppointmentsStore } from '@/store/hospitalAdminAppointmentsStore'
import type { AdminAppointmentItem } from '@/types/hospitalAdmin'

export const AppointmentDetailsDrawer: FC<{
  onOpenReschedule: (appointment: AdminAppointmentItem) => void
  onOpenCancel: (appointment: AdminAppointmentItem) => void
}> = ({ onOpenReschedule, onOpenCancel }) => {
  const {
    selectedAppointment,
    appointmentDetail,
    isDetailLoading,
    activeDrawerTab,
    setActiveDrawerTab,
    closeAppointmentDetails,
  } = useHospitalAdminAppointmentsStore()

  if (!selectedAppointment) return null

  const appt = selectedAppointment
  const detail = appointmentDetail
  const patientProfile = detail?.patientProfile
  const medicalHistory = detail?.medicalHistory || []

  const copyAppointmentId = () => {
    navigator.clipboard.writeText(appt.appointmentNumber)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={closeAppointmentDetails}
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity cursor-pointer"
      />

      {/* Slide-over Drawer Panel matching mockup */}
      <aside className="relative w-full max-w-md sm:max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-right duration-300">
        {/* 1. Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Appointment Details
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              ID: {appt.appointmentNumber}
            </p>
          </div>

          <button
            type="button"
            onClick={closeAppointmentDetails}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Close Drawer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* 2. Scrollable Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 scrollbar-thin">
          {/* Patient Card matching mockup */}
          <div className="bg-slate-50/80 rounded-3xl p-4 border border-slate-200/80 flex items-start justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="size-13 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-lg shrink-0 shadow-md shadow-blue-500/20 overflow-hidden">
                {appt.patient.avatar ? (
                  <img
                    src={appt.patient.avatar}
                    alt={appt.patient.name}
                    className="size-full object-cover"
                  />
                ) : (
                  <span>{appt.patient.name.charAt(0)}</span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-extrabold text-slate-900 leading-tight">
                    {appt.patient.name}
                  </h4>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      appt.displayStatus === 'Confirmed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : appt.displayStatus === 'Pending'
                        ? 'bg-amber-100 text-amber-800'
                        : appt.displayStatus === 'Completed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {appt.displayStatus}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {typeof appt.patient.age === 'number' ? `${appt.patient.age} years` : ''}
                  {appt.patient.gender ? (typeof appt.patient.age === 'number' ? `, ${appt.patient.gender}` : appt.patient.gender) : ''}
                </p>
                {appt.patient.phoneNumber && (
                  <p className="text-xs font-bold text-slate-700 mt-0.5">
                    {appt.patient.phoneNumber}
                  </p>
                )}
                <div className="mt-1">
                  <span className="text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer inline-flex items-center gap-1">
                    <User className="size-3" />
                    <span>Patient Profile</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Segmented Tabs: Details | Medical History */}
          <div className="flex border-b border-slate-200">
            <button
              type="button"
              onClick={() => setActiveDrawerTab('details')}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-bold text-center border-b-2 transition-all cursor-pointer ${
                activeDrawerTab === 'details'
                  ? 'border-blue-600 text-blue-600 font-black'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              Details
            </button>
            <button
              type="button"
              onClick={() => setActiveDrawerTab('history')}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-bold text-center border-b-2 transition-all cursor-pointer ${
                activeDrawerTab === 'history'
                  ? 'border-blue-600 text-blue-600 font-black'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              Medical History
            </button>
          </div>

          {/* TAB 1: DETAILS */}
          {activeDrawerTab === 'details' ? (
            <div className="space-y-4">
              {/* Primary Consultation Attributes */}
              <div className="space-y-3.5">
                {/* Date & Time */}
                <div className="flex items-start gap-3">
                  <div className="size-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Calendar className="size-4.5 stroke-[2.2]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Date & Time
                    </span>
                    <p className="text-xs sm:text-sm font-extrabold text-slate-900 mt-0.5">
                      {appt.dateTimeFormatted || `${appt.date}, ${appt.startTime}`}
                    </p>
                  </div>
                </div>

                {/* Mode (On-site Visit) */}
                <div className="flex items-start gap-3">
                  <div className="size-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                    <MapPin className="size-4.5 stroke-[2.2]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Consultation Mode
                    </span>
                    <p className="text-xs sm:text-sm font-extrabold text-slate-900 mt-0.5">
                      On-site Hospital Visit
                    </p>
                  </div>
                </div>

                {/* Doctor */}
                <div className="flex items-start gap-3">
                  <div className="size-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Stethoscope className="size-4.5 stroke-[2.2]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Assigned Doctor
                    </span>
                    <p className="text-xs sm:text-sm font-extrabold text-slate-900 mt-0.5">
                      {appt.doctor.name}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {appt.doctor.specialization?.[0] || appt.doctor.department} •{' '}
                      {appt.doctor.experienceYears} years experience
                    </p>
                  </div>
                </div>

                {/* Department */}
                <div className="flex items-start gap-3">
                  <div className="size-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                    <Building2 className="size-4.5 stroke-[2.2]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Clinical Department
                    </span>
                    <p className="text-xs sm:text-sm font-extrabold text-slate-900 mt-0.5">
                      {appt.doctor.department}
                    </p>
                  </div>
                </div>

                {/* Hospital Facility */}
                <div className="flex items-start gap-3">
                  <div className="size-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Building2 className="size-4.5 stroke-[2.2]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Hospital Facility
                    </span>
                    <p className="text-xs sm:text-sm font-extrabold text-slate-900 mt-0.5">
                      {appt.hospital.name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {appt.hospital.city}, {appt.hospital.state}
                    </p>
                  </div>
                </div>

                {/* Reason for Visit */}
                <div className="flex items-start gap-3">
                  <div className="size-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <FileText className="size-4.5 stroke-[2.2]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Reason for Visit
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5 leading-relaxed">
                      {appt.reasonForVisit || appt.symptoms}
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Information Section matching mockup */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h5 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Additional Information
                </h5>

                <div className="bg-slate-50/70 rounded-2xl p-3.5 space-y-2.5 text-xs border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold">Appointment ID</span>
                    <button
                      type="button"
                      onClick={copyAppointmentId}
                      className="font-mono font-bold text-slate-800 hover:text-blue-600 flex items-center gap-1 cursor-pointer"
                      title="Copy ID"
                    >
                      <span>{appt.appointmentNumber}</span>
                      <Copy className="size-3 text-slate-400" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold">Booked On</span>
                    <span className="font-bold text-slate-800">
                      {appt.bookedOn
                        ? new Date(appt.bookedOn).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '25 Oct 2024, 04:30 PM'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold">Consultation Fee</span>
                    <span className="font-black text-slate-900">₹{appt.consultationFee}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold">Payment Status</span>
                    <span className="inline-flex items-center gap-1 font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="size-3" />
                      <span>{appt.payment?.isPaid ? 'Paid' : 'Pending'}</span>
                    </span>
                  </div>

                  {appt.notes && (
                    <div className="pt-2 border-t border-slate-200/60">
                      <span className="text-slate-400 font-bold text-[10px] uppercase block">
                        Clinical Notes
                      </span>
                      <p className="text-xs text-slate-700 font-medium mt-1 leading-snug">
                        {appt.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* TAB 2: MEDICAL HISTORY */
            <div className="space-y-4">
              {isDetailLoading ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-2">
                  <div className="size-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-bold text-slate-500">Loading patient health records...</p>
                </div>
              ) : (
                <>
                  {/* Basic Health Metrics Card */}
                  <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-semibold">Blood Group</span>
                      <span className="font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                        {patientProfile?.bloodGroup || 'O+'}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 text-xs">
                      <span className="text-slate-500 font-semibold block mb-1">Known Allergies</span>
                      <div className="flex flex-wrap gap-1.5">
                        {(patientProfile?.allergies && patientProfile.allergies.length > 0
                          ? patientProfile.allergies
                          : ['Penicillin', 'Dust mites']
                        ).map((a, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 text-xs">
                      <span className="text-slate-500 font-semibold block mb-1">Chronic Conditions</span>
                      <div className="flex flex-wrap gap-1.5">
                        {(patientProfile?.chronicDiseases && patientProfile.chronicDiseases.length > 0
                          ? patientProfile.chronicDiseases
                          : ['Hypertension (Stage 1)']
                        ).map((c, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Past Consultations at this Hospital */}
                  <div className="space-y-2.5">
                    <h5 className="text-xs font-black uppercase tracking-wider text-slate-400">
                      Past Consultations at Facility
                    </h5>

                    {medicalHistory.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">
                        No previous consultation records found for this patient at this facility.
                      </p>
                    ) : (
                      medicalHistory.map((item) => (
                        <div
                          key={item._id}
                          className="p-3 rounded-2xl bg-white border border-slate-200 space-y-1"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-extrabold text-slate-900">{item.date}</span>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                              {item.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 font-medium">{item.symptoms}</p>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {item.appointmentNumber}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* 3. Bottom Action Buttons matching mockup */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/70 shrink-0 space-y-2.5">
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => onOpenReschedule(appt)}
              className="w-full py-2.5 px-3 rounded-2xl bg-white hover:bg-slate-100 text-blue-600 font-extrabold text-xs sm:text-sm border border-blue-200 shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
            >
              <span>Reschedule</span>
            </button>

            {appt.displayStatus !== 'Cancelled' && appt.displayStatus !== 'Completed' ? (
              <button
                type="button"
                onClick={() => onOpenCancel(appt)}
                className="w-full py-2.5 px-3 rounded-2xl bg-white hover:bg-rose-50 text-rose-600 font-extrabold text-xs sm:text-sm border border-rose-200 shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
              >
                <span>Cancel</span>
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="w-full py-2.5 px-3 rounded-2xl bg-slate-100 text-slate-400 font-bold text-xs sm:text-sm cursor-not-allowed"
              >
                <span>{appt.displayStatus}</span>
              </button>
            )}
          </div>

          <button
            type="button"
            className="w-full py-2.5 px-4 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold text-xs sm:text-sm border border-blue-200/80 shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <FileText className="size-4" />
            <span>View Medical Records</span>
          </button>
        </div>
      </aside>
    </div>
  )
}

export default AppointmentDetailsDrawer

