import type { FC } from 'react'
import { Search, RefreshCw, Calendar, Filter, X } from 'lucide-react'

interface DoctorAppointmentsHeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onRefresh: () => void
  isLoading: boolean
  totalCount: number
  selectedDate: string | null
  onClearDateFilter: () => void
}

export const DoctorAppointmentsHeader: FC<DoctorAppointmentsHeaderProps> = ({
  searchQuery,
  onSearchChange,
  onRefresh,
  isLoading,
  totalCount,
  selectedDate,
  onClearDateFilter,
}) => {
  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-2xs space-y-3.5 sm:space-y-4">
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-3">
        {/* Left Title & Status */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="size-10 sm:size-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
            <Calendar className="size-5 sm:size-6 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight truncate">
                Appointments Queue
              </h1>
              <span className="px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200/80 inline-flex items-center gap-1.5 shrink-0">
                <span className="size-1.5 sm:size-2 rounded-full bg-emerald-500 animate-pulse" />
                Live In-Clinic OPD
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate hidden sm:block mt-0.5">
              Real-time patient queue, clinical vitals, and offline consultation management
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {selectedDate && (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 sm:py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] sm:text-xs font-bold">
              <Filter className="size-3 text-amber-600" />
              <span>{selectedDate}</span>
              <button
                type="button"
                onClick={onClearDateFilter}
                className="hover:text-amber-700 p-0.5 rounded-full hover:bg-amber-100 cursor-pointer ml-0.5"
                title="Clear date filter"
              >
                <X className="size-3" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 sm:px-3.5 sm:py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-60 shrink-0"
            title="Refresh appointments"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
            <span className="hidden md:inline">Sync Queue</span>
          </button>
        </div>
      </div>

      {/* Interactive Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search patient, token (#APT-), or symptoms..."
          className="w-full pl-10 pr-16 sm:pr-24 py-2 sm:py-2.5 rounded-2xl bg-slate-50 border border-slate-200/90 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 transition-all outline-hidden"
        />
        {searchQuery ? (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
          >
            <X className="size-3.5" />
          </button>
        ) : (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] sm:text-xs font-bold text-slate-400">
            {totalCount} {totalCount === 1 ? 'record' : 'records'}
          </span>
        )}
      </div>
    </div>
  )
}
