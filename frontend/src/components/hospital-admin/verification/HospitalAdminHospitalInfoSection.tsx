import { type FC } from 'react'
import { Building2, Check, MapPin, BedDouble, FileText, Info } from 'lucide-react'

export interface HospitalInfoState {
  hospitalName: string
  hospitalRegistrationNumber: string
  hospitalType: string
  numberOfBeds: string
  hospitalAddress: string
}

interface HospitalAdminHospitalInfoSectionProps {
  formData: HospitalInfoState
  onChange: (fields: Partial<HospitalInfoState>) => void
  errors?: Record<string, string>
}

const HOSPITAL_TYPES = [
  'Private Hospital',
  'Government Hospital',
  'Trust Hospital',
  'Other',
]

export const HospitalAdminHospitalInfoSection: FC<HospitalAdminHospitalInfoSectionProps> = ({
  formData,
  onChange,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-7 shadow-xs">
      {/* Header with explicit (Optional) indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Building2 className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Hospital Information
              </h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
                Optional
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Details of the hospital you are affiliating with or managing
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 text-amber-800 text-xs font-medium border border-amber-200/60">
          <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>You can skip this step and add your hospital anytime from the dashboard.</span>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Hospital Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Hospital Name <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.hospitalName}
                onChange={(e) => onChange({ hospitalName: e.target.value })}
                placeholder="e.g. City Care Multispeciality Hospital"
                className="w-full px-3.5 py-2.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Hospital Registration Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Hospital Registration Number <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.hospitalRegistrationNumber}
                onChange={(e) => onChange({ hospitalRegistrationNumber: e.target.value })}
                placeholder="e.g. CHH/2024/56789"
                className="w-full px-3.5 py-2.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Hospital Type Pills matching screenshot */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Hospital Type <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {HOSPITAL_TYPES.map((type) => {
              const isSelected = formData.hospitalType === type
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => onChange({ hospitalType: isSelected ? '' : type })}
                  className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20 ring-2 ring-blue-200'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center border text-[9px] ${
                      isSelected
                        ? 'border-white bg-white text-blue-600'
                        : 'border-slate-300 bg-white text-transparent'
                    }`}
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>{type}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Number of Beds */}
          <div className="sm:col-span-1">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Number of Beds <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                value={formData.numberOfBeds}
                onChange={(e) => onChange({ numberOfBeds: e.target.value })}
                placeholder="e.g. 150"
                className="w-full px-3.5 py-2.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Hospital Address */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Hospital Address <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.hospitalAddress}
                onChange={(e) => onChange({ hospitalAddress: e.target.value })}
                placeholder="e.g. Near Civil Lines, Bilaspur, Chhattisgarh - 495001"
                className="w-full px-3.5 py-2.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
