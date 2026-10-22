import { useState, type FC, type KeyboardEvent } from 'react'
import { Sparkles, Plus, X, ShieldCheck } from 'lucide-react'

export const POPULAR_FACILITIES = [
  '24x7 Emergency',
  'Pharmacy',
  'Lab',
  'Ambulance',
  'ICU (Intensive Care Unit)',
  'Pathology',
  'Blood Bank',
  'NICU',
  'Dialysis Unit',
  'Radiology & MRI',
  'Ultrasound 4D',
  'Modular Operation Theaters',
  'Cafeteria',
  'Wheelchair Accessible',
  'Valet Parking',
  'In-House Chemist',
]

interface FacilitiesCardProps {
  facilities: string[]
  onChange: (facilities: string[]) => void
  error?: string
}

export const FacilitiesCard: FC<FacilitiesCardProps> = ({ facilities, onChange, error }) => {
  const [inputValue, setInputValue] = useState('')

  const addFacility = (fac: string) => {
    const trimmed = fac.trim()
    if (!trimmed) return
    if (!facilities.some((f) => f.toLowerCase() === trimmed.toLowerCase())) {
      onChange([...facilities, trimmed])
    }
    setInputValue('')
  }

  const removeFacility = (facToRemove: string) => {
    onChange(facilities.filter((f) => f !== facToRemove))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addFacility(inputValue)
    }
  }

  const availableSuggestions = POPULAR_FACILITIES.filter(
    (fac) => !facilities.some((f) => f.toLowerCase() === fac.toLowerCase())
  )

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-all">
      {/* Header */}
      <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-slate-100">
        <div className="size-11 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 shadow-xs ring-1 ring-teal-500/10">
          <ShieldCheck className="size-5.5 stroke-[2.2]" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            Facilities
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Select facilities available in your hospital.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Input box to add custom facility */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Select or add facilities <span className="text-rose-500">*</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type facility name and press Enter..."
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-white focus:bg-white text-xs sm:text-sm font-medium transition-all outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
            <button
              type="button"
              onClick={() => addFacility(inputValue)}
              disabled={!inputValue.trim()}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shadow-2xs"
            >
              <Plus className="size-4 stroke-[2.5]" />
              <span>Add</span>
            </button>
          </div>
          {error && <p className="text-[11px] font-semibold text-rose-500 mt-1">{error}</p>}
        </div>

        {/* Selected Facility Badges matching mockup */}
        <div className="flex flex-wrap gap-2 min-h-10 p-2.5 rounded-2xl border border-slate-100 bg-slate-50/50">
          {facilities.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-1 px-1">
              No facilities added yet. Choose from quick recommendations below.
            </p>
          ) : (
            facilities.map((fac) => (
              <span
                key={fac}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200/80 shadow-2xs animate-in zoom-in-95 duration-150"
              >
                <span>{fac}</span>
                <button
                  type="button"
                  onClick={() => removeFacility(fac)}
                  className="size-4 rounded-full hover:bg-teal-200/80 flex items-center justify-center transition-colors cursor-pointer text-teal-600 hover:text-teal-900"
                >
                  <X className="size-3 stroke-[2.5]" />
                </button>
              </span>
            ))
          )}
        </div>

        {/* Suggested Quick Picks */}
        {availableSuggestions.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="size-3 text-teal-500" />
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Popular Hospital Facilities:
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {availableSuggestions.slice(0, 10).map((fac) => (
                <button
                  key={fac}
                  type="button"
                  onClick={() => addFacility(fac)}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-teal-50 hover:border-teal-300 text-slate-600 hover:text-teal-700 text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 group shadow-3xs"
                >
                  <Plus className="size-3 text-slate-400 group-hover:text-teal-600" />
                  <span>{fac}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
export default FacilitiesCard
