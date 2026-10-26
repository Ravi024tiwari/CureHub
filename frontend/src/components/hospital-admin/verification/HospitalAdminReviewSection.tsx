import { type FC } from 'react'
import {
  ShieldCheck,
  Building2,
  User,
  FileCheck2,
  GraduationCap,
  AlertTriangle,
  Clock,
  CheckCircle,
} from 'lucide-react'
import type { PersonalInfoState } from './HospitalAdminPersonalInfoSection'
import type { HospitalInfoState } from './HospitalAdminHospitalInfoSection'
import type { IdentityDocsState } from './HospitalAdminIdentitySection'

interface HospitalAdminReviewSectionProps {
  personalInfo: PersonalInfoState
  hospitalInfo: HospitalInfoState
  identityDocs: IdentityDocsState
  qualifications: string[]
  isConfirmed: boolean
  onToggleConfirmed: (val: boolean) => void
  onEditSection: (step: number) => void
}

export const HospitalAdminReviewSection: FC<HospitalAdminReviewSectionProps> = ({
  personalInfo,
  hospitalInfo,
  identityDocs,
  qualifications,
  isConfirmed,
  onToggleConfirmed,
  onEditSection,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-7 shadow-xs space-y-6">
      <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
          <ShieldCheck className="w-4.5 h-4.5" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Review Your Application
          </h2>
          <p className="text-xs text-slate-500">
            Please verify all details before submitting for Super Admin verification
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 1. Personal Information Summary */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" /> Personal Information
            </span>
            <button
              type="button"
              onClick={() => onEditSection(1)}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              Edit
            </button>
          </div>
          <div className="text-xs space-y-1 text-slate-600">
            <p>
              <strong className="text-slate-800">Name:</strong> {personalInfo.name || 'Not provided'}
            </p>
            <p>
              <strong className="text-slate-800">Email:</strong> {personalInfo.email}
            </p>
            <p>
              <strong className="text-slate-800">Phone:</strong> {personalInfo.phonePrefix}{' '}
              {personalInfo.phoneNumber}
            </p>
            <p>
              <strong className="text-slate-800">Designation:</strong> {personalInfo.designation}
            </p>
          </div>
        </div>

        {/* 2. Hospital Details Summary */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-600" /> Hospital Information
            </span>
            <button
              type="button"
              onClick={() => onEditSection(2)}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              Edit
            </button>
          </div>
          <div className="text-xs space-y-1 text-slate-600">
            {hospitalInfo.hospitalName ? (
              <>
                <p>
                  <strong className="text-slate-800">Hospital:</strong> {hospitalInfo.hospitalName}
                </p>
                {hospitalInfo.hospitalRegistrationNumber && (
                  <p>
                    <strong className="text-slate-800">Reg No:</strong>{' '}
                    {hospitalInfo.hospitalRegistrationNumber}
                  </p>
                )}
                {hospitalInfo.hospitalType && (
                  <p>
                    <strong className="text-slate-800">Type:</strong> {hospitalInfo.hospitalType}
                  </p>
                )}
                {hospitalInfo.numberOfBeds && (
                  <p>
                    <strong className="text-slate-800">Beds:</strong> {hospitalInfo.numberOfBeds}
                  </p>
                )}
                {hospitalInfo.hospitalAddress && (
                  <p>
                    <strong className="text-slate-800">Address:</strong>{' '}
                    {hospitalInfo.hospitalAddress}
                  </p>
                )}
              </>
            ) : (
              <p className="text-slate-400 italic">
                Hospital details omitted (can be added later from dashboard)
              </p>
            )}
          </div>
        </div>

        {/* 3. Identity Documents Summary */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-blue-600" /> Identity Documents
            </span>
            <button
              type="button"
              onClick={() => onEditSection(3)}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              Edit
            </button>
          </div>
          <div className="text-xs space-y-1 text-slate-600">
            <p>
              <strong className="text-slate-800">ID Type:</strong> {identityDocs.governmentIdType}
            </p>
            <p>
              <strong className="text-slate-800">ID Number:</strong>{' '}
              {identityDocs.governmentIdNumber || 'Not entered'}
            </p>
            <p className="flex items-center gap-1">
              <strong className="text-slate-800">Gov ID File:</strong>{' '}
              {identityDocs.identityProofUrl ? (
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Attached
                </span>
              ) : (
                <span className="text-amber-600 font-medium">Pending upload</span>
              )}
            </p>
            <p className="flex items-center gap-1">
              <strong className="text-slate-800">Authorization Letter:</strong>{' '}
              {identityDocs.authorizationLetterUrl ? (
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Attached
                </span>
              ) : (
                <span className="text-amber-600 font-medium">Pending upload</span>
              )}
            </p>
          </div>
        </div>

        {/* 4. Qualifications Summary */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-blue-600" /> Qualifications
            </span>
            <button
              type="button"
              onClick={() => onEditSection(4)}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              Edit
            </button>
          </div>
          {qualifications.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {qualifications.map((q) => (
                <span
                  key={q}
                  className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-semibold"
                >
                  {q}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">None specified (Optional)</p>
          )}
        </div>
      </div>

      {/* Verification SLA Notice */}
      <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/60 flex items-start gap-3">
        <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 leading-relaxed">
          <strong className="text-blue-900 block font-semibold mb-0.5">
            What happens after submitting?
          </strong>
          Our compliance team reviews hospital administrator credentials within 24 to 48 business
          hours. You will receive an email update once verified, and your dashboard will be
          automatically enabled.
        </div>
      </div>

      {/* Confirmation Checkbox */}
      <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
        <input
          type="checkbox"
          checked={isConfirmed}
          onChange={(e) => onToggleConfirmed(e.target.checked)}
          className="w-4 h-4 mt-0.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
        />
        <span className="text-xs text-slate-700 leading-normal">
          I declare that all the information provided above and the attached documents are true,
          authentic, and accurate. I understand that false or misleading details may lead to
          immediate rejection or account suspension.
        </span>
      </label>
    </div>
  )
}
