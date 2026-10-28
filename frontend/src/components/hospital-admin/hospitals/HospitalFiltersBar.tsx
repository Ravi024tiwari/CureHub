import { useState, useEffect, type FC } from 'react'
import {
  Search,
  ChevronDown,
  LayoutGrid,
  List,
  SlidersHorizontal,
  X,
  RotateCcw,
} from 'lucide-react'
import { useHospitalBranchesStore } from '@/store/hospitalBranchesStore'

export const HospitalFiltersBar: FC = () => {
  const {
    filters,
    setFilter,
    resetFilters,
    viewMode,
    setViewMode,
    setIsMobileFiltersOpen,
    hospitals,
  } = useHospitalBranchesStore()

  // Local search query with debounce
  const [searchInput, setSearchInput] = useState(filters.search)

  useEffect(() => {
    setSearchInput(filters.search)
  }, [filters.search])

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== filters.search) {
        setFilter('search', searchInput)
      }
    }, 350)
    return () => clearTimeout(handler)
  }, [searchInput])

  // Extract unique cities from hospital records for dynamic city dropdown
  const uniqueCities = Array.from(
    new Set([
      'Bilaspur',
      'Raipur',
      'Durg',
      'Delhi NCR',
      ...hospitals.map((h) => h.address?.city).filter(Boolean),
    ])
  )

  const activeFiltersCount = [
    filters.activeStatus !== 'ALL',
    filters.hospitalType !== 'ALL',
    filters.city !== 'ALL',
    Boolean(filters.search.trim()),
  ].filter(Boolean).length

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-3 sm:p-4 shadow-2xs flex flex-col gap-3">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* 1. Search Bar */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search hospitals by name, city, type..."
            className="w-full pl-9 pr-8 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/90 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100 transition-all"
          />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput('')
                setFilter('search', '')
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* 2. Desktop Filters Cluster */}
        <div className="hidden lg:flex items-center gap-2.5 flex-wrap">

          {/* Active Status Selector */}
          <div className="relative">
            <select
              value={filters.activeStatus}
              onChange={(e) => setFilter('activeStatus', e.target.value)}
              className="appearance-none bg-slate-50/70 hover:bg-slate-100/70 border border-slate-200/90 rounded-2xl pl-3 pr-8 py-2 text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:border-blue-500 transition-all"
            >
              <option value="ALL">Active Status: All</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>
            <ChevronDown className="size-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Hospital Type Selector */}
          <div className="relative">
            <select
              value={filters.hospitalType}
              onChange={(e) => setFilter('hospitalType', e.target.value)}
              className="appearance-none bg-slate-50/70 hover:bg-slate-100/70 border border-slate-200/90 rounded-2xl pl-3 pr-8 py-2 text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:border-blue-500 transition-all"
            >
              <option value="ALL">All Types</option>
              <option value="Multi-Speciality">Multi-Speciality</option>
              <option value="Super-Speciality">Super-Speciality</option>
              <option value="General Hospital">General Hospital</option>
              <option value="Maternity & Women Care">Maternity & Women Care</option>
              <option value="Clinic">Clinic</option>
            </select>
            <ChevronDown className="size-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* City Selector */}
          <div className="relative">
            <select
              value={filters.city}
              onChange={(e) => setFilter('city', e.target.value)}
              className="appearance-none bg-slate-50/70 hover:bg-slate-100/70 border border-slate-200/90 rounded-2xl pl-3 pr-8 py-2 text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:border-blue-500 transition-all"
            >
              <option value="ALL">All Cities</option>
              {uniqueCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            <ChevronDown className="size-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Sort By Selector */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold pl-1">
            <span className="shrink-0 text-slate-400">Sort By:</span>
            <div className="relative">
              <select
                value={filters.sortBy}
                onChange={(e) => setFilter('sortBy', e.target.value)}
                className="appearance-none bg-slate-50/70 hover:bg-slate-100/70 border border-slate-200/90 rounded-2xl pl-3 pr-8 py-2 text-xs font-bold text-slate-800 cursor-pointer focus:outline-none focus:border-blue-500 transition-all"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="rating-desc">Rating: High to Low</option>
                <option value="beds-desc">Most Beds</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
              <ChevronDown className="size-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* 3. Action Controls: Mobile Filters Button & View Switchers */}
        <div className="flex items-center justify-between lg:justify-end gap-2 border-t lg:border-t-0 pt-2 lg:pt-0 border-slate-100">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setIsMobileFiltersOpen(true)}
            className="lg:hidden flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 cursor-pointer transition-colors"
          >
            <SlidersHorizontal className="size-3.5 text-slate-500" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="size-4 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Reset Filters Icon if active */}
          {activeFiltersCount > 0 && (
            <button
              onClick={resetFilters}
              title="Reset all filters"
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
            >
              <RotateCcw className="size-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}

          {/* View Mode Toggle (Grid vs List) */}
          <div className="flex items-center bg-slate-100/80 p-0.5 rounded-2xl border border-slate-200/80">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="List View"
            >
              <List className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
export default HospitalFiltersBar
