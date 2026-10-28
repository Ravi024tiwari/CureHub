import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ChevronLeft,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Building2,
  Stethoscope,
  MapPin,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Copy,
  CreditCard,
  FileText,
  CalendarClock,
  RefreshCw,
  Activity,
  ShieldCheck,
  History,
} from 'lucide-react'
import { HospitalAdminLayout } from '@/components/hospital-admin/HospitalAdminLayout'
import {
  CancelAppointmentModal,
  RescheduleAppointmentModal,
} from '@/components/hospital-admin/appointments'
import { hospitalAdminService } from '@/services/hospitalAdminService'
import type {
  AdminAppointmentItem,
  AdminAppointmentDetailResponse,
} from '@/types/hospitalAdmin'

export const HospitalAdminAppointmentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [appointmentDetail, setAppointmentDetail] =
    useState<AdminAppointmentDetailResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Action Modals
  const [isCancelOpen, setIsCancelOpen] = useState(false)
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null)

  const fetchDetail = async (appointmentId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await hospitalAdminService.getAppointmentById(appointmentId)
      const data = (res as any)?.data || res
      setAppointmentDetail(data)
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to load appointment details from hospital database.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchDetail(id)
    }
  }, [id])

  const appt = appointmentDetail?.appointment as any
  const payment = appointmentDetail?.payment
  const patientProfile = appointmentDetail?.patientProfile
  const medicalHistory = appointmentDetail?.medicalHistory || []

  const handleCopyId = () => {
    if (appt?.appointmentNumber) {
      navigator.clipboard.writeText(appt.appointmentNumber)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    }
  }

  // Convert raw appt to AdminAppointmentItem shape for Modals
  const appointmentForModal: AdminAppointmentItem | null = appt
    ? {
        _id: appt._id,
        appointmentNumber: appt.appointmentNumber,
        date: appt.date,
        startTime: appt.startTime,
        endTime: appt.endTime,
        dateTimeFormatted: `${appt.date}, ${appt.startTime}`,
        type: 'IN_PERSON',
        mode: 'On-site',
        status: appt.status,
        displayStatus:
          appt.status === 'CONFIRMED'
            ? 'Confirmed'
            : appt.status === 'COMPLETED'
            ? 'Completed'
            : appt.status === 'PENDING_PAYMENT'
            ? 'Pending'
            : appt.status?.includes('CANCEL')
            ? 'Cancelled'
            : appt.status,
        symptoms: appt.symptoms || '',
        reasonForVisit: appt.symptoms || '',
        consultationFee: appt.consultationFee || 0,
        patient: {
          id: appt.patientId?._id || '',
          name: appt.patientDetails?.fullName || appt.patientId?.name || 'Patient',
          email: appt.patientId?.email || '',
          phoneNumber:
            appt.patientDetails?.phoneNumber || appt.patientId?.phoneNumber || '',
          avatar: appt.patientId?.avatar || null,
          age: appt.patientDetails?.age || null,
          gender: appt.patientDetails?.gender || appt.patientId?.gender || null,
        },
        doctor: {
          id: appt.doctorId?._id || '',
          name: appt.doctorId?.userId?.name || 'Doctor',
          avatar: appt.doctorId?.userId?.avatar || null,
          department: appt.doctorId?.department || 'General',
          specialization: appt.doctorId?.specialization || [],
          experienceYears: appt.doctorId?.experienceYears || 0,
          ratingAverage: appt.doctorId?.ratingAverage || 0,
        },
        hospital: {
          id: appt.hospitalId?._id || '',
          name: appt.hospitalId?.name || 'Hospital',
          city: appt.hospitalId?.address?.city || '',
          state: appt.hospitalId?.address?.state || '',
          address: appt.hospitalId?.address?.street || '',
        },
        payment: {
          status: payment?.status || 'COMPLETED',
          amount: payment?.amount || appt.consultationFee || 0,
          method: payment?.paymentMethod || 'Counter Cash',
          transactionId: payment?.transactionId || '-',
          isPaid: payment?.status === 'COMPLETED' || appt.status === 'CONFIRMED',
        },
        bookedOn: appt.createdAt,
      }
    : null

  const getStatusBadge = (status: string) => {
    const s = (status || '').toUpperCase()
    if (s === 'CONFIRMED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          Confirmed
        </span>
      )
    }
    if (s === 'PENDING' || s === 'PENDING_PAYMENT') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
          <span className="size-2 rounded-full bg-amber-500" />
          Pending
        </span>
      )
    }
    if (s === 'COMPLETED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
          <span className="size-2 rounded-full bg-blue-500" />
          Completed
        </span>
      )
    }
    if (s.includes('CANCEL')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
          <span className="size-2 rounded-full bg-rose-500" />
          Cancelled
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-slate-100 text-slate-700 border border-slate-200">
        {status}
      </span>
    )
  }

  return (
    <HospitalAdminLayout activePage="appointments">
      <main className="flex-1 max-w-[1500px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8 space-y-6 sm:space-y-8 min-h-full pb-20 animate-in fade-in duration-200">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link
              to="/hospital-admin/appointments"
              className="inline-flex items-center gap-1 text-slate-600 hover:text-blue-600 transition"
            >
              <ChevronLeft className="size-4" />
              <span>Back to Appointments</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-bold truncate">
              {appt?.appointmentNumber || 'Appointment Details'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => id && fetchDetail(id)}
            disabled={isLoading}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition cursor-pointer"
            title="Refresh Details"
          >
            <RefreshCw className={`size-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>

        {/* Action feedback banner */}
        {actionSuccessMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-emerald-800 text-xs sm:text-sm font-semibold">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-600" />
              <span>{actionSuccessMsg}</span>
            </div>
            <button
              onClick={() => setActionSuccessMsg(null)}
              className="text-emerald-700 hover:text-emerald-900"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Loading State Skeleton */}
        {isLoading && (
          <div className="space-y-6 animate-pulse">
            <div className="h-28 bg-slate-100 rounded-3xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-slate-100 rounded-3xl" />
                <div className="h-48 bg-slate-100 rounded-3xl" />
              </div>
              <div className="space-y-6">
                <div className="h-56 bg-slate-100 rounded-3xl" />
                <div className="h-64 bg-slate-100 rounded-3xl" />
              </div>
            </div>
          </div>
        )}

        {/* Error Screen */}
        {!isLoading && error && (
          <div className="bg-white rounded-3xl p-10 border border-red-200 text-center space-y-4 max-w-lg mx-auto shadow-sm">
            <div className="size-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="size-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Appointment Not Found</h3>
            <p className="text-xs text-slate-500">{error}</p>
            <button
              onClick={() => navigate('/hospital-admin/appointments')}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition"
            >
              Return to Appointments
            </button>
          </div>
        )}

        {/* Loaded Appointment Detail Page */}
        {!isLoading && appt && (
          <>
            {/* Header Card */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {appt.appointmentNumber}
                  </h1>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Copy Appointment ID"
                  >
                    <Copy className="size-4" />
                  </button>
                  {copySuccess && (
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Copied!
                    </span>
                  )}
                  {getStatusBadge(appt.status)}
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    <MapPin className="size-3 text-blue-600" />
                    On-site Visit
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Booked on {new Date(appt.createdAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>

              {/* Action Buttons for Hospital Admin */}
              <div className="flex items-center gap-2.5 flex-wrap">
                {appt.status !== 'COMPLETED' && !appt.status?.includes('CANCEL') && (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsRescheduleOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 text-xs sm:text-sm font-bold transition cursor-pointer"
                    >
                      <CalendarClock className="size-4 text-amber-600" />
                      <span>Reschedule Visit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsCancelOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 text-xs sm:text-sm font-bold transition cursor-pointer"
                    >
                      <XCircle className="size-4 text-rose-600" />
                      <span>Cancel Appointment</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Two-Column Grid Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Patient & Consultation Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* 1. Patient Information Card */}
                <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    <User className="size-4 text-blue-600" />
                    <span>Patient Information</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-1">
                    <div className="size-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-2xl shrink-0 shadow-md shadow-blue-500/20 overflow-hidden">
                      {appt.patientId?.avatar ? (
                        <img
                          src={appt.patientId.avatar}
                          alt={appt.patientDetails?.fullName || appt.patientId?.name}
                          className="size-full object-cover"
                        />
                      ) : (
                        <span>
                          {(appt.patientDetails?.fullName || appt.patientId?.name || 'P').charAt(0)}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <h3 className="text-lg font-bold text-slate-900">
                        {appt.patientDetails?.fullName || appt.patientId?.name || 'Patient Name'}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {typeof appt.patientDetails?.age === 'number'
                          ? `${appt.patientDetails.age} years`
                          : ''}
                        {appt.patientDetails?.gender
                          ? ` • ${appt.patientDetails.gender}`
                          : appt.patientId?.gender
                          ? ` • ${appt.patientId.gender}`
                          : ''}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <Phone className="size-4 text-slate-400 shrink-0" />
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Phone</p>
                        <a
                          href={`tel:${appt.patientDetails?.phoneNumber || appt.patientId?.phoneNumber}`}
                          className="font-semibold text-slate-800 hover:text-blue-600"
                        >
                          {appt.patientDetails?.phoneNumber || appt.patientId?.phoneNumber || 'Not provided'}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <Mail className="size-4 text-slate-400 shrink-0" />
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Email</p>
                        <a
                          href={`mailto:${appt.patientId?.email}`}
                          className="font-semibold text-slate-800 hover:text-blue-600 truncate block max-w-[200px]"
                        >
                          {appt.patientId?.email || 'Not provided'}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Medical profile snapshot if available */}
                  {patientProfile && (
                    <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs space-y-2">
                      <div className="flex items-center gap-2 font-bold text-blue-900">
                        <Activity className="size-3.5 text-blue-600" />
                        <span>Medical Profile Snapshot</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-700">
                        <div>
                          <span className="text-slate-400 text-[10px] block">Blood Group</span>
                          <span className="font-bold">{patientProfile.bloodGroup || 'Not specified'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">Allergies</span>
                          <span className="font-semibold">
                            {patientProfile.allergies?.length ? patientProfile.allergies.join(', ') : 'None reported'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">Chronic Conditions</span>
                          <span className="font-semibold">
                            {patientProfile.chronicDiseases?.length
                              ? patientProfile.chronicDiseases.join(', ')
                              : 'None reported'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Doctor & Hospital Details Card */}
                <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    <Stethoscope className="size-4 text-emerald-600" />
                    <span>Attending Doctor & Hospital</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    {/* Doctor Info */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="size-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
                          {appt.doctorId?.userId?.avatar ? (
                            <img
                              src={appt.doctorId.userId.avatar}
                              alt={appt.doctorId.userId?.name}
                              className="size-full object-cover rounded-xl"
                            />
                          ) : (
                            <User className="size-5 text-emerald-700" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900">
                            {appt.doctorId?.userId?.name?.startsWith('Dr.')
                              ? appt.doctorId.userId.name
                              : `Dr. ${appt.doctorId?.userId?.name || 'Specialist'}`}
                          </h4>
                          <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800 mt-0.5">
                            {appt.doctorId?.department || 'Department'}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-slate-600 space-y-1 pt-1">
                        <p>
                          <span className="font-medium text-slate-400">Specialization:</span>{' '}
                          <span className="font-semibold">
                            {appt.doctorId?.specialization?.join(', ') || appt.doctorId?.department || '-'}
                          </span>
                        </p>
                        {appt.doctorId?.experienceYears > 0 && (
                          <p>
                            <span className="font-medium text-slate-400">Experience:</span>{' '}
                            <span className="font-semibold">{appt.doctorId.experienceYears} Years</span>
                          </p>
                        )}
                        {appt.doctorId?.medicalCouncilRegistrationNumber && (
                          <p>
                            <span className="font-medium text-slate-400">MCI Reg No:</span>{' '}
                            <span className="font-mono font-semibold">
                              {appt.doctorId.medicalCouncilRegistrationNumber}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Hospital Info */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="size-5 text-blue-600" />
                        <h4 className="text-sm font-extrabold text-slate-900">
                          {appt.hospitalId?.name || 'Hospital Branch'}
                        </h4>
                      </div>
                      <div className="text-xs text-slate-600 space-y-1">
                        <p className="flex items-start gap-1.5">
                          <MapPin className="size-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span>
                            {appt.hospitalId?.address?.street
                              ? `${appt.hospitalId.address.street}, `
                              : ''}
                            {appt.hospitalId?.address?.city || ''}
                            {appt.hospitalId?.address?.state
                              ? `, ${appt.hospitalId.address.state}`
                              : ''}
                          </span>
                        </p>
                        {appt.hospitalId?.contactPhone && (
                          <p className="flex items-center gap-1.5">
                            <Phone className="size-3.5 text-slate-400 shrink-0" />
                            <span>{appt.hospitalId.contactPhone}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Schedule, Chief Complaints & Clinical Notes */}
                <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    <Calendar className="size-4 text-blue-600" />
                    <span>Schedule & Clinical Notes</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                        Date & Time Slot
                      </p>
                      <p className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                        <Calendar className="size-4 text-blue-600" />
                        <span>{appt.date}</span>
                        <span className="text-slate-300">•</span>
                        <Clock className="size-4 text-blue-600" />
                        <span>{appt.startTime}</span>
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                        Consultation Mode
                      </p>
                      <p className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                        <span className="size-2 rounded-full bg-emerald-500" />
                        <span>On-site In-Person Visit</span>
                      </p>
                    </div>
                  </div>

                  {/* Symptoms */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                      <FileText className="size-3 text-slate-500" />
                      Symptoms / Chief Complaint
                    </p>
                    <p className="text-xs sm:text-sm font-medium text-slate-800">
                      {appt.symptoms || 'No specific symptoms described.'}
                    </p>
                  </div>

                  {/* Prescription notes if present */}
                  {appt.prescription?.notes && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                      <p className="text-[10px] uppercase font-bold text-slate-400">
                        Doctor Prescription & Advice
                      </p>
                      <p className="text-xs sm:text-sm font-medium text-slate-800 whitespace-pre-line">
                        {appt.prescription.notes}
                      </p>
                    </div>
                  )}

                  {/* Reschedule history if present */}
                  {appt.rescheduleHistory?.length > 0 && (
                    <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                      <p className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                        <History className="size-3.5 text-amber-700" />
                        Reschedule History
                      </p>
                      <div className="space-y-1.5 text-xs text-amber-800">
                        {appt.rescheduleHistory.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between">
                            <span>
                              Previously: {item.previousDate} at {item.previousStartTime}
                            </span>
                            <span className="text-[11px] font-semibold text-amber-700">
                              Reason: {item.reason}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cancellation details if cancelled */}
                  {appt.cancellation && (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-1 text-xs">
                      <p className="font-bold text-rose-800 flex items-center gap-1.5">
                        <XCircle className="size-3.5 text-rose-600" />
                        Cancelled Appointment
                      </p>
                      <p className="text-rose-700">
                        Reason: {appt.cancellation.reason || 'Cancelled by administration'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Payment & History */}
              <div className="space-y-6">
                {/* 1. Payment Summary Card */}
                <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    <CreditCard className="size-4 text-blue-600" />
                    <span>Payment Details</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium">Consultation Fee</span>
                      <span className="text-lg font-black text-slate-900">
                        ₹{appt.consultationFee || payment?.amount || 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/80">
                      <span className="text-slate-500 font-medium">Payment Status</span>
                      <span
                        className={`font-bold px-2.5 py-0.5 rounded-full text-[11px] ${
                          payment?.status === 'COMPLETED' || appt.status === 'CONFIRMED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {payment?.status === 'COMPLETED' || appt.status === 'CONFIRMED'
                          ? 'PAID'
                          : 'PENDING'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Payment Method</span>
                      <span className="font-bold text-slate-800">
                        {payment?.paymentMethod || 'Counter Cash'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Transaction ID</span>
                      <span className="font-mono text-slate-700 text-[11px]">
                        {payment?.transactionId || '-'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Patient Hospital History */}
                <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    <History className="size-4 text-blue-600" />
                    <span>Previous Hospital Visits</span>
                  </div>

                  {medicalHistory.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No other consultation records found for this patient at this hospital.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {medicalHistory.map((hist) => (
                        <div
                          key={hist._id}
                          className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between font-bold text-slate-800">
                            <span>{hist.date}</span>
                            <span className="text-[10px] uppercase text-slate-400">
                              {hist.status}
                            </span>
                          </div>
                          <p className="text-slate-500 truncate">{hist.symptoms || 'General visit'}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modals for Direct Actions */}
            <CancelAppointmentModal
              appointment={appointmentForModal}
              isOpen={isCancelOpen}
              onClose={() => {
                setIsCancelOpen(false)
                if (id) fetchDetail(id)
              }}
            />

            <RescheduleAppointmentModal
              appointment={appointmentForModal}
              isOpen={isRescheduleOpen}
              onClose={() => {
                setIsRescheduleOpen(false)
                if (id) fetchDetail(id)
              }}
            />
          </>
        )}
      </main>
    </HospitalAdminLayout>
  )
}

export default HospitalAdminAppointmentDetailPage
