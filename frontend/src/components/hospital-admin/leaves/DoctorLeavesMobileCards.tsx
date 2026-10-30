import React, { useState } from 'react'
import {
  Search,
  X,
  FileText,
} from 'lucide-react'
import { useHospitalAdminLeavesStore } from '@/store/hospitalAdminLeavesStore'
import { DoctorLeavesDetailDrawer } from './DoctorLeavesDetailDrawer'
import { type AdminDoctorLeaveItem, DoctorLeaveStatus } from '@/types/hospitalAdmin'

export const DoctorLeavesMobileCards: React.FC = () => {
  const {
    leaves,
    kpis,
    selectedStatus,
    searchQuery,
    isLoading,
    selectedLeave,
    setSelectedStatus,
    setSearchQuery,
    selectLeave,
  } = useHospitalAdminLeavesStore()

  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false)

  const tabs = [
    { label: 'All', value: 'ALL', count: kpis.total },
    { label: 'Pending', value: 'PENDING', count: kpis.pending },
    { label: 'Approved', value: 'APPROVED', count: kpis.approved },
    { label: 'Rejected', value: 'REJECTED', count: kpis.rejected },
  ]

  const handleCardClick = (leave: AdminDoctorLeaveItem) => {
    selectLeave(leave)
    setIsMobileSheetOpen(true)
  }

  return (
    <div className="lg:hidden space-y-4">
      {/* 1. Mobile Status Pills matching mockup */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = selectedStatus === tab.value
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setSelectedStatus(tab.value)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          )
        })}
      </div>

      {/* 2. Mobile Search Bar */}
      <div className="relative">
        <Search className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search doctors, departments..."
          className="w-full pl-9 pr-8 py-2 rounded-2xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {/* 3. Cards List matching mobile mockup */}
      <div className="space-y-3">
        {isLoading && leaves.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-100">
            <div className="size-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-400">Loading leave requests...</p>
          </div>
        ) : leaves.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-100">
            <FileText className="size-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">No Leave Requests</p>
          </div>
        ) : (
          leaves.map((leave) => {
            const doc = leave.doctorId as any
            const docUser = doc?.userId as any
            const docName = docUser?.name || 'Dr. Specialist'
            const avatar = docUser?.avatar || null

            const s = new Date(leave.startDateTime)
            const e = new Date(leave.endDateTime)
            const diffDays = Math.max(
              1,
              Math.ceil(Math.max(0, e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24))
            )
            const sStr = s.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
            const eStr = e.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
            const durationDisplay =
              sStr === eStr ? `${sStr} (1 day)` : `${sStr} - ${eStr} (${diffDays} days)`

            return (
              <div
                key={leave._id}
                onClick={() => handleCardClick(leave)}
                className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs flex items-center justify-between gap-3 active:scale-[0.99] transition-transform cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={docName}
                      className="size-11 rounded-full object-cover border border-slate-100 shrink-0"
                    />
                  ) : (
                    <div className="size-11 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                      {docName.replace('Dr.', '').trim().charAt(0) || 'D'}
                    </div>
                  )}

                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-slate-900 truncate">{docName}</h4>
                    <p className="text-[11px] font-semibold text-slate-500 mt-0.5 truncate">
                      {durationDisplay}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {leave.reason || leave.leaveType}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  {leave.status === DoctorLeaveStatus.PENDING && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                      Pending
                    </span>
                  )}
                  {leave.status === DoctorLeaveStatus.APPROVED && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Approved
                    </span>
                  )}
                  {leave.status === DoctorLeaveStatus.REJECTED && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                      Rejected
                    </span>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* 4. Full Screen Bottom Sheet for Mobile Review */}
      {isMobileSheetOpen && selectedLeave && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setIsMobileSheetOpen(false)}
          />
          <div className="relative z-10 w-full bg-white rounded-t-3xl h-[88vh] max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
            <DoctorLeavesDetailDrawer onClose={() => setIsMobileSheetOpen(false)} />
          </div>
        </div>
      )}
    </div>
  )
}

