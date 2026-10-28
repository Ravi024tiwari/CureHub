import { useState, type FC } from 'react'
import { X, Calendar, Clock, Loader2 } from 'lucide-react'
import { useHospitalAdminAppointmentsStore } from '@/store/hospitalAdminAppointmentsStore'
import type { AdminAppointmentItem } from '@/types/hospitalAdmin'

export const RescheduleAppointmentModal: FC<{
  appointment: AdminAppointmentItem | null
  isOpen: boolean
  onClose: () => void
}> = ({ appointment, isOpen, onClose }) => {
  const { rescheduleAppointment } = useHospitalAdminAppointmentsStore()
  const [selectedDate, setSelectedDate] = useState('2024-10-28')
  const [selectedTime, setSelectedTime] = useState('11:00 AM')
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen || !appointment) return null

  const availableSlots = [
    '09:30 AM',
    '10:00 AM',
    '10:30 AM',
    '11:00 AM',
    '11:30 AM',
    '02:00 PM',
    '02:30 PM',
    '03:00 PM',
    '04:00 PM',
  ]

  const handleConfirm = async () => {
    setIsSubmitting(true)
    const success = await rescheduleAppointment(appointment._id, {
      date: selectedDate,
      startTime: selectedTime,
      reason,
    })
    setIsSubmitting(false)
    if (success) {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-blue-50/50">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Calendar className="size-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                Reschedule Visit
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {appointment.appointmentNumber}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs text-slate-600 space-y-1">
            <p>
              Current: <strong className="text-slate-900">{appointment.date} at {appointment.startTime}</strong>
            </p>
            <p>
              Doctor: <strong className="text-slate-900">{appointment.doctor.name}</strong> ({appointment.doctor.department})
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Select New Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Select Available Time Slot
            </label>
            <div className="grid grid-cols-3 gap-2">
              {availableSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedTime(slot)}
                  className={`py-2 px-2 text-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedTime === slot
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Reason (Optional)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Doctor schedule adjustment..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition-all shadow-sm hover:shadow cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Rescheduling...</span>
              </>
            ) : (
              <span>Confirm New Slot</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default RescheduleAppointmentModal

