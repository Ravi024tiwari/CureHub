import { useState, type FC } from 'react'
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Star,
  FileText,
  Phone,
  Mail,
  Globe,
  Building2,
  Stethoscope,
  Video,
  Download,
  RotateCcw,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  History,
  Receipt,
  ExternalLink,
  ShieldCheck,
  Pill,
} from 'lucide-react'
import type { AppointmentCardData } from '@/types/patient'
import { Button } from '@/components/ui/button'

interface AppointmentDetailViewProps {
  appointment: AppointmentCardData
  onBack: () => void
  onReschedule?: (appointment: AppointmentCardData) => void
  onCancel?: (appointment: AppointmentCardData) => void
  onDownloadPrescription?: (appointment: AppointmentCardData) => void
  onBookAgain?: (appointment: AppointmentCardData) => void
  onPayNow?: (appointment: AppointmentCardData) => void
  onWriteReview?: (appointment: AppointmentCardData) => void
}

export const AppointmentDetailView: FC<AppointmentDetailViewProps> = ({
  appointment,
  onBack,
  onReschedule,
  onCancel,
  onDownloadPrescription,
  onBookAgain,
  onPayNow,
  onWriteReview,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'prescription' | 'reschedule-history' | 'invoices'
  >('overview')

  // Status badge styling
  const getStatusBadge = (status: AppointmentCardData['status']) => {
    switch (status) {
      case 'Confirmed':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
          label: 'Confirmed',
        }
      case 'Pending':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
          label: 'Pending',
        }
      case 'Completed':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
          label: 'Completed',
        }
      case 'Cancelled':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
          label: 'Cancelled',
        }
      default:
        return {
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
          label: status,
        }
    }
  }

  const badge = getStatusBadge(appointment.status)

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div className="space-y-1">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer group"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Appointments</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Appointment Details
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Complete information about your appointment
          </p>
        </div>

        {/* Status Badge & Actions */}
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border tracking-wide uppercase ${badge.bg}`}
          >
            <span className={`size-2 rounded-full ${badge.dot}`} />
            {badge.label}
          </span>

          {appointment.prescription && onDownloadPrescription && (
            <Button
              onClick={() => onDownloadPrescription(appointment)}
              className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 px-4 cursor-pointer inline-flex items-center gap-2 shadow-xs"
            >
              <Download className="size-3.5" />
              <span>Download PDF</span>
            </Button>
          )}

          {appointment.status === 'Completed' && onWriteReview && (
            appointment.isReviewed ? (
              <Button
                variant="outline"
                onClick={() => onWriteReview(appointment)}
                className="text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200/90 rounded-xl h-10 px-4 cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
              >
                <Star className="size-4 fill-amber-400 text-amber-500" />
                <span>★ {appointment.review?.rating || 5}/5 (Edit Review)</span>
              </Button>
            ) : (
              <Button
                onClick={() => onWriteReview(appointment)}
                className="text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl h-10 px-4 cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
              >
                <Star className="size-4 fill-white" />
                <span>Rate & Review</span>
              </Button>
            )
          )}
        </div>
      </div>

      {/* Doctor & Hospital Summary Banner Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Doctor Info */}
          <div className="flex items-center gap-4">
            {appointment.doctorAvatar ? (
              <img
                src={appointment.doctorAvatar}
                alt={appointment.doctorName}
                className="size-16 sm:size-20 rounded-2xl object-cover object-top border-2 border-slate-100 shadow-xs shrink-0"
              />
            ) : (
              <div className="size-16 sm:size-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shrink-0">
                {appointment.doctorName.charAt(4) || 'D'}
              </div>
            )}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                <ShieldCheck className="size-3" />
                Verified Specialist
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {appointment.doctorName}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold text-blue-600">{appointment.doctorSpecialty}</span>
                <span className="text-slate-300">•</span>
                <span className="inline-flex items-center gap-1 font-bold text-amber-600">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  {appointment.doctorRating || 4.8}
                  <span className="text-slate-400 font-normal">
                    ({appointment.doctorReviewCount || 320} reviews)
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Hospital Preview */}
          <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 max-w-md">
            {appointment.hospitalImage ? (
              <img
                src={appointment.hospitalImage}
                alt={appointment.hospitalName}
                className="size-14 rounded-xl object-cover shrink-0"
              />
            ) : (
              <div className="size-14 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Building2 className="size-7" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">
                {appointment.hospitalName}
              </p>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                {appointment.hospitalAddress || 'Civil Lines, Bilaspur, Chhattisgarh'}
              </p>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-blue-600 font-semibold">
                <Phone className="size-3" />
                <span>{appointment.hospitalPhone || '+91 98765 43210'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Metadata Strip Pills */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
            <div className="size-8 rounded-xl bg-blue-100/70 text-blue-600 flex items-center justify-center shrink-0">
              <Calendar className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Date</p>
              <p className="text-xs font-bold text-slate-800 truncate">{appointment.date}</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
            <div className="size-8 rounded-xl bg-indigo-100/70 text-indigo-600 flex items-center justify-center shrink-0">
              <Clock className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Time Slot</p>
              <p className="text-xs font-bold text-slate-800 truncate">{appointment.time}</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
            <div className="size-8 rounded-xl bg-purple-100/70 text-purple-600 flex items-center justify-center shrink-0">
              {appointment.consultationType === 'Video Consultation' ? (
                <Video className="size-4" />
              ) : (
                <Stethoscope className="size-4" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Mode</p>
              <p className="text-xs font-bold text-slate-800 truncate">
                {appointment.consultationType || 'In-person'}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
            <div className="size-8 rounded-xl bg-emerald-100/70 text-emerald-600 flex items-center justify-center shrink-0">
              <Receipt className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Appointment ID</p>
              <p className="text-xs font-bold font-mono text-slate-800 truncate">
                {appointment.appointmentNumber || 'APT-20261012-7610'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'overview', label: 'Overview', icon: FileText },
          { id: 'prescription', label: 'Prescription', icon: Pill },
          { id: 'reschedule-history', label: 'Reschedule History', icon: History },
          { id: 'invoices', label: 'Invoices & Receipts', icon: Receipt },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="size-4" />
              <span>{tab.label}</span>
              {tab.id === 'prescription' && appointment.prescription && (
                <span className="size-2 rounded-full bg-emerald-400" />
              )}
            </button>
          )
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Card: Appointment Information */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <FileText className="size-4 text-blue-600" />
                  Appointment Information
                </h3>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${badge.bg}`}
                >
                  {badge.label}
                </span>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400">Consultation Type:</span>
                  <span className="font-bold text-slate-900">
                    {appointment.consultationType || 'In-person'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400">Scheduled Date:</span>
                  <span className="font-bold text-slate-900">{appointment.date}</span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400">Time Slot:</span>
                  <span className="font-bold text-slate-900">{appointment.time}</span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400">Consultation Fee:</span>
                  <span className="font-black text-slate-900 text-sm">
                    ₹{appointment.consultationFee || 600}
                  </span>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <p className="text-slate-400 mb-1">Symptoms / Reason for Visit:</p>
                  <p className="font-semibold text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {appointment.symptoms || 'Regular clinical consultation'}
                  </p>
                </div>

                <div className="flex items-center justify-between text-slate-600 pt-2 border-t border-slate-100">
                  <span className="text-slate-400">Booked On:</span>
                  <span className="font-medium text-slate-700">
                    {appointment.bookedOn || '08 Oct 2026, 14:22'}
                  </span>
                </div>

                {appointment.cancellation && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 space-y-1">
                    <p className="font-bold text-[11px] uppercase tracking-wider">
                      Cancellation Reason:
                    </p>
                    <p className="text-xs">{appointment.cancellation.reason}</p>
                    <p className="text-[10px] text-rose-500">
                      Cancelled on: {appointment.cancellation.cancelledAt}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Card: Hospital Information */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <Building2 className="size-4 text-blue-600" />
                    Hospital Information
                  </h3>
                  <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                    Accredited Center
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  {appointment.hospitalImage ? (
                    <img
                      src={appointment.hospitalImage}
                      alt={appointment.hospitalName}
                      className="size-16 rounded-2xl object-cover shrink-0 border border-slate-100 shadow-xs"
                    />
                  ) : (
                    <div className="size-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <Building2 className="size-8" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h4 className="text-base font-bold text-slate-900 truncate">
                      {appointment.hospitalName}
                    </h4>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {appointment.hospitalAddress || 'Civil Lines, Bilaspur, Chhattisgarh - 495001'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs pt-2">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="size-3.5 text-blue-600 shrink-0" />
                    <span className="font-medium">
                      {appointment.hospitalPhone || '+91 98765 43210'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="size-3.5 text-blue-600 shrink-0" />
                    <span className="font-medium">
                      {appointment.hospitalEmail || 'info@apollohospital.com'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600">
                    <Globe className="size-3.5 text-blue-600 shrink-0" />
                    <span className="font-medium">
                      {appointment.hospitalWebsite || 'www.apollohospital.com'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="size-3.5 text-blue-600 shrink-0" />
                    <span className="font-medium">
                      {appointment.hospitalTimings || '09:00 AM - 11:00 PM (Mon - Sun)'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <Button
                  variant="outline"
                  onClick={() =>
                    window.open(
                      `https://maps.google.com/?q=${encodeURIComponent(appointment.hospitalName + ' ' + (appointment.hospitalAddress || 'Bilaspur'))}`,
                      '_blank'
                    )
                  }
                  className="w-full text-xs font-bold text-blue-600 border-blue-200 hover:bg-blue-50 rounded-xl h-10 cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <MapPin className="size-3.5" />
                  <span>View on Map</span>
                  <ExternalLink className="size-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Integrated Prescription Box if available on Overview */}
          {appointment.prescription && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Pill className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Digital Prescription</h3>
                    <p className="text-xs text-slate-500">
                      Issued on: {appointment.prescription.issuedAt || appointment.date}
                    </p>
                  </div>
                </div>

                {onDownloadPrescription && (
                  <Button
                    onClick={() => onDownloadPrescription(appointment)}
                    className="text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl h-9 px-3.5 cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Download className="size-3.5" />
                    <span>Download PDF</span>
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Diagnosis:</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {appointment.prescription.diagnosis || 'Allergic dermatitis'}
                  </p>
                </div>

                {/* Medicines Table */}
                <div className="overflow-x-auto rounded-2xl border border-slate-100">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                      <tr>
                        <th className="py-2.5 px-4">Medicine</th>
                        <th className="py-2.5 px-4">Dosage</th>
                        <th className="py-2.5 px-4">Frequency</th>
                        <th className="py-2.5 px-4">Duration</th>
                        <th className="py-2.5 px-4">Instructions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {appointment.prescription.medicines.map((med, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 font-bold text-slate-900">{med.name}</td>
                          <td className="py-3 px-4 text-slate-600">{med.dosage}</td>
                          <td className="py-3 px-4 text-slate-600">{med.frequency}</td>
                          <td className="py-3 px-4 text-slate-600">{med.duration}</td>
                          <td className="py-3 px-4 text-blue-600 font-medium">
                            {med.instructions || 'After food'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {appointment.prescription.notes && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs text-slate-600 space-y-1">
                    <span className="font-bold text-slate-800">Additional Notes:</span>
                    <p>{appointment.prescription.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dedicated Doctor Feedback & Verified Review Card for Completed Appointments */}
          {appointment.status === 'Completed' && onWriteReview && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                    <Star className="size-4.5 fill-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                      Your Consultation Feedback
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Verified consultation experience with {appointment.doctorName}
                    </p>
                  </div>
                </div>

                {appointment.isReviewed && (
                  <button
                    type="button"
                    onClick={() => onWriteReview(appointment)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 underline cursor-pointer"
                  >
                    Edit Review
                  </button>
                )}
              </div>

              {appointment.isReviewed && appointment.review ? (
                <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`size-4 ${
                              s <= (appointment.review?.rating || 5)
                                ? 'fill-amber-400 text-amber-400'
                                : 'fill-slate-200 text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-black text-slate-800">
                        {appointment.review.rating}.0 / 5.0
                      </span>
                    </div>

                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="size-3" />
                      Verified Patient
                    </span>
                  </div>

                  {appointment.review.tags && appointment.review.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {appointment.review.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-0.5 rounded-lg bg-white border border-amber-200 text-[10px] font-bold text-slate-700 shadow-2xs"
                        >
                          ✓ {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-xs font-medium text-slate-700 leading-relaxed italic">
                    "{appointment.review.comment}"
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Share your experience with {appointment.doctorName}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Your genuine rating helps thousands of other patients make confident healthcare decisions.
                    </p>
                  </div>
                  <Button
                    onClick={() => onWriteReview(appointment)}
                    className="shrink-0 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl h-9 px-4 cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                  >
                    <Star className="size-3.5 fill-white" />
                    <span>Rate Consultation</span>
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Bottom Action Bar */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-500 font-medium">
              Need assistance with this appointment? Contact hospital support or CarePlus helpline.
            </div>

            <div className="flex items-center gap-2">
              {appointment.status === 'Confirmed' && (
                <>
                  {onReschedule && (
                    <Button
                      variant="outline"
                      onClick={() => onReschedule(appointment)}
                      className="text-xs font-bold text-slate-700 border-slate-300 hover:bg-slate-100 rounded-xl h-9 px-4 cursor-pointer"
                    >
                      Reschedule
                    </Button>
                  )}
                  {onCancel && (
                    <Button
                      variant="outline"
                      onClick={() => onCancel(appointment)}
                      className="text-xs font-bold text-rose-600 border-rose-200 hover:bg-rose-50 rounded-xl h-9 px-4 cursor-pointer"
                    >
                      Cancel Appointment
                    </Button>
                  )}
                </>
              )}

              {appointment.status === 'Pending' && onPayNow && (
                <Button
                  onClick={() => onPayNow(appointment)}
                  className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-9 px-5 shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <CreditCard className="size-3.5" />
                  <span>Pay Now (₹{appointment.consultationFee || 700})</span>
                </Button>
              )}

              {(appointment.status === 'Completed' || appointment.status === 'Cancelled') &&
                onBookAgain && (
                  <Button
                    onClick={() => onBookAgain(appointment)}
                    className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-9 px-4 cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                  >
                    <RotateCcw className="size-3.5" />
                    <span>Book Again</span>
                  </Button>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Prescription Dedicated View */}
      {activeTab === 'prescription' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-5">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Digital Medical Prescription
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Authored by {appointment.doctorName} • {appointment.hospitalName}
              </p>
            </div>

            {onDownloadPrescription && (
              <Button
                onClick={() => onDownloadPrescription(appointment)}
                className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 px-5 cursor-pointer inline-flex items-center gap-2 shadow-xs"
              >
                <Download className="size-4" />
                <span>Download PDF</span>
              </Button>
            )}
          </div>

          {appointment.prescription ? (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                    Primary Diagnosis
                  </span>
                  <p className="text-base font-extrabold text-slate-900 mt-0.5">
                    {appointment.prescription.diagnosis || 'Allergic dermatitis'}
                  </p>
                </div>
                <div className="text-right text-xs">
                  <span className="text-slate-400">Date Issued:</span>
                  <p className="font-bold text-slate-800">
                    {appointment.prescription.issuedAt || appointment.date}
                  </p>
                </div>
              </div>

              {/* Medicines List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Prescribed Medications
                </h4>
                <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Medicine</th>
                        <th className="py-3 px-4">Dosage</th>
                        <th className="py-3 px-4">Frequency</th>
                        <th className="py-3 px-4">Duration</th>
                        <th className="py-3 px-4">Instructions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {appointment.prescription.medicines.map((m, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="py-3.5 px-4 font-bold text-slate-900">{m.name}</td>
                          <td className="py-3.5 px-4 text-slate-600">{m.dosage}</td>
                          <td className="py-3.5 px-4 text-slate-600">{m.frequency}</td>
                          <td className="py-3.5 px-4 text-slate-600">{m.duration}</td>
                          <td className="py-3.5 px-4 text-blue-600 font-medium">{m.instructions}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Additional Clinical Notes */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-xs text-amber-900 space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-amber-800">
                  <AlertCircle className="size-4" />
                  Clinical Advice & Precautionary Notes:
                </span>
                <p className="leading-relaxed">
                  {appointment.prescription.notes ||
                    'Avoid harsh soaps, consume plenty of fluids, and keep skin moisturized. Follow up if symptoms persist after 7 days.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center space-y-3">
              <Pill className="size-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">No Electronic Prescription Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Electronic prescription will be uploaded and accessible here once your consultation
                is completed by {appointment.doctorName}.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Reschedule History */}
      {activeTab === 'reschedule-history' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Reschedule & Change Log
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              History of slot modifications and timeline adjustments
            </p>
          </div>

          {appointment.rescheduleHistory && appointment.rescheduleHistory.length > 0 ? (
            <div className="space-y-4">
              {appointment.rescheduleHistory.map((h, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span className="flex items-center gap-2">
                      <History className="size-4 text-blue-600" />
                      Rescheduled from: {h.previousDate} ({h.previousStartTime})
                    </span>
                    <span className="text-[11px] text-slate-400 font-normal">
                      On {h.rescheduledAt}
                    </span>
                  </div>
                  {h.reason && (
                    <p className="text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100">
                      <span className="font-semibold text-slate-700">Reason:</span> {h.reason}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center space-y-3">
              <History className="size-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">Original Scheduled Slot</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                This appointment is proceeding on its originally booked slot ({appointment.date} at{' '}
                {appointment.time}) without any rescheduling.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Invoices & Receipts */}
      {activeTab === 'invoices' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Tax Invoice & Payment Receipt
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Receipt Number: RCP-{appointment.appointmentNumber?.slice(-6) || '202610'}
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold uppercase">
              <CheckCircle2 className="size-3.5" />
              Paid Online
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>Consultation Charge ({appointment.doctorName}):</span>
              <span className="font-bold text-slate-900">
                ₹{appointment.consultationFee || 600}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Platform Booking & SMS Fee:</span>
              <span className="font-bold text-slate-900">₹0 (Free)</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Applicable Taxes (GST 0% on Health Consultations):</span>
              <span className="font-bold text-slate-900">₹0</span>
            </div>
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-sm font-black text-slate-900">
              <span>Total Paid:</span>
              <span className="text-blue-600">₹{appointment.consultationFee || 600}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
