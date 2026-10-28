import { useState, type FC } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2,
  Clock,
  Star,
  MapPin,
  ExternalLink,
  Edit3,
  Power,
  PowerOff,
  ShieldCheck,
  Bed,
  BellRing,
  HeartPulse,
  Share2,
  Check,
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
  pendingRequestsCount?: number
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
  pendingRequestsCount = 0,
  activeTab,
  onSelectTab,
  onViewOnMap,
  onEdit,
  onToggleActive,
  isTogglingActive = false,
}) => {
  const [isCopiedShare, setIsCopiedShare] = useState(false)

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
    { key: 'departments', label: 'Departments', badge: hospital.departments?.length || 11 },
    { key: 'doctors', label: `Doctors`, badge: doctorCount },
    { key: 'facilities', label: 'Facilities', badge: hospital.facilities?.length || 7 },
    { key: 'gallery', label: 'Gallery' },
    { key: 'settings', label: 'Settings' },
  ]

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: hospital.name,
        url: window.location.href,
      }).catch(() => {})
    } else {
      navigator.clipboard?.writeText(window.location.href)
      setIsCopiedShare(true)
      setTimeout(() => setIsCopiedShare(false), 2000)
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs space-y-6 hover:border-slate-300 transition-all">
      {/* ── Pending Requests Alert Banner (if any) ─────────────────────────── */}
      {pendingRequestsCount > 0 && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-between gap-3 text-amber-900 shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm animate-bounce">
              <BellRing className="size-4.5" />
            </div>
            <div className="min-w-0">
              <span className="text-xs sm:text-sm font-black block">
                {pendingRequestsCount} Doctor Join {pendingRequestsCount === 1 ? 'Request' : 'Requests'} Pending Verification
              </span>
              <span className="text-[11px] text-amber-700 font-medium block truncate">
                Doctors have applied to join {hospital.name}. Review their license credentials & experiences.
              </span>
            </div>
          </div>
          <Link
            to={`/hospital-admin/join-requests?hospitalId=${hospital._id}`}
            className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black shrink-0 transition-colors shadow-2xs"
          >
            Review Now
          </Link>
        </div>
      )}

      {/* ── Hospital Identity Row ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start gap-5">
        {/* Hospital Logo / Badge */}
        <div className="relative size-18 sm:size-22 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20 ring-4 ring-blue-50">
          <Building2 className="size-9 sm:size-11" />
          <div className="absolute -bottom-1 -right-1 size-6 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-2 ring-white shadow-2xs" title="Verified Hospital">
            <ShieldCheck className="size-3.5" />
          </div>
        </div>

        {/* Identity Details */}
        <div className="space-y-2.5 flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                {hospital.name}
              </h1>

              {/* Active Status Badge */}
              {hospital.isActive !== false ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Active & Verified</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-600 border border-slate-200">
                  <span className="size-2 rounded-full bg-slate-400" />
                  <span>Inactive</span>
                </span>
              )}
            </div>

            {/* Top Share Button on mobile/small screens */}
            <button
              type="button"
              onClick={handleShare}
              className="sm:hidden p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all shadow-2xs cursor-pointer"
              title="Share Hospital"
            >
              {isCopiedShare ? <Check className="size-4 text-emerald-600" /> : <Share2 className="size-4" />}
            </button>
          </div>

          {/* Quick Credential Badges */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 flex-wrap">
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold border border-slate-200/60">
              {hospital.hospitalType || 'Multi-Speciality Care'}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-200/60 flex items-center gap-1">
              <Clock className="size-3 text-blue-600" />
              <span>Est. {hospital.establishmentYear || 2018}</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 font-bold border border-sky-200/60 flex items-center gap-1">
              <Bed className="size-3 text-sky-600" />
              <span>{hospital.totalBeds || 150} Beds</span>
            </span>
            {hospital.isEmergency24x7 !== false && (
              <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 font-bold border border-rose-200/60 flex items-center gap-1">
                <HeartPulse className="size-3 text-rose-600" />
                <span>24×7 Emergency</span>
              </span>
            )}
          </div>

          {/* Ratings & Location Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Rating */}
              <div className="flex items-center gap-1.5 text-xs sm:text-sm bg-amber-50/70 border border-amber-200/60 px-2.5 py-1 rounded-xl">
                <Star className="size-3.5 fill-amber-400 text-amber-500" />
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-600 hover:text-white text-blue-700 text-xs font-black transition-all shadow-2xs self-start sm:self-auto cursor-pointer group"
            >
              <MapPin className="size-3.5 text-blue-600 group-hover:text-white transition-colors" />
              <span>View Map</span>
              <ExternalLink className="size-3 text-blue-500 group-hover:text-white transition-colors" />
            </button>
          </div>

          {/* Mobile Action Buttons (Edit & Deactivate) */}
          {(onEdit || onToggleActive) && (
            <div className="sm:hidden grid grid-cols-2 gap-2.5 pt-3 w-full border-t border-slate-100">
              {onEdit && (
                <button
                  type="button"
                  onClick={onEdit}
                  className="w-full py-2.5 px-3 rounded-xl border border-blue-200 bg-blue-50/80 active:bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Edit3 className="size-3.5 text-blue-600" />
                  <span>Edit Hospital</span>
                </button>
              )}

              {onToggleActive && (
                <button
                  type="button"
                  disabled={isTogglingActive}
                  onClick={onToggleActive}
                  className={`w-full py-2.5 px-3 rounded-xl border text-xs font-black flex items-center justify-center gap-1.5 shadow-2xs disabled:opacity-50 ${
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

      {/* ── Tabs Navigation Bar ────────────────────────────────────────────── */}
      <div className="border-t border-slate-100 pt-3 sticky top-14 z-20 bg-white/95 backdrop-blur-md -mx-5 px-5 sm:mx-0 sm:px-0">
        <nav className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onSelectTab(tab.key)}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-600/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide ${
                      isActive
                        ? 'bg-white/25 text-white'
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

export default HospitalIdentityBanner
