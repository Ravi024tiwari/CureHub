import { useState, type FC } from 'react'
import { X, ChevronDown } from 'lucide-react'
import { useHospitalBranchesStore } from '@/store/hospitalBranchesStore'

export const MobileFilterDrawer: FC = () => {
  const {
    filters,
    setFilter,
    resetFilters,
    isMobileFiltersOpen,
    setIsMobileFiltersOpen,
    hospitals,
  } = useHospitalBranchesStore()

  // Local state before apply
  const [localActiveStatus, setLocalActiveStatus] = useState(filters.activeStatus)
  const [localType, setLocalType] = useState(filters.hospitalType)
  const [localCity, setLocalCity] = useState(filters.city)

  if (!isMobileFiltersOpen) return null

  const uniqueCities = Array.from(
    new Set([
      'Bilaspur',
      'Raipur',
      'Durg',
      'Delhi NCR',
      ...hospitals.map((h) => h.address?.city).filter(Boolean),
    ])
  )

  const handleApply = () => {
    setFilter('activeStatus', localActiveStatus)
    setFilter('hospitalType', localType)
    setFilter('city', localCity)
    setIsMobileFiltersOpen(false)
  }

  const handleClearAll = () => {
    setLocalActiveStatus('ALL')
    setLocalType('ALL')
    setLocalCity('ALL')
    resetFilters()
    setIsMobileFiltersOpen(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-md w-full max-h-[85vh] overflow-hidden flex flex-col border border-slate-200 animate-in slide-in-from-bottom-8 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-slate-900 tracking-tight">Filters</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleClearAll}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={() => setIsMobileFiltersOpen(false)}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Content matching mobile mockup */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Active Status */}
          <div>
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2.5">
              Active Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'All', value: 'ALL' },
                { label: 'Active', value: 'true' },
                { label: 'Inactive', value: 'false' },
              ].map((item) => (
                <button
                  key={item.value}
                  onClick={() => setLocalActiveStatus(item.value)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                    localActiveStatus === item.value
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Hospital Type */}
          <div>
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
              Hospital Type
            </label>
            <div className="relative">
              <select
                value={localType}
                onChange={(e) => setLocalType(e.target.value)}
                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-semibold text-slate-800 cursor-pointer focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Types</option>
                <option value="Multi-Speciality">Multi-Speciality</option>
                <option value="Super-Speciality">Super-Speciality</option>
                <option value="General Hospital">General Hospital</option>
                <option value="Maternity & Women Care">Maternity & Women Care</option>
                <option value="Clinic">Clinic</option>
              </select>
              <ChevronDown className="size-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 4. City */}
          <div>
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
              City
            </label>
            <div className="relative">
              <select
                value={localCity}
                onChange={(e) => setLocalCity(e.target.value)}
                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-semibold text-slate-800 cursor-pointer focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Cities</option>
                {uniqueCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              <ChevronDown className="size-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Footer Apply Button */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={handleApply}
            className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-[0.99]"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  )
}
export default MobileFilterDrawer
