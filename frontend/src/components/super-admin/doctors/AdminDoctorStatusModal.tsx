import { useState, useEffect, type FC } from 'react'
import { AlertTriangle, CheckCircle2, X, Send, ShieldCheck, ShieldAlert } from 'lucide-react'
import { useAdminDoctorsStore } from '@/store/adminDoctorsStore'

export const AdminDoctorStatusModal: FC = () => {
  const { statusModal, closeStatusModal, toggleDoctorStatus, isActionLoading } = useAdminDoctorsStore()
  const { isOpen, doctor, action } = statusModal

  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setReason('')
    setError('')
  }, [isOpen])

  if (!isOpen || !doctor) return null

  const doctorName = doctor.userId?.name
    ? doctor.userId.name.startsWith('Dr.')
      ? doctor.userId.name
      : `Dr. ${doctor.userId.name}`
    : 'Doctor'

  const isDisabling = action === 'disable'

  const quickReasons = [
    'Temporary account lock requested by doctor',
    'Medical council registration number verification pending',
    'Hospital affiliation contract ended or under review',
    'Reported clinical misconduct or patient dispute',
    'Non-compliance with platform teleconsultation policies',
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isDisabling && !reason.trim()) {
      setError('Please provide a specific reason for disabling this doctor account.')
      return
    }

    const nextState = !isDisabling
    await toggleDoctorStatus(doctor._id, nextState, isDisabling ? reason.trim() : undefined)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div
          className={`px-6 py-4.5 border-b flex items-center justify-between ${
            isDisabling ? 'bg-rose-50/80 border-rose-100' : 'bg-emerald-50/80 border-emerald-100'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`size-10 rounded-2xl flex items-center justify-center shrink-0 ${
                isDisabling ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
              }`}
            >
              {isDisabling ? (
                <ShieldAlert className="size-5 stroke-[2.2]" />
              ) : (
                <ShieldCheck className="size-5 stroke-[2.2]" />
              )}
            </div>
            <div>
              <h3 className={`text-sm sm:text-base font-black ${isDisabling ? 'text-rose-950' : 'text-emerald-950'}`}>
                {isDisabling ? 'Disable Doctor Account' : 'Re-Activate Doctor Account'}
              </h3>
              <p className={`text-xs font-medium ${isDisabling ? 'text-rose-700/80' : 'text-emerald-700/80'}`}>
                {doctorName} • {doctor.department || 'Specialist'}
              </p>
            </div>
          </div>
          <button
            onClick={closeStatusModal}
            disabled={isActionLoading}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white rounded-xl transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {isDisabling ? (
            <>
              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs">
                <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Disabling this doctor will immediately <strong>freeze their account</strong>. They will not be able to log in, accept patient appointments, or access OPD consultations.
                </p>
              </div>

              {/* Quick suggestions */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Quick Reason Suggestions:
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

              {/* Reason Textarea */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Reason for Disabling Account <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value)
                    if (error) setError('')
                  }}
                  placeholder="e.g. Account locked pending submission of renewed Medical Council license."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-rose-500 focus:ring-3 focus:ring-rose-100 outline-none transition-all resize-none"
                />
                {error && <p className="text-xs font-bold text-rose-600 mt-1">{error}</p>}
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to <strong>re-activate {doctorName}</strong>? Their login permissions will be restored, their profile will be visible to hospital OPDs, and they can resume consultations.
              </p>
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs text-emerald-800 font-semibold flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                <span>Verification and active clinical status will be restored immediately.</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={closeStatusModal}
              disabled={isActionLoading}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isActionLoading || (isDisabling && !reason.trim())}
              className={`px-4.5 py-2 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                isDisabling
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/25'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/25'
              }`}
            >
              {isDisabling ? <Send className="size-3.5" /> : <CheckCircle2 className="size-3.5" />}
              <span>
                {isActionLoading
                  ? 'Updating...'
                  : isDisabling
                  ? 'Confirm & Disable Doctor'
                  : 'Confirm & Activate Doctor'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminDoctorStatusModal
