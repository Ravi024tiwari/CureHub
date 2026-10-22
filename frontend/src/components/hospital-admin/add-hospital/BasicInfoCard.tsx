import { type FC, type ChangeEvent } from 'react'
import { Building2, Calendar, Bed, Globe, Sparkles, FileText } from 'lucide-react'

export const HOSPITAL_TYPES = [
  'Multi-Speciality',
  'Super-Speciality',
  'General Hospital',
  'Clinic & Dispensary',
  'Diagnostic Center',
  'Maternity & Children Hospital',
  'Cardiology Institute',
  'Orthopedic Hospital',
  'Oncology Center',
  'Eye & Dental Care',
  'Trauma & Emergency Center',
]

export interface BasicInfoFormData {
  name: string
  hospitalType: string
  slug: string
  establishmentYear: number | ''
  totalBeds: number | ''
  website: string
  description: string
}

interface BasicInfoCardProps {
  data: BasicInfoFormData
  onChange: (fields: Partial<BasicInfoFormData>) => void
  errors?: Partial<Record<keyof BasicInfoFormData, string>>
}

export const BasicInfoCard: FC<BasicInfoCardProps> = ({ data, onChange, errors = {} }) => {
  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    // Auto-generate clean URL slug
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')

    onChange({
      name: val,
      slug: generatedSlug,
    })
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-all">
      {/* Card Header matching mockup */}
      <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-slate-100">
        <div className="size-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-xs ring-1 ring-blue-500/10">
          <Building2 className="size-5.5 stroke-[2.2]" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            Basic Information
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Provide the basic details about the hospital.
          </p>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-5">
        {/* Row 1: Hospital Name + Hospital Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Hospital Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={data.name}
                onChange={handleNameChange}
                placeholder="e.g. Apollo Multispeciality Hospital"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-all outline-hidden ${
                  errors.name
                    ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                    : 'border-slate-200 bg-slate-50/40 hover:bg-white focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                }`}
              />
            </div>
            {errors.name && (
              <p className="text-[11px] font-semibold text-rose-500 mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Hospital Type <span className="text-rose-500">*</span>
            </label>
            <select
              value={data.hospitalType}
              onChange={(e) => onChange({ hospitalType: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-white focus:bg-white text-xs sm:text-sm font-medium transition-all outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 cursor-pointer text-slate-700"
            >
              <option value="">
                Select hospital type
              </option>
              {HOSPITAL_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.hospitalType && (
              <p className="text-[11px] font-semibold text-rose-500 mt-1">{errors.hospitalType}</p>
            )}
          </div>
        </div>

        {/* Row 2: Slug (Auto-generated) + Establishment Year */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span>Slug (Auto-generated)</span>
                <Sparkles className="size-3 text-amber-500" />
              </label>
              <span className="text-[10px] text-slate-400 font-medium">Unique URL Identifier</span>
            </div>
            <div className="relative flex items-center">
              <input
                type="text"
                value={data.slug}
                onChange={(e) => onChange({ slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                placeholder="apollo-multispeciality-hospital"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100/70 text-slate-600 text-xs sm:text-sm font-mono transition-all outline-hidden focus:border-blue-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Establishment Year
            </label>
            <div className="relative flex items-center">
              <input
                type="number"
                min={1850}
                max={new Date().getFullYear()}
                value={data.establishmentYear}
                onChange={(e) =>
                  onChange({
                    establishmentYear: e.target.value ? parseInt(e.target.value, 10) : '',
                  })
                }
                placeholder="e.g. 2010"
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-white focus:bg-white text-xs sm:text-sm font-medium transition-all outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              <Calendar className="size-4 text-slate-400 absolute right-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Row 3: Total Beds + Website */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Total Beds <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <input
                type="number"
                min={1}
                value={data.totalBeds}
                onChange={(e) =>
                  onChange({ totalBeds: e.target.value ? parseInt(e.target.value, 10) : '' })
                }
                placeholder="e.g. 200"
                className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-all outline-hidden ${
                  errors.totalBeds
                    ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                    : 'border-slate-200 bg-slate-50/40 hover:bg-white focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                }`}
              />
              <Bed className="size-4 text-slate-400 absolute right-3 pointer-events-none" />
            </div>
            {errors.totalBeds && (
              <p className="text-[11px] font-semibold text-rose-500 mt-1">{errors.totalBeds}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Website</label>
            <div className="relative flex items-center">
              <input
                type="url"
                value={data.website}
                onChange={(e) => onChange({ website: e.target.value })}
                placeholder="https://www.example.com"
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-white focus:bg-white text-xs sm:text-sm font-medium transition-all outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              <Globe className="size-4 text-slate-400 absolute right-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Row 4: Description with character counter */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <FileText className="size-3.5 text-slate-400" />
              <span>Description</span>
            </label>
            <span
              className={`text-[10px] font-semibold ${
                data.description.length > 950 ? 'text-amber-600' : 'text-slate-400'
              }`}
            >
              {data.description.length}/1000
            </span>
          </div>
          <textarea
            rows={3}
            maxLength={1000}
            value={data.description}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Write a brief description about the hospital, its services and specialties..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-white focus:bg-white text-xs sm:text-sm font-medium transition-all outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none leading-relaxed text-slate-800"
          />
        </div>
      </div>
    </div>
  )
}
export default BasicInfoCard
