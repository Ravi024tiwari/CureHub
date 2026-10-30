import { useState, useMemo, type FC } from 'react'
import {
  Stethoscope,
  Heart,
  Sparkles,
  Baby,
  Activity,
  HeartPulse,
  Brain,
  Smile,
  MoreHorizontal,
  Search,
  X,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react'

interface SpecialtiesRowProps {
  selectedSpecialty: string | null
  onSelectSpecialty: (specialty: string | null) => void
}

interface SpecialtyDef {
  id: string
  label: string
  sublabel?: string
  icon: any
  color: string
  bgColor: string
  activeBg: string
  doctorCount?: number
}

// 9 Primary specialties shown in the main horizontal row
const PRIMARY_SPECIALTIES: SpecialtyDef[] = [
  {
    id: 'General Physician',
    label: 'General Physician',
    icon: Stethoscope,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50/80 hover:bg-blue-100/80 border-blue-100',
    activeBg: 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20',
  },
  {
    id: 'Cardiology',
    label: 'Cardiologist',
    icon: Heart,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50/80 hover:bg-rose-100/80 border-rose-100',
    activeBg: 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-500/20',
  },
  {
    id: 'Dermatology',
    label: 'Dermatologist',
    icon: Sparkles,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50/80 hover:bg-amber-100/80 border-amber-100',
    activeBg: 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-500/20',
  },
  {
    id: 'Pediatrics',
    label: 'Pediatrician',
    icon: Baby,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50/80 hover:bg-cyan-100/80 border-cyan-100',
    activeBg: 'bg-cyan-600 text-white border-cyan-600 shadow-md shadow-cyan-500/20',
  },
  {
    id: 'Orthopedics',
    label: 'Orthopedist',
    icon: Activity,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50/80 hover:bg-indigo-100/80 border-indigo-100',
    activeBg: 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20',
  },
  {
    id: 'Gynecology',
    label: 'Gynecologist',
    icon: HeartPulse,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50/80 hover:bg-pink-100/80 border-pink-100',
    activeBg: 'bg-pink-600 text-white border-pink-600 shadow-md shadow-pink-500/20',
  },
  {
    id: 'Neurology',
    label: 'Neurologist',
    icon: Brain,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50/80 hover:bg-purple-100/80 border-purple-100',
    activeBg: 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-500/20',
  },
  {
    id: 'Dentistry',
    label: 'Dentist',
    icon: Smile,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50/80 hover:bg-emerald-100/80 border-emerald-100',
    activeBg: 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20',
  },
  {
    id: 'More',
    label: 'More',
    icon: MoreHorizontal,
    color: 'text-slate-600',
    bgColor: 'bg-slate-50 hover:bg-slate-100 border-slate-200/80',
    activeBg: 'bg-slate-800 text-white border-slate-800 shadow-md',
  },
]

// Complete directory of 20+ medical specialties for the Interactive Modal
const ALL_SPECIALTIES_DIRECTORY: SpecialtyDef[] = [
  ...PRIMARY_SPECIALTIES.filter((s) => s.id !== 'More'),
  {
    id: 'ENT',
    label: 'ENT Specialist',
    sublabel: 'Ear, Nose & Throat Disorders',
    icon: Stethoscope,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-100',
    activeBg: 'bg-blue-600 text-white',
    doctorCount: 8,
  },
  {
    id: 'Ophthalmology',
    label: 'Ophthalmologist',
    sublabel: 'Eye Surgery & Vision Care',
    icon: Sparkles,
    color: 'text-sky-600',
    bgColor: 'bg-sky-50 border-sky-100',
    activeBg: 'bg-sky-600 text-white',
    doctorCount: 6,
  },
  {
    id: 'Oncology',
    label: 'Oncologist',
    sublabel: 'Cancer Care & Chemotherapy',
    icon: Heart,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50 border-rose-100',
    activeBg: 'bg-rose-600 text-white',
    doctorCount: 5,
  },
  {
    id: 'Psychiatry',
    label: 'Psychiatrist',
    sublabel: 'Mental Health & Wellness',
    icon: Brain,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-100',
    activeBg: 'bg-purple-600 text-white',
    doctorCount: 4,
  },
  {
    id: 'Gastroenterology',
    label: 'Gastroenterologist',
    sublabel: 'Digestive & Liver Health',
    icon: Activity,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 border-emerald-100',
    activeBg: 'bg-emerald-600 text-white',
    doctorCount: 7,
  },
  {
    id: 'Pulmonology',
    label: 'Pulmonologist',
    sublabel: 'Lungs & Respiratory Care',
    icon: Activity,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50 border-cyan-100',
    activeBg: 'bg-cyan-600 text-white',
    doctorCount: 6,
  },
  {
    id: 'Nephrology',
    label: 'Nephrologist',
    sublabel: 'Kidney Care & Dialysis',
    icon: HeartPulse,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50 border-indigo-100',
    activeBg: 'bg-indigo-600 text-white',
    doctorCount: 4,
  },
  {
    id: 'Urology',
    label: 'Urologist',
    sublabel: 'Urinary Tract & Men Health',
    icon: Activity,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 border-amber-100',
    activeBg: 'bg-amber-600 text-white',
    doctorCount: 5,
  },
  {
    id: 'Endocrinology',
    label: 'Endocrinologist',
    sublabel: 'Diabetes & Thyroid Management',
    icon: Sparkles,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50 border-teal-100',
    activeBg: 'bg-teal-600 text-white',
    doctorCount: 3,
  },
  {
    id: 'Rheumatology',
    label: 'Rheumatologist',
    sublabel: 'Joints & Autoimmune Diseases',
    icon: Activity,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50 border-pink-100',
    activeBg: 'bg-pink-600 text-white',
    doctorCount: 3,
  },
  {
    id: 'General Surgery',
    label: 'General Surgeon',
    sublabel: 'Laparoscopy & Minimally Invasive',
    icon: Stethoscope,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-100',
    activeBg: 'bg-blue-600 text-white',
    doctorCount: 9,
  },
  {
    id: 'Radiology',
    label: 'Radiologist',
    sublabel: 'MRI, CT-Scan & X-Ray Diagnostics',
    icon: Sparkles,
    color: 'text-violet-600',
    bgColor: 'bg-violet-50 border-violet-100',
    activeBg: 'bg-violet-600 text-white',
    doctorCount: 5,
  },
]

export const SpecialtiesRow: FC<SpecialtiesRowProps> = ({
  selectedSpecialty,
  onSelectSpecialty,
}) => {
  const [isMoreModalOpen, setIsMoreModalOpen] = useState(false)
  const [modalSearchQuery, setModalSearchQuery] = useState('')

  const handleClick = (id: string) => {
    if (id === 'More') {
      setIsMoreModalOpen(true)
      return
    }

    if (selectedSpecialty === id) {
      onSelectSpecialty(null) // toggle off
    } else {
      onSelectSpecialty(id)
    }
  }

  const handleSelectFromModal = (id: string) => {
    onSelectSpecialty(id)
    setIsMoreModalOpen(false)
    setModalSearchQuery('')
  }

  const filteredDirectory = useMemo(() => {
    if (!modalSearchQuery.trim()) return ALL_SPECIALTIES_DIRECTORY
    const q = modalSearchQuery.toLowerCase().trim()
    return ALL_SPECIALTIES_DIRECTORY.filter(
      (s) =>
        s.label.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        (s.sublabel && s.sublabel.toLowerCase().includes(q))
    )
  }, [modalSearchQuery])

  return (
    <div className="w-full">
      {/* Horizontal scroll container matching mockup */}
      <div className="flex items-center gap-2.5 sm:gap-4 overflow-x-auto pb-2 pt-1 scrollbar-none scroll-smooth">
        {PRIMARY_SPECIALTIES.map((item) => {
          const Icon = item.icon
          const isSelected = selectedSpecialty === item.id

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleClick(item.id)}
              className="flex flex-col items-center gap-2 group shrink-0 cursor-pointer transition-all active:scale-95"
            >
              {/* Circular / Squircle Icon Card */}
              <div
                className={`size-13 sm:size-14 rounded-2xl sm:rounded-3xl flex items-center justify-center border transition-all duration-200 group-hover:scale-105 shadow-2xs ${
                  isSelected ? item.activeBg : `${item.bgColor} ${item.color}`
                }`}
              >
                <Icon className="size-5.5 sm:size-6 stroke-[2]" />
              </div>

              {/* Label */}
              <span
                className={`text-[11px] sm:text-xs font-semibold tracking-tight transition-colors truncate max-w-[80px] sm:max-w-[95px] text-center ${
                  isSelected
                    ? 'text-blue-600 font-extrabold'
                    : 'text-slate-600 group-hover:text-slate-900'
                }`}
                title={item.label}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Interactive 20+ Medical Specialties Modal */}
      {isMoreModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setIsMoreModalOpen(false)}
          />

          <div className="relative z-10 w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  All Medical Specialties
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Pick a medical specialty to browse verified doctors and hospital departments.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsMoreModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
              >
                <X className="size-4.5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
              <div className="relative">
                <Search className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={modalSearchQuery}
                  onChange={(e) => setModalSearchQuery(e.target.value)}
                  placeholder="Search 20+ medical specialties (e.g. Oncology, ENT, Cardiology)..."
                  className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
                />
                {modalSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setModalSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Grid of Specialties */}
            <div className="p-5 overflow-y-auto flex-1 scrollbar-thin">
              {filteredDirectory.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Stethoscope className="size-10 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-700">No specialties match your search.</p>
                  <p className="text-xs text-slate-400">Try searching with a different medical keyword.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredDirectory.map((spec) => {
                    const Icon = spec.icon
                    const isSelected = selectedSpecialty === spec.id

                    return (
                      <button
                        key={spec.id}
                        type="button"
                        onClick={() => handleSelectFromModal(spec.id)}
                        className={`p-3.5 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer group ${
                          isSelected
                            ? 'bg-blue-50/90 border-blue-400 shadow-2xs ring-1 ring-blue-400'
                            : 'bg-white hover:bg-slate-50/80 border-slate-200/90 hover:border-slate-300 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`size-11 rounded-2xl flex items-center justify-center border shrink-0 group-hover:scale-105 transition-transform ${spec.bgColor} ${spec.color}`}
                          >
                            <Icon className="size-5 stroke-[2.2]" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                                {spec.label}
                              </h4>
                              {isSelected && (
                                <CheckCircle2 className="size-3.5 text-blue-600 shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                              {spec.sublabel || 'Consult verified specialists'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-slate-400 group-hover:text-blue-600 shrink-0">
                          <ChevronRight className="size-4" />
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3.5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0 text-xs">
              <span className="text-slate-500 font-semibold">
                Showing {filteredDirectory.length} medical specialties
              </span>
              <button
                type="button"
                onClick={() => setIsMoreModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SpecialtiesRow
