import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  X,
  Calendar,
  Phone,
  UserCheck,
  FileText,
  Eye,
  Download,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  History,
  Info,
  ExternalLink,
  Printer,
} from 'lucide-react'
import { useHospitalAdminLeavesStore } from '@/store/hospitalAdminLeavesStore'
import { DoctorLeaveStatus } from '@/types/hospitalAdmin'

interface DoctorLeavesDetailDrawerProps {
  onClose?: () => void
}

const formatLeaveTypeName = (type?: string) => {
  const t = type?.toUpperCase() || ''
  if (t === 'PARTIAL_DAY' || t.includes('PARTIAL')) return 'Partial Day'
  if (t === 'FULL_DAY' || t.includes('CASUAL')) return 'Casual / Full Day'
  if (t === 'MULTI_DAY' || t.includes('EARNED')) return 'Multi-Day Leave'
  if (t.includes('SICK')) return 'Sick Leave'
  if (t.includes('CONFERENCE') || t.includes('CME')) return 'Conference Leave'
  if (t.includes('MATERNITY')) return 'Maternity Leave'
  return type?.replace('_', ' ') || 'Standard Leave'
}

export const DoctorLeavesDetailDrawer: React.FC<DoctorLeavesDetailDrawerProps> = ({ onClose }) => {
  const navigate = useNavigate()
  const {
    selectedLeave,
    selectedLeaveAffectedAppointments,
    doctorLeaveHistory,
    isLoadingLeaveDetails,
    activeDetailTab,
    isUpdatingStatus,
    selectLeave,
    setActiveDetailTab,
    submitStatusUpdate,
  } = useHospitalAdminLeavesStore()

  // Local state for inline decision in the detail panel
  const [selectedDecision, setSelectedDecision] = useState<'APPROVE' | 'REJECT' | null>(null)
  const [remarkText, setRemarkText] = useState('')
  const [panelError, setPanelError] = useState<string | null>(null)
  const [isPreviewDocOpen, setIsPreviewDocOpen] = useState(false)

  if (!selectedLeave) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 p-8 text-center text-slate-400 shadow-xs flex flex-col items-center justify-center min-h-[400px]">
        <Calendar className="size-12 text-slate-300 mb-3" />
        <h4 className="text-sm font-black text-slate-700">No Leave Selected</h4>
        <p className="text-xs text-slate-400 max-w-xs mt-1">
          Click &ldquo;View&rdquo; or any doctor leave row from the table to inspect details and take action.
        </p>
      </div>
    )
  }

  const doctorProfile = selectedLeave.doctorId as any
  const doctorUser = doctorProfile?.userId as any
  const doctorName = doctorUser?.name || 'Dr. Specialist'
  const exp = doctorProfile?.experienceYears || 5
  const specialty =
    (Array.isArray(doctorProfile?.specialization)
      ? doctorProfile.specialization[0]
      : doctorProfile?.specialization) ||
    doctorProfile?.department ||
    'Medical Specialist'
  const avatar = doctorUser?.avatar || null
  const phone = doctorUser?.phoneNumber || '+91 98765 43210'

  // Format dates
  const start = new Date(selectedLeave.startDateTime)
  const end = new Date(selectedLeave.endDateTime)
  const diffMs = Math.max(0, end.getTime() - start.getTime())
  const diffDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
  const sLabel = start.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  const eLabel = end.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  const isSameDay = sLabel === eLabel
  const durationText = isSameDay ? `${sLabel} (1 day)` : `${sLabel} - ${eLabel} (${diffDays} days)`

  const appliedDate = selectedLeave.createdAt
    ? new Date(selectedLeave.createdAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Recently'

  // Handle Update Status button click from panel
  const handleUpdateStatus = async () => {
    setPanelError(null)

    if (!selectedDecision) {
      setPanelError('Please choose whether to Approve or Reject this leave request.')
      return
    }

    if (selectedDecision === 'REJECT' && !remarkText.trim()) {
      setPanelError('Please enter a remark or reason before rejecting.')
      return
    }

    const success = await submitStatusUpdate(selectedDecision, remarkText)
    if (success) {
      setSelectedDecision(null)
      setRemarkText('')
    }
  }

  return (
    <div className="bg-white flex flex-col h-full overflow-hidden">
      {/* 1. Header with Close & Full Page Buttons */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
        <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
          Leave Request Details
        </h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (onClose) onClose()
              navigate(`/hospital-admin/leaves/${selectedLeave._id}`)
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
            title="Open Dedicated Full Page"
          >
            <span>Full Details</span>
            <ExternalLink className="size-3.5" />
          </button>

          <button
            type="button"
            onClick={() => {
              if (onClose) onClose()
              selectLeave(null)
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {/* 2. Scrollable Body Content */}
      <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1 scrollbar-thin scrollbar-thumb-slate-200">
        {/* Doctor Profile Banner */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {avatar ? (
              <img
                src={avatar}
                alt={doctorName}
                className="size-12 rounded-2xl object-cover border border-slate-200 shadow-2xs shrink-0"
              />
            ) : (
              <div className="size-12 rounded-2xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-2xs shrink-0">
                {doctorName.replace('Dr.', '').trim().charAt(0) || 'D'}
              </div>
            )}
            <div className="min-w-0">
              <h4 className="text-sm font-black text-slate-900 truncate">{doctorName}</h4>
              <p className="text-xs text-slate-500 font-semibold truncate">{specialty}</p>
              <p className="text-[11px] text-slate-400 font-medium">{exp} years experience</p>
            </div>
          </div>

          <div className="shrink-0">
            {selectedLeave.status === DoctorLeaveStatus.PENDING && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                Pending
              </span>
            )}
            {selectedLeave.status === DoctorLeaveStatus.APPROVED && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Approved
              </span>
            )}
            {selectedLeave.status === DoctorLeaveStatus.REJECTED && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                Rejected
              </span>
            )}
          </div>
        </div>

        {/* Segmented Navigation Tabs: Overview vs Leave History */}
        <div className="flex items-center border-b border-slate-200 text-xs font-bold gap-6">
          <button
            type="button"
            onClick={() => setActiveDetailTab('overview')}
            className={`pb-2.5 transition-colors relative cursor-pointer ${
              activeDetailTab === 'overview'
                ? 'text-blue-600 font-black'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Overview
            {activeDetailTab === 'overview' && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveDetailTab('history')}
            className={`pb-2.5 transition-colors relative cursor-pointer ${
              activeDetailTab === 'history'
                ? 'text-blue-600 font-black'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Leave History
            {activeDetailTab === 'history' && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>
        </div>

        {/* Tab 1: OVERVIEW */}
        {activeDetailTab === 'overview' && (
          <div className="space-y-5">
            {/* 1. Leave Information */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-800">
                <Calendar className="size-4 text-blue-600" />
                <span>Leave Information</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-400 font-semibold">Leave Type</span>
                  <span className="font-bold text-slate-800">{formatLeaveTypeName(selectedLeave.leaveType)}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-400 font-semibold">Duration</span>
                  <span className="font-bold text-slate-800">{durationText}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-400 font-semibold">Applied On</span>
                  <span className="font-bold text-slate-800">{appliedDate}</span>
                </div>
                <div className="pt-1.5 space-y-1">
                  <span className="text-slate-400 font-semibold block">Reason</span>
                  <p className="p-2.5 rounded-xl bg-slate-50 text-slate-700 font-medium leading-relaxed border border-slate-100 text-xs">
                    {selectedLeave.reason || 'No detailed reason provided by doctor.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Overlapping Patients Note */}
            {selectedLeaveAffectedAppointments.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 space-y-1 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-800">
                  <AlertTriangle className="size-4 text-amber-600 shrink-0" />
                  <span>{selectedLeaveAffectedAppointments.length} Active Booking(s) Overlap</span>
                </div>
                <p className="text-[11px] leading-snug text-amber-800/90">
                  Doctor has shifted these bookings or entered priority 7-day reschedule window upon approval.
                </p>
              </div>
            )}

            {/* 2. Additional Information */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-800">
                <Info className="size-4 text-blue-600" />
                <span>Additional Information</span>
              </div>

              <div className="space-y-2.5 text-xs">
                {/* Contact Phone */}
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
                  <div className="size-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <Phone className="size-3.5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Contact During Leave
                    </span>
                    <span className="font-bold text-slate-800">{phone}</span>
                  </div>
                </div>

                {/* Covering Doctor */}
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
                  <div className="size-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <UserCheck className="size-3.5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Covering Doctor / Dept
                    </span>
                    <span className="font-bold text-slate-800">
                      {doctorProfile?.department || 'Department On-Duty Team'}
                    </span>
                  </div>
                </div>

                {/* Attached Document Preview */}
                <div className="p-3 rounded-2xl border border-slate-200 bg-white flex items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="size-9 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
                      <FileText className="size-4.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 text-xs truncate">
                        leave_application.pdf
                      </p>
                      <p className="text-[10px] text-slate-400 font-semibold">245 KB</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      title="View Document"
                      onClick={() => setIsPreviewDocOpen(true)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                      <Eye className="size-4" />
                    </button>
                    <button
                      type="button"
                      title="Download Document"
                      onClick={() =>
                        alert(`Downloading signed leave request PDF archive for ${doctorName}`)
                      }
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 cursor-pointer transition-colors"
                    >
                      <Download className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Action Section matching mockup */}
            {selectedLeave.status === DoctorLeaveStatus.PENDING ? (
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800 block">
                  Action
                </span>

                {panelError && (
                  <p className="text-xs font-bold text-rose-600 bg-rose-50 p-2 rounded-xl border border-rose-200">
                    {panelError}
                  </p>
                )}

                {/* Reject & Approve Buttons */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedDecision('REJECT')}
                    className={`inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl text-xs font-black border transition-all cursor-pointer ${
                      selectedDecision === 'REJECT'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-500/20'
                        : 'bg-white border-rose-200 text-rose-700 hover:bg-rose-50'
                    }`}
                  >
                    <XCircle className="size-4" />
                    <span>Reject</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedDecision('APPROVE')}
                    className={`inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl text-xs font-black border transition-all cursor-pointer ${
                      selectedDecision === 'APPROVE'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700 border-transparent shadow-xs'
                    }`}
                  >
                    <CheckCircle2 className="size-4" />
                    <span>Approve</span>
                  </button>
                </div>

                {/* Add Remark Textarea */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">
                    Add Remark {selectedDecision === 'REJECT' ? '(Required)' : '(Optional)'}
                  </label>
                  <textarea
                    rows={2}
                    value={remarkText}
                    onChange={(e) => setRemarkText(e.target.value)}
                    placeholder="Add your comments here..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  />
                </div>

                {/* Update Status Primary Button */}
                <button
                  type="button"
                  disabled={isUpdatingStatus || !selectedDecision}
                  onClick={handleUpdateStatus}
                  className="w-full py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-blue-500/25 cursor-pointer disabled:cursor-not-allowed transition-all"
                >
                  {isUpdatingStatus ? 'Updating Status...' : 'Update Status'}
                </button>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-1">
                <span className="text-xs font-bold text-slate-700 block">
                  Decision Recorded: {selectedLeave.status}
                </span>
                {selectedLeave.rejectionReason && (
                  <p className="text-xs text-rose-600 font-medium italic">
                    &ldquo;{selectedLeave.rejectionReason}&rdquo;
                  </p>
                )}
                {selectedLeave.approvedBy && (
                  <p className="text-[11px] text-slate-400">
                    Reviewed by admin: {(selectedLeave.approvedBy as any)?.name || 'Hospital Admin'}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: LEAVE HISTORY */}
        {activeDetailTab === 'history' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-800">
              <History className="size-4 text-blue-600" />
              <span>Prior Leaves Recorded</span>
            </div>

            {doctorLeaveHistory.length === 0 ? (
              <div className="p-6 text-center text-slate-400">
                <History className="size-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600">No Prior Leave Records</p>
                <p className="text-[11px] text-slate-400">
                  This doctor has no other recorded leave requests in the system.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {doctorLeaveHistory.map((hist) => {
                  const hStart = new Date(hist.startDateTime).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                  })
                  const hEnd = new Date(hist.endDateTime).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })

                  return (
                    <div
                      key={hist._id}
                      className="p-3 rounded-2xl border border-slate-100 bg-slate-50/60 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">
                          {hStart} - {hEnd}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            hist.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : hist.status === 'REJECTED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {hist.status}
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px] truncate">
                        {hist.reason || hist.leaveType}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* In-App Document Preview Modal */}
      {isPreviewDocOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setIsPreviewDocOpen(false)}
          />
          <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="size-4.5 text-rose-600" />
                <h4 className="text-xs sm:text-sm font-black text-slate-900">
                  Application Document Preview
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewDocOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Document Content */}
            <div className="p-5 overflow-y-auto space-y-4 bg-slate-50/50 flex-1 text-xs text-slate-800">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="border-b border-slate-900 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                      CureHealth Hospital Portal
                    </h2>
                    <p className="text-[10px] text-slate-400 font-semibold">Doctor Leave Filing Ref: DL-{selectedLeave._id.substring(0, 8).toUpperCase()}</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <p><strong>Doctor:</strong> {doctorName} ({specialty})</p>
                  <p><strong>Experience:</strong> {exp} Years</p>
                  <p><strong>Category:</strong> {formatLeaveTypeName(selectedLeave.leaveType)}</p>
                  <p><strong>Duration:</strong> {durationText}</p>
                  <p><strong>Stated Reason:</strong> {selectedLeave.reason || 'Personal Leave'}</p>
                  <p><strong>Emergency Contact:</strong> {phone}</p>
                </div>

                <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[11px]">
                  <span className="text-[10px] text-emerald-600 font-bold">✓ Digital Verification Passed</span>
                  <span className="font-bold text-slate-900 italic font-serif">{doctorName}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-slate-100 flex items-center justify-between bg-white shrink-0">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <Printer className="size-3.5" />
                <span>Print</span>
              </button>
              <button
                type="button"
                onClick={() => setIsPreviewDocOpen(false)}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

