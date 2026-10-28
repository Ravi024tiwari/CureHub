import { useState, useEffect, type FC } from 'react'
import { Search, ChevronDown, RotateCcw, LayoutGrid, List } from 'lucide-react'
import type { DoctorHospitalFilterState } from '@/types/doctorHospital'

interface DoctorHospitalFiltersProps {
  filters: DoctorHospitalFilterState
  availableCities: string[]
  availableTypes: string[]
  availableDepartments: string[]
  viewMode: 'grid' | 'list'
  onChangeFilter: (key: keyof DoctorHospitalFilterState, value: any) => void
  onResetFilters: () => void
  onChangeViewMode: (mode: 'grid' | 'list') => void
}

export const DoctorHospitalFilters: FC<DoctorHospitalFiltersProps> = ({
  filters,
  availableCities,
  availableTypes,
  availableDepartments,
  viewMode,
  onChangeFilter,
  onResetFilters,
  onChangeViewMode,
}) => {
  const [searchInput, setSearchInput] = useState(filters.search)

  useEffect(() => {
    setSearchInput(filters.search)
  }, [filters.search])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        onChangeFilter('search', searchInput)
      }
    }, 350)
    return () => clearTimeout(timer)
  }, [searchInput])

  const hasActiveFilters = Boolean(
    filters.search ||
      filters.city !== 'ALL' ||
      filters.hospitalType !== 'ALL' ||
      filters.department !== 'ALL' ||
      filters.sortBy !== 'nearest'
  )

  return (
    <div className="space-y-3">
      {/* 1. Main Search & Filters Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-3 sm:p-4 shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search hospitals by name, location, specialty..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>

        {/* Filters Selectors Row */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* City Selector */}
          <div className="relative flex-1 sm:flex-initial min-w-[130px]">
            <select
              value={filters.city}
              onChange={(e) => onChangeFilter('city', e.target.value)}
              className="w-full appearance-none bg-slate-50/80 hover:bg-slate-100/70 border border-slate-200 rounded-xl pl-3 pr-8 py-2 text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:border-blue-500 transition-all"
            >
              <option value="ALL">All Cities</option>
              {availableCities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown className="size-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Hospital Type Selector */}
          <div className="relative flex-1 sm:flex-initial min-w-[140px]">
            <select
              value={filters.hospitalType}
              onChange={(e) => onChangeFilter('hospitalType', e.target.value)}
              className="w-full appearance-none bg-slate-50/80 hover:bg-slate-100/70 border border-slate-200 rounded-xl pl-3 pr-8 py-2 text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:border-blue-500 transition-all"
            >
              <option value="ALL">All Types</option>
              {availableTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <ChevronDown className="size-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Department Selector */}
          <div className="relative flex-1 sm:flex-initial min-w-[150px]">
            <select
              value={filters.department}
              onChange={(e) => onChangeFilter('department', e.target.value)}
              className="w-full appearance-none bg-slate-50/80 hover:bg-slate-100/70 border border-slate-200 rounded-xl pl-3 pr-8 py-2 text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:border-blue-500 transition-all"
            >
              <option value="ALL">All Departments</option>
              {availableDepartments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <ChevronDown className="size-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Clear Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="size-3" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Secondary View Mode & Sorting Row */}
      <div className="flex items-center justify-between gap-3 px-1">
        {/* View Mode Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => onChangeViewMode('grid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="size-3.5" />
            <span>Grid View</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeViewMode('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="size-3.5" />
            <span>List View</span>
          </button>
        </div>

        {/* Sort By Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 hidden sm:inline">Sort by:</span>
          <div className="relative">
            <select
              value={filters.sortBy}
              onChange={(e) => onChangeFilter('sortBy', e.target.value)}
              className="appearance-none bg-white hover:bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-8 py-1.5 text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:border-blue-500 shadow-2xs transition-all"
            >
              <option value="nearest">Nearest First</option>
              <option value="rating">Highest Rating</option>
              <option value="beds-desc">Most Beds</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="newest">Recently Added</option>
            </select>
            <ChevronDown className="size-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  )
}
export default DoctorHospitalFilters
