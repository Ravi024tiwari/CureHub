import type { FC } from 'react'
import {
  Clock,
  Activity,
  CheckCircle2,
  AlertCircle,
  Play,
  ShieldCheck,
  Calendar,
  Users,
  Stethoscope,
  UserCheck,
} from 'lucide-react'
import type {
  DoctorAppointmentItem,
  DoctorAppointmentCounts,
} from '@/services/doctorService'

interface DoctorAppointmentsQueueProps {
  appointments: DoctorAppointmentItem[]
  counts: DoctorAppointmentCounts
  activeTab: 'today' | 'upcoming' | 'past'
  onTabChange: (tab: 'today' | 'upcoming' | 'past') => void
  selectedAppointment: DoctorAppointmentItem | null
  onSelectAppointment: (appt: DoctorAppointmentItem) => void
  onStartConsultation: (appt: DoctorAppointmentItem) => void
  onCheckIn: (appt: DoctorAppointmentItem) => void
  isLoading: boolean
}

export const DoctorAppointmentsQueue: FC<DoctorAppointmentsQueueProps> = ({
  appointments,
  counts,
  activeTab,
  onTabChange,
  selectedAppointment,
  onSelectAppointment,
  onStartConsultation,
  onCheckIn,
  isLoading,
}) => {
  const tabs = [
    { id: 'today' as const, label: 'Today', count: counts.today },
    { id: 'upcoming' as const, label: 'Upcoming', count: counts.upcoming },
    { id: 'past' as const, label: 'Previous', count: counts.completed },
  ]

  const formatTimeSlot = (startTime?: string, endTime?: string) => {
    if (!startTime) return 'Time Pending'
    return `${startTime} - ${endTime || ''}`
  }

  const getStatusBadge = (status: DoctorAppointmentItem['status']) => {
    switch (status) {
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-blue-500 text-white shadow-xs animate-pulse">
            <span className="size-1.5 rounded-full bg-white" />
            In Consultation
          </span>
        )
      case 'CHECKED_IN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">
            <ShieldCheck className="size-3 text-sky-600" />
            Checked In
          </span>
        )
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="size-3 text-amber-600" />
            Waiting
          </span>
        )
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="size-3 text-emerald-600" />
            Completed
          </span>
        )
      case 'CANCELLED_BY_PATIENT':
      case 'CANCELLED_BY_DOCTOR':
      case 'NO_SHOW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <AlertCircle className="size-3 text-rose-600" />
            Cancelled
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        )
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
      {/* 1. Queue Tabs Ribbon */}
      <div className="p-3.5 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap bg-slate-50/50">
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 rounded-2xl w-full sm:w-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`flex-1 sm:flex-initial px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-white/40'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] sm:text-[11px] px-2 py-0.2 rounded-full font-extrabold ${
                    isActive
                      ? tab.id === 'upcoming'
                        ? 'bg-amber-100 text-amber-800'
                        : tab.id === 'past'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                      : 'bg-slate-200/80 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>

        <div className="text-xs font-semibold text-slate-400 hidden xl:flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-blue-500 animate-ping" />
          <span>Click any card to load patient dossier</span>
        </div>
      </div>

      {/* 2. Queue Cards List */}
      <div className="p-4 sm:p-5 space-y-4 min-h-[420px]">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="size-9 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs sm:text-sm font-bold text-slate-500">
              Loading real queue from database...
            </p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="py-16 text-center space-y-3 max-w-sm mx-auto">
            <div className="size-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto shadow-inner">
              <Calendar className="size-7" />
            </div>
            <h3 className="text-base font-black text-slate-800">No Appointments In This Queue</h3>
            <p className="text-xs text-slate-500 font-medium">
              There are no patient visits booked for this tab or selected date. Any new patient booking will automatically appear here.
            </p>
          </div>
        ) : (
          appointments.map((appt) => {
            const isSelected = selectedAppointment?._id === appt._id
            const patientUser = appt.patientId
            const isDependent = !!appt.patientDetails?.isDependent
            const displayName = isDependent
              ? appt.patientDetails?.fullName || patientUser?.name || 'Patient'
              : patientUser?.name || 'Patient'
            const ageDisplay = isDependent
              ? appt.patientDetails?.age
                ? `${appt.patientDetails.age} yrs`
                : ''
              : ''
            const genderDisplay = isDependent
              ? appt.patientDetails?.gender || ''
              : patientUser?.gender || ''

            const isInProgress = appt.status === 'IN_PROGRESS'
            const isConfirmed = appt.status === 'CONFIRMED'
            const isCheckedIn = appt.status === 'CHECKED_IN'
            const isCompleted = appt.status === 'COMPLETED'

            const paymentStatus = (appt.paymentStatus || 'PAID').toUpperCase()
            const isPaid = paymentStatus === 'PAID'

            return (
              <div
                key={appt._id}
                onClick={() => onSelectAppointment(appt)}
                className={`rounded-3xl p-4 sm:p-5 border transition-all duration-200 cursor-pointer select-none space-y-3.5 group relative ${
                  isSelected
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50/40 via-white to-sky-50/20 ring-2 ring-blue-500/20 shadow-sm'
                    : 'border-slate-200/90 bg-white hover:border-blue-200 hover:shadow-2xs'
                }`}
              >
                {/* 1. Card Top Bar: Time Slot & Status */}
                <div className="flex items-center justify-between gap-2 flex-wrap pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50 text-blue-900 text-xs font-black border border-blue-200/60">
                      <Clock className="size-3.5 text-blue-600" />
                      <span>{formatTimeSlot(appt.startTime, appt.endTime)}</span>
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                      <Calendar className="size-3 text-slate-400" />
                      <span>{appt.date}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                      In-Person OPD
                    </span>
                    {getStatusBadge(appt.status)}
                  </div>
                </div>

                {/* 2. Patient Profile & Clinical Tags */}
                <div className="flex items-start gap-3.5">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    {patientUser?.avatar ? (
                      <img
                        src={patientUser.avatar}
                        alt={displayName}
                        className="size-11 sm:size-12 rounded-2xl object-cover border-2 border-white shadow-2xs"
                      />
                    ) : (
                      <div className="size-11 sm:size-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-500 text-white font-black text-sm sm:text-base shadow-sm shadow-blue-500/20 flex items-center justify-center">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {isInProgress && (
                      <span className="absolute -top-1 -right-1 size-3.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
                    )}
                  </div>

                  {/* Patient Details */}
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                        {displayName}
                      </span>

                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                        #{appt.appointmentNumber || appt._id.slice(-6).toUpperCase()}
                      </span>

                      {isDependent && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 inline-flex items-center gap-1">
                          <Users className="size-2.5" />
                          {appt.patientDetails?.relationship || 'Family'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium flex-wrap">
                      {ageDisplay && <span>{ageDisplay}</span>}
                      {genderDisplay && <span>• {genderDisplay}</span>}
                      {appt.bloodGroup && (
                        <span className="px-1.5 py-0.2 rounded-md bg-rose-50 text-rose-700 font-extrabold text-[10px] border border-rose-200/80">
                          {appt.bloodGroup}
                        </span>
                      )}
                      {appt.previousVisitsCount !== undefined && appt.previousVisitsCount > 0 ? (
                        <span className="text-emerald-700 font-bold text-[11px] bg-emerald-50 px-1.5 py-0.2 rounded">
                          {appt.previousVisitsCount} Prev Visits
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px] font-semibold">• 1st OPD Visit</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. Clinical Symptoms Box */}
                {appt.symptoms && (
                  <div className="p-3 rounded-2xl bg-slate-50/90 border border-slate-200/80 flex items-start gap-2.5">
                    <Stethoscope className="size-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-700 font-medium leading-relaxed">
                      <strong className="text-slate-900 font-black not-italic mr-1">Chief Reason:</strong>
                      <span className="italic text-slate-600">"{appt.symptoms}"</span>
                    </p>
                  </div>
                )}

                {/* 4. Card Bottom Action Bar */}
                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                  {/* Fee & Billing Pill */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600">
                      Fee: <strong className="text-slate-900 font-black">₹{appt.consultationFee || 500}</strong>
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-black uppercase tracking-wider ${
                        isPaid
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {paymentStatus}
                    </span>
                  </div>

                  {/* Operational OPD Buttons */}
                  <div className="flex items-center gap-2">
                    {isConfirmed && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onCheckIn(appt)
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      >
                        <UserCheck className="size-3.5 text-slate-600" />
                        <span>Check In</span>
                      </button>
                    )}

                    {(isConfirmed || isCheckedIn) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onStartConsultation(appt)
                        }}
                        className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-xs shadow-blue-500/25 flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Play className="size-3 fill-white" />
                        <span>Start OPD</span>
                      </button>
                    )}

                    {isInProgress && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onStartConsultation(appt)
                        }}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs shadow-emerald-500/20 flex items-center gap-1.5 transition-all cursor-pointer animate-pulse"
                      >
                        <Activity className="size-3.5" />
                        <span>In Consultation</span>
                      </button>
                    )}

                    {isCompleted && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="size-3.5 text-emerald-600" />
                        <span>Completed</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
