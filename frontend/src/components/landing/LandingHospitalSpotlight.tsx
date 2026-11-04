import { type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2,
  MapPin,
  ShieldCheck,
  Bed,
  Ambulance,
  PhoneCall,
  Clock,
  ArrowRight,
} from 'lucide-react'

import apolloImg from '@/assets/apollo-hospital.jpg'
import cityCareImg from '@/assets/city-care-hospital.jpg'
import lifecareImg from '@/assets/lifecare-hospital.jpg'
import shreeSaiImg from '@/assets/shree-sai-hospital.jpg'

interface LandingHospitalSpotlightProps {
  onOpenEmergencyModal: () => void
}

export const LandingHospitalSpotlight: FC<LandingHospitalSpotlightProps> = ({
  onOpenEmergencyModal,
}) => {
  const navigate = useNavigate()

  const hospitals = [
    {
      id: 'hosp-1',
      name: 'Apollo Multispeciality Hospital',
      city: 'Bilaspur, Chhattisgarh',
      image: apolloImg,
      beds: '350 Beds',
      specialties: '24 Departments',
      accreditation: 'NABH & JCI Accredited',
      hasEmergency: true,
      opdTiming: '8:00 AM - 8:00 PM',
    },
    {
      id: 'hosp-2',
      name: 'City Care Super Speciality',
      city: 'Raipur, Chhattisgarh',
      image: cityCareImg,
      beds: '280 Beds',
      specialties: '18 Departments',
      accreditation: 'NABH Certified',
      hasEmergency: true,
      opdTiming: '9:00 AM - 9:00 PM',
    },
    {
      id: 'hosp-3',
      name: 'Lifecare Institute of Medical Sciences',
      city: 'Raipur, Chhattisgarh',
      image: lifecareImg,
      beds: '400 Beds',
      specialties: '28 Departments',
      accreditation: 'NHA & NABH Grade A',
      hasEmergency: true,
      opdTiming: '24/7 OPD & Emergency',
    },
    {
      id: 'hosp-4',
      name: 'Shree Sai Healthcare Center',
      city: 'Bilaspur, Chhattisgarh',
      image: shreeSaiImg,
      beds: '150 Beds',
      specialties: '12 Departments',
      accreditation: 'State Healthcare Partner',
      hasEmergency: true,
      opdTiming: '8:30 AM - 7:30 PM',
    },
  ]

  return (
    <section id="hospitals" className="scroll-mt-20 py-20 sm:py-28 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 border-b border-slate-100 pb-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#eef3ff] border border-[#c8d7fd] text-[#5170f4] text-xs font-black">
              <Building2 className="size-3.5 text-[#637ff5]" />
              <span>Accredited Hospital Network</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
              Premier Healthcare Infrastructure
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl leading-relaxed">
              Every affiliated hospital adheres to rigorous clinical safety audits, modern modular operation theaters, and integrated diagnostic laboratories.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/patient/hospitals')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer shrink-0"
          >
            <span>Explore All Hospitals</span>
            <ArrowRight className="size-3.5" />
          </button>
        </div>

        {/* Hospitals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {hospitals.map((hosp) => (
            <div
              key={hosp.id}
              onClick={() => navigate('/patient/hospitals')}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-md shadow-[#5170f4]/5 hover:border-[#c8d7fd] hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group cursor-pointer"
            >
              <div>
                {/* Hospital Photo with Badges */}
                <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={hosp.image}
                    alt={hosp.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-black text-[#5170f4] border border-white/80 shadow-xs flex items-center gap-1">
                    <ShieldCheck className="size-3 text-[#637ff5]" />
                    <span>{hosp.accreditation}</span>
                  </div>

                  {hosp.hasEmergency && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-rose-600 text-[10px] font-black text-white shadow-xs flex items-center gap-1">
                      <Ambulance className="size-3" />
                      <span>24/7 ICU</span>
                    </div>
                  )}
                </div>

                {/* Details Body */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                    <MapPin className="size-3.5 text-[#637ff5] shrink-0" />
                    <span className="truncate">{hosp.city}</span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 group-hover:text-[#637ff5] transition-colors line-clamp-1">
                    {hosp.name}
                  </h3>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-semibold text-slate-600">
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-1.5">
                      <Bed className="size-3.5 text-slate-400" />
                      <span>{hosp.beds}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-1.5">
                      <Clock className="size-3.5 text-slate-400" />
                      <span>{hosp.specialties}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-3 px-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#637ff5] group-hover:text-[#5170f4]">
                <span>View Doctors & Schedule</span>
                <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>

        {/* 24/7 Emergency Care Direct Hotline Callout */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-rose-600 via-rose-700 to-red-600 text-white shadow-xl shadow-rose-900/15 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="size-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <Ambulance className="size-7 stroke-[2.2]" />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-rose-200 text-xs font-black uppercase tracking-wider">
                <span className="size-2 rounded-full bg-white animate-ping" />
                <span>24/7 Rapid Emergency Response</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                Immediate Critical Care & Ambulance Dispatch
              </h3>
              <p className="text-xs sm:text-sm text-rose-100/90 font-medium max-w-xl">
                Call our centralized medical emergency desk for zero-delay ambulance dispatch, trauma support, and real-time ICU bed coordination.
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenEmergencyModal}
              className="px-6 py-3.5 rounded-2xl bg-white hover:bg-rose-50 text-rose-700 font-black text-xs sm:text-sm shadow-lg transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
            >
              <PhoneCall className="size-4" />
              <span>SOS Helpline: 1800-200-CARE</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
