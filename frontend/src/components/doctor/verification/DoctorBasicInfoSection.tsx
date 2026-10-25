import { useState, type FC, type KeyboardEvent } from 'react'
import {
  User,
  Mail,
  Phone,
  Stethoscope,
  IndianRupee,
  Clock,
  Sparkles,
  Plus,
  X,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const POPULAR_DEPARTMENTS = [
  'Cardiology',
  'Neurology',
  'Orthopedics',
  'Pediatrics',
  'Dermatology',
  'General Medicine',
  'Oncology',
  'Obstetrics & Gynecology',
  'Ophthalmology',
  'ENT (Otolaryngology)',
  'Psychiatry',
  'Gastroenterology',
  'Pulmonology',
  'General Surgery',
  'Urology',
  'Nephrology',
  'Radiology',
]

const POPULAR_SPECIALIZATIONS: Record<string, string[]> = {
  Cardiology: [
    'Interventional Cardiology',
    'Echocardiography',
    'Electrophysiology',
    'Heart Failure & Transplant',
    'Pediatric Cardiology',
  ],
  Neurology: [
    'Stroke Management',
    'Epileptology',
    'Neuro-oncology',
    'Movement Disorders',
    'Headache Medicine',
  ],
  Orthopedics: [
    'Joint Replacement',
    'Sports Medicine',
    'Spine Surgery',
    'Trauma & Fracture Surgery',
    'Pediatric Orthopedics',
  ],
  Dermatology: [
    'Clinical Dermatology',
    'Cosmetology',
    'Dermatosurgery',
    'Trichology',
    'Pediatric Dermatology',
  ],
  Pediatrics: [
    'Neonatology',
    'Pediatric Intensive Care',
    'Child Nutrition',
    'Adolescent Medicine',
  ],
}

interface DoctorBasicInfoSectionProps {
  name: string
  email: string
  phoneNumber: string
  department: string
  specializations: string[]
  consultationFee: number
  experienceYears: number
  bio: string
  onChange: (fields: Partial<{
    name: string
    phoneNumber: string
    department: string
    specializations: string[]
    consultationFee: number
    experienceYears: number
    bio: string
  }>) => void
}

export const DoctorBasicInfoSection: FC<DoctorBasicInfoSectionProps> = ({
  name,
  email,
  phoneNumber,
  department,
  specializations = [],
  consultationFee,
  experienceYears,
  bio,
  onChange,
}) => {
  const [customSpecInput, setCustomSpecInput] = useState('')

  const handleAddSpecialization = (spec: string) => {
    const trimmed = spec.trim()
    if (!trimmed || specializations.includes(trimmed)) return
    onChange({ specializations: [...specializations, trimmed] })
    setCustomSpecInput('')
  }

  const handleRemoveSpecialization = (specToRemove: string) => {
    onChange({
      specializations: specializations.filter((s) => s !== specToRemove),
    })
  }

  const handleSpecKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddSpecialization(customSpecInput)
    }
  }

  const suggestedSpecs =
    (department && POPULAR_SPECIALIZATIONS[department]) || [
      'General Consultation',
      'Preventive Healthcare',
      'Diagnostic Assessment',
      'Clinical Care',
    ]

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="size-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
          <User className="size-5" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Basic & Professional Information
          </h2>
          <p className="text-xs text-slate-500">
            Let us know about your clinical identity, specialty, and patient consultation terms.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {/* Full Name */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-700">
            Full Name <span className="text-rose-500">*</span>
          </Label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input
              type="text"
              value={name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="Dr. Arjun Mehta"
              className="pl-10 h-10.5 rounded-xl border-slate-200 focus:border-blue-500 text-sm font-medium"
            />
          </div>
        </div>

        {/* Email Address (Read-only) */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-700">
            Registered Email <span className="text-xs font-normal text-slate-400">(Linked account)</span>
          </Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input
              type="email"
              value={email}
              readOnly
              disabled
              className="pl-10 h-10.5 rounded-xl border-slate-200 bg-slate-50 text-slate-500 text-sm cursor-not-allowed"
            />
          </div>
        </div>

        {/* Phone Number */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-700">
            Mobile / Contact Number
          </Label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input
              type="tel"
              value={phoneNumber}
              onChange={(e) => onChange({ phoneNumber: e.target.value })}
              placeholder="+91 98765 43210"
              className="pl-10 h-10.5 rounded-xl border-slate-200 focus:border-blue-500 text-sm font-medium"
            />
          </div>
        </div>

        {/* Department / Primary Specialty */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-700">
            Department / Primary Specialty <span className="text-rose-500">*</span>
          </Label>
          <div className="relative">
            <Stethoscope className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
            <select
              value={department}
              onChange={(e) => onChange({ department: e.target.value })}
              className="w-full pl-10 pr-4 h-10.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="" disabled>
                Select your clinical department...
              </option>
              {POPULAR_DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Consultation Fee (₹) */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-700">
            Consultation Fee (₹) <span className="text-rose-500">*</span>
          </Label>
          <div className="relative">
            <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input
              type="number"
              min={0}
              step={50}
              value={consultationFee || ''}
              onChange={(e) => onChange({ consultationFee: Math.max(0, Number(e.target.value)) })}
              placeholder="e.g. 800"
              className="pl-10 h-10.5 rounded-xl border-slate-200 focus:border-blue-500 text-sm font-medium"
            />
          </div>
        </div>

        {/* Experience Years */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-700">
            Experience (in Years) <span className="text-rose-500">*</span>
          </Label>
          <div className="relative">
            <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input
              type="number"
              min={0}
              max={70}
              value={experienceYears || ''}
              onChange={(e) => onChange({ experienceYears: Math.max(0, Number(e.target.value)) })}
              placeholder="e.g. 12"
              className="pl-10 h-10.5 rounded-xl border-slate-200 focus:border-blue-500 text-sm font-medium"
            />
          </div>
        </div>
      </div>

      {/* Specializations (Multi-chip Tag Input) */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold text-slate-700">
            Specializations / Clinical Interests <span className="text-rose-500">*</span>
          </Label>
          <span className="text-[11px] text-slate-400">
            {specializations.length} added
          </span>
        </div>

        {/* Active Specializations Tag Chips */}
        <div className="flex flex-wrap gap-2 min-h-10 p-2.5 rounded-xl border border-slate-200 bg-slate-50/50">
          {specializations.length > 0 ? (
            specializations.map((spec) => (
              <span
                key={spec}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-100/80 text-blue-800 text-xs font-semibold border border-blue-200/70 shadow-2xs"
              >
                <span>{spec}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSpecialization(spec)}
                  className="hover:text-rose-600 transition-colors p-0.5 rounded-sm"
                  aria-label={`Remove ${spec}`}
                >
                  <X className="size-3" />
                </button>
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-400 self-center pl-1">
              No specializations added yet. Type below or choose from suggestions.
            </span>
          )}
        </div>

        {/* Input to add custom specialization */}
        <div className="flex items-center gap-2 pt-1">
          <Input
            type="text"
            value={customSpecInput}
            onChange={(e) => setCustomSpecInput(e.target.value)}
            onKeyDown={handleSpecKeyDown}
            placeholder="Type specialization and press Enter or Add..."
            className="h-10 rounded-xl border-slate-200 focus:border-blue-500 text-xs sm:text-sm"
          />
          <button
            type="button"
            onClick={() => handleAddSpecialization(customSpecInput)}
            disabled={!customSpecInput.trim()}
            className="flex-shrink-0 px-4 h-10 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="size-3.5" />
            <span>Add</span>
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-medium text-slate-400 mr-1 flex items-center gap-1">
            <Sparkles className="size-3 text-amber-500" />
            Quick suggestions:
          </span>
          {suggestedSpecs.map((s) => {
            const isAdded = specializations.includes(s)
            return (
              <button
                key={s}
                type="button"
                disabled={isAdded}
                onClick={() => handleAddSpecialization(s)}
                className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full transition-all ${
                  isAdded
                    ? 'bg-slate-100 text-slate-400 cursor-default line-through'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50'
                }`}
              >
                + {s}
              </button>
            )
          })}
        </div>
      </div>

      {/* Bio / About You */}
      <div className="space-y-1.5 pt-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold text-slate-700">
            Bio / Professional Summary
          </Label>
          <span className="text-[11px] text-slate-400 font-mono">
            {bio?.length || 0}/1000 characters
          </span>
        </div>
        <textarea
          rows={4}
          maxLength={1000}
          value={bio}
          onChange={(e) => onChange({ bio: e.target.value })}
          placeholder="Write a brief introduction about your medical background, approach to patient care, and clinical achievements..."
          className="w-full p-3.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all leading-relaxed"
        />
      </div>
    </div>
  )
}
