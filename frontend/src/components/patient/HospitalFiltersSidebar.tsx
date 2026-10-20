import { useState, type FC } from 'react'
import {
  RotateCcw,
  Search,
  Building,
  Activity,
  Calendar,
  Sparkles,
  MapPin,
  ChevronDown,
} from 'lucide-react'

interface HospitalFiltersSidebarProps {
  selectedCity: string
  onSelectCity: (city: string) => void
  distanceRadius: string
  onSelectDistance: (dist: string) => void
  selectedTypes: string[]
  onToggleType: (type: string) => void
  selectedDepartments: string[]
  onToggleDepartment: (dept: string) => void
  selectedFacilities: string[]
  onToggleFacility: (facility: string) => void
  minYear: number
  maxYear: number
  onChangeYearRange: (min: number, max: number) => void
  onClearAll: () => void
}

export const HospitalFiltersSidebar: FC<HospitalFiltersSidebarProps> = ({
  selectedCity,
  onSelectCity: _onSelectCity,
  distanceRadius,
  onSelectDistance,
  selectedTypes,
  onToggleType,
  selectedDepartments,
  onToggleDepartment,
  selectedFacilities,
  onToggleFacility,
  minYear,
  maxYear,
  onChangeYearRange,
  onClearAll,
}) => {
  const [deptSearch, setDeptSearch] = useState('')
  const [showAllDepts, setShowAllDepts] = useState(false)

  const hospitalTypes = [
    'Multi-Speciality',
    'Super Speciality',
    'Maternity & Women Care',
    'Children\'s Hospital',
    'Eye Hospital',
    'Dental Hospital',
    'Orthopedic Hospital',
    'Cancer Hospital',
  ]

  const allDepartments = [
    'General Medicine',
    'Cardiology',
    'Dermatology',
    'Pediatrics',
    'Orthopedics',
    'Neurology',
    'Gynecology',
    'Oncology',
    'Gastroenterology',
    'Urology',
    'Nephrology',
    'ENT',
  ]

  const facilitiesList = [
    '24x7 Emergency',
    'Ambulance',
    'ICU',
    'Diagnostic Lab',
    'Pharmacy',
    'Parking',
    'Blood Bank',
    'Cath Lab',
  ]

  const distanceOptions = [
    { label: 'Within 5 km', value: 'within-5km' },
    { label: 'Within 10 km', value: 'within-10km' },
    { label: 'Within 25 km', value: 'within-25km' },
    { label: 'Within 50 km', value: 'within-50km' },
    { label: 'All Distances', value: 'all' },
  ]

  const filteredDepts = allDepartments.filter((d) =>
    d.toLowerCase().includes(deptSearch.toLowerCase().trim())
  )

  const displayedDepts = showAllDepts ? filteredDepts : filteredDepts.slice(0, 5)

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 space-y-6 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <Building className="size-4.5 text-blue-600" />
          <h3 className="font-extrabold text-slate-900 text-base">Filters</h3>
        </div>
        <button
          type="button"
          onClick={onClearAll}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <RotateCcw className="size-3.5" />
          <span>Clear All</span>
        </button>
      </div>

      {/* 1. Location & Distance */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <MapPin className="size-3.5 text-blue-600" />
          Location & Radius
        </label>

        {/* City Indicator */}
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-medium text-slate-700 flex items-center justify-between">
          <span className="truncate">{selectedCity}</span>
          <span className="text-[10px] font-bold text-blue-600 bg-blue-100/60 px-1.5 py-0.5 rounded-md">
            Active
          </span>
        </div>

        {/* Distance Selector */}
        <div className="relative">
          <select
            value={distanceRadius}
            onChange={(e) => onSelectDistance(e.target.value)}
            className="w-full px-3 py-2 text-xs font-medium bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer appearance-none"
          >
            {distanceOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* 2. Hospital Type */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Building className="size-3.5 text-blue-600" />
          Hospital Type
        </label>

        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
          {hospitalTypes.map((type) => {
            const isChecked = selectedTypes.includes(type)
            return (
              <label
                key={type}
                className="flex items-center gap-2.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer select-none group"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggleType(type)}
                  className="size-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500/20 cursor-pointer"
                />
                <span className={`transition-colors ${isChecked ? 'font-bold text-blue-600' : ''}`}>
                  {type}
                </span>
              </label>
            )
          })}
        </div>
      </div>

      {/* 3. Departments */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Activity className="size-3.5 text-blue-600" />
          Departments
        </label>

        {/* Search inside departments */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
          <input
            type="text"
            value={deptSearch}
            onChange={(e) => setDeptSearch(e.target.value)}
            placeholder="Search departments..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {displayedDepts.map((dept) => {
            const isChecked = selectedDepartments.includes(dept)
            return (
              <label
                key={dept}
                className="flex items-center gap-2.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer select-none group"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggleDepartment(dept)}
                  className="size-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500/20 cursor-pointer"
                />
                <span className={`transition-colors ${isChecked ? 'font-bold text-blue-600' : ''}`}>
                  {dept}
                </span>
              </label>
            )
          })}
        </div>

        {filteredDepts.length > 5 && (
          <button
            type="button"
            onClick={() => setShowAllDepts(!showAllDepts)}
            className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer block pt-1"
          >
            {showAllDepts ? '- Show Less' : `+ Show More (${filteredDepts.length - 5})`}
          </button>
        )}
      </div>

      {/* 4. Facilities */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="size-3.5 text-blue-600" />
          Facilities & Services
        </label>

        <div className="space-y-2">
          {facilitiesList.map((facility) => {
            const isChecked = selectedFacilities.includes(facility)
            return (
              <label
                key={facility}
                className="flex items-center gap-2.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggleFacility(facility)}
                  className="size-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500/20 cursor-pointer"
                />
                <span className={`transition-colors ${isChecked ? 'font-bold text-blue-600' : ''}`}>
                  {facility}
                </span>
              </label>
            )
          })}
        </div>
      </div>

      {/* 5. Establishment Year Slider */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="size-3.5 text-blue-600" />
            Establishment Year
          </label>
          <span className="text-xs font-black text-blue-600">
            {minYear} - {maxYear}
          </span>
        </div>

        <input
          type="range"
          min={1800}
          max={2026}
          step={1}
          value={minYear}
          onChange={(e) => onChangeYearRange(parseInt(e.target.value), maxYear)}
          className="w-full accent-blue-600 cursor-pointer"
        />

        <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
          <span>Since 1800</span>
          <span>Present (2026)</span>
        </div>
      </div>
    </div>
  )
}
