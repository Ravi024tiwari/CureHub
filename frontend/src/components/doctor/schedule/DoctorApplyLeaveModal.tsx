import { useState, useEffect, type FC } from 'react'
import {
  X,
  CalendarOff,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  CalendarDays,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Info,
} from 'lucide-react'
import doctorService, {
  type AffectedAppointmentItem,
  type ApplyDoctorLeavePayload,
} from '@/services/doctorService'

interface DoctorApplyLeaveModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (
    payload: ApplyDoctorLeavePayload | string,
    reason?: string
  ) => Promise<{ success: boolean; message?: string }>
}

const COMMON_REASONS = [
  'Personal Leave',
  'Medical Conference / CME',
  'Family Function',
  'Vacation / Travel',
  'Clinic Maintenance / Sanitization',
  'Medical Emergency',
]

export const DoctorApplyLeaveModal: FC<DoctorApplyLeaveModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const todayStr = new Date().toISOString().split('T')[0]
  const tomorrowStr = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  // Form State - Step 1
  const [currentStep, setCurrentStep] = useState<1 | 2>(1)
  const [leaveType, setLeaveType] = useState<'FULL_DAY' | 'PARTIAL_DAY' | 'MULTI_DAY'>('FULL_DAY')
  const [date, setDate] = useState(tomorrowStr)
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('13:00')
  const [startDate, setStartDate] = useState(tomorrowStr)
  const [endDate, setEndDate] = useState(tomorrowStr)
  const [selectedReason, setSelectedReason] = useState(COMMON_REASONS[0])
  const [customReason, setCustomReason] = useState('')

  // Pre-flight check state
  const [isCheckingImpact, setIsCheckingImpact] = useState(false)
  const [affectedAppointments, setAffectedAppointments] = useState<AffectedAppointmentItem[]>([])
  const [impactChecked, setImpactChecked] = useState(false)

  // Reschedule state - Step 2 (Option B)
  const [rescheduleData, setRescheduleData] = useState<
    Record<
      string,
      {
        newDate: string
        newStartTime: string
        newEndTime: string
        isIncluded: boolean
      }
    >
  >({})

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resultAlert, setResultAlert] = useState<{
    type: 'error' | 'success' | 'warning'
    text: string
  } | null>(null)

  // Reset when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1)
      setImpactChecked(false)
      setAffectedAppointments([])
      setRescheduleData({})
      setResultAlert(null)
    }
  }, [isOpen])

  // Real-time pre-flight check when dates change
  useEffect(() => {
    if (!isOpen) return

    const timer = setTimeout(async () => {
      try {
        setIsCheckingImpact(true)
        const params: any = { leaveType }
        if (leaveType === 'FULL_DAY') {
          if (!date) return
          params.date = date
        } else if (leaveType === 'PARTIAL_DAY') {
          if (!date || !startTime || !endTime) return
          params.date = date
          params.startTime = startTime
          params.endTime = endTime
        } else {
          if (!startDate || !endDate) return
          params.startDate = startDate
          params.endDate = endDate
        }

        const res = await doctorService.getAffectedAppointmentsForLeave(params)
        const appointments = res?.appointments || []
        setAffectedAppointments(appointments)
        setImpactChecked(true)

        // Pre-populate default reschedule map
        const defaultShiftDate =
          leaveType === 'MULTI_DAY'
            ? new Date(new Date(endDate).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            : new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]

        const initialMap: Record<string, any> = {}
        appointments.forEach((appt) => {
          initialMap[appt._id] = {
            newDate: defaultShiftDate,
            newStartTime: appt.startTime || '10:00',
            newEndTime: appt.endTime || '10:30',
            isIncluded: true,
          }
        })
        setRescheduleData(initialMap)
      } catch (err) {
        console.warn('Pre-flight impact check warning:', err)
      } finally {
        setIsCheckingImpact(false)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [isOpen, leaveType, date, startTime, endTime, startDate, endDate])

  if (!isOpen) return null

  // Build leave payload helper
  const buildPayload = (includeReschedules: boolean): ApplyDoctorLeavePayload => {
    const finalReason = customReason.trim() || selectedReason

    const rescheduledList: Array<{
      appointmentId: string
      newDate: string
      newStartTime: string
      newEndTime?: string
    }> = []

    if (includeReschedules) {
      Object.entries(rescheduleData).forEach(([apptId, val]) => {
        if (val.isIncluded && val.newDate && val.newStartTime) {
          rescheduledList.push({
            appointmentId: apptId,
            newDate: val.newDate,
            newStartTime: val.newStartTime,
            newEndTime: val.newEndTime,
          })
        }
      })
    }

    const payload: ApplyDoctorLeavePayload = {
      leaveType,
      reason: finalReason,
      rescheduledAppointments: rescheduledList,
    }

    if (leaveType === 'FULL_DAY') {
      payload.date = date
    } else if (leaveType === 'PARTIAL_DAY') {
      payload.date = date
      payload.startTime = startTime
      payload.endTime = endTime
    } else {
      payload.startDate = startDate
      payload.endDate = endDate
    }

    return payload
  }

  // Primary Action in Step 1:
  // If bookings exist -> move to Step 2 to assign alternate slots
  // If 0 bookings -> immediately submit POST /api/doctors/leaves to persist in DB!
  const handleStepOneSubmit = async () => {
    setResultAlert(null)

    // Run impact check to be 100% sure before proceeding
    setIsSubmitting(true)
    let appointments = affectedAppointments

    try {
      const params: any = { leaveType }
      if (leaveType === 'FULL_DAY') params.date = date
      else if (leaveType === 'PARTIAL_DAY') {
        params.date = date
        params.startTime = startTime
        params.endTime = endTime
      } else {
        params.startDate = startDate
        params.endDate = endDate
      }

      const res = await doctorService.getAffectedAppointmentsForLeave(params)
      appointments = res?.appointments || []
      setAffectedAppointments(appointments)
    } catch (err) {
      console.warn('Impact check fallback:', err)
    }

    // If appointments are booked in this slot -> proceed to Step 2
    if (appointments.length > 0) {
      setIsSubmitting(false)
      setCurrentStep(2)
      return
    }

    // 0 appointments affected -> DIRECTLY PERSIST IN DATABASE!
    const payload = buildPayload(false)
    const res = await onSubmit(payload)
    setIsSubmitting(false)

    if (res.success) {
      setResultAlert({
        type: 'success',
        text: res.message || 'Leave application submitted successfully (PENDING approval).',
      })
      setTimeout(() => {
        onClose()
      }, 1600)
    } else {
      setResultAlert({
        type: 'error',
        text: res.message || 'Failed to submit leave application. Please try again.',
      })
    }
  }

  // Step 2 Final Submission (Leave + Reschedules)
  const handleStepTwoSubmit = async () => {
    setResultAlert(null)
    setIsSubmitting(true)

    const payload = buildPayload(true)
    const res = await onSubmit(payload)
    setIsSubmitting(false)

    if (res.success) {
      setResultAlert({
        type: 'success',
        text: res.message || 'Leave application submitted and appointments shifted successfully!',
      })
      setTimeout(() => {
        onClose()
      }, 1600)
    } else {
      setResultAlert({
        type: 'error',
        text: res.message || 'Failed to submit leave application. Please try again.',
      })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Header with Step Indicator */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center shadow-2xs shrink-0">
              <CalendarOff className="size-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  {currentStep === 1 ? 'Apply for Scheduled Leave' : 'Reschedule Affected Patients'}
                </h2>
                {affectedAppointments.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                    Step {currentStep} of 2
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {currentStep === 1
                  ? 'Configure leave duration, time slot, and reason.'
                  : 'Assign alternate dates and time slots for booked patients.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Result Alert Notice */}
          {resultAlert && (
            <div
              className={`p-3.5 rounded-2xl border text-xs font-bold flex items-start gap-2.5 animate-in fade-in duration-200 ${
                resultAlert.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : resultAlert.type === 'warning'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {resultAlert.type === 'success' ? (
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="size-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed">{resultAlert.text}</span>
            </div>
          )}

          {/* ================= STEP 1: CONFIGURE LEAVE WINDOW ================= */}
          {currentStep === 1 && (
            <div className="space-y-5">
              {/* Leave Type Selector Tabs */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Select Leave Type <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setLeaveType('FULL_DAY')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl font-bold text-xs transition-all border cursor-pointer ${
                      leaveType === 'FULL_DAY'
                        ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-2xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Calendar className="size-3.5" />
                    <span>Full Day</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLeaveType('PARTIAL_DAY')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl font-bold text-xs transition-all border cursor-pointer ${
                      leaveType === 'PARTIAL_DAY'
                        ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-2xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Clock className="size-3.5" />
                    <span>Partial Day</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLeaveType('MULTI_DAY')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl font-bold text-xs transition-all border cursor-pointer ${
                      leaveType === 'MULTI_DAY'
                        ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-2xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <CalendarDays className="size-3.5" />
                    <span>Multi-Day</span>
                  </button>
                </div>
              </div>

              {/* Conditional Date & Time Fields */}
              {leaveType === 'FULL_DAY' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Leave Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    min={todayStr}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors cursor-pointer"
                    required
                  />
                </div>
              )}

              {leaveType === 'PARTIAL_DAY' && (
                <div className="space-y-3 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      min={todayStr}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        Start Time <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        End Time <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                        required
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Only slots between {startTime} and {endTime} on this day will be blocked.
                  </p>
                </div>
              )}

              {leaveType === 'MULTI_DAY' && (
                <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      Start Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      min={todayStr}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      End Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      min={startDate || todayStr}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Real-Time Live Booking Impact Pill */}
              <div className="p-3 rounded-2xl border text-xs flex items-center justify-between bg-slate-50 border-slate-200">
                <span className="font-bold text-slate-600">Patient Booking Impact:</span>
                {isCheckingImpact ? (
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <div className="size-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                    Checking active bookings...
                  </span>
                ) : affectedAppointments.length > 0 ? (
                  <span className="font-bold text-amber-700 bg-amber-100/70 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <AlertTriangle className="size-3" />
                    {affectedAppointments.length} Bookings will be shifted in Step 2
                  </span>
                ) : (
                  <span className="font-bold text-emerald-700 bg-emerald-100/70 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="size-3" />0 Bookings affected (Ready to apply)
                  </span>
                )}
              </div>

              {/* Reason Preset Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Reason for Leave <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors cursor-pointer"
                >
                  {COMMON_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom Reason Note */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Additional Details / Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Attending Annual Cardiology CME in New Delhi"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                />
              </div>

              {/* Workflow notice */}
              <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200/80 flex items-start gap-2.5 text-xs text-blue-900 font-medium">
                <Info className="size-4 text-blue-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Approval Workflow:</strong> Your leave request will be created in{' '}
                  <span className="font-bold underline">PENDING</span> status in the database for Hospital Admin review.
                  Patient booking slots will be blocked immediately.
                </p>
              </div>
            </div>
          )}

          {/* ================= STEP 2: RESCHEDULE AFFECTED PATIENTS (OPTION B) ================= */}
          {currentStep === 2 && (
            <div className="space-y-4">
              {/* Doctor-Led Continuity Guarantee Banner */}
              <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-emerald-950 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-xs text-emerald-800">
                  <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
                  <span>Doctor-Led Patient Continuity (Zero Refund Deduction)</span>
                </div>
                <p className="text-xs text-emerald-900/90 leading-relaxed">
                  Moving patient appointments to an alternate date guarantees patient continuity.
                  The payment automatically carries over to the new slot—<strong>NO refund is deducted</strong>.
                </p>
                <p className="text-[11px] text-emerald-700 font-medium">
                  Any patient booking not shifted enters a <strong>7-day priority window</strong>.
                  If left unrescheduled after 7 days, it will be automatically cancelled with 100% refund.
                </p>
              </div>

              {/* List of Affected Appointments */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Affected Bookings ({affectedAppointments.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      const allIncluded = Object.values(rescheduleData).every((v) => v.isIncluded)
                      const updated: any = {}
                      Object.keys(rescheduleData).forEach((k) => {
                        updated[k] = { ...rescheduleData[k], isIncluded: !allIncluded }
                      })
                      setRescheduleData(updated)
                    }}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                  >
                    {Object.values(rescheduleData).every((v) => v.isIncluded)
                      ? 'Deselect All'
                      : 'Select All to Shift'}
                  </button>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {affectedAppointments.map((appt) => {
                    const current = rescheduleData[appt._id] || {
                      newDate: tomorrowStr,
                      newStartTime: appt.startTime || '10:00',
                      newEndTime: appt.endTime || '10:30',
                      isIncluded: true,
                    }

                    return (
                      <div
                        key={appt._id}
                        className={`p-4 rounded-2xl border transition-all ${
                          current.isIncluded
                            ? 'bg-white border-blue-200 shadow-2xs ring-1 ring-blue-500/10'
                            : 'bg-slate-50 border-slate-200 opacity-60'
                        }`}
                      >
                        {/* Patient Info row */}
                        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={current.isIncluded}
                              onChange={(e) => {
                                setRescheduleData({
                                  ...rescheduleData,
                                  [appt._id]: {
                                    ...current,
                                    isIncluded: e.target.checked,
                                  },
                                })
                              }}
                              className="size-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-slate-900">
                                  {appt.patientName}
                                </span>
                                <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                  {appt.appointmentNumber}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500">
                                Booked for: <strong>{appt.date}</strong> at{' '}
                                <strong>{appt.startTime}</strong>
                              </p>
                            </div>
                          </div>

                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              current.isIncluded
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {current.isIncluded ? 'Shift Scheduled' : '7-Day Window'}
                          </span>
                        </div>

                        {/* Alternate slot pickers if included */}
                        {current.isIncluded && (
                          <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-slate-700 block">
                                Shift to Date:
                              </label>
                              <input
                                type="date"
                                min={todayStr}
                                value={current.newDate}
                                onChange={(e) => {
                                  setRescheduleData({
                                    ...rescheduleData,
                                    [appt._id]: {
                                      ...current,
                                      newDate: e.target.value,
                                    },
                                  })
                                }}
                                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-slate-700 block">
                                Shift to Time:
                              </label>
                              <input
                                type="time"
                                value={current.newStartTime}
                                onChange={(e) => {
                                  setRescheduleData({
                                    ...rescheduleData,
                                    [appt._id]: {
                                      ...current,
                                      newStartTime: e.target.value,
                                    },
                                  })
                                }}
                                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
          {currentStep === 1 ? (
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting || isCheckingImpact}
                className="px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs sm:text-sm cursor-pointer transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleStepOneSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 cursor-pointer disabled:opacity-50 transition-all active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <>
                    <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Leave...</span>
                  </>
                ) : affectedAppointments.length > 0 ? (
                  <>
                    <span>Review & Shift Patients ({affectedAppointments.length})</span>
                    <ArrowRight className="size-4" />
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4" />
                    <span>Confirm & Apply Leave</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs sm:text-sm cursor-pointer transition-colors"
              >
                <ArrowLeft className="size-4" />
                <span>Back to Leave Details</span>
              </button>

              <button
                type="button"
                onClick={handleStepTwoSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 cursor-pointer disabled:opacity-50 transition-all active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <>
                    <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting & Rescheduling...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4" />
                    <span>Confirm Leave & Reschedules</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
export default DoctorApplyLeaveModal
