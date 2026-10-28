import { useState, useRef, useEffect, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Heart,
  Activity,
  Baby,
  Stethoscope,
  Sparkles,
  Brain,
  Eye,
  Radio,
  User,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  ArrowRight,
  IndianRupee,
  LayoutGrid,
  List,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react'
import { useHospitalAdminJoinRequestsStore } from '@/store/hospitalAdminJoinRequestsStore'

// Helper for department icon
const getDepartmentIcon = (department: string) => {
  const dept = department.toLowerCase()
  if (dept.includes('cardio')) return { icon: Heart, color: 'text-rose-500 bg-rose-50' }
  if (dept.includes('ortho')) return { icon: Activity, color: 'text-blue-500 bg-blue-50' }
  if (dept.includes('pediat')) return { icon: Baby, color: 'text-emerald-500 bg-emerald-50' }
  if (dept.includes('derma')) return { icon: Sparkles, color: 'text-pink-500 bg-pink-50' }
  if (dept.includes('neuro')) return { icon: Brain, color: 'text-purple-500 bg-purple-50' }
  if (dept.includes('ophthal')) return { icon: Eye, color: 'text-cyan-500 bg-cyan-50' }
  if (dept.includes('radio')) return { icon: Radio, color: 'text-indigo-500 bg-indigo-50' }
  return { icon: Stethoscope, color: 'text-sky-500 bg-sky-50' }
}

// Robust Doctor Avatar component with fallback initials
export const DoctorAvatar: FC<{
  name: string
  avatarUrl?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}> = ({ name, avatarUrl, size = 'md', className = '' }) => {
  const [hasError, setHasError] = useState(false)

  const sizeClasses = {
    sm: 'size-9 text-xs',
    md: 'size-11 text-sm',
    lg: 'size-16 text-xl',
  }

  const cleanName = name.replace(/^Dr\.\s*/i, '').trim()
  const parts = cleanName.split(' ').filter(Boolean)
  const initials =
    parts.length >= 2
      ? `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase()
      : cleanName.slice(0, 2).toUpperCase() || 'DR'

  const isValidUrl = avatarUrl && avatarUrl.trim() !== '' && !hasError

  return (
    <div
      className={`${sizeClasses[size]} rounded-2xl overflow-hidden shrink-0 border border-slate-200/90 shadow-2xs relative flex items-center justify-center font-black ${className}`}
    >
      {isValidUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          onError={() => setHasError(true)}
          className="size-full object-cover"
        />
      ) : (
        <div className="size-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center tracking-wider">
          {initials}
        </div>
      )}
    </div>
  )
}

export const JoinRequestsTable: FC = () => {
  const navigate = useNavigate()
  const {
    requests,
    isLoading,
    fetchRequests,
    resetFilters,
    searchQuery,
    selectedDepartment,
    selectedStatus,
    selectedDateRange,
    currentPage,
    itemsPerPage,
    setCurrentPage,
    openActionModal,
    setSelectedStatus,
  } = useHospitalAdminJoinRequestsStore()

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filter requests
  const filteredRequests = requests.filter((req) => {
    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      const name = req.doctorUserId?.name?.toLowerCase() || ''
      const email = req.doctorUserId?.email?.toLowerCase() || ''
      const dept = req.department?.toLowerCase() || ''
      const specs = req.doctorId?.specialization?.join(' ').toLowerCase() || ''
      if (!name.includes(q) && !email.includes(q) && !dept.includes(q) && !specs.includes(q)) {
        return false
      }
    }

    // 2. Department
    if (selectedDepartment !== 'ALL') {
      if (req.department.toLowerCase() !== selectedDepartment.toLowerCase()) {
        return false
      }
    }

    // 3. Status
    if (selectedStatus !== 'ALL') {
      if (req.status !== selectedStatus) {
        return false
      }
    }

    // 4. Date Range filter
    if (selectedDateRange !== 'ALL') {
      const date = new Date(req.createdAt)
      const now = new Date()
      if (selectedDateRange === 'TODAY') {
        if (date.toDateString() !== now.toDateString()) return false
      } else if (selectedDateRange === 'WEEK') {
        const diffDays = (now.getTime() - date.getTime()) / (1000 * 3600 * 24)
        if (diffDays > 7) return false
      } else if (selectedDateRange === 'MONTH') {
        const diffDays = (now.getTime() - date.getTime()) / (1000 * 3600 * 24)
        if (diffDays > 30) return false
      }
    }

    return true
  })

  // Pagination
  const totalItems = filteredRequests.length
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedRequests = filteredRequests.slice(startIndex, startIndex + itemsPerPage)

  const pendingCount = requests.filter((r) => r.status === 'PENDING').length
  const approvedCount = requests.filter((r) => r.status === 'APPROVED').length
  const rejectedCount = requests.filter((r) => r.status === 'REJECTED').length

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString)
      return d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    } catch {
      return '28 Oct 2024'
    }
  }

  const getRelativeTime = (isoString: string) => {
    try {
      const d = new Date(isoString)
      const now = new Date()
      const diffHours = Math.floor((now.getTime() - d.getTime()) / (1000 * 3600))
      if (diffHours < 24) return diffHours <= 1 ? 'Just now' : `${diffHours}h ago`
      const diffDays = Math.floor(diffHours / 24)
      if (diffDays === 1) return 'Yesterday'
      if (diffDays < 7) return `${diffDays}d ago`
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    } catch {
      return 'Recent'
    }
  }

  return (
    <div className="space-y-4">
      {/* Top Controls Bar: Mobile Pills & Large Screen View Mode Toggle */}
      <div className="flex items-center justify-between gap-4">
        {/* Mobile Top Status Pills */}
        <div className="flex lg:hidden items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedStatus('ALL')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedStatus === 'ALL'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All ({requests.length})
          </button>
          <button
            onClick={() => setSelectedStatus('PENDING')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedStatus === 'PENDING'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setSelectedStatus('APPROVED')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedStatus === 'APPROVED'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Approved ({approvedCount})
          </button>
          <button
            onClick={() => setSelectedStatus('REJECTED')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedStatus === 'REJECTED'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Rejected ({rejectedCount})
          </button>
        </div>

        {/* Desktop View Mode Toggle & Results Count */}
        <div className="hidden lg:flex items-center justify-between w-full">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span>Showing</span>
            <span className="text-slate-900 font-extrabold">{filteredRequests.length}</span>
            <span>doctors matching current criteria</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Table View"
            >
              <List className="size-4" />
              <span>Table</span>
            </button>

            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Grid Cards View"
            >
              <LayoutGrid className="size-4" />
              <span>Cards</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. TABLE VIEW (Desktop Large Screens) */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-4 pl-6 pr-3 w-12 text-center">#</th>
                  <th className="py-4 px-4 min-w-[260px]">Doctor</th>
                  <th className="py-4 px-4 min-w-[180px]">Specialization</th>
                  <th className="py-4 px-4 min-w-[140px]">Experience & Fee</th>
                  <th className="py-4 px-4 min-w-[150px]">Requested On</th>
                  <th className="py-4 px-4 min-w-[120px]">Status</th>
                  <th className="py-4 pl-4 pr-6 text-center min-w-[160px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-4 pl-6 pr-3 text-center">
                        <div className="h-4 w-4 bg-slate-200 rounded mx-auto" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3.5">
                          <div className="size-11 rounded-2xl bg-slate-200 shrink-0" />
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="h-4 bg-slate-200 rounded w-32" />
                            <div className="h-3 bg-slate-100 rounded w-24" />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 bg-slate-200 rounded w-28" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 bg-slate-200 rounded w-20" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 bg-slate-200 rounded w-24" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-6 bg-slate-200 rounded-full w-20" />
                      </td>
                      <td className="py-4 pl-4 pr-6 text-center">
                        <div className="h-8 bg-slate-200 rounded-xl w-16 mx-auto" />
                      </td>
                    </tr>
                  ))
                ) : paginatedRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="max-w-md mx-auto space-y-3 px-4">
                        <div className="size-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
                          <User className="size-7" />
                        </div>
                        <h4 className="text-base font-black text-slate-800">
                          {requests.length === 0
                            ? 'No Doctor Join Requests'
                            : 'No matching requests found'}
                        </h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          {requests.length === 0
                            ? 'When certified medical doctors apply to affiliate with your registered hospitals, their applications, credentials, and verification documents will appear here in real-time.'
                            : 'No doctor applications match your search keywords or filter settings. Try clearing your filters to see all requests.'}
                        </p>
                        <div className="pt-2">
                          {requests.length === 0 ? (
                            <button
                              type="button"
                              onClick={() => fetchRequests()}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                            >
                              <RefreshCw className="size-3.5" />
                              <span>Check for New Requests</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={resetFilters}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                            >
                              <span>Reset Filters</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedRequests.map((req, idx) => {
                    const globalIdx = startIndex + idx + 1
                    const doctorName = req.doctorUserId?.name || 'Dr. Doctor'
                    const doctorEmail = req.doctorUserId?.email || 'doctor@curehealth.org'
                    const doctorPhone = req.doctorUserId?.phoneNumber
                    const doctorAvatar = req.doctorUserId?.avatar
                    const expYears = req.doctorId?.experienceYears || 4
                    const fee = req.doctorId?.consultationFee || 800
                    const dept = req.department || req.doctorId?.department || 'General Medicine'
                    const regNo = req.doctorId?.medicalCouncilRegistrationNumber
                    const { icon: DeptIcon, color: iconStyle } = getDepartmentIcon(dept)

                    return (
                      <tr
                        key={req._id}
                        className="hover:bg-blue-50/30 transition-colors group"
                      >
                        {/* # Index */}
                        <td className="py-4 pl-6 pr-3 text-center text-slate-400 font-bold text-xs">
                          {globalIdx}
                        </td>

                        {/* Doctor Info */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3.5">
                            <DoctorAvatar
                              name={doctorName}
                              avatarUrl={doctorAvatar}
                              size="md"
                            />
                            <div className="min-w-0">
                              <button
                                onClick={() => navigate(`/hospital-admin/join-requests/${req._id}`)}
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
                              {regNo && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 mt-1">
                                  <ShieldCheck className="size-3 text-blue-500" />
                                  <span>{regNo}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Specialization */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`size-8 rounded-xl flex items-center justify-center shrink-0 ${iconStyle} shadow-2xs`}
                            >
                              <DeptIcon className="size-4" />
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-slate-800 truncate block">
                                {dept}
                              </span>
                              {req.doctorId?.specialization?.[0] &&
                                req.doctorId.specialization[0] !== dept && (
                                  <span className="text-[11px] text-slate-400 truncate block">
                                    {req.doctorId.specialization[0]}
                                  </span>
                                )}
                            </div>
                          </div>
                        </td>

                        {/* Experience & Fee */}
                        <td className="py-4 px-4">
                          <div className="space-y-0.5">
                            <span className="font-extrabold text-slate-900 block text-xs">
                              {expYears} years
                            </span>
                            <span className="text-[11px] text-slate-500 font-semibold flex items-center">
                              <IndianRupee className="size-3" />
                              <span>{fee} OPD fee</span>
                            </span>
                          </div>
                        </td>

                        {/* Requested On */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="space-y-0.5">
                            <span className="font-semibold text-slate-700 block text-xs">
                              {formatDate(req.createdAt)}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {getRelativeTime(req.createdAt)}
                            </span>
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="py-4 px-4">
                          {req.status === 'PENDING' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200/80 shadow-2xs">
                              <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                              <span>Pending</span>
                            </span>
                          )}
                          {req.status === 'APPROVED' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/80 shadow-2xs">
                              <span className="size-1.5 rounded-full bg-emerald-500" />
                              <span>Approved</span>
                            </span>
                          )}
                          {req.status === 'REJECTED' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200/80 shadow-2xs">
                              <span className="size-1.5 rounded-full bg-rose-500" />
                              <span>Rejected</span>
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 pl-4 pr-6 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Primary View Details Button */}
                            <button
                              onClick={() => navigate(`/hospital-admin/join-requests/${req._id}`)}
                              className="px-3.5 py-1.5 rounded-xl border border-blue-200 bg-white text-blue-600 hover:bg-blue-50 font-bold text-xs transition-all cursor-pointer active:scale-95 shadow-2xs flex items-center gap-1.5"
                            >
                              <Eye className="size-3.5" />
                              <span>View</span>
                            </button>

                            {/* Quick Row Action for Pending */}
                            {req.status === 'PENDING' && (
                              <button
                                onClick={() => openActionModal('APPROVE', req)}
                                className="p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 transition-colors cursor-pointer"
                                title="Approve Doctor Immediately"
                              >
                                <CheckCircle2 className="size-4" />
                              </button>
                            )}

                            {/* Options Dropdown */}
                            <div className="relative">
                              <button
                                onClick={() =>
                                  setActiveMenuId(activeMenuId === req._id ? null : req._id)
                                }
                                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                title="More options"
                              >
                                <MoreVertical className="size-4" />
                              </button>

                              {activeMenuId === req._id && (
                                <div
                                  ref={menuRef}
                                  className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 z-30 animate-in fade-in zoom-in-95 duration-100 text-left text-xs"
                                >
                                  <button
                                    onClick={() => {
                                      setActiveMenuId(null)
                                      navigate(`/hospital-admin/join-requests/${req._id}`)
                                    }}
                                    className="w-full px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-semibold flex items-center gap-2 cursor-pointer"
                                  >
                                    <FileText className="size-3.5 text-slate-400" />
                                    <span>Full Details</span>
                                  </button>

                                  {req.status === 'PENDING' && (
                                    <>
                                      <button
                                        onClick={() => {
                                          setActiveMenuId(null)
                                          openActionModal('APPROVE', req)
                                        }}
                                        className="w-full px-3 py-2 rounded-xl text-emerald-700 hover:bg-emerald-50 font-semibold flex items-center gap-2 cursor-pointer"
                                      >
                                        <CheckCircle2 className="size-3.5 text-emerald-600" />
                                        <span>Approve Doctor</span>
                                      </button>
                                      <button
                                        onClick={() => {
                                          setActiveMenuId(null)
                                          openActionModal('REJECT', req)
                                        }}
                                        className="w-full px-3 py-2 rounded-xl text-rose-700 hover:bg-rose-50 font-semibold flex items-center gap-2 cursor-pointer"
                                      >
                                        <XCircle className="size-3.5 text-rose-600" />
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

          {/* Mobile Card List View */}
          <div className="block lg:hidden divide-y divide-slate-100">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-50 animate-pulse flex items-center gap-3">
                    <div className="size-11 rounded-2xl bg-slate-200 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-32" />
                      <div className="h-3 bg-slate-100 rounded w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : paginatedRequests.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs space-y-2">
                <p className="font-bold text-slate-700">
                  {requests.length === 0 ? 'No Doctor Join Requests' : 'No doctor applications found'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {requests.length === 0
                    ? 'Real applications from doctors will appear here.'
                    : 'Try resetting your filter parameters.'}
                </p>
              </div>
            ) : (
              paginatedRequests.map((req) => {
                const doctorName = req.doctorUserId?.name || 'Dr. Doctor'
                const expYears = req.doctorId?.experienceYears || 5
                const dept = req.department || 'General'
                const doctorAvatar = req.doctorUserId?.avatar

                return (
                  <div
                    key={req._id}
                    onClick={() => navigate(`/hospital-admin/join-requests/${req._id}`)}
                    className="p-4 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between gap-3 active:bg-slate-100/70"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <DoctorAvatar name={doctorName} avatarUrl={doctorAvatar} size="md" />
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate">{doctorName}</h4>
                        <p className="text-xs text-slate-500 font-medium truncate">
                          {dept} • {expYears} years
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                          <Clock className="size-3" />
                          <span>{formatDate(req.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {req.status === 'PENDING' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200">
                          Pending
                        </span>
                      )}
                      {req.status === 'APPROVED' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                          Approved
                        </span>
                      )}
                      {req.status === 'REJECTED' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                          Rejected
                        </span>
                      )}
                      <ArrowRight className="size-4 text-slate-300" />
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Table Footer with Pagination */}
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Showing{' '}
              <span className="font-bold text-slate-800">
                {totalItems === 0 ? 0 : startIndex + 1}
              </span>{' '}
              to{' '}
              <span className="font-bold text-slate-800">
                {Math.min(startIndex + itemsPerPage, totalItems)}
              </span>{' '}
              of <span className="font-bold text-slate-800">{totalItems}</span> requests
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="size-8 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronLeft className="size-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`size-8 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="size-8 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. GRID CARDS VIEW (Optional Large Screen Mode) */}
      {viewMode === 'grid' && (
        isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs animate-pulse space-y-4">
                <div className="flex items-start justify-between">
                  <div className="size-11 rounded-2xl bg-slate-200" />
                  <div className="h-5 w-16 bg-slate-200 rounded-full" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : paginatedRequests.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-md mx-auto space-y-3">
            <div className="size-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
              <User className="size-7" />
            </div>
            <h4 className="text-base font-black text-slate-800">
              {requests.length === 0 ? 'No Doctor Join Requests' : 'No matching requests found'}
            </h4>
            <p className="text-xs text-slate-500">
              {requests.length === 0
                ? 'Doctor applications to join your hospitals will appear here in real-time.'
                : 'Try adjusting your filter settings.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
            {paginatedRequests.map((req) => {
            const doctorName = req.doctorUserId?.name || 'Dr. Doctor'
            const doctorEmail = req.doctorUserId?.email || 'doctor@curehealth.org'
            const doctorAvatar = req.doctorUserId?.avatar
            const expYears = req.doctorId?.experienceYears || 4
            const fee = req.doctorId?.consultationFee || 800
            const dept = req.department || req.doctorId?.department || 'General Medicine'
            const { icon: DeptIcon, color: iconStyle } = getDepartmentIcon(dept)

            return (
              <div
                key={req._id}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-blue-200 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div>
                  {/* Top Doctor Row */}
                  <div className="flex items-start justify-between gap-3">
                    <DoctorAvatar name={doctorName} avatarUrl={doctorAvatar} size="md" />

                    {req.status === 'PENDING' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200">
                        Pending
                      </span>
                    )}
                    {req.status === 'APPROVED' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                        Approved
                      </span>
                    )}
                    {req.status === 'REJECTED' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                        Rejected
                      </span>
                    )}
                  </div>

                  {/* Doctor Info */}
                  <div className="mt-3 space-y-1">
                    <h3 className="font-extrabold text-base text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                      {doctorName}
                    </h3>
                    <p className="text-xs text-slate-500 truncate">{doctorEmail}</p>
                  </div>

                  {/* Department & Specialty */}
                  <div className="mt-3.5 flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className={`size-7 rounded-lg flex items-center justify-center shrink-0 ${iconStyle}`}>
                      <DeptIcon className="size-3.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-xs text-slate-800 truncate block">
                        {dept}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate block">
                        {expYears} yrs exp • ₹{fee} fee
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => navigate(`/hospital-admin/join-requests/${req._id}`)}
                    className="flex-1 py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors cursor-pointer text-center"
                  >
                    View Profile
                  </button>

                  {req.status === 'PENDING' && (
                    <button
                      onClick={() => openActionModal('APPROVE', req)}
                      className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                      title="Approve"
                    >
                      <CheckCircle2 className="size-4" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        )
      )}
    </div>
  )
}
export default JoinRequestsTable
