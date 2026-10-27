import { useState, useEffect, type FC } from 'react'
import {
  Search,
  RotateCcw,
  LayoutList,
  LayoutGrid,
  Building,
  CheckCircle2,
  MapPin,
  X,
} from 'lucide-react'
import { useAdminHospitalAdminsStore } from '@/store/adminHospitalAdminsStore'

const HOSPITAL_TYPES = [
  'All Types',
  'Private Hospital',
  'Government Hospital',
  'Multi-Speciality Hospital',
  'Clinic',
  'Diagnostic Center',
]

const STATES_LIST = [
  'All States',
  'Chhattisgarh',
  'Maharashtra',
  'Delhi',
  'Karnataka',
  'Tamil Nadu',
  'Uttar Pradesh',
  'Gujarat',
  'West Bengal',
  'Kerala',
  'Madhya Pradesh',
  'Rajasthan',
]

export const AdminHospitalAdminsFilterBar: FC = () => {
  const { filters, setFilters, resetFilters, isLoading } = useAdminHospitalAdminsStore()

  // Local state for debounced search
  const [searchInput, setSearchInput] = useState(filters.search)

  useEffect(() => {
    setSearchInput(filters.search)
  }, [filters.search])

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== filters.search) {
        setFilters({ search: searchInput })
      }
    }, 350)

    return () => clearTimeout(handler)
  }, [searchInput, filters.search, setFilters])

  const hasActiveFilters =
    Boolean(filters.search) ||
    filters.status !== 'ALL' ||
    filters.hospitalType !== 'ALL' ||
    filters.state !== 'ALL'

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-2xs space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name, email, hospital name, registration number..."
            className="w-full pl-9 pr-9 py-2 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput('')
                setFilters({ search: '' })
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Dropdowns Row */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Hospital Type */}
          <div className="relative flex-1 sm:flex-initial min-w-[135px]">
            <Building className="size-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={filters.hospitalType}
              onChange={(e) => setFilters({ hospitalType: e.target.value })}
              className="w-full pl-8 pr-7 py-2 bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
            >
              {HOSPITAL_TYPES.map((type) => (
                <option key={type} value={type === 'All Types' ? 'ALL' : type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative flex-1 sm:flex-initial min-w-[125px]">
            <CheckCircle2 className="size-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={filters.status}
              onChange={(e) => setFilters({ status: e.target.value as any })}
              className="w-full pl-8 pr-7 py-2 bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="APPROVED">Verified</option>
              <option value="PENDING">Pending</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* State Filter */}
          <div className="relative flex-1 sm:flex-initial min-w-[125px]">
            <MapPin className="size-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={filters.state}
              onChange={(e) => setFilters({ state: e.target.value })}
              className="w-full pl-8 pr-7 py-2 bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
            >
              {STATES_LIST.map((state) => (
                <option key={state} value={state === 'All States' ? 'ALL' : state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Button */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70 rounded-xl transition-all cursor-pointer"
              title="Reset all filters"
            >
              <RotateCcw className="size-3.5" />
              <span>Reset</span>
            </button>
          )}

          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center p-0.5 bg-slate-100 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setFilters({ viewMode: 'table' })}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                filters.viewMode === 'table'
                  ? 'bg-white text-blue-600 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table view"
            >
              <LayoutList className="size-4" />
            </button>
            <button
              onClick={() => setFilters({ viewMode: 'grid' })}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                filters.viewMode === 'grid'
                  ? 'bg-white text-blue-600 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid cards view"
            >
              <LayoutGrid className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
