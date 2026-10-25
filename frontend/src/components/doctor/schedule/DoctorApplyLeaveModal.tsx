import { useState, type FC, type FormEvent } from 'react'
import { X, CalendarOff, AlertTriangle, CheckCircle2 } from 'lucide-react'

interface DoctorApplyLeaveModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (date: string, reason: string) => Promise<{ success: boolean; message?: string }>
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
  const [date, setDate] = useState(todayStr)
  const [selectedReason, setSelectedReason] = useState(COMMON_REASONS[0])
  const [customReason, setCustomReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resultAlert, setResultAlert] = useState<{ type: 'error' | 'success'; text: string } | null>(
    null
  )

  if (!isOpen) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setResultAlert(null)

    if (!date) {
      setResultAlert({ type: 'error', text: 'Please pick a valid leave date.' })
      return
    }

    const finalReason = customReason.trim() || selectedReason
    setIsSubmitting(true)
    const res = await onSubmit(date, finalReason)
    setIsSubmitting(false)

    if (res.success) {
      setResultAlert({
        type: 'success',
        text: res.message || 'Leave applied successfully.',
      })
      setTimeout(() => {
        onClose()
      }, 1500)
    } else {
      setResultAlert({
        type: 'error',
        text: res.message || 'Failed to apply leave. Please try again.',
      })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center shadow-2xs">
              <CalendarOff className="size-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Apply for Leave
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Choose the date and reason for your scheduled leave.
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Result Alert if any */}
          {resultAlert && (
            <div
              className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center gap-2.5 ${
                resultAlert.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {resultAlert.type === 'success' ? (
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="size-4 text-rose-600 shrink-0" />
              )}
              <span>{resultAlert.text}</span>
            </div>
          )}

          {/* Date Picker */}
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

          {/* Reason Preset Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Reason for Leave
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

          {/* Custom Note/Reason */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Additional Details / Custom Reason (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Attending 3-day cardiology summit in New Delhi"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Reschedule Alert Notice */}
          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900 font-medium">
            <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              Slots for this date will be blocked immediately. Any patient appointments
              already confirmed will be moved to a <strong>7-day priority rescheduling window</strong>.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs sm:text-sm cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 cursor-pointer disabled:opacity-50 transition-all active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Confirm & Apply Leave</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
