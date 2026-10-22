import { type FC } from 'react'
import { MapPin } from 'lucide-react'

export interface AddressData {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

interface AddressCardProps {
  data: AddressData
  onChange: (fields: Partial<AddressData>) => void
  errors?: Partial<Record<keyof AddressData, string>>
}

export const INDIAN_STATES = [
  'Chhattisgarh',
  'Maharashtra',
  'Karnataka',
  'Delhi',
  'Tamil Nadu',
  'Uttar Pradesh',
  'Gujarat',
  'Madhya Pradesh',
  'West Bengal',
  'Telangana',
  'Rajasthan',
  'Kerala',
  'Punjab',
  'Haryana',
  'Bihar',
  'Odisha',
]

export const AddressCard: FC<AddressCardProps> = ({ data, onChange, errors = {} }) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-all">
      {/* Header */}
      <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-slate-100">
        <div className="size-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-xs ring-1 ring-blue-500/10">
          <MapPin className="size-5.5 stroke-[2.2]" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            Address Information
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Provide the complete address of the hospital.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Street Address */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Street Address <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={data.street}
            onChange={(e) => onChange({ street: e.target.value })}
            placeholder="e.g. Civil Lines, Near City Mall"
            className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-all outline-hidden ${
              errors.street
                ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                : 'border-slate-200 bg-slate-50/40 hover:bg-white focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
            }`}
          />
          {errors.street && (
            <p className="text-[11px] font-semibold text-rose-500 mt-1">{errors.street}</p>
          )}
        </div>

        {/* City & State */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              City <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={data.city}
              onChange={(e) => onChange({ city: e.target.value })}
              placeholder="e.g. Bilaspur"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-all outline-hidden ${
                errors.city
                  ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                  : 'border-slate-200 bg-slate-50/40 hover:bg-white focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
              }`}
            />
            {errors.city && (
              <p className="text-[11px] font-semibold text-rose-500 mt-1">{errors.city}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              State <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={data.state}
              onChange={(e) => onChange({ state: e.target.value })}
              placeholder="e.g. Chhattisgarh"
              list="states-list"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-all outline-hidden ${
                errors.state
                  ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                  : 'border-slate-200 bg-slate-50/40 hover:bg-white focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
              }`}
            />
            <datalist id="states-list">
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
            {errors.state && (
              <p className="text-[11px] font-semibold text-rose-500 mt-1">{errors.state}</p>
            )}
          </div>
        </div>

        {/* Zip Code & Country */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Zip / PIN Code <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={data.zipCode}
              onChange={(e) => onChange({ zipCode: e.target.value })}
              placeholder="e.g. 495001"
              maxLength={10}
              className={`w-full px-3.5 py-2.5 rounded-xl border font-mono text-xs sm:text-sm font-medium transition-all outline-hidden ${
                errors.zipCode
                  ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                  : 'border-slate-200 bg-slate-50/40 hover:bg-white focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
              }`}
            />
            {errors.zipCode && (
              <p className="text-[11px] font-semibold text-rose-500 mt-1">{errors.zipCode}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Country</label>
            <select
              value={data.country}
              onChange={(e) => onChange({ country: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-white focus:bg-white text-xs sm:text-sm font-medium transition-all outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 cursor-pointer text-slate-700"
            >
              <option value="India">India</option>
              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Canada">Canada</option>
              <option value="United Arab Emirates">United Arab Emirates</option>
              <option value="Singapore">Singapore</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
export default AddressCard
