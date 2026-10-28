import { useState, type FC } from 'react'
import {
  Phone,
  Mail,
  Globe,
  MapPin,
  ExternalLink,
  ShieldAlert,
  Pill,
  FlaskConical,
  Activity,
  Ambulance,
  Microscope,
  Stethoscope,
  HeartPulse,
  Copy,
  Check,
  Navigation,
  Compass,
} from 'lucide-react'
import type { HospitalBranchItem } from '@/types/hospitalAdmin'

interface HospitalContactAddressSidebarProps {
  hospital: HospitalBranchItem
  onOpenFacilitiesTab?: () => void
}

export const HospitalContactAddressSidebar: FC<HospitalContactAddressSidebarProps> = ({
  hospital,
  onOpenFacilitiesTab,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const handleCopy = (text: string, key: string) => {
    if (!text) return
    navigator.clipboard?.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const fullAddress = [
    hospital.address?.street,
    hospital.address?.city,
    hospital.address?.state,
    hospital.address?.zipCode,
    hospital.address?.country || 'India',
  ]
    .filter(Boolean)
    .join(', ')

  const facilityIcons: Record<string, { icon: any; color: string; bg: string; border: string }> = {
    '24x7 Emergency': {
      icon: ShieldAlert,
      color: 'text-rose-600',
      bg: 'bg-rose-50/80 hover:bg-rose-100/80',
      border: 'border-rose-200/80',
    },
    'Pharmacy': {
      icon: Pill,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50/80 hover:bg-emerald-100/80',
      border: 'border-emerald-200/80',
    },
    'Lab': {
      icon: FlaskConical,
      color: 'text-blue-600',
      bg: 'bg-blue-50/80 hover:bg-blue-100/80',
      border: 'border-blue-200/80',
    },
    'ICU': {
      icon: Activity,
      color: 'text-purple-600',
      bg: 'bg-purple-50/80 hover:bg-purple-100/80',
      border: 'border-purple-200/80',
    },
    'Ambulance': {
      icon: Ambulance,
      color: 'text-amber-600',
      bg: 'bg-amber-50/80 hover:bg-amber-100/80',
      border: 'border-amber-200/80',
    },
    'Pathology': {
      icon: Microscope,
      color: 'text-pink-600',
      bg: 'bg-pink-50/80 hover:bg-pink-100/80',
      border: 'border-pink-200/80',
    },
    'Blood Bank': {
      icon: HeartPulse,
      color: 'text-red-600',
      bg: 'bg-red-50/80 hover:bg-red-100/80',
      border: 'border-red-200/80',
    },
  }

  const facilitiesList =
    hospital.facilities && hospital.facilities.length > 0
      ? hospital.facilities
      : ['24x7 Emergency', 'Pharmacy', 'Lab', 'ICU', 'Ambulance', 'Pathology']

  const previewFacilities = facilitiesList.slice(0, 6)
  const remainingCount = Math.max(0, facilitiesList.length - 6)

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${hospital.name}, ${fullAddress}`
  )}`

  const mapsViewUrl = `https://maps.google.com/?q=${encodeURIComponent(
    `${hospital.name}, ${fullAddress}`
  )}`

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* ── 1. Contact Information Card ─────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4 hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <div className="size-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Phone className="size-3.5" />
            </div>
            <span>Contact Information</span>
          </h3>
          <span className="text-[11px] font-bold text-slate-400">Direct Desk</span>
        </div>

        <div className="space-y-3 pt-1">
          {/* Phone */}
          <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100 hover:bg-white hover:border-slate-200 transition-all shadow-2xs flex items-center justify-between gap-3 group">
            <a
              href={`tel:${hospital.contactPhone || '+919876543210'}`}
              className="flex items-center gap-3 min-w-0 flex-1"
            >
              <div className="size-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Phone className="size-4.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Phone Number
                </span>
                <span className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors truncate block">
                  {hospital.contactPhone || '+91 98765 43210'}
                </span>
              </div>
            </a>

            <button
              type="button"
              onClick={() => handleCopy(hospital.contactPhone || '+91 98765 43210', 'phone')}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-900 transition-all shadow-2xs shrink-0 cursor-pointer"
              title="Copy Phone Number"
            >
              {copiedKey === 'phone' ? (
                <Check className="size-3.5 text-emerald-600" />
              ) : (
                <Copy className="size-3.5" />
              )}
            </button>
          </div>

          {/* Email */}
          <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100 hover:bg-white hover:border-slate-200 transition-all shadow-2xs flex items-center justify-between gap-3 group">
            <a
              href={`mailto:${hospital.contactEmail || 'contact@curehealth.com'}`}
              className="flex items-center gap-3 min-w-0 flex-1"
            >
              <div className="size-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Mail className="size-4.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Email Address
                </span>
                <span className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors truncate block">
                  {hospital.contactEmail || 'contact@curehealth.com'}
                </span>
              </div>
            </a>

            <button
              type="button"
              onClick={() => handleCopy(hospital.contactEmail || 'contact@curehealth.com', 'email')}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-900 transition-all shadow-2xs shrink-0 cursor-pointer"
              title="Copy Email Address"
            >
              {copiedKey === 'email' ? (
                <Check className="size-3.5 text-emerald-600" />
              ) : (
                <Copy className="size-3.5" />
              )}
            </button>
          </div>

          {/* Website */}
          {hospital.website && (
            <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100 hover:bg-white hover:border-slate-200 transition-all shadow-2xs flex items-center justify-between gap-3 group">
              <a
                href={hospital.website.startsWith('http') ? hospital.website : `https://${hospital.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 min-w-0 flex-1"
              >
                <div className="size-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Globe className="size-4.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Official Website
                  </span>
                  <span className="text-xs sm:text-sm font-black text-blue-600 group-hover:underline truncate block">
                    {hospital.website}
                  </span>
                </div>
              </a>

              <a
                href={hospital.website.startsWith('http') ? hospital.website : `https://${hospital.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100 text-blue-600 transition-all shadow-2xs shrink-0"
                title="Open Website"
              >
                <ExternalLink className="size-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* 24x7 Emergency Help Banner */}
        {hospital.isEmergency24x7 !== false && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-sm shadow-rose-500/20 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                <Ambulance className="size-5 text-white" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-black block">24×7 Emergency Desk</span>
                <span className="text-[11px] text-rose-100 font-medium block truncate">
                  Immediate trauma response active
                </span>
              </div>
            </div>
            <a
              href={`tel:${hospital.contactPhone || '+919876543210'}`}
              className="px-3 py-1.5 rounded-xl bg-white text-rose-600 hover:bg-rose-50 text-xs font-black shrink-0 transition-colors shadow-2xs"
            >
              Call Desk
            </a>
          </div>
        )}
      </div>

      {/* ── 2. Address & Interactive Map Card ───────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4 hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <div className="size-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <MapPin className="size-3.5" />
            </div>
            <span>Hospital Address</span>
          </h3>

          <button
            type="button"
            onClick={() => handleCopy(fullAddress, 'address')}
            className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            {copiedKey === 'address' ? (
              <>
                <Check className="size-3 text-emerald-600" />
                <span className="text-emerald-600">Copied</span>
              </>
            ) : (
              <>
                <Copy className="size-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        <div className="text-xs sm:text-sm text-slate-700 font-semibold leading-relaxed p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100">
          {fullAddress || '42, Link Road, Near Nehru Chowk, Bilaspur, Chhattisgarh, 495009, India'}
        </div>

        {/* High-Fidelity Stylized Map Visual */}
        <div className="relative h-48 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner group">
          {/* Stylized Vector Map Graphics */}
          <svg className="absolute inset-0 size-full opacity-70" viewBox="0 0 400 220" preserveAspectRatio="none">
            <rect width="400" height="220" fill="#f8fafc" />
            {/* Major Arterial Roads */}
            <path d="M -10,50 Q 180,70 410,30" stroke="#cbd5e1" strokeWidth="18" fill="none" />
            <path d="M 50,-10 Q 70,130 140,230" stroke="#cbd5e1" strokeWidth="14" fill="none" />
            <path d="M 310,-10 L 240,230" stroke="#cbd5e1" strokeWidth="16" fill="none" />
            <path d="M -10,180 Q 220,140 410,170" stroke="#e2e8f0" strokeWidth="12" fill="none" />
            <path d="M 180,-10 C 200,90 180,140 200,230" stroke="#94a3b8" strokeWidth="8" fill="none" />

            {/* Green park patches */}
            <rect x="250" y="40" width="90" height="60" rx="10" fill="#dcfce7" />
            <rect x="20" y="110" width="80" height="70" rx="10" fill="#dcfce7" />

            {/* Blue water lake */}
            <path d="M 320,140 Q 370,120 400,150 L 400,220 L 290,220 Z" fill="#e0f2fe" />
          </svg>

          {/* Animated Hospital Radar Pin */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
            <div className="relative">
              {/* Pulsing radar rings */}
              <div className="absolute -inset-3 rounded-full bg-rose-500/20 animate-ping" />
              <div className="absolute -inset-1.5 rounded-full bg-rose-500/30" />
              <div className="relative size-10 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 ring-4 ring-white">
                <MapPin className="size-5.5 fill-current" />
              </div>
              <div className="size-4 bg-slate-900/30 rounded-full blur-[2px] mx-auto -mt-1" />
            </div>

            {/* Hospital Marker Pill */}
            <span className="mt-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-slate-900/90 text-white backdrop-blur-md shadow-md max-w-[180px] truncate">
              {hospital.name}
            </span>
          </div>

          {/* Map Quick Action Buttons */}
          <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between gap-2">
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black shadow-md flex items-center gap-1.5 transition-all"
            >
              <Navigation className="size-3" />
              <span>Get Directions</span>
            </a>

            <a
              href={mapsViewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-white/95 hover:bg-white text-slate-800 text-[11px] font-bold shadow-xs border border-slate-200/80 flex items-center gap-1.5 transition-all backdrop-blur-xs"
            >
              <span>Google Maps</span>
              <ExternalLink className="size-3 text-slate-500" />
            </a>
          </div>
        </div>
      </div>

      {/* ── 3. Facilities Grid Card ─────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4 hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Compass className="size-3.5" />
            </div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
              Hospital Facilities
            </h3>
          </div>
          {onOpenFacilitiesTab && (
            <button
              type="button"
              onClick={onOpenFacilitiesTab}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
            >
              View All ({facilitiesList.length})
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
          {previewFacilities.map((facilityName, idx) => {
            const config = facilityIcons[facilityName] || {
              icon: Stethoscope,
              color: 'text-blue-600',
              bg: 'bg-blue-50/80 hover:bg-blue-100/80',
              border: 'border-blue-200/80',
            }
            const Icon = config.icon

            return (
              <div
                key={idx}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center transition-all hover:scale-103 shadow-2xs ${config.bg} ${config.border}`}
              >
                <Icon className={`size-5 mb-1.5 ${config.color}`} />
                <span className="text-[11px] font-black text-slate-800 leading-tight line-clamp-2">
                  {facilityName}
                </span>
              </div>
            )
          })}

          {remainingCount > 0 && onOpenFacilitiesTab && (
            <button
              type="button"
              onClick={onOpenFacilitiesTab}
              className="p-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 flex flex-col items-center justify-center text-center transition-all cursor-pointer group shadow-2xs"
            >
              <span className="text-xs font-black text-slate-800 group-hover:text-blue-600 transition-colors">
                +{remainingCount}
              </span>
              <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-500 transition-colors">
                more facilities
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default HospitalContactAddressSidebar
