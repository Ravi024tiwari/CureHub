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

  // Split into 2 rows for the dual-speed infinite marquee
  const rowOne = [...doctors, ...doctors]
  const rowTwo = [...doctors.slice().reverse(), ...doctors.slice().reverse()]

  return (
    <section id="doctors" className="scroll-mt-20 py-20 sm:py-28 bg-[#f8fbff] overflow-hidden relative">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs sm:text-sm font-extrabold">
          <Sparkles className="size-4 text-blue-600" />
          <span>StarMedical Verified Specialists</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
          Consult With India's Top Clinical Specialists
        </h2>
        <p className="text-sm sm:text-base lg:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
          Over 500+ credentialed physicians across premier multi-speciality hospitals. Hover any card to pause and schedule an appointment instantly.
        </p>
      </div>

      {/* Row 1: Left-to-Right Infinite Moving Track */}
      <div className="relative w-full overflow-hidden mb-6 py-2">
        {/* Soft edge blur mask */}
        <div className="absolute inset-y-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-[#f8fbff] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-[#f8fbff] to-transparent z-10 pointer-events-none" />

        <div className="animate-marquee gap-5 flex items-center">
          {rowOne.map((doc, idx) => (
            <div
              key={`r1-${doc._id}-${idx}`}
              className="w-72 sm:w-80 shrink-0 bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-md shadow-blue-900/5 hover:border-blue-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="space-y-3.5">
                {/* Doctor Avatar & Badges */}
                <div className="flex items-start gap-3.5">
                  <div className="relative size-16 sm:size-18 rounded-2xl overflow-hidden bg-slate-100 ring-2 ring-blue-500/20 shrink-0">
                    <img
                      src={doc.avatar || drPriyaImg}
                      alt={doc.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-1 right-1 p-0.5 rounded-full bg-emerald-500 text-white shadow-xs">
                      <ShieldCheck className="size-3.5" />
                    </div>
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-1 text-xs font-black text-amber-500">
                      <Star className="size-3.5 fill-amber-400" />
                      <span>{doc.rating || 4.9}</span>
                      <span className="text-slate-400 font-medium">
                        ({doc.reviewCount || 300}+)
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                      {doc.name}
                    </h3>

                    <p className="text-xs sm:text-sm font-bold text-blue-600 truncate">
                      {doc.specialty || doc.department || 'Specialist'}
                    </p>
                  </div>
                </div>

                {/* Hospital and Experience */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5 truncate font-medium">
                    <Building2 className="size-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{doc.hospitalName || 'CarePlus Hospital'}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 font-semibold">
                    <span className="text-slate-500">{doc.experienceYears || 10}+ yrs exp</span>
                    <span className="text-slate-900 font-black">₹{doc.consultationFee || 700}</span>
                  </div>
                </div>

                {/* Next Slot Pill */}
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200/60">
                  <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
                  <Clock className="size-3.5 text-emerald-600" />
                  <span>Next Slot: {doc.availableStatus || 'Today Available'}</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => onBookDoctor(doc)}
                className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
              >
                <span>Book Appointment</span>
                <ArrowRight className="size-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Row 2: Right-to-Left Reverse Infinite Moving Track */}
      <div className="relative w-full overflow-hidden py-2">
        {/* Soft edge blur mask */}
        <div className="absolute inset-y-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-[#f8fbff] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-[#f8fbff] to-transparent z-10 pointer-events-none" />

        <div className="animate-marquee-reverse gap-5 flex items-center">
          {rowTwo.map((doc, idx) => (
            <div
              key={`r2-${doc._id}-${idx}`}
              className="w-72 sm:w-80 shrink-0 bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-md shadow-blue-900/5 hover:border-blue-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="space-y-3.5">
                <div className="flex items-start gap-3.5">
                  <div className="relative size-16 sm:size-18 rounded-2xl overflow-hidden bg-slate-100 ring-2 ring-blue-500/20 shrink-0">
                    <img
                      src={doc.avatar || drRajeshImg}
                      alt={doc.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-1 right-1 p-0.5 rounded-full bg-emerald-500 text-white shadow-xs">
                      <ShieldCheck className="size-3.5" />
                    </div>
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-1 text-xs font-black text-amber-500">
                      <Star className="size-3.5 fill-amber-400" />
                      <span>{doc.rating || 4.9}</span>
                      <span className="text-slate-400 font-medium">
                        ({doc.reviewCount || 300}+)
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                      {doc.name}
                    </h3>

                    <p className="text-xs sm:text-sm font-bold text-blue-600 truncate">
                      {doc.specialty || doc.department || 'Specialist'}
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5 truncate font-medium">
                    <Building2 className="size-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{doc.hospitalName || 'CarePlus Hospital'}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 font-semibold">
                    <span className="text-slate-500">{doc.experienceYears || 10}+ yrs exp</span>
                    <span className="text-slate-900 font-black">₹{doc.consultationFee || 700}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200/60">
                  <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
                  <Clock className="size-3.5 text-emerald-600" />
                  <span>Next Slot: {doc.availableStatus || 'Today Available'}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onBookDoctor(doc)}
                className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
              >
                <span>Book Appointment</span>
                <ArrowRight className="size-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
