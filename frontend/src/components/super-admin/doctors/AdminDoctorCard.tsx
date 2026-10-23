import { type FC } from 'react'
import {
  Building2,
  ChevronRight,
  ShieldCheck,
  Power,
  Clock,
  ShieldAlert,
} from 'lucide-react'
import type { DoctorVerificationRecord } from '@/types/superAdmin'
import { useAdminDoctorsStore } from '@/store/adminDoctorsStore'

interface AdminDoctorCardProps {
  doctor: DoctorVerificationRecord
}

export const AdminDoctorCard: FC<AdminDoctorCardProps> = ({ doctor }) => {
  const { openDoctorDetails, openStatusModal } = useAdminDoctorsStore()

  const doctorName = doctor.userId?.name
    ? doctor.userId.name.startsWith('Dr.')
      ? doctor.userId.name
      : `Dr. ${doctor.userId.name}`
    : 'Dr. Specialist'

  const hospitalName = doctor.hospitalId?.name || 'General OPD'
  const isActive = doctor.userId?.isActive ?? (doctor.verificationStatus === 'APPROVED')
  const isPending = doctor.verificationStatus === 'PENDING'
  const isSuspended = doctor.verificationStatus === 'SUSPENDED' || !isActive

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isActive) {
      openStatusModal(doctor, 'disable')
    } else {
      openStatusModal(doctor, 'enable')
    }
  }

  return (
    <div
      onClick={() => openDoctorDetails(doctor)}
      className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 hover:border-blue-400/80 p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group relative overflow-hidden cursor-pointer select-none"
    >
      {/* Top Section: Avatar, Name, Department & Status Badges */}
      <div className="space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          {/* Avatar with Status indicator ring */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <div className="size-12 sm:size-13 rounded-2xl overflow-hidden bg-gradient-to-tr from-blue-100 to-indigo-100 border border-slate-200/80 shadow-2xs flex items-center justify-center group-hover:scale-105 transition-transform">
                {doctor.userId?.avatar ? (
                  <img
                    src={doctor.userId.avatar}
                    alt={doctorName}
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="font-black text-base text-blue-700">
                    {doctorName.replace('Dr. ', '').charAt(0) || 'D'}
                  </span>
                )}
              </div>
              {/* Online/Active dot indicator */}
              <span
                className={`absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-white ${
                  isActive ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
            </div>

            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-black text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                {doctorName}
              </h3>
              <p className="text-xs font-semibold text-slate-500 truncate">
                {doctor.department || 'Clinical Specialist'}
              </p>
            </div>
          </div>

          {/* Verification Badge */}
          <div className="shrink-0">
            {isPending ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
                <Clock className="size-3 text-amber-600" />
                <span>Pending</span>
              </span>
            ) : isSuspended ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
                <ShieldAlert className="size-3 text-rose-600" />
                <span>Suspended</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
                <ShieldCheck className="size-3 text-blue-600" />
                <span>Verified</span>
              </span>
            )}
          </div>
        </div>

        {/* Hospital Info & Status Line */}
        <div className="bg-slate-50/70 rounded-xl px-3 py-2 border border-slate-200/60 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 min-w-0">
            <Building2 className="size-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{hospitalName}</span>
          </div>

          <span
            className={`text-[10px] font-black px-2 py-0.5 rounded-md border shrink-0 ${
              isActive
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            {isActive ? 'Active' : 'Disabled'}
          </span>
        </div>
      </div>

      {/* Bottom CTA Row: Toggle Account Status + View Details */}
      <div className="flex items-center justify-between gap-2 pt-3.5 mt-3.5 border-t border-slate-100">
        <button
          type="button"
          onClick={handleToggleClick}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-2xs ${
            isActive
              ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200/80'
              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200/80'
          }`}
          title={isActive ? 'Deactivate Doctor Account' : 'Activate Doctor Account'}
        >
          <Power className="size-3 stroke-[2.5]" />
          <span>{isActive ? 'Disable' : 'Enable'}</span>
        </button>

        <button
          type="button"
          onClick={() => openDoctorDetails(doctor)}
          className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-50 group-hover:bg-blue-600 text-slate-700 group-hover:text-white border border-slate-200/80 group-hover:border-blue-600 transition-all cursor-pointer shadow-2xs"
        >
          <span>View Details</span>
          <ChevronRight className="size-3.5" />
        </button>
      </div>
    </div>
  )
}

export default AdminDoctorCard
