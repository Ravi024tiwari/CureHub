import { type FC } from 'react'
import {
  CheckCircle2,
  X,
  ShieldCheck,
  Building2,
  Briefcase,
  AlertCircle,
  IdCard,
} from 'lucide-react'

interface ApproveAdminVerificationModalProps {
  adminName: string
  designation?: string
  hospitalName?: string
  hasHospital: boolean
  governmentIdType?: string
  governmentIdNumber?: string
  isOpen: boolean
  isLoading: boolean
  onClose: () => void
  onConfirm: () => void
}

export const ApproveAdminVerificationModal: FC<ApproveAdminVerificationModalProps> = ({
  adminName,
  designation = 'Hospital Administrator',
  hospitalName,
  hasHospital,
  governmentIdType,
  governmentIdNumber,
  isOpen,
  isLoading,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4.5 bg-emerald-50/80 border-b border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="size-5 stroke-[2.4]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-emerald-950">
                Approve & Verify Hospital Admin
              </h3>
              <p className="text-xs text-emerald-700/80 font-medium">
                Confirm verification credentials for {adminName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white rounded-xl transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-500">Administrator Name:</span>
              <span className="font-black text-slate-800">{adminName}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-500">Designation:</span>
              <span className="font-bold text-slate-700 flex items-center gap-1">
                <Briefcase className="size-3 text-blue-600" />
                <span>{designation}</span>
              </span>
            </div>

            {governmentIdType && (
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">Government ID:</span>
                <span className="font-mono font-bold text-blue-700 flex items-center gap-1">
                  <IdCard className="size-3 text-blue-600" />
                  <span>
                    {governmentIdType}
                    {governmentIdNumber ? ` (${governmentIdNumber})` : ''}
                  </span>
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-500">Hospital:</span>
              {hasHospital ? (
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  <Building2 className="size-3 text-blue-600" />
                  <span className="truncate max-w-[200px]">{hospitalName}</span>
                </span>
              ) : (
                <span className="font-semibold text-slate-400 italic">
                  Not registered yet (will register later)
                </span>
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start gap-2.5 text-xs text-blue-900 leading-relaxed font-medium">
            <AlertCircle className="size-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              Approving this profile will grant the administrator full access to the Hospital Management Dashboard, enabling hospital creation, staff management, and operational workflows.
            </span>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-4.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <ShieldCheck className="size-3.5" />
              <span>{isLoading ? 'Verifying...' : 'Confirm Approval'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApproveAdminVerificationModal
