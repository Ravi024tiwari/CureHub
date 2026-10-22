import { useState, type FC, type KeyboardEvent } from 'react'
import { Stethoscope, Plus, X, Sparkles } from 'lucide-react'

export const POPULAR_DEPARTMENTS = [
  'General Medicine',
  'Cardiology',
  'Neurology',
  'Orthopedics',
  'Pediatrics',
  'Gynecology & Obstetrics',
  'Oncology',
  'Dermatology',
  'Nephrology',
  'ENT (Ear, Nose, Throat)',
  'Ophthalmology',
  'Urology',
  'Pulmonology',
  'Gastroenterology',
  'Psychiatry',
  'Dental Surgery',
]

interface DepartmentsCardProps {
  departments: string[]
  onChange: (departments: string[]) => void
  error?: string
}

export const DepartmentsCard: FC<DepartmentsCardProps> = ({
  departments,
  onChange,
  error,
}) => {
  const [inputValue, setInputValue] = useState('')

  const addDepartment = (dept: string) => {
    const trimmed = dept.trim()
    if (!trimmed) return
    if (!departments.some((d) => d.toLowerCase() === trimmed.toLowerCase())) {
      onChange([...departments, trimmed])
    }
    setInputValue('')
  }

  const removeDepartment = (deptToRemove: string) => {
    onChange(departments.filter((d) => d !== deptToRemove))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addDepartment(inputValue)
    }
  }

  const availableSuggestions = POPULAR_DEPARTMENTS.filter(
    (dept) => !departments.some((d) => d.toLowerCase() === dept.toLowerCase())
  )

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-all">
      {/* Header */}
      <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-slate-100">
        <div className="size-11 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0 shadow-xs ring-1 ring-violet-500/10">
          <Stethoscope className="size-5.5 stroke-[2.2]" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            Departments
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Select departments available in your hospital.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Input box to add custom department */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Select or add departments <span className="text-rose-500">*</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type department name and press Enter..."
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-white focus:bg-white text-xs sm:text-sm font-medium transition-all outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
            <button
              type="button"
              onClick={() => addDepartment(inputValue)}
              disabled={!inputValue.trim()}
              className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shadow-2xs"
            >
              <Plus className="size-4 stroke-[2.5]" />
              <span>Add</span>
            </button>
          </div>
          {error && <p className="text-[11px] font-semibold text-rose-500 mt-1">{error}</p>}
        </div>

        {/* Selected Department Badges matching mockup */}
        <div className="flex flex-wrap gap-2 min-h-10 p-2.5 rounded-2xl border border-slate-100 bg-slate-50/50">
          {departments.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-1 px-1">
              No departments added yet. Choose from quick recommendations below.
            </p>
          ) : (
            departments.map((dept) => (
              <span
                key={dept}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-violet-50 text-violet-700 border border-violet-200/80 shadow-2xs animate-in zoom-in-95 duration-150"
              >
                <span>{dept}</span>
                <button
                  type="button"
                  onClick={() => removeDepartment(dept)}
                  className="size-4 rounded-full hover:bg-violet-200/80 flex items-center justify-center transition-colors cursor-pointer text-violet-600 hover:text-violet-900"
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
              <Sparkles className="size-3 text-violet-500" />
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Popular Specialities:
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {availableSuggestions.slice(0, 10).map((dept) => (
                <button
                  key={dept}
                  type="button"
                  onClick={() => addDepartment(dept)}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-violet-50 hover:border-violet-300 text-slate-600 hover:text-violet-700 text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 group shadow-3xs"
                >
                  <Plus className="size-3 text-slate-400 group-hover:text-violet-600" />
                  <span>{dept}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
export default DepartmentsCard
