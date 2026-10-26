import { type FC, useState } from 'react'
import { GraduationCap, Plus, X, Sparkles, Info } from 'lucide-react'

interface HospitalAdminQualificationsSectionProps {
  qualifications: string[]
  onChange: (qualifications: string[]) => void
}

const COMMON_QUALIFICATIONS = [
  'MBA - Hospital Administration',
  'MHA (Master of Hospital Administration)',
  'BBA - Healthcare Management',
  'Diploma in Healthcare Management',
  'Post Graduate Diploma in Hospital Management (PGDHM)',
  'MBBS',
  'Master of Public Health (MPH)',
]

export const HospitalAdminQualificationsSection: FC<HospitalAdminQualificationsSectionProps> = ({
  qualifications,
  onChange,
}) => {
  const [inputValue, setInputValue] = useState('')

  const handleAdd = () => {
    const trimmed = inputValue.trim()
    if (!trimmed) return
    if (!qualifications.includes(trimmed)) {
      onChange([...qualifications, trimmed])
    }
    setInputValue('')
  }

  const handleRemove = (qual: string) => {
    onChange(qualifications.filter((q) => q !== qual))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd()
    }
  }

  const handleQuickAdd = (qual: string) => {
    if (!qualifications.includes(qual)) {
      onChange([...qualifications, qual])
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-7 shadow-xs">
      <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
          <GraduationCap className="w-4.5 h-4.5" />
        </div>
        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Qualifications <span className="text-slate-400 font-normal">(Optional)</span>
          </h2>
          <span className="text-slate-400" title="Degrees, diplomas, and healthcare administrative certifications">
            <Info className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {/* Input with Add button */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add a qualification (e.g. BBA, MBA, Hospital Administration)"
              className="w-full px-3.5 py-2.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!inputValue.trim()}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm shadow-blue-500/20 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>

        {/* Selected Qualification Chips matching screenshot */}
        {qualifications.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {qualifications.map((qual) => (
              <span
                key={qual}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200/80 text-xs font-semibold shadow-2xs group animate-in fade-in duration-150"
              >
                <span>{qual}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(qual)}
                  className="w-4 h-4 rounded-full flex items-center justify-center text-blue-400 hover:text-red-600 hover:bg-blue-100/60 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Quick Suggestion Pills */}
        <div className="pt-2">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-blue-500" />
            Quick suggestions
          </p>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_QUALIFICATIONS.map((q) => {
              const alreadyAdded = qualifications.includes(q)
              return (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleQuickAdd(q)}
                  disabled={alreadyAdded}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                    alreadyAdded
                      ? 'bg-slate-50 text-slate-400 border-slate-200/60 cursor-default'
                      : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300'
                  }`}
                >
                  + {q}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
