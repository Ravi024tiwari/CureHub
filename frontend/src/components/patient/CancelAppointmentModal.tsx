import { useState, type FC } from 'react'
import { X, AlertTriangle, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { AppointmentCardData } from '@/types/patient'

interface CancelAppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  appointment: AppointmentCardData | null
  onConfirmCancel: (id: string, reason: string) => Promise<boolean>
}

export const CancelAppointmentModal: FC<CancelAppointmentModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onConfirmCancel,
}) => {
  if (!isOpen || !appointment) return null

  const [selectedReason, setSelectedReason] = useState('Personal schedule conflict')
  const [customReason, setCustomReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const commonReasons = [
    'Personal schedule conflict',
    'Feeling better / Symptoms resolved',
    'Doctor advised different specialty',
    'Unable to travel to clinic',
    'Other reason',
  ]

  const handleConfirm = async () => {
    setIsSubmitting(true)
    const finalReason =
      selectedReason === 'Other reason' && customReason.trim()
        ? customReason.trim()
        : selectedReason
    await onConfirmCancel(appointment._id, finalReason)
    setIsSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-rose-50/50">
          <div className="flex items-center gap-2 text-rose-700">
            <AlertTriangle className="size-5" />
            <h3 className="font-extrabold text-sm tracking-tight text-slate-900">
              Cancel Appointment
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
          {/* Target Appointment Details */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">{appointment.doctorName}</span>
              <span className="font-mono font-semibold text-slate-500">
                {appointment.appointmentNumber}
              </span>
            </div>
            <p className="text-slate-500">{appointment.hospitalName}</p>
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 font-semibold text-slate-700">
              <span>{appointment.date}</span>
              <span>{appointment.time}</span>
            </div>
          </div>

          {/* Policy Notice */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
            <ShieldCheck className="size-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Appointments cancelled at least 48 hours prior are eligible for a 100% refund back to
              your original payment source within 5-7 business days.
            </p>
          </div>

          {/* Reason Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Reason for Cancellation
            </label>
            <div className="space-y-1.5">
              {commonReasons.map((r) => (
                <label
                  key={r}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                    selectedReason === r
                      ? 'bg-rose-50/70 border-rose-300 text-rose-900'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="cancelReason"
                    checked={selectedReason === r}
                    onChange={() => setSelectedReason(r)}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>

            {selectedReason === 'Other reason' && (
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Please describe your reason..."
                rows={2}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs font-bold text-slate-700 rounded-xl h-10 px-4 cursor-pointer"
          >
            Keep Appointment
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-10 px-5 cursor-pointer shadow-xs"
          >
            {isSubmitting ? 'Cancelling...' : 'Confirm Cancellation'}
          </Button>
        </div>
      </div>
    </div>
  )
}
