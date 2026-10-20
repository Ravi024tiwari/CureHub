import { useState, type FC } from 'react'
import { Search, RotateCcw } from 'lucide-react'

interface DoctorFiltersSidebarProps {
  selectedSpecializations: string[]
  onToggleSpecialization: (spec: string) => void
  selectedHospitals: string[]
  onToggleHospital: (hosp: string) => void
  selectedConsultationType: string
  onSelectConsultationType: (type: string) => void
  selectedAvailability: string
  onSelectAvailability: (avail: string) => void
  maxFee: number
  onChangeMaxFee: (fee: number) => void
  onClearAll: () => void
}

export const DoctorFiltersSidebar: FC<DoctorFiltersSidebarProps> = ({
  selectedSpecializations,
  onToggleSpecialization,
  selectedHospitals,
  onToggleHospital,
  selectedConsultationType,
  onSelectConsultationType,
  selectedAvailability,
  onSelectAvailability,
  maxFee,
  onChangeMaxFee,
  onClearAll,
}) => {
  const [showMoreSpecs, setShowMoreSpecs] = useState(false)
  const [showMoreHosps, setShowMoreHosps] = useState(false)
  const [hospitalSearch, setHospitalSearch] = useState('')

  const specializations = [
    { label: 'General Physician', count: 120 },
    { label: 'Cardiologist', count: 45 },
    { label: 'Dermatologist', count: 38 },
    { label: 'Pediatrician', count: 52 },
    { label: 'Orthopedist', count: 44 },
    { label: 'Gynecologist', count: 36 },
    { label: 'Neurologist', count: 28 },
    { label: 'Dentist', count: 22 },
  ]

  const hospitalsList = [
    { label: 'Apollo Multispeciality Hospital', count: 32 },
    { label: 'City Care Hospital', count: 28 },
    { label: 'Shree Sai Hospital', count: 25 },
    { label: 'LifeCare Hospital', count: 20 },
    { label: 'Metro Hospital', count: 18 },
    { label: 'CarePlus Clinic', count: 15 },
  ]

  const filteredHospitals = hospitalsList.filter((h) =>
    h.label.toLowerCase().includes(hospitalSearch.toLowerCase())
  )

  const visibleSpecs = showMoreSpecs ? specializations : specializations.slice(0, 5)
  const visibleHosps = showMoreHosps ? filteredHospitals : filteredHospitals.slice(0, 5)

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-6 select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Filters</h3>
        <button
          onClick={onClearAll}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <RotateCcw className="size-3" />
          <span>Clear All</span>
        </button>
      </div>

      {/* Specialization Filter */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Specialization</h4>
        <div className="space-y-2">
          {visibleSpecs.map((spec) => {
            const isChecked = selectedSpecializations.includes(spec.label)
            return (
              <label
                key={spec.label}
                className="flex items-center justify-between text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleSpecialization(spec.label)}
                    className="size-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                  />
                  <span className={isChecked ? 'font-bold text-blue-600' : ''}>{spec.label}</span>
                </div>
                <span className="text-[11px] text-slate-400 font-normal">({spec.count})</span>
              </label>
            )
          })}
        </div>

        <button
          type="button"
          onClick={() => setShowMoreSpecs(!showMoreSpecs)}
          className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 pt-1 cursor-pointer"
        >
          <span>{showMoreSpecs ? '- Show Less' : '+ Show More'}</span>
        </button>
      </div>

      {/* Hospital Filter */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Hospital</h4>

        {/* Mini Search Inside Hospital Filter */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
          <input
            type="text"
            value={hospitalSearch}
            onChange={(e) => setHospitalSearch(e.target.value)}
            placeholder="Search hospital..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl placeholder-slate-400 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {visibleHosps.map((hosp) => {
            const isChecked = selectedHospitals.includes(hosp.label)
            return (
              <label
                key={hosp.label}
                className="flex items-center justify-between text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleHospital(hosp.label)}
                    className="size-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600 shrink-0"
                  />
                  <span className={`truncate ${isChecked ? 'font-bold text-blue-600' : ''}`}>
                    {hosp.label}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-normal shrink-0">
                  ({hosp.count})
                </span>
              </label>
            )
          })}
        </div>

        <button
          type="button"
          onClick={() => setShowMoreHosps(!showMoreHosps)}
          className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 pt-1 cursor-pointer"
        >
          <span>{showMoreHosps ? '- Show Less' : '+ Show More'}</span>
        </button>
      </div>

      {/* Consultation Type */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Consultation Type
        </h4>
        <div className="space-y-2 text-xs">
          {[
            { id: 'all', label: 'All Modes' },
            { id: 'in-clinic', label: 'In-clinic (180)' },
            { id: 'video', label: 'Video Consultation (65)' },
          ].map((mode) => (
            <label
              key={mode.id}
              className="flex items-center gap-2.5 font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              <input
                type="radio"
                name="consultationType"
                checked={selectedConsultationType === mode.id}
                onChange={() => onSelectConsultationType(mode.id)}
                className="size-4 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
              />
              <span className={selectedConsultationType === mode.id ? 'font-bold text-blue-600' : ''}>
                {mode.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Availability Filter */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Availability</h4>
        <div className="grid grid-cols-3 gap-1.5">
          {['Today', 'Tomorrow', 'This Week'].map((av) => {
            const isSelected = selectedAvailability === av
            return (
              <button
                key={av}
                type="button"
                onClick={() => onSelectAvailability(isSelected ? 'all' : av)}
                className={`py-1.5 px-1 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer text-center ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {av}
              </button>
            )
          })}
        </div>
      </div>

      {/* Fees Range Slider */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Fees Range</h4>
          <span className="text-xs font-extrabold text-blue-600">₹0 - ₹{maxFee}</span>
        </div>
        <input
          type="range"
          min="200"
          max="3000"
          step="100"
          value={maxFee}
          onChange={(e) => onChangeMaxFee(Number(e.target.value))}
          className="w-full accent-blue-600 cursor-pointer"
        />
        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span>₹200</span>
          <span>₹1500</span>
          <span>₹3000+</span>
        </div>
      </div>
    </div>
  )
}
