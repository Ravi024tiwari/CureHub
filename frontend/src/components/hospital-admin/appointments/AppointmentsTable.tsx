import { useEffect, useRef, useState, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Calendar,
  MoreVertical,
  User,
  Loader2,
  CheckCircle2,
  RotateCcw,
  AlertCircle,
  Building2,
  Eye,
  CalendarClock,
  XCircle,
  ChevronRight,
} from 'lucide-react'
import { useHospitalAdminAppointmentsStore } from '@/store/hospitalAdminAppointmentsStore'
import type { AdminAppointmentItem } from '@/types/hospitalAdmin'

export const AppointmentsTable: FC<{
  onOpenReschedule: (appointment: AdminAppointmentItem) => void
  onOpenCancel: (appointment: AdminAppointmentItem) => void
}> = ({ onOpenReschedule, onOpenCancel }) => {
  const navigate = useNavigate()
  const {
    appointments,
    pagination,
    isLoading,
    isLoadingMore,
    fetchNextPage,
    resetFilters,
    searchQuery,
    selectedHospitalId,
    selectedDoctorId,
    selectedDepartment,
    selectedDate,
    selectedStatus,
    activeTab,
  } = useHospitalAdminAppointmentsStore()

  const hasActiveFilters =
    Boolean(searchQuery) ||
    selectedHospitalId !== 'all' ||
    selectedDoctorId !== 'all' ||
    selectedDepartment !== 'all' ||
    Boolean(selectedDate) ||
    selectedStatus !== 'ALL' ||
    activeTab !== 'all'

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  // Infinite Scroll IntersectionObserver (Strictly Real Backend Cursor Pagination)
  useEffect(() => {
    if (!sentinelRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        const canLoadMore = pagination.hasNextPage || pagination.hasMore
        if (first.isIntersecting && canLoadMore && !isLoadingMore && !isLoading) {
          fetchNextPage()
        }
      },
      {
        root: null, // viewport
        rootMargin: '250px', // start loading before user hits bottom
        threshold: 0.1,
      }
    )

    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [pagination.hasNextPage, pagination.hasMore, isLoadingMore, isLoading, fetchNextPage])

  // Click outside listener to automatically close active action menu
  useEffect(() => {
    const handleDocClick = () => setActiveMenuId(null)
    document.addEventListener('click', handleDocClick)
    return () => document.removeEventListener('click', handleDocClick)
  }, [])

  const getStatusBadge = (status: string) => {
    const s = (status || '').toUpperCase()
    if (s === 'CONFIRMED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Confirmed
        </span>
      )
    }
    if (s === 'PENDING' || s === 'PENDING_PAYMENT') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200/80 shadow-2xs">
          <span className="size-1.5 rounded-full bg-amber-500" />
          Pending
        </span>
      )
    }
    if (s === 'COMPLETED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs">
          <span className="size-1.5 rounded-full bg-blue-500" />
          Completed
        </span>
      )
    }
    if (s.includes('CANCEL')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200/80 shadow-2xs">
          <span className="size-1.5 rounded-full bg-rose-500" />
          Cancelled
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200">
        {status}
      </span>
    )
  }

  const getDepartmentColor = (dept: string) => {
    const d = (dept || '').toLowerCase()
    if (d.includes('cardio')) return 'bg-blue-50 text-blue-700 border-blue-100'
    if (d.includes('ortho')) return 'bg-sky-50 text-sky-700 border-sky-100'
    if (d.includes('pediat')) return 'bg-violet-50 text-violet-700 border-violet-100'
    if (d.includes('general')) return 'bg-teal-50 text-teal-700 border-teal-100'
    if (d.includes('gynec')) return 'bg-pink-50 text-pink-700 border-pink-100'
    if (d.includes('ent')) return 'bg-amber-50 text-amber-700 border-amber-100'
    if (d.includes('derma')) return 'bg-purple-50 text-purple-700 border-purple-100'
    if (d.includes('neuro')) return 'bg-indigo-50 text-indigo-700 border-indigo-100'
    return 'bg-slate-50 text-slate-700 border-slate-200'
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
      {/* ─── DESKTOP TABLE VIEW (>= 768px) ─── */}
      <div className="hidden md:block overflow-x-auto scrollbar-thin">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 select-none">
              <th className="py-3.5 pl-6 pr-3 w-12 text-center">#</th>
              <th className="py-3.5 px-4">Patient</th>
              <th className="py-3.5 px-4">Doctor</th>
              <th className="py-3.5 px-4">Department</th>
              <th className="py-3.5 px-4">Date & Time</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-center">Mode</th>
              <th className="py-3.5 pr-6 pl-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/90 text-xs sm:text-sm font-medium">
            {isLoading && appointments.length === 0 ? (
              // Loading Skeleton (8 rows)
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 pl-6 pr-3 text-center">
                    <div className="size-4 bg-slate-100 rounded mx-auto" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 bg-slate-100 rounded-full shrink-0" />
                      <div className="space-y-1.5 flex-1">
                        <div className="h-4 w-28 bg-slate-100 rounded" />
                        <div className="h-3 w-36 bg-slate-100 rounded" />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 bg-slate-100 rounded-full shrink-0" />
                      <div className="space-y-1.5 flex-1">
                        <div className="h-4 w-24 bg-slate-100 rounded" />
                        <div className="h-3 w-20 bg-slate-100 rounded" />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-6 w-20 bg-slate-100 rounded-full" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 w-24 bg-slate-100 rounded" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-6 w-18 bg-slate-100 rounded-full" />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="h-6 w-16 bg-slate-100 rounded-full mx-auto" />
                  </td>
                  <td className="py-4 pr-6 pl-4 text-right">
                    <div className="h-8 w-14 bg-slate-100 rounded-xl ml-auto" />
                  </td>
                </tr>
              ))
            ) : appointments.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center max-w-md mx-auto space-y-3 px-4">
                    <div className="size-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-2xs">
                      <Calendar className="size-8 stroke-[1.8]" />
                    </div>
                    <h4 className="text-base font-bold text-slate-800">No on-site appointments found</h4>
                    <p className="text-xs text-slate-500 max-w-sm">
                      {hasActiveFilters
                        ? 'No on-site appointments matched your current search filters or date selection.'
                        : 'There are currently no on-site appointments scheduled for your hospital.'}
                    </p>
                    {hasActiveFilters && (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={resetFilters}
                          className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition cursor-pointer"
                        >
                          Clear Filters
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              appointments.map((appt, idx) => {
                const isMenuOpen = activeMenuId === appt._id

                return (
                  <tr
                    key={appt._id}
                    className="group transition-colors hover:bg-slate-50/80"
                  >
                    {/* Index */}
                    <td className="py-3.5 pl-6 pr-3 text-center text-xs font-bold text-slate-400">
                      {idx + 1}
                    </td>

                    {/* Patient */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 ring-1 ring-slate-200/80 shadow-2xs overflow-hidden">
                          {appt.patient.avatar ? (
                            <img
                              src={appt.patient.avatar}
                              alt={appt.patient.name}
                              className="size-full object-cover"
                            />
                          ) : (
                            <span>{appt.patient.name.charAt(0)}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-extrabold text-slate-900 truncate leading-tight">
                            {appt.patient.name}
                          </p>
                          <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                            {typeof appt.patient.age === 'number'
                              ? `${appt.patient.age} yrs`
                              : appt.patient.gender || 'Patient'}
                            {appt.patient.phoneNumber ? ` • ${appt.patient.phoneNumber}` : ''}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Doctor */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-full bg-gradient-to-tr from-emerald-100 to-teal-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 ring-1 ring-slate-200/80 shadow-2xs overflow-hidden">
                          {appt.doctor.avatar ? (
                            <img
                              src={appt.doctor.avatar}
                              alt={appt.doctor.name}
                              className="size-full object-cover"
                            />
                          ) : (
                            <User className="size-4.5 text-emerald-700" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-extrabold text-slate-900 truncate leading-tight">
                            {appt.doctor.name}
                          </p>
                          <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                            {appt.doctor.specialization?.[0] || appt.doctor.department}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold border truncate max-w-[140px] shadow-2xs ${getDepartmentColor(
                          appt.doctor.department
                        )}`}
                      >
                        {appt.doctor.department}
                      </span>
                    </td>

                    {/* Date & Time */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Calendar className="size-4 text-blue-600 shrink-0" />
                        <div>
                          <p className="text-xs font-bold leading-tight">{appt.date}</p>
                          <p className="text-[11px] text-slate-400 font-semibold">{appt.startTime}</p>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(appt.displayStatus)}
                    </td>

                    {/* Mode (Strictly On-site) */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200/90 shadow-2xs">
                        On-site
                      </span>
                    </td>

                    {/* Actions Column (Modern, Interactive, Robust Vertical Dropdown) */}
                    <td className="py-3.5 pr-6 pl-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {/* Primary View Action Button -> navigates to Dedicated Detail Page */}
                        <button
                          type="button"
                          onClick={() => navigate(`/hospital-admin/appointments/${appt._id}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white text-xs font-bold transition-all border border-blue-200/70 hover:border-blue-600 shadow-2xs hover:shadow-xs cursor-pointer active:scale-95"
                          title="View Full Appointment Details"
                        >
                          <Eye className="size-3.5" />
                          <span>View</span>
                        </button>

                        {/* Three dots menu container */}
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setActiveMenuId(isMenuOpen ? null : appt._id)
                            }}
                            className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                              isMenuOpen
                                ? 'bg-slate-200 text-slate-900 shadow-inner'
                                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                            }`}
                            title="More actions"
                          >
                            <MoreVertical className="size-4" />
                          </button>

                          {/* Strictly Vertically Stacked Menu Card with Shadow & Border */}
                          {isMenuOpen && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 z-50 flex flex-col space-y-1 animate-in fade-in zoom-in-95 duration-150 text-left"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null)
                                  navigate(`/hospital-admin/appointments/${appt._id}`)
                                }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors cursor-pointer text-left whitespace-nowrap"
                              >
                                <Eye className="size-3.5 text-blue-600 shrink-0" />
                                <span>View Details</span>
                              </button>

                              {appt.displayStatus !== 'Completed' && appt.displayStatus !== 'Cancelled' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null)
                                    onOpenReschedule(appt)
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:text-amber-800 rounded-xl transition-colors cursor-pointer text-left whitespace-nowrap"
                                >
                                  <CalendarClock className="size-3.5 text-amber-600 shrink-0" />
                                  <span>Reschedule Visit</span>
                                </button>
                              )}

                              {appt.displayStatus !== 'Cancelled' && appt.displayStatus !== 'Completed' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null)
                                    onOpenCancel(appt)
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer text-left whitespace-nowrap"
                                >
                                  <XCircle className="size-3.5 text-rose-500 shrink-0" />
                                  <span>Cancel Appointment</span>
                                </button>
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

      {/* ─── MOBILE CARDS VIEW (< 768px) ─── */}
      <div className="md:hidden divide-y divide-slate-100">
        {isLoading && appointments.length === 0 ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 space-y-3 animate-pulse">
              <div className="h-5 bg-slate-100 rounded w-1/2" />
              <div className="h-4 bg-slate-100 rounded w-3/4" />
              <div className="h-8 bg-slate-100 rounded-xl" />
            </div>
          ))
        ) : appointments.length === 0 ? (
          <div className="py-12 px-4 text-center space-y-3">
            <div className="size-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
              <Calendar className="size-6 stroke-[1.8]" />
            </div>
            <p className="text-sm font-bold text-slate-800">No on-site appointments found</p>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              {hasActiveFilters
                ? 'No on-site appointments matched your current filters.'
                : 'There are currently no scheduled on-site appointments.'}
            </p>
            {hasActiveFilters && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        ) : (
          appointments.map((appt) => (
            <div
              key={appt._id}
              className="p-4 hover:bg-slate-50/80 transition-colors space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden ring-1 ring-slate-200">
                    {appt.patient.avatar ? (
                      <img
                        src={appt.patient.avatar}
                        alt={appt.patient.name}
                        className="size-full object-cover"
                      />
                    ) : (
                      <span>{appt.patient.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-extrabold text-slate-900 truncate">
                      {appt.patient.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {typeof appt.patient.age === 'number'
                        ? `${appt.patient.age} yrs`
                        : appt.patient.gender || 'Patient'}
                      {appt.patient.phoneNumber ? ` • ${appt.patient.phoneNumber}` : ''}
                    </p>
                  </div>
                </div>

                {getStatusBadge(appt.displayStatus)}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 rounded-2xl p-2.5 border border-slate-100">
                <div className="flex items-center gap-1.5 font-bold">
                  <Calendar className="size-3.5 text-blue-600" />
                  <span>{appt.startTime}</span>
                  <span className="text-slate-300">•</span>
                  <span className="font-semibold">{appt.doctor.name}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-slate-600 border border-slate-200">
                  On-site
                </span>
              </div>

              {/* Mobile Quick Action Buttons */}
              <div className="flex items-center justify-between pt-1 gap-2">
                <button
                  type="button"
                  onClick={() => navigate(`/hospital-admin/appointments/${appt._id}`)}
                  className="flex-1 py-2 px-3 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white text-xs font-bold rounded-xl border border-blue-200/70 flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-2xs"
                >
                  <Eye className="size-3.5" />
                  <span>View Details</span>
                </button>

                {appt.displayStatus !== 'Cancelled' && appt.displayStatus !== 'Completed' && (
                  <>
                    <button
                      type="button"
                      onClick={() => onOpenReschedule(appt)}
                      className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      Reschedule
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenCancel(appt)}
                      className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ─── PRODUCTION-GRADE INFINITE SCROLL SENTINEL & FOOTER ─── */}
      <div
        ref={sentinelRef}
        className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
      >
        <div className="text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-900">{appointments.length}</span> of{' '}
          <span className="font-bold text-slate-900">{pagination.totalDocs || appointments.length}</span>{' '}
          on-site appointments
        </div>

        {isLoadingMore ? (
          <div className="flex items-center gap-2 text-blue-600 font-bold bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200/60">
            <Loader2 className="size-4 animate-spin" />
            <span>Fetching next 10 on-site appointments...</span>
          </div>
        ) : (pagination.hasNextPage || pagination.hasMore) ? (
          <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-blue-500 animate-ping" />
            <span>Scroll down to automatically load more</span>
          </div>
        ) : appointments.length > 0 ? (
          <div className="flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200/60">
            <CheckCircle2 className="size-4 text-emerald-600" />
            <span>All {pagination.totalDocs || appointments.length} appointments loaded</span>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default AppointmentsTable
