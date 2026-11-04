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
    const duration = 2000 // 2 seconds
    const startTime = performance.now()

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Ease out cubic
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
    <section ref={containerRef} className="py-10 sm:py-14 bg-white border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            const currentValue = counts[stat.id] || 0
            const displayValue = stat.decimals
              ? currentValue.toFixed(stat.decimals)
              : Math.floor(currentValue).toLocaleString()

            return (
              <div
                key={stat.id}
                className="flex flex-col items-center text-center p-3 sm:p-4 rounded-2xl hover:bg-[#f8faff] transition-colors group"
              >
                <div
                  className={`size-13 sm:size-14 rounded-2xl ${stat.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-xs`}
                >
                  <Icon className="size-6 sm:size-7 stroke-[2.2]" />
                </div>

                <div className="space-y-1">
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight font-mono">
                    <span>{stat.prefix}</span>
                    <span>{displayValue}</span>
                    <span className="text-[#637ff5]">{stat.suffix}</span>
                  </div>
                  <h4 className="text-sm sm:text-base font-black text-slate-900">
                    {stat.label}
                  </h4>
                  <p className="text-xs sm:text-sm font-semibold text-slate-500">
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
