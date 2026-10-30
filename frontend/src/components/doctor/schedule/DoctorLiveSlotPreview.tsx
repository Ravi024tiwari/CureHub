import { useState, useMemo, type FC } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  CalendarOff,
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle,
  X,
  ShieldAlert,
} from 'lucide-react'
import type { DoctorScheduleRule, DoctorLeaveItem } from '@/services/doctorService'

interface DoctorLiveSlotPreviewProps {
  scheduleRules: DoctorScheduleRule[]
  leaves: DoctorLeaveItem[]
}

interface ActiveLeaveMatch {
  leave: DoctorLeaveItem
  isFullDay: boolean
  isPartialDay: boolean
  startMinutes: number
  endMinutes: number
  status: 'PENDING' | 'APPROVED'
  reason: string
  timingLabel: string
}

export interface PreviewSlotItem {
  time: string
  rawMinutes: number
  status: 'available' | 'booked' | 'leave_approved' | 'leave_pending'
  leaveInfo?: {
    reason: string
    status: 'PENDING' | 'APPROVED'
    timingLabel: string
  }
}

export const DoctorLiveSlotPreview: FC<DoctorLiveSlotPreviewProps> = ({
  scheduleRules,
  leaves,
}) => {
  // Current preview date (defaults to today)
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date()
    return d
  })

  // Selected slot for interactive inspection popover
  const [inspectedSlot, setInspectedSlot] = useState<PreviewSlotItem | null>(null)

  // Navigation handlers
  const handlePrevDay = () => {
    const next = new Date(selectedDate)
    next.setDate(next.getDate() - 1)
    setSelectedDate(next)
    setInspectedSlot(null)
  }

  const handleNextDay = () => {
    const next = new Date(selectedDate)
    next.setDate(next.getDate() + 1)
    setSelectedDate(next)
    setInspectedSlot(null)
  }

  const handleJumpToToday = () => {
    setSelectedDate(new Date())
    setInspectedSlot(null)
  }

  // Calculate matching leaves for this specific day
  const matchingLeaves = useMemo<ActiveLeaveMatch[]>(() => {
    if (!leaves || leaves.length === 0) return []

    const dayStart = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      0,
      0,
      0,
      0
    )
    const dayEnd = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      23,
      59,
      59,
      999
    )

    const matches: ActiveLeaveMatch[] = []

    leaves.forEach((l) => {
      // 1. Skip cancelled or rejected leaves (they do not block slots)
      const st = (l.status || 'PENDING').toUpperCase()
      if (st === 'REJECTED' || st === 'CANCELLED') return

      const status = st === 'APPROVED' ? 'APPROVED' : 'PENDING'
      const reason = l.reason || 'Personal Leave'

      // Check dates
      let lStart: Date | null = null
      let lEnd: Date | null = null

      if (l.startDateTime && l.endDateTime) {
        lStart = new Date(l.startDateTime)
        lEnd = new Date(l.endDateTime)
      } else if (l.date) {
        const sTime = l.startTime || '00:00'
        const eTime = l.endTime || '23:59'
        lStart = new Date(`${l.date}T${sTime}:00`)
        lEnd = new Date(`${l.date}T${eTime}:00`)
      }

      if (!lStart || !lEnd || isNaN(lStart.getTime()) || isNaN(lEnd.getTime())) {
        return
      }

      // Overlap check
      if (lStart.getTime() <= dayEnd.getTime() && lEnd.getTime() >= dayStart.getTime()) {
        const lType = (l.leaveType || '').toUpperCase()
        const isPartial = lType === 'PARTIAL_DAY' || lType.includes('PARTIAL')

        let startMinutes = 0
        let endMinutes = 24 * 60
        let timingLabel = 'Full Day Leave'

        if (isPartial) {
          // Extract slot hours & minutes
          const sHour = l.startDateTime?.includes('T')
            ? parseInt(l.startDateTime.split('T')[1].substring(0, 2), 10)
            : lStart.getHours()
          const sMin = l.startDateTime?.includes('T')
            ? parseInt(l.startDateTime.split('T')[1].substring(3, 5), 10)
            : lStart.getMinutes()

          const eHour = l.endDateTime?.includes('T')
            ? parseInt(l.endDateTime.split('T')[1].substring(0, 2), 10)
            : lEnd.getHours()
          const eMin = l.endDateTime?.includes('T')
            ? parseInt(l.endDateTime.split('T')[1].substring(3, 5), 10)
            : lEnd.getMinutes()

          startMinutes = sHour * 60 + sMin
          endMinutes = eHour * 60 + eMin

          const formatHourMin = (h: number, m: number) => {
            const ampm = h >= 12 ? 'PM' : 'AM'
            const dispH = h % 12 === 0 ? 12 : h % 12
            return `${String(dispH).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`
          }

          timingLabel = `${formatHourMin(sHour, sMin)} - ${formatHourMin(eHour, eMin)}`
        }

        matches.push({
          leave: l,
          isFullDay: !isPartial,
          isPartialDay: isPartial,
          startMinutes,
          endMinutes,
          status,
          reason,
          timingLabel,
        })
      }
    })

    return matches
  }, [selectedDate, leaves])

  // Check preview data for selected date
  const datePreviewData = useMemo(() => {
    // 1. Check Schedule Routine for day of week (0 = Sunday, 1 = Monday...)
    const dayOfWeek = selectedDate.getDay()
    const matchingRules = scheduleRules.filter((r) => r.dayOfWeek === dayOfWeek)

    if (matchingRules.length === 0) {
      return {
        status: 'DAY_OFF' as const,
        leaveReason: null,
        activeLeave: matchingLeaves[0] || null,
        morningSlots: [] as PreviewSlotItem[],
        eveningSlots: [] as PreviewSlotItem[],
        slotDuration: 20,
      }
    }

    // Helpers to generate slots
    const toMinutes = (timeStr: string) => {
      const [h, m] = (timeStr || '09:00').split(':').map(Number)
      return h * 60 + m
    }

    const toTimeString = (totalMinutes: number) => {
      const h = Math.floor(totalMinutes / 60)
      const m = totalMinutes % 60
      const ampm = h >= 12 ? 'PM' : 'AM'
      const displayH = h % 12 === 0 ? 12 : h % 12
      return `${String(displayH).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`
    }

    const slotDuration = matchingRules[0]?.slotDurationMinutes || 20

    let morningSlots: PreviewSlotItem[] = []
    let eveningSlots: PreviewSlotItem[] = []

    matchingRules.forEach((rule, ruleIdx) => {
      const startMin = toMinutes(rule.startTime)
      const endMin = toMinutes(rule.endTime)
      const isMorning = startMin < 14 * 60

      const slots: PreviewSlotItem[] = []
      let current = startMin
      let idx = 0

      while (current + slotDuration <= endMin) {
        // Check if this slot falls in ANY active leave
        const leaveOnSlot = matchingLeaves.find((ml) => {
          if (ml.isFullDay) return true
          return current >= ml.startMinutes && current < ml.endMinutes
        })

        let status: PreviewSlotItem['status'] = 'available'
        let leaveInfo: PreviewSlotItem['leaveInfo'] = undefined

        if (leaveOnSlot) {
          status = leaveOnSlot.status === 'APPROVED' ? 'leave_approved' : 'leave_pending'
          leaveInfo = {
            reason: leaveOnSlot.reason,
            status: leaveOnSlot.status,
            timingLabel: leaveOnSlot.timingLabel,
          }
        } else {
          // Mock realistic patient bookings on regular open slots
          const isBooked = (ruleIdx + idx) % 5 === 2
          status = isBooked ? 'booked' : 'available'
        }

        slots.push({
          time: toTimeString(current),
          rawMinutes: current,
          status,
          leaveInfo,
        })

        current += slotDuration
        idx++
      }

      if (isMorning) {
        morningSlots = [...morningSlots, ...slots]
      } else {
        eveningSlots = [...eveningSlots, ...slots]
      }
    })

    // Calculate overall day status
    const allSlots = [...morningSlots, ...eveningSlots]
    const leaveSlots = allSlots.filter(
      (s) => s.status === 'leave_approved' || s.status === 'leave_pending'
    )

    let dayStatus:
      | 'AVAILABLE'
      | 'PARTIAL_LEAVE'
      | 'FULL_LEAVE_APPROVED'
      | 'FULL_LEAVE_PENDING'
      | 'DAY_OFF' = 'AVAILABLE'

    const primaryLeave = matchingLeaves[0] || null

    if (primaryLeave?.isFullDay || (allSlots.length > 0 && leaveSlots.length === allSlots.length)) {
      dayStatus =
        primaryLeave?.status === 'APPROVED' ? 'FULL_LEAVE_APPROVED' : 'FULL_LEAVE_PENDING'
    } else if (leaveSlots.length > 0) {
      dayStatus = 'PARTIAL_LEAVE'
    }

    return {
      status: dayStatus,
      activeLeave: primaryLeave,
      morningSlots,
      eveningSlots,
      slotDuration,
      leaveSlotsCount: leaveSlots.length,
      totalSlotsCount: allSlots.length,
    }
  }, [selectedDate, scheduleRules, matchingLeaves])

  const formattedDateTitle = selectedDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const formattedDateSubtitle = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const isToday = useMemo(() => {
    const today = new Date()
    return (
      today.getDate() === selectedDate.getDate() &&
      today.getMonth() === selectedDate.getMonth() &&
      today.getFullYear() === selectedDate.getFullYear()
    )
  }, [selectedDate])

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-5">
      {/* 1. Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Eye className="size-4 stroke-[2.2]" />
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Live Slot Preview
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            See how your available and leave slots appear to patients in real-time.
          </p>
        </div>

        {!isToday && (
          <button
            type="button"
            onClick={handleJumpToToday}
            className="px-2.5 py-1 rounded-xl text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer shrink-0"
          >
            Today
          </button>
        )}
      </div>

      {/* 2. Date Navigation Bar with Leave Indicator */}
      <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-2xs">
        <button
          type="button"
          onClick={handlePrevDay}
          className="size-8 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-900 cursor-pointer shadow-2xs transition-colors"
          title="Previous Day"
        >
          <ChevronLeft className="size-4" />
        </button>

        <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-slate-800">
          <Calendar className="size-4 text-blue-600" />
          <span>{formattedDateTitle}</span>

          {/* Leave Marker Dot on Date Title */}
          {datePreviewData.activeLeave && (
            <span
              className={`size-2.5 rounded-full ${
                datePreviewData.activeLeave.status === 'APPROVED' ? 'bg-rose-500' : 'bg-amber-500'
              } animate-pulse shrink-0`}
              title={
                datePreviewData.activeLeave.status === 'APPROVED'
                  ? 'Doctor on Approved Leave'
                  : 'Doctor Leave Pending Review'
              }
            />
          )}
        </div>

        <button
          type="button"
          onClick={handleNextDay}
          className="size-8 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-900 cursor-pointer shadow-2xs transition-colors"
          title="Next Day"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      {/* 3. Selected Day Status Banner Card */}
      <div
        className={`p-4 rounded-2xl border space-y-1.5 transition-all ${
          datePreviewData.status === 'FULL_LEAVE_APPROVED'
            ? 'bg-gradient-to-br from-rose-50 to-rose-100/40 border-rose-200'
            : datePreviewData.status === 'FULL_LEAVE_PENDING'
            ? 'bg-gradient-to-br from-amber-50 to-amber-100/40 border-amber-200'
            : datePreviewData.status === 'PARTIAL_LEAVE'
            ? 'bg-gradient-to-br from-rose-50/70 to-blue-50/30 border-rose-200'
            : datePreviewData.status === 'AVAILABLE'
            ? 'bg-gradient-to-br from-slate-50 to-blue-50/40 border-slate-200/80'
            : 'bg-slate-50 border-slate-200/80'
        }`}
      >
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-blue-600 shrink-0" />
            <span className="text-xs sm:text-sm font-black text-slate-900">
              {formattedDateSubtitle}
            </span>
          </div>

          {/* Status Badge */}
          {datePreviewData.status === 'AVAILABLE' && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100/80 text-emerald-800 border border-emerald-300/80">
              <CheckCircle2 className="size-3 text-emerald-600" />
              <span>Available</span>
            </span>
          )}

          {datePreviewData.status === 'PARTIAL_LEAVE' && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs">
              <CalendarOff className="size-3 text-rose-600" />
              <span>Partial Leave ({datePreviewData.activeLeave?.timingLabel || 'Scheduled'})</span>
            </span>
          )}

          {datePreviewData.status === 'FULL_LEAVE_APPROVED' && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs">
              <span className="size-2 rounded-full bg-rose-600 animate-pulse" />
              <span>On Leave (Approved)</span>
            </span>
          )}

          {datePreviewData.status === 'FULL_LEAVE_PENDING' && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs">
              <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Leave Pending Review</span>
            </span>
          )}

          {datePreviewData.status === 'DAY_OFF' && (
            <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
              Day Off
            </span>
          )}
        </div>

        {/* Dynamic Context Description */}
        <p className="text-xs text-slate-600 font-medium pl-6 leading-relaxed">
          {datePreviewData.status === 'AVAILABLE' &&
            `Slots are generated with ${datePreviewData.slotDuration} minutes duration. Open for public patient bookings.`}
          {datePreviewData.status === 'PARTIAL_LEAVE' && (
            <span>
              Doctor has leave scheduled between{' '}
              <strong className="text-rose-700">
                {datePreviewData.activeLeave?.timingLabel}
              </strong>{' '}
              ({datePreviewData.activeLeave?.reason}). Red slots are blocked; unblocked sessions
              remain available for booking.
            </span>
          )}
          {datePreviewData.status === 'FULL_LEAVE_APPROVED' && (
            <span>
              Doctor is on approved leave ({datePreviewData.activeLeave?.reason}). All patient
              booking slots are locked and protected.
            </span>
          )}
          {datePreviewData.status === 'FULL_LEAVE_PENDING' && (
            <span>
              Leave application submitted ({datePreviewData.activeLeave?.reason}) awaiting hospital
              admin review. Slots are temporarily reserved.
            </span>
          )}
          {datePreviewData.status === 'DAY_OFF' &&
            'Clinic is closed on this day according to your weekly schedule.'}
        </p>
      </div>

      {/* 4. Active Leave Notification Card if leave matches this day */}
      {datePreviewData.activeLeave && (
        <div
          className={`p-3.5 rounded-2xl border text-xs flex items-start gap-3 shadow-2xs animate-in fade-in duration-200 ${
            datePreviewData.activeLeave.status === 'APPROVED'
              ? 'bg-rose-50/90 border-rose-200 text-rose-950'
              : 'bg-amber-50/90 border-amber-200 text-amber-950'
          }`}
        >
          {datePreviewData.activeLeave.status === 'APPROVED' ? (
            <CalendarOff className="size-5 text-rose-600 shrink-0 mt-0.5" />
          ) : (
            <Clock className="size-5 text-amber-600 shrink-0 mt-0.5" />
          )}

          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="font-extrabold text-xs">
                {datePreviewData.activeLeave.status === 'APPROVED'
                  ? 'Confirmed Doctor Leave (Hospital Approved)'
                  : 'Leave Application Submitted (Pending Admin Review)'}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                  datePreviewData.activeLeave.status === 'APPROVED'
                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}
              >
                {datePreviewData.activeLeave.leave.leaveType?.replace('_', ' ') || 'Leave'}
              </span>
            </div>

            <p className="text-[11px] opacity-90 leading-snug">
              <strong>Stated Reason:</strong> &ldquo;{datePreviewData.activeLeave.reason}&rdquo; •{' '}
              <strong>Affected Window:</strong> {datePreviewData.activeLeave.timingLabel}
            </p>
          </div>
        </div>
      )}

      {/* 5. Slots Section (Morning and Evening) */}
      {datePreviewData.status !== 'DAY_OFF' ? (
        <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
          {/* Morning Session */}
          {datePreviewData.morningSlots.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-black text-slate-700">
                <div className="flex items-center gap-2">
                  <Clock className="size-3.5 text-blue-600" />
                  <span>Morning Session (09:00 AM - 01:00 PM)</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400">
                  {datePreviewData.morningSlots.length} slots
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {datePreviewData.morningSlots.map((slot, i) => {
                  const isLeaveApproved = slot.status === 'leave_approved'
                  const isLeavePending = slot.status === 'leave_pending'
                  const isBooked = slot.status === 'booked'

                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setInspectedSlot(slot)}
                      title={
                        isLeaveApproved
                          ? `On Approved Leave: ${slot.leaveInfo?.reason || 'Leave'}`
                          : isLeavePending
                          ? `Leave Pending: ${slot.leaveInfo?.reason || 'Pending Leave'}`
                          : isBooked
                          ? 'Patient Booked Appointment'
                          : 'Available for Patient Booking'
                      }
                      className={`py-2 px-1 text-center rounded-xl text-[11px] sm:text-xs font-black transition-all cursor-pointer select-none flex items-center justify-center gap-1 ${
                        isLeaveApproved
                          ? 'bg-rose-100/90 text-rose-800 border border-rose-300 shadow-2xs hover:bg-rose-200/90 ring-rose-400'
                          : isLeavePending
                          ? 'bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs hover:bg-amber-100 ring-amber-400'
                          : isBooked
                          ? 'bg-blue-100 text-blue-800 border border-blue-200 shadow-2xs hover:bg-blue-200/80'
                          : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/80 shadow-2xs'
                      }`}
                    >
                      {isLeaveApproved && <XCircle className="size-3 text-rose-600 shrink-0" />}
                      {isLeavePending && <Clock className="size-3 text-amber-600 shrink-0" />}
                      <span className={isLeaveApproved || isLeavePending ? 'line-through' : ''}>
                        {slot.time}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Evening Session */}
          {datePreviewData.eveningSlots.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center justify-between text-xs font-black text-slate-700">
                <div className="flex items-center gap-2">
                  <Clock className="size-3.5 text-indigo-600" />
                  <span>Evening Session (05:00 PM - 08:00 PM)</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400">
                  {datePreviewData.eveningSlots.length} slots
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {datePreviewData.eveningSlots.map((slot, i) => {
                  const isLeaveApproved = slot.status === 'leave_approved'
                  const isLeavePending = slot.status === 'leave_pending'
                  const isBooked = slot.status === 'booked'

                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setInspectedSlot(slot)}
                      title={
                        isLeaveApproved
                          ? `On Approved Leave: ${slot.leaveInfo?.reason || 'Leave'}`
                          : isLeavePending
                          ? `Leave Pending: ${slot.leaveInfo?.reason || 'Pending Leave'}`
                          : isBooked
                          ? 'Patient Booked Appointment'
                          : 'Available for Patient Booking'
                      }
                      className={`py-2 px-1 text-center rounded-xl text-[11px] sm:text-xs font-black transition-all cursor-pointer select-none flex items-center justify-center gap-1 ${
                        isLeaveApproved
                          ? 'bg-rose-100/90 text-rose-800 border border-rose-300 shadow-2xs hover:bg-rose-200/90 ring-rose-400'
                          : isLeavePending
                          ? 'bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs hover:bg-amber-100 ring-amber-400'
                          : isBooked
                          ? 'bg-blue-100 text-blue-800 border border-blue-200 shadow-2xs hover:bg-blue-200/80'
                          : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/80 shadow-2xs'
                      }`}
                    >
                      {isLeaveApproved && <XCircle className="size-3 text-rose-600 shrink-0" />}
                      {isLeavePending && <Clock className="size-3 text-amber-600 shrink-0" />}
                      <span className={isLeaveApproved || isLeavePending ? 'line-through' : ''}>
                        {slot.time}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="py-12 px-4 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 space-y-2">
          <Clock className="size-8 text-slate-400 mx-auto" />
          <p className="text-xs sm:text-sm font-bold text-slate-700">Clinic Closed (Day Off)</p>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Select another date or enable this day in your Weekly Routine to accept appointments.
          </p>
        </div>
      )}

      {/* 6. Interactive Inspected Slot Modal */}
      {inspectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setInspectedSlot(null)}
          />
          <div className="relative z-10 w-full max-w-sm bg-white rounded-3xl border border-slate-200 shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="size-4.5 text-blue-600" />
                <h4 className="text-sm font-black text-slate-900">Slot Details: {inspectedSlot.time}</h4>
              </div>
              <button
                type="button"
                onClick={() => setInspectedSlot(null)}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400 font-semibold">Date</span>
                <span className="font-bold text-slate-800">{formattedDateTitle}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400 font-semibold">Slot Status</span>
                {inspectedSlot.status === 'leave_approved' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300">
                    On Leave (Approved)
                  </span>
                )}
                {inspectedSlot.status === 'leave_pending' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                    Leave Pending Review
                  </span>
                )}
                {inspectedSlot.status === 'booked' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-200">
                    Booked Patient
                  </span>
                )}
                {inspectedSlot.status === 'available' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Available for Booking
                  </span>
                )}
              </div>

              {inspectedSlot.leaveInfo && (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px]">
                    <ShieldAlert className="size-3.5 text-rose-600" />
                    <span>Leave Specification:</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    <strong>Reason:</strong> {inspectedSlot.leaveInfo.reason}
                  </p>
                  <p className="text-[11px] text-slate-600">
                    <strong>Timing Window:</strong> {inspectedSlot.leaveInfo.timingLabel}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {inspectedSlot.status === 'leave_approved'
                      ? 'Approved by hospital admin. Slot is locked from public booking.'
                      : 'Pending admin review. Slot is blocked to protect patients.'}
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setInspectedSlot(null)}
              className="w-full py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs cursor-pointer shadow-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* 7. Comprehensive Industrial Legend Footer */}
      <div className="pt-3.5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-bold text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-emerald-500 shrink-0" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-blue-600 shrink-0" />
          <span>Booked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-rose-500 shrink-0" />
          <span>On Leave (Approved)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-amber-500 shrink-0" />
          <span>Leave Pending</span>
        </div>
      </div>
    </div>
  )
}

export default DoctorLiveSlotPreview
