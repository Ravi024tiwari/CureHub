import React from 'react'
import { Briefcase, Plus, Pencil, Trash2 } from 'lucide-react'
import type { ExperienceData } from './DoctorProfileModals'

interface DoctorExperienceCardProps {
  experiences: ExperienceData[]
  onAddClick: () => void
  onEditClick: (index: number) => void
  onDeleteClick: (index: number) => void
}

export const DoctorExperienceCard: React.FC<DoctorExperienceCardProps> = ({
  experiences,
  onAddClick,
  onEditClick,
  onDeleteClick,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Briefcase className="size-4.5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Professional Experience</h3>
            <p className="text-xs text-slate-500">Clinical tenure and hospital appointments</p>
          </div>
        </div>

        {/* Add Experience Button */}
        <button
          type="button"
          onClick={onAddClick}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-blue-600 bg-white hover:bg-blue-50 border border-blue-200 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
        >
          <Plus className="size-3.5 stroke-[2.5]" />
          <span>Add Experience</span>
        </button>
      </div>

      {/* Experience List */}
      <div className="space-y-3">
        {experiences.length === 0 ? (
          <div className="py-8 text-center bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
            <Briefcase className="size-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-600">No experience items added yet</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Click &quot;Add Experience&quot; to list your hospital and clinical background
            </p>
          </div>
        ) : (
          experiences.map((exp, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 hover:bg-slate-50 border border-slate-200/80 transition-all group"
            >
              <div className="min-w-0 pr-3">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                  {exp.title}
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5 truncate">
                  {exp.institution}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right hidden sm:block">
                  <span className="text-[11px] sm:text-xs font-semibold text-slate-700 block">
                    {exp.period}
                  </span>
                  {exp.duration && (
                    <span className="text-[10px] font-bold text-slate-400 block">
                      {exp.duration}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onEditClick(idx)}
                    title="Edit experience"
                    className="p-1.5 rounded-xl text-blue-600 hover:bg-blue-100/70 border border-blue-200/60 bg-white transition-colors cursor-pointer"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteClick(idx)}
                    title="Delete experience"
                    className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-100/70 border border-rose-200/60 bg-white transition-colors cursor-pointer"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
