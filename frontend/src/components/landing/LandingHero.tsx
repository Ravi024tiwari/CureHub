import { useState, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Star,
  Stethoscope,
  CheckCircle2,
  Heart,
  Brain,
  Baby,
  Bone,
} from 'lucide-react'
import consultationImg from '@/assets/doctor-patient-consultation.jpg'

interface LandingHeroProps {
  onBookClick: () => void
}

export const LandingHero: FC<LandingHeroProps> = ({ onBookClick }) => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState('All Cities')

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery.trim()) params.append('q', searchQuery.trim())
    if (selectedCity !== 'All Cities') params.append('city', selectedCity)
    navigate(`/patient/doctors?${params.toString()}`)
  }

  const popularSpecialties = [
    { name: 'Cardiology', icon: Heart, query: 'Cardiologist' },
    { name: 'Neurology', icon: Brain, query: 'Neurologist' },
    { name: 'Dermatology', icon: Sparkles, query: 'Dermatologist' },
    { name: 'Pediatrics', icon: Baby, query: 'Pediatrician' },
    { name: 'Orthopedics', icon: Bone, query: 'Orthopedic' },
    { name: 'General OPD', icon: Stethoscope, query: 'General OPD' },
  ]

  return (
    <section className="relative pt-28 sm:pt-36 lg:pt-40 pb-20 sm:pb-28 overflow-hidden bg-gradient-to-b from-[#eef3ff]/70 via-slate-50/50 to-white">
      {/* Background Subtle Multi-Color Glow Blobs */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-tr from-[#637ff5]/15 via-[#7a94fd]/10 to-[#8ea5fe]/15 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-48 -left-24 size-96 bg-[#637ff5]/10 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-64 -right-24 size-96 bg-[#7a94fd]/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          
          {/* ─────────────────────────────────────────────────────────────
              LEFT COLUMN: High-Impact Typography & Interactive Search Bar
              ───────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
            {/* Live Pulsing Clinical Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/95 border border-[#c8d7fd] text-[#5170f4] shadow-xs text-xs sm:text-sm font-extrabold">
              <span className="relative flex size-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7a94fd] opacity-75" />
                <span className="relative inline-flex rounded-full size-2.5 bg-[#637ff5]" />
              </span>
              <Sparkles className="size-4 text-[#637ff5]" />
              <span>NHA & ABHA Verified Smart Healthcare Platform</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-slate-900 tracking-tight leading-[1.08]">
                Exceptional Medical Care,{' '}
                <span className="bg-gradient-to-r from-[#5170f4] via-[#637ff5] to-[#7a94fd] bg-clip-text text-transparent">
                  Instant Specialist Access.
                </span>
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-slate-600 font-medium max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Connect with 500+ board-certified doctors, eliminate hospital waiting lines with real-time OPD queue tokens, and access encrypted prescriptions from any device.
              </p>
            </div>

            {/* Industrial-Grade Interactive Search & Filter Card */}
            <form
              onSubmit={handleSearchSubmit}
              className="p-3 sm:p-3.5 bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-900/5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-2xl mx-auto lg:mx-0 transition-all hover:border-[#7a94fd] hover:shadow-2xl hover:shadow-[#637ff5]/15"
            >
              {/* Doctor / Specialty Search Input */}
              <div className="relative flex-1 flex items-center">
                <Search className="absolute left-3.5 size-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search doctor, specialty, or hospital..."
                  className="w-full pl-11 pr-3 py-3 text-sm sm:text-base font-semibold bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none"
                />
              </div>

              {/* City Selector */}
              <div className="relative shrink-0 flex items-center border-t sm:border-t-0 sm:border-l border-slate-200 pl-0 sm:pl-3.5 pt-2 sm:pt-0">
                <MapPin className="size-4 text-[#637ff5] mr-2 shrink-0" />
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="bg-transparent text-xs sm:text-sm font-bold text-slate-700 focus:outline-none cursor-pointer pr-3"
                >
                  <option value="All Cities">All Cities</option>
                  <option value="Bilaspur">Bilaspur, CG</option>
                  <option value="Raipur">Raipur, CG</option>
                  <option value="New Delhi">New Delhi, NCR</option>
                  <option value="Mumbai">Mumbai, MH</option>
                  <option value="Bengaluru">Bengaluru, KA</option>
                </select>
              </div>

              {/* Submit Search Button */}
              <button
                type="submit"
                className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#5170f4] via-[#637ff5] to-[#7a94fd] hover:from-[#4361ee] hover:to-[#637ff5] text-white font-black text-sm shadow-lg shadow-[#637ff5]/25 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 shrink-0"
              >
                <span>Find Care</span>
                <ArrowRight className="size-4" />
              </button>
            </form>

            {/* Popular Specialty Quick Chips */}
            <div className="flex items-center justify-center lg:justify-start gap-2 flex-wrap">
              <span className="text-xs sm:text-sm text-slate-400 font-extrabold">Popular:</span>
              {popularSpecialties.map((spec) => {
                const Icon = spec.icon
                return (
                  <button
                    key={spec.name}
                    type="button"
                    onClick={() => navigate(`/patient/doctors?specialty=${spec.query}`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#eef3ff] hover:text-[#5170f4] hover:border-[#c8d7fd] text-slate-700 border border-slate-200/90 font-bold transition-all cursor-pointer text-xs shadow-2xs group"
                  >
                    <Icon className="size-3.5 text-[#637ff5] group-hover:scale-110 transition-transform" />
                    <span>{spec.name}</span>
                  </button>
                )
              })}
            </div>

            {/* Social Trust Proof & Patient Rating */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 text-xs sm:text-sm font-semibold text-slate-500">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="size-4.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-900 text-sm">4.9 / 5.0 Rating</span>
                <span className="text-slate-300">•</span>
                <span>24,000+ Verified Consultations</span>
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              RIGHT COLUMN: High-Fidelity Medical Consultation Showcase
              Clean, spacious, responsive layout without visual clutter
              ───────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-5 relative flex flex-col items-center justify-center pb-8 sm:pb-10 lg:pb-8">
            
            {/* Main Consultation Photo Card */}
            <div className="relative w-full max-w-md sm:max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl shadow-[#637ff5]/15 border-4 border-white bg-gradient-to-tr from-[#eef3ff] to-indigo-50 group">
              <img
                src={consultationImg}
                alt="Doctor-Patient Clinical Consultation"
                className="w-full h-[360px] sm:h-[460px] lg:h-[490px] object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />

              {/* Soft Gradient Overlay at Bottom */}
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-900/60 via-slate-900/20 to-transparent pointer-events-none" />
            </div>

            {/* Mid-Left Floating Widget: 500+ Verified Specialists Badge */}
            <div className="absolute top-4 sm:top-10 -left-2 sm:-left-6 lg:-left-8 p-2.5 sm:p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl shadow-[#637ff5]/12 flex items-center gap-2.5 sm:gap-3 animate-float-reverse z-20 hover:scale-105 transition-transform duration-300">
              <div className="size-8.5 sm:size-10 rounded-xl bg-[#eef3ff] text-[#5170f4] flex items-center justify-center shadow-inner shrink-0">
                <ShieldCheck className="size-4 sm:size-5 stroke-[2.2]" />
              </div>
              <div className="text-left">
                <p className="text-[11px] sm:text-xs font-black text-slate-900 leading-tight">500+ Verified Doctors</p>
                <p className="text-[9px] sm:text-[11px] font-semibold text-slate-500">Board-Certified Specialists</p>
              </div>
            </div>

            {/* Bottom Anchored Doctor Booking Card */}
            <div className="absolute -bottom-4 sm:-bottom-5 inset-x-2 sm:inset-x-6 p-3 sm:p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-2xl shadow-slate-950/15 flex items-center justify-between gap-2.5 sm:gap-4 z-20">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="relative size-10 sm:size-12 rounded-2xl bg-[#637ff5] text-white flex items-center justify-center font-black shadow-md shrink-0">
                  <Stethoscope className="size-5 sm:size-6" />
                  <div className="absolute -top-1 -right-1 p-0.5 rounded-full bg-emerald-500 text-white">
                    <CheckCircle2 className="size-2.5 sm:size-3" />
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate">Dr. Priya Sharma</h4>
                    <ShieldCheck className="size-3.5 sm:size-4 text-[#637ff5] fill-[#eef3ff] shrink-0" />
                  </div>
                  <p className="text-[10px] sm:text-xs font-semibold text-slate-500 truncate">
                    Chief Cardiologist • Apollo Hospital
                  </p>
                  <div className="flex items-center gap-1.5 text-[9px] sm:text-[11px] font-bold text-emerald-600 mt-0.5">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <span>Next Slot: Today 4:15 PM</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onBookClick}
                className="shrink-0 px-3 sm:px-5 py-2 sm:py-3 rounded-xl bg-gradient-to-r from-[#5170f4] to-[#637ff5] hover:from-[#4361ee] hover:to-[#5170f4] text-white font-extrabold text-[11px] sm:text-sm shadow-md shadow-[#637ff5]/25 transition-all cursor-pointer flex items-center gap-1 sm:gap-1.5 active:scale-95"
              >
                <span>Book (₹800)</span>
                <ArrowRight className="size-3.5 sm:size-4" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
