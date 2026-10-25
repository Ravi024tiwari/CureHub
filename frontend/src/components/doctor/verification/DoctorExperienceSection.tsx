import { useState, type FC } from 'react'
import {
  Briefcase,
  Plus,
  Trash2,
  Building2,
  Calendar,
  Clock,
  Edit2,
  Check,
  X,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { DoctorExperience } from '@/services/doctorService'

interface DoctorExperienceSectionProps {
  experiences: DoctorExperience[]
  onChange: (experiences: DoctorExperience[]) => void
}

export const DoctorExperienceSection: FC<DoctorExperienceSectionProps> = ({
  experiences = [],
  onChange,
}) => {
  const [title, setTitle] = useState('')
  const [institution, setInstitution] = useState('')
  const [period, setPeriod] = useState('')
  const [duration, setDuration] = useState('')
  const [description, setDescription] = useState('')

  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const handleAddOrUpdate = () => {
    if (!title.trim() || !institution.trim()) return

    const newExp: DoctorExperience = {
      title: title.trim(),
      institution: institution.trim(),
      period: period.trim() || '2020 - Present',
      duration: duration.trim() || '',
      description: description.trim() || '',
    }

    if (editingIndex !== null) {
      const updated = [...experiences]
      updated[editingIndex] = newExp
      onChange(updated)
      setEditingIndex(null)
    } else {
      onChange([...experiences, newExp])
    }

    // Reset inputs
    setTitle('')
    setInstitution('')
    setPeriod('')
    setDuration('')
    setDescription('')
  }

  const handleStartEdit = (index: number) => {
    const item = experiences[index]
    setTitle(item.title)
    setInstitution(item.institution)
    setPeriod(item.period)
    setDuration(item.duration || '')
    setDescription(item.description || '')
    setEditingIndex(index)
  }

  const handleCancelEdit = () => {
    setTitle('')
    setInstitution('')
    setPeriod('')
    setDuration('')
    setDescription('')
    setEditingIndex(null)
  }

  const handleDelete = (index: number) => {
    onChange(experiences.filter((_, i) => i !== index))
    if (editingIndex === index) {
      handleCancelEdit()
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="size-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shadow-xs">
          <Briefcase className="size-5" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Professional Experience & Hospital History
          </h2>
          <p className="text-xs text-slate-500">
            Showcase your clinical appointments, residency, and senior consultant tenures.
          </p>
        </div>
      </div>

      {/* Experience Input Form */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="size-3.5 text-blue-600" />
            <span>{editingIndex !== null ? 'Edit Experience Record' : 'Add Work Experience'}</span>
          </h3>

          {editingIndex !== null && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="text-xs text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1"
            >
              <X className="size-3" />
              <span>Cancel Edit</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Job Title */}
          <div className="space-y-1 sm:col-span-1 lg:col-span-1">
            <Label className="text-xs font-semibold text-slate-700">
              Title / Role <span className="text-rose-500">*</span>
            </Label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Consultant"
              className="h-10 rounded-xl bg-white border-slate-200 text-xs sm:text-sm"
            />
          </div>

          {/* Hospital / Institution */}
          <div className="space-y-1 sm:col-span-1 lg:col-span-1">
            <Label className="text-xs font-semibold text-slate-700">
              Hospital / Clinic <span className="text-rose-500">*</span>
            </Label>
            <Input
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="e.g. Apollo Hospital"
              className="h-10 rounded-xl bg-white border-slate-200 text-xs sm:text-sm"
            />
          </div>

          {/* Period */}
          <div className="space-y-1 sm:col-span-1 lg:col-span-1">
            <Label className="text-xs font-semibold text-slate-700">Period</Label>
            <Input
              type="text"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="e.g. 2019 - Present"
              className="h-10 rounded-xl bg-white border-slate-200 text-xs sm:text-sm"
            />
          </div>

          {/* Duration */}
          <div className="space-y-1 sm:col-span-1 lg:col-span-1">
            <Label className="text-xs font-semibold text-slate-700">Duration</Label>
            <Input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 4 years"
              className="h-10 rounded-xl bg-white border-slate-200 text-xs sm:text-sm"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-slate-700">
            Description / Responsibilities (Optional)
          </Label>
          <Input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Key clinical responsibilities, patient volume, or special surgical achievements..."
            className="h-10 rounded-xl bg-white border-slate-200 text-xs sm:text-sm"
          />
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={handleAddOrUpdate}
            disabled={!title.trim() || !institution.trim()}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            {editingIndex !== null ? (
              <>
                <Check className="size-3.5" />
                <span>Update Experience</span>
              </>
            ) : (
              <>
                <Plus className="size-3.5" />
                <span>Add Experience</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Added Experience Records List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Work Experience Records ({experiences.length})
          </span>
        </div>

        {experiences.length > 0 ? (
          <div className="space-y-2.5">
            {experiences.map((exp, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900">{exp.title}</span>
                    <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                      {exp.institution}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3 text-slate-400" />
                      {exp.period}
                    </span>
                    {exp.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="size-3 text-slate-400" />
                        {exp.duration}
                      </span>
                    )}
                  </div>

                  {exp.description && (
                    <p className="text-xs text-slate-600 pt-0.5 max-w-xl">
                      {exp.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(idx)}
                    className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Edit Record"
                  >
                    <Edit2 className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(idx)}
                    className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Record"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
            No work experience added yet. Add past or present hospital appointments above.
          </div>
        )}
      </div>
    </div>
  )
}
