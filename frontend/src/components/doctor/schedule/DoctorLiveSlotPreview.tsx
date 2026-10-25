import { useState, useMemo, type FC } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  CalendarOff,
  Clock,
  Sparkles,
} from 'lucide-react'
import type { DoctorScheduleRule, DoctorLeaveItem } from '@/services/doctorService'

interface DoctorLiveSlotPreviewProps {
  scheduleRules: DoctorScheduleRule[]
  leaves: DoctorLeaveItem[]
}

export const DoctorLiveSlotPreview: FC<DoctorLiveSlotPreviewProps> = ({
  scheduleRules,
  leaves,
}) => {
  // Current preview date (defaults to tomorrow or today)
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date()
    return d
  })

  // Format date helper: YYYY-MM-DD
  const dateString = useMemo(() => {
    const y = selectedDate.getFullYear()
    const m = String(selectedDate.getMonth() + 1).padStart(2, '0')
    const d = String(selectedDate.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }, [selectedDate])

  // Navigation handlers
  const handlePrevDay = () => {
    const next = new Date(selectedDate)
    next.setDate(next.getDate() - 1)
    setSelectedDate(next)
  }

  const handleNextDay = () => {
    const next = new Date(selectedDate)
    next.setDate(next.getDate() + 1)
    setSelectedDate(next)
  }

  // Check status for selected date
  const datePreviewData = useMemo(() => {
    // 1. Is on leave?
    const leave = leaves.find((l) => l.date === dateString)
    if (leave) {
      return {
        status: 'LEAVE' as const,
        leaveReason: leave.reason || 'Personal Leave',
        morningSlots: [],
        eveningSlots: [],
        slotDuration: 20,
      }
    }

    // 2. Day of week (0 = Sunday, 1 = Monday...)
    const dayOfWeek = selectedDate.getDay()
    const matchingRules = scheduleRules.filter((r) => r.dayOfWeek === dayOfWeek)

    if (matchingRules.length === 0) {
      return {
        status: 'DAY_OFF' as const,
        leaveReason: null,
        morningSlots: [],
        eveningSlots: [],
        slotDuration: 20,
      }
    }

    // Helpers to generate slots between start & end
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

    // Split rules into Morning (< 14:00) and Evening (>= 14:00)
    let morningSlots: Array<{ time: string; status: 'available' | 'booked' }> = []
    let eveningSlots: Array<{ time: string; status: 'available' | 'booked' }> = []

    matchingRules.forEach((rule, ruleIdx) => {
      const startMin = toMinutes(rule.startTime)
      const endMin = toMinutes(rule.endTime)
      const isMorning = startMin < 14 * 60

      const slots: Array<{ time: string; status: 'available' | 'booked' }> = []
      let current = startMin
      let idx = 0

      while (current + slotDuration <= endMin) {
        // Mock a couple booked slots for real-looking preview
        const isBooked = (ruleIdx + idx) % 5 === 2
        slots.push({
          time: toTimeString(current),
          status: isBooked ? 'booked' : 'available',
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

    return {
      status: 'AVAILABLE' as const,
      leaveReason: null,
      morningSlots,
      eveningSlots,
      slotDuration,
    }
  }, [selectedDate, dateString, scheduleRules, leaves])

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

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-5">
      {/* Header */}
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
          See how your available slots will appear to patients.
        </p>
      </div>

      {/* Date Navigation Bar */}
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

      {/* Selected Day Status Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200/80 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-blue-600 shrink-0" />
            <span className="text-xs sm:text-sm font-black text-slate-900">
              {formattedDateSubtitle}
            </span>
          </div>

          {datePreviewData.status === 'AVAILABLE' && (
            <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100/80 text-emerald-800 border border-emerald-300/80">
              Available
            </span>
          )}

          {datePreviewData.status === 'LEAVE' && (
            <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
              On Leave
            </span>
          )}

          {datePreviewData.status === 'DAY_OFF' && (
            <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
              Day Off
            </span>
          )}
        </div>

        <p className="text-xs text-slate-500 font-medium pl-6">
          {datePreviewData.status === 'AVAILABLE' &&
            `Slots are generated with ${datePreviewData.slotDuration} minutes duration.`}
          {datePreviewData.status === 'LEAVE' &&
            `Doctor is on approved leave (${datePreviewData.leaveReason}). No bookings permitted.`}
          {datePreviewData.status === 'DAY_OFF' &&
            'Clinic is closed on this day according to your weekly schedule.'}
        </p>
      </div>

      {/* Slots Section */}
      {datePreviewData.status === 'AVAILABLE' ? (
        <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
          {/* Morning Session */}
          {datePreviewData.morningSlots.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-black text-slate-700">
                <Clock className="size-3.5 text-blue-600" />
                <span>Morning Session (09:00 AM - 01:00 PM)</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {datePreviewData.morningSlots.map((slot, i) => (
                  <div
                    key={i}
                    className={`py-2 px-1 text-center rounded-xl text-[11px] sm:text-xs font-black transition-all ${
                      slot.status === 'booked'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200 shadow-2xs'
                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/80 shadow-2xs cursor-default'
                    }`}
                  >
                    {slot.time}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evening Session */}
          {datePreviewData.eveningSlots.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2 text-xs font-black text-slate-700">
                <Clock className="size-3.5 text-indigo-600" />
                <span>Evening Session (05:00 PM - 08:00 PM)</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {datePreviewData.eveningSlots.map((slot, i) => (
                  <div
                    key={i}
                    className={`py-2 px-1 text-center rounded-xl text-[11px] sm:text-xs font-black transition-all ${
                      slot.status === 'booked'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200 shadow-2xs'
                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/80 shadow-2xs cursor-default'
                    }`}
                  >
                    {slot.time}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="py-12 px-4 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 space-y-2">
          {datePreviewData.status === 'LEAVE' ? (
            <CalendarOff className="size-8 text-rose-400 mx-auto" />
          ) : (
            <Clock className="size-8 text-slate-400 mx-auto" />
          )}
          <p className="text-xs sm:text-sm font-bold text-slate-700">
            {datePreviewData.status === 'LEAVE'
              ? 'Doctor on Approved Leave'
              : 'Clinic Closed (Day Off)'}
          </p>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            {datePreviewData.status === 'LEAVE'
              ? 'Patients visiting your booking page will see that you are away on this date.'
              : 'Select another date or enable this day in your Weekly Routine to accept appointments.'}
          </p>
        </div>
      )}

      {/* Legend Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-emerald-500" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-blue-600" />
          <span>Booked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-slate-300" />
          <span>Not Available</span>
        </div>
      </div>
    </div>
  )
}
