import { useState, type FC } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CalendarOff,
  RefreshCw,
  ExternalLink,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { DoctorAppointmentCounts } from '@/services/doctorService'

interface DoctorAppointmentsCalendarNavProps {
  selectedDate: string | null
  onSelectDate: (date: string | null) => void
  counts: DoctorAppointmentCounts
  onRefresh: () => void
}

export const DoctorAppointmentsCalendarNav: FC<DoctorAppointmentsCalendarNavProps> = ({
  selectedDate,
  onSelectDate,
  counts,
  onRefresh,
}) => {
  const navigate = useNavigate()
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    if (selectedDate) return new Date(selectedDate)
    return new Date()
  })

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth() // 0-indexed

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]

  const daysOfWeek = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

  // Compute days in current month
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const numDays = lastDayOfMonth.getDate()

  // Day index of first day (0 = Sunday, 1 = Monday, ...). Adjust to Monday-first (0 = Monday, ..., 6 = Sunday)
  let startDay = firstDayOfMonth.getDay() - 1
  if (startDay === -1) startDay = 6

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  // Today's distribution calculation for the visual gauge
  const todayTotal = counts.today || 0
  const waitingPct = todayTotal > 0 ? Math.round((counts.todayWaiting / todayTotal) * 100) : 0
  const inProgressPct = todayTotal > 0 ? Math.round((counts.todayInProgress / todayTotal) * 100) : 0
  const completedPct = todayTotal > 0 ? Math.round((counts.todayCompleted / todayTotal) * 100) : 0
  const cancelledPct = todayTotal > 0 ? Math.round((counts.todayCancelled / todayTotal) * 100) : 0

  return (
    <div className="space-y-4">
      {/* 1. Mini Interactive Month Calendar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        {/* Month Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900 tracking-tight">
            {monthNames[month]} {year}
          </h3>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              title="Previous month"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                const now = new Date()
                setCurrentMonth(now)
                onSelectDate(todayStr)
              }}
              className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-extrabold cursor-pointer transition-colors"
            >
              Today
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              title="Next month"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {daysOfWeek.map((day) => (
            <span
              key={day}
              className="text-[11px] font-black text-slate-400 uppercase tracking-wider py-1"
            >
              {day}
            </span>
          ))}
        </div>

        {/* Calendar Days Grid */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {/* Empty cells before first day */}
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} className="h-8" />
          ))}

          {/* Days of current month */}
          {Array.from({ length: numDays }).map((_, i) => {
            const dayNum = i + 1
            const dayDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(
              dayNum
            ).padStart(2, '0')}`

            const isToday = dayDateStr === todayStr
            const isSelected = selectedDate === dayDateStr

            return (
              <button
                key={dayDateStr}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    onSelectDate(null) // deselect to return to tab default
                  } else {
                    onSelectDate(dayDateStr)
                  }
                }}
                className={`h-8 rounded-xl text-xs font-bold transition-all duration-150 flex items-center justify-center cursor-pointer relative ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs font-black'
                    : isToday
                    ? 'bg-blue-50 text-blue-700 font-black border border-blue-200'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {dayNum}
                {isToday && !isSelected && (
                  <span className="absolute bottom-1 size-1 rounded-full bg-blue-600" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. Today's OPD Status Gauge */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Today's OPD Status
            </span>
          </div>
          <span className="text-xs font-black text-slate-600 px-2.5 py-0.5 rounded-full bg-slate-100">
            {todayTotal} {todayTotal === 1 ? 'Patient' : 'Patients'}
          </span>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
          {todayTotal === 0 ? (
            <div className="w-full bg-slate-100 text-[10px] text-slate-400 font-bold flex items-center justify-center">
              No OPD booked today
            </div>
          ) : (
            <>
              {waitingPct > 0 && (
                <div
                  style={{ width: `${waitingPct}%` }}
                  className="bg-amber-400 transition-all duration-500"
                  title={`Waiting: ${counts.todayWaiting}`}
                />
              )}
              {inProgressPct > 0 && (
                <div
                  style={{ width: `${inProgressPct}%` }}
                  className="bg-blue-600 transition-all duration-500"
                  title={`In Consultation: ${counts.todayInProgress}`}
                />
              )}
              {completedPct > 0 && (
                <div
                  style={{ width: `${completedPct}%` }}
                  className="bg-emerald-500 transition-all duration-500"
                  title={`Completed: ${counts.todayCompleted}`}
                />
              )}
              {cancelledPct > 0 && (
                <div
                  style={{ width: `${cancelledPct}%` }}
                  className="bg-rose-400 transition-all duration-500"
                  title={`Cancelled: ${counts.todayCancelled}`}
                />
              )}
            </>
          )}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 pt-1 text-xs font-bold">
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-amber-50/70 border border-amber-100">
            <span className="size-2 rounded-full bg-amber-500 shrink-0" />
            <span className="text-amber-900 truncate">Waiting ({counts.todayWaiting})</span>
          </div>
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-blue-50/70 border border-blue-100">
            <span className="size-2 rounded-full bg-blue-600 shrink-0" />
            <span className="text-blue-900 truncate">In OPD ({counts.todayInProgress})</span>
          </div>
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
            <span className="size-2 rounded-full bg-emerald-600 shrink-0" />
            <span className="text-emerald-900 truncate">Treated ({counts.todayCompleted})</span>
          </div>
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-rose-50/70 border border-rose-100">
            <span className="size-2 rounded-full bg-rose-500 shrink-0" />
            <span className="text-rose-900 truncate">Cancelled ({counts.todayCancelled})</span>
          </div>
        </div>
      </div>

      {/* 3. Quick Action Buttons */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-2.5">
        <span className="text-xs font-black text-slate-900 uppercase tracking-wider block mb-2">
          Clinic Quick Actions
        </span>

        <button
          type="button"
          onClick={() => navigate('/doctor/schedule')}
          className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200/80 hover:border-blue-200 text-slate-700 hover:text-blue-700 text-xs font-bold flex items-center justify-between transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-blue-100/80 text-blue-600 flex items-center justify-center">
              <Clock className="size-4" />
            </div>
            <span>Weekly Routine Slots</span>
          </div>
          <ExternalLink className="size-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
        </button>

        <button
          type="button"
          onClick={() => navigate('/doctor/leaves')}
          className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 hover:bg-amber-50/70 border border-slate-200/80 hover:border-amber-200 text-slate-700 hover:text-amber-700 text-xs font-bold flex items-center justify-between transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-amber-100/80 text-amber-600 flex items-center justify-center">
              <CalendarOff className="size-4" />
            </div>
            <span>Apply Clinic Leave</span>
          </div>
          <ExternalLink className="size-3.5 text-slate-400 group-hover:text-amber-600 transition-colors" />
        </button>

        <button
          type="button"
          onClick={onRefresh}
          className="w-full px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-50 to-sky-50 hover:from-blue-100 hover:to-sky-100 border border-blue-200 text-blue-700 text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
        >
          <RefreshCw className="size-3.5" />
          <span>Sync Live Database</span>
        </button>
      </div>
    </div>
  )
}
