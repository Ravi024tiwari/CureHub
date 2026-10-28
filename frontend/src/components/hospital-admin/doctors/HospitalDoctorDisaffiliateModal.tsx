import { type FC } from 'react'
import {
  AlertTriangle,
  X,
  Loader2,
} from 'lucide-react'
import { useHospitalAdminDoctorsStore } from '@/store/hospitalAdminDoctorsStore'
import { DoctorAvatar } from '@/components/hospital-admin/join-requests/JoinRequestsTable'

export const HospitalDoctorDisaffiliateModal: FC = () => {
  const {
    disaffiliateModal,
    closeDisaffiliateModal,
    confirmDisaffiliate,
  } = useHospitalAdminDoctorsStore()

  if (!disaffiliateModal.isOpen || !disaffiliateModal.doctor) return null

  const doctor = disaffiliateModal.doctor
  const doctorName = doctor.userId?.name || 'Dr. Specialist'
  const hospitalName = doctor.hospitalId?.name || 'Hospital'
  const department = doctor.department || 'General Medicine'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="size-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="size-6" />
          </div>
          <button
            type="button"
            onClick={closeDisaffiliateModal}
            disabled={disaffiliateModal.isSubmitting}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Title & Body */}
        <div className="space-y-2">
          <h3 className="text-lg font-black text-slate-900 tracking-tight">
            Remove Doctor from Hospital?
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Are you sure you want to disaffiliate{' '}
            <strong className="text-slate-800">{doctorName}</strong> from{' '}
            <strong className="text-slate-800">{hospitalName}</strong>?
          </p>
        </div>

        {/* Doctor Summary Card */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3.5">
          <DoctorAvatar
            name={doctorName}
            avatarUrl={doctor.userId?.avatar}
            size="md"
          />
          <div className="min-w-0">
            <h4 className="text-sm font-black text-slate-900 truncate">
              {doctorName}
            </h4>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mt-0.5 truncate">
              <span className="text-blue-600">{department}</span>
              <span>•</span>
              <span className="truncate">{hospitalName}</span>
            </div>
          </div>
        </div>

        {/* Warning Callout */}
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-800 font-medium leading-relaxed">
          ⚠️ Note: This doctor will no longer appear on {hospitalName}’s public OPD directory, and new patients won't be able to book consultations under this hospital branch.
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={closeDisaffiliateModal}
            disabled={disaffiliateModal.isSubmitting}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={confirmDisaffiliate}
            disabled={disaffiliateModal.isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black transition-all shadow-xs cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {disaffiliateModal.isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Removing...</span>
              </>
            ) : (
              <span>Confirm Disaffiliation</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default HospitalDoctorDisaffiliateModal
