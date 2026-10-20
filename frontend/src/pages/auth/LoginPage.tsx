import type { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { LoginHeader } from '@/components/auth/LoginHeader'
import { LoginHero } from '@/components/auth/LoginHero'
import { LoginForm } from '@/components/auth/LoginForm'
import { Card, CardContent } from '@/components/ui/card'
import type { AuthUser } from '@/types/auth'
import consultationImg from '@/assets/careplus-consultation.jpg'
import {
  ShieldCheck,
  Users,
  Building2,
  Stethoscope,
} from 'lucide-react'

export const LoginPage: FC = () => {
  const navigate = useNavigate()

  const handleLoginSuccess = (_user: AuthUser) => {
    // Navigate to role-aware dashboard
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#f8fbff] text-slate-900 selection:bg-blue-100 selection:text-blue-700 overflow-x-hidden">
      {/* Top Navbar */}
      <LoginHeader onSignUpClick={() => navigate('/register/patient')} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-0 md:px-6 lg:px-8 py-0 md:py-6 lg:py-8 flex flex-col justify-center overflow-x-hidden">
        {/* Mobile View (< md): Spacious, informative banner with lowered login card */}
        <div className="md:hidden w-full overflow-hidden">
          <div className="relative w-full min-h-[300px] sm:min-h-[330px] overflow-hidden bg-[#0d3b66] px-5 pt-5 pb-9 flex flex-col justify-end text-white select-none">
            {/* Background Doctor & Patient Consultation Photo */}
            <img
              src={consultationImg}
              alt="CarePlus Healthcare Consultation"
              className="absolute inset-0 w-full h-full object-cover object-[52%_10%] opacity-70"
            />
            {/* CarePlus Brand Blue Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a2540] via-[#1d4ed8]/35 to-transparent pointer-events-none" />

            {/* Complete Hero Content & Key Info on Mobile */}
            <div className="relative z-10 space-y-2.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-semibold text-white w-fit border border-white/30 shadow-xs">
                <ShieldCheck className="size-3.5 text-sky-300" />
                <span>Trusted Healthcare Platform</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                Your Health, <br />
                <span className="text-sky-300">Our Priority</span>
              </h1>

              <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed max-w-xs">
                Access quality healthcare, book appointments, and manage your medical records.
              </p>

              {/* Informative Stats Chips */}
              <div className="flex items-center gap-2 pt-1 overflow-x-auto no-scrollbar">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-[10px] font-semibold text-sky-100 border border-white/20">
                  <Users className="size-3 text-sky-300" />
                  10K+ Patients
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-[10px] font-semibold text-sky-100 border border-white/20">
                  <Building2 className="size-3 text-sky-300" />
                  500+ Hospitals
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-[10px] font-semibold text-sky-100 border border-white/20">
                  <Stethoscope className="size-3 text-sky-300" />
                  1K+ Doctors
                </span>
              </div>
            </div>
          </div>

          {/* White Sheet Login Card (Lowered down with natural overlap so the banner breathes) */}
          <div className="relative z-20 -mt-4 w-full bg-white rounded-t-[32px] px-5 sm:px-6 pt-6 pb-10 shadow-2xl shadow-blue-950/20 border-t border-slate-100">
            <LoginForm onSuccess={handleLoginSuccess} />
          </div>
        </div>

        {/* Tablet & Desktop Split Grid (md+): 2-Column Responsive Layout */}
        <div className="hidden md:grid md:grid-cols-12 gap-6 lg:gap-10 xl:gap-14 items-center w-full">
          {/* Left Column: Full Hero Section with Single-Line Headline & Ambient Visual */}
          <div className="md:col-span-6 lg:col-span-7 w-full relative">
            <LoginHero />
          </div>

          {/* Right Column: Elevated Interactive Login Card */}
          <div className="md:col-span-6 lg:col-span-5 w-full flex justify-center relative z-10">
            <Card className="w-full max-w-lg mx-auto rounded-[28px] border border-slate-200/80 bg-white shadow-2xl shadow-blue-900/10 overflow-hidden transition-all duration-300">
              <CardContent className="p-6 sm:p-8 lg:p-9">
                <LoginForm onSuccess={handleLoginSuccess} />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-slate-400 border-t border-slate-100 bg-white/50 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 CarePlus Healthcare. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-500">
            <a href="#privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-blue-600 transition-colors">Terms of Service</a>
            <a href="#support" className="hover:text-blue-600 transition-colors">Help Center</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
export default LoginPage
