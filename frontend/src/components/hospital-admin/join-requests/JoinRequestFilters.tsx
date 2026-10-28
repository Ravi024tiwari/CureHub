import { type FC } from 'react'
import { Search, ChevronDown, RotateCcw, Calendar } from 'lucide-react'
import { useHospitalAdminJoinRequestsStore } from '@/store/hospitalAdminJoinRequestsStore'

const DEPARTMENTS = [
  'All Departments',
  'Cardiology',
  'Orthopedics',
  'Pediatrics',
  'General Medicine',
  'Dermatology',
  'Neurology',
  'Gynecology',
  'ENT',
  'Ophthalmology',
  'Radiology',
]

const STATUSES = [
  { label: 'All Status', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
]

const DATE_RANGES = [
  { label: 'Select Date Range', value: 'ALL' },
  { label: 'Today', value: 'TODAY' },
  { label: 'Last 7 Days', value: 'WEEK' },
  { label: 'This Month', value: 'MONTH' },
]

export const JoinRequestFilters: FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    selectedDepartment,
    setSelectedDepartment,
    selectedStatus,
    setSelectedStatus,
    selectedDateRange,
    setSelectedDateRange,
    resetFilters,
  } = useHospitalAdminJoinRequestsStore()

  const isFiltered =
    searchQuery !== '' ||
    selectedDepartment !== 'ALL' ||
    selectedStatus !== 'ALL' ||
    selectedDateRange !== 'ALL'

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-3 sm:p-4 shadow-xs">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by doctor name, email, specialization..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Selects & Reset Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Department Select */}
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full sm:w-auto appearance-none bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 pr-8 text-xs sm:text-sm font-semibold text-slate-700 cursor-pointer shadow-2xs hover:shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept === 'All Departments' ? 'ALL' : dept}>
                  {dept}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Status Select */}
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full sm:w-auto appearance-none bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 pr-8 text-xs sm:text-sm font-semibold text-slate-700 cursor-pointer shadow-2xs hover:shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {STATUSES.map((st) => (
                <option key={st.value} value={st.value}>
                  {st.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Date Range Select */}
          <div className="relative flex-1 sm:flex-initial">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400 pointer-events-none" />
              <select
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(e.target.value)}
                className="w-full sm:w-auto appearance-none bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl pl-8.5 pr-8 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 cursor-pointer shadow-2xs hover:shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {DATE_RANGES.map((dr) => (
                  <option key={dr.value} value={dr.value}>
                    {dr.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Reset Button */}
          {isFiltered && (
            <button
              onClick={resetFilters}
              className="px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="size-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
export default JoinRequestFilters
