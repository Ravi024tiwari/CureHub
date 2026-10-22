import { type FC } from 'react'
import {
  Building2,
  CheckCircle2,
  Clock,
  XCircle,
  Star,
  MapPin,
  ExternalLink,
  Edit3,
  Power,
  PowerOff,
} from 'lucide-react'
import type { HospitalBranchItem } from '@/types/hospitalAdmin'

export type HospitalTabKey =
  | 'overview'
  | 'departments'
  | 'doctors'
  | 'facilities'
  | 'gallery'
  | 'settings'

interface HospitalIdentityBannerProps {
  hospital: HospitalBranchItem
  totalDoctorsCount?: number
  activeTab: HospitalTabKey
  onSelectTab: (tab: HospitalTabKey) => void
  onViewOnMap?: () => void
  onEdit?: () => void
  onToggleActive?: () => void
  isTogglingActive?: boolean
}

export const HospitalIdentityBanner: FC<HospitalIdentityBannerProps> = ({
  hospital,
  totalDoctorsCount,
  activeTab,
  onSelectTab,
  onViewOnMap,
  onEdit,
  onToggleActive,
  isTogglingActive = false,
}) => {
  const doctorCount = totalDoctorsCount ?? hospital.doctorCount ?? 24
  const rating = hospital.rating ?? 4.8
  const reviewCount = hospital.reviewCount ?? 1240

  const fullAddress = [
    hospital.address?.street,
    hospital.address?.city,
    hospital.address?.state,
    hospital.address?.zipCode,
  ]
    .filter(Boolean)
    .join(', ')

  const tabs: Array<{ key: HospitalTabKey; label: string; badge?: number | string }> = [
    { key: 'overview', label: 'Overview' },
    { key: 'departments', label: 'Departments', badge: hospital.departments?.length },
    { key: 'doctors', label: `Doctors`, badge: doctorCount },
    { key: 'facilities', label: 'Facilities', badge: hospital.facilities?.length },
    { key: 'gallery', label: 'Gallery' },
    { key: 'settings', label: 'Settings' },
  ]

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs space-y-6">
      {/* Hospital Identity Row */}
      <div className="flex flex-col sm:flex-row items-start gap-5">
        {/* Logo / Badge */}
        <div className="size-16 sm:size-20 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/15 ring-4 ring-blue-50">
          <Building2 className="size-8 sm:size-10" />
        </div>

        {/* Identity Details */}
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              {hospital.name}
            </h1>

            {/* Verification Status */}
            {hospital.verificationStatus === 'APPROVED' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
                <CheckCircle2 className="size-3.5 text-emerald-600" />
                <span>Verified</span>
              </span>
            ) : hospital.verificationStatus === 'PENDING' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
                <Clock className="size-3.5 text-amber-600" />
                <span>Pending Verification</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/80">
                <XCircle className="size-3.5 text-rose-600" />
                <span>Suspended</span>
              </span>
            )}
          </div>

          {/* Subtitle Details: Type, Est Year, Beds */}
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500 flex-wrap">
            <span>{hospital.hospitalType || 'Multi-Speciality'}</span>
            <span className="text-slate-300">•</span>
            <span>Est. {hospital.establishmentYear || 2010}</span>
            <span className="text-slate-300">•</span>
            <span>{hospital.totalBeds || 200} Beds</span>
          </div>

          {/* Ratings & Location Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Rating */}
              <div className="flex items-center gap-1.5 text-xs sm:text-sm">
                <div className="flex items-center text-amber-500">
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                </div>
                <span className="font-black text-slate-900">{rating.toFixed(1)}</span>
                <span className="text-slate-500 font-medium">({reviewCount.toLocaleString()} reviews)</span>
              </div>

              {/* Location */}
              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-600">
                <MapPin className="size-4 text-slate-400 shrink-0" />
                <span className="line-clamp-1">{fullAddress || 'Civil Lines, Bilaspur, Chhattisgarh - 495001'}</span>
              </div>
            </div>

            {/* View on Map Button */}
            <button
              type="button"
              onClick={onViewOnMap}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/70 text-blue-700 text-xs font-bold transition-all shadow-2xs self-start sm:self-auto cursor-pointer"
            >
              <MapPin className="size-3.5 text-blue-600" />
              <span>View on Map</span>
              <ExternalLink className="size-3 text-blue-500" />
            </button>
          </div>

          {/* Mobile Action Buttons (Edit & Deactivate) matching user phone mockup */}
          {(onEdit || onToggleActive) && (
            <div className="sm:hidden grid grid-cols-2 gap-2.5 pt-3 w-full">
              {onEdit && (
                <button
                  type="button"
                  onClick={onEdit}
                  className="w-full py-2.5 px-3 rounded-xl border border-blue-200 bg-blue-50/80 active:bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Edit3 className="size-3.5 text-blue-600" />
                  <span>Edit</span>
                </button>
              )}

              {onToggleActive && (
                <button
                  type="button"
                  disabled={isTogglingActive}
                  onClick={onToggleActive}
                  className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs disabled:opacity-50 ${
                    hospital.isActive
                      ? 'border-rose-200 bg-rose-50/80 text-rose-700 active:bg-rose-100'
                      : 'border-emerald-200 bg-emerald-50/80 text-emerald-700 active:bg-emerald-100'
                  }`}
                >
                  {hospital.isActive ? (
                    <>
                      <PowerOff className="size-3.5 text-rose-600" />
                      <span>Deactivate</span>
                    </>
                  ) : (
                    <>
                      <Power className="size-3.5 text-emerald-600" />
                      <span>Activate</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="border-t border-slate-100 pt-3 sticky top-14 z-20 bg-white/95 backdrop-blur-md -mx-5 px-5 sm:mx-0 sm:px-0">
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none py-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onSelectTab(tab.key)}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
