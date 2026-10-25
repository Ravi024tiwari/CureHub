import { useState, type FC, type KeyboardEvent } from 'react'
import {
  GraduationCap,
  Plus,
  X,
  Sparkles,
  Award,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const COMMON_DEGREES = [
  'MBBS',
  'MD (Internal Medicine)',
  'MD (Cardiology)',
  'MD (Pediatrics)',
  'MS (General Surgery)',
  'MS (Orthopedics)',
  'DM (Cardiology)',
  'DM (Neurology)',
  'MCh (Neurosurgery)',
  'DNB',
  'FRCS',
  'MRCP (UK)',
  'Fellowship in Critical Care',
]

interface DoctorQualificationsSectionProps {
  qualifications: string[]
  onChange: (qualifications: string[]) => void
}

export const DoctorQualificationsSection: FC<DoctorQualificationsSectionProps> = ({
  qualifications = [],
  onChange,
}) => {
  const [qualInput, setQualInput] = useState('')

  const handleAddQualification = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || qualifications.includes(trimmed)) return
    onChange([...qualifications, trimmed])
    setQualInput('')
  }

  const handleRemoveQualification = (itemToRemove: string) => {
    onChange(qualifications.filter((q) => q !== itemToRemove))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddQualification(qualInput)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-5">
      {/* Section Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="size-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-xs">
          <GraduationCap className="size-5" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Qualifications & Medical Degrees <span className="text-rose-500">*</span>
          </h2>
          <p className="text-xs text-slate-500">
            Add your degrees, diplomas, and certifications verified by medical councils.
          </p>
        </div>
      </div>

      {/* Input row */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold text-slate-700">
          Add Degree / Qualification <span className="text-rose-500">*</span>
        </Label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Award className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input
              type="text"
              value={qualInput}
              onChange={(e) => setQualInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. MBBS - AIIMS Delhi or MD - Cardiology"
              className="pl-10 h-10.5 rounded-xl border-slate-200 focus:border-purple-500 text-sm font-medium"
            />
          </div>
          <button
            type="button"
            onClick={() => handleAddQualification(qualInput)}
            disabled={!qualInput.trim()}
            className="flex-shrink-0 px-4 h-10.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="size-4" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Added Qualifications Chips */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Added Degrees ({qualifications.length})
        </span>

        <div className="flex flex-wrap gap-2 min-h-12 p-3 rounded-xl border border-slate-200 bg-slate-50/50">
          {qualifications.length > 0 ? (
            qualifications.map((q) => (
              <span
                key={q}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-800 text-xs font-semibold border border-purple-200/80 shadow-2xs group"
              >
                <Award className="size-3.5 text-purple-600" />
                <span>{q}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveQualification(q)}
                  className="text-purple-400 hover:text-rose-600 transition-colors p-0.5 rounded-md"
                  aria-label={`Remove ${q}`}
                >
                  <X className="size-3" />
                </button>
              </span>
            ))
          ) : (
            <div className="text-xs text-slate-400 self-center pl-1 italic flex items-center gap-1.5">
              <span>At least 1 qualification is required for verification (e.g. MBBS).</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick suggestions */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[11px] font-medium text-slate-400 mr-1 flex items-center gap-1">
          <Sparkles className="size-3 text-amber-500" />
          Quick tags:
        </span>
        {COMMON_DEGREES.map((deg) => {
          const isAdded = qualifications.includes(deg)
          return (
            <button
              key={deg}
              type="button"
              disabled={isAdded}
              onClick={() => handleAddQualification(deg)}
              className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full transition-all ${
                isAdded
                  ? 'bg-slate-100 text-slate-400 cursor-default line-through'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50/50 cursor-pointer'
              }`}
            >
              + {deg}
            </button>
          )
        })}
      </div>
    </div>
  )
}
