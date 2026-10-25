import { useState, useEffect, type FC } from 'react'
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Copy,
  Save,
  Check,
} from 'lucide-react'
import type { DoctorScheduleRule } from '@/services/doctorService'
import { CompactTimeSelect } from './CompactTimeSelect'

interface DayScheduleState {
  dayOfWeek: number
  dayName: string
  isActive: boolean
  shift1: { startTime: string; endTime: string }
  shift2?: { startTime: string; endTime: string } | null
  slotDurationMinutes: number
}

const DAYS_META = [
  { dayOfWeek: 1, dayName: 'Monday' },
  { dayOfWeek: 2, dayName: 'Tuesday' },
  { dayOfWeek: 3, dayName: 'Wednesday' },
  { dayOfWeek: 4, dayName: 'Thursday' },
  { dayOfWeek: 5, dayName: 'Friday' },
  { dayOfWeek: 6, dayName: 'Saturday' },
  { dayOfWeek: 0, dayName: 'Sunday' },
]

const SLOT_DURATIONS = [
  { value: 15, label: '15 min' },
  { value: 20, label: '20 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '60 min' },
]

interface DoctorWeeklyScheduleEditorProps {
  scheduleRules: DoctorScheduleRule[]
  isSaving: boolean
  onSave: (rules: DoctorScheduleRule[]) => Promise<boolean>
  onRulesChanged?: (rules: DoctorScheduleRule[]) => void
}

export const DoctorWeeklyScheduleEditor: FC<DoctorWeeklyScheduleEditorProps> = ({
  scheduleRules,
  isSaving,
  onSave,
  onRulesChanged,
}) => {
  const [daysState, setDaysState] = useState<DayScheduleState[]>([])
  const [globalSlotDuration, setGlobalSlotDuration] = useState<number>(20)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Map incoming flat scheduleRules to 7 days
  useEffect(() => {
    const initialDays: DayScheduleState[] = DAYS_META.map((m) => {
      const matchingRules = scheduleRules.filter((r) => r.dayOfWeek === m.dayOfWeek)
      const isActive = matchingRules.length > 0
      const shift1 = matchingRules[0]
        ? { startTime: matchingRules[0].startTime, endTime: matchingRules[0].endTime }
        : { startTime: '09:00', endTime: '13:00' }
      const shift2 = matchingRules[1]
        ? { startTime: matchingRules[1].startTime, endTime: matchingRules[1].endTime }
        : null
      const slotDurationMinutes = matchingRules[0]?.slotDurationMinutes || 20

      return {
        dayOfWeek: m.dayOfWeek,
        dayName: m.dayName,
        isActive,
        shift1,
        shift2,
        slotDurationMinutes,
      }
    })

    setDaysState(initialDays)
    if (scheduleRules[0]?.slotDurationMinutes) {
      setGlobalSlotDuration(scheduleRules[0].slotDurationMinutes)
    }
  }, [scheduleRules])

  // Convert current daysState to flat DoctorScheduleRule[]
  const toFlatRules = (days: DayScheduleState[]): DoctorScheduleRule[] => {
    const rules: DoctorScheduleRule[] = []
    for (const d of days) {
      if (d.isActive) {
        rules.push({
          dayOfWeek: d.dayOfWeek,
          startTime: d.shift1.startTime,
          endTime: d.shift1.endTime,
          slotDurationMinutes: d.slotDurationMinutes,
        })
        if (d.shift2) {
          rules.push({
            dayOfWeek: d.dayOfWeek,
            startTime: d.shift2.startTime,
            endTime: d.shift2.endTime,
            slotDurationMinutes: d.slotDurationMinutes,
          })
        }
      }
    }
    return rules
  }

  // Notify parent of changes for real-time live preview
  const updateDaysStateAndNotify = (newDays: DayScheduleState[]) => {
    setDaysState(newDays)
    if (onRulesChanged) {
      onRulesChanged(toFlatRules(newDays))
    }
  }

  // Toggle active day
  const handleToggleDay = (dayOfWeek: number) => {
    const updated = daysState.map((d) => {
      if (d.dayOfWeek === dayOfWeek) {
        const nextActive = !d.isActive
        return {
          ...d,
          isActive: nextActive,
          // Give default shift if toggling on with no shifts
          shift1: d.shift1 || { startTime: '09:00', endTime: '13:00' },
        }
      }
      return d
    })
    updateDaysStateAndNotify(updated)
  }

  // Shift 1 change
  const handleShift1Change = (
    dayOfWeek: number,
    field: 'startTime' | 'endTime',
    value: string
  ) => {
    const updated = daysState.map((d) => {
      if (d.dayOfWeek === dayOfWeek) {
        return {
          ...d,
          shift1: { ...d.shift1, [field]: value },
        }
      }
      return d
    })
    updateDaysStateAndNotify(updated)
  }

  // Shift 2 change
  const handleShift2Change = (
    dayOfWeek: number,
    field: 'startTime' | 'endTime',
    value: string
  ) => {
    const updated = daysState.map((d) => {
      if (d.dayOfWeek === dayOfWeek && d.shift2) {
        return {
          ...d,
          shift2: { ...d.shift2, [field]: value },
        }
      }
      return d
    })
    updateDaysStateAndNotify(updated)
  }

  // Add shift 2
  const handleAddShift2 = (dayOfWeek: number) => {
    const updated = daysState.map((d) => {
      if (d.dayOfWeek === dayOfWeek) {
        return {
          ...d,
          isActive: true,
          shift2: { startTime: '17:00', endTime: '20:00' },
        }
      }
      return d
    })
    updateDaysStateAndNotify(updated)
  }

  // Remove shift 2
  const handleRemoveShift2 = (dayOfWeek: number) => {
    const updated = daysState.map((d) => {
      if (d.dayOfWeek === dayOfWeek) {
        return {
          ...d,
          shift2: null,
        }
      }
      return d
    })
    updateDaysStateAndNotify(updated)
  }

  // Change slot duration for specific day
  const handleSlotDurationChange = (dayOfWeek: number, duration: number) => {
    const updated = daysState.map((d) => {
      if (d.dayOfWeek === dayOfWeek) {
        return { ...d, slotDurationMinutes: duration }
      }
      return d
    })
    updateDaysStateAndNotify(updated)
  }

  // Copy day timing to all active days
  const handleCopyDayToAll = (sourceDayOfWeek: number) => {
    const source = daysState.find((d) => d.dayOfWeek === sourceDayOfWeek)
    if (!source) return

    const updated = daysState.map((d) => {
      // Don't copy to Sunday by default unless user explicitly copied from Sunday
      if (d.dayOfWeek === 0 && sourceDayOfWeek !== 0) return d

      return {
        ...d,
        isActive: true,
        shift1: { ...source.shift1 },
        shift2: source.shift2 ? { ...source.shift2 } : null,
        slotDurationMinutes: source.slotDurationMinutes,
      }
    })
    updateDaysStateAndNotify(updated)
  }

  // Apply default slot duration to all days
  const handleApplyDurationToAll = () => {
    const updated = daysState.map((d) => ({
      ...d,
      slotDurationMinutes: globalSlotDuration,
    }))
    updateDaysStateAndNotify(updated)
  }

  // Save changes
  const handleSaveAll = async () => {
    const flatRules = toFlatRules(daysState)
    const success = await onSave(flatRules)
    if (success) {
      setSuccessMessage('Weekly routine saved successfully!')
      setTimeout(() => setSuccessMessage(null), 4000)
    }
  }

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-6">
      {/* Card Header & Global Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="size-4 stroke-[2.2]" />
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Weekly Schedule
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Set your available days, time slots and slot duration for appointments.
          </p>
        </div>

        {/* Global duration & apply */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/90 rounded-2xl px-3 py-1.5 shadow-2xs">
            <Clock className="size-3.5 text-slate-400" />
            <span className="text-xs font-bold text-slate-600">Default Slot Duration:</span>
            <select
              value={globalSlotDuration}
              onChange={(e) => setGlobalSlotDuration(Number(e.target.value))}
              className="text-xs font-black text-blue-700 bg-transparent focus:outline-none cursor-pointer"
            >
              {SLOT_DURATIONS.map((dur) => (
                <option key={dur.value} value={dur.value}>
                  {dur.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleApplyDurationToAll}
            className="px-3.5 py-1.5 rounded-2xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/60 font-bold text-xs transition-all cursor-pointer active:scale-[0.98]"
          >
            Apply to All Days
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5 animate-in fade-in duration-200">
          <Check className="size-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Days Table / Grid */}
      <div className="space-y-3">
        {/* Desktop Layout with clean min-width & no text clipping */}
        <div className="hidden lg:block overflow-x-auto pb-2">
          <div className="min-w-[860px] space-y-3">
            {/* Table Header */}
            <div className="grid grid-cols-[105px_125px_215px_245px_100px_70px] gap-3 px-4 py-2.5 text-[11px] font-black uppercase tracking-wider text-slate-400 bg-slate-50/90 rounded-2xl border border-slate-100">
              <div>Day</div>
              <div>Status</div>
              <div>Shift 1</div>
              <div>Shift 2</div>
              <div>Duration</div>
              <div className="text-right">Actions</div>
            </div>

            {/* Day Rows */}
            {daysState.map((day) => (
              <div
                key={day.dayOfWeek}
                className={`grid grid-cols-[105px_125px_215px_245px_100px_70px] gap-3 items-center p-3.5 px-4 rounded-2xl border transition-all ${
                  day.isActive
                    ? 'bg-white border-slate-200/90 hover:border-blue-200 shadow-2xs'
                    : 'bg-slate-50/70 border-slate-200/50 opacity-80'
                }`}
              >
                {/* 1. Day Name */}
                <div className="font-black text-sm text-slate-900">{day.dayName}</div>

                {/* 2. Status Toggle */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleDay(day.dayOfWeek)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      day.isActive ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        day.isActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      day.isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        : 'bg-slate-200/80 text-slate-600'
                    }`}
                  >
                    {day.isActive ? 'Active' : 'Day Off'}
                  </span>
                </div>

                {/* 3. Shift 1 */}
                <div>
                  {day.isActive ? (
                    <div className="flex items-center gap-1.5">
                      <CompactTimeSelect
                        value={day.shift1.startTime}
                        onChange={(val) =>
                          handleShift1Change(day.dayOfWeek, 'startTime', val)
                        }
                        className="w-[92px] shrink-0"
                      />
                      <span className="text-xs font-bold text-slate-400 shrink-0">—</span>
                      <CompactTimeSelect
                        value={day.shift1.endTime}
                        onChange={(val) =>
                          handleShift1Change(day.dayOfWeek, 'endTime', val)
                        }
                        className="w-[92px] shrink-0"
                      />
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-slate-400 italic">Clinic Closed</span>
                  )}
                </div>

                {/* 4. Shift 2 */}
                <div>
                  {day.isActive ? (
                    day.shift2 ? (
                      <div className="flex items-center gap-1.5">
                        <CompactTimeSelect
                          value={day.shift2.startTime}
                          onChange={(val) =>
                            handleShift2Change(day.dayOfWeek, 'startTime', val)
                          }
                          className="w-[92px] shrink-0"
                        />
                        <span className="text-xs font-bold text-slate-400 shrink-0">—</span>
                        <CompactTimeSelect
                          value={day.shift2.endTime}
                          onChange={(val) =>
                            handleShift2Change(day.dayOfWeek, 'endTime', val)
                          }
                          className="w-[92px] shrink-0"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveShift2(day.dayOfWeek)}
                          title="Remove Shift 2"
                          className="size-6 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center cursor-pointer transition-colors shrink-0 border border-transparent hover:border-rose-200"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAddShift2(day.dayOfWeek)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 font-bold text-xs border border-dashed border-slate-300 hover:border-blue-300 transition-colors cursor-pointer"
                      >
                        <Plus className="size-3.5" />
                        <span>Add Shift</span>
                      </button>
                    )
                  ) : (
                    <span className="text-xs font-bold text-slate-300">—</span>
                  )}
                </div>

                {/* 5. Slot Duration */}
                <div>
                  {day.isActive ? (
                    <select
                      value={day.slotDurationMinutes}
                      onChange={(e) =>
                        handleSlotDurationChange(day.dayOfWeek, Number(e.target.value))
                      }
                      className="w-[82px] px-2 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:border-blue-500 focus:outline-none cursor-pointer shadow-2xs"
                    >
                      {SLOT_DURATIONS.map((dur) => (
                        <option key={dur.value} value={dur.value}>
                          {dur.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-xs font-bold text-slate-300">—</span>
                  )}
                </div>

                {/* 6. Row Actions */}
                <div className="flex items-center justify-end gap-1.5">
                  {day.isActive ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleCopyDayToAll(day.dayOfWeek)}
                        title={`Copy ${day.dayName} timings to all active days`}
                        className="size-7 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center cursor-pointer transition-colors"
                      >
                        <Copy className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleDay(day.dayOfWeek)}
                        title="Set Day Off"
                        className="size-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center cursor-pointer transition-colors"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleToggleDay(day.dayOfWeek)}
                      title="Activate Day"
                      className="size-7 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 flex items-center justify-center cursor-pointer transition-colors"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile / Tablet Responsive Layout */}
        <div className="lg:hidden space-y-3">
          {daysState.map((day) => (
            <div
              key={day.dayOfWeek}
              className={`p-4 rounded-2xl border transition-all space-y-3 ${
                day.isActive
                  ? 'bg-white border-slate-200/90 shadow-2xs'
                  : 'bg-slate-50/70 border-slate-200/50 opacity-80'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="font-black text-sm text-slate-900">{day.dayName}</span>
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      day.isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        : 'bg-slate-200/80 text-slate-600'
                    }`}
                  >
                    {day.isActive ? 'Active' : 'Day Off'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleDay(day.dayOfWeek)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      day.isActive ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        day.isActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {day.isActive ? (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  {/* Shift 1 with un-wrappable label */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 shrink-0 w-14 whitespace-nowrap">
                      Shift 1:
                    </span>
                    <div className="flex-1 flex items-center gap-1.5 min-w-0">
                      <CompactTimeSelect
                        value={day.shift1.startTime}
                        onChange={(val) =>
                          handleShift1Change(day.dayOfWeek, 'startTime', val)
                        }
                        className="flex-1 min-w-0"
                      />
                      <span className="text-slate-400 font-bold shrink-0">—</span>
                      <CompactTimeSelect
                        value={day.shift1.endTime}
                        onChange={(val) =>
                          handleShift1Change(day.dayOfWeek, 'endTime', val)
                        }
                        className="flex-1 min-w-0"
                      />
                    </div>
                  </div>

                  {/* Shift 2 with un-wrappable label */}
                  {day.shift2 ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 shrink-0 w-14 whitespace-nowrap">
                        Shift 2:
                      </span>
                      <div className="flex-1 flex items-center gap-1.5 min-w-0">
                        <CompactTimeSelect
                          value={day.shift2.startTime}
                          onChange={(val) =>
                            handleShift2Change(day.dayOfWeek, 'startTime', val)
                          }
                          className="flex-1 min-w-0"
                        />
                        <span className="text-slate-400 font-bold shrink-0">—</span>
                        <CompactTimeSelect
                          value={day.shift2.endTime}
                          onChange={(val) =>
                            handleShift2Change(day.dayOfWeek, 'endTime', val)
                          }
                          className="flex-1 min-w-0"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveShift2(day.dayOfWeek)}
                          className="size-8 rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-100 flex items-center justify-center shrink-0 transition-colors"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleAddShift2(day.dayOfWeek)}
                      className="w-full py-2 rounded-xl border border-dashed border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/50 text-xs font-bold text-slate-600 hover:text-blue-600 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Plus className="size-3.5" />
                      <span>Add Evening Shift</span>
                    </button>
                  )}

                  {/* Duration and Copy to All */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-bold">Duration:</span>
                      <select
                        value={day.slotDurationMinutes}
                        onChange={(e) =>
                          handleSlotDurationChange(day.dayOfWeek, Number(e.target.value))
                        }
                        className="px-2.5 py-1 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 shadow-2xs"
                      >
                        {SLOT_DURATIONS.map((dur) => (
                          <option key={dur.value} value={dur.value}>
                            {dur.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyDayToAll(day.dayOfWeek)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xs transition-colors cursor-pointer"
                    >
                      <Copy className="size-3.5" />
                      <span>Copy to all</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-xs font-bold text-slate-400 italic pt-1">
                  Clinic is closed on this day.
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Save Button CTA */}
      <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {successMessage && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold animate-in fade-in slide-in-from-left-2 duration-200">
              <Check className="size-3.5 text-emerald-600 stroke-[3]" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleSaveAll}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98]"
        >
          {isSaving ? (
            <>
              <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save className="size-4" />
              <span>Save Routine Changes</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
