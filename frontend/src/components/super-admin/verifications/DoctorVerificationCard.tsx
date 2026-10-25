import { type FC } from 'react'
import {
  Building2,
  Calendar,
  ChevronRight,
  ShieldCheck,
  Stethoscope,
  IndianRupee,
  Clock,
  UserCheck,
} from 'lucide-react'
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

  const hasHospital = Boolean(doctor.hospitalId?.name)
  const hospitalName = hasHospital ? doctor.hospitalId!.name : 'Independent Practitioner'

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
      default:
        return {
          label: 'Pending',
          bg: 'bg-amber-50 text-amber-700 border-amber-200/90',
          dot: 'bg-amber-500',
        }
    }
  }

  const badge = getStatusBadge(doctor.verificationStatus)

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
            <div className="size-11 rounded-2xl overflow-hidden bg-gradient-to-tr from-blue-100 to-indigo-100 shrink-0 border border-slate-200/80 shadow-2xs flex items-center justify-center">
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
              <h4 className="text-sm font-black text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                {doctorName}
              </h4>
              <p className="text-xs font-bold text-slate-600 truncate flex items-center gap-1">
                <Stethoscope className="size-3 text-blue-500 shrink-0" />
                <span>{doctor.department || 'General Medicine'}</span>
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

        {/* Qualifications snippet */}
        <p className="text-[11px] text-slate-500 font-medium truncate">
          {qualificationsStr}
        </p>

        {/* Middle Metadata Chips */}
        <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-600">
          {/* Registration Number */}
          {doctor.medicalCouncilRegistrationNumber && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 font-mono text-[10px] font-bold text-slate-700 border border-slate-200/80">
              <ShieldCheck className="size-3 text-blue-600 shrink-0" />
              <span>{doctor.medicalCouncilRegistrationNumber}</span>
            </span>
          )}

          {/* Experience */}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 font-semibold text-slate-600 border border-slate-200/60">
            <Clock className="size-3 text-slate-400 shrink-0" />
            <span>{doctor.experienceYears || 0}+ Yrs Exp</span>
          </span>

          {/* Consultation Fee */}
          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/60">
            <IndianRupee className="size-3 text-emerald-600 shrink-0" />
            <span>{doctor.consultationFee || 0}</span>
          </span>
        </div>

        {/* Affiliation info */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          {hasHospital ? (
            <Building2 className="size-3.5 text-blue-500 shrink-0" />
          ) : (
            <UserCheck className="size-3.5 text-emerald-500 shrink-0" />
          )}
          <span className="truncate">{hospitalName}</span>
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

export default DoctorVerificationCard
