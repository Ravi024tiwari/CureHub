import { type FC } from 'react'
import {
  MapPin,
  Building,
  Navigation,
  Globe2,
  Home,
  CheckCircle2,
} from 'lucide-react'

interface PatientAddressTabProps {
  street: string
  onChangeStreet: (val: string) => void
  city: string
  onChangeCity: (val: string) => void
  state: string
  onChangeState: (val: string) => void
  zipCode: string
  onChangeZipCode: (val: string) => void
  country: string
  onChangeCountry: (val: string) => void
}

export const PatientAddressTab: FC<PatientAddressTabProps> = ({
  street,
  onChangeStreet,
  city,
  onChangeCity,
  state,
  onChangeState,
  zipCode,
  onChangeZipCode,
  country,
  onChangeCountry,
}) => {
  return (
    <div className="space-y-6">
      {/* Informational Guidance Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#eef3ff] to-slate-50 border border-[#c8d7fd] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-[#5170f4] text-white flex items-center justify-center shrink-0">
            <MapPin className="size-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900">Residential Address</h4>
            <p className="text-[11px] text-slate-600 font-medium">
              Used for localized hospital recommendations, home sample collections & SOS dispatch.
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-extrabold border border-emerald-200">
          <CheckCircle2 className="size-3.5" />
          <span>Local Area Triage</span>
        </span>
      </div>

      {/* Address Form Grid */}
      <div className="space-y-5">
        {/* Street Address */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Home className="size-3.5 text-[#637ff5]" />
            <span>Street Address / House / Flat No.</span>
          </label>
          <input
            type="text"
            value={street}
            onChange={(e) => onChangeStreet(e.target.value)}
            placeholder="e.g. Flat 402, Sunshine Heights, Ring Road No. 2"
            className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200/90 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5170f4]/25 focus:border-[#5170f4] transition-all shadow-2xs"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* City */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Building className="size-3.5 text-indigo-600" />
              <span>City</span>
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => onChangeCity(e.target.value)}
              placeholder="e.g. Bilaspur / Raipur"
              className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200/90 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5170f4]/25 focus:border-[#5170f4] transition-all shadow-2xs"
            />
          </div>

          {/* State */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Navigation className="size-3.5 text-[#5170f4]" />
              <span>State / Province</span>
            </label>
            <input
              type="text"
              value={state}
              onChange={(e) => onChangeState(e.target.value)}
              placeholder="e.g. Chhattisgarh"
              className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200/90 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5170f4]/25 focus:border-[#5170f4] transition-all shadow-2xs"
            />
          </div>

          {/* ZIP / PIN Code */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <MapPin className="size-3.5 text-amber-500" />
              <span>PIN / ZIP Code</span>
            </label>
            <input
              type="text"
              value={zipCode}
              onChange={(e) => onChangeZipCode(e.target.value)}
              placeholder="e.g. 495001"
              className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200/90 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5170f4]/25 focus:border-[#5170f4] transition-all shadow-2xs"
            />
          </div>

          {/* Country */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Globe2 className="size-3.5 text-emerald-600" />
              <span>Country</span>
            </label>
            <input
              type="text"
              value={country || 'India'}
              onChange={(e) => onChangeCountry(e.target.value)}
              placeholder="India"
              className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200/90 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5170f4]/25 focus:border-[#5170f4] transition-all shadow-2xs"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
