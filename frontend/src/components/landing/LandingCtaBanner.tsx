import { type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, ArrowRight, ShieldCheck, Stethoscope } from 'lucide-react'

interface LandingCtaBannerProps {
  onBookClick: () => void
}

export const LandingCtaBanner: FC<LandingCtaBannerProps> = ({ onBookClick }) => {
  const navigate = useNavigate()

  return (
    <section className="py-14 sm:py-20 bg-[#f8fbff] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-[#7a94fd] via-[#8ba3fe] to-[#a2b4ff] text-white p-8 sm:p-12 lg:p-16 overflow-hidden shadow-2xl shadow-indigo-500/20 border border-white/40">
          
          {/* Subtle Ambient Glowing Orbs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-300/30 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-6 text-center sm:text-left">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/35 text-white text-xs sm:text-sm font-extrabold shadow-2xs">
              <Sparkles className="size-4 text-amber-200" />
              <span>Take Control Of Your Health Today</span>
            </div>

            {/* Main Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Ready to Experience Effortless,{' '}
              <span className="text-white drop-shadow-sm">
                Modern Healthcare?
              </span>
            </h2>

            {/* Subheadline Description */}
            <p className="text-sm sm:text-base lg:text-lg text-white/95 font-medium leading-relaxed max-w-2xl">
              Eliminate physical OPD queues, access board-certified specialists, and manage your family's health records in one encrypted hub.
            </p>

            {/* CTA Buttons Cluster (PureMed Pill Button Style) */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3.5 justify-center sm:justify-start">
              <button
                type="button"
                onClick={onBookClick}
                className="w-full sm:w-auto px-8 py-4 rounded-full sm:rounded-2xl bg-white hover:bg-slate-50 text-[#3b5bfd] hover:text-[#2d4df0] font-black text-sm sm:text-base shadow-xl shadow-indigo-950/20 transition-all cursor-pointer flex items-center justify-center gap-2.5 active:scale-95"
              >
                <span>Book Doctor Consultation</span>
                <ArrowRight className="size-5 text-[#3b5bfd]" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/register/doctor')}
                className="w-full sm:w-auto px-7 py-4 rounded-full sm:rounded-2xl bg-white/15 hover:bg-white/25 text-white border border-white/35 font-bold text-sm sm:text-base backdrop-blur-md transition-all cursor-pointer flex items-center justify-center gap-2.5 active:scale-95"
              >
                <Stethoscope className="size-5 text-white" />
                <span>Join as a Doctor</span>
              </button>
            </div>

            {/* Bottom Assurance Pills */}
            <div className="pt-4 flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4 text-xs sm:text-sm text-white/90 font-semibold">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-white" />
                <span>ABHA & Ayushman Bharat Compatible</span>
              </div>
              <span className="opacity-70">•</span>
              <div>Zero Platform Convenience Charges</div>
              <span className="opacity-70">•</span>
              <div>256-Bit SSL Health Security</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
