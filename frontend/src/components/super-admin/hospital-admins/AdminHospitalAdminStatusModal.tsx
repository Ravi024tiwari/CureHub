import { useState, type FC } from 'react'
import { AlertTriangle, UserCheck, X } from 'lucide-react'
import { useAdminHospitalAdminsStore } from '@/store/adminHospitalAdminsStore'

export const AdminHospitalAdminStatusModal: FC = () => {
  const { statusModal, closeStatusModal, toggleAdminStatus, isActionLoading } =
    useAdminHospitalAdminsStore()
  const [reason, setReason] = useState('')

  if (!statusModal.isOpen || !statusModal.admin) return null

  const isDisabling = statusModal.action === 'disable'
  const adminName = statusModal.admin.userId?.name || 'this Administrator'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const success = await toggleAdminStatus(
      statusModal.admin!._id,
      !isDisabling,
      reason.trim() || undefined
    )
    if (success) {
      setReason('')
      closeStatusModal()
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`size-9 rounded-xl flex items-center justify-center shrink-0 ${
                isDisabling
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              {isDisabling ? (
                <AlertTriangle className="size-5" />
              ) : (
                <UserCheck className="size-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                {isDisabling ? 'Disable Administrator' : 'Reactivate Administrator'}
              </h3>
              <p className="text-xs text-slate-400 font-medium">Access Control Governance</p>
            </div>
          </div>
          <button
            onClick={closeStatusModal}
            className="size-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Are you sure you want to{' '}
            <span className="font-bold text-slate-900">
              {isDisabling ? 'temporarily suspend' : 'reactivate'}
            </span>{' '}
            the platform access for{' '}
            <span className="font-black text-slate-900">{adminName}</span>?
            {isDisabling &&
              ' While disabled, they will not be able to manage doctors, slots, or appointments.'}
          </p>

          {isDisabling && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Suspension / Disable Reason (Optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Audit check pending, hospital authority change, documentation expired..."
                rows={3}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all placeholder:text-slate-400"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              disabled={isActionLoading}
              onClick={closeStatusModal}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isActionLoading}
              className={`px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                isDisabling
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
              }`}
            >
              {isActionLoading && (
                <div className="size-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              <span>
                {isDisabling ? 'Confirm & Disable' : 'Confirm & Reactivate'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
