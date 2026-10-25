import { useState, type FC } from 'react'
import { CalendarOff, Plus, CheckCircle2, AlertCircle } from 'lucide-react'
import type { DoctorLeaveItem } from '@/services/doctorService'
import { DoctorApplyLeaveModal } from './DoctorApplyLeaveModal'

interface DoctorLeavesManagerProps {
  leaves: DoctorLeaveItem[]
  onApplyLeave: (date: string, reason: string) => Promise<{ success: boolean; message?: string }>
  onCancelLeave: (date: string) => Promise<boolean>
}

export const DoctorLeavesManager: FC<DoctorLeavesManagerProps> = ({
  leaves,
  onApplyLeave,
  onCancelLeave,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [cancellingDate, setCancellingDate] = useState<string | null>(null)
  const [actionAlert, setActionAlert] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  )

  const handleCancel = async (date: string) => {
    if (!window.confirm(`Are you sure you want to cancel leave on ${date}? Slots will be reopened.`)) {
      return
    }

    setCancellingDate(date)
    setActionAlert(null)
    const success = await onCancelLeave(date)
    setCancellingDate(null)

    if (success) {
      setActionAlert({ type: 'success', text: `Leave for ${date} cancelled. Slots reopened.` })
      setTimeout(() => setActionAlert(null), 4000)
    } else {
      setActionAlert({ type: 'error', text: 'Failed to cancel leave. Please try again.' })
    }
  }

  // Sort leaves by date descending (or upcoming first)
  const sortedLeaves = [...leaves].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <CalendarOff className="size-4 stroke-[2.2]" />
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Leaves & Holidays
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Manage your planned leaves. These dates will not be available for booking.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition-all cursor-pointer self-start sm:self-auto active:scale-[0.98]"
        >
          <Plus className="size-4 stroke-[2.5]" />
          <span>Apply for New Leave</span>
        </button>
      </div>

      {/* Action Alert Banner */}
      {actionAlert && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center gap-2.5 animate-in fade-in duration-200 ${
            actionAlert.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {actionAlert.type === 'success' ? (
            <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="size-4 text-rose-600 shrink-0" />
          )}
          <span>{actionAlert.text}</span>
        </div>
      )}

      {/* Table or Empty State */}
      {sortedLeaves.length === 0 ? (
        <div className="py-12 px-4 text-center rounded-2xl bg-slate-50/70 border border-dashed border-slate-200 space-y-2">
          <CalendarOff className="size-8 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">No Leaves Scheduled</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You currently have no scheduled leaves. Your clinic is active and accepting
            appointments for all configured working days.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-black uppercase tracking-wider text-slate-400">
                <th className="pb-3 px-3">Date(s)</th>
                <th className="pb-3 px-3">Reason</th>
                <th className="pb-3 px-3">Duration</th>
                <th className="pb-3 px-3">Applied On</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {sortedLeaves.map((leave, idx) => {
                const leaveDateObj = new Date(leave.date)
                const formattedDate = leaveDateObj.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
                const formattedAppliedOn = leave.createdAt
                  ? new Date(leave.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : formattedDate

                const isCancelling = cancellingDate === leave.date

                return (
                  <tr key={leave._id || `${leave.date}-${idx}`} className="hover:bg-slate-50/60 transition-colors">
                    {/* Date */}
                    <td className="py-3.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                      {formattedDate}
                    </td>

                    {/* Reason */}
                    <td className="py-3.5 px-3 font-semibold text-slate-700">
                      {leave.reason || 'Personal Leave'}
                    </td>

                    {/* Duration */}
                    <td className="py-3.5 px-3 font-semibold text-slate-500 whitespace-nowrap">
                      1 day
                    </td>

                    {/* Applied On */}
                    <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap">
                      {formattedAppliedOn}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        <span className="size-1.5 rounded-full bg-emerald-500" />
                        <span>Approved</span>
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleCancel(leave.date)}
                        disabled={isCancelling}
                        className="px-3 py-1 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isCancelling ? 'Cancelling...' : 'Cancel'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Apply Leave Modal */}
      <DoctorApplyLeaveModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={onApplyLeave}
      />
    </div>
  )
}
