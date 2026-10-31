import { useState, useMemo, type FC } from 'react'
import {
  X,
  Calendar,
  Clock,
  RefreshCw,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Sun,
  Sunset,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { AppointmentCardData } from '@/types/patient'

interface RescheduleAppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  appointment: AppointmentCardData | null
  onConfirmReschedule: (
    id: string,
    params: string | { newSlotId?: string; date?: string; startTime?: string; reason?: string },
    reason?: string
  ) => Promise<boolean>
}

export const RescheduleAppointmentModal: FC<RescheduleAppointmentModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onConfirmReschedule,
}) => {
  if (!isOpen || !appointment) return null

  const isLeaveReschedule = Boolean(
    appointment.status === 'Reschedule Required' ||
    (appointment.status as string) === 'RESCHEDULE_REQUIRED' ||
    appointment.doctorLeaveReason
  )

  // Dynamically calculate the next 7 calendar days starting from tomorrow
  const upcomingDays = useMemo(() => {
    const list = []
    const today = new Date()
    for (let i = 1; i <= 7; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() + i)
      const label = d.toLocaleDateString('en-US', { weekday: 'short' })
      const dateNumMonth = d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })
      const full = d.toLocaleDateString('en-US', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
      const isoDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`
      list.push({ label, date: dateNumMonth, full, isoDate })
    }
    return list
  }, [])

  // Structured time slots with 24h start times for API submission
  const morningSlots = [
    { label: '09:00 AM - 09:30 AM', time24: '09:00' },
    { label: '10:00 AM - 10:30 AM', time24: '10:00' },
    { label: '11:00 AM - 11:30 AM', time24: '11:00' },
    { label: '11:30 AM - 12:00 PM', time24: '11:30' },
  ]

  const afternoonSlots = [
    { label: '02:00 PM - 02:30 PM', time24: '14:00' },
    { label: '03:00 PM - 03:30 PM', time24: '15:00' },
    { label: '04:00 PM - 04:30 PM', time24: '16:00' },
    { label: '05:00 PM - 05:30 PM', time24: '17:00' },
  ]

  const [selectedDay, setSelectedDay] = useState(upcomingDays[0])
  const [selectedSlot, setSelectedSlot] = useState(morningSlots[1])
  const [rescheduleReason, setRescheduleReason] = useState(
    isLeaveReschedule
      ? 'Rescheduled due to doctor unavailable / leave'
      : 'Schedule conflict with personal work'
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleConfirm = async () => {
    setIsSubmitting(true)
    const success = await onConfirmReschedule(appointment._id, {
      date: selectedDay.isoDate,
      startTime: selectedSlot.time24,
      reason: rescheduleReason,
    })
    setIsSubmitting(false)
    if (success) {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200/80 animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/80 via-white to-blue-50/30">
          <div className="flex items-center gap-2.5 text-blue-700">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <RefreshCw className="size-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900">
                Reschedule Appointment
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Pick any available future consultation slot
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Priority Doctor Leave Notice Banner */}
          {isLeaveReschedule && (
            <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/90 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <AlertTriangle className="size-4 text-amber-600 shrink-0" />
                <span>Zero-Cost Priority Reschedule</span>
              </div>
              <p className="text-[11px] text-amber-700 leading-relaxed">
                {appointment.doctorLeaveReason || 'Doctor is on scheduled hospital leave.'}{' '}
                Your original payment of ₹{appointment.consultationFee || 500} has been protected in full.
                You can select any new slot with <strong>zero additional charges</strong>.
              </p>
              <div className="flex items-center justify-between pt-1 border-t border-amber-200/60 text-[11px] font-bold text-amber-900">
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <ShieldCheck className="size-3.5 text-emerald-600" />
                  100% Free Priority Benefit
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px]">
                  Fee: ₹0
                </span>
              </div>
            </div>
          )}

          {/* Current Slot Info Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-center justify-between gap-3">
            <div>
              <p className="font-extrabold text-slate-900 text-xs sm:text-sm">{appointment.doctorName}</p>
              <p className="text-[11px] text-slate-500">{appointment.hospitalName}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Currently Scheduled</p>
              <p className="font-bold text-blue-700 text-xs">
                {appointment.date}
              </p>
              <p className="text-[11px] text-slate-600 font-medium">{appointment.time}</p>
            </div>
          </div>

          {/* 1. Select New Date (Dynamic Upcoming Calendar Days) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="size-3.5 text-blue-600" />
              Select New Date
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 sm:gap-2">
              {upcomingDays.map((d) => {
                const isSelected = selectedDay.isoDate === d.isoDate
                return (
                  <button
                    key={d.isoDate}
                    type="button"
                    onClick={() => setSelectedDay(d)}
                    className={`p-2 rounded-2xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20 scale-[1.02]'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50/30'
                    }`}
                  >
                    <p className={`text-[10px] font-bold ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                      {d.label}
                    </p>
                    <p className="text-xs font-black">{d.date.split(' ')[0]}</p>
                    <p className={`text-[9px] font-medium ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>
                      {d.date.split(' ')[1]}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 2. Select Time Slot (Morning & Afternoon) */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="size-3.5 text-blue-600" />
              Available Consultation Slots
            </label>

            {/* Morning Slots */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <Sun className="size-3 text-amber-500" />
                Morning Consultation
              </span>
              <div className="grid grid-cols-2 gap-2">
                {morningSlots.map((s) => {
                  const isSelected = selectedSlot.time24 === s.time24
                  return (
                    <button
                      key={s.time24}
                      type="button"
                      onClick={() => setSelectedSlot(s)}
                      className={`py-2 px-2.5 text-center rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/40'
                      }`}
                    >
                      <span>{s.label.split(' - ')[0]}</span>
                      {isSelected && <CheckCircle2 className="size-3.5" />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Afternoon Slots */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <Sunset className="size-3 text-orange-500" />
                Afternoon / Evening Consultation
              </span>
              <div className="grid grid-cols-2 gap-2">
                {afternoonSlots.map((s) => {
                  const isSelected = selectedSlot.time24 === s.time24
                  return (
                    <button
                      key={s.time24}
                      type="button"
                      onClick={() => setSelectedSlot(s)}
                      className={`py-2 px-2.5 text-center rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/40'
                      }`}
                    >
                      <span>{s.label.split(' - ')[0]}</span>
                      {isSelected && <CheckCircle2 className="size-3.5" />}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* 3. Reason for change */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Reason / Remarks for Reschedule
            </label>
            <input
              type="text"
              value={rescheduleReason}
              onChange={(e) => setRescheduleReason(e.target.value)}
              placeholder="e.g. Rescheduled due to doctor leave..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-800"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="text-left text-xs">
            <span className="text-slate-400 font-medium block text-[10px]">New Appointment:</span>
            <span className="font-extrabold text-slate-800 text-xs">
              {selectedDay.label}, {selectedDay.date} • {selectedSlot.label.split(' - ')[0]}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs font-bold text-slate-700 rounded-xl h-9.5 px-3.5 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-9.5 px-4.5 cursor-pointer shadow-md shadow-blue-500/20 inline-flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Rescheduling...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="size-3.5" />
                  <span>Confirm Reschedule</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
