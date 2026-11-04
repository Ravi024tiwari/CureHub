import { useState, useEffect, type FC } from 'react'
import {
  ShieldCheck,
  Star,
  Clock,
  Building2,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { fetchDoctorsListApi } from '@/services/patientService'
import type { DoctorCardData } from '@/types/patient'

import drPriyaImg from '@/assets/dr-priya-sharma.jpg'
import drRajeshImg from '@/assets/dr-rajesh-verma.jpg'
import drSnehaImg from '@/assets/dr-sneha-patel.jpg'
import drAmitImg from '@/assets/dr-amit-singh.jpg'

interface LandingDoctorMarqueeProps {
  onBookDoctor: (doctor: DoctorCardData) => void
}

const FALLBACK_DOCTORS: DoctorCardData[] = [
  {
    _id: 'doc-1',
    name: 'Dr. Priya Sharma',
    avatar: drPriyaImg,
    specialty: 'Cardiologist',
    department: 'Cardiology',
    qualifications: ['MBBS', 'MD', 'DM (Cardiology)'],
    experienceYears: 12,
    consultationFee: 800,
    rating: 4.9,
    reviewCount: 340,
    hospitalName: 'Apollo Hospital',
    hospitalLocation: 'Bilaspur',
    availableStatus: 'Today 4:00 PM',
  },
  {
    _id: 'doc-2',
    name: 'Dr. Rajesh Verma',
    avatar: drRajeshImg,
    specialty: 'Neurologist',
    department: 'Neurology',
    qualifications: ['MBBS', 'MS', 'MCh (Neuro)'],
    experienceYears: 15,
    consultationFee: 900,
    rating: 4.8,
    reviewCount: 410,
    hospitalName: 'City Care Multispeciality',
    hospitalLocation: 'Raipur',
    availableStatus: 'Tomorrow 10:30 AM',
  },
  {
    _id: 'doc-3',
    name: 'Dr. Sneha Patel',
    avatar: drSnehaImg,
    specialty: 'Dermatologist',
    department: 'Dermatology',
    qualifications: ['MBBS', 'MD (Dermatology)'],
    experienceYears: 9,
    consultationFee: 700,
    rating: 4.9,
    reviewCount: 290,
    hospitalName: 'Shree Sai Hospital',
    hospitalLocation: 'Bilaspur',
    availableStatus: 'Today 5:30 PM',
  },
  {
    _id: 'doc-4',
    name: 'Dr. Amit Singh',
    avatar: drAmitImg,
    specialty: 'Orthopedic Surgeon',
    department: 'Orthopedics',
    qualifications: ['MBBS', 'MS (Ortho)'],
    experienceYears: 14,
    consultationFee: 750,
    rating: 4.7,
    reviewCount: 380,
    hospitalName: 'Lifecare Super Speciality',
    hospitalLocation: 'Raipur',
    availableStatus: 'Today 6:00 PM',
  },
  {
    _id: 'doc-5',
    name: 'Dr. Ananya Roy',
    avatar: drPriyaImg,
    specialty: 'Pediatrician',
    department: 'Pediatrics',
    qualifications: ['MBBS', 'DCH', 'DNB'],
    experienceYears: 10,
    consultationFee: 650,
    rating: 4.9,
    reviewCount: 520,
    hospitalName: 'Apollo Children Wing',
    hospitalLocation: 'Bilaspur',
    availableStatus: 'Tomorrow 9:00 AM',
  },
  {
    _id: 'doc-6',
    name: 'Dr. Vikram Malhotra',
    avatar: drRajeshImg,
    specialty: 'General Physician',
    department: 'General OPD',
    qualifications: ['MBBS', 'MD (Medicine)'],
    experienceYears: 16,
    consultationFee: 600,
    rating: 4.8,
    reviewCount: 610,
    hospitalName: 'City Care Hospital',
    hospitalLocation: 'Bilaspur',
    availableStatus: 'Today 3:30 PM',
  },
]

export const LandingDoctorMarquee: FC<LandingDoctorMarqueeProps> = ({ onBookDoctor }) => {
  const [doctors, setDoctors] = useState<DoctorCardData[]>(FALLBACK_DOCTORS)

  useEffect(() => {
    async function loadDoctors() {
      try {
        const res = await fetchDoctorsListApi({ page: 1, limit: 12 })
        if (res && res.doctors && res.doctors.length >= 4) {
          setDoctors(res.doctors)
        }
      } catch (err) {
        // Retain fallback doctors
      }
    }
    loadDoctors()
  }, [])

  // Duplicate for seamless -50% infinite translation
  const rowOne = [...doctors, ...doctors]
  const rowTwo = [...doctors.slice().reverse(), ...doctors.slice().reverse()]

  return (
    <section id="doctors" className="scroll-mt-20 py-14 sm:py-20 lg:py-28 bg-[#f8fbff] overflow-hidden relative select-none">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#637ff5]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2.5 sm:space-y-4 mb-8 sm:mb-12 lg:mb-16">
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-[#eef3ff] border border-[#c8d7fd] text-[#5170f4] text-[11px] sm:text-xs font-extrabold shadow-2xs">
          <Sparkles className="size-3.5 sm:size-4 text-[#637ff5]" />
          <span>StarMedical Verified Specialists</span>
        </div>
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
          Consult With India's Top Clinical Specialists
        </h2>
        <p className="text-xs sm:text-base lg:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
          Over 500+ credentialed physicians across premier multi-speciality hospitals. Hover or tap any card to pause and schedule an appointment instantly.
        </p>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          ROW 1: Left-to-Right Dual Infinite Moving Track
          - Responsive card sizing: w-[215px] on mobile, w-[260px] on tablet, w-[310px] on desktop
          - Decreased mobile footprint so cards easily fit without being cut off
          - Pause on hover and touch
          ───────────────────────────────────────────────────────────── */}
      <div className="relative w-full overflow-hidden mb-4 sm:mb-6 py-1 sm:py-2 group">
        {/* Responsive edge blur mask: small on mobile so cards stay fully visible */}
        <div className="absolute inset-y-0 left-0 w-8 sm:w-16 md:w-24 lg:w-36 bg-gradient-to-r from-[#f8fbff] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-8 sm:w-16 md:w-24 lg:w-36 bg-gradient-to-l from-[#f8fbff] to-transparent z-10 pointer-events-none" />

        <div className="animate-marquee gap-3 sm:gap-4 lg:gap-5 flex items-center hover:[animation-play-state:paused] active:[animation-play-state:paused]">
          {rowOne.map((doc, idx) => (
            <div
              key={`r1-${doc._id}-${idx}`}
              onClick={() => onBookDoctor(doc)}
              className="w-[215px] sm:w-[260px] lg:w-[310px] shrink-0 bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 lg:p-5 border border-slate-200/80 shadow-md shadow-[#5170f4]/5 hover:border-[#c8d7fd] hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex flex-col justify-between group/card cursor-pointer"
            >
              <div className="space-y-2.5 sm:space-y-3.5">
                {/* Doctor Avatar & Badges */}
                <div className="flex items-start gap-2.5 sm:gap-3.5">
                  <div className="relative size-12 sm:size-15 lg:size-17 rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 ring-2 ring-[#637ff5]/20 shrink-0">
                    <img
                      src={doc.avatar || drPriyaImg}
                      alt={doc.name}
                      className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1 p-0.5 rounded-full bg-emerald-500 text-white shadow-xs">
                      <ShieldCheck className="size-2.5 sm:size-3.5" />
                    </div>
                  </div>

                  <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-1 text-[10px] sm:text-xs font-black text-amber-500">
                      <Star className="size-3 sm:size-3.5 fill-amber-400 text-amber-400" />
                      <span>{doc.rating || 4.9}</span>
                      <span className="text-slate-400 font-medium text-[9px] sm:text-xs">
                        ({doc.reviewCount || 300}+)
                      </span>
                    </div>

                    <h3 className="text-xs sm:text-sm lg:text-base font-black text-slate-900 truncate group-hover/card:text-[#637ff5] transition-colors leading-snug">
                      {doc.name}
                    </h3>

                    <p className="text-[10px] sm:text-xs lg:text-sm font-bold text-[#637ff5] truncate">
                      {doc.specialty || doc.department || 'Specialist'}
                    </p>
                  </div>
                </div>

                {/* Hospital and Experience */}
                <div className="p-2 sm:p-2.5 lg:p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1 sm:space-y-1.5 text-[11px] sm:text-xs text-slate-600">
                  <div className="flex items-center gap-1 sm:gap-1.5 truncate font-medium">
                    <Building2 className="size-3 sm:size-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{doc.hospitalName || 'CarePlus Hospital'}</span>
                  </div>
                  <div className="flex items-center justify-between pt-0.5 sm:pt-1 border-t border-slate-200/60 font-semibold">
                    <span className="text-slate-500 text-[10px] sm:text-xs">{doc.experienceYears || 10}+ yrs exp</span>
                    <span className="text-slate-900 font-black text-[11px] sm:text-sm">₹{doc.consultationFee || 700}</span>
                  </div>
                </div>

                {/* Next Slot Pill */}
                <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-bold text-emerald-700 bg-emerald-50 px-2 sm:px-2.5 lg:px-3 py-1 sm:py-1.5 rounded-lg border border-emerald-200/60">
                  <span className="size-1.5 sm:size-2 rounded-full bg-emerald-500 animate-ping" />
                  <Clock className="size-3 sm:size-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">Next: {doc.availableStatus || 'Today Available'}</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onBookDoctor(doc)
                }}
                className="mt-2.5 sm:mt-3.5 lg:mt-4 w-full py-2 sm:py-2.5 lg:py-3 rounded-xl bg-gradient-to-r from-[#5170f4] via-[#637ff5] to-[#7a94fd] hover:from-[#4361ee] hover:to-[#637ff5] text-white font-extrabold text-[11px] sm:text-xs lg:text-sm shadow-md shadow-[#637ff5]/20 transition-all cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 active:scale-95"
              >
                <span>Book Appointment</span>
                <ArrowRight className="size-3 sm:size-3.5 lg:size-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          ROW 2: Right-to-Left Reverse Dual Infinite Moving Track
          - Symmetrical responsive sizing and smooth counter-flow animation
          ───────────────────────────────────────────────────────────── */}
      <div className="relative w-full overflow-hidden py-1 sm:py-2 group">
        {/* Responsive edge blur mask */}
        <div className="absolute inset-y-0 left-0 w-8 sm:w-16 md:w-24 lg:w-36 bg-gradient-to-r from-[#f8fbff] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-8 sm:w-16 md:w-24 lg:w-36 bg-gradient-to-l from-[#f8fbff] to-transparent z-10 pointer-events-none" />

        <div className="animate-marquee-reverse gap-3 sm:gap-4 lg:gap-5 flex items-center hover:[animation-play-state:paused] active:[animation-play-state:paused]">
          {rowTwo.map((doc, idx) => (
            <div
              key={`r2-${doc._id}-${idx}`}
              onClick={() => onBookDoctor(doc)}
              className="w-[215px] sm:w-[260px] lg:w-[310px] shrink-0 bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 lg:p-5 border border-slate-200/80 shadow-md shadow-[#5170f4]/5 hover:border-[#c8d7fd] hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex flex-col justify-between group/card cursor-pointer"
            >
              <div className="space-y-2.5 sm:space-y-3.5">
                <div className="flex items-start gap-2.5 sm:gap-3.5">
                  <div className="relative size-12 sm:size-15 lg:size-17 rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 ring-2 ring-[#637ff5]/20 shrink-0">
                    <img
                      src={doc.avatar || drRajeshImg}
                      alt={doc.name}
                      className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1 p-0.5 rounded-full bg-emerald-500 text-white shadow-xs">
                      <ShieldCheck className="size-2.5 sm:size-3.5" />
                    </div>
                  </div>

                  <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-1 text-[10px] sm:text-xs font-black text-amber-500">
                      <Star className="size-3 sm:size-3.5 fill-amber-400 text-amber-400" />
                      <span>{doc.rating || 4.9}</span>
                      <span className="text-slate-400 font-medium text-[9px] sm:text-xs">
                        ({doc.reviewCount || 300}+)
                      </span>
                    </div>

                    <h3 className="text-xs sm:text-sm lg:text-base font-black text-slate-900 truncate group-hover/card:text-[#637ff5] transition-colors leading-snug">
                      {doc.name}
                    </h3>

                    <p className="text-[10px] sm:text-xs lg:text-sm font-bold text-[#637ff5] truncate">
                      {doc.specialty || doc.department || 'Specialist'}
                    </p>
                  </div>
                </div>

                <div className="p-2 sm:p-2.5 lg:p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1 sm:space-y-1.5 text-[11px] sm:text-xs text-slate-600">
                  <div className="flex items-center gap-1 sm:gap-1.5 truncate font-medium">
                    <Building2 className="size-3 sm:size-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{doc.hospitalName || 'CarePlus Hospital'}</span>
                  </div>
                  <div className="flex items-center justify-between pt-0.5 sm:pt-1 border-t border-slate-200/60 font-semibold">
                    <span className="text-slate-500 text-[10px] sm:text-xs">{doc.experienceYears || 10}+ yrs exp</span>
                    <span className="text-slate-900 font-black text-[11px] sm:text-sm">₹{doc.consultationFee || 700}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-bold text-emerald-700 bg-emerald-50 px-2 sm:px-2.5 lg:px-3 py-1 sm:py-1.5 rounded-lg border border-emerald-200/60">
                  <span className="size-1.5 sm:size-2 rounded-full bg-emerald-500 animate-ping" />
                  <Clock className="size-3 sm:size-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">Next: {doc.availableStatus || 'Today Available'}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onBookDoctor(doc)
                }}
                className="mt-2.5 sm:mt-3.5 lg:mt-4 w-full py-2 sm:py-2.5 lg:py-3 rounded-xl bg-gradient-to-r from-[#5170f4] via-[#637ff5] to-[#7a94fd] hover:from-[#4361ee] hover:to-[#637ff5] text-white font-extrabold text-[11px] sm:text-xs lg:text-sm shadow-md shadow-[#637ff5]/20 transition-all cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 active:scale-95"
              >
                <span>Book Appointment</span>
                <ArrowRight className="size-3 sm:size-3.5 lg:size-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
