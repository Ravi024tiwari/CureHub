import { type FC } from 'react'
import { CheckCircle2, X, ShieldCheck, Stethoscope, Building2, UserCheck, AlertCircle } from 'lucide-react'

interface DoctorApproveModalProps {
  doctorName: string
  department?: string
  registrationNumber?: string
  hospitalName?: string
  hasHospital: boolean
  isOpen: boolean
  isLoading: boolean
  onClose: () => void
  onConfirm: () => void
}

export const DoctorApproveModal: FC<DoctorApproveModalProps> = ({
  doctorName,
  department = 'General Medicine',
  registrationNumber,
  hospitalName,
  hasHospital,
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
                Approve & Verify Doctor
              </h3>
              <p className="text-xs text-emerald-700/80 font-medium">
                Confirm verification credentials for {doctorName}
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
              <span className="font-semibold text-slate-500">Doctor Name:</span>
              <span className="font-black text-slate-800">{doctorName}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-500">Department:</span>
              <span className="font-bold text-slate-700 flex items-center gap-1">
                <Stethoscope className="size-3 text-blue-600" />
                <span>{department}</span>
              </span>
            </div>

            {registrationNumber && (
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">Medical Registration No.:</span>
                <span className="font-mono font-bold text-blue-700 flex items-center gap-1">
                  <ShieldCheck className="size-3 text-blue-600" />
                  <span>{registrationNumber}</span>
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-500">Practice Model:</span>
              {hasHospital ? (
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  <Building2 className="size-3 text-blue-600" />
                  <span className="truncate max-w-[200px]">{hospitalName}</span>
                </span>
              ) : (
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <UserCheck className="size-3 text-emerald-600" />
                  <span>Independent Practitioner</span>
                </span>
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start gap-2.5 text-xs text-blue-900 leading-relaxed font-medium">
            <AlertCircle className="size-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-blue-950">Verification Consequences:</p>
              <p className="mt-0.5 text-blue-800">
                The doctor will be immediately marked as <strong>Approved</strong>. They will gain platform access to manage patient consultations, electronic health records, OPD appointment schedules, and their verified profile will be visible to patients.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-end gap-2.5">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="size-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Approving...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="size-4 stroke-[2.4]" />
                <span>Confirm & Approve Doctor</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DoctorApproveModal
