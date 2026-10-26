import React from 'react'
import { GraduationCap, Plus, Pencil, Trash2 } from 'lucide-react'
import type { QualificationData } from './DoctorProfileModals'

interface DoctorQualificationsCardProps {
  qualifications: QualificationData[]
  onAddClick: () => void
  onEditClick: (index: number) => void
  onDeleteClick: (index: number) => void
}

export const DoctorQualificationsCard: React.FC<DoctorQualificationsCardProps> = ({
  qualifications,
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
            <GraduationCap className="size-4.5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Qualifications</h3>
            <p className="text-xs text-slate-500">Academic medical degrees and diplomas</p>
          </div>
        </div>

        {/* Add Qualification Button */}
        <button
          type="button"
          onClick={onAddClick}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-blue-600 bg-white hover:bg-blue-50 border border-blue-200 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
        >
          <Plus className="size-3.5 stroke-[2.5]" />
          <span>Add Qualification</span>
        </button>
      </div>

      {/* Qualifications List */}
      <div className="space-y-3">
        {qualifications.length === 0 ? (
          <div className="py-8 text-center bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
            <GraduationCap className="size-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-600">No qualifications added yet</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Click &quot;Add Qualification&quot; to list your medical degrees
            </p>
          </div>
        ) : (
          qualifications.map((q, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 hover:bg-slate-50 border border-slate-200/80 transition-all group"
            >
              <div className="min-w-0 pr-3">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                  {q.degree}
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5 truncate">
                  {q.institution}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[11px] sm:text-xs font-semibold text-slate-500 hidden sm:inline-block">
                  {q.period}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onEditClick(idx)}
                    title="Edit qualification"
                    className="p-1.5 rounded-xl text-blue-600 hover:bg-blue-100/70 border border-blue-200/60 bg-white transition-colors cursor-pointer"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteClick(idx)}
                    title="Delete qualification"
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
