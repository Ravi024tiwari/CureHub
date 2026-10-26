import { type FC } from 'react'
import { User, ShieldCheck, Mail, Phone, Briefcase, GraduationCap, AlertCircle } from 'lucide-react'

export interface PersonalInfoState {
  name: string
  email: string
  phonePrefix: string
  phoneNumber: string
  designation: string
}

interface HospitalAdminPersonalInfoSectionProps {
  formData: PersonalInfoState
  onChange: (fields: Partial<PersonalInfoState>) => void
  errors?: Record<string, string>
}

const DESIGNATION_OPTIONS = [
  'Hospital Administrator',
  'Chief Medical Officer (CMO)',
  'Medical Director',
  'Operations Manager',
  'Managing Director / Founder',
  'Healthcare Executive',
  'Superintendent',
  'General Manager',
]

const COUNTRY_CODES = [
  { code: '+91', country: 'IN' },
  { code: '+1', country: 'US' },
  { code: '+44', country: 'UK' },
  { code: '+971', country: 'UAE' },
]

export const HospitalAdminPersonalInfoSection: FC<HospitalAdminPersonalInfoSectionProps> = ({
  formData,
  onChange,
  errors = {},
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-7 shadow-xs">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        {/* Left 2 Cols: Personal Form */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <User className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Personal Information
              </h2>
              <p className="text-xs text-slate-500">
                Primary administrator details for account access and verification
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => onChange({ name: e.target.value })}
                  placeholder="e.g. Sarita Agarwal"
                  className={`w-full px-3.5 py-2.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                    errors.name
                      ? 'border-red-400 focus:ring-red-400/20'
                      : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'
                  }`}
                />
              </div>
              {errors.name && (
                <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  title="Email linked to your account"
                  className="w-full px-3.5 py-2.5 bg-slate-100/70 border border-slate-200 rounded-xl text-sm text-slate-600 cursor-not-allowed select-none"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Account identity email (Single Source of Truth)
              </p>
            </div>

            {/* Phone Number with country code */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <div className="relative shrink-0">
                  <select
                    value={formData.phonePrefix}
                    onChange={(e) => onChange({ phonePrefix: e.target.value })}
                    className="h-10 px-3 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} ({c.country})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="relative flex-1">
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => onChange({ phoneNumber: e.target.value })}
                    placeholder="9876543210"
                    maxLength={15}
                    className={`w-full px-3.5 py-2.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                      errors.phoneNumber
                        ? 'border-red-400 focus:ring-red-400/20'
                        : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'
                    }`}
                  />
                </div>
              </div>
              {errors.phoneNumber && (
                <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3" />
                  {errors.phoneNumber}
                </p>
              )}
            </div>

            {/* Designation */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Designation <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.designation}
                  onChange={(e) => onChange({ designation: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer transition-all"
                >
                  {DESIGNATION_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Why Verification is Required Card matching mockup */}
        <div className="lg:col-span-1 rounded-2xl bg-gradient-to-br from-blue-50/90 via-indigo-50/40 to-slate-50 border border-blue-100/80 p-5 sm:p-6 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 mb-3.5">
            <GraduationCap className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Why Verification is Required?
          </h3>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            We verify hospital admin accounts to ensure authentic hospitals and authorized
            personnel can access and manage hospital data, doctors, appointments, and other
            services securely.
          </p>

          <div className="mt-4 pt-4 border-t border-blue-100 flex items-center gap-2 text-[11px] font-semibold text-blue-700">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Encrypted & Super-Admin Reviewed</span>
          </div>
        </div>
      </div>
    </div>
  )
}
