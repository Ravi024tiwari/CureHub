import type { FC } from 'react'
import {
  Calendar,
  FileText,
  Building2,
  ShieldCheck,
} from 'lucide-react'
import consultationImg from '@/assets/careplus-consultation.jpg'

export const LoginHero: FC = () => {
  const features = [
    {
      icon: Calendar,
      title: 'Easy Appointments',
      description: 'Book appointments with top doctors',
      iconBg: 'bg-blue-100/80 text-blue-600',
      badge: '24/7 Booking',
    },
    {
      icon: FileText,
      title: 'Manage Records',
      description: 'Keep your health records safe',
      iconBg: 'bg-emerald-100/80 text-emerald-600',
      badge: 'EHR Cloud',
    },
    {
      icon: Building2,
      title: 'Trusted Hospitals',
      description: 'Connect with verified hospitals',
      iconBg: 'bg-purple-100/80 text-purple-600',
      badge: 'Verified Care',
    },
    {
      icon: ShieldCheck,
      title: 'Secure & Private',
      description: 'Your data is always protected',
      iconBg: 'bg-indigo-100/80 text-indigo-600',
      badge: 'HIPAA Standard',
    },
  ]

  const stats = [
    { value: '10K+', label: 'Patients', sub: 'Active community' },
    { value: '500+', label: 'Partner Hospitals', sub: 'Verified clinics' },
    { value: '1K+', label: 'Verified Doctors', sub: 'Specialist physicians' },
  ]

  return (
    <div className="relative w-full flex flex-col justify-between min-h-[560px] lg:min-h-[580px] py-2 pr-0 lg:pr-2 select-none">
      {/* 
        Ambient Blended Consultation Visual:
        Anchored on the right side of the hero section below the headline,
        dissolving smoothly on all sides with a refined radial-gradient mask.
      */}
      <div className="absolute right-[-8px] lg:right-[-12px] xl:right-[0px] top-[20%] xl:top-[18%] w-[310px] lg:w-[350px] xl:w-[400px] h-[390px] lg:h-[440px] xl:h-[480px] pointer-events-none select-none z-0">
        <img
          src={consultationImg}
          alt="CarePlus Doctor and patient consultation"
          className="w-full h-full object-cover object-[50%_18%]"
          style={{
            maskImage:
              'radial-gradient(ellipse 68% 64% at 52% 48%, rgba(0,0,0,1) 45%, rgba(0,0,0,0.85) 70%, rgba(0,0,0,0.12) 90%, transparent 100%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 68% 64% at 52% 48%, rgba(0,0,0,1) 45%, rgba(0,0,0,0.85) 70%, rgba(0,0,0,0.12) 90%, transparent 100%)',
          }}
        />
      </div>

      {/* Hero Content Layer */}
      <div className="relative z-10 space-y-6">
        {/* Trust Badge with Interactive Pulse */}
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/90 border border-blue-200/70 text-blue-700 text-xs font-semibold shadow-xs backdrop-blur-xs transition-transform duration-200 hover:scale-105 cursor-default">
            <ShieldCheck className="size-4 text-blue-600 animate-pulse" />
            <span>Trusted by 10,000+ patients</span>
          </div>
        </div>

        {/* Big Bold Headline in a Single Line on Large Screens & Subtitle */}
        <div className="space-y-3 max-w-xl xl:max-w-2xl">
          <h1 className="text-3xl sm:text-4xl lg:text-[40px] xl:text-[46px] font-black text-slate-900 tracking-tight leading-tight lg:whitespace-nowrap">
            Your Health, <span className="text-blue-600">Our Priority</span>
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-md lg:max-w-lg">
            Access quality healthcare, book appointments, manage your medical
            records, and connect with trusted hospitals — all in one place.
          </p>
        </div>

        {/* 4 Feature Items with Interactive Hover Effects */}
        <div className="space-y-2.5 max-w-[270px] pt-1">
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <div
                key={idx}
                className="group flex items-center gap-3 p-2 rounded-2xl border border-transparent hover:border-slate-200/80 hover:bg-white hover:shadow-md hover:shadow-blue-900/5 transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer"
              >
                <div
                  className={`size-10 shrink-0 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-110 shadow-xs ${feature.iconBg}`}
                >
                  <Icon className="size-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-tight truncate">
                    {feature.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottom Stats Row with Interactive Micro-Animations */}
      <div className="relative z-10 pt-6 mt-6 border-t border-slate-200/70">
        <div className="grid grid-cols-3 gap-4 max-w-sm">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="p-2 rounded-2xl transition-all duration-200 hover:bg-white hover:shadow-xs group cursor-default"
            >
              <p className="text-2xl sm:text-3xl font-black text-blue-600 tracking-tight transition-transform duration-200 group-hover:scale-105">
                {stat.value}
              </p>
              <p className="text-xs font-bold text-slate-700 leading-snug">{stat.label}</p>
              <p className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">{stat.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
export default LoginHero
