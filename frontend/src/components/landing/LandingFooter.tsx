import { type FC } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  HeartPulse,
  PhoneCall,
  Mail,
  MapPin,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react'

interface LandingFooterProps {
  onOpenEmergencyModal: () => void
}

export const LandingFooter: FC<LandingFooterProps> = ({ onOpenEmergencyModal }) => {
  const navigate = useNavigate()

  return (
    <footer className="bg-gradient-to-b from-[#6f8bf9] via-[#617ef7] to-[#5170f4] text-white border-t border-white/20 relative overflow-hidden">
      {/* Decorative Ambient Radial Glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-60 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-60 bg-indigo-950/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-18 space-y-12 relative z-10">
        {/* Main 5-Column Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10">
          {/* Brand & Mission (Col 1 & 2) */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="size-11 rounded-2xl bg-white text-[#5170f4] flex items-center justify-center shadow-lg shadow-indigo-950/20 group-hover:scale-105 transition-transform">
                <HeartPulse className="size-6 stroke-[2.4]" />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                Care<span className="text-blue-100">Plus</span>
              </span>
            </Link>

            <p className="text-white/90 text-sm font-medium leading-relaxed max-w-sm">
              India's premier connected healthcare ecosystem uniting verified clinical specialists, accredited multi-speciality hospitals, and patients through real-time OPD queue transparency.
            </p>

            {/* Quick Contact Info */}
            <div className="space-y-2 pt-1 text-xs sm:text-sm text-white/90 font-medium">
              <div className="flex items-center gap-2.5">
                <PhoneCall className="size-4 text-white shrink-0" />
                <span>Central Helpdesk: +91 (07752) 409-200</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="size-4 text-white shrink-0" />
                <span>support@careplushealth.in</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="size-4 text-white shrink-0" />
                <span>Healthcare Tech Hub, Bilaspur & Raipur, CG</span>
              </div>
            </div>
          </div>

          {/* Col 3: For Patients */}
          <div className="space-y-3.5">
            <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white border-b border-white/20 pb-2 inline-block">
              For Patients
            </h4>
            <ul className="space-y-2.5 font-semibold text-xs sm:text-sm text-white/90">
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/patient/doctors')}
                  className="hover:text-white hover:translate-x-1 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ChevronRight className="size-3.5 opacity-70" />
                  <span>Find Doctors</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/patient/hospitals')}
                  className="hover:text-white hover:translate-x-1 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ChevronRight className="size-3.5 opacity-70" />
                  <span>Explore Hospitals</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/patient/articles')}
                  className="hover:text-white hover:translate-x-1 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ChevronRight className="size-3.5 opacity-70" />
                  <span>Health Articles & Guides</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/patient/appointments')}
                  className="hover:text-white hover:translate-x-1 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ChevronRight className="size-3.5 opacity-70" />
                  <span>My Appointments</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/patient/records')}
                  className="hover:text-white hover:translate-x-1 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ChevronRight className="size-3.5 opacity-70" />
                  <span>Medical Records Locker</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: For Doctors & Hospitals */}
          <div className="space-y-3.5">
            <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white border-b border-white/20 pb-2 inline-block">
              Medical Partners
            </h4>
            <ul className="space-y-2.5 font-semibold text-xs sm:text-sm text-white/90">
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/register/doctor')}
                  className="hover:text-white hover:translate-x-1 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ChevronRight className="size-3.5 opacity-70" />
                  <span>Join as Doctor</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/register/hospital-admin')}
                  className="hover:text-white hover:translate-x-1 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ChevronRight className="size-3.5 opacity-70" />
                  <span>Partner as Hospital</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/doctor/articles')}
                  className="hover:text-white hover:translate-x-1 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ChevronRight className="size-3.5 opacity-70" />
                  <span>Doctor Author Studio</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="hover:text-white hover:translate-x-1 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ChevronRight className="size-3.5 opacity-70" />
                  <span>Practitioner Portal</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 5: 24/7 Emergency */}
          <div className="space-y-3.5">
            <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white border-b border-white/20 pb-2 inline-block">
              Critical Emergency
            </h4>
            <div className="p-4 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 space-y-2.5">
              <p className="text-xs sm:text-sm text-white font-black leading-snug">
                Immediate Ambulance & ICU Coordination
              </p>
              <button
                type="button"
                onClick={onOpenEmergencyModal}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 text-rose-600 hover:text-rose-700 font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
              >
                <PhoneCall className="size-4" />
                <span>1800-200-CARE</span>
              </button>
            </div>
            <p className="text-xs text-white/85">
              National Emergency: Dial <strong className="text-white font-black underline">108</strong>
            </p>
          </div>
        </div>

        {/* Clinical Disclaimer & Copyright */}
        <div className="pt-8 border-t border-white/20 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/85">
          <p className="text-center md:text-left max-w-2xl leading-relaxed">
            <strong className="text-white">Medical Disclaimer:</strong> CarePlus provides digital appointment scheduling and health records infrastructure. The platform does not directly provide emergency trauma treatment. In life-threatening emergencies, immediately dial 108 or visit the closest emergency department.
          </p>

          <div className="flex items-center gap-2 shrink-0 font-bold text-white">
            <ShieldCheck className="size-4 text-white" />
            <span>© 2026 CarePlus Technologies. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
