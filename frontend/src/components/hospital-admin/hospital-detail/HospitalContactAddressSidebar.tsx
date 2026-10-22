import { type FC } from 'react'
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
  const fullAddress = [
    hospital.address?.street,
    hospital.address?.city,
    hospital.address?.state,
    hospital.address?.zipCode,
    hospital.address?.country || 'India',
  ]
    .filter(Boolean)
    .join(', ')

  const facilityIcons: Record<string, { icon: any; color: string; bg: string }> = {
    '24x7 Emergency': { icon: ShieldAlert, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200/60' },
    'Pharmacy': { icon: Pill, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200/60' },
    'Lab': { icon: FlaskConical, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200/60' },
    'ICU': { icon: Activity, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200/60' },
    'Ambulance': { icon: Ambulance, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200/60' },
    'Pathology': { icon: Microscope, color: 'text-pink-600', bg: 'bg-pink-50 border-pink-200/60' },
    'Blood Bank': { icon: HeartPulse, color: 'text-red-600', bg: 'bg-red-50 border-red-200/60' },
  }

  const facilitiesList = hospital.facilities && hospital.facilities.length > 0
    ? hospital.facilities
    : ['24x7 Emergency', 'Pharmacy', 'Lab', 'ICU', 'Ambulance', 'Pathology']

  const previewFacilities = facilitiesList.slice(0, 6)
  const remainingCount = Math.max(0, facilitiesList.length - 6)

  return (
    <div className="space-y-6">
      {/* 1. Contact Information Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
          <span>Contact Information</span>
        </h3>

        <div className="space-y-3.5 pt-1">
          {/* Phone */}
          <a
            href={`tel:${hospital.contactPhone}`}
            className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-slate-50 transition-colors group"
          >
            <div className="size-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Phone className="size-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-semibold text-slate-400 block">Phone Number</span>
              <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate block">
                {hospital.contactPhone || '+91 98765 43210'}
              </span>
            </div>
          </a>

          {/* Email */}
          <a
            href={`mailto:${hospital.contactEmail}`}
            className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-slate-50 transition-colors group"
          >
            <div className="size-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Mail className="size-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-semibold text-slate-400 block">Email Address</span>
              <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate block">
                {hospital.contactEmail || 'info@apollohospital.com'}
              </span>
            </div>
          </a>

          {/* Website */}
          {hospital.website && (
            <a
              href={hospital.website.startsWith('http') ? hospital.website : `https://${hospital.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-slate-50 transition-colors group"
            >
              <div className="size-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Globe className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-semibold text-slate-400 block">Official Website</span>
                <span className="text-xs sm:text-sm font-bold text-blue-600 group-hover:underline truncate block">
                  {hospital.website}
                </span>
              </div>
              <ExternalLink className="size-3.5 text-slate-400 group-hover:text-blue-600 shrink-0" />
            </a>
          )}
        </div>
      </div>

      {/* 2. Address & Map Preview Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
          <span>Address</span>
        </h3>

        <div className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
          {fullAddress || 'Civil Lines, Bilaspur, Chhattisgarh - 495001, India'}
        </div>

        {/* Interactive Map Visual Mockup */}
        <div className="relative h-44 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner group">
          {/* Stylized Map Roads Background SVG */}
          <svg className="absolute inset-0 size-full opacity-60" viewBox="0 0 400 200" preserveAspectRatio="none">
            <rect width="400" height="200" fill="#f1f5f9" />
            <path d="M 0,40 Q 150,60 400,20" stroke="#cbd5e1" strokeWidth="16" fill="none" />
            <path d="M 40,0 Q 60,120 120,200" stroke="#cbd5e1" strokeWidth="12" fill="none" />
            <path d="M 280,0 L 220,200" stroke="#cbd5e1" strokeWidth="14" fill="none" />
            <path d="M 0,160 Q 200,120 400,150" stroke="#e2e8f0" strokeWidth="10" fill="none" />
            <path d="M 160,0 C 180,80 160,120 180,200" stroke="#94a3b8" strokeWidth="6" fill="none" />
            {/* Green park patches */}
            <rect x="230" y="30" width="80" height="50" rx="8" fill="#dcfce7" />
            <rect x="30" y="100" width="70" height="60" rx="8" fill="#dcfce7" />
            {/* Blue water patch */}
            <path d="M 320,130 Q 360,110 400,140 L 400,200 L 300,200 Z" fill="#e0f2fe" />
          </svg>

          {/* Animated Location Pin */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="relative">
              <div className="size-9 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 ring-4 ring-white animate-bounce">
                <MapPin className="size-5 fill-current" />
              </div>
              <div className="size-3 bg-slate-900/30 rounded-full blur-[2px] mx-auto -mt-1" />
            </div>
            <span className="mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-900/80 text-white backdrop-blur-md shadow-xs">
              {hospital.name.slice(0, 18)}...
            </span>
          </div>

          {/* External Map Trigger */}
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(
              `${hospital.name}, ${fullAddress}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-2.5 right-2.5 px-3 py-1 rounded-xl bg-white/90 hover:bg-white text-slate-800 text-[11px] font-bold shadow-xs border border-slate-200/80 flex items-center gap-1.5 transition-all"
          >
            <span>Google Maps</span>
            <ExternalLink className="size-3 text-slate-500" />
          </a>
        </div>
      </div>

      {/* 3. Facilities Card Widget */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900 tracking-tight">Facilities</h3>
          {onOpenFacilitiesTab && (
            <button
              type="button"
              onClick={onOpenFacilitiesTab}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
            >
              View All
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2.5 pt-1">
          {previewFacilities.map((facilityName, idx) => {
            const config = facilityIcons[facilityName] || {
              icon: Stethoscope,
              color: 'text-blue-600',
              bg: 'bg-blue-50 border-blue-200/60',
            }
            const Icon = config.icon

            return (
              <div
                key={idx}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center transition-all hover:scale-105 ${config.bg}`}
              >
                <Icon className={`size-5 mb-1.5 ${config.color}`} />
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 leading-tight line-clamp-2">
                  {facilityName}
                </span>
              </div>
            )
          })}

          {remainingCount > 0 && onOpenFacilitiesTab && (
            <button
              type="button"
              onClick={onOpenFacilitiesTab}
              className="p-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 flex flex-col items-center justify-center text-center transition-all cursor-pointer"
            >
              <span className="text-xs font-black text-slate-700">+{remainingCount}</span>
              <span className="text-[10px] font-bold text-slate-400">more</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
