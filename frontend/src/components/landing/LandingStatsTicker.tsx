import { useState, useEffect, useRef, type FC } from 'react'
import {
  Users,
  Building2,
  Stethoscope,
  Smile,
  Clock,
} from 'lucide-react'

interface StatItem {
  id: string
  label: string
  subtitle: string
  targetValue: number
  prefix?: string
  suffix?: string
  decimals?: number
  icon: any
  color: string
}

export const LandingStatsTicker: FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hasAnimated, setHasAnimated] = useState(false)
  const [counts, setCounts] = useState<{ [key: string]: number }>({
    doctors: 0,
    patients: 0,
    hospitals: 0,
    satisfaction: 0,
    waitingTime: 0,
  })

  const stats: StatItem[] = [
    {
      id: 'doctors',
      label: 'Verified Doctors',
      subtitle: 'Board-Certified Specialists',
      targetValue: 500,
      suffix: '+',
      icon: Stethoscope,
      color: 'text-[#637ff5] bg-[#eef3ff]',
    },
    {
      id: 'patients',
      label: 'Patients Treated',
      subtitle: 'Across 15+ Cities',
      targetValue: 120,
      suffix: 'k+',
      icon: Users,
      color: 'text-[#5170f4] bg-[#eef3ff]',
    },
    {
      id: 'hospitals',
      label: 'Partner Hospitals',
      subtitle: 'NABH & JCI Accredited',
      targetValue: 18,
      suffix: '+',
      icon: Building2,
      color: 'text-[#7a94fd] bg-[#eef3ff]',
    },
    {
      id: 'satisfaction',
      label: 'Satisfaction Rate',
      subtitle: 'From Verified Reviews',
      targetValue: 98.8,
      suffix: '%',
      decimals: 1,
      icon: Smile,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      id: 'waitingTime',
      label: 'Average Wait Time',
      subtitle: 'Via Live Queue System',
      targetValue: 14,
      suffix: ' mins',
      prefix: '< ',
      icon: Clock,
      color: 'text-amber-600 bg-amber-50',
    },
  ]

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          animateCounters()
        }
      },
      { threshold: 0.25 }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [hasAnimated])

  const animateCounters = () => {
    const duration = 1800 // 1.8 seconds
    const startTime = performance.now()

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Ease out cubic for a snappy, responsive feel
      const easeOut = 1 - Math.pow(1 - progress, 3)

      const updatedCounts: { [key: string]: number } = {}
      stats.forEach((stat) => {
        updatedCounts[stat.id] = stat.targetValue * easeOut
      })

      setCounts(updatedCounts)

      if (progress < 1) {
        requestAnimationFrame(step)
      }
    }

    requestAnimationFrame(step)
  }

  return (
    <section
      ref={containerRef}
      className="py-10 sm:py-14 lg:py-16 bg-[#f8fbff]/70 border-y border-slate-200/80 relative overflow-hidden select-none"
    >
      {/* Subtle Ambient Glowing Backdrop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-32 bg-[#637ff5]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* ─────────────────────────────────────────────────────────────
            RESPONSIVE & BALANCED STATS GRID:
            - Mobile & Tablets (< lg): 2-column grid for cards 1-4,
              with card 5 spanning col-span-2 as an eye-catching full-width highlight banner.
              Zero awkward empty spots or chopped text!
            - Desktop (>= lg): Balanced 5-column single-row layout.
            ───────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5 items-stretch">
          {stats.map((stat) => {
            const Icon = stat.icon
            const currentValue = counts[stat.id] || 0
            const displayValue = stat.decimals
              ? currentValue.toFixed(stat.decimals)
              : Math.floor(currentValue).toLocaleString()

            const isWaitTime = stat.id === 'waitingTime'

            // Special Full-Width Highlight Card on Mobile (< lg)
            if (isWaitTime) {
              return (
                <div
                  key={stat.id}
                  onClick={animateCounters}
                  className="col-span-2 lg:col-span-1 p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-r lg:bg-gradient-to-b from-amber-50/70 via-white to-[#eef3ff]/60 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-[#c8d7fd] hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-300 flex flex-col sm:flex-row lg:flex-col items-center justify-between gap-3.5 text-center sm:text-left lg:text-center group cursor-pointer"
                >
                  <div className="flex items-center gap-3 shrink-0">
                    <div
                      className={`size-12 sm:size-13 lg:size-14 rounded-2xl ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs shrink-0`}
                    >
                      <Icon className="size-5 sm:size-6 lg:size-7 stroke-[2.2]" />
                    </div>

                    <div className="sm:hidden lg:block space-y-0.5">
                      <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight font-sans flex items-center justify-center gap-0.5">
                        <span className="text-slate-400 font-extrabold">{stat.prefix}</span>
                        <span>{displayValue}</span>
                        <span className="text-[#637ff5] text-xl sm:text-2xl lg:text-3xl font-extrabold ml-1">
                          mins
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                        {stat.label}
                      </h4>
                      <p className="text-[11px] sm:text-xs font-semibold text-slate-400">
                        {stat.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Tablet Horizontal Layout Middle details (sm to lg) */}
                  <div className="hidden sm:block lg:hidden flex-1 space-y-0.5">
                    <div className="text-3xl font-black text-slate-900 tracking-tight font-sans flex items-center gap-1">
                      <span className="text-slate-400 font-extrabold">{stat.prefix}</span>
                      <span>{displayValue}</span>
                      <span className="text-[#637ff5] text-2xl font-extrabold">mins</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-slate-900">{stat.label}</h4>
                      <span className="text-slate-300">•</span>
                      <p className="text-xs font-semibold text-slate-500">{stat.subtitle}</p>
                    </div>
                  </div>

                  {/* Live Status Badge */}
                  <div className="shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] sm:text-xs font-black shadow-2xs">
                    <span className="relative flex size-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
                    </span>
                    <span>Live Queue Sync</span>
                  </div>
                </div>
              )
            }

            // Standard Micro-Cards for Doctors, Patients, Hospitals, Satisfaction
            return (
              <div
                key={stat.id}
                onClick={animateCounters}
                className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-[#c8d7fd] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 flex flex-col items-center text-center justify-between group cursor-pointer"
              >
                <div
                  className={`size-11 sm:size-13 lg:size-14 rounded-2xl ${stat.color} flex items-center justify-center mb-2.5 sm:mb-3 group-hover:scale-110 transition-transform shadow-xs shrink-0`}
                >
                  <Icon className="size-5 sm:size-6 lg:size-7 stroke-[2.2]" />
                </div>

                <div className="space-y-1 w-full">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight font-sans leading-none flex items-center justify-center">
                    <span>{stat.prefix}</span>
                    <span>{displayValue}</span>
                    <span className="text-[#637ff5] text-lg sm:text-2xl lg:text-3xl font-extrabold ml-0.5">
                      {stat.suffix}
                    </span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-tight pt-1">
                    {stat.label}
                  </h4>

                  <p className="text-[10px] sm:text-xs font-semibold text-slate-400 truncate max-w-full">
                    {stat.subtitle}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
