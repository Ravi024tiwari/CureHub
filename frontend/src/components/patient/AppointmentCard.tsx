import { useState, type FC } from 'react'
import {
  Clock,
  Star,
  FileText,
  Video,
  Stethoscope,
  MoreVertical,
  Download,
  RotateCcw,
  CreditCard,
  Building2,
  Copy,
  Check,
} from 'lucide-react'
import type { AppointmentCardData } from '@/types/patient'
import { Button } from '@/components/ui/button'

interface AppointmentCardProps {
  appointment: AppointmentCardData
  viewMode?: 'grid' | 'list'
  onViewDetails: (appointment: AppointmentCardData) => void
  onReschedule?: (appointment: AppointmentCardData) => void
  onCancel?: (appointment: AppointmentCardData) => void
  onDownloadPrescription?: (appointment: AppointmentCardData) => void
  onBookAgain?: (appointment: AppointmentCardData) => void
  onPayNow?: (appointment: AppointmentCardData) => void
  onWriteReview?: (appointment: AppointmentCardData) => void
}

export const AppointmentCard: FC<AppointmentCardProps> = ({
  appointment,
  viewMode = 'grid',
  onViewDetails,
  onReschedule,
  onCancel,
  onDownloadPrescription,
  onBookAgain,
  onPayNow,
  onWriteReview,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [hasCopied, setHasCopied] = useState(false)

  // Parse date components safely
  const parseDateParts = (dateStr: string) => {
    if (dateStr.includes(',')) {
      const parts = dateStr.split(',').map((s) => s.trim())
      const dayName = parts[0]
      const rest = parts[1] ? parts[1].trim().split(' ') : ['20', 'Oct', '2026']
      return {
        day: dayName.toUpperCase(),
        dateNum: rest[0] || '20',
        monthYear: `${rest[1] || 'Oct'} ${rest[2] || '2026'}`,
      }
    }
    const d = new Date(dateStr)
    if (!isNaN(d.getTime())) {
      return {
        day: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
        dateNum: String(d.getDate()).padStart(2, '0'),
        monthYear: `${d.toLocaleDateString('en-US', { month: 'short' })} ${d.getFullYear()}`,
      }
    }
    return { day: 'MON', dateNum: '20', monthYear: 'Oct 2026' }
  }

  const { day, dateNum, monthYear } = parseDateParts(appointment.date)

  const handleCopyAppointmentNumber = (e: React.MouseEvent) => {
    e.stopPropagation()
    const apptNum = appointment.appointmentNumber || 'APT-20261020-8472'
    navigator.clipboard.writeText(apptNum)
    setHasCopied(true)
    setTimeout(() => setHasCopied(false), 2000)
  }

  // Status styling
  const getStatusBadge = (status: AppointmentCardData['status']) => {
    switch (status) {
      case 'Confirmed':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/90',
          dot: 'bg-emerald-500',
          label: 'CONFIRMED',
        }
      case 'Pending':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200/90',
          dot: 'bg-amber-500',
          label: 'PENDING',
        }
      case 'Completed':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/90',
          dot: 'bg-emerald-500',
          label: 'COMPLETED',
        }
      case 'Cancelled':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200/90',
          dot: 'bg-rose-500',
          label: 'CANCELLED',
        }
      default:
        return {
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
          label: String(status).toUpperCase(),
        }
    }
  }

  const badge = getStatusBadge(appointment.status)
  const startTime = appointment.time.split('-')[0].trim()

  // ════════════════════════════════════════════════════════════════════════════
  // 1. GRID VIEW VARIANT (Responsive Multi-Column Card)
  // ════════════════════════════════════════════════════════════════════════════
  if (viewMode === 'grid') {
    return (
      <div className="relative bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-lg hover:border-blue-300 transition-all duration-200 p-4 sm:p-5 lg:p-6 flex flex-col justify-between gap-3.5 sm:gap-4.5 group overflow-hidden w-full max-w-full">
        {/* Top Header: Date Pill + Status Badge */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-1.5 sm:gap-2 bg-blue-50/80 border border-blue-100/90 px-2.5 sm:px-3 py-1.5 rounded-2xl text-xs shrink-0">
            <span className="text-blue-600 font-extrabold uppercase text-[10px] sm:text-[11px] tracking-wider">
              {day}
            </span>
            <span className="text-sm sm:text-base font-black text-slate-900 leading-none">
              {dateNum}
            </span>
            <span className="text-slate-500 font-semibold text-[10px] sm:text-[11px]">
              {monthYear}
            </span>
            <span className="text-blue-700 font-bold text-[10px] sm:text-[11px] inline-flex items-center gap-0.5 sm:gap-1 ml-0.5 bg-white/80 px-1.5 py-0.5 rounded-md shadow-2xs">
              <Clock className="size-2.5 sm:size-3 text-blue-600" />
              <span>{startTime}</span>
            </span>
          </div>

          {/* Status Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold border tracking-wide uppercase shrink-0 ${badge.bg}`}
          >
            <span className={`size-1.5 rounded-full ${badge.dot}`} />
            {badge.label}
          </span>
        </div>

        {/* Doctor Information */}
        <div className="flex items-start gap-3 sm:gap-3.5 min-w-0">
          <div
            onClick={() => onViewDetails(appointment)}
            className="relative shrink-0 cursor-pointer group/avatar"
          >
            {appointment.doctorAvatar ? (
              <img
                src={appointment.doctorAvatar}
                alt={appointment.doctorName}
                className="size-14 sm:size-15 rounded-2xl object-cover object-top border-2 border-slate-100 shadow-xs group-hover/avatar:ring-2 group-hover/avatar:ring-blue-400 transition-all"
              />
            ) : (
              <div className="size-14 sm:size-15 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-xs">
                {appointment.doctorName.charAt(4) || 'D'}
              </div>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-2xs" />
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <h3
              onClick={() => onViewDetails(appointment)}
              className="text-sm sm:text-base font-extrabold text-slate-900 truncate tracking-tight hover:text-blue-600 cursor-pointer transition-colors"
            >
              {appointment.doctorName}
            </h3>

            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="font-semibold text-blue-600 text-[11px] sm:text-xs truncate">
                {appointment.doctorSpecialty}
              </span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1 font-bold text-amber-600 bg-amber-50/80 px-1.5 py-0.5 rounded-md border border-amber-100 text-[11px]">
                <Star className="size-3 fill-amber-400 text-amber-400" />
                {appointment.doctorRating || 4.8}
                <span className="text-slate-400 font-normal hidden xs:inline">
                  ({appointment.doctorReviewCount || 320})
                </span>
              </span>
            </div>

            <div className="flex items-center gap-1 text-[11px] sm:text-xs text-slate-500 truncate pt-0.5">
              <Building2 className="size-3 sm:size-3.5 text-slate-400 shrink-0" />
              <span className="truncate font-medium">{appointment.hospitalName}</span>
            </div>
          </div>
        </div>

        {/* Clinical Info Box: Mode & Symptoms */}
        <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-2.5 sm:p-3 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
              {appointment.consultationType === 'Video Consultation' ? (
                <Video className="size-3 text-blue-600" />
              ) : (
                <Stethoscope className="size-3 text-blue-600" />
              )}
              Mode
            </span>
            <span className="font-extrabold text-slate-800 text-[11px] sm:text-xs">
              {appointment.consultationType || 'In-person'}
            </span>
          </div>

          <div className="border-t border-slate-200/60 pt-1.5 flex items-start gap-1.5 text-slate-600">
            <FileText className="size-3 text-indigo-500 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <span className="text-[9px] text-slate-400 uppercase font-bold block">Symptoms</span>
              <p className="font-medium text-slate-700 text-[11px] truncate" title={appointment.symptoms}>
                {appointment.symptoms || 'General Checkup'}
              </p>
            </div>
          </div>
        </div>

        {/* ID, Fee & Action Footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5 sm:gap-2">
          {/* Left: ID & Fee */}
          <div className="min-w-0 shrink">
            <div className="flex items-center gap-0.5 sm:gap-1">
              <span className="font-mono text-[10px] sm:text-[11px] font-bold text-slate-600 truncate max-w-[85px] xs:max-w-[110px] sm:max-w-[130px]">
                {appointment.appointmentNumber || 'APT-20261020-8472'}
              </span>
              <button
                type="button"
                onClick={handleCopyAppointmentNumber}
                title="Copy Appointment ID"
                className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer shrink-0"
              >
                {hasCopied ? (
                  <Check className="size-3 text-emerald-600" />
                ) : (
                  <Copy className="size-3" />
                )}
              </button>
            </div>
            <p className="text-base sm:text-lg font-black text-slate-900 leading-tight">
              ₹{appointment.consultationFee || 500}
            </p>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <Button
              variant="outline"
              onClick={() => onViewDetails(appointment)}
              className="text-[11px] sm:text-xs font-bold text-blue-600 border-blue-200 hover:bg-blue-50 rounded-xl h-8 sm:h-8.5 px-2.5 sm:px-3 cursor-pointer shadow-2xs shrink-0"
            >
              View Details
            </Button>

            {appointment.status === 'Pending' && onPayNow && (
              <Button
                onClick={() => onPayNow(appointment)}
                className="text-[11px] sm:text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-8 sm:h-8.5 px-2.5 sm:px-3 shadow-xs cursor-pointer inline-flex items-center gap-1 shrink-0"
              >
                <CreditCard className="size-3 sm:size-3.5" />
                <span>Pay</span>
              </Button>
            )}

            {appointment.status === 'Completed' && onDownloadPrescription && (
              <Button
                variant="outline"
                onClick={() => onDownloadPrescription(appointment)}
                className="text-xs font-bold text-slate-700 border-slate-200 hover:bg-slate-50 rounded-xl h-8 sm:h-8.5 px-2 cursor-pointer shrink-0"
                title="Download Prescription"
              >
                <Download className="size-3.5" />
              </Button>
            )}

            {appointment.status === 'Completed' && onWriteReview && (
              appointment.isReviewed ? (
                <button
                  type="button"
                  onClick={() => onWriteReview(appointment)}
                  className="text-[11px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/90 rounded-xl h-8 sm:h-8.5 px-2.5 inline-flex items-center gap-1 cursor-pointer transition-all shrink-0"
                  title="Click to view or edit your review"
                >
                  <Star className="size-3.5 fill-amber-400 text-amber-500" />
                  <span>★ {appointment.review?.rating || 5}/5</span>
                  <span className="text-[10px] text-amber-600 font-medium underline ml-0.5">Edit</span>
                </button>
              ) : (
                <Button
                  onClick={() => onWriteReview(appointment)}
                  className="text-[11px] sm:text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl h-8 sm:h-8.5 px-2.5 sm:px-3 shadow-xs cursor-pointer inline-flex items-center gap-1 shrink-0"
                >
                  <Star className="size-3 sm:size-3.5 fill-white" />
                  <span>Rate</span>
                </Button>
              )
            )}

            {/* Three dots menu */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-1 sm:p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <MoreVertical className="size-4" />
              </button>

              {isMenuOpen && (
                <div
                  className="absolute right-0 bottom-full mb-2 z-30 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 animate-in fade-in zoom-in-95 duration-150"
                  onMouseLeave={() => setIsMenuOpen(false)}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false)
                      onViewDetails(appointment)
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 cursor-pointer"
                  >
                    <FileText className="size-3.5" />
                    Full Details
                  </button>
                  {appointment.canReschedule && onReschedule && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false)
                        onReschedule(appointment)
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 cursor-pointer"
                    >
                      <RotateCcw className="size-3.5" />
                      Reschedule
                    </button>
                  )}
                  {appointment.canCancel && onCancel && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false)
                        onCancel(appointment)
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                    >
                      Cancel Visit
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 2. LIST VIEW VARIANT (Responsive: Mobile Card & Tablet/Desktop Multi-Column)
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="relative bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all duration-200 p-4 sm:p-5 md:p-4 lg:p-5.5 group overflow-hidden w-full max-w-full">
      {/* ─── A. MOBILE VIEW (< md: 768px) ─── */}
      <div className="flex flex-col gap-3 md:hidden">
        {/* Top: Date Pill & Status Badge */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-1.5 bg-blue-50/80 border border-blue-100/90 px-2.5 py-1 rounded-2xl text-xs">
            <span className="text-blue-600 font-extrabold uppercase text-[10px] tracking-wider">{day}</span>
            <span className="text-sm font-black text-slate-900 leading-none">{dateNum}</span>
            <span className="text-slate-500 font-semibold text-[10px]">{monthYear}</span>
            <span className="text-blue-700 font-bold text-[10px] inline-flex items-center gap-1 ml-0.5 bg-white/80 px-1.5 py-0.5 rounded-md shadow-2xs">
              <Clock className="size-2.5 text-blue-600" />
              <span>{startTime}</span>
            </span>
          </div>

          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border tracking-wide uppercase ${badge.bg}`}>
            <span className={`size-1.5 rounded-full ${badge.dot}`} />
            {badge.label}
          </span>
        </div>

        {/* Middle: Doctor Info */}
        <div className="flex items-start gap-3">
          <div onClick={() => onViewDetails(appointment)} className="relative shrink-0 cursor-pointer">
            {appointment.doctorAvatar ? (
              <img src={appointment.doctorAvatar} alt={appointment.doctorName} className="size-13 rounded-2xl object-cover object-top border-2 border-slate-100 shadow-xs" />
            ) : (
              <div className="size-13 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-base flex items-center justify-center">
                {appointment.doctorName.charAt(4) || 'D'}
              </div>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full bg-emerald-500 border-2 border-white" />
          </div>

          <div className="space-y-0.5 min-w-0 flex-1">
            <h3 onClick={() => onViewDetails(appointment)} className="text-sm font-extrabold text-slate-900 truncate hover:text-blue-600 cursor-pointer">
              {appointment.doctorName}
            </h3>
            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="font-semibold text-blue-600">{appointment.doctorSpecialty}</span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-0.5 font-bold text-amber-600 bg-amber-50 px-1 py-0.2 rounded text-[10px]">
                <Star className="size-2.5 fill-amber-400 text-amber-400" />
                {appointment.doctorRating || 4.8}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate pt-0.5">
              <Building2 className="size-3 text-slate-400 shrink-0" />
              <span className="truncate">{appointment.hospitalName}</span>
            </div>
          </div>
        </div>

        {/* Compact Clinical Mode & Symptoms row */}
        <div className="flex items-center gap-2 bg-slate-50/80 rounded-xl px-2.5 py-1.5 text-[11px] border border-slate-100 text-slate-600 truncate">
          <span className="font-bold text-slate-700 shrink-0 flex items-center gap-1 text-[10px]">
            {appointment.consultationType === 'Video Consultation' ? (
              <Video className="size-3 text-blue-600" />
            ) : (
              <Stethoscope className="size-3 text-blue-600" />
            )}
            {appointment.consultationType || 'In-person'}
          </span>
          <span className="text-slate-300">•</span>
          <span className="truncate text-slate-500 font-medium">{appointment.symptoms || 'General Checkup'}</span>
        </div>

        {/* Bottom: Fee, ID & Action Buttons */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
          <div className="min-w-0">
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <span className="truncate max-w-[95px]">{appointment.appointmentNumber}</span>
              <button type="button" onClick={handleCopyAppointmentNumber}><Copy className="size-2.5" /></button>
            </div>
            <p className="text-base font-black text-slate-900 leading-none mt-0.5">
              ₹{appointment.consultationFee || 500}
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="outline"
              onClick={() => onViewDetails(appointment)}
              className="text-[11px] font-bold text-blue-600 border-blue-200 hover:bg-blue-50 rounded-xl h-8 px-2.5 cursor-pointer shadow-2xs"
            >
              View Details
            </Button>
            {appointment.status === 'Pending' && onPayNow && (
              <Button
                onClick={() => onPayNow(appointment)}
                className="text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-8 px-2.5 inline-flex items-center gap-1 cursor-pointer"
              >
                <CreditCard className="size-3" />
                <span>Pay</span>
              </Button>
            )}
            {appointment.status === 'Completed' && onDownloadPrescription && (
              <Button
                variant="outline"
                onClick={() => onDownloadPrescription(appointment)}
                className="text-xs font-bold text-slate-700 border-slate-200 hover:bg-slate-50 rounded-xl h-8 px-2 cursor-pointer"
                title="Download Prescription"
              >
                <Download className="size-3.5" />
              </Button>
            )}
            {appointment.status === 'Completed' && onWriteReview && (
              appointment.isReviewed ? (
                <button
                  type="button"
                  onClick={() => onWriteReview(appointment)}
                  className="text-[11px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/90 rounded-xl h-8 px-2.5 inline-flex items-center gap-1 cursor-pointer transition-all"
                  title="Click to view or edit your review"
                >
                  <Star className="size-3.5 fill-amber-400 text-amber-500" />
                  <span>★ {appointment.review?.rating || 5}/5</span>
                  <span className="text-[10px] text-amber-600 font-medium underline ml-0.5">Edit</span>
                </button>
              ) : (
                <Button
                  onClick={() => onWriteReview(appointment)}
                  className="text-[11px] font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl h-8 px-2.5 shadow-xs cursor-pointer inline-flex items-center gap-1"
                >
                  <Star className="size-3 fill-white" />
                  <span>Rate</span>
                </Button>
              )
            )}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <MoreVertical className="size-3.5" />
              </button>
              {isMenuOpen && (
                <div
                  className="absolute right-0 bottom-full mb-2 z-30 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 animate-in fade-in zoom-in-95"
                  onMouseLeave={() => setIsMenuOpen(false)}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false)
                      onViewDetails(appointment)
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 cursor-pointer"
                  >
                    <FileText className="size-3.5" />
                    Full Details
                  </button>
                  {appointment.canReschedule && onReschedule && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false)
                        onReschedule(appointment)
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 cursor-pointer"
                    >
                      <RotateCcw className="size-3.5" />
                      Reschedule
                    </button>
                  )}
                  {appointment.canCancel && onCancel && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false)
                        onCancel(appointment)
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                    >
                      Cancel Visit
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── B. TABLET & DESKTOP MULTI-COLUMN ROW (md: and up) ─── */}
      <div className="hidden md:grid md:grid-cols-12 md:items-center md:gap-3 lg:gap-5 w-full">
        {/* Col 1: Date Stamp */}
        <div className="md:col-span-2 lg:col-span-2 shrink-0 flex flex-col items-center justify-center p-2.5 lg:p-3.5 rounded-2xl bg-gradient-to-b from-blue-50/90 to-sky-50/60 border border-blue-100 text-center shadow-2xs w-full max-w-[105px] lg:max-w-[115px]">
          <span className="text-[10px] lg:text-xs font-bold text-blue-600 uppercase tracking-wider">{day}</span>
          <span className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight leading-none my-0.5 px-1">
            {dateNum}
          </span>
          <span className="text-[10px] lg:text-[11px] font-medium text-slate-500 whitespace-nowrap">{monthYear}</span>
          <span className="text-[9px] lg:text-[10px] font-semibold text-blue-700 mt-1 flex items-center gap-0.5 whitespace-nowrap bg-blue-100/70 px-1.5 py-0.5 rounded-md">
            <Clock className="size-2.5 lg:size-3" />
            {startTime}
          </span>
        </div>

        {/* Col 2: Doctor & Hospital Info */}
        <div className="md:col-span-4 lg:col-span-3 flex items-start gap-3 min-w-0">
          <div
            onClick={() => onViewDetails(appointment)}
            className="relative shrink-0 cursor-pointer group/avatar"
          >
            {appointment.doctorAvatar ? (
              <img
                src={appointment.doctorAvatar}
                alt={appointment.doctorName}
                className="size-13 lg:size-14 rounded-2xl object-cover object-top border-2 border-slate-100 shadow-xs group-hover/avatar:ring-2 group-hover/avatar:ring-blue-400 transition-all"
              />
            ) : (
              <div className="size-13 lg:size-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-base flex items-center justify-center shadow-xs">
                {appointment.doctorName.charAt(4) || 'D'}
              </div>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-2xs" />
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <h3
              onClick={() => onViewDetails(appointment)}
              className="text-sm lg:text-base font-extrabold text-slate-900 truncate tracking-tight hover:text-blue-600 cursor-pointer transition-colors"
            >
              {appointment.doctorName}
            </h3>

            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="font-semibold text-blue-600 text-[11px] lg:text-xs truncate">
                {appointment.doctorSpecialty}
              </span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-0.5 font-bold text-amber-600 bg-amber-50/80 px-1.5 py-0.2 rounded-md border border-amber-100 text-[11px]">
                <Star className="size-3 fill-amber-400 text-amber-400" />
                {appointment.doctorRating || 4.8}
              </span>
            </div>

            <div className="flex items-center gap-1 text-[11px] lg:text-xs text-slate-500 truncate pt-0.5">
              <Building2 className="size-3 text-slate-400 shrink-0" />
              <span className="truncate font-medium">{appointment.hospitalName}</span>
            </div>
          </div>
        </div>

        {/* Col 3: Consultation & Symptoms Info */}
        <div className="md:col-span-3 lg:col-span-3 border-l border-slate-100 pl-3 lg:pl-4 space-y-1.5 min-w-0">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <div className="size-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              {appointment.consultationType === 'Video Consultation' ? (
                <Video className="size-3" />
              ) : (
                <Stethoscope className="size-3" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[9px] lg:text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                TYPE
              </p>
              <p className="font-bold text-slate-800 text-xs truncate">
                {appointment.consultationType || 'In-person'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 text-xs text-slate-600">
            <div className="size-6 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0 mt-0.5">
              <FileText className="size-3" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] lg:text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                SYMPTOMS
              </p>
              <p
                className="font-medium text-slate-700 text-xs truncate max-w-[150px] lg:max-w-[200px]"
                title={appointment.symptoms}
              >
                {appointment.symptoms || 'General Checkup'}
              </p>
            </div>
          </div>
        </div>

        {/* Col 4: Fee & Appointment No (Desktop lg+) */}
        <div className="hidden lg:block lg:col-span-2 border-l border-slate-100 pl-4 space-y-1 min-w-0">
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              APPOINTMENT NO.
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="font-mono text-xs font-bold text-slate-800 truncate">
                {appointment.appointmentNumber}
              </span>
              <button
                type="button"
                onClick={handleCopyAppointmentNumber}
                title="Copy Appointment ID"
                className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
              >
                {hasCopied ? (
                  <Check className="size-3 text-emerald-600" />
                ) : (
                  <Copy className="size-3" />
                )}
              </button>
            </div>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">FEE</p>
            <p className="text-base font-black text-slate-900 leading-tight">
              ₹{appointment.consultationFee || 500}
            </p>
          </div>
        </div>

        {/* Col 5: Status Badge & Dynamic Actions */}
        <div className="md:col-span-3 lg:col-span-2 border-l border-slate-100 pl-3 lg:pl-0 lg:border-l-0 flex flex-col items-end gap-2 justify-center">
          {/* Tablet md: Show Fee and Status row */}
          <div className="lg:hidden flex items-center justify-between w-full">
            <span className="text-sm font-black text-slate-900">
              ₹{appointment.consultationFee || 500}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}
            >
              <span className={`size-1.5 rounded-full ${badge.dot}`} />
              {badge.label}
            </span>
          </div>

          {/* Desktop lg: Status Badge & Menu */}
          <div className="hidden lg:flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border tracking-wide uppercase ${badge.bg}`}
            >
              <span className={`size-1.5 rounded-full ${badge.dot}`} />
              {badge.label}
            </span>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <MoreVertical className="size-4" />
              </button>

              {isMenuOpen && (
                <div
                  className="absolute right-0 top-8 z-30 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 animate-in fade-in zoom-in-95 duration-150"
                  onMouseLeave={() => setIsMenuOpen(false)}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false)
                      onViewDetails(appointment)
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 cursor-pointer"
                  >
                    <FileText className="size-3.5" />
                    Full Details
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      setIsMenuOpen(false)
                      handleCopyAppointmentNumber(e)
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 cursor-pointer"
                  >
                    <Copy className="size-3.5" />
                    Copy ID
                  </button>
                  {appointment.prescription && onDownloadPrescription && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false)
                        onDownloadPrescription(appointment)
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 cursor-pointer"
                    >
                      <Download className="size-3.5" />
                      Download Prescription
                    </button>
                  )}
                  {appointment.canCancel && onCancel && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false)
                        onCancel(appointment)
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                    >
                      Cancel Appointment
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col items-end gap-1.5 w-full">
            {appointment.status === 'Confirmed' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => onViewDetails(appointment)}
                  className="w-full text-xs font-bold text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 rounded-xl h-8 px-3 cursor-pointer shadow-2xs"
                >
                  View Details
                </Button>
                <div className="flex items-center justify-between w-full px-1 text-[11px] font-semibold">
                  {onReschedule && (
                    <button
                      type="button"
                      onClick={() => onReschedule(appointment)}
                      className="text-slate-600 hover:text-blue-600 cursor-pointer transition-colors"
                    >
                      Reschedule
                    </button>
                  )}
                  {onCancel && (
                    <button
                      type="button"
                      onClick={() => onCancel(appointment)}
                      className="text-rose-600 hover:text-rose-700 font-bold cursor-pointer transition-colors ml-2"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </>
            )}

            {appointment.status === 'Pending' && (
              <>
                <Button
                  onClick={() => (onPayNow ? onPayNow(appointment) : onViewDetails(appointment))}
                  className="w-full text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-8 px-3 shadow-xs cursor-pointer inline-flex items-center justify-center gap-1.5"
                >
                  <CreditCard className="size-3.5" />
                  <span>Pay now</span>
                </Button>
                <button
                  type="button"
                  onClick={() => onViewDetails(appointment)}
                  className="text-[11px] font-semibold text-slate-600 hover:text-blue-600 cursor-pointer pt-0.5"
                >
                  View Details
                </button>
              </>
            )}

            {appointment.status === 'Completed' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => onViewDetails(appointment)}
                  className="w-full text-xs font-bold text-blue-600 border-blue-200 hover:bg-blue-50 rounded-xl h-8 px-3 cursor-pointer shadow-2xs"
                >
                  View Details
                </Button>
                {onWriteReview && (
                  appointment.isReviewed ? (
                    <button
                      type="button"
                      onClick={() => onWriteReview(appointment)}
                      className="w-full text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/90 rounded-xl h-8 px-2.5 inline-flex items-center justify-center gap-1 cursor-pointer transition-all"
                    >
                      <Star className="size-3.5 fill-amber-400 text-amber-500" />
                      <span>★ {appointment.review?.rating || 5}/5 Reviewed</span>
                      <span className="text-[10px] text-amber-600 underline ml-0.5">Edit</span>
                    </button>
                  ) : (
                    <Button
                      onClick={() => onWriteReview(appointment)}
                      className="w-full text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl h-8 px-3 shadow-xs cursor-pointer inline-flex items-center justify-center gap-1.5"
                    >
                      <Star className="size-3.5 fill-white" />
                      <span>Rate & Review</span>
                    </Button>
                  )
                )}
                {onDownloadPrescription && (
                  <button
                    type="button"
                    onClick={() => onDownloadPrescription(appointment)}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 cursor-pointer pt-0.5"
                  >
                    <Download className="size-3" />
                    <span>Download Rx</span>
                  </button>
                )}
              </>
            )}

            {appointment.status === 'Cancelled' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => onViewDetails(appointment)}
                  className="w-full text-xs font-bold text-slate-700 border-slate-200 hover:bg-slate-50 rounded-xl h-8 px-3 cursor-pointer shadow-2xs"
                >
                  View Details
                </Button>
                {onBookAgain && (
                  <button
                    type="button"
                    onClick={() => onBookAgain(appointment)}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 cursor-pointer pt-0.5"
                  >
                    <RotateCcw className="size-3" />
                    <span>Book Again</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
