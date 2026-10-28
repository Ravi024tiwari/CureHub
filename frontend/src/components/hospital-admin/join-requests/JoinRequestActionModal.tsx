import { type FC } from 'react'
import { X, CheckCircle2, XCircle, AlertTriangle, Loader2 } from 'lucide-react'
import { useHospitalAdminJoinRequestsStore } from '@/store/hospitalAdminJoinRequestsStore'

export const JoinRequestActionModal: FC = () => {
  const { actionModal, closeActionModal, setActionReason, confirmActionModal } =
    useHospitalAdminJoinRequestsStore()

  if (!actionModal.isOpen) return null

  const isApprove = actionModal.type === 'APPROVE'

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div
              className={`size-8 rounded-xl flex items-center justify-center ${
                isApprove ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              }`}
            >
              {isApprove ? (
                <CheckCircle2 className="size-4.5" />
              ) : (
                <XCircle className="size-4.5" />
              )}
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              {isApprove ? 'Approve Doctor Affiliation' : 'Decline Affiliation Request'}
            </h3>
          </div>

          <button
            onClick={closeActionModal}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            <X className="size-4.5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {isApprove ? (
              <>
                Are you sure you want to approve{' '}
                <strong className="text-slate-900 font-bold">{actionModal.doctorName}</strong> to
                join your medical staff? The doctor will immediately receive their active hospital
                affiliation and patients will be able to book appointments.
              </>
            ) : (
              <>
                You are declining the application from{' '}
                <strong className="text-slate-900 font-bold">{actionModal.doctorName}</strong>.
                Please provide a brief reason so the doctor can be notified.
              </>
            )}
          </p>

          {!isApprove && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Reason for Rejection <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={actionModal.reason}
                onChange={(e) => setActionReason(e.target.value)}
                rows={3}
                placeholder="e.g., Department currently at full capacity, please reapply next quarter."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none"
              />
            </div>
          )}

          {isApprove && (
            <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-3.5 text-xs text-emerald-800 flex items-start gap-2.5">
              <AlertTriangle className="size-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Once approved, the doctor's schedule rules and consultation availability will become
                active under your hospital branch.
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            onClick={closeActionModal}
            disabled={actionModal.isSubmitting}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={confirmActionModal}
            disabled={actionModal.isSubmitting || (!isApprove && !actionModal.reason.trim())}
            className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              isApprove
                ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 shadow-emerald-600/20'
                : 'bg-rose-600 hover:bg-rose-700 active:scale-95 shadow-rose-600/20'
            }`}
          >
            {actionModal.isSubmitting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{isApprove ? 'Confirm Approval' : 'Decline Application'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
export default JoinRequestActionModal
