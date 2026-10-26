import React, { useState } from 'react'
import { User, Plus, X } from 'lucide-react'

const COMMON_DEPARTMENTS = [
  'Cardiology',
  'Neurology',
  'Orthopedics',
  'Pediatrics',
  'Dermatology',
  'General Medicine',
  'Gastroenterology',
  'Oncology',
  'Psychiatry',
  'ENT (Otolaryngology)',
  'Ophthalmology',
  'Gynecology & Obstetrics',
  'Nephrology',
  'Pulmonology',
  'Endocrinology',
  'Urology',
  'Radiology',
]

interface DoctorBasicInfoCardProps {
  department: string
  specializations: string[]
  experienceYears: number
  consultationFee: number
  bio: string
  onDepartmentChange: (val: string) => void
  onAddSpecialization: (spec: string) => void
  onRemoveSpecialization: (spec: string) => void
  onExperienceYearsChange: (val: number) => void
  onConsultationFeeChange: (val: number) => void
  onBioChange: (val: string) => void
}

export const DoctorBasicInfoCard: React.FC<DoctorBasicInfoCardProps> = ({
  department,
  specializations,
  experienceYears,
  consultationFee,
  bio,
  onDepartmentChange,
  onAddSpecialization,
  onRemoveSpecialization,
  onExperienceYearsChange,
  onConsultationFeeChange,
  onBioChange,
}) => {
  const [isAddingTag, setIsAddingTag] = useState(false)
  const [newTagInput, setNewTagInput] = useState('')

  const handleAddTagSubmit = () => {
    if (newTagInput.trim()) {
      onAddSpecialization(newTagInput.trim())
      setNewTagInput('')
      setIsAddingTag(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTagSubmit()
    } else if (e.key === 'Escape') {
      setIsAddingTag(false)
      setNewTagInput('')
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
        <div className="size-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
          <User className="size-4.5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Basic Information</h3>
          <p className="text-xs text-slate-500">Your core clinical practice profile</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Row 1: Department & Specializations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Department Select */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Department <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                value={department}
                onChange={(e) => onDepartmentChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all appearance-none cursor-pointer"
              >
                <option value="">Select Department</option>
                {COMMON_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
                {department && !COMMON_DEPARTMENTS.includes(department) && (
                  <option value={department}>{department}</option>
                )}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <svg className="size-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Specializations Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Specializations <span className="text-rose-500">*</span>
            </label>
            <div className="flex flex-wrap items-center gap-2 p-2 min-h-[44px] bg-slate-50/60 border border-slate-200 rounded-xl">
              {specializations.map((spec) => (
                <span
                  key={spec}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/70 shadow-2xs group"
                >
                  <span>{spec}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveSpecialization(spec)}
                    className="text-blue-400 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}

              {isAddingTag ? (
                <div className="inline-flex items-center gap-1">
                  <input
                    type="text"
                    autoFocus
                    placeholder="e.g. Heart Rhythm"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="px-2.5 py-1 text-xs border border-blue-400 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 w-32 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddTagSubmit}
                    className="px-2 py-1 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingTag(false)
                      setNewTagInput('')
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAddingTag(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-blue-600 hover:text-blue-700 bg-white hover:bg-blue-50/80 border border-dashed border-blue-300 rounded-lg transition-all cursor-pointer shadow-2xs"
                >
                  <Plus className="size-3.5" />
                  <span>Add</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: Experience Years & Consultation Fee */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Experience Years */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Experience Years <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min={0}
              max={60}
              value={experienceYears}
              onChange={(e) => onExperienceYearsChange(Number(e.target.value))}
              placeholder="e.g. 12"
              className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            />
          </div>

          {/* Consultation Fee */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Consultation Fee (₹) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                ₹
              </span>
              <input
                type="number"
                min={0}
                step={50}
                value={consultationFee}
                onChange={(e) => onConsultationFeeChange(Number(e.target.value))}
                placeholder="e.g. 800"
                className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Row 3: Bio / About You */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Bio / About You
            </label>
            <span
              className={`text-[11px] font-bold ${
                bio.length > 500 ? 'text-rose-600' : 'text-slate-400'
              }`}
            >
              {bio.length}/500
            </span>
          </div>
          <textarea
            rows={3}
            maxLength={500}
            value={bio}
            onChange={(e) => onBioChange(e.target.value)}
            placeholder="Experienced doctor with a passion for preventive care and patient-centered excellence..."
            className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all resize-none leading-relaxed"
          />
        </div>
      </div>
    </div>
  )
}
