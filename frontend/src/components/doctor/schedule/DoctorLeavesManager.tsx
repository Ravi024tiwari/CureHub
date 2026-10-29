import { useState, type FC } from 'react'
import {
  CalendarOff,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  Calendar,
  Building2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import type { DoctorLeaveItem, ApplyDoctorLeavePayload } from '@/services/doctorService'
import { DoctorApplyLeaveModal } from './DoctorApplyLeaveModal'

interface DoctorLeavesManagerProps {
  leaves: DoctorLeaveItem[]
  onApplyLeave: (
    payload: ApplyDoctorLeavePayload | string,
    reason?: string
  ) => Promise<{ success: boolean; message?: string }>
  onCancelLeave: (idOrDate: string) => Promise<boolean>
}

export const DoctorLeavesManager: FC<DoctorLeavesManagerProps> = ({
  leaves,
  onApplyLeave,
  onCancelLeave,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [expandedRejections, setExpandedRejections] = useState<Record<string, boolean>>({})
  const [actionAlert, setActionAlert] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const toggleRejectionExpand = (id: string) => {
    setExpandedRejections((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleCancel = async (leave: DoctorLeaveItem) => {
    const targetId = leave._id || leave.date
    const displayLabel = leave.startDateTime
      ? new Date(leave.startDateTime).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : leave.date

    if (
      !window.confirm(
        `Are you sure you want to cancel this leave application (${displayLabel})? Associated time slots will be reopened for bookings.`
      )
    ) {
      return
    }

    setCancellingId(targetId)
    setActionAlert(null)
    const success = await onCancelLeave(targetId)
    setCancellingId(null)

    if (success) {
      setActionAlert({
        type: 'success',
        text: `Leave request cancelled successfully. Patient booking slots have been reopened.`,
      })
      setTimeout(() => setActionAlert(null), 4000)
    } else {
      setActionAlert({
        type: 'error',
        text: 'Failed to cancel leave request. Please try again.',
      })
    }
  }

  // Sort leaves: PENDING first, then by date descending
  const sortedLeaves = [...leaves].sort((a, b) => {
    const dateA = a.startDateTime ? new Date(a.startDateTime).getTime() : new Date(a.date).getTime()
    const dateB = b.startDateTime ? new Date(b.startDateTime).getTime() : new Date(b.date).getTime()
    return dateB - dateA
  })

  // Format Date & Duration helper
  const renderLeaveDateAndDuration = (leave: DoctorLeaveItem) => {
    const isMultiDay = leave.leaveType === 'MULTI_DAY'
    const isPartialDay = leave.leaveType === 'PARTIAL_DAY'

    if (isPartialDay && leave.startDateTime && leave.endDateTime) {
      const start = new Date(leave.startDateTime)
      const end = new Date(leave.endDateTime)
      const dateStr = start.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
      const startTimeStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      const endTimeStr = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

      return {
        dateDisplay: `${dateStr} (${startTimeStr} - ${endTimeStr})`,
        durationDisplay: 'Partial Day',
      }
    }

    if (isMultiDay && leave.startDateTime && leave.endDateTime) {
      const start = new Date(leave.startDateTime)
      const end = new Date(leave.endDateTime)
      const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const endStr = end.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
      const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

      return {
        dateDisplay: `${startStr} – ${endStr}`,
        durationDisplay: `${diffDays} days`,
      }
    }

    // Default: FULL_DAY or legacy
    const dateObj = leave.startDateTime ? new Date(leave.startDateTime) : new Date(leave.date)
    const dateStr = !isNaN(dateObj.getTime())
      ? dateObj.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : leave.date

    return {
      dateDisplay: dateStr,
      durationDisplay: 'Full Day',
    }
  }

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
            Manage your scheduled leaves. Requests follow the Hospital Admin review workflow.
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
            appointments for all configured working slots.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-black uppercase tracking-wider text-slate-400">
                <th className="pb-3 px-3">Date / Window</th>
                <th className="pb-3 px-3">Type & Duration</th>
                <th className="pb-3 px-3">Reason</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3">Hospital</th>
                <th className="pb-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {sortedLeaves.map((leave, idx) => {
                const { dateDisplay, durationDisplay } = renderLeaveDateAndDuration(leave)
                const leaveId = leave._id || `${leave.date}-${idx}`
                const isCancelling = cancellingId === leave._id || cancellingId === leave.date

                const status = (leave.status || 'PENDING').toUpperCase()
                const hospitalName =
                  typeof leave.hospitalId === 'object' && leave.hospitalId !== null
                    ? (leave.hospitalId as any).name
                    : null

                const isExpanded = !!expandedRejections[leaveId]

                return (
                  <tr key={leaveId} className="hover:bg-slate-50/60 transition-colors">
                    {/* Date / Window */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="size-3.5 text-slate-400 shrink-0" />
                        <span className="font-bold text-slate-900">{dateDisplay}</span>
                      </div>
                      {leave.affectedAppointmentsCount ? (
                        <span className="mt-1 inline-block text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200/60 px-1.5 py-0.5 rounded-md">
                          {leave.affectedAppointmentsCount} patient(s) shifted
                        </span>
                      ) : null}
                    </td>

                    {/* Type & Duration */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/80">
                        {durationDisplay}
                      </span>
                    </td>

                    {/* Reason */}
                    <td className="py-3.5 px-3 font-semibold text-slate-700 max-w-[200px] truncate">
                      <span>{leave.reason || 'Personal Leave'}</span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {status === 'PENDING' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/70">
                          <Clock className="size-3 text-amber-600 animate-pulse" />
                          <span>Pending Approval</span>
                        </span>
                      )}

                      {(status === 'APPROVED' || status === 'ACCEPTED') && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          <CheckCircle2 className="size-3 text-emerald-600" />
                          <span>Approved</span>
                        </span>
                      )}

                      {status === 'REJECTED' && (
                        <div className="space-y-1">
                          <span
                            onClick={() => toggleRejectionExpand(leaveId)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/60 cursor-pointer hover:bg-rose-100 transition-colors"
                          >
                            <XCircle className="size-3 text-rose-600" />
                            <span>Rejected</span>
                            {leave.rejectionReason && (
                              isExpanded ? (
                                <ChevronUp className="size-3 text-rose-600" />
                              ) : (
                                <ChevronDown className="size-3 text-rose-600" />
                              )
                            )}
                          </span>
                          {isExpanded && leave.rejectionReason && (
                            <div className="p-2 rounded-xl bg-rose-50/80 border border-rose-200 text-[11px] text-rose-900 font-medium">
                              <strong>Reason:</strong> {leave.rejectionReason}
                            </div>
                          )}
                        </div>
                      )}

                      {status === 'CANCELLED' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          <span>Cancelled</span>
                        </span>
                      )}
                    </td>

                    {/* Hospital Name */}
                    <td className="py-3.5 px-3 whitespace-nowrap text-xs text-slate-500">
                      {hospitalName ? (
                        <div className="flex items-center gap-1.5">
                          <Building2 className="size-3 text-slate-400" />
                          <span>{hospitalName}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-3 text-right whitespace-nowrap">
                      {status !== 'CANCELLED' && status !== 'REJECTED' ? (
                        <button
                          type="button"
                          onClick={() => handleCancel(leave)}
                          disabled={isCancelling}
                          className="px-3 py-1 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {isCancelling ? 'Cancelling...' : 'Cancel'}
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">—</span>
                      )}
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
export default DoctorLeavesManager
