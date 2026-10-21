import { useState, type FC } from 'react'
import { X, Filter } from 'lucide-react'
import {
  useMedicalRecordsStore,
  type SortOrderOption,
} from '@/store/medicalRecordsStore'

export const RecordFiltersDrawer: FC = () => {
  const {
    isFilterModalOpen,
    closeFilterModal,
    activeCategory,
    setActiveCategory,
    sortBy,
    setSortBy,
    dateRange,
    setDateRange,
    clearFilters,
  } = useMedicalRecordsStore()

  const [tempCategory, setTempCategory] = useState(activeCategory)
  const [tempSortBy, setTempSortBy] = useState<SortOrderOption>(sortBy)
  const [tempFromDate, setTempFromDate] = useState(dateRange.from || '')
  const [tempToDate, setTempToDate] = useState(dateRange.to || '')

  if (!isFilterModalOpen) return null

  const categories = [
    'All Reports',
    'Lab Report',
    'Imaging',
    'Prescription',
    'Others',
  ]

  const sortOptions: { id: SortOrderOption; label: string }[] = [
    { id: 'newest', label: 'Newest First' },
    { id: 'oldest', label: 'Oldest First' },
    { id: 'name-asc', label: 'File Name (A-Z)' },
    { id: 'name-desc', label: 'File Name (Z-A)' },
  ]

  const handleApply = () => {
    setActiveCategory(tempCategory)
    setSortBy(tempSortBy)
    setDateRange({
      from: tempFromDate || undefined,
      to: tempToDate || undefined,
    })
    closeFilterModal()
  }

  const handleClear = () => {
    setTempCategory('All Reports')
    setTempSortBy('newest')
    setTempFromDate('')
    setTempToDate('')
    clearFilters()
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div>
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="size-4.5 text-blue-600" />
              <h3 className="text-base font-extrabold text-slate-900">Filters</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClear}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={closeFilterModal}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>

          {/* Filter Body */}
          <div className="p-5 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)]">
            {/* Category Pills */}
            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2.5">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const isSelected = tempCategory === cat
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setTempCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2.5">
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">From Date</span>
                  <input
                    type="date"
                    value={tempFromDate}
                    onChange={(e) => setTempFromDate(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">To Date</span>
                  <input
                    type="date"
                    value={tempToDate}
                    onChange={(e) => setTempToDate(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Sort By Radio Group */}
            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2.5">
                Sort By
              </label>
              <div className="space-y-2">
                {sortOptions.map((opt) => (
                  <label
                    key={opt.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="radio"
                      name="sortOption"
                      checked={tempSortBy === opt.id}
                      onChange={() => setTempSortBy(opt.id)}
                      className="size-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <span className="text-xs font-semibold text-slate-800">
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Apply Button */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <button
            type="button"
            onClick={handleApply}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs transition-all shadow-md shadow-blue-600/20 cursor-pointer"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  )
}
