import type { FC } from 'react'
import { X, Filter, RotateCcw, Calendar, Stethoscope, Building2, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { AppointmentFilterTab } from '@/types/patient'

interface AppointmentFiltersDrawerProps {
  isOpen: boolean
  onClose: () => void
  activeTab: AppointmentFilterTab
  onSelectTab: (tab: AppointmentFilterTab) => void
  selectedSpecialty: string
  onSelectSpecialty: (specialty: string) => void
  selectedHospital: string
  onSelectHospital: (hospital: string) => void
  selectedType: string
  onSelectType: (type: string) => void
  dateRange: { from?: string; to?: string }
  onChangeDateRange: (range: { from?: string; to?: string }) => void
  onClearAll: () => void
  counts: { all: number; upcoming: number; completed: number; cancelled: number }
}

export const AppointmentFiltersDrawer: FC<AppointmentFiltersDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  selectedSpecialty,
  onSelectSpecialty,
  selectedHospital,
  onSelectHospital,
  selectedType,
  onSelectType,
  dateRange,
  onChangeDateRange,
  onClearAll,
  counts,
}) => {
  if (!isOpen) return null

  const specialties = [
    'All Specializations',
    'Cardiologist',
    'Orthopedist',
    'Dermatologist',
    'Neurologist',
    'General Physician',
    'Pediatrician',
  ]

  const hospitals = [
    'All Hospitals',
    'Apollo Multispeciality Hospital',
    'City Care Hospital',
    'Shree Sai Hospital',
    'LifeCare Hospital',
  ]

  const consultationTypes = [
    { label: 'All Types', value: 'all' },
    { label: 'In-person', value: 'In-person' },
    { label: 'Video Consultation', value: 'Video Consultation' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Slide-out Drawer Container */}
      <div className="relative z-10 w-full max-w-sm bg-white h-full shadow-2xl flex flex-col p-5 sm:p-6 animate-in slide-in-from-right duration-250 overflow-y-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Filter className="size-4.5 text-blue-600" />
            <h3 className="font-extrabold text-slate-900 text-base">Filter Appointments</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClearAll}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RotateCcw className="size-3.5" />
              <span>Clear All</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer ml-1"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* 1. Status Filter Pills */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Status</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'all', label: `All (${counts.all})` },
              { id: 'upcoming', label: `Upcoming (${counts.upcoming})` },
              { id: 'completed', label: `Completed (${counts.completed})` },
              { id: 'cancelled', label: `Cancelled (${counts.cancelled})` },
            ].map((st) => {
              const isSelected = activeTab === st.id
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => onSelectTab(st.id as AppointmentFilterTab)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300'
                  }`}
                >
                  {st.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* 2. Date Range */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="size-3.5 text-blue-600" />
            Date Range
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-slate-400 font-medium">From Date</span>
              <input
                type="date"
                value={dateRange.from || ''}
                onChange={(e) => onChangeDateRange({ ...dateRange, from: e.target.value })}
                className="w-full text-xs font-medium px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-medium">To Date</span>
              <input
                type="date"
                value={dateRange.to || ''}
                onChange={(e) => onChangeDateRange({ ...dateRange, to: e.target.value })}
                className="w-full text-xs font-medium px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        </div>

        {/* 3. Doctor Specialization */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Stethoscope className="size-3.5 text-blue-600" />
            Doctor Specialization
          </label>
          <select
            value={selectedSpecialty}
            onChange={(e) => onSelectSpecialty(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
          >
            {specialties.map((s) => (
              <option key={s} value={s === 'All Specializations' ? 'all' : s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Hospital */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="size-3.5 text-blue-600" />
            Hospital
          </label>
          <select
            value={selectedHospital}
            onChange={(e) => onSelectHospital(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
          >
            {hospitals.map((h) => (
              <option key={h} value={h === 'All Hospitals' ? 'all' : h}>
                {h}
              </option>
            ))}
          </select>
        </div>

        {/* 5. Consultation Type */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Video className="size-3.5 text-blue-600" />
            Consultation Type
          </label>
          <div className="grid grid-cols-1 gap-2">
            {consultationTypes.map((t) => {
              const isSelected = selectedType === t.value
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => onSelectType(t.value)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border text-left flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300'
                  }`}
                >
                  <span>{t.label}</span>
                  {isSelected && <span className="size-2 rounded-full bg-blue-600" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Apply CTA */}
        <div className="pt-4 mt-auto">
          <Button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl h-11 shadow-sm cursor-pointer"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  )
}
