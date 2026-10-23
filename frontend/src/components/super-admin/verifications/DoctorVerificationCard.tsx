import { type FC } from 'react'
import { Building2, Calendar, ChevronRight } from 'lucide-react'
import type { DoctorVerificationRecord } from '@/types/superAdmin'

interface DoctorVerificationCardProps {
  doctor: DoctorVerificationRecord
  isSelected: boolean
  onSelect: () => void
}

export const DoctorVerificationCard: FC<DoctorVerificationCardProps> = ({
  doctor,
  isSelected,
  onSelect,
}) => {
  const doctorName = doctor.userId?.name
    ? doctor.userId.name.startsWith('Dr.')
      ? doctor.userId.name
      : `Dr. ${doctor.userId.name}`
    : 'Dr. Unknown'

  const qualificationsStr =
    Array.isArray(doctor.qualifications) && doctor.qualifications.length > 0
      ? doctor.qualifications.join(', ')
      : 'MBBS'

  const hospitalName = doctor.hospitalId?.name || 'Unaffiliated / General OPD'
  const hospitalLoc = doctor.hospitalId?.address?.city
    ? `${doctor.hospitalId.address.city}, ${doctor.hospitalId.address.state || 'India'}`
    : ''

  // Format date
  const appliedDate = doctor.createdAt
    ? new Date(doctor.createdAt).toLocaleDateString('en-US', {
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
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
          dot: 'bg-emerald-500',
        }
      case 'REJECTED':
        return {
          label: 'Rejected',
          bg: 'bg-rose-50 text-rose-700 border-rose-200/80',
          dot: 'bg-rose-500',
        }
      case 'SUSPENDED':
        return {
          label: 'Suspended',
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
        }
      default:
        return {
          label: '+ Pending',
          bg: 'bg-amber-50 text-amber-700 border-amber-200/80',
          dot: 'bg-amber-500',
        }
    }
  }

  const badge = getStatusBadge(doctor.verificationStatus)

  return (
    <div
      onClick={onSelect}
      className={`rounded-2xl p-3.5 sm:p-4 transition-all duration-200 cursor-pointer border select-none relative group ${
        isSelected
          ? 'bg-blue-50/40 border-blue-400/90 shadow-md shadow-blue-500/10 ring-2 ring-blue-500/20'
          : 'bg-white hover:bg-slate-50/70 border-slate-200/80 hover:border-slate-300 shadow-2xs'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left Section: Doctor Identity */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-11 sm:size-12 rounded-2xl overflow-hidden bg-gradient-to-tr from-blue-100 to-indigo-100 shrink-0 border border-slate-200/80 shadow-2xs flex items-center justify-center">
            {doctor.userId?.avatar ? (
              <img
                src={doctor.userId.avatar}
                alt={doctorName}
                className="size-full object-cover"
              />
            ) : (
              <span className="font-black text-sm text-blue-700">
                {doctorName.replace('Dr. ', '').charAt(0) || 'D'}
              </span>
            )}
          </div>

          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate group-hover:text-blue-600 transition-colors">
              {doctorName}
            </h4>
            <p className="text-[11px] font-bold text-slate-600 truncate">
              {doctor.department || 'Specialist'}
            </p>
            <p className="text-[10px] text-slate-400 font-medium truncate">
              {qualificationsStr}
            </p>
          </div>
        </div>

        {/* Middle Section: Hospital affiliation */}
        <div className="flex flex-col sm:max-w-[210px] min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 truncate">
            <Building2 className="size-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{hospitalName}</span>
          </div>
          {hospitalLoc && (
            <p className="text-[10px] text-slate-400 truncate pl-5">
              {hospitalLoc}
            </p>
          )}
        </div>

        {/* Applied Date */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium shrink-0">
          <Calendar className="size-3.5 text-slate-400 shrink-0" />
          <span className="text-[11px]">Applied on {appliedDate}</span>
        </div>

        {/* Right Section: Status badge & View Details Button */}
        <div className="flex items-center gap-2.5 justify-between sm:justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border ${badge.bg}`}
          >
            <span className={`size-1.5 rounded-full ${badge.dot}`} />
            <span>{badge.label}</span>
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onSelect()
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs ${
              isSelected
                ? 'bg-blue-600 text-white shadow-blue-500/30'
                : 'bg-white hover:bg-blue-50 border border-blue-200/80 text-blue-700 hover:border-blue-400'
            }`}
          >
            <span>View Details</span>
            <ChevronRight className="size-3" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default DoctorVerificationCard
