import { type FC } from 'react'
import { Link } from 'react-router-dom'
import {
  ChevronRight,
  Edit3,
  PowerOff,
  Power,
  Building2,
  Share2,
} from 'lucide-react'
import type { HospitalBranchItem } from '@/types/hospitalAdmin'

interface HospitalDetailHeaderProps {
  hospital: HospitalBranchItem
  onEdit: () => void
  onToggleActive: () => void
  isToggling?: boolean
}

export const HospitalDetailHeader: FC<HospitalDetailHeaderProps> = ({
  hospital,
  onEdit,
  onToggleActive,
  isToggling = false,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500 flex-wrap">
        <Link
          to="/hospital-admin/hospitals"
          className="hover:text-blue-600 transition-colors flex items-center gap-1.5"
        >
          <Building2 className="size-4 text-slate-400" />
          <span>Hospitals</span>
        </Link>
        <ChevronRight className="size-3.5 text-slate-300" />
        <span className="text-slate-900 font-bold line-clamp-1 max-w-xs sm:max-w-md">
          {hospital.name}
        </span>
      </div>

      {/* Top Action Buttons (Edit & Deactivate) on tablet & desktop */}
      <div className="hidden sm:flex items-center gap-2.5 self-start sm:self-auto">
        <button
          type="button"
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: hospital.name,
                url: window.location.href,
              }).catch(() => {})
            } else {
              navigator.clipboard?.writeText(window.location.href)
            }
          }}
          className="size-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center transition-all shadow-2xs hover:border-slate-300 cursor-pointer"
          title="Share hospital page"
        >
          <Share2 className="size-4" />
        </button>

        <button
          type="button"
          onClick={onEdit}
          className="px-4 py-2 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/70 text-blue-700 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-2xs hover:border-blue-300 cursor-pointer"
        >
          <Edit3 className="size-4 text-blue-600" />
          <span>Edit Hospital</span>
        </button>

        <button
          type="button"
          disabled={isToggling}
          onClick={onToggleActive}
          className={`px-4 py-2 rounded-xl border text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-2xs cursor-pointer disabled:opacity-50 ${
            hospital.isActive
              ? 'border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-700 hover:border-rose-300'
              : 'border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-700 hover:border-emerald-300'
          }`}
        >
          {hospital.isActive ? (
            <>
              <PowerOff className="size-4 text-rose-600" />
              <span>Deactivate</span>
            </>
          ) : (
            <>
              <Power className="size-4 text-emerald-600" />
              <span>Activate</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
