import { type FC } from 'react'
import {
  Building2,
  Power,
  ChevronRight,
  ShieldCheck,
  Clock,
  ShieldAlert,
} from 'lucide-react'
import type { DoctorVerificationRecord } from '@/types/superAdmin'
import { useAdminDoctorsStore } from '@/store/adminDoctorsStore'

interface AdminDoctorsTableViewProps {
  doctors: DoctorVerificationRecord[]
}

export const AdminDoctorsTableView: FC<AdminDoctorsTableViewProps> = ({ doctors }) => {
  const { openDoctorDetails, openStatusModal } = useAdminDoctorsStore()

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
      {/* 1. Desktop & Tablet Table (>= 640px) */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-500 font-extrabold text-[11px] uppercase tracking-wider">
              <th className="py-3.5 px-4 sm:px-5">Doctor</th>
              <th className="py-3.5 px-4">Hospital</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 sm:px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
            {doctors.map((doctor) => {
              const doctorName = doctor.userId?.name
                ? doctor.userId.name.startsWith('Dr.')
                  ? doctor.userId.name
                  : `Dr. ${doctor.userId.name}`
                : 'Dr. Specialist'

              const isActive = doctor.userId?.isActive ?? (doctor.verificationStatus === 'APPROVED')
              const isPending = doctor.verificationStatus === 'PENDING'
              const isSuspended = doctor.verificationStatus === 'SUSPENDED' || !isActive
              const hospitalName = doctor.hospitalId?.name || 'Unaffiliated'

              return (
                <tr
                  key={doctor._id}
                  onClick={() => openDoctorDetails(doctor)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  {/* Doctor Info: Avatar, Name, Department */}
                  <td className="py-3.5 px-4 sm:px-5">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <div className="size-10 rounded-2xl overflow-hidden bg-blue-100 border border-slate-200/80 flex items-center justify-center font-bold text-blue-700">
                          {doctor.userId?.avatar ? (
                            <img
                              src={doctor.userId.avatar}
                              alt={doctorName}
                              className="size-full object-cover"
                            />
                          ) : (
                            doctorName.replace('Dr. ', '').charAt(0) || 'D'
                          )}
                        </div>
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-white ${
                            isActive ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                          {doctorName}
                        </p>
                        <p className="text-[11px] text-slate-500 font-semibold truncate">
                          {doctor.department || 'Clinical Specialist'}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Affiliated Hospital */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <Building2 className="size-3.5 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[200px]">{hospitalName}</span>
                    </div>
                  </td>

                  {/* Status: Account & Verification */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Account status */}
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${
                            isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                          }`}
                        />
                        <span>{isActive ? 'Active' : 'Disabled'}</span>
                      </span>

                      {/* Verification status */}
                      {isPending ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="size-2.5" />
                          <span>Pending</span>
                        </span>
                      ) : isSuspended ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          <ShieldAlert className="size-2.5" />
                          <span>Suspended</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          <ShieldCheck className="size-2.5" />
                          <span>Verified</span>
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 sm:px-5 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openStatusModal(doctor, isActive ? 'disable' : 'enable')}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1 shadow-2xs ${
                          isActive
                            ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                        }`}
                        title={isActive ? 'Deactivate Doctor Account' : 'Activate Doctor Account'}
                      >
                        <Power className="size-2.5 stroke-[2.5]" />
                        <span>{isActive ? 'Disable' : 'Enable'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openDoctorDetails(doctor)}
                        className="px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-blue-600 text-slate-700 hover:text-white border border-slate-200 text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                      >
                        <span>Details</span>
                        <ChevronRight className="size-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* 2. Mobile Streamlined List View (< 640px) */}
      <div className="sm:hidden divide-y divide-slate-100">
        {doctors.map((doctor) => {
          const doctorName = doctor.userId?.name
            ? doctor.userId.name.startsWith('Dr.')
              ? doctor.userId.name
              : `Dr. ${doctor.userId.name}`
            : 'Dr. Specialist'

          const isActive = doctor.userId?.isActive ?? (doctor.verificationStatus === 'APPROVED')
          const hospitalName = doctor.hospitalId?.name || 'Unaffiliated'

          return (
            <div
              key={doctor._id}
              onClick={() => openDoctorDetails(doctor)}
              className="p-3.5 space-y-2.5 hover:bg-slate-50/70 transition-colors cursor-pointer active:bg-slate-100"
            >
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative shrink-0">
                    <div className="size-10 rounded-xl overflow-hidden bg-blue-100 border border-slate-200 flex items-center justify-center font-bold text-blue-700">
                      {doctor.userId?.avatar ? (
                        <img
                          src={doctor.userId.avatar}
                          alt={doctorName}
                          className="size-full object-cover"
                        />
                      ) : (
                        doctorName.replace('Dr. ', '').charAt(0) || 'D'
                      )}
                    </div>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-white ${
                        isActive ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="font-black text-sm text-slate-900 truncate">
                      {doctorName}
                    </p>
                    <p className="text-[11px] font-semibold text-slate-500 truncate">
                      {doctor.department}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full border shrink-0 ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {isActive ? 'Active' : 'Disabled'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 text-slate-600">
                <div className="flex items-center gap-1.5 truncate max-w-[180px] font-medium text-[11px]">
                  <Building2 className="size-3 text-slate-400 shrink-0" />
                  <span className="truncate">{hospitalName}</span>
                </div>

                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => openStatusModal(doctor, isActive ? 'disable' : 'enable')}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {isActive ? 'Disable' : 'Enable'}
                  </button>

                  <button
                    type="button"
                    onClick={() => openDoctorDetails(doctor)}
                    className="p-1 rounded-lg text-slate-400 hover:text-blue-600 cursor-pointer"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AdminDoctorsTableView
