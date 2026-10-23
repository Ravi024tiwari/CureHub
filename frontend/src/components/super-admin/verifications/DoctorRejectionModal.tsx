import { useState, type FC } from 'react'
import { AlertTriangle, X, Send } from 'lucide-react'

interface DoctorRejectionModalProps {
  doctorName: string
  isOpen: boolean
  isLoading: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
}

export const DoctorRejectionModal: FC<DoctorRejectionModalProps> = ({
  doctorName,
  isOpen,
  isLoading,
  onClose,
  onConfirm,
}) => {
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  if (!isOpen) return null

  const quickReasons = [
    'Incomplete or expired medical license document',
    'Registration number could not be verified on Medical Council portal',
    'Experience credentials mismatch with hospital application',
    'Hospital affiliation could not be authenticated',
    'Missing specialization degree certificate',
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason.trim()) {
      setError('Please provide a specific reason for rejection.')
      return
    }
    setError('')
    onConfirm(reason.trim())
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-rose-50/70 border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="size-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-rose-950">
                Reject Doctor Application
              </h3>
              <p className="text-xs text-rose-700/80 font-medium">
                Rejecting application for {doctorName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white rounded-xl transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            Please specify the reason for rejection. This reason will be recorded on the platform and transmitted to the doctor so they can rectify their credentials.
          </p>

          {/* Quick Reason Suggestions */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Quick Suggestions:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {quickReasons.map((qr) => (
                <button
                  type="button"
                  key={qr}
                  onClick={() => setReason(qr)}
                  className="text-left text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                >
                  {qr}
                </button>
              ))}
            </div>
          </div>

          {/* Rejection Reason Textarea */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">
              Rejection Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value)
                if (error) setError('')
              }}
              placeholder="e.g. The uploaded medical council registration certificate is illegible. Please re-upload a clear copy."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-rose-500 focus:ring-3 focus:ring-rose-100 outline-none transition-all resize-none"
            />
            {error && (
              <p className="text-xs font-bold text-rose-600 mt-1">{error}</p>
            )}
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !reason.trim()}
              className="px-4.5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-rose-600/25 flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="size-3.5" />
              <span>{isLoading ? 'Rejecting...' : 'Confirm Rejection'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DoctorRejectionModal
