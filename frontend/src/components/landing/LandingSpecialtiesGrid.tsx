import { useState, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Heart,
  Brain,
  Sparkles,
  Baby,
  Bone,
  Activity,
  Salad,
  ArrowRight,
  Stethoscope,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react'

interface SpecialtyItem {
  id: string
  name: string
  description: string
  icon: any
  doctorCount: number
  conditions: string[]
  gradient: string
  textColor: string
  borderColor: string
}

export const LandingSpecialtiesGrid: FC = () => {
  const navigate = useNavigate()
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState('cardiology')

  const specialties: SpecialtyItem[] = [
    {
      id: 'cardiology',
      name: 'Cardiology',
      description: 'Comprehensive cardiac monitoring, coronary interventions & hypertension care.',
      icon: Heart,
      doctorCount: 42,
      conditions: ['Hypertension', 'Arrhythmia', 'Coronary Disease', 'Heart Failure'],
      gradient: 'from-rose-500/10 via-rose-50 to-white',
      textColor: 'text-rose-600',
      borderColor: 'border-rose-200/80',
    },
    {
      id: 'neurology',
      name: 'Neurology',
      description: 'Advanced neuro-diagnostics, stroke recovery & central nervous system treatment.',
      icon: Brain,
      doctorCount: 38,
      conditions: ['Migraines', 'Epilepsy', 'Neuropathy', 'Stroke Rehabilitation'],
      gradient: 'from-indigo-500/10 via-indigo-50 to-white',
      textColor: 'text-indigo-600',
      borderColor: 'border-indigo-200/80',
    },
    {
      id: 'dermatology',
      name: 'Dermatology',
      description: 'Clinical skincare, allergy management, eczema & advanced aesthetic dermatology.',
      icon: Sparkles,
      doctorCount: 48,
      conditions: ['Acne & Rosacea', 'Psoriasis', 'Hair Loss', 'Skin Allergies'],
      gradient: 'from-amber-500/10 via-amber-50 to-white',
      textColor: 'text-amber-600',
      borderColor: 'border-amber-200/80',
    },
    {
      id: 'pediatrics',
      name: 'Pediatrics',
      description: 'Gentle newborn care, developmental screenings & pediatric immunization.',
      icon: Baby,
      doctorCount: 52,
      conditions: ['Childhood Infections', 'Vaccinations', 'Growth Milestones', 'Allergies'],
      gradient: 'from-sky-500/10 via-sky-50 to-white',
      textColor: 'text-sky-600',
      borderColor: 'border-sky-200/80',
    },
    {
      id: 'orthopedics',
      name: 'Orthopedics',
      description: 'Joint replacement surgeries, fracture care & specialized sports medicine.',
      icon: Bone,
      doctorCount: 40,
      conditions: ['Joint Pain', 'Arthritis', 'Sports Injuries', 'Spine Disorders'],
      gradient: 'from-[#637ff5]/10 via-[#eef3ff] to-white',
      textColor: 'text-[#637ff5]',
      borderColor: 'border-[#c8d7fd]',
    },
    {
      id: 'endocrinology',
      name: 'Diabetes & Metabolism',
      description: 'Evidence-based glycemic control, thyroid balancing & hormone health.',
      icon: Activity,
      doctorCount: 35,
      conditions: ['Type 1 & 2 Diabetes', 'Hypothyroidism', 'PCOS', 'Metabolic Syndrome'],
      gradient: 'from-emerald-500/10 via-emerald-50 to-white',
      textColor: 'text-emerald-600',
      borderColor: 'border-emerald-200/80',
    },
    {
      id: 'nutrition',
      name: 'Nutrition & Diet',
      description: 'Targeted clinical dietary therapy, cardiovascular diets & weight wellness.',
      icon: Salad,
      doctorCount: 28,
      conditions: ['Therapeutic Diets', 'Gut Health', 'Weight Management', 'Cholesterol'],
      gradient: 'from-teal-500/10 via-teal-50 to-white',
      textColor: 'text-teal-600',
      borderColor: 'border-teal-200/80',
    },
    {
      id: 'general',
      name: 'General OPD',
      description: 'Routine health checkups, preventative diagnostics & acute illness triage.',
      icon: Stethoscope,
      doctorCount: 65,
      conditions: ['Fever & Infections', 'Preventative Screenings', 'Blood Pressure', 'General OPD'],
      gradient: 'from-purple-500/10 via-purple-50 to-white',
      textColor: 'text-purple-600',
      borderColor: 'border-purple-200/80',
    },
  ]

  const activeSpecialty =
    specialties.find((s) => s.id === selectedSpecialtyId) || specialties[0]

  return (
    <section id="specialties" className="scroll-mt-20 py-20 sm:py-28 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 border-b border-slate-100 pb-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#eef3ff] border border-[#c8d7fd] text-[#5170f4] text-xs sm:text-sm font-extrabold">
              <Stethoscope className="size-4 text-[#637ff5]" />
              <span>Comprehensive Clinical Specialties</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
              World-Class Care Across Every Specialty
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-medium max-w-2xl leading-relaxed">
              Explore specialized departments with verified credentials, modern diagnostic suites, and dedicated specialist teams.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/patient/doctors')}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm shadow-md transition-all cursor-pointer shrink-0 active:scale-95"
          >
            <span>View All 500+ Doctors</span>
            <ArrowRight className="size-4" />
          </button>
        </div>

        {/* Interactive Grid of Specialties */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {specialties.map((spec) => {
            const Icon = spec.icon
            const isSelected = selectedSpecialtyId === spec.id

            return (
              <div
                key={spec.id}
                onClick={() => setSelectedSpecialtyId(spec.id)}
                className={`p-5 rounded-3xl border transition-all duration-300 cursor-pointer flex flex-col justify-between group ${
                  isSelected
                    ? `bg-gradient-to-br ${spec.gradient} ${spec.borderColor} shadow-lg shadow-[#637ff5]/15 scale-[1.02]`
                    : 'bg-white border-slate-200/80 hover:border-[#c8d7fd] hover:shadow-md'
                }`}
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div
                      className={`size-13 rounded-2xl flex items-center justify-center ${spec.textColor} ${
                        isSelected ? 'bg-white shadow-sm' : 'bg-slate-50 group-hover:bg-[#eef3ff]'
                      } transition-colors`}
                    >
                      <Icon className="size-6 stroke-[2.2]" />
                    </div>

                    <span className="text-xs font-black px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                      {spec.doctorCount} Doctors
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-slate-900 group-hover:text-[#637ff5] transition-colors">
                      {spec.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium line-clamp-2 mt-1.5 leading-relaxed">
                      {spec.description}
                    </p>
                  </div>

                  {/* Conditions Treated Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {spec.conditions.slice(0, 3).map((cond) => (
                      <span
                        key={cond}
                        className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-white/90 border border-slate-200/80 text-slate-600"
                      >
                        {cond}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm font-extrabold text-[#637ff5] group-hover:text-[#5170f4]">
                  <span>Browse Specialists</span>
                  <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            )
          })}
        </div>

        {/* Selected Specialty Banner Callout */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#5170f4] via-[#637ff5] to-[#7a94fd] text-white shadow-xl shadow-[#637ff5]/25 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-white/95 text-xs sm:text-sm font-bold">
              <ShieldCheck className="size-4 text-emerald-300" />
              <span>Certified {activeSpecialty.name} Department</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
              Consult with Senior {activeSpecialty.name} Physicians Today
            </h3>
            <p className="text-sm sm:text-base text-white/90 font-medium max-w-xl">
              Average appointment wait time is under 15 minutes. In-person hospital slots and live OPD queue tracking available.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate(`/patient/doctors?specialty=${activeSpecialty.name}`)}
            className="px-7 py-4 rounded-2xl bg-white hover:bg-slate-50 text-[#5170f4] hover:text-[#4361ee] font-black text-sm sm:text-base shadow-lg transition-all cursor-pointer shrink-0 active:scale-95 flex items-center justify-center gap-2"
          >
            <span>Book {activeSpecialty.name} Slot</span>
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </section>
  )
}
