import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle2,
  XCircle,
  Heart,
  Baby,
  Activity,
  Sparkles,
  Brain,
  Layers,
  FileText,
} from 'lucide-react'
import { useHospitalAdminLeavesStore } from '@/store/hospitalAdminLeavesStore'
import { type AdminDoctorLeaveItem, DoctorLeaveStatus } from '@/types/hospitalAdmin'

// Helper for department icon
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
  if (d.includes('derma')) {
    return { icon: Sparkles, label: dept || 'Dermatology', color: 'text-pink-600 bg-pink-50 border-pink-100' }
  }
  return { icon: Layers, label: dept || 'General OPD', color: 'text-slate-600 bg-slate-50 border-slate-200' }
}

// Helper for leave type pill
const getLeaveTypePill = (type?: string) => {
  const t = type?.toUpperCase() || ''
  if (t === 'PARTIAL_DAY' || t.includes('PARTIAL') || t.includes('HALF')) {
    return { label: 'Partial Day', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' }
  }
  if (t === 'FULL_DAY' || t.includes('CASUAL')) {
    return { label: 'Casual / Full Day', color: 'bg-blue-50 text-blue-700 border-blue-200' }
  }
  if (t === 'MULTI_DAY' || t.includes('EARNED')) {
    return { label: 'Multi-Day Leave', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
  }
  if (t.includes('SICK') || t.includes('EMERGENCY')) {
    return { label: 'Sick Leave', color: 'bg-rose-50 text-rose-700 border-rose-200' }
  }
  if (t.includes('CONFERENCE') || t.includes('CME')) {
    return { label: 'Conference Leave', color: 'bg-purple-50 text-purple-700 border-purple-200' }
  }
  if (t.includes('MATERNITY')) {
    return { label: 'Maternity Leave', color: 'bg-amber-50 text-amber-700 border-amber-200' }
  }
  return { label: type?.replace('_', ' ') || 'Standard Leave', color: 'bg-slate-100 text-slate-700 border-slate-200' }
}

// Format duration
const formatDuration = (startStr: string, endStr: string) => {
  const start = new Date(startStr)
  const end = new Date(endStr)

  const diffMs = Math.max(0, end.getTime() - start.getTime())
  const diffDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))

  const sLabel = start.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  const eLabel = end.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

  const isSameDay = sLabel === eLabel
  const sTime = start.toISOString().substring(11, 16)
  const eTime = end.toISOString().substring(11, 16)

  if (isSameDay && (sTime !== '00:00' || eTime !== '23:59')) {
    return {
      range: sLabel,
      days: `${sTime} - ${eTime} (Slot)`,
    }
  }

  return {
    range: isSameDay ? sLabel : `${sLabel} - ${eLabel}`,
    days: `(${diffDays} ${diffDays === 1 ? 'day' : 'days'})`,
  }
}

