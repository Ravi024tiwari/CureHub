import React from 'react'
import {
  X,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
} from 'lucide-react'
import { useHospitalAdminLeavesStore } from '@/store/hospitalAdminLeavesStore'

export const DoctorLeaveActionModal: React.FC = () => {
  const {
    actionModal,
    isUpdatingStatus,
    actionErrorMessage,
    closeActionModal,
    setActionModalRemark,
    submitStatusUpdate,
  } = useHospitalAdminLeavesStore()

  if (!actionModal.isOpen || !actionModal.leave) return null

  const { mode, leave, remark } = actionModal
  const doctor = leave.doctorId as any
  const doctorName = (doctor?.userId as any)?.name || 'Doctor'

  const isReject = mode === 'REJECT'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submitStatusUpdate()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={closeActionModal}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`size-11 rounded-2xl flex items-center justify-center border shadow-2xs ${
                isReject
                  ? 'bg-rose-50 text-rose-600 border-rose-200'
                  : 'bg-emerald-50 text-emerald-600 border-emerald-200'
              }`}
            >
              {isReject ? <XCircle className="size-5.5" /> : <CheckCircle2 className="size-5.5" />}
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                {isReject ? 'Reject Leave Request' : 'Approve Leave Request'}
              </h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Doctor: <strong className="text-slate-800">{doctorName}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeActionModal}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {actionErrorMessage && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="size-4 shrink-0 text-rose-600" />
              <span>{actionErrorMessage}</span>
            </div>
          )}

          {isReject ? (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200/80 text-rose-950 text-xs space-y-1">
                <p className="font-bold">Slot Restoration Notice:</p>
                <p className="text-[11px] text-rose-900/90 leading-relaxed">
                  Rejecting this leave request will immediately reopen any blocked time slots back to
                  AVAILABLE for patient appointments.
                </p>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                  Rejection Reason / Comments <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={remark}
                  onChange={(e) => setActionModalRemark(e.target.value)}
                  placeholder="Explain why this leave application is being rejected (e.g. high patient OPD volume scheduled, department staff shortage)..."
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-rose-500 focus:bg-white transition-colors"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-emerald-950 text-xs space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-emerald-800">
                  <Info className="size-4 shrink-0 text-emerald-600" />
                  <span>Production Booking Safeguard:</span>
                </p>
                <p className="text-[11px] text-emerald-900/90 leading-relaxed">
                  Upon approval, unbooked slots will remain locked. Any active patient appointments
                  placed in the priority 7-day reschedule window will remain safe with zero refund
                  deduction while the doctor reassigns their alternate dates.
                </p>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                  Approval Remarks (Optional)
                </label>
                <textarea
                  rows={2}
                  value={remark}
                  onChange={(e) => setActionModalRemark(e.target.value)}
                  placeholder="Optional approval note or internal hospital remark..."
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                />
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              disabled={isUpdatingStatus}
              onClick={closeActionModal}
              className="px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isUpdatingStatus || (isReject && !remark.trim())}
              className={`px-5 py-2.5 rounded-2xl text-white font-black text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                isReject
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/25'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25'
              }`}
            >
              {isUpdatingStatus ? (
                <div className="flex items-center gap-2">
                  <div className="size-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : isReject ? (
                'Confirm Rejection'
              ) : (
                'Confirm Approval'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

