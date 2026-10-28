import { useState, type FC } from 'react'
import { X, AlertCircle, Loader2 } from 'lucide-react'
import { useHospitalAdminAppointmentsStore } from '@/store/hospitalAdminAppointmentsStore'
import type { AdminAppointmentItem } from '@/types/hospitalAdmin'

export const CancelAppointmentModal: FC<{
  appointment: AdminAppointmentItem | null
  isOpen: boolean
  onClose: () => void
}> = ({ appointment, isOpen, onClose }) => {
  const { cancelAppointment } = useHospitalAdminAppointmentsStore()
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen || !appointment) return null

  const handleConfirm = async () => {
    setIsSubmitting(true)
    const success = await cancelAppointment(appointment._id, reason)
    setIsSubmitting(false)
    if (success) {
      onClose()
    }
  }

  const reasons = [
    'Doctor unavailable / emergency leave',
    'Hospital departmental emergency',
    'Requested by patient directly',
    'Duplicate booking',
    'Other administrative reason',
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-rose-50/50">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertCircle className="size-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                Cancel Appointment
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
          <p className="text-xs text-slate-600">
            Are you sure you want to cancel the on-site appointment for{' '}
            <strong className="text-slate-900">{appointment.patient.name}</strong> with{' '}
            <strong className="text-slate-900">{appointment.doctor.name}</strong> on{' '}
            <strong className="text-slate-900">{appointment.date} at {appointment.startTime}</strong>?
          </p>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Reason for Cancellation
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400"
            >
              <option value="">Select cancellation reason...</option>
              {reasons.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3 text-[11px] text-amber-800 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <span>●</span>
              <span>Important Action Note:</span>
            </p>
            <p className="text-amber-700">
              The assigned hospital time slot will be immediately freed up for other patients. If payment was collected, a refund will be processed.
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Keep Appointment
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs transition-all shadow-sm hover:shadow cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Cancelling...</span>
              </>
            ) : (
              <span>Confirm Cancellation</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CancelAppointmentModal

