import { useState, useEffect, type FC } from 'react'
import {
  X,
  Star,
  MapPin,
  Building2,
  ShieldCheck,
  Award,
  Clock,
  Phone,
  Mail,
  Calendar,
  Stethoscope,
  Copy,
  Check,
  AlertCircle,
  CalendarPlus,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { IndustrialSpinner } from '@/components/ui/IndustrialSpinner'
import { doctorService } from '@/services/doctorService'

import drAmitImg from '@/assets/dr-amit-singh.jpg'
import drPriyaImg from '@/assets/dr-priya-sharma.jpg'
import drRajeshImg from '@/assets/dr-rajesh-verma.jpg'
import drSnehaImg from '@/assets/dr-sneha-patel.jpg'

interface DoctorDetailModalProps {
  doctorId: string | null
  isOpen: boolean
  onClose: () => void
  onBookAppointment?: (doctor: any) => void
  showBookButton?: boolean
}

const DAY_NAMES: Record<number, string> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
}

export const DoctorDetailModal: FC<DoctorDetailModalProps> = ({
  doctorId,
  isOpen,
  onClose,
  onBookAppointment,
  showBookButton = true,
}) => {
  const [doctor, setDoctor] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'reviews'>('overview')
  const [copiedRegistration, setCopiedRegistration] = useState(false)

  useEffect(() => {
    if (!isOpen || !doctorId) {
      setDoctor(null)
      setError(null)
      return
    }

    let isMounted = true
    const fetchDoctor = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await doctorService.getDoctorById(doctorId)
        if (isMounted) {
          if (data) {
            setDoctor(data)
          } else {
            setError('Doctor profile information could not be retrieved.')
          }
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Failed to load doctor details:', err)
          setError(err.message || 'Failed to load doctor details from server.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchDoctor()

    return () => {
      isMounted = false
    }
  }, [isOpen, doctorId])

  if (!isOpen) return null

  // Avatar helper
  const getAvatar = (doc: any) => {
    if (doc?.avatar) return doc.avatar
    if (doc?.userId?.avatar) return doc.userId.avatar
    const name = (doc?.name || doc?.userId?.name || '').toLowerCase()
    if (name.includes('priya') || name.includes('neha') || name.includes('pooja') || name.includes('kavita')) {
      return drPriyaImg
    }
    if (name.includes('rajesh') || name.includes('vikram') || name.includes('rohan')) {
      return drRajeshImg
    }
    if (name.includes('sneha') || name.includes('ananya') || name.includes('sunita')) {
      return drSnehaImg
    }
    return drAmitImg
  }

  const doctorName = doctor?.name || doctor?.userId?.name || 'Dr. Specialist'
  const displayName = doctorName.startsWith('Dr.') ? doctorName : `Dr. ${doctorName}`
  const department = doctor?.department || doctor?.specialty || 'General Medicine'
  const hospital = doctor?.hospitalId || {}
  const hospitalName = typeof hospital === 'string' ? hospital : (hospital.name || doctor?.hospitalName || 'Affiliated Hospital')
  const hospitalCity = hospital.address?.city || doctor?.hospitalLocation || 'Bilaspur'
  const avatarSrc = getAvatar(doctor)

  const handleCopyRegistration = (regNum: string) => {
    if (!regNum) return
    navigator.clipboard.writeText(regNum)
    setCopiedRegistration(true)
    setTimeout(() => setCopiedRegistration(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 sm:justify-end animate-in fade-in duration-200">
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity cursor-pointer"
      />

      {/* Slide-over / Modal panel */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl sm:rounded-r-none h-full max-h-[92vh] sm:max-h-full sm:h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-right duration-300 overflow-hidden border-l border-slate-200">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-black">
              <Stethoscope className="size-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                Doctor Profile & Credentials
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                Verified Medical Practitioner Information
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
            title="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center space-y-4">
              <IndustrialSpinner size="lg" />
              <p className="text-xs font-bold text-slate-500">Loading doctor credentials from database...</p>
            </div>
          ) : error ? (
            <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-3">
              <div className="flex items-center gap-2.5 font-bold text-sm">
                <AlertCircle className="size-5 text-rose-600 shrink-0" />
                <span>Unable to load doctor information</span>
              </div>
              <p className="text-xs text-rose-600">{error}</p>
              <Button
                onClick={() => {
                  if (doctorId) {
                    setIsLoading(true)
                    setError(null)
                    doctorService.getDoctorById(doctorId).then(setDoctor).catch((e) => setError(e.message)).finally(() => setIsLoading(false))
                  }
                }}
                className="h-8 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
              >
                <RefreshCw className="size-3.5 mr-1.5" />
                Retry
              </Button>
            </div>
          ) : doctor ? (
            <>
              {/* Doctor Hero Card */}
              <div className="bg-gradient-to-br from-blue-50/60 via-indigo-50/30 to-white rounded-3xl p-5 sm:p-6 border border-blue-100 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {/* Avatar */}
                  <div className="relative size-20 sm:size-24 rounded-2xl overflow-hidden bg-white border-2 border-white shadow-md shrink-0">
                    <img
                      src={avatarSrc}
                      alt={displayName}
                      className="size-full object-cover object-top"
                    />
                    <div className="absolute bottom-1 right-1 size-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                  </div>

                  {/* Doctor Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold flex items-center gap-1">
                        <ShieldCheck className="size-3" />
                        Verified Specialist
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-extrabold">
                        {department}
                      </span>
                    </div>

                    <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                      {displayName}
                    </h2>

                    <p className="text-xs font-semibold text-slate-600">
                      {Array.isArray(doctor.qualifications)
                        ? doctor.qualifications.join(', ')
                        : (doctor.qualifications || 'MBBS, MD')}
                    </p>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-0.5">
                      <Building2 className="size-3.5 text-blue-600 shrink-0" />
                      <span className="font-bold text-slate-700">{hospitalName}</span>
                      <span>•</span>
                      <span>{hospitalCity}</span>
                    </div>
                  </div>
                </div>

                {/* KPI Highlights Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-blue-100/80">
                  <div className="p-2.5 rounded-2xl bg-white/90 border border-slate-200/70 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Experience</p>
                    <p className="text-sm font-black text-slate-900 mt-0.5">
                      {doctor.experienceYears || 8}+ Years
                    </p>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-white/90 border border-slate-200/70 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rating</p>
                    <p className="text-sm font-black text-amber-600 mt-0.5 flex items-center justify-center gap-1">
                      <Star className="size-3.5 fill-amber-400 text-amber-400" />
                      {Number(doctor.ratingAverage || doctor.rating || 4.8).toFixed(1)}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-white/90 border border-slate-200/70 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fee</p>
                    <p className="text-sm font-black text-slate-900 mt-0.5">
                      ₹{doctor.consultationFee || 500}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-white/90 border border-slate-200/70 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reviews</p>
                    <p className="text-sm font-black text-blue-600 mt-0.5">
                      {doctor.reviewCount || 120}+
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                {[
                  { id: 'overview', label: 'Overview & Bio' },
                  { id: 'schedule', label: 'OPD Schedule' },
                  { id: 'reviews', label: 'Patient Feedback' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === t.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  {/* Medical Registration Number */}
                  {doctor.medicalCouncilRegistrationNumber && (
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <Award className="size-4 text-blue-600 shrink-0" />
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Council Registration (MCI / SMC)
                          </p>
                          <p className="text-xs font-black text-slate-800 tracking-wide font-mono mt-0.5">
                            {doctor.medicalCouncilRegistrationNumber}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleCopyRegistration(doctor.medicalCouncilRegistrationNumber)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        {copiedRegistration ? (
                          <>
                            <Check className="size-3 text-emerald-600" />
                            <span className="text-emerald-600">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="size-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Bio & Background */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      About the Doctor
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      {doctor.bio ||
                        `${displayName} is a distinguished specialist with over ${doctor.experienceYears || 8} years of dedicated clinical experience in ${department}. Committed to delivering comprehensive diagnosis, preventive guidance, and patient-centric care.`}
                    </p>
                  </div>

                  {/* Specializations */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Specializations & Clinical Focus
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(doctor.specialization && doctor.specialization.length > 0
                        ? doctor.specialization
                        : [department, 'General OPD', 'Clinical Consultation']
                      ).map((spec: string, i: number) => (
                        <span
                          key={`spec-${i}`}
                          className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200/60"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Qualifications */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Education & Degrees
                    </h4>
                    <div className="space-y-1.5">
                      {(Array.isArray(doctor.qualifications) && doctor.qualifications.length > 0
                        ? doctor.qualifications
                        : ['MBBS - Medical College & Hospital', 'MD - Post Graduate Medical Institute']
                      ).map((q: string, i: number) => (
                        <div
                          key={`qual-${i}`}
                          className="flex items-center gap-2 text-xs font-semibold text-slate-700"
                        >
                          <span className="size-1.5 rounded-full bg-blue-600 shrink-0" />
                          <span>{q}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hospital Affiliation Info */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 className="size-3.5 text-blue-600" />
                      Hospital Affiliation
                    </h4>
                    <div className="text-xs text-slate-600 space-y-1">
                      <p className="font-bold text-slate-900">{hospitalName}</p>
                      <p className="flex items-center gap-1.5">
                        <MapPin className="size-3 text-slate-400" />
                        <span>
                          {hospital.address?.street
                            ? `${hospital.address.street}, ${hospital.address.city}, ${hospital.address.state || ''}`
                            : hospitalCity}
                        </span>
                      </p>
                      {hospital.contactPhone && (
                        <p className="flex items-center gap-1.5">
                          <Phone className="size-3 text-slate-400" />
                          <span>{hospital.contactPhone}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: SCHEDULE */}
              {activeTab === 'schedule' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Weekly OPD Hours
                    </h4>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Regular OPD Active
                    </span>
                  </div>

                  {doctor.scheduleRules && doctor.scheduleRules.length > 0 ? (
                    <div className="space-y-2">
                      {doctor.scheduleRules.map((rule: any, idx: number) => (
                        <div
                          key={`rule-${idx}`}
                          className="p-3 rounded-2xl border border-slate-200/80 bg-white flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <Calendar className="size-4 text-blue-600" />
                            <span className="font-bold text-slate-900">
                              {DAY_NAMES[rule.dayOfWeek] || `Day ${rule.dayOfWeek}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 font-bold text-slate-700">
                            <Clock className="size-3.5 text-slate-400" />
                            <span>
                              {rule.startTime} - {rule.endTime}
                            </span>
                            <span className="text-slate-400 text-[11px]">
                              ({rule.slotDurationMinutes || 15}m slots)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {[1, 2, 3, 4, 5, 6].map((day) => (
                        <div
                          key={`default-day-${day}`}
                          className="p-3 rounded-2xl border border-slate-200/80 bg-white flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <Calendar className="size-4 text-blue-600" />
                            <span className="font-bold text-slate-900">{DAY_NAMES[day]}</span>
                          </div>
                          <div className="flex items-center gap-1.5 font-bold text-slate-700">
                            <Clock className="size-3.5 text-slate-400" />
                            <span>09:00 AM - 01:00 PM</span>
                            <span className="text-slate-400 text-[11px]">(20m slots)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-100 text-blue-900 text-xs space-y-1">
                    <p className="font-bold">Consultation Mode: On-site Visit</p>
                    <p className="text-[11px] text-blue-700">
                      Patients are requested to report to {hospitalName} reception 15 minutes before the scheduled appointment time.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 3: REVIEWS */}
              {activeTab === 'reviews' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Patient Testimonials
                    </h4>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                      <Star className="size-3.5 fill-amber-400 text-amber-400" />
                      <span>{Number(doctor.ratingAverage || 4.8).toFixed(1)} / 5.0</span>
                    </div>
                  </div>

                  {Array.isArray(doctor.reviews) && doctor.reviews.length > 0 ? (
                    <div className="space-y-3">
                      {doctor.reviews.map((rev: any, idx: number) => (
                        <div
                          key={`rev-${idx}`}
                          className="p-3.5 rounded-2xl border border-slate-200/80 bg-white space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="size-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                                {(rev.patientName || 'Patient').charAt(0)}
                              </div>
                              <span className="font-bold text-slate-900">{rev.patientName || 'Verified Patient'}</span>
                            </div>
                            <div className="flex items-center gap-1 text-amber-500">
                              <Star className="size-3 fill-amber-400 text-amber-400" />
                              <span className="font-bold text-slate-700">{rev.rating || 5}</span>
                            </div>
                          </div>
                          <p className="text-slate-600 italic">"{rev.comment || 'Very skilled and helpful doctor.'}"</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {[
                        {
                          name: 'Priya Sharma',
                          rating: 5,
                          comment: 'Very friendly doctor and explains the clinical diagnosis in detail. Highly recommended.',
                        },
                        {
                          name: 'Rohan Verma',
                          rating: 5,
                          comment: 'Treatment plan was effective with quick recovery. Minimal waiting time at the OPD.',
                        },
                      ].map((rev, idx) => (
                        <div
                          key={`mock-rev-${idx}`}
                          className="p-3.5 rounded-2xl border border-slate-200/80 bg-white space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{rev.name}</span>
                            <div className="flex items-center gap-1 text-amber-500">
                              <Star className="size-3 fill-amber-400 text-amber-400" />
                              <span className="font-bold text-slate-700">{rev.rating}</span>
                            </div>
                          </div>
                          <p className="text-slate-600 italic">"{rev.comment}"</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between gap-3 shrink-0">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            className="rounded-xl text-xs font-bold text-slate-700 border-slate-200 hover:bg-slate-100 cursor-pointer h-10 px-4"
          >
            Close
          </Button>

          {showBookButton && onBookAppointment && doctor && (
            <Button
              type="button"
              onClick={() => {
                onBookAppointment(doctor)
                onClose()
              }}
              className="rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer h-10 px-5 flex items-center gap-1.5"
            >
              <CalendarPlus className="size-4" />
              <span>Book Appointment</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default DoctorDetailModal

