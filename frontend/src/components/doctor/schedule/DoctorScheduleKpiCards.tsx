import { useMemo, type FC } from 'react'
import { Calendar, Clock, Timer, CalendarOff, TrendingUp } from 'lucide-react'
import type { DoctorScheduleRule, DoctorLeaveItem } from '@/services/doctorService'

interface DoctorScheduleKpiCardsProps {
  scheduleRules: DoctorScheduleRule[]
  leaves: DoctorLeaveItem[]
}

export const DoctorScheduleKpiCards: FC<DoctorScheduleKpiCardsProps> = ({
  scheduleRules,
  leaves,
}) => {
  const stats = useMemo(() => {
    // 1. Working days
    const uniqueDays = new Set(scheduleRules.map((r) => r.dayOfWeek))
    const workingDaysCount = uniqueDays.size

    let workingDaysSummary = 'Custom Schedule'
    if (workingDaysCount === 5 && !uniqueDays.has(0) && !uniqueDays.has(6)) {
      workingDaysSummary = 'Mon - Fri (Sat-Sun Off)'
    } else if (workingDaysCount === 6 && !uniqueDays.has(0)) {
      workingDaysSummary = 'Mon - Sat (Sun Off)'
    } else if (workingDaysCount === 7) {
      workingDaysSummary = 'All 7 Days Active'
    } else if (workingDaysCount === 0) {
      workingDaysSummary = 'All Days Off'
    }

    // 2. Total hours per week
    let totalMinutesWeek = 0
    for (const rule of scheduleRules) {
      const [sh, sm] = (rule.startTime || '09:00').split(':').map(Number)
      const [eh, em] = (rule.endTime || '13:00').split(':').map(Number)
      const durationMin = eh * 60 + em - (sh * 60 + sm)
      if (durationMin > 0) totalMinutesWeek += durationMin
    }
    const totalHours = Math.round((totalMinutesWeek / 60) * 10) / 10

    // 3. Slot duration
    const slotDuration = scheduleRules[0]?.slotDurationMinutes || 20

    // 4. Upcoming leaves
    const todayStr = new Date().toISOString().split('T')[0]
    const upcomingLeaves = leaves.filter((l) => l.date >= todayStr).sort((a, b) => a.date.localeCompare(b.date))
    const leaveCount = upcomingLeaves.length

    let nextLeaveText = 'None scheduled'
    if (leaveCount > 0) {
      const firstDate = new Date(upcomingLeaves[0].date)
      const formatted = firstDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
      nextLeaveText = `${formatted} (${upcomingLeaves[0].reason || '1 day'})`
    }

    return {
      workingDaysCount,
      workingDaysSummary,
      totalHours,
      slotDuration,
      leaveCount,
      nextLeaveText,
    }
  }, [scheduleRules, leaves])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* 1. Working Days */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex items-center gap-4 transition-all hover:border-blue-300">
        <div className="size-13 rounded-2xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600 shrink-0">
          <Calendar className="size-6 stroke-[2.2]" />
        </div>
        <div className="min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {stats.workingDaysCount}
            </span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Working Days / Week
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500 truncate mt-0.5">
            {stats.workingDaysSummary}
          </p>
        </div>
      </div>

      {/* 2. Total Hours */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex items-center gap-4 transition-all hover:border-emerald-300">
        <div className="size-13 rounded-2xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600 shrink-0">
          <Clock className="size-6 stroke-[2.2]" />
        </div>
        <div className="min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {stats.totalHours}
            </span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Hours / Week
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 mt-0.5">
            <TrendingUp className="size-3.5 stroke-[2.5]" />
            <span>Optimal clinical capacity</span>
          </div>
        </div>
      </div>

      {/* 3. Slot Duration */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex items-center gap-4 transition-all hover:border-purple-300">
        <div className="size-13 rounded-2xl bg-purple-50 border border-purple-200/60 flex items-center justify-center text-purple-600 shrink-0">
          <Timer className="size-6 stroke-[2.2]" />
        </div>
        <div className="min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {stats.slotDuration}
            </span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Minutes per Slot
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500 truncate mt-0.5">
            Standard OPD consultation
          </p>
        </div>
      </div>

      {/* 4. Upcoming Leaves */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex items-center gap-4 transition-all hover:border-amber-300">
        <div className="size-13 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600 shrink-0">
          <CalendarOff className="size-6 stroke-[2.2]" />
        </div>
        <div className="min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {stats.leaveCount}
            </span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Upcoming {stats.leaveCount === 1 ? 'Leave' : 'Leaves'}
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500 truncate mt-0.5" title={stats.nextLeaveText}>
            {stats.nextLeaveText}
          </p>
        </div>
      </div>
    </div>
  )
}
