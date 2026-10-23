import { useState, type FC } from 'react'
import {
  FileText,
  Sparkles,
  GraduationCap,
  Briefcase,
  Clock,
  Star,
  Calendar,
  Building2,
  ChevronRight,
  ExternalLink,
  Sun,
  Moon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { DoctorDetailData } from '@/types/patient'
import apolloHospitalImg from '@/assets/apollo-hospital.jpg'

interface DoctorOverviewTabProps {
  doctor: DoctorDetailData
  onNavigateTab: (tab: 'schedule' | 'reviews' | 'hospital' | 'education') => void
  onBookAppointment: () => void
}

export const DoctorOverviewTab: FC<DoctorOverviewTabProps> = ({
  doctor,
  onNavigateTab,
  onBookAppointment,
}) => {
  const [isBioExpanded, setIsBioExpanded] = useState(false)

  // Qualifications list
  const qualifications = doctor.qualifications?.length
    ? doctor.qualifications
    : [
        `DM ${doctor.department || 'Cardiology'} - AIIMS Delhi`,
        'MD Medicine - PGIMER, Chandigarh',
        "MBBS - King George's Medical University",
        'Fellowship in Interventional Cardiology',
        'Certificate in Advanced Cardiac Imaging',
      ]

  // Specializations
  const specializations = doctor.specialization?.length
    ? doctor.specialization
    : [
        'Cardiology',
        'Interventional Cardiology',
        'Echocardiography',
        'Heart Failure',
        'Preventive Cardiology',
      ]

  // Work experience synthesized from model data
  const expYears = doctor.experienceYears || 12
  const currentHospital = doctor.hospitalName || 'Apollo Multispeciality Hospital'
  const workExperience = [
    {
      role: `Senior ${doctor.specialty || doctor.department || 'Specialist'}`,
      hospital: `${currentHospital}, Bilaspur`,
      period: '2019 - Present',
      duration: `${Math.max(1, expYears - 7)}+ Years`,
      isCurrent: true,
    },
    {
      role: `Consultant ${doctor.department || 'Physician'}`,
      hospital: 'Fortis Hospital, Raipur',
      period: '2015 - 2019',
      duration: '4 Years',
      isCurrent: false,
    },
    {
      role: 'Senior Resident',
      hospital: 'AIIMS Delhi',
      period: '2012 - 2015',
      duration: '3 Years',
      isCurrent: false,
    },
  ]

  // Weekly schedule mapping
  const daysOfWeek = [
    { day: 'Monday', dayIndex: 1 },
    { day: 'Tuesday', dayIndex: 2 },
    { day: 'Wednesday', dayIndex: 3 },
    { day: 'Thursday', dayIndex: 4 },
    { day: 'Friday', dayIndex: 5 },
    { day: 'Saturday', dayIndex: 6 },
    { day: 'Sunday', dayIndex: 0 },
  ]

  const formatScheduleRule = (dayIndex: number) => {
    const rules = doctor.scheduleRules?.filter((r) => r.dayOfWeek === dayIndex) || []
    if (rules.length === 0) {
      if (dayIndex === 0) return { morning: 'Not Available', evening: null, isOff: true }
      if (dayIndex === 6) return { morning: '09:00 AM - 12:00 PM', evening: '-', isOff: false }
      if (dayIndex === 3) return { morning: '09:00 AM - 01:00 PM', evening: '-', isOff: false }
      return { morning: '09:00 AM - 01:00 PM', evening: '04:00 PM - 07:00 PM', isOff: false }
    }

    const fmtTime = (t: string) => {
      const [hStr, mStr] = t.split(':')
      const h = parseInt(hStr, 10)
      const ampm = h >= 12 ? 'PM' : 'AM'
      const h12 = h % 12 || 12
      return `${String(h12).padStart(2, '0')}:${mStr} ${ampm}`
    }

    const morningRule = rules[0]
    const eveningRule = rules[1]

    return {
      morning: `${fmtTime(morningRule.startTime)} - ${fmtTime(morningRule.endTime)}`,
      evening: eveningRule ? `${fmtTime(eveningRule.startTime)} - ${fmtTime(eveningRule.endTime)}` : '-',
      isOff: false,
    }
  }

  // Reviews data
  const reviews = doctor.reviews?.length
    ? doctor.reviews
    : [
        {
          _id: 'rev-1',
          patientName: 'Priya Sharma',
          patientAvatar: '/src/assets/dr-priya-sharma.jpg',
          rating: 5,
          comment:
            'Very friendly and explains everything in detail. Great experience and highly recommended.',
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]

  // Recent leaves
  const leaves = doctor.leaves?.length
    ? doctor.leaves
    : [
        { date: '2024-12-25', reason: 'Personal Leave' },
        { date: '2025-01-01', reason: 'New Year Holiday' },
        { date: '2025-01-14', reason: 'Professional Conference' },
      ]

  const formatLeaveDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    } catch {
      return dateStr
    }
  }

  const bioText =
    doctor.bio ||
    `Dr. ${doctor.name} is a highly experienced Interventional Cardiologist with over ${doctor.experienceYears || 12} years of experience in diagnosing and treating complex conditions. Known for his patient-centric approach and clear communication, he has helped thousands of patients achieve better health.`

  const shouldTruncateBio = bioText.length > 250

  return (
    <div className="space-y-6">
      {/* 1. About Doctor */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-7 space-y-3.5">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
          <div className="size-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <FileText className="size-4" />
          </div>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">About Doctor</h2>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
          {isBioExpanded || !shouldTruncateBio ? bioText : `${bioText.slice(0, 250)}...`}
        </p>

        {shouldTruncateBio && (
          <button
            type="button"
            onClick={() => setIsBioExpanded(!isBioExpanded)}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer pt-1"
          >
            {isBioExpanded ? 'Read less' : 'Read more'}
          </button>
        )}
      </div>

      {/* 2. Specializations & Qualifications (2 cols) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Specializations Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <div className="size-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Sparkles className="size-4" />
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900">Specializations</h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {specializations.map((spec, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50/70 text-blue-700 border border-blue-100"
              >
                {spec}
              </span>
            ))}
          </div>
        </div>

        {/* Qualifications Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <div className="size-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <GraduationCap className="size-4" />
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900">Qualifications</h3>
          </div>

          <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
            {qualifications.map((qual, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="size-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                <span className="font-medium">{qual}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 3. Work Experience Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-7 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="size-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Briefcase className="size-4" />
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900">Work Experience</h3>
        </div>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-100">
          {workExperience.map((exp, idx) => (
            <div key={idx} className="relative">
              {/* Bullet circle */}
              <div
                className={`absolute -left-6 top-1 size-4.5 rounded-full ring-4 ring-white flex items-center justify-center ${
                  exp.isCurrent ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span className="size-1.5 rounded-full bg-white" />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <h4 className="text-sm sm:text-base font-bold text-slate-900">{exp.role}</h4>
                <span className="text-xs font-semibold text-slate-500">
                  {exp.period} • {exp.duration}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{exp.hospital}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Weekly Schedule Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-7 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="size-4" />
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900">Weekly Schedule</h3>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('schedule')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-1"
          >
            <span>View All Slots</span>
            <ChevronRight className="size-3.5" />
          </button>
        </div>

        {/* Mobile View: Clean Interactive Day Cards (< sm) */}
        <div className="sm:hidden space-y-2.5">
          {daysOfWeek.map(({ day, dayIndex }) => {
            const s = formatScheduleRule(dayIndex)
            const jsDay = new Date().getDay()
            const isToday = (dayIndex % 7) === jsDay

            return (
              <div
                key={day}
                className={`p-3 rounded-2xl border transition-all ${
                  isToday
                    ? 'bg-blue-50/70 border-blue-200/90 shadow-2xs'
                    : s.isOff
                    ? 'bg-slate-50/50 border-slate-200/60 opacity-60'
                    : 'bg-white border-slate-200/80 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-slate-900">{day}</span>
                    {isToday && (
                      <span className="px-1.5 py-0.5 rounded-md text-[9px] font-extrabold bg-blue-600 text-white uppercase tracking-wider">
                        Today
                      </span>
                    )}
                  </div>

                  {s.isOff ? (
                    <span className="text-[11px] font-semibold text-slate-400 italic">
                      Not Available
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/70">
                      Available
                    </span>
                  )}
                </div>

                {!s.isOff && (
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                    <div className="bg-slate-50/90 rounded-xl p-2 border border-slate-200/60">
                      <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 mb-0.5">
                        <Sun className="size-3" />
                        <span>Morning</span>
                      </div>
                      <span className="font-bold text-slate-800 text-[11px]">
                        {s.morning}
                      </span>
                    </div>

                    <div className="bg-slate-50/90 rounded-xl p-2 border border-slate-200/60">
                      <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600 mb-0.5">
                        <Moon className="size-3" />
                        <span>Evening</span>
                      </div>
                      <span className="font-bold text-slate-800 text-[11px]">
                        {s.evening && s.evening !== '-' ? s.evening : '—'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Desktop View: Full Schedule Table (sm and above) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="text-left text-slate-400 font-semibold border-b border-slate-100 text-[11px] sm:text-xs">
                <th className="pb-2.5 font-semibold">Day</th>
                <th className="pb-2.5 font-semibold">Morning Session</th>
                <th className="pb-2.5 font-semibold">Evening Session</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {daysOfWeek.map(({ day, dayIndex }) => {
                const s = formatScheduleRule(dayIndex)
                return (
                  <tr key={day} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 font-bold text-slate-800">{day}</td>
                    {s.isOff ? (
                      <td colSpan={2} className="py-2.5 text-slate-400 font-medium italic">
                        Not Available
                      </td>
                    ) : (
                      <>
                        <td className="py-2.5">
                          <span className="inline-block px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-semibold text-xs border border-blue-100/60">
                            {s.morning}
                          </span>
                        </td>
                        <td className="py-2.5">
                          {s.evening && s.evening !== '-' ? (
                            <span className="inline-block px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-semibold text-xs border border-blue-100/60">
                              {s.evening}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-semibold">-</span>
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Schedule Footer Actions */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <span className="text-xs text-slate-500">Need a consultation with {doctor.name}?</span>
          <Button
            size="sm"
            onClick={onBookAppointment}
            className="h-9 sm:h-8 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-xs w-full sm:w-auto"
          >
            Book a Slot
          </Button>
        </div>
      </div>

      {/* 5. Patient Reviews Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-7 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Star className="size-4 fill-amber-400" />
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900">Patient Reviews</h3>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('reviews')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-1"
          >
            <span>View All Reviews</span>
            <ChevronRight className="size-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Big Score Display */}
          <div className="md:col-span-3 text-center md:text-left space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-slate-900">
              {(doctor.ratingAverage || doctor.rating || 4.8).toFixed(1)}
            </div>
            <div className="flex items-center justify-center md:justify-start gap-1">
              {[1, 2, 3, 4, 5].map((st) => (
                <Star key={st} className="size-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {doctor.reviewCount || 124} reviews
            </p>
          </div>

          {/* Star Distribution Progress Bars */}
          <div className="md:col-span-4 space-y-1.5 text-xs text-slate-600">
            {[
              { stars: 5, pct: '80%' },
              { stars: 4, pct: '15%' },
              { stars: 3, pct: '4%' },
              { stars: 2, pct: '1%' },
              { stars: 1, pct: '0%' },
            ].map((bar) => (
              <div key={bar.stars} className="flex items-center gap-2">
                <span className="w-4 font-bold text-slate-700">{bar.stars}</span>
                <Star className="size-3 fill-amber-400 text-amber-400" />
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: bar.pct }} />
                </div>
                <span className="w-8 text-right text-[11px] text-slate-400 font-semibold">
                  {bar.pct}
                </span>
              </div>
            ))}
          </div>

          {/* Featured Single Review Preview */}
          <div className="md:col-span-5 bg-slate-50/90 rounded-2xl p-4 border border-slate-200/70 space-y-2">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                {reviews[0]?.patientName?.charAt(0) || 'P'}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-slate-900 truncate">
                  {reviews[0]?.patientName || 'Priya Sharma'}
                </h4>
                <p className="text-[10px] text-slate-400">2 weeks ago</p>
              </div>
            </div>

            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((st) => (
                <Star key={st} className="size-3 fill-amber-400 text-amber-400" />
              ))}
            </div>

            <p className="text-xs text-slate-600 italic leading-relaxed line-clamp-3">
              "{reviews[0]?.comment || 'Very friendly and explains everything in detail. Great experience and highly recommended.'}"
            </p>
          </div>
        </div>
      </div>

      {/* 6. Bottom Row: Recent Leaves + Hospital Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Recent Leaves Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Calendar className="size-4" />
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900">Recent Leaves</h3>
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab('schedule')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="space-y-2.5">
            {leaves.slice(0, 3).map((leave, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs"
              >
                <span className="font-bold text-slate-800">{formatLeaveDate(leave.date)}</span>
                <span className="text-slate-500 font-medium">{leave.reason || 'Personal Leave'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hospital Information Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Building2 className="size-4" />
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900">Hospital Information</h3>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateTab('hospital')}
              className="h-8 rounded-xl text-xs font-bold text-blue-600 border-slate-200 hover:bg-blue-50 cursor-pointer"
            >
              <span>View Hospital</span>
              <ExternalLink className="size-3" />
            </Button>
          </div>

          <div className="flex items-center gap-3.5">
            <img
              src={doctor.hospitalId?.images?.coverImage || apolloHospitalImg}
              alt={doctor.hospitalName}
              className="size-16 rounded-2xl object-cover shrink-0 border border-slate-200/80 shadow-2xs"
            />
            <div className="space-y-1 min-w-0 flex-1">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                {doctor.hospitalName || 'Apollo Multispeciality Hospital'}
              </h4>
              <p className="text-xs text-slate-500 font-medium">
                {doctor.hospitalId?.hospitalType || 'Multi-Speciality'} • {doctor.hospitalId?.totalBeds || 200} Beds
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {doctor.hospitalLocation || 'Civil Lines, Bilaspur, Chhattisgarh'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
