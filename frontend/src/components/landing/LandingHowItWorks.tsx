import { type FC } from 'react'
import {
  Search,
  CalendarCheck,
  BellRing,
  FileText,
  Sparkles,
  ArrowRight,
} from 'lucide-react'

export const LandingHowItWorks: FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Find Verified Doctors',
      description:
        'Search across 500+ board-certified specialists by condition, clinical qualification, location, and transparent fees.',
      icon: Search,
      badge: 'Certified Directory',
      color: 'from-blue-600 to-indigo-600',
    },
    {
      number: '02',
      title: 'Select In-Person Slot',
      description:
        'Choose convenient consultation times with live hospital calendar synchronization. No waiting in early morning lines.',
      icon: CalendarCheck,
      badge: 'Zero Waiting Queue',
      color: 'from-indigo-600 to-sky-600',
    },
    {
      number: '03',
      title: 'Real-Time Notifications',
      description:
        'Get live queue alerts and socket notifications. If a physician goes on leave, receive instant alerts with priority reschedule.',
      icon: BellRing,
      badge: 'Socket.IO Powered',
      color: 'from-sky-600 to-emerald-600',
    },
    {
      number: '04',
      title: '100% Digital Health Records',
      description:
        'Access prescriptions, diagnostic lab reports, vitals tracking, and doctor follow-up notes in your encrypted digital health locker.',
      icon: FileText,
      badge: 'Encrypted & Safe',
      color: 'from-emerald-600 to-teal-600',
    },
  ]

  return (
    <section id="how-it-works" className="scroll-mt-20 py-20 sm:py-28 bg-[#f8fbff] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-black">
            <Sparkles className="size-3.5 text-blue-600" />
            <span>Seamless Healthcare Experience</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            How CarePlus Transforms Patient Care
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
            From search to post-consultation recovery, our digital platform eliminates hospital waiting friction and keeps you informed every step.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon

            return (
              <div
                key={step.number}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-md shadow-blue-900/5 hover:border-blue-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Subtle Watermark Step Number */}
                <span className="absolute -top-3 -right-2 text-7xl font-black text-slate-100 group-hover:text-blue-50 transition-colors pointer-events-none select-none">
                  {step.number}
                </span>

                <div className="space-y-4 relative z-10">
                  <div
                    className={`size-13 rounded-2xl bg-gradient-to-tr ${step.color} text-white flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="size-6 stroke-[2.2]" />
                  </div>

                  <span className="inline-block text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                    {step.badge}
                  </span>

                  <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                    {step.title}
                  </h3>

                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400 group-hover:text-blue-600 transition-colors">
                  <span>Step {idx + 1} of 4</span>
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
