import type { FC } from 'react'
import {
  ShieldCheck,
  Calendar,
  FileText,
  Smartphone,
  Users,
  Activity,
} from 'lucide-react'
import doctorImg from '@/assets/doctor-consultation.jpg'
import { FloatingBadge } from './FloatingBadge'

export const RegisterHero: FC = () => {
  const features = [
    {
      icon: Calendar,
      title: 'Book Appointments',
      description: 'Schedule with trusted hospitals',
      bgColor: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      icon: FileText,
      title: 'Manage Health Records',
      description: 'Keep your reports in one place',
      bgColor: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    {
      icon: ShieldCheck,
      title: 'Secure & Private',
      description: 'Your data is always protected',
      bgColor: 'bg-purple-50 text-purple-600 border-purple-100',
    },
    {
      icon: Smartphone,
      title: 'Access from Anywhere',
      description: 'On web and mobile devices',
      bgColor: 'bg-sky-50 text-sky-600 border-sky-100',
    },
  ]

  const stats = [
    { value: '10K+', label: 'Happy Patients' },
    { value: '500+', label: 'Partner Hospitals' },
    { value: '1K+', label: 'Verified Doctors' },
  ]

  return (
    <div className="flex flex-col justify-start space-y-6 lg:space-y-7">
      {/* Top Value Prop & Heading */}
      <div className="space-y-3">
        {/* Trust Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/70 text-blue-700 text-xs font-semibold shadow-xs">
          <ShieldCheck className="size-4 text-blue-600" />
          <span>Trusted Healthcare Platform</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-4xl lg:text-[44px] xl:text-[48px] font-black text-slate-900 tracking-tight leading-[1.15]">
          Better Care for a{' '}
          <span className="text-blue-600 block sm:inline">
            Healthier Tomorrow
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-slate-600 text-sm sm:text-base max-w-xl leading-relaxed">
          Join CarePlus to book appointments, manage your health records, and
          get the care you need from trusted hospitals and doctors.
        </p>
      </div>

      {/* Centerpiece: Features & Visual */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 lg:gap-6 items-center">
        {/* Features Column */}
        <div className="sm:col-span-6 space-y-3">
          {features.map((feature, idx) => {
            const IconComponent = feature.icon
            return (
              <div
                key={idx}
                className="group flex items-start gap-3 p-1.5 rounded-xl transition-all duration-200 hover:bg-white/80"
              >
                <div
                  className={`size-10 shrink-0 rounded-xl flex items-center justify-center border shadow-xs transition-transform duration-200 group-hover:scale-105 ${feature.bgColor}`}
                >
                  <IconComponent className="size-4.5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                    {feature.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Doctor Visual with Organic Backdrop & Floating Glass Badges */}
        <div className="sm:col-span-6 relative flex items-center justify-center">
          {/* Subtle glowing background orb */}
          <div className="absolute -inset-2 bg-gradient-to-tr from-blue-100 via-sky-50 to-indigo-100 rounded-3xl filter blur-xl opacity-70"></div>

          <div className="relative w-full max-w-[320px] rounded-3xl overflow-hidden shadow-xl shadow-blue-500/10 border-4 border-white aspect-[4/3] bg-slate-100">
            <img
              src={doctorImg}
              alt="CarePlus Doctor consulting patient"
              className="w-full h-full object-cover object-top transition-transform duration-700 hover:scale-105"
            />

            {/* Floating Glass Badge 1: Calendar */}
            <div className="absolute top-2.5 left-2.5">
              <FloatingBadge className="p-1.5">
                <div className="size-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Calendar className="size-3.5" />
                </div>
              </FloatingBadge>
            </div>

            {/* Floating Glass Badge 2: Users */}
            <div className="absolute top-2.5 right-2.5">
              <FloatingBadge className="p-1.5">
                <div className="size-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="size-3.5" />
                </div>
              </FloatingBadge>
            </div>

            {/* Floating Glass Badge 3: Pulse & Priority */}
            <div className="absolute bottom-2.5 right-2.5 left-2.5 sm:left-auto">
              <FloatingBadge className="py-1 px-2.5">
                <div className="size-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Activity className="size-3.5" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold text-slate-900 leading-tight">
                    Your Health
                  </p>
                  <p className="text-[9px] text-teal-600 font-semibold leading-tight">
                    Our Priority
                  </p>
                </div>
              </FloatingBadge>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Stats Row */}
      <div className="pt-3 border-t border-slate-200/70">
        <div className="grid grid-cols-3 gap-4 max-w-md">
          {stats.map((stat, idx) => (
            <div key={idx} className="space-y-0.5">
              <p className="text-2xl sm:text-3xl font-black tracking-tight text-blue-600">
                {stat.value}
              </p>
              <p className="text-xs font-medium text-slate-500">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
