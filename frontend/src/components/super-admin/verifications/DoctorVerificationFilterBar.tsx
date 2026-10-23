import { useState, useRef, useEffect, type FC } from 'react'
import { Search, ChevronDown, RotateCcw, Building, Stethoscope, Calendar, Filter } from 'lucide-react'
import { useDoctorVerificationStore } from '@/store/doctorVerificationStore'

export const DoctorVerificationFilterBar: FC = () => {
  const { filters, setFilters, resetFilters, hospitals, specializations } =
    useDoctorVerificationStore()

  const [searchInput, setSearchInput] = useState(filters.search)
  const [isStatusOpen, setIsStatusOpen] = useState(false)
  const [isHospitalOpen, setIsHospitalOpen] = useState(false)
  const [isSpecOpen, setIsSpecOpen] = useState(false)
  const [isDateOpen, setIsDateOpen] = useState(false)

  const statusRef = useRef<HTMLDivElement>(null)
  const hospitalRef = useRef<HTMLDivElement>(null)
  const specRef = useRef<HTMLDivElement>(null)
  const dateRef = useRef<HTMLDivElement>(null)

  // Debounced search sync
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        setFilters({ search: searchInput })
      }
    }, 350)
    return () => clearTimeout(timer)
  }, [searchInput, filters.search, setFilters])

  // Sync external filter resets
  useEffect(() => {
    setSearchInput(filters.search)
  }, [filters.search])

  // Click outside listener
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setIsStatusOpen(false)
      }
      if (hospitalRef.current && !hospitalRef.current.contains(e.target as Node)) {
        setIsHospitalOpen(false)
      }
      if (specRef.current && !specRef.current.contains(e.target as Node)) {
        setIsSpecOpen(false)
      }
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) {
        setIsDateOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  const statusLabels: Record<string, string> = {
    PENDING: 'Pending',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    ALL: 'All Statuses',
  }

  const dateLabels: Record<string, string> = {
    all: 'All Time',
    today: 'Today',
    week: 'This Week',
    month: 'This Month',
  }

  const selectedHospitalName =
    filters.hospitalId === 'ALL'
      ? 'All Hospitals'
      : hospitals.find((h) => h._id === filters.hospitalId)?.name || 'Selected Hospital'

  const selectedSpecName =
    filters.specialization === 'ALL' ? 'All Specializations' : filters.specialization

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-2xs space-y-3">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5 sm:gap-3">
        {/* Search Input matching mockup */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name, email, hospital, registration no..."
            className="w-full pl-9.5 pr-4 py-2 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-blue-500 rounded-xl text-xs sm:text-sm font-medium placeholder:text-slate-400 outline-none transition-all shadow-2xs focus:ring-3 focus:ring-blue-100"
          />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput('')
                setFilters({ search: '' })
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              Clear
            </button>
          )}
        </div>

        {/* Dropdowns Row */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Status Dropdown */}
          <div className="relative shrink-0 flex-1 sm:flex-none" ref={statusRef}>
            <button
              type="button"
              onClick={() => setIsStatusOpen((p) => !p)}
              className="w-full flex items-center justify-between gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-1.5">
                <Filter className="size-3 text-slate-400" />
                <span className="text-slate-400 font-semibold">Status:</span>
                <span className="text-blue-700 font-bold">{statusLabels[filters.status]}</span>
              </div>
              <ChevronDown className={`size-3 text-slate-400 transition-transform ${isStatusOpen ? 'rotate-180 text-blue-600' : ''}`} />
            </button>

            {isStatusOpen && (
              <div className="absolute left-0 sm:right-0 mt-1.5 w-40 bg-white border border-slate-200 rounded-xl shadow-xl p-1 z-30 animate-in fade-in zoom-in-95 duration-150">
                {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map((st) => (
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

          {/* Hospital Dropdown */}
          <div className="relative shrink-0 flex-1 sm:flex-none max-w-[170px]" ref={hospitalRef}>
            <button
              type="button"
              onClick={() => setIsHospitalOpen((p) => !p)}
              className="w-full flex items-center justify-between gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-2xs truncate"
            >
              <div className="flex items-center gap-1.5 truncate">
                <Building className="size-3 text-slate-400 shrink-0" />
                <span className="text-slate-400 font-semibold shrink-0">Hospital:</span>
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

          {/* Specialization Dropdown */}
          <div className="relative shrink-0 flex-1 sm:flex-none max-w-[170px]" ref={specRef}>
            <button
              type="button"
              onClick={() => setIsSpecOpen((p) => !p)}
              className="w-full flex items-center justify-between gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-2xs truncate"
            >
              <div className="flex items-center gap-1.5 truncate">
                <Stethoscope className="size-3 text-slate-400 shrink-0" />
                <span className="truncate">{selectedSpecName}</span>
              </div>
              <ChevronDown className={`size-3 text-slate-400 shrink-0 transition-transform ${isSpecOpen ? 'rotate-180 text-blue-600' : ''}`} />
            </button>

            {isSpecOpen && (
              <div className="absolute left-0 mt-1.5 w-52 max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl p-1 z-30 animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={() => {
                    setFilters({ specialization: 'ALL' })
                    setIsSpecOpen(false)
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    filters.specialization === 'ALL'
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  All Specializations
                </button>
                {specializations.map((spec) => (
                  <button
                    key={spec}
                    onClick={() => {
                      setFilters({ specialization: spec })
                      setIsSpecOpen(false)
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold truncate cursor-pointer ${
                      filters.specialization === spec
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Applied Date Dropdown */}
          <div className="relative shrink-0 flex-1 sm:flex-none" ref={dateRef}>
            <button
              type="button"
              onClick={() => setIsDateOpen((p) => !p)}
              className="w-full flex items-center justify-between gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-1.5">
                <Calendar className="size-3 text-slate-400" />
                <span className="text-slate-400 font-semibold">Applied:</span>
                <span>{dateLabels[filters.dateFilter]}</span>
              </div>
              <ChevronDown className={`size-3 text-slate-400 transition-transform ${isDateOpen ? 'rotate-180 text-blue-600' : ''}`} />
            </button>

            {isDateOpen && (
              <div className="absolute right-0 mt-1.5 w-36 bg-white border border-slate-200 rounded-xl shadow-xl p-1 z-30 animate-in fade-in zoom-in-95 duration-150">
                {(['all', 'today', 'week', 'month'] as const).map((df) => (
                  <button
                    key={df}
                    onClick={() => {
                      setFilters({ dateFilter: df })
                      setIsDateOpen(false)
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                      filters.dateFilter === df
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {dateLabels[df]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reset Button matching mockup */}
          <button
            type="button"
            onClick={resetFilters}
            className="flex items-center gap-1 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 transition-all cursor-pointer shadow-2xs shrink-0"
            title="Reset All Filters"
          >
            <RotateCcw className="size-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default DoctorVerificationFilterBar
