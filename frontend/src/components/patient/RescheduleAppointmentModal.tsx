import { useState, type FC } from 'react'
import { X, Calendar, Clock, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { AppointmentCardData } from '@/types/patient'

interface RescheduleAppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  appointment: AppointmentCardData | null
  onConfirmReschedule: (id: string, newSlotId: string, reason?: string) => Promise<boolean>
}

export const RescheduleAppointmentModal: FC<RescheduleAppointmentModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onConfirmReschedule,
}) => {
  if (!isOpen || !appointment) return null

  const days = [
    { label: 'Mon', date: '27 Oct', full: 'Mon, 27 Oct 2026' },
    { label: 'Tue', date: '28 Oct', full: 'Tue, 28 Oct 2026' },
    { label: 'Wed', date: '29 Oct', full: 'Wed, 29 Oct 2026' },
    { label: 'Thu', date: '30 Oct', full: 'Thu, 30 Oct 2026' },
  ]

  const slots = [
    '09:30 AM - 10:00 AM',
    '10:30 AM - 11:00 AM',
    '11:30 AM - 12:00 PM',
    '03:00 PM - 03:30 PM',
    '04:00 PM - 04:30 PM',
    '05:00 PM - 05:30 PM',
  ]

  const [selectedDay, setSelectedDay] = useState(days[0].full)
  const [selectedSlot, setSelectedSlot] = useState(slots[0])
  const [rescheduleReason, setRescheduleReason] = useState('Schedule clash with personal work')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleConfirm = async () => {
    setIsSubmitting(true)
    await onConfirmReschedule(appointment._id, 'slot-reschedule-new', rescheduleReason)
    setIsSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-blue-50/50">
          <div className="flex items-center gap-2 text-blue-700">
            <RefreshCw className="size-5" />
            <h3 className="font-extrabold text-sm tracking-tight text-slate-900">
              Reschedule Appointment
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Current Slot Info */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1">
            <p className="font-bold text-slate-900">{appointment.doctorName}</p>
            <p className="text-[11px] text-slate-500">Currently Scheduled For:</p>
            <p className="font-semibold text-blue-700">
              {appointment.date} • {appointment.time}
            </p>
          </div>

          {/* Select New Date */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="size-3.5 text-blue-600" />
              Select New Date
            </label>
            <div className="grid grid-cols-4 gap-2">
              {days.map((d) => {
                const isSelected = selectedDay === d.full
                return (
                  <button
                    key={d.label}
                    type="button"
                    onClick={() => setSelectedDay(d.full)}
                    className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300'
                    }`}
                  >
                    <p className="text-[10px] font-medium opacity-80">{d.label}</p>
                    <p className="text-xs font-extrabold">{d.date}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Select New Slot */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="size-3.5 text-blue-600" />
              Available Time Slots
            </label>
            <div className="grid grid-cols-2 gap-2">
              {slots.map((s) => {
                const isSelected = selectedSlot === s
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSlot(s)}
                    className={`py-2 px-2 text-center rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    {s}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Reason for change */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Reason for Reschedule (Optional)
            </label>
            <input
              type="text"
              value={rescheduleReason}
              onChange={(e) => setRescheduleReason(e.target.value)}
              placeholder="e.g. Schedule conflict..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs font-bold text-slate-700 rounded-xl h-10 px-4 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 px-5 cursor-pointer shadow-xs"
          >
            {isSubmitting ? 'Rescheduling...' : 'Confirm Reschedule'}
          </Button>
        </div>
      </div>
    </div>
  )
}
