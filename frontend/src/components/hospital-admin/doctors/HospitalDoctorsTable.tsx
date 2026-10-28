import { type FC } from 'react'
import {
  Star,
  IndianRupee,
  Building2,
  UserX,
  Eye,
} from 'lucide-react'
import { useHospitalAdminDoctorsStore } from '@/store/hospitalAdminDoctorsStore'
import { DoctorAvatar } from '@/components/hospital-admin/join-requests/JoinRequestsTable'

export const HospitalDoctorsTable: FC = () => {
  const {
    doctors,
    isLoading,
    pagination,
    openDisaffiliateModal,
    setSelectedDoctorForModal,
  } = useHospitalAdminDoctorsStore()

  const startIndex = (pagination.currentPage - 1) * pagination.limit

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="divide-y divide-slate-100 p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 animate-pulse pt-2">
              <div className="size-11 rounded-2xl bg-slate-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-3 bg-slate-100 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (doctors.length === 0) {
    return null // Empty state is handled by Grid / Parent
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-black uppercase tracking-wider text-slate-400">
              <th className="py-4 pl-6 pr-3 text-center w-12">#</th>
              <th className="py-4 px-4 min-w-[220px]">Doctor Profile</th>
              <th className="py-4 px-4 min-w-[160px]">Department</th>
              <th className="py-4 px-4 min-w-[180px]">Hospital Branch</th>
              <th className="py-4 px-4 min-w-[140px]">Experience & Fee</th>
              <th className="py-4 px-4 min-w-[100px]">Rating</th>
              <th className="py-4 pl-4 pr-6 text-center min-w-[160px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-medium">
            {doctors.map((doc, idx) => {
              const globalIdx = startIndex + idx + 1
              const doctorName = doc.userId?.name || 'Dr. Specialist'
              const doctorEmail = doc.userId?.email || 'doctor@curehealth.org'
              const doctorPhone = doc.userId?.phoneNumber
              const doctorAvatar = doc.userId?.avatar
              const hospitalName = doc.hospitalId?.name || 'Hospital Branch'
              const expYears = doc.experienceYears || 5
              const fee = doc.consultationFee || 650
              const rating = doc.ratingAverage || 4.8
              const dept = doc.department || 'General Medicine'

              return (
                <tr key={doc._id} className="hover:bg-blue-50/30 transition-colors group">
                  {/* # Index */}
                  <td className="py-4 pl-6 pr-3 text-center text-slate-400 font-bold text-xs">
                    {globalIdx}
                  </td>

                  {/* Doctor Profile Info */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3.5">
                      <DoctorAvatar name={doctorName} avatarUrl={doctorAvatar} size="md" />
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => setSelectedDoctorForModal(doc)}
                          className="font-extrabold text-sm text-slate-900 hover:text-blue-600 transition-colors truncate block text-left cursor-pointer"
                        >
                          {doctorName}
                        </button>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span className="truncate">{doctorEmail}</span>
                          {doctorPhone && (
                            <>
                              <span>•</span>
                              <span>{doctorPhone}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Department & Specialty */}
                  <td className="py-4 px-4">
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-900 block text-xs">
                        {dept}
                      </span>
                      {doc.specialization?.[0] && (
                        <span className="text-[11px] text-slate-400 font-medium block truncate max-w-[160px]">
                          {doc.specialization[0]}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Hospital Branch */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="size-4 text-blue-500 shrink-0" />
                      <span className="font-bold text-slate-800 truncate block max-w-[180px]">
                        {hospitalName}
                      </span>
                    </div>
                  </td>

                  {/* Experience & Fee */}
                  <td className="py-4 px-4">
                    <div className="space-y-0.5">
                      <span className="font-extrabold text-slate-900 block text-xs">
                        {expYears}+ years
                      </span>
                      <span className="text-[11px] text-slate-500 font-semibold flex items-center">
                        <IndianRupee className="size-3 text-slate-400" />
                        <span>{fee} OPD fee</span>
                      </span>
                    </div>
                  </td>

                  {/* Rating */}
                  <td className="py-4 px-4">
                    <div className="inline-flex items-center gap-1 text-xs font-black text-slate-800 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/60">
                      <Star className="size-3.5 fill-amber-400 text-amber-500" />
                      <span>{rating.toFixed(1)}</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-4 pl-4 pr-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedDoctorForModal(doc)}
                        className="px-3 py-1.5 rounded-xl border border-blue-200 bg-white hover:bg-blue-50 text-blue-700 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="size-3.5" />
                        <span>Profile</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openDisaffiliateModal(doc)}
                        className="p-1.5 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-600 transition-all shadow-2xs cursor-pointer"
                        title="Remove from Hospital"
                      >
                        <UserX className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default HospitalDoctorsTable
