import { type FC } from 'react'
import {
  CheckCircle2,
  AlertCircle,
  Building2,
  MapPin,
  ShieldCheck,
  Stethoscope,
  FileCheck,
} from 'lucide-react'
import type { AddHospitalFormData } from '@/types/hospitalAdmin'

interface ReviewSubmitSectionProps {
  data: AddHospitalFormData
  onGoToStep: (stepId: number) => void
  termsAccepted: boolean
  onToggleTerms: (val: boolean) => void
  isEditMode?: boolean
}

export const ReviewSubmitSection: FC<ReviewSubmitSectionProps> = ({
  data,
  onGoToStep,
  termsAccepted,
  onToggleTerms,
  isEditMode = false,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
        <div className="size-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs ring-1 ring-emerald-500/10">
          <CheckCircle2 className="size-5.5 stroke-[2.2]" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            {isEditMode ? 'Review & Save Changes' : 'Review & Submit Application'}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            {isEditMode
              ? 'Please review your updated facility information before saving changes.'
              : 'Please review the details carefully before submitting for administrative verification.'}
          </p>
        </div>
      </div>

      {/* Information Review Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Section 1: Basic & Classification */}
        <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Building2 className="size-4 text-blue-600" />
              Basic Information
            </span>
            <button
              type="button"
              onClick={() => onGoToStep(1)}
              className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
            >
              Edit
            </button>
          </div>
          <div className="space-y-1 text-xs">
            <p className="font-extrabold text-slate-900">{data.name || 'Not provided'}</p>
            <p className="text-slate-500">Type: <span className="font-semibold text-slate-700">{data.hospitalType}</span></p>
            <p className="text-slate-500 font-mono text-[11px]">Slug: {data.slug || 'auto'}</p>
            <p className="text-slate-500">Total Beds: <span className="font-semibold text-slate-700">{data.totalBeds || 'N/A'}</span></p>
            <p className="text-slate-500">Established: <span className="font-semibold text-slate-700">{data.establishmentYear || 'N/A'}</span></p>
          </div>
        </div>

        {/* Section 2: Address & Location */}
        <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <MapPin className="size-4 text-rose-500" />
              Location & Contact
            </span>
            <button
              type="button"
              onClick={() => onGoToStep(2)}
              className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
            >
              Edit
            </button>
          </div>
          <div className="space-y-1 text-xs">
            <p className="font-semibold text-slate-800">{data.street || 'No street provided'}</p>
            <p className="text-slate-500">{[data.city, data.state, data.zipCode, data.country].filter(Boolean).join(', ')}</p>
            <p className="text-slate-500">Phone: <span className="font-semibold text-slate-700">{data.contactPhone}</span></p>
            <p className="text-slate-500">Email: <span className="font-semibold text-slate-700">{data.contactEmail}</span></p>
          </div>
        </div>

        {/* Section 3: Clinical Specialities */}
        <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Stethoscope className="size-4 text-violet-600" />
              Departments & Facilities
            </span>
            <button
              type="button"
              onClick={() => onGoToStep(3)}
              className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
            >
              Edit
            </button>
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-[11px] font-bold text-slate-400 mb-1">Departments ({data.departments.length})</p>
              <div className="flex flex-wrap gap-1">
                {data.departments.slice(0, 4).map((d) => (
                  <span key={d} className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-violet-100/70 text-violet-700">
                    {d}
                  </span>
                ))}
                {data.departments.length > 4 && (
                  <span className="text-[10px] text-slate-400 font-bold">+{data.departments.length - 4}</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 mb-1">Facilities ({data.facilities.length})</p>
              <div className="flex flex-wrap gap-1">
                {data.facilities.slice(0, 4).map((f) => (
                  <span key={f} className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-teal-100/70 text-teal-700">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Compliance & License */}
        <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-3 min-w-0 overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
              Compliance & Legal
            </span>
            <button
              type="button"
              onClick={() => onGoToStep(4)}
              className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
            >
              Edit
            </button>
          </div>
          <div className="space-y-1.5 text-xs min-w-0">
            <p className="text-slate-500 truncate">
              License Reg #: <span className="font-mono font-bold text-slate-900">{data.licenseNumber || 'N/A'}</span>
            </p>
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-[11px] min-w-0 max-w-full">
              <FileCheck className="size-3.5 shrink-0" />
              <span
                className="truncate block font-semibold text-emerald-800"
                title={data.licenseDocumentName || 'Registration Certificate Attached'}
              >
                {data.licenseDocumentName && (data.licenseDocumentName.length > 30 || data.licenseDocumentName.startsWith('AEMAZQ'))
                  ? 'Registration-Certificate.pdf'
                  : data.licenseDocumentName || 'Registration Certificate Attached'}
              </span>
            </div>
            <p className="text-slate-500">
              Hours: <span className="font-semibold text-slate-700">{data.openingTime} - {data.closingTime}</span>
            </p>
            <p className="text-slate-500">
              Emergency: <span className="font-semibold text-emerald-700">{data.isEmergency24x7 ? '24/7 Available' : 'Standard'}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Verification Notice Banner */}
      <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/70 flex items-start gap-3">
        <AlertCircle className="size-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 space-y-1">
          <p className="font-bold text-blue-950">Verification Timeline & Next Steps</p>
          <p className="text-slate-600 leading-relaxed">
            Upon submitting this registration, our medical compliance board will review your government registration certificate and hospital credentials within 24 to 48 hours. Your branch will be marked as <span className="font-bold text-amber-700">PENDING APPROVAL</span> until verified.
          </p>
        </div>
      </div>

      {/* Legal Confirmation Checkbox */}
      <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer select-none hover:bg-slate-100/60 transition-colors">
        <input
          type="checkbox"
          checked={termsAccepted}
          onChange={(e) => onToggleTerms(e.target.checked)}
          className="size-4.5 rounded-md text-blue-600 border-slate-300 focus:ring-blue-500 mt-0.5 cursor-pointer"
        />
        <span className="text-xs text-slate-700 leading-relaxed font-medium">
          I declare that I am the authorized administrator of this hospital facility. All information, medical permits, licenses, and statutory records provided are accurate, genuine, and comply with state and national healthcare regulations.
        </span>
      </label>
    </div>
  )
}
export default ReviewSubmitSection
