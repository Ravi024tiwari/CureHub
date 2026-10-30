import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ChevronLeft,
  Calendar,
  User,
  Phone,
  Mail,
  Building2,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileText,
  Eye,
  Download,
  AlertTriangle,
  History,
  ShieldCheck,
  RefreshCw,
  Copy,
  Check,
  X,
  Printer,
  Layers,
  Heart,
  Activity,
  Baby,
  Brain,
} from 'lucide-react'
import { HospitalAdminLayout } from '@/components/hospital-admin/HospitalAdminLayout'
import { hospitalAdminService } from '@/services/hospitalAdminService'
import { type AdminDoctorLeaveItem, DoctorLeaveStatus } from '@/types/hospitalAdmin'

// Helper for department badge
const getDepartmentBadge = (dept?: string) => {
  const d = dept?.toLowerCase() || ''
  if (d.includes('cardio')) {
    return { icon: Heart, label: dept || 'Cardiology', color: 'text-rose-600 bg-rose-50 border-rose-100' }
  }
  if (d.includes('ortho')) {
    return { icon: Activity, label: dept || 'Orthopedics', color: 'text-blue-600 bg-blue-50 border-blue-100' }
  }
  if (d.includes('pedia')) {
    return { icon: Baby, label: dept || 'Pediatrics', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' }
  }
  if (d.includes('neuro')) {
    return { icon: Brain, label: dept || 'Neurology', color: 'text-purple-600 bg-purple-50 border-purple-100' }
  }
  return { icon: Layers, label: dept || 'General Medicine', color: 'text-slate-600 bg-slate-50 border-slate-200' }
}

// Helper for formatted leave type
const formatLeaveTypeName = (type?: string) => {
  const t = type?.toUpperCase() || ''
  if (t === 'PARTIAL_DAY' || t.includes('PARTIAL')) return { label: 'Partial Day Leave', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' }
  if (t === 'FULL_DAY' || t.includes('CASUAL')) return { label: 'Casual / Full Day', color: 'bg-blue-50 text-blue-700 border-blue-200' }
  if (t === 'MULTI_DAY' || t.includes('EARNED')) return { label: 'Multi-Day Leave', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
  if (t.includes('SICK')) return { label: 'Sick Leave', color: 'bg-rose-50 text-rose-700 border-rose-200' }
  if (t.includes('CONFERENCE') || t.includes('CME')) return { label: 'Conference Leave', color: 'bg-purple-50 text-purple-700 border-purple-200' }
  if (t.includes('MATERNITY')) return { label: 'Maternity Leave', color: 'bg-amber-50 text-amber-700 border-amber-200' }
  return { label: type?.replace('_', ' ') || 'Doctor Leave', color: 'bg-slate-100 text-slate-700 border-slate-200' }
}

export const HospitalAdminDoctorLeaveDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()

  const [leave, setLeave] = useState<AdminDoctorLeaveItem | null>(null)
  const [affectedAppointments, setAffectedAppointments] = useState<any[]>([])
  const [docHistory, setDocHistory] = useState<AdminDoctorLeaveItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Decision & Action State
  const [selectedDecision, setSelectedDecision] = useState<'APPROVED' | 'REJECTED' | null>(null)
  const [remarkText, setRemarkText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null)
  const [actionErrorMsg, setActionErrorMsg] = useState<string | null>(null)

  // Copy phone state & document preview modal
  const [isCopiedPhone, setIsCopiedPhone] = useState(false)
  const [isPreviewDocOpen, setIsPreviewDocOpen] = useState(false)

  const fetchLeaveData = async (leaveId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await hospitalAdminService.getDoctorLeaveById(leaveId)
      const leaveData: AdminDoctorLeaveItem = res?.leave || res?.data?.leave || res
      const affected = res?.affectedAppointments || res?.data?.affectedAppointments || []

      setLeave(leaveData)
      setAffectedAppointments(affected)

      // Fetch prior history of doctor
      const docId =
        typeof leaveData.doctorId === 'object' ? leaveData.doctorId?._id : leaveData.doctorId
      if (docId) {
        try {
          const histRes = await hospitalAdminService.getDoctorLeaves({ doctorId: docId })
          const pastLeaves = (histRes?.leaves || []).filter((l: any) => l._id !== leaveId)
          setDocHistory(pastLeaves)
        } catch {
          // Non-critical, leave history empty
        }
      }
    } catch (err: any) {
      console.error('Error loading doctor leave details:', err)
      setError(
        err?.response?.data?.message || err?.message || 'Failed to load doctor leave application.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchLeaveData(id)
    }
  }, [id])

  // Copy phone helper
  const handleCopyPhone = (phoneNum: string) => {
    if (!phoneNum) return
    navigator.clipboard.writeText(phoneNum)
    setIsCopiedPhone(true)
    setTimeout(() => setIsCopiedPhone(false), 2000)
  }

  // Handle status update submission
  const handleSubmitDecision = async () => {
    setActionErrorMsg(null)
    setActionSuccessMsg(null)

    if (!selectedDecision || !leave) {
      setActionErrorMsg('Please select whether to Approve or Reject this request.')
      return
    }

    if (selectedDecision === DoctorLeaveStatus.REJECTED && !remarkText.trim()) {
      setActionErrorMsg('A clear rejection reason is required before rejecting this leave.')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await hospitalAdminService.updateDoctorLeaveStatus(
        leave._id,
        selectedDecision,
        remarkText.trim() || undefined
      )

      const msg =
        res?.message ||
        (selectedDecision === DoctorLeaveStatus.APPROVED
          ? 'Doctor leave approved successfully. Affected slots confirmed locked.'
          : 'Doctor leave request rejected. Blocked slots have been restored.')

      setActionSuccessMsg(msg)
      setSelectedDecision(null)
      setRemarkText('')

      // Re-fetch updated data
      await fetchLeaveData(leave._id)
    } catch (err: any) {
      console.error('Error updating leave status:', err)
      setActionErrorMsg(
        err?.response?.data?.message || err?.message || 'Failed to update leave request status.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <HospitalAdminLayout>
        <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] space-y-3">
          <div className="size-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-500">
            Loading doctor leave request details...
          </p>
        </div>
      </HospitalAdminLayout>
    )
  }

  if (error || !leave) {
    return (
      <HospitalAdminLayout>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
          <div className="size-16 rounded-3xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto shadow-sm">
            <AlertCircle className="size-8 stroke-[2.2]" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Leave Application Not Found</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            {error || 'The requested doctor leave request does not exist or you do not have permission to view it.'}
          </p>
          <div className="pt-2">
            <Link
              to="/hospital-admin/leaves"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all"
            >
              <ChevronLeft className="size-4" />
              <span>Back to Leave Requests</span>
            </Link>
          </div>
        </div>
      </HospitalAdminLayout>
    )
  }

  const doctorProfile = leave.doctorId as any
  const doctorUser = doctorProfile?.userId as any
  const doctorName = doctorUser?.name || 'Dr. Specialist'
  const doctorEmail = doctorUser?.email || 'doctor@curehealth.org'
  const doctorPhone = doctorUser?.phoneNumber || '+91 98765 43218'
  const avatar = doctorUser?.avatar || null
  const department = doctorProfile?.department || 'General Medicine'
  const expYears = doctorProfile?.experienceYears || 4
  const specialty =
    (Array.isArray(doctorProfile?.specialization)
      ? doctorProfile.specialization.join(', ')
      : doctorProfile?.specialization) || department
  const qualifications = doctorProfile?.qualifications || ['MBBS']
  const fee = doctorProfile?.consultationFee || 500

  const hospitalObj = leave.hospitalId as any
  const hospitalName = hospitalObj?.name || 'CureHealth Medical Facility'
  const hospitalCity = hospitalObj?.address?.city || 'Bilaspur, Chhattisgarh'

  // Format Dates & Times
  const start = new Date(leave.startDateTime)
  const end = new Date(leave.endDateTime)
  const diffMs = Math.max(0, end.getTime() - start.getTime())
  const diffDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))

  const sDateStr = start.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  const eDateStr = end.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  const isSameDay = sDateStr === eDateStr

  const sTime = start.toISOString().substring(11, 16)
  const eTime = end.toISOString().substring(11, 16)

  const timingDisplay =
    isSameDay && (sTime !== '00:00' || eTime !== '23:59')
      ? `${sDateStr} (${sTime} - ${eTime})`
      : isSameDay
      ? `${sDateStr} (Full Day)`
      : `${sDateStr} to ${eDateStr} (${diffDays} days)`

  const appliedOnStr = leave.createdAt
    ? new Date(leave.createdAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Recently'

  const deptBadge = getDepartmentBadge(department)
  const DeptIcon = deptBadge.icon
  const leavePill = formatLeaveTypeName(leave.leaveType)

  return (
    <HospitalAdminLayout>
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-5 sm:py-7 space-y-6 min-h-full pb-24 animate-in fade-in duration-200">
        {/* 1. Breadcrumbs & Top Navigation Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link
              to="/hospital-admin/dashboard"
              className="hover:text-blue-600 transition-colors"
            >
              Dashboard
            </Link>
            <span>/</span>
            <Link
              to="/hospital-admin/leaves"
              className="hover:text-blue-600 transition-colors"
            >
              Doctor Leave Requests
            </Link>
            <span>/</span>
            <span className="font-bold text-slate-800 truncate max-w-xs">
              {doctorName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchLeaveData(leave._id)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
            >
              <RefreshCw className="size-3.5 text-slate-400" />
              <span>Refresh</span>
            </button>

            <Link
              to="/hospital-admin/leaves"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-2xs"
            >
              <ChevronLeft className="size-4" />
              <span>Back to Requests</span>
            </Link>
          </div>
        </div>

        {/* Global Action Alerts */}
        {actionSuccessMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between shadow-xs animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold">
              <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
              <span>{actionSuccessMsg}</span>
            </div>
            <button
              onClick={() => setActionSuccessMsg(null)}
              className="p-1 text-emerald-600 hover:text-emerald-900 rounded-lg cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {actionErrorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center justify-between shadow-xs animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold">
              <AlertCircle className="size-5 text-rose-600 shrink-0" />
              <span>{actionErrorMsg}</span>
            </div>
            <button
              onClick={() => setActionErrorMsg(null)}
              className="p-1 text-rose-600 hover:text-rose-900 rounded-lg cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {/* 2. Hero Doctor Profile & Status Banner Card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 sm:p-7 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Doctor Info */}
            <div className="flex items-start sm:items-center gap-4 sm:gap-5 min-w-0">
              {avatar ? (
                <img
                  src={avatar}
                  alt={doctorName}
                  className="size-16 sm:size-20 rounded-3xl object-cover border-2 border-slate-100 shadow-md shrink-0"
                />
              ) : (
                <div className="size-16 sm:size-20 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                  {doctorName.replace('Dr.', '').trim().charAt(0) || 'D'}
                </div>
              )}

              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                    {doctorName}
                  </h1>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${deptBadge.color}`}
                  >
                    <DeptIcon className="size-3" />
                    <span>{department}</span>
                  </span>
                </div>

                <p className="text-xs sm:text-sm font-semibold text-slate-600">
                  {specialty} • <span className="text-slate-400 font-medium">{expYears} years experience</span>
                  {qualifications?.length > 0 && (
                    <span className="text-slate-500 font-medium"> • {qualifications.join(', ')}</span>
                  )}
                  {fee > 0 && (
                    <span className="text-slate-500 font-medium"> • ₹{fee} OPD Fee</span>
                  )}
                </p>

                {/* Badges / Contacts */}
                <div className="flex items-center gap-3 pt-1 flex-wrap text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Building2 className="size-3.5 text-slate-400" />
                    <strong>{hospitalName}</strong>
                  </span>
                  <span>•</span>
                  <a
                    href={`tel:${doctorPhone}`}
                    className="flex items-center gap-1 text-blue-600 hover:underline font-bold"
                  >
                    <Phone className="size-3.5" />
                    <span>{doctorPhone}</span>
                  </a>
                  <span>•</span>
                  <a
                    href={`mailto:${doctorEmail}`}
                    className="flex items-center gap-1 text-slate-600 hover:text-blue-600"
                  >
                    <Mail className="size-3.5 text-slate-400" />
                    <span>{doctorEmail}</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Status Pill & ID */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
              <div>
                {leave.status === DoctorLeaveStatus.PENDING && (
                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-extrabold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
                    <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
                    <span>Pending Admin Review</span>
                  </span>
                )}
                {leave.status === DoctorLeaveStatus.APPROVED && (
                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                    <CheckCircle2 className="size-4 text-emerald-600" />
                    <span>Approved & Locked</span>
                  </span>
                )}
                {leave.status === DoctorLeaveStatus.REJECTED && (
                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-extrabold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
                    <XCircle className="size-4 text-rose-600" />
                    <span>Rejected (Slots Restored)</span>
                  </span>
                )}
              </div>

              <div className="text-[11px] text-slate-400 font-medium">
                Ref ID: <span className="font-mono text-slate-600 font-bold">{leave._id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Main 2-Column Responsive Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ================= LEFT COLUMN: SPECIFICATIONS & HISTORY (8 COLS) ================= */}
          <div className="lg:col-span-8 space-y-6">
            {/* Card 1: Leave Timing & Specifications */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="size-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Calendar className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Leave Information</h3>
                    <p className="text-xs text-slate-500 font-medium">Applied schedule duration and category</p>
                  </div>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${leavePill.color}`}>
                  {leavePill.label}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Duration & Timing
                  </span>
                  <p className="text-sm font-black text-slate-900">{timingDisplay}</p>
                  <p className="text-xs text-slate-500 font-semibold">{diffDays} {diffDays === 1 ? 'day window' : 'days window'}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Applied On
                  </span>
                  <p className="text-sm font-black text-slate-900">{appliedOnStr}</p>
                  <p className="text-xs text-slate-500 font-semibold">Doctor Portal</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Slot Status
                  </span>
                  <p className="text-sm font-black text-slate-900">
                    {leave.status === 'REJECTED' ? 'AVAILABLE' : 'BLOCKED'}
                  </p>
                  <p className="text-xs text-slate-500 font-semibold">
                    {leave.status === 'REJECTED' ? 'Open for bookings' : 'Protected from new bookings'}
                  </p>
                </div>
              </div>

              {/* Stated Reason */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Doctor&apos;s Stated Reason
                </label>
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/50 via-slate-50/80 to-indigo-50/30 border border-blue-100/60 text-slate-800 text-xs sm:text-sm font-medium leading-relaxed italic">
                  &ldquo;{leave.reason || 'Personal leave - no custom remark submitted.'}&rdquo;
                </div>
              </div>
            </div>

            {/* Card 2: Overlapping Bookings & Patient Safeguard */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="size-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <ShieldCheck className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Patient Continuity & Affected Bookings
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Zero refund deduction safeguard via doctor-led rescheduling
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-slate-100 text-slate-700">
                  {affectedAppointments.length} Active Booking(s)
                </span>
              </div>

              {affectedAppointments.length > 0 ? (
                <div className="space-y-4">
                  {/* Continuity Notice */}
                  <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 space-y-1 text-xs">
                    <div className="flex items-center gap-2 font-bold text-amber-900 text-xs">
                      <AlertTriangle className="size-4 text-amber-600 shrink-0" />
                      <span>7-Day Priority Window Active</span>
                    </div>
                    <p className="text-amber-900/90 leading-relaxed text-[11px] sm:text-xs">
                      These patients have already been placed into the priority rescheduling window.
                      The doctor reassigns alternate dates directly without deducting refund fees. If
                      unrescheduled after 7 days, 100% automated refund is issued.
                    </p>
                  </div>

                  {/* Appointments Table */}
                  <div className="overflow-x-auto rounded-2xl border border-slate-100">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50/80 text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-100">
                        <tr>
                          <th className="py-2.5 px-3">Patient</th>
                          <th className="py-2.5 px-3">Slot Time</th>
                          <th className="py-2.5 px-3">Appt #</th>
                          <th className="py-2.5 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {affectedAppointments.map((appt: any) => {
                          const pName = appt.patientId?.name || 'Patient'
                          const pPhone = appt.patientId?.phoneNumber || '—'
                          return (
                            <tr key={appt._id} className="hover:bg-slate-50/50">
                              <td className="py-2.5 px-3 font-bold text-slate-800">
                                {pName}
                                <span className="block text-[10px] font-normal text-slate-400">
                                  {pPhone}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-slate-600 font-medium">
                                {appt.date} • {appt.startTime}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-slate-500">
                                {appt.appointmentNumber || appt._id.substring(0, 8)}
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                  Reschedule Required
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 flex items-center gap-3">
                  <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold text-emerald-900">Zero Patient Conflicts</p>
                    <p className="text-emerald-800/90 text-[11px] mt-0.5">
                      No active patient appointments are booked during this requested leave duration. Safe for administrative approval without any booking displacement.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Card 3: Additional Clinical Information & Supporting Documents */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 sm:p-6 space-y-4">
              <h3 className="text-base font-black text-slate-900 pb-3 border-b border-slate-100">
                Additional Clinical Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Emergency Contact */}
                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <Phone className="size-4" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Contact During Leave
                      </span>
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">{doctorPhone}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyPhone(doctorPhone)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                    title="Copy Phone Number"
                  >
                    {isCopiedPhone ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
                  </button>
                </div>

                {/* Covering Doctor */}
                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <User className="size-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Covering Doctor / Dept
                    </span>
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">{department} Duty Roster</span>
                  </div>
                </div>
              </div>

              {/* Supporting Document Card */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center justify-between gap-4 shadow-2xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-11 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0 shadow-2xs">
                    <FileText className="size-5.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                      leave_application_{leave._id.substring(0, 8)}.pdf
                    </p>
                    <p className="text-[11px] text-slate-400 font-semibold">
                      Digital Verified Application Form • 245 KB
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsPreviewDocOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer shadow-2xs transition-colors"
                  >
                    <Eye className="size-3.5 text-slate-500" />
                    <span>View</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => alert(`Downloading signed PDF application archive for ${doctorName}`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer shadow-2xs transition-colors"
                  >
                    <Download className="size-3.5 text-slate-500" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Card 4: Doctor's Prior Leave History */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="size-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <History className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Prior Leaves Record</h3>
                    <p className="text-xs text-slate-500 font-medium">Historical leave audit trail for this doctor</p>
                  </div>
                </div>

                <span className="text-xs font-bold text-slate-500">
                  {docHistory.length} previous record(s)
                </span>
              </div>

              {docHistory.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <History className="size-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-600">No Previous Leave Records</p>
                  <p className="text-[11px] text-slate-400">
                    This doctor has no other recorded leaves in the hospital registry.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {docHistory.map((h) => {
                    const hStart = new Date(h.startDateTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
                    const hEnd = new Date(h.endDateTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                    return (
                      <div
                        key={h._id}
                        className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-900">{hStart} - {hEnd}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{h.reason || h.leaveType}</p>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            h.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : h.status === 'REJECTED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {h.status}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ================= RIGHT COLUMN: ADMINISTRATIVE DECISION (4 COLS) ================= */}
          <div className="lg:col-span-4 space-y-6">
            {/* Sticky Action Card */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-5 sm:p-6 space-y-4 sticky top-6">
              <h3 className="text-base font-black text-slate-900 pb-3 border-b border-slate-100">
                Administrative Decision
              </h3>

              {leave.status === DoctorLeaveStatus.PENDING ? (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500 font-medium">
                    Review doctor request specifications and update hospital status:
                  </p>

                  {/* Choice Buttons */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSelectedDecision(DoctorLeaveStatus.REJECTED)}
                      className={`inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl text-xs font-black border transition-all cursor-pointer ${
                        selectedDecision === DoctorLeaveStatus.REJECTED
                          ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-500/20'
                          : 'bg-white border-rose-200 text-rose-700 hover:bg-rose-50'
                      }`}
                    >
                      <XCircle className="size-4" />
                      <span>Reject</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedDecision(DoctorLeaveStatus.APPROVED)}
                      className={`inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl text-xs font-black border transition-all cursor-pointer ${
                        selectedDecision === DoctorLeaveStatus.APPROVED
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700 border-transparent shadow-xs'
                      }`}
                    >
                      <CheckCircle2 className="size-4" />
                      <span>Approve</span>
                    </button>
                  </div>

                  {/* Remark Input */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Add Remark {selectedDecision === DoctorLeaveStatus.REJECTED ? '(Required)' : '(Optional)'}
                    </label>
                    <textarea
                      rows={3}
                      value={remarkText}
                      onChange={(e) => setRemarkText(e.target.value)}
                      placeholder={
                        selectedDecision === DoctorLeaveStatus.REJECTED
                          ? 'Explain why this leave application is rejected (e.g. high patient OPD volume scheduled)...'
                          : 'Add optional internal remarks or instructions...'
                      }
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                    />
                  </div>

                  {/* Production Safeguard Notice */}
                  {selectedDecision === DoctorLeaveStatus.REJECTED && (
                    <div className="p-3 rounded-xl bg-rose-50/80 border border-rose-200 text-[11px] text-rose-900 space-y-0.5">
                      <p className="font-bold">Slot Restoration:</p>
                      <p>Rejecting will immediately reopen any blocked time slots back to AVAILABLE.</p>
                    </div>
                  )}

                  {selectedDecision === DoctorLeaveStatus.APPROVED && (
                    <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-[11px] text-emerald-900 space-y-0.5">
                      <p className="font-bold">Continuity Guarantee:</p>
                      <p>Time slots remain locked for patients while doctor continuity is preserved.</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="button"
                    disabled={
                      isSubmitting ||
                      !selectedDecision ||
                      (selectedDecision === DoctorLeaveStatus.REJECTED && !remarkText.trim())
                    }
                    onClick={handleSubmitDecision}
                    className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-xs sm:text-sm shadow-md shadow-blue-500/25 cursor-pointer disabled:cursor-not-allowed transition-all"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Updating Status...</span>
                      </div>
                    ) : selectedDecision === DoctorLeaveStatus.REJECTED ? (
                      'Confirm Leave Rejection'
                    ) : selectedDecision === DoctorLeaveStatus.APPROVED ? (
                      'Confirm Leave Approval'
                    ) : (
                      'Select Decision Above'
                    )}
                  </button>
                </div>
              ) : leave.status === DoctorLeaveStatus.APPROVED ? (
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-emerald-900">
                    <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
                    <span>Leave Request Approved</span>
                  </div>
                  <p className="text-xs text-emerald-900/90 leading-relaxed">
                    This doctor leave application has been approved. Unbooked time slots are locked and patient appointments are protected.
                  </p>
                  {leave.approvedBy && (
                    <p className="text-[11px] text-emerald-800 font-semibold pt-1 border-t border-emerald-200/60">
                      Reviewed by: {(leave.approvedBy as any)?.name || 'Hospital Admin'}
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200 text-rose-950 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-rose-900">
                    <XCircle className="size-5 text-rose-600 shrink-0" />
                    <span>Leave Request Rejected</span>
                  </div>
                  {leave.rejectionReason && (
                    <p className="text-xs text-rose-900/90 italic">
                      &ldquo;{leave.rejectionReason}&rdquo;
                    </p>
                  )}
                  <p className="text-[11px] text-rose-800 font-semibold pt-1 border-t border-rose-200/60">
                    Blocked slots have been restored to AVAILABLE.
                  </p>
                </div>
              )}

              {/* Facility Details */}
              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                <span className="font-black text-slate-800 uppercase tracking-wider text-[11px] block">
                  Hospital Facility
                </span>
                <p className="font-bold text-slate-900">{hospitalName}</p>
                <p className="text-slate-500 text-[11px]">{hospitalCity}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 4. In-App Document Preview Modal */}
        {isPreviewDocOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
              onClick={() => setIsPreviewDocOpen(false)}
            />
            <div className="relative z-10 w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-2.5">
                  <FileText className="size-5 text-rose-600" />
                  <h4 className="text-sm font-black text-slate-900">
                    Leave Application Document Preview
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

              {/* Simulated PDF Canvas */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-6 bg-slate-50/50 flex-1 font-serif text-slate-900">
                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                  {/* Letterhead */}
                  <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold tracking-tight text-slate-900">
                        {hospitalName.toUpperCase()}
                      </h2>
                      <p className="text-xs text-slate-500 font-sans mt-0.5">
                        Clinical Operations & Medical Staff Management
                      </p>
                    </div>
                    <span className="text-xs font-mono text-slate-400 font-sans">
                      Form Ref: DL-{leave._id.substring(0, 8).toUpperCase()}
                    </span>
                  </div>

                  {/* Title */}
                  <div className="text-center py-2">
                    <h3 className="text-base font-bold underline uppercase tracking-wider">
                      Medical Staff Leave Application
                    </h3>
                  </div>

                  {/* Body Text */}
                  <div className="space-y-3 text-xs sm:text-sm font-sans leading-relaxed text-slate-800">
                    <p>
                      <strong>Doctor Name:</strong> {doctorName}
                    </p>
                    <p>
                      <strong>Department:</strong> {department} | <strong>Experience:</strong> {expYears} Years
                    </p>
                    <p>
                      <strong>Leave Category:</strong> {leavePill.label}
                    </p>
                    <p>
                      <strong>Requested Window:</strong> {timingDisplay}
                    </p>
                    <p>
                      <strong>Reason for Absence:</strong> {leave.reason || 'Personal / Academic leave'}
                    </p>
                    <p>
                      <strong>Emergency Contact:</strong> {doctorPhone}
                    </p>
                  </div>

                  {/* Footer Seal & Sign */}
                  <div className="pt-8 border-t border-slate-200 flex items-end justify-between font-sans">
                    <div className="text-center text-[10px] text-slate-400">
                      <div className="size-16 rounded-full border border-dashed border-slate-300 mx-auto mb-1 flex items-center justify-center text-[9px] uppercase font-bold text-slate-400">
                        Hospital Seal
                      </div>
                      Electronic Verification
                    </div>
                    <div className="text-right text-xs">
                      <p className="font-bold text-slate-900 italic font-serif text-sm">
                        {doctorName}
                      </p>
                      <p className="text-[11px] text-slate-500">Applicant Doctor Signature</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-white shrink-0">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  <Printer className="size-4" />
                  <span>Print Document</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPreviewDocOpen(false)}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 cursor-pointer shadow-xs"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </HospitalAdminLayout>
  )
}

export default HospitalAdminDoctorLeaveDetailPage

