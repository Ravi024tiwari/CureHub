import { useState, useRef, useEffect, type FC } from 'react'
import {
  Search,
  ChevronDown,
  RotateCcw,
  Building,
  Stethoscope,
  Filter,
  LayoutGrid,
  Table as TableIcon,
  ShieldAlert,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { useAdminDoctorsStore } from '@/store/adminDoctorsStore'

export const AdminDoctorsFilterBar: FC = () => {
  const { filters, setFilters, resetFilters, hospitals, departments, stats } = useAdminDoctorsStore()

  const [searchInput, setSearchInput] = useState(filters.search)
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)

  const [isStatusOpen, setIsStatusOpen] = useState(false)
  const [isAccountOpen, setIsAccountOpen] = useState(false)
  const [isHospitalOpen, setIsHospitalOpen] = useState(false)
  const [isDeptOpen, setIsDeptOpen] = useState(false)
  const [isSortOpen, setIsSortOpen] = useState(false)

  const statusRef = useRef<HTMLDivElement>(null)
  const accountRef = useRef<HTMLDivElement>(null)
  const hospitalRef = useRef<HTMLDivElement>(null)
  const deptRef = useRef<HTMLDivElement>(null)
  const sortRef = useRef<HTMLDivElement>(null)

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        setFilters({ search: searchInput })
      }
    }, 350)
    return () => clearTimeout(timer)
  }, [searchInput, filters.search, setFilters])

  useEffect(() => {
    setSearchInput(filters.search)
  }, [filters.search])

  // Click outside to close dropdowns
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) setIsStatusOpen(false)
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setIsAccountOpen(false)
      if (hospitalRef.current && !hospitalRef.current.contains(e.target as Node)) setIsHospitalOpen(false)
      if (deptRef.current && !deptRef.current.contains(e.target as Node)) setIsDeptOpen(false)
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setIsSortOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  const statusLabels: Record<string, string> = {
    ALL: 'All Statuses',
    APPROVED: 'Approved',
    PENDING: 'Pending',
    SUSPENDED: 'Suspended',
    REJECTED: 'Rejected',
  }

  const accountLabels: Record<string, string> = {
    all: 'All Accounts',
    active: 'Active Only',
    inactive: 'Disabled Only',
  }

  const sortLabels: Record<string, string> = {
    newest: 'Newest First',
    oldest: 'Oldest First',
    experience_desc: 'Most Experienced',
    rating_desc: 'Highest Rated',
    fee_desc: 'Fee: High to Low',
    fee_asc: 'Fee: Low to High',
  }

  const selectedHospitalName =
    filters.hospitalId === 'ALL'
      ? 'All Hospitals'
      : hospitals.find((h) => h._id === filters.hospitalId)?.name || 'Selected Hospital'

  // Count active filters (excluding default values)
  const activeFiltersCount =
    (filters.search ? 1 : 0) +
    (filters.accountStatus !== 'all' ? 1 : 0) +
    (filters.status !== 'ALL' ? 1 : 0) +
    (filters.hospitalId !== 'ALL' ? 1 : 0) +
    (filters.department !== 'ALL' ? 1 : 0) +
    (filters.sortBy !== 'newest' ? 1 : 0)

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-2xs space-y-3">
      {/* 1. Top Row: Search Input + View Mode + Mobile Filters Toggle */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search Box */}
        <div className="relative flex-1 min-w-0">
          <Search className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search doctor by name, email, phone, or council..."
            className="w-full pl-9 pr-8 py-2 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-blue-500 rounded-xl text-xs sm:text-sm font-medium placeholder:text-slate-400 outline-none transition-all shadow-2xs focus:ring-3 focus:ring-blue-100"
          />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput('')
                setFilters({ search: '' })
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Mobile Filter Toggle Button (Shown on mobile & tablet < xl) */}
        <button
          type="button"
          onClick={() => setIsMobileFiltersOpen((prev) => !prev)}
          className={`xl:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer shrink-0 shadow-2xs ${
            isMobileFiltersOpen || activeFiltersCount > 0
              ? 'bg-blue-50 border-blue-200 text-blue-700'
              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
          }`}
        >
          <SlidersHorizontal className="size-3.5" />
          <span className="hidden sm:inline">Filters</span>
          {activeFiltersCount > 0 && (
            <span className="size-4.5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {/* View Mode Toggle: Grid vs Table */}
        <div className="flex items-center p-0.5 bg-slate-100 rounded-xl border border-slate-200/80 shrink-0">
          <button
            type="button"
            onClick={() => setFilters({ viewMode: 'grid' })}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              filters.viewMode === 'grid'
                ? 'bg-white text-blue-600 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Grid Cards View"
          >
            <LayoutGrid className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setFilters({ viewMode: 'table' })}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              filters.viewMode === 'table'
                ? 'bg-white text-blue-600 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Data Table View"
          >
            <TableIcon className="size-3.5" />
          </button>
        </div>

        {/* Reset button (visible on top row for quick reset) */}
        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={resetFilters}
            className="hidden sm:flex items-center gap-1 px-2.5 py-2 bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200/80 hover:border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
            title="Reset All Filters"
          >
            <RotateCcw className="size-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* 2. Interactive Quick Status Pills Bar */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
        <span className="text-[11px] font-bold text-slate-400 shrink-0 hidden sm:inline mr-1">
          Quick Filter:
        </span>

        {/* All Doctors */}
        <button
          type="button"
          onClick={() => setFilters({ status: 'ALL', accountStatus: 'all' })}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border ${
            filters.status === 'ALL' && filters.accountStatus === 'all'
              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200/80'
          }`}
        >
          <span>All</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
              filters.status === 'ALL' && filters.accountStatus === 'all'
                ? 'bg-white/20 text-white'
                : 'bg-slate-200/80 text-slate-600'
            }`}
          >
            {stats.total}
          </span>
        </button>

        {/* Active Doctors */}
        <button
          type="button"
          onClick={() => setFilters({ accountStatus: 'active', status: 'ALL' })}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border ${
            filters.accountStatus === 'active'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200/80'
          }`}
        >
          <span className="size-1.5 rounded-full bg-emerald-400" />
          <span>Active</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
              filters.accountStatus === 'active'
                ? 'bg-white/20 text-white'
                : 'bg-slate-200/80 text-slate-600'
            }`}
          >
            {stats.active}
          </span>
        </button>

        {/* Disabled Doctors */}
        <button
          type="button"
          onClick={() => setFilters({ accountStatus: 'inactive', status: 'ALL' })}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border ${
            filters.accountStatus === 'inactive'
              ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200/80'
          }`}
        >
          <span className="size-1.5 rounded-full bg-rose-400" />
          <span>Disabled</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
              filters.accountStatus === 'inactive'
                ? 'bg-white/20 text-white'
                : 'bg-slate-200/80 text-slate-600'
            }`}
          >
            {stats.disabled}
          </span>
        </button>

        {/* Pending Review */}
        <button
          type="button"
          onClick={() => setFilters({ status: 'PENDING', accountStatus: 'all' })}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border ${
            filters.status === 'PENDING'
              ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200/80'
          }`}
        >
          <span className="size-1.5 rounded-full bg-amber-300" />
          <span>Pending Review</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
              filters.status === 'PENDING'
                ? 'bg-white/20 text-white'
                : 'bg-slate-200/80 text-slate-600'
            }`}
          >
            {stats.pending}
          </span>
        </button>
      </div>

      {/* 3. Detailed Filters Row (Desktop: always visible, Mobile: expandable) */}
      <div
        className={`${
          isMobileFiltersOpen ? 'flex' : 'hidden xl:flex'
        } flex-wrap items-center gap-2 pt-2 border-t border-slate-100`}
      >
        {/* Account State Dropdown */}
        <div className="relative shrink-0 flex-1 sm:flex-none min-w-[140px]" ref={accountRef}>
          <button
            type="button"
            onClick={() => setIsAccountOpen((p) => !p)}
            className={`w-full flex items-center justify-between gap-1.5 px-3 py-1.5 border rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
              filters.accountStatus !== 'all'
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200/80 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-1.5 truncate">
              <ShieldAlert className="size-3 text-slate-400 shrink-0" />
              <span className="truncate">{accountLabels[filters.accountStatus]}</span>
            </div>
            <ChevronDown className={`size-3 text-slate-400 shrink-0 transition-transform ${isAccountOpen ? 'rotate-180 text-blue-600' : ''}`} />
          </button>

          {isAccountOpen && (
            <div className="absolute left-0 mt-1.5 w-40 bg-white border border-slate-200 rounded-xl shadow-xl p-1 z-30 animate-in fade-in zoom-in-95 duration-150">
              {(['all', 'active', 'inactive'] as const).map((acc) => (
                <button
                  key={acc}
                  onClick={() => {
                    setFilters({ accountStatus: acc })
                    setIsAccountOpen(false)
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    filters.accountStatus === acc
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {accountLabels[acc]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Verification Status Dropdown */}
        <div className="relative shrink-0 flex-1 sm:flex-none min-w-[140px]" ref={statusRef}>
          <button
            type="button"
            onClick={() => setIsStatusOpen((p) => !p)}
            className={`w-full flex items-center justify-between gap-1.5 px-3 py-1.5 border rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
              filters.status !== 'ALL'
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200/80 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-1.5 truncate">
              <Filter className="size-3 text-slate-400 shrink-0" />
              <span className="truncate">{statusLabels[filters.status]}</span>
            </div>
            <ChevronDown className={`size-3 text-slate-400 shrink-0 transition-transform ${isStatusOpen ? 'rotate-180 text-blue-600' : ''}`} />
          </button>

          {isStatusOpen && (
            <div className="absolute left-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-xl shadow-xl p-1 z-30 animate-in fade-in zoom-in-95 duration-150">
              {(['ALL', 'APPROVED', 'PENDING', 'SUSPENDED', 'REJECTED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    setFilters({ status: st })
                    setIsStatusOpen(false)
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    filters.status === st
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {statusLabels[st]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Hospital Affiliation Dropdown */}
        <div className="relative shrink-0 flex-1 sm:flex-none min-w-[150px] max-w-[200px]" ref={hospitalRef}>
          <button
            type="button"
            onClick={() => setIsHospitalOpen((p) => !p)}
            className={`w-full flex items-center justify-between gap-1.5 px-3 py-1.5 border rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs truncate ${
              filters.hospitalId !== 'ALL'
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200/80 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-1.5 truncate">
              <Building className="size-3 text-slate-400 shrink-0" />
              <span className="truncate">{selectedHospitalName}</span>
            </div>
            <ChevronDown className={`size-3 text-slate-400 shrink-0 transition-transform ${isHospitalOpen ? 'rotate-180 text-blue-600' : ''}`} />
          </button>

          {isHospitalOpen && (
            <div className="absolute left-0 mt-1.5 w-60 max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl p-1 z-30 animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() => {
                  setFilters({ hospitalId: 'ALL' })
                  setIsHospitalOpen(false)
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  filters.hospitalId === 'ALL'
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                All Hospitals
              </button>
              {hospitals.map((h) => (
                <button
                  key={h._id}
                  onClick={() => {
                    setFilters({ hospitalId: h._id })
                    setIsHospitalOpen(false)
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold truncate cursor-pointer ${
                    filters.hospitalId === h._id
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {h.name} {h.city ? `(${h.city})` : ''}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Department Dropdown */}
        <div className="relative shrink-0 flex-1 sm:flex-none min-w-[140px] max-w-[180px]" ref={deptRef}>
          <button
            type="button"
            onClick={() => setIsDeptOpen((p) => !p)}
            className={`w-full flex items-center justify-between gap-1.5 px-3 py-1.5 border rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs truncate ${
              filters.department !== 'ALL'
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200/80 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-1.5 truncate">
              <Stethoscope className="size-3 text-slate-400 shrink-0" />
              <span className="truncate">{filters.department === 'ALL' ? 'All Depts' : filters.department}</span>
            </div>
            <ChevronDown className={`size-3 text-slate-400 shrink-0 transition-transform ${isDeptOpen ? 'rotate-180 text-blue-600' : ''}`} />
          </button>

          {isDeptOpen && (
            <div className="absolute left-0 mt-1.5 w-48 max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl p-1 z-30 animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() => {
                  setFilters({ department: 'ALL' })
                  setIsDeptOpen(false)
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  filters.department === 'ALL'
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                All Departments
              </button>
              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => {
                    setFilters({ department: dept })
                    setIsDeptOpen(false)
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold truncate cursor-pointer ${
                    filters.department === dept
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="relative shrink-0 flex-1 sm:flex-none min-w-[140px]" ref={sortRef}>
          <button
            type="button"
            onClick={() => setIsSortOpen((p) => !p)}
            className="w-full flex items-center justify-between gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-2xs"
          >
            <span className="truncate">{sortLabels[filters.sortBy]}</span>
            <ChevronDown className={`size-3 text-slate-400 shrink-0 transition-transform ${isSortOpen ? 'rotate-180 text-blue-600' : ''}`} />
          </button>

          {isSortOpen && (
            <div className="absolute right-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-xl shadow-xl p-1 z-30 animate-in fade-in zoom-in-95 duration-150">
              {(['newest', 'oldest', 'experience_desc', 'rating_desc', 'fee_desc', 'fee_asc'] as const).map(
                (sb) => (
                  <button
                    key={sb}
                    onClick={() => {
                      setFilters({ sortBy: sb })
                      setIsSortOpen(false)
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                      filters.sortBy === sb
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {sortLabels[sb]}
                  </button>
                )
              )}
            </div>
          )}
        </div>

        {/* Reset Filters (shown in expanded section on mobile) */}
        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={resetFilters}
            className="flex sm:hidden items-center justify-center gap-1.5 w-full py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold cursor-pointer"
          >
            <RotateCcw className="size-3" />
            <span>Reset All Filters</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default AdminDoctorsFilterBar
