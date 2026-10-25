import { useState, type FC } from 'react'
import {
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  FileText,
  Play,
  X,
  CreditCard,
  Users,
} from 'lucide-react'
import type { DoctorAppointmentItem } from '@/services/doctorService'

interface DoctorPatientDossierProps {
  appointment: DoctorAppointmentItem | null
  onStartConsultation: (appt: DoctorAppointmentItem) => void
  onCheckIn: (appt: DoctorAppointmentItem) => void
  onCancelAppointment: (appt: DoctorAppointmentItem) => void
  onOpenPrescription: (appt: DoctorAppointmentItem) => void
  onCloseMobile?: () => void
}

export const DoctorPatientDossier: FC<DoctorPatientDossierProps> = ({
  appointment,
  onStartConsultation,
  onCheckIn,
  onCancelAppointment,
  onOpenPrescription,
  onCloseMobile,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'history' | 'notes'>('details')
  const [clinicalNotes, setClinicalNotes] = useState('')

  if (!appointment) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs text-center space-y-4">
        <div className="size-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
          <User className="size-8" />
        </div>
        <h3 className="text-base font-black text-slate-800">No Patient Selected</h3>
        <p className="text-xs text-slate-500 font-medium">
          Select any appointment from the queue to review patient clinical records, previous visits, and launch the offline OPD consultation.
        </p>
      </div>
    )
  }

  const patient = appointment.patientId
  const isDependent = !!appointment.patientDetails?.isDependent
  const displayName = isDependent
    ? appointment.patientDetails?.fullName || patient?.name || 'Patient'
    : patient?.name || 'Patient'
  const ageDisplay = isDependent
    ? appointment.patientDetails?.age
      ? `${appointment.patientDetails.age} years old`
      : 'Age not specified'
    : patient?.dateOfBirth
    ? `${new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} years old`
    : 'Adult'
  const genderDisplay = isDependent
    ? appointment.patientDetails?.gender || 'Not specified'
    : patient?.gender || 'Not specified'
  const bloodGroup = appointment.bloodGroup || patient?.bloodGroup || 'Not recorded'

  const isInProgress = appointment.status === 'IN_PROGRESS'
  const isConfirmed = appointment.status === 'CONFIRMED'
  const isCheckedIn = appointment.status === 'CHECKED_IN'
  const isCompleted = appointment.status === 'COMPLETED'
  const isCancelled =
    appointment.status === 'CANCELLED_BY_PATIENT' ||
    appointment.status === 'CANCELLED_BY_DOCTOR' ||
    appointment.status === 'NO_SHOW'

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col h-full">
      {/* 1. Header with Close (Mobile) and Patient Summary */}
      <div className="p-5 border-b border-slate-100 bg-gradient-to-b from-slate-50/80 via-white to-white relative">
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="absolute right-4 top-4 p-2 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors lg:hidden cursor-pointer"
          >
            <X className="size-4" />
          </button>
        )}

        <div className="flex items-start gap-4">
          {/* Large Avatar */}
          <div className="relative shrink-0">
            {patient?.avatar ? (
              <img
                src={patient.avatar}
                alt={displayName}
                className="size-16 rounded-2xl object-cover border-2 border-white shadow-md shadow-slate-200/80"
              />
            ) : (
              <div className="size-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-500 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-blue-500/20">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <span
              className={`absolute -bottom-1 -right-1 size-4 rounded-full border-2 border-white ${
                isInProgress
                  ? 'bg-emerald-500 animate-ping'
                  : isCheckedIn
                  ? 'bg-blue-600'
                  : isCompleted
                  ? 'bg-emerald-600'
                  : isCancelled
                  ? 'bg-rose-500'
                  : 'bg-amber-400'
              }`}
            />
          </div>

          {/* Info */}
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black text-slate-900 truncate">
                {displayName}
              </h2>
              {isDependent && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200/80 inline-flex items-center gap-1">
                  <Users className="size-2.5" />
                  {appointment.patientDetails?.relationship || 'Family'}
                </span>
              )}
            </div>

            <p className="text-xs font-semibold text-slate-500">
              {ageDisplay} {genderDisplay && genderDisplay !== 'Not specified' ? `• ${genderDisplay}` : ''}
            </p>

            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              {bloodGroup && bloodGroup !== 'Not recorded' && (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200/80">
                  Blood Group: {bloodGroup}
                </span>
              )}
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                #{appointment.appointmentNumber || appointment._id.slice(-6).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Contact Strip */}
        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600 font-medium">
          <a
            href={patient?.phoneNumber ? `tel:${patient.phoneNumber}` : undefined}
            className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-colors truncate"
          >
            <Phone className="size-3.5 text-blue-600 shrink-0" />
            <span className="truncate font-semibold">{patient?.phoneNumber || 'No phone'}</span>
          </a>
          <a
            href={patient?.email ? `mailto:${patient.email}` : undefined}
            className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-colors truncate"
          >
            <Mail className="size-3.5 text-blue-600 shrink-0" />
            <span className="truncate font-semibold">{patient?.email || 'No email'}</span>
          </a>
        </div>
      </div>

      {/* 2. Chief Complaint Banner */}
      <div className="p-4 bg-gradient-to-r from-blue-50/70 to-sky-50/50 border-b border-blue-100/70">
        <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 block mb-1">
          Chief Clinical Reason / Symptoms
        </span>
        <p className="text-xs sm:text-sm text-slate-800 font-medium italic">
          "{appointment.symptoms || 'General OPD Follow-up & Regular Physical Health Checkup'}"
        </p>
      </div>

      {/* 3. Clinical Tabs Header - Segmented Pill Control */}
      <div className="p-3 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-1 p-1 bg-slate-200/60 rounded-2xl">
          {(['details', 'history', 'notes'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-black capitalize transition-all cursor-pointer text-center ${
                activeTab === tab
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Tab Body */}
      <div className="p-5 flex-1 overflow-y-auto space-y-4">
        {activeTab === 'details' && (
          <div className="space-y-3.5 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                Appointment Schedule
              </span>
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-blue-600" />
                  {appointment.date}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="size-3.5 text-blue-600" />
                  {appointment.startTime} - {appointment.endTime}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                Clinic Location
              </span>
              <p className="font-bold text-slate-800 flex items-center gap-1.5">
                <MapPin className="size-3.5 text-rose-500 shrink-0" />
                <span>
                  {appointment.hospitalId?.name || 'CarePlus City Hospital'} • OPD Consulting Chamber 104
                </span>
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                Billing & Fee
              </span>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-600">Physical OPD Consultation</span>
                <span className="font-black text-slate-900">₹{appointment.consultationFee || 500}</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                <span className="flex items-center gap-1 text-slate-500">
                  <CreditCard className="size-3 text-slate-400" />
                  Payment Status
                </span>
                <span
                  className={`font-black text-[11px] px-2 py-0.5 rounded-md ${
                    appointment.paymentStatus === 'PAID'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {appointment.paymentStatus}
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-3.5 text-xs">
            {/* Visit Metrics */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
              <div className="flex items-center gap-2 text-emerald-800 font-black">
                <CheckCircle2 className="size-4 text-emerald-600" />
                <span>Patient Visit Record</span>
              </div>
              <p className="text-slate-700 font-medium">
                {appointment.previousVisitsCount !== undefined && appointment.previousVisitsCount > 0
                  ? `This patient has completed ${appointment.previousVisitsCount} previous consultation(s) at this clinic.`
                  : 'This is the first OPD visit for this patient at your clinic.'}
              </p>
              {appointment.lastVisitDate && (
                <p className="text-[11px] font-bold text-emerald-700 pt-1">
                  Last visit recorded on: {appointment.lastVisitDate}
                </p>
              )}
            </div>

            {/* Allergies */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                Known Drug Allergies
              </span>
              {appointment.allergies && appointment.allergies.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {appointment.allergies.map((allergy) => (
                    <span
                      key={allergy}
                      className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 text-[11px] font-bold"
                    >
                      {allergy}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 font-medium italic">No known drug allergies on file.</p>
              )}
            </div>

            {/* Chronic Conditions */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                Chronic Medical Conditions
              </span>
              {appointment.chronicDiseases && appointment.chronicDiseases.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {appointment.chronicDiseases.map((cond) => (
                    <span
                      key={cond}
                      className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 text-[11px] font-bold"
                    >
                      {cond}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 font-medium italic">No chronic illnesses recorded.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-3 text-xs">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
              Doctor's OPD Clinical Observations
            </span>
            <textarea
              rows={6}
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              placeholder="Record observation notes during in-clinic physical examination (vitals, BP, pulse, symptoms)..."
              className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-xs font-medium text-slate-800 outline-hidden resize-none"
            />
            <p className="text-[11px] text-slate-400 font-medium">
              These notes are retained during consultation and can be appended to the final digital prescription.
            </p>
          </div>
        )}
      </div>

      {/* 5. Bottom Action Bar */}
      <div className="p-5 border-t border-slate-100 bg-slate-50/70 space-y-2.5">
        {/* If CONFIRMED (Waiting) */}
        {isConfirmed && (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onCheckIn(appointment)}
              className="px-3 py-2.5 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              Check In Patient
            </button>
            <button
              type="button"
              onClick={() => onStartConsultation(appointment)}
              className="px-3 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs shadow-blue-500/20 flex items-center justify-center gap-1.5"
            >
              <Play className="size-3.5 fill-white" />
              <span>Start OPD</span>
            </button>
          </div>
        )}

        {/* If CHECKED_IN */}
        {isCheckedIn && (
          <button
            type="button"
            onClick={() => onStartConsultation(appointment)}
            className="w-full px-4 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-black transition-all cursor-pointer shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
          >
            <Play className="size-4 fill-white" />
            <span>Start Consultation Now →</span>
          </button>
        )}

        {/* If IN_PROGRESS */}
        {isInProgress && (
          <button
            type="button"
            onClick={() => onOpenPrescription(appointment)}
            className="w-full px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-black transition-all cursor-pointer shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 animate-pulse"
          >
            <FileText className="size-4" />
            <span>Complete & Issue Prescription →</span>
          </button>
        )}

        {/* If COMPLETED */}
        {isCompleted && (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center text-xs font-bold flex items-center justify-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-600" />
            <span>Consultation Completed & Discharged</span>
          </div>
        )}

        {/* Reschedule or Cancel Trigger if not finished */}
        {!isCompleted && !isCancelled && (
          <button
            type="button"
            onClick={() => onCancelAppointment(appointment)}
            className="w-full py-1 text-center text-[11px] font-bold text-rose-600 hover:text-rose-700 cursor-pointer transition-colors"
          >
            Cancel / Mark No-Show
          </button>
        )}
      </div>
    </div>
  )
}
