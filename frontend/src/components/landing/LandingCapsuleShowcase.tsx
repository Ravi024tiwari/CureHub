import { useState, useRef, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  Activity,
  Lock,
  Stethoscope,
} from 'lucide-react'
import capsuleImg from '@/assets/puremed-capsule.png'

interface LandingCapsuleShowcaseProps {
  onBookClick: () => void
}

export const LandingCapsuleShowcase: FC<LandingCapsuleShowcaseProps> = ({ onBookClick }) => {
  const navigate = useNavigate()
  const sectionRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, posX: 0, posY: 0 })
  const [isHovered, setIsHovered] = useState(false)

  // 3D Parallax tilt effect on cursor move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!sectionRef.current) return
    const rect = sectionRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5

    setTilt({
      rotateX: y * -18, // Tilt up/down
      rotateY: x * 22,  // Tilt left/right
      posX: x * 20,
      posY: y * 20,
    })
  }

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0, posX: 0, posY: 0 })
    setIsHovered(false)
  }

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="relative py-12 sm:py-16 lg:py-20 overflow-hidden bg-white border-b border-slate-200/80 select-none"
    >
      {/* ─────────────────────────────────────────────────────────────
          1. Giant Background Watermark Typography (PureMed style)
          Desktop & Tablet: Large continuous parallax watermark
          Mobile: Cleanly bounded behind the capsule without wrapping
          ───────────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0">
        <span
          className="text-5xl sm:text-8xl md:text-[11rem] lg:text-[14rem] font-black tracking-widest text-slate-100/90 uppercase transition-transform duration-700 ease-out whitespace-nowrap select-none"
          style={{
            transform: `translate3d(${tilt.posX * -0.5}px, ${tilt.posY * -0.5}px, 0)`,
          }}
        >
          MEDICAL CAPSULE
        </span>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. Multi-Color Iridescent Ambient Glowing Orbs
          ───────────────────────────────────────────────────────────── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[700px] h-[300px] sm:h-[400px] bg-gradient-to-tr from-blue-500/15 via-purple-500/15 to-sky-400/15 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-glow" />
      <div className="absolute top-1/4 left-1/5 size-60 sm:size-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/5 size-60 sm:size-80 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Responsive Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6 sm:space-y-8 lg:space-y-10">

        {/* ─────────────────────────────────────────────────────────────
            TOP ROW:
            - Left: Coral Pulsing Bullet Badge
            - Right (Desktop/Tablet): Clinical Narrative Block
            - Mobile: Concise headline intro
            ───────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Top-Left: Red Coral Bullet Badge */}
          <div className="lg:col-span-6 space-y-3 text-center sm:text-left">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-rose-50 border border-rose-200/90 text-rose-700 shadow-2xs">
              <span className="relative flex size-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-2.5 bg-rose-600" />
              </span>
              <span className="text-xs sm:text-sm font-extrabold tracking-wide">
                Easy Access to Trusted Healthcare & Specialists
              </span>
            </div>

            {/* Mobile-Only Prominent Heading (Keeps mobile visual hierarchy clean & logical) */}
            <div className="block lg:hidden space-y-2 pt-1">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                Streamline Your <br />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
                  Health Care Journey
                </span>
              </h2>
              <p className="text-sm sm:text-base font-medium text-slate-600 leading-relaxed max-w-lg mx-auto sm:mx-0">
                Eliminate physical queues, consult certified medical specialists, track live hospital schedules, and store encrypted prescriptions in one unified patient hub.
              </p>
            </div>
          </div>

          {/* Top-Right: Clinical Narrative Block (Desktop / Tablet) */}
          <div className="hidden lg:block lg:col-span-6 space-y-2.5 text-left text-slate-600">
            <p className="text-xs sm:text-sm font-extrabold text-blue-600 uppercase tracking-widest">
              Welcome to CarePlus Health
            </p>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-snug">
              Your Health and Well-Being Are Our Highest Priority.
            </h3>
            <p className="text-sm sm:text-base font-medium text-slate-600 leading-relaxed max-w-xl">
              Our dedicated network of 500+ credentialed specialists and accredited hospitals delivers exceptional clinical precision across comprehensive medical departments — ensuring you receive immediate support, diagnostic accuracy, and compassionate attention.
            </p>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            CENTERPIECE: 3D Holographic Medical Capsule
            - On Desktop: Floating with Parallax Tilt & Satellite Cards
            - On Mobile: Safely framed within responsive stage with cards positioned cleanly inside
            ───────────────────────────────────────────────────────────── */}
        <div className="relative py-4 sm:py-6 lg:py-8 flex flex-col items-center justify-center">
          {/* 3D Tilt Wrapper */}
          <div
            className="relative transition-transform duration-300 ease-out cursor-grab active:cursor-grabbing max-w-full"
            style={{
              transform: `perspective(1200px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) translate3d(${tilt.posX}px, ${tilt.posY}px, 0)`,
            }}
          >
            {/* Soft Ambient Contact Shadow Underneath */}
            <div
              className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-56 sm:w-80 lg:w-96 h-8 sm:h-10 bg-slate-900/15 rounded-full blur-xl transition-all duration-300"
              style={{
                transform: `translateX(-50%) scale(${isHovered ? 0.9 : 1})`,
                opacity: isHovered ? 0.25 : 0.18,
              }}
            />

            {/* Glowing Iridescent Radial Rim */}
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/30 via-blue-500/25 to-sky-400/30 rounded-full blur-2xl -z-10 scale-105" />

            {/* The 3D Iridescent Capsule */}
            <div className="animate-float-pill flex justify-center">
              <img
                src={capsuleImg}
                alt="3D Holographic Medical Capsule"
                className="w-56 sm:w-72 md:w-88 lg:w-[410px] max-w-full h-auto drop-shadow-2xl transition-transform duration-500 hover:scale-105 select-none pointer-events-none"
              />
            </div>

            {/* Satellite Floating Micro-Card 1: Top Left */}
            <div
              className="absolute -top-2 sm:-top-5 left-0 sm:-left-10 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl shadow-blue-900/10 flex items-center gap-2.5 animate-float-slow transition-transform duration-500 z-20"
              style={{
                transform: `translate3d(${tilt.posX * 0.7}px, ${tilt.posY * 0.7}px, 20px)`,
              }}
            >
              <div className="size-8 sm:size-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner shrink-0">
                <Sparkles className="size-4 sm:size-4.5" />
              </div>
              <div className="text-left">
                <p className="text-xs sm:text-sm font-black text-slate-900 leading-tight">100% Genuine Care</p>
                <p className="text-[10px] sm:text-xs font-bold text-slate-500">Prescriptions & OPD</p>
              </div>
            </div>

            {/* Satellite Floating Micro-Card 2: Bottom Right */}
            <div
              className="absolute -bottom-2 sm:-bottom-5 right-0 sm:-right-10 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl shadow-blue-900/10 flex items-center gap-2.5 animate-float-reverse transition-transform duration-500 z-20"
              style={{
                transform: `translate3d(${tilt.posX * -0.7}px, ${tilt.posY * -0.7}px, 25px)`,
              }}
            >
              <div className="size-8 sm:size-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner shrink-0">
                <Clock className="size-4 sm:size-4.5 stroke-[2.2]" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
                  <p className="text-xs sm:text-sm font-black text-slate-900 leading-tight">Zero OPD Queues</p>
                </div>
                <p className="text-[10px] sm:text-xs font-bold text-emerald-600">Avg Wait: &lt; 14 mins</p>
              </div>
            </div>

            {/* Satellite Floating Micro-Card 3: Top Right (Tablet / Desktop) */}
            <div
              className="hidden md:flex absolute top-6 -right-16 px-4 py-2.5 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-lg shadow-black/5 items-center gap-2.5 animate-float-slow transition-transform duration-500 z-20"
              style={{
                transform: `translate3d(${tilt.posX * 1.1}px, ${tilt.posY * 1.1}px, 30px)`,
              }}
            >
              <ShieldCheck className="size-4.5 text-blue-600" />
              <span className="text-xs font-extrabold text-slate-800">NHA & ABHA Verified</span>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            BOTTOM ROW:
            - Left: Headline (Desktop), Subheadline & CTA Buttons
            - Right: 2x2 Feature Highlights Grid with High-Contrast Typography
            ───────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4 sm:pt-6 border-t border-slate-100">
          {/* Bottom-Left: Grand PureMed Headline & CTAs */}
          <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
            {/* Desktop Headline (Hidden on Mobile because it was already cleanly shown on top) */}
            <div className="hidden lg:block space-y-3">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Streamline Your <br />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
                  Health Care Journey
                </span>
              </h2>
              <p className="text-base sm:text-lg text-slate-600 font-medium max-w-lg leading-relaxed mx-auto lg:mx-0">
                Eliminate physical queues, consult certified medical specialists, track live hospital schedules, and store encrypted prescriptions in one unified patient hub.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3.5 justify-center lg:justify-start">
              <button
                type="button"
                onClick={onBookClick}
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm sm:text-base shadow-xl shadow-blue-600/25 transition-all cursor-pointer flex items-center justify-center gap-2.5 active:scale-95"
              >
                <span>Consult Top Specialists</span>
                <ArrowRight className="size-5" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/patient/doctors')}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200/90 font-bold text-sm sm:text-base transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Browse Doctor Directory</span>
              </button>
            </div>

            {/* Mobile Reassurance Notice */}
            <div className="block lg:hidden pt-2">
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/60 flex items-center gap-3 text-left">
                <div className="size-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Stethoscope className="size-4.5" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900 leading-tight">
                    Care Delivered by Board-Certified Specialists
                  </p>
                  <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                    NABH accredited hospitals with zero desk wait times
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom-Right: 4 Key Clinical Features with Enhanced Fonts */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3 sm:gap-4 text-left">
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1.5 hover:bg-white hover:shadow-md transition-all group">
              <div className="flex items-center gap-2 text-blue-600 font-black text-sm sm:text-base">
                <Clock className="size-5 shrink-0 group-hover:scale-110 transition-transform" />
                <span>Zero Desk Waiting</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                Direct OPD token entry via real-time queue tracking
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1.5 hover:bg-white hover:shadow-md transition-all group">
              <div className="flex items-center gap-2 text-indigo-600 font-black text-sm sm:text-base">
                <Activity className="size-5 shrink-0 group-hover:scale-110 transition-transform" />
                <span>Socket.IO Sync</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                Live doctor leave & reschedule notifications
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1.5 hover:bg-white hover:shadow-md transition-all group">
              <div className="flex items-center gap-2 text-sky-600 font-black text-sm sm:text-base">
                <ShieldCheck className="size-5 shrink-0 group-hover:scale-110 transition-transform" />
                <span>NABH Accredited</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                Top hospital network with multi-specialty ICUs
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1.5 hover:bg-white hover:shadow-md transition-all group">
              <div className="flex items-center gap-2 text-emerald-600 font-black text-sm sm:text-base">
                <Lock className="size-5 shrink-0 group-hover:scale-110 transition-transform" />
                <span>Encrypted Locker</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                Prescriptions and diagnostic reports always accessible
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
