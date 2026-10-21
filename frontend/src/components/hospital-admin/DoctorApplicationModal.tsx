import { type FC } from 'react'
import {
  X,
  Stethoscope,
  IndianRupee,
  Award,
  Check,
  Ban,
  Mail,
  Phone,
} from 'lucide-react'
import { useHospitalAdminStore } from '@/store/hospitalAdminStore'

export const DoctorApplicationModal: FC = () => {
  const { selectedApplicant, setSelectedApplicant, approveDoctorRequest, rejectDoctorRequest } =
    useHospitalAdminStore()

  if (!selectedApplicant) return null

  const handleApprove = async () => {
    await approveDoctorRequest(selectedApplicant.id)
  }

  const handleReject = async () => {
    await rejectDoctorRequest(selectedApplicant.id)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
            <Stethoscope className="size-4" />
            <span>Doctor Affiliation Application</span>
          </div>

          <button
            onClick={() => setSelectedApplicant(null)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            <X className="size-4.5" />
          </button>
        </div>

        {/* Doctor Summary Header */}
        <div className="p-6 space-y-5">
          <div className="flex items-start gap-4">
            <div className="size-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-md overflow-hidden shrink-0">
              {selectedApplicant.avatar ? (
                <img
                  src={selectedApplicant.avatar}
                  alt={selectedApplicant.doctorName}
                  className="size-full object-cover"
                />
              ) : (
                <span>{selectedApplicant.doctorName.replace('Dr. ', '').charAt(0)}</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-black text-slate-900 truncate">
                {selectedApplicant.doctorName}
              </h3>
              <p className="text-xs font-bold text-blue-600">
                {selectedApplicant.department}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1">
                  <Award className="size-3.5 text-slate-400" />
                  <span>{selectedApplicant.experienceYears} Years Exp</span>
                </span>
                <span className="flex items-center gap-1">
                  <IndianRupee className="size-3.5 text-slate-400" />
                  <span>₹{selectedApplicant.consultationFee || 500} OPD Fee</span>
                </span>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl text-xs border border-slate-100">
            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">
                Medical Council Reg.
              </span>
              <span className="font-mono font-bold text-slate-800">
                {selectedApplicant.medicalCouncilRegistrationNumber || 'MCI-VERIFIED'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">
                Hospital Target
              </span>
              <span className="font-bold text-slate-800 truncate block">
                {selectedApplicant.hospitalName || 'CarePlus Hospital'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-600">
              <Mail className="size-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{selectedApplicant.doctorEmail}</span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-600">
              <Phone className="size-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{selectedApplicant.doctorPhone || '+91 98000 00000'}</span>
            </div>
          </div>

          {/* Specializations & Qualifications */}
          <div>
            <span className="text-xs font-bold text-slate-700 block mb-1.5">
              Specializations & Sub-specialities:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(selectedApplicant.specialization || ['General Practice']).map((spec) => (
                <span
                  key={spec}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>

          {/* Application Message */}
          {selectedApplicant.message && (
            <div className="bg-amber-50/60 border border-amber-200/60 rounded-2xl p-3.5 text-xs text-amber-900">
              <span className="font-bold block mb-1">Applicant Note:</span>
              <p className="leading-relaxed">{selectedApplicant.message}</p>
            </div>
          )}
        </div>

        {/* Modal Action Buttons */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={handleReject}
            className="px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Ban className="size-3.5" />
            <span>Decline Application</span>
          </button>

          <button
            onClick={handleApprove}
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-md shadow-emerald-600/25 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Check className="size-4 stroke-[2.5]" />
            <span>Approve & Affiliate</span>
          </button>
        </div>
      </div>
    </div>
  )
}
