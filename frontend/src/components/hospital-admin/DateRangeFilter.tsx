import { useState, useRef, useEffect, type FC } from 'react'
import { Calendar, ChevronDown, Check, ArrowRight, X, Sparkles } from 'lucide-react'
import {
  useHospitalAdminStore,
  type DateRangePreset,
} from '@/store/hospitalAdminStore'

const PRESET_OPTIONS: { id: DateRangePreset; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'last_7_days', label: 'Last 7 Days' },
  { id: 'last_30_days', label: 'Last 30 Days' },
  { id: 'this_month', label: 'This Month' },
  { id: 'last_month', label: 'Last Month' },
  { id: 'this_quarter', label: 'This Quarter' },
  { id: 'this_year', label: 'This Year' },
  { id: 'custom', label: 'Custom Range...' },
]

export const DateRangeFilter: FC = () => {
  const { dateFilter, setDateFilter, isLoading } = useHospitalAdminStore()
  const [isOpen, setIsOpen] = useState(false)
  const [customStart, setCustomStart] = useState(dateFilter.startDate)
  const [customEnd, setCustomEnd] = useState(dateFilter.endDate)
  const [isCustomMode, setIsCustomMode] = useState(dateFilter.preset === 'custom')
  const [customError, setCustomError] = useState<string | null>(null)

  const dropdownRef = useRef<HTMLDivElement>(null)

  // Sync custom inputs when dateFilter changes
  useEffect(() => {
    setCustomStart(dateFilter.startDate)
    setCustomEnd(dateFilter.endDate)
    setIsCustomMode(dateFilter.preset === 'custom')
  }, [dateFilter])

  // Close on outside click for desktop
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSelectPreset = async (preset: DateRangePreset) => {
    if (preset === 'custom') {
      setIsCustomMode(true)
      return
    }

    setIsCustomMode(false)
    setCustomError(null)
    setIsOpen(false)
    await setDateFilter(preset)
  }

  const handleApplyCustom = async () => {
    if (!customStart || !customEnd) {
      setCustomError('Please choose both start and end dates.')
      return
    }

    if (customEnd < customStart) {
      setCustomError('End date cannot be earlier than start date.')
      return
    }

    setCustomError(null)
    setIsOpen(false)
    await setDateFilter('custom', customStart, customEnd)
  }

  return (
    <div className="relative inline-block w-full sm:w-auto" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={isLoading}
        className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl text-xs sm:text-sm font-bold text-slate-700 shadow-2xs cursor-pointer transition-all disabled:opacity-60 active:scale-95"
        title="Filter dashboard metrics by date range"
        aria-label="Filter dashboard metrics by date range"
      >
        <div className="flex items-center gap-2 truncate">
          <Calendar className="size-4 text-blue-600 shrink-0" />
          <span className="font-extrabold text-slate-900 truncate">{dateFilter.label}</span>
        </div>
        <ChevronDown
          className={`size-3.5 text-slate-400 shrink-0 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Modal Backdrop on Mobile (< sm) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 sm:hidden animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Dropdown Panel / Mobile Bottom Sheet */}
      {isOpen && (
        <div
          className="fixed bottom-0 inset-x-0 z-50 bg-white rounded-t-3xl border-t border-slate-200 shadow-2xl p-4.5 pb-24 max-h-[88vh] overflow-y-auto sm:static sm:absolute sm:right-0 sm:bottom-auto sm:inset-x-auto sm:mt-2 sm:w-80 sm:rounded-2xl sm:p-2 sm:pb-2 sm:border sm:shadow-2xl sm:max-h-none sm:z-30 animate-in slide-in-from-bottom sm:slide-in-from-top-2 sm:zoom-in-95 duration-200"
        >
          {/* Mobile Drag Indicator */}
          <div className="sm:hidden w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-3.5" />

          {/* Header */}
          <div className="px-1.5 sm:px-2.5 py-1.5 border-b border-slate-100 flex items-center justify-between mb-2 sm:mb-1">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-[11px] font-black uppercase tracking-wider text-slate-800 sm:text-slate-400">
                Time Horizon
              </span>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <Sparkles className="size-2.5 text-blue-600" />
                Live DB
              </span>
            </div>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="sm:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Presets List / Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-1 gap-1.5 sm:gap-0.5 sm:py-1">
            {PRESET_OPTIONS.map((opt) => {
              const isSelected = dateFilter.preset === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectPreset(opt.id)}
                  className={`w-full text-left px-3 py-2.5 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between border sm:border-0 ${
                    isSelected
                      ? 'bg-blue-50 text-blue-700 font-extrabold border-blue-200 sm:border-0'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 border-slate-200/70 sm:border-0'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check className="size-3.5 text-blue-600 stroke-[3] shrink-0" />}
                </button>
              )
            })}
          </div>

          {/* Custom Date Inputs Section */}
          {isCustomMode && (
            <div className="mt-3 pt-3 border-t border-slate-100 px-1 space-y-2.5 bg-slate-50/80 p-3 rounded-2xl">
              <span className="text-xs font-extrabold text-slate-800 block">
                Custom Date Range
              </span>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">From Date</label>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">To Date</label>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                  />
                </div>
              </div>

              {customError && (
                <p className="text-[11px] font-semibold text-rose-600 leading-tight">
                  {customError}
                </p>
              )}

              <button
                type="button"
                onClick={handleApplyCustom}
                className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
              >
                <span>Apply Date Range</span>
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default DateRangeFilter
