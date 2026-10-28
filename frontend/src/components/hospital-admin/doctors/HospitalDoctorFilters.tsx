import { useState, useEffect, type FC } from 'react'
import {
  Search,
  Filter,
  LayoutGrid,
  List,
  RotateCcw,
  X,
} from 'lucide-react'
import { useHospitalAdminDoctorsStore } from '@/store/hospitalAdminDoctorsStore'

export const HospitalDoctorFilters: FC = () => {
  const {
    searchQuery,
    selectedHospitalId,
    selectedDepartment,
    sortBy,
    viewMode,
    hospitalsList,
    departmentStats,
    setSearchQuery,
    setSelectedHospitalId,
    setSelectedDepartment,
    setSortBy,
    setViewMode,
    resetFilters,
  } = useHospitalAdminDoctorsStore()

  const [localSearch, setLocalSearch] = useState(searchQuery)

  useEffect(() => {
    setLocalSearch(searchQuery)
  }, [searchQuery])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchQuery) {
        setSearchQuery(localSearch)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [localSearch, searchQuery, setSearchQuery])

  // Standard departments list combined with aggregated departments
  const availableDepartments = [
    'ALL',
    ...Array.from(
      new Set([
        ...departmentStats.map((d) => d.department),
        'General Medicine',
        'Cardiology',
        'Neurology',
        'Orthopedics',
        'Pediatrics',
        'Dermatology',
        'Gynecology',
        'Ophthalmology',
      ])
    ),
  ]

  const isFiltersActive =
    searchQuery !== '' ||
    selectedHospitalId !== 'all' ||
    selectedDepartment !== 'ALL' ||
    sortBy !== 'newest'

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-4">
      {/* ── Top Row: Search Input + Hospital Selector + View Mode Switcher ────── */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search doctor by name, specialty, qualification, or MCI reg number..."
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => {
                setLocalSearch('')
                setSearchQuery('')
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap justify-between lg:justify-end">
          {/* Hospital Branch Selector */}
          <div className="relative flex-1 sm:flex-none">
            <select
              value={selectedHospitalId}
              onChange={(e) => setSelectedHospitalId(e.target.value)}
              className="w-full sm:w-auto pl-3 pr-8 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100/70 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer appearance-none"
            >
              <option value="all">🏥 All Hospital Branches</option>
              {hospitalsList.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} {h.city ? `(${h.city})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="relative flex-1 sm:flex-none">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-auto pl-3 pr-8 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100/70 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer appearance-none"
            >
              <option value="newest">🕒 Recently Affiliated</option>
              <option value="rating">★ Highest Rating</option>
              <option value="experience">🏅 Most Experienced</option>
              <option value="fee_low">₹ OPD Fee: Low to High</option>
              <option value="fee_high">₹ OPD Fee: High to Low</option>
              <option value="oldest">📅 Oldest Affiliated</option>
            </select>
          </div>

          {/* View Mode Switcher (Grid / Table) */}
          <div className="hidden sm:flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200/80 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Table View"
            >
              <List className="size-4" />
            </button>
          </div>

          {/* Reset Filters */}
          {isFiltersActive && (
            <button
              type="button"
              onClick={resetFilters}
              className="px-3 py-2.5 rounded-2xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold transition-all border border-rose-200/60 cursor-pointer flex items-center gap-1.5 shrink-0"
              title="Clear all filters"
            >
              <RotateCcw className="size-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Bottom Row: Department Chips ──────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 border-t border-slate-100 pt-3">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0 flex items-center gap-1">
          <Filter className="size-3" />
          <span>Department:</span>
        </span>

        {availableDepartments.map((dept) => {
          const isSelected = selectedDepartment === dept
          const count = departmentStats.find((d) => d.department === dept)?.count

          return (
            <button
              key={dept}
              type="button"
              onClick={() => setSelectedDepartment(dept)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100/80 hover:bg-slate-200/80 text-slate-600'
              }`}
            >
              <span>{dept === 'ALL' ? 'All Departments' : dept}</span>
              {count !== undefined && (
                <span
                  className={`text-[10px] font-black px-1.5 py-0.2 rounded-md ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default HospitalDoctorFilters
