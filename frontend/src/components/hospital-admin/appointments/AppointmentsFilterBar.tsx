import { type FC } from 'react'
import { Search, X, RotateCcw, ChevronDown } from 'lucide-react'
import { useHospitalAdminAppointmentsStore } from '@/store/hospitalAdminAppointmentsStore'

export const AppointmentsFilterBar: FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    selectedHospitalId,
    setSelectedHospitalId,
    selectedDoctorId,
    setSelectedDoctorId,
    selectedDepartment,
    setSelectedDepartment,
    activeTab,
    setActiveTab,
    filterOptions,
    resetFilters,
  } = useHospitalAdminAppointmentsStore()

  const tabs: Array<{ id: 'all' | 'today' | 'upcoming' | 'completed' | 'cancelled'; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'today', label: 'Today' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ]

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedHospitalId !== 'all' ||
    selectedDoctorId !== 'all' ||
    selectedDepartment !== 'All Departments' ||
    activeTab !== 'all'

  return (
    <div className="space-y-3.5">
      {/* Mobile Tabs */}
      <div className="flex sm:hidden overflow-x-auto pb-1 gap-1.5 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Filter Bar Card matching mockup */}
      <div className="bg-white rounded-3xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by patient name, doctor name..."
            className="w-full pl-10 pr-9 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200/90 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Dropdowns Row */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
          {/* Hospital Select */}
          <div className="relative flex-1 sm:w-44">
            <select
              value={selectedHospitalId}
              onChange={(e) => setSelectedHospitalId(e.target.value)}
              className="w-full appearance-none pl-3 pr-8 py-2 bg-slate-50 hover:bg-slate-100/70 border border-slate-200/90 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer transition-all shadow-2xs"
            >
              <option value="all">All Hospitals</option>
              {filterOptions.hospitals
                .filter((h) => h.id !== 'all')
                .map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
            </select>
            <ChevronDown className="size-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Doctor Select */}
          <div className="relative flex-1 sm:w-44">
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="w-full appearance-none pl-3 pr-8 py-2 bg-slate-50 hover:bg-slate-100/70 border border-slate-200/90 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer transition-all shadow-2xs"
            >
              <option value="all">All Doctors</option>
              {filterOptions.doctors
                .filter((d) => d.id !== 'all')
                .map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
            </select>
            <ChevronDown className="size-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Department Select */}
          <div className="relative flex-1 sm:w-44">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full appearance-none pl-3 pr-8 py-2 bg-slate-50 hover:bg-slate-100/70 border border-slate-200/90 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer transition-all shadow-2xs"
            >
              <option value="all">All Departments</option>
              {filterOptions.departments
                .filter((dept) => dept.toLowerCase() !== 'all' && dept.toLowerCase() !== 'all departments')
                .map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
            </select>
            <ChevronDown className="size-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Reset Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="px-3.5 py-2 rounded-2xl border border-slate-200/90 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs shrink-0"
              title="Reset all filters"
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

export default AppointmentsFilterBar

