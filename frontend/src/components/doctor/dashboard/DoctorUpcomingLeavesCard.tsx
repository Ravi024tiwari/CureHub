import type { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarOff, ChevronRight, CalendarCheck } from 'lucide-react'

interface LeaveItem {
  _id?: string
  startDate: string
  endDate: string
  reason?: string
  status: string
}

interface DoctorUpcomingLeavesCardProps {
  leaves?: LeaveItem[]
}

export const DoctorUpcomingLeavesCard: FC<DoctorUpcomingLeavesCardProps> = ({
  leaves = [],
}) => {
  const navigate = useNavigate()

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      return {
        day: d.getDate(),
        month: d.toLocaleDateString('en-US', { month: 'short' }),
      }
    } catch {
      return { day: 1, month: 'Day' }
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <CalendarOff className="size-4.5 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900">Upcoming Leave</h3>
            <p className="text-[11px] text-slate-400 font-medium">Off-duty & leave schedule</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/doctor/leaves')}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>View All</span>
          <ChevronRight className="size-3.5" />
        </button>
      </div>

      {/* Leaves List */}
      {leaves.length > 0 ? (
        <div className="space-y-2.5">
          {leaves.map((leave, idx) => {
            const start = formatDate(leave.startDate)
            const isApproved = leave.status === 'APPROVED'

            return (
              <div
                key={leave._id || idx}
                className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/70 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-xl bg-white border border-slate-200 text-slate-900 flex flex-col items-center justify-center shrink-0 shadow-2xs">
                    <span className="text-xs font-black leading-none">{start.day}</span>
                    <span className="text-[9px] font-bold text-blue-600 uppercase mt-0.5">
                      {start.month}
                    </span>
                  </div>

                  <div>
                    <h5 className="text-xs font-black text-slate-900">
                      {leave.reason || 'Personal Leave'}
                    </h5>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                      Until {new Date(leave.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${
                    isApproved
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {isApproved ? 'Approved' : 'Pending'}
                </span>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-1.5">
          <CalendarCheck className="size-6 text-emerald-600 mx-auto" />
          <p className="text-xs font-bold text-slate-700">Full OPD Availability</p>
          <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
            No upcoming leaves registered. Your regular OPD clinic schedule is active.
          </p>
        </div>
      )}
    </div>
  )
}

export default DoctorUpcomingLeavesCard
