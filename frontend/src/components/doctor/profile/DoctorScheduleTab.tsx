import React from 'react'
import { CalendarClock, Clock, CheckCircle2, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { DoctorScheduleRule } from '@/services/doctorService'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

interface DoctorScheduleTabProps {
  scheduleRules: DoctorScheduleRule[]
  consultationFee: number
}

export const DoctorScheduleTab: React.FC<DoctorScheduleTabProps> = ({
  scheduleRules = [],
  consultationFee,
}) => {
  const navigate = useNavigate()

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <CalendarClock className="size-4.5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Schedule & Availability</h3>
            <p className="text-xs text-slate-500">
              Weekly consultation slots and patient booking availability
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/doctor/schedule')}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-blue-600 bg-white hover:bg-blue-50 border border-blue-200 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
        >
          <span>Advanced Schedule Planner</span>
          <ArrowRight className="size-3.5" />
        </button>
      </div>

      {/* Quick Summary Pill */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-100">
        <div>
          <h4 className="text-xs font-bold text-slate-900">Clinical Consultation Hours</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Patients can book verified slots during your active schedule windows.
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-black text-blue-600 block">₹{consultationFee}</span>
          <span className="text-[10px] text-slate-400 font-semibold block">per session</span>
        </div>
      </div>

      {/* Weekdays Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {DAYS.map((dayName, dayIndex) => {
          const rulesForDay = scheduleRules.filter((r) => r.dayOfWeek === dayIndex)
          const isWorking = rulesForDay.length > 0

          return (
            <div
              key={dayName}
              className={`p-4 rounded-2xl border transition-all ${
                isWorking
                  ? 'bg-slate-50/60 border-slate-200/90'
                  : 'bg-slate-50/20 border-slate-100 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800">{dayName}</span>
                {isWorking ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="size-3 text-emerald-600" />
                    <span>Active</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    Off Duty
                  </span>
                )}
              </div>

              {isWorking ? (
                <div className="space-y-1.5">
                  {rulesForDay.map((r, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200/60"
                    >
                      <Clock className="size-3 text-blue-600" />
                      <span>
                        {r.startTime} – {r.endTime} ({r.slotDurationMinutes || 20}m slots)
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 italic">No slots configured</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
