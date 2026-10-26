import { type FC } from 'react'
import {
  Building2,
  Calendar,
  ChevronRight,
  ShieldCheck,
  FileCheck2,
  Briefcase,
  IdCard,
} from 'lucide-react'
import type { HospitalAdminVerificationRecord } from '@/types/superAdmin'

interface HospitalAdminVerificationCardProps {
  admin: HospitalAdminVerificationRecord
  isSelected: boolean
  onSelect: () => void
}

export const HospitalAdminVerificationCard: FC<HospitalAdminVerificationCardProps> = ({
  admin,
  isSelected,
  onSelect,
}) => {
  const adminName = admin.userId?.name || 'Administrator'
  const designation = admin.designation || 'Hospital Administrator'

  const hospitalName =
    admin.hospitalName ||
    admin.hospitalId?.name ||
    'Independent / Hospital to be added'

  const hasHospitalDetails = Boolean(admin.hospitalName || admin.hospitalId?.name)

  // Format submitted/created date
  const dateToFormat = admin.submittedAt || admin.createdAt
  const appliedDate = dateToFormat
    ? new Date(dateToFormat).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recent'

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return {
          label: 'Approved',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/90',
          dot: 'bg-emerald-500',
        }
      case 'REJECTED':
        return {
          label: 'Rejected',
          bg: 'bg-rose-50 text-rose-700 border-rose-200/90',
          dot: 'bg-rose-500',
        }
      case 'SUSPENDED':
        return {
          label: 'Suspended',
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
        }
      case 'INCOMPLETE':
        return {
          label: 'Draft / Incomplete',
          bg: 'bg-slate-100 text-slate-600 border-slate-200',
          dot: 'bg-slate-400',
        }
      default:
        return {
          label: 'Pending Review',
          bg: 'bg-amber-50 text-amber-700 border-amber-200/90',
          dot: 'bg-amber-500',
        }
    }
  }

  const badge = getStatusBadge(admin.verificationStatus)

  return (
    <div
      onClick={onSelect}
      className={`rounded-2xl p-4 transition-all duration-200 cursor-pointer border select-none relative group ${
        isSelected
          ? 'bg-blue-50/50 border-blue-500 shadow-md shadow-blue-500/10 ring-2 ring-blue-500/20'
          : 'bg-white hover:bg-slate-50/80 border-slate-200/90 hover:border-slate-300 shadow-2xs hover:shadow-xs'
      }`}
    >
      <div className="space-y-3">
        {/* Top: Avatar, Name & Status Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-11 rounded-2xl overflow-hidden bg-gradient-to-tr from-sky-100 to-blue-100 shrink-0 border border-slate-200/80 shadow-2xs flex items-center justify-center">
              {admin.userId?.avatar ? (
                <img
                  src={admin.userId.avatar}
                  alt={adminName}
                  className="size-full object-cover"
                />
              ) : (
                <span className="font-black text-sm text-blue-700">
                  {adminName.charAt(0).toUpperCase() || 'A'}
                </span>
              )}
            </div>

            <div className="min-w-0">
              <h4 className="text-sm font-black text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                {adminName}
              </h4>
              <p className="text-xs font-bold text-slate-600 truncate flex items-center gap-1">
                <Briefcase className="size-3 text-blue-500 shrink-0" />
                <span>{designation}</span>
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black border shrink-0 ${badge.bg}`}
          >
            <span className={`size-1.5 rounded-full ${badge.dot}`} />
            <span>{badge.label}</span>
          </span>
        </div>

        {/* Hospital Affiliation Info */}
        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
          <Building2
            className={`size-3.5 shrink-0 ${
              hasHospitalDetails ? 'text-blue-600' : 'text-slate-400'
            }`}
          />
          <span
            className={`truncate ${
              hasHospitalDetails ? 'font-bold text-slate-800' : 'italic text-slate-400 text-[11px]'
            }`}
          >
            {hospitalName}
          </span>
        </div>

        {/* Document & Credential Tags */}
        <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-600">
          {/* Government ID Type */}
          {admin.governmentIdType && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 font-mono text-[10px] font-bold text-slate-700 border border-slate-200/80">
              <IdCard className="size-3 text-blue-600 shrink-0" />
              <span>{admin.governmentIdType}</span>
            </span>
          )}

          {/* Authorization Letter indicator */}
          {admin.authorizationLetterUrl && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-[10px] font-bold text-emerald-800 border border-emerald-200/80">
              <FileCheck2 className="size-3 text-emerald-600 shrink-0" />
              <span>Auth Letter Attached</span>
            </span>
          )}

          {/* Hospital Reg Number if exists */}
          {admin.hospitalRegistrationNumber && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-[10px] font-bold text-indigo-700 border border-indigo-200/80">
              <ShieldCheck className="size-3 text-indigo-600 shrink-0" />
              <span>Reg: {admin.hospitalRegistrationNumber}</span>
            </span>
          )}
        </div>

        {/* Bottom Footer: Applied Date & View Details Button */}
        <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
            <Calendar className="size-3 text-slate-400 shrink-0" />
            <span>Applied {appliedDate}</span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onSelect()
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs ${
              isSelected
                ? 'bg-blue-600 text-white shadow-blue-500/25 ring-2 ring-blue-600/20'
                : 'bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-400 text-blue-600'
            }`}
          >
            <span>View Details</span>
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default HospitalAdminVerificationCard
