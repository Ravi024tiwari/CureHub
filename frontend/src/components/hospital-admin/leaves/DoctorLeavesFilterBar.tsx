import React, { useState } from 'react'
import {
  Search,
  Building2,
  Stethoscope,
  Clock,
  Calendar,
  RotateCcw,
  X,
} from 'lucide-react'
import { useHospitalAdminLeavesStore } from '@/store/hospitalAdminLeavesStore'
import { DoctorLeaveStatus } from '@/types/hospitalAdmin'

export const DoctorLeavesFilterBar: React.FC = () => {
  const {
    searchQuery,
    selectedHospitalId,
    selectedDepartment,
    selectedStatus,
    startDate,
    endDate,
    hospitalsList,
    departmentsList,
    setSearchQuery,
    setSelectedHospitalId,
    setSelectedDepartment,
    setSelectedStatus,
    setDateRange,
    resetFilters,
  } = useHospitalAdminLeavesStore()

  const [isDateModalOpen, setIsDateModalOpen] = useState(false)
  const [tempStart, setTempStart] = useState(startDate)
  const [tempEnd, setTempEnd] = useState(endDate)

  const hasActiveFilters =
    Boolean(searchQuery) ||
    selectedHospitalId !== 'ALL' ||
    selectedDepartment !== 'ALL' ||
    selectedStatus !== 'ALL' ||
    Boolean(startDate) ||
    Boolean(endDate)

  const handleApplyDateRange = () => {
    setDateRange(tempStart, tempEnd)
    setIsDateModalOpen(false)
  }

  const handleClearDateRange = () => {
    setTempStart('')
    setTempEnd('')
    setDateRange('', '')
    setIsDateModalOpen(false)
  }

  const dateRangeDisplay =
    startDate || endDate
      ? `${startDate ? new Date(startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Any'} - ${endDate ? new Date(endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Any'}`
      : 'Select Date Range'

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-slate-100 shadow-xs space-y-3">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5 sm:gap-3 flex-wrap">
        {/* 1. Search Bar */}
        <div className="relative flex-1 min-w-[240px] sm:min-w-[280px]">
          <Search className="size-4.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by doctor name, department or reason..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* 2. Hospital Dropdown */}
        <div className="relative shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl sm:rounded-2xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:border-slate-300 transition-colors">
            <Building2 className="size-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedHospitalId}
              onChange={(e) => setSelectedHospitalId(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer pr-1"
            >
              <option value="ALL">All Hospitals</option>
              {hospitalsList.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 3. Department Dropdown */}
        <div className="relative shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl sm:rounded-2xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:border-slate-300 transition-colors">
            <Stethoscope className="size-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer pr-1"
            >
              {departmentsList.map((dept) => (
                <option key={dept} value={dept === 'All Departments' ? 'ALL' : dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 4. Status Dropdown */}
        <div className="relative shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl sm:rounded-2xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:border-slate-300 transition-colors">
            <Clock className="size-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer pr-1"
            >
              <option value="ALL">All Status</option>
              <option value={DoctorLeaveStatus.PENDING}>Pending</option>
              <option value={DoctorLeaveStatus.APPROVED}>Approved</option>
              <option value={DoctorLeaveStatus.REJECTED}>Rejected</option>
            </select>
          </div>
        </div>

        {/* 5. Date Range Picker Trigger */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setIsDateModalOpen(!isDateModalOpen)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl sm:rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
              startDate || endDate
                ? 'border-blue-500 bg-blue-50/60 text-blue-700'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
            }`}
          >
            <Calendar className="size-3.5 text-slate-400" />
            <span>{dateRangeDisplay}</span>
          </button>

          {/* Quick Date Range Popover */}
          {isDateModalOpen && (
            <div className="absolute right-0 top-full mt-2 z-50 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 space-y-3 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-extrabold text-slate-900">Custom Date Range</span>
                <button
                  type="button"
                  onClick={() => setIsDateModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer"
                >
                  <X className="size-3.5" />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={tempStart}
                    onChange={(e) => setTempStart(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={tempEnd}
                    onChange={(e) => setTempEnd(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleClearDateRange}
                  className="text-[11px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleApplyDateRange}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 6. Reset Filters Button matching mockup */}
        <button
          type="button"
          onClick={resetFilters}
          disabled={!hasActiveFilters}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl sm:rounded-2xl border text-xs font-bold transition-all shrink-0 ${
            hasActiveFilters
              ? 'border-blue-200 bg-blue-50/80 text-blue-700 hover:bg-blue-100 cursor-pointer shadow-2xs'
              : 'border-slate-200 bg-white text-slate-400 opacity-60 cursor-not-allowed'
          }`}
        >
          <RotateCcw className="size-3" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  )
}