export const DoctorLeavesTable: React.FC = () => {
  const navigate = useNavigate()
  const {
    leaves,
    isLoading,
    totalDocs,
    currentPage,
    totalPages,
    limit,
    selectedLeave,
    selectLeave,
    setCurrentPage,
    openActionModal,
  } = useHospitalAdminLeavesStore()

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)

  const handleViewLeave = (leave: AdminDoctorLeaveItem) => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      navigate(`/hospital-admin/leaves/${leave._id}`)
    } else {
      selectLeave(leave)
    }
  }

  const startIdx = totalDocs === 0 ? 0 : (currentPage - 1) * limit + 1
  const endIdx = Math.min(currentPage * limit, totalDocs)

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-xs overflow-hidden flex flex-col">
      {/* Table Container */}
      <div className="overflow-x-auto min-h-[350px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-black uppercase tracking-wider text-slate-500 select-none">
              <th className="py-3.5 pl-5 pr-3 w-12">#</th>
              <th className="py-3.5 px-3">Doctor</th>
              <th className="py-3.5 px-3">Department</th>
              <th className="py-3.5 px-3">Leave Type</th>
              <th className="py-3.5 px-3">Duration</th>
              <th className="py-3.5 px-3">Reason</th>
              <th className="py-3.5 px-3">Status</th>
              <th className="py-3.5 pl-3 pr-5 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
            {isLoading && leaves.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center text-slate-400">
                  <div className="size-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs font-semibold">Loading leave applications...</p>
                </td>
              </tr>
            ) : leaves.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center text-slate-400">
                  <FileText className="size-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">No Doctor Leave Requests Found</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    There are no leave applications matching your current filter criteria.
                  </p>
                </td>
              </tr>
            ) : (
              leaves.map((leave, idx) => {
                const isSelected = selectedLeave?._id === leave._id
                const doctorProfile = leave.doctorId as any
                const doctorUser = doctorProfile?.userId as any
                const doctorName = doctorUser?.name || 'Dr. Specialist'
                const exp = doctorProfile?.experienceYears || 5
                const avatar = doctorUser?.avatar || null
                const deptBadge = getDepartmentBadge(doctorProfile?.department)
                const leavePill = getLeaveTypePill(leave.leaveType)
                const duration = formatDuration(leave.startDateTime, leave.endDateTime)
                const DeptIcon = deptBadge.icon

                return (
                  <tr
                    key={leave._id}
                    onClick={() => handleViewLeave(leave)}
                    className={`hover:bg-slate-50/80 transition-colors cursor-pointer group ${
                      isSelected ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    {/* Index */}
                    <td className="py-3.5 pl-5 pr-3 text-xs font-semibold text-slate-400">
                      {(currentPage - 1) * limit + idx + 1}
                    </td>

                    {/* Doctor Info */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        {avatar ? (
                          <img
                            src={avatar}
                            alt={doctorName}
                            className="size-9 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="size-9 rounded-full bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center shrink-0">
                            {doctorName.replace('Dr.', '').trim().charAt(0) || 'D'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                            {doctorName}
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium truncate">
                            {exp} years exp
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border ${deptBadge.color}`}
                      >
                        <DeptIcon className="size-3.5 shrink-0" />
                        <span>{deptBadge.label}</span>
                      </span>
                    </td>

                    {/* Leave Type */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${leavePill.color}`}
                      >
                        {leavePill.label}
                      </span>
                    </td>

                    {/* Duration */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <p className="font-semibold text-slate-800 text-xs">
                        {duration.range}
                      </p>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {duration.days}
                      </p>
                    </td>

                    {/* Reason */}
                    <td className="py-3.5 px-3 max-w-[180px]">
                      <p className="text-xs text-slate-600 truncate" title={leave.reason || 'Personal work'}>
                        {leave.reason || 'Personal work'}
                      </p>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {leave.status === DoctorLeaveStatus.PENDING && (
                        <span className="px-2.5 py-1 rounded-xl text-xs font-extrabold bg-amber-50 text-amber-700 border border-amber-200 inline-block">
                          Pending
                        </span>
                      )}
                      {leave.status === DoctorLeaveStatus.APPROVED && (
                        <span className="px-2.5 py-1 rounded-xl text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-block">
                          Approved
                        </span>
                      )}
                      {leave.status === DoctorLeaveStatus.REJECTED && (
                        <span className="px-2.5 py-1 rounded-xl text-xs font-extrabold bg-rose-50 text-rose-700 border border-rose-200 inline-block">
                          Rejected
                        </span>
                      )}
                      {leave.status === DoctorLeaveStatus.CANCELLED && (
                        <span className="px-2.5 py-1 rounded-xl text-xs font-extrabold bg-slate-100 text-slate-600 border border-slate-200 inline-block">
                          Cancelled
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 pl-3 pr-5 text-right whitespace-nowrap relative">
                      <div
                        className="inline-flex items-center gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => handleViewLeave(leave)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors cursor-pointer shadow-2xs"
                        >
                          View
                        </button>

                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenDropdownId(openDropdownId === leave._id ? null : leave._id)
                            }
                            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                          >
                            <MoreVertical className="size-4" />
                          </button>

                          {/* 3-dots Dropdown Menu */}
                          {openDropdownId === leave._id && (
                            <div className="absolute right-0 top-full mt-1 z-30 w-44 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 text-xs text-left animate-in fade-in zoom-in-95 duration-150">
                              <button
                                type="button"
                                onClick={() => {
                                  handleViewLeave(leave)
                                  setOpenDropdownId(null)
                                }}
                                className="w-full px-3.5 py-2 flex items-center gap-2 font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                              >
                                <Eye className="size-3.5 text-slate-400" />
                                <span>View Full Details</span>
                              </button>

                              {leave.status === DoctorLeaveStatus.PENDING && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      openActionModal('APPROVE', leave)
                                      setOpenDropdownId(null)
                                    }}
                                    className="w-full px-3.5 py-2 flex items-center gap-2 font-bold text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                                  >
                                    <CheckCircle2 className="size-3.5 text-emerald-500" />
                                    <span>Approve Request</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      openActionModal('REJECT', leave)
                                      setOpenDropdownId(null)
                                    }}
                                    className="w-full px-3.5 py-2 flex items-center gap-2 font-bold text-rose-600 hover:bg-rose-50 cursor-pointer"
                                  >
                                    <XCircle className="size-3.5 text-rose-500" />
                                    <span>Reject Request</span>
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer matching mockup */}
      <div className="p-3.5 sm:p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
        <p className="text-xs font-semibold text-slate-500">
          Showing <span className="font-bold text-slate-800">{startIdx}</span> to{' '}
          <span className="font-bold text-slate-800">{endIdx}</span> of{' '}
          <span className="font-bold text-slate-800">{totalDocs}</span> requests
        </p>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPage <= 1 || isLoading}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <ChevronLeft className="size-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              type="button"
              onClick={() => setCurrentPage(pageNum)}
              className={`min-w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentPage === pageNum
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {pageNum}
            </button>
          ))}

          <button
            type="button"
            disabled={currentPage >= totalPages || isLoading}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

