import { type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useHospitalAdminStore } from '@/store/hospitalAdminStore'

export const PendingJoinRequestsCard: FC = () => {
  const navigate = useNavigate()
  const { pendingRequests, approveDoctorRequest, rejectDoctorRequest, setSelectedApplicant } =
    useHospitalAdminStore()

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-2xs flex flex-col justify-between overflow-hidden h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
            Pending Doctor Join Requests
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Specialist affiliation applications awaiting approval
          </p>
        </div>
        <button
          onClick={() => navigate('/hospital-admin/join-requests')}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer transition-colors shrink-0"
        >
          <span>View All</span>
          <ChevronRight className="size-3.5" />
        </button>
      </div>

      {/* Applicant Doctors List */}
      <div className="space-y-3 pt-1">
        {pendingRequests.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            No pending doctor applications right now.
          </div>
        ) : (
          pendingRequests.slice(0, 4).map((req) => (
            <div
              key={req.id}
              className="flex items-center justify-between gap-2.5 p-2 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all text-xs group"
            >
              {/* Doctor Details */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="size-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0 overflow-hidden shadow-xs">
                  {req.avatar ? (
                    <img src={req.avatar} alt={req.doctorName} className="size-full object-cover" />
                  ) : (
                    <span>{req.doctorName.replace('Dr. ', '').charAt(0)}</span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="font-extrabold text-slate-900 truncate leading-snug text-xs">
                    {req.doctorName}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate">
                    {req.specialization?.[0] || req.department}
                  </p>
                  <span className="text-[10px] text-slate-400 block -mt-0.5">
                    {req.appliedDaysAgo}
                  </span>
                </div>
              </div>

              {/* Action Buttons matching mockup */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setSelectedApplicant(req)}
                  className="px-2 py-1 text-[11px] font-bold text-blue-600 bg-blue-50/90 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                  title="View Profile Details"
                >
                  View
                </button>

                <button
                  onClick={() => approveDoctorRequest(req.id)}
                  className="px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-lg transition-all cursor-pointer shadow-xs shadow-emerald-600/20"
                  title="Approve Affiliation"
                >
                  Approve
                </button>

                <button
                  onClick={() => rejectDoctorRequest(req.id)}
                  className="px-1.5 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Reject"
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
export default PendingJoinRequestsCard
