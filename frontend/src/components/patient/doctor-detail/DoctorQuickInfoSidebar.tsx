import { type FC } from 'react'
import {
  Info,
  Briefcase,
  IndianRupee,
  Layers,
  FileCheck2,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  FileBadge,
  ExternalLink,
  CalendarPlus,
  PhoneCall,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { DoctorDetailData } from '@/types/patient'

interface DoctorQuickInfoSidebarProps {
  doctor: DoctorDetailData
  onBookAppointment: () => void
  onContactDoctor: () => void
  onViewDocument?: () => void
}

export const DoctorQuickInfoSidebar: FC<DoctorQuickInfoSidebarProps> = ({
  doctor,
  onBookAppointment,
  onContactDoctor,
  onViewDocument,
}) => {
  const hospital = doctor.hospitalId
  const hospitalName = doctor.hospitalName || hospital?.name || 'Apollo Multispeciality Hospital'
  const fullAddress = hospital?.address
    ? `${hospital.address.street || ''}, ${hospital.address.city || ''}, ${hospital.address.state || ''} ${hospital.address.zipCode || ''}, ${hospital.address.country || 'India'}`
    : doctor.hospitalLocation || 'Apollo Multispeciality Hospital, Civil Lines, Bilaspur, Chhattisgarh 495001, India'

  const handleOpenMap = () => {
    const query = encodeURIComponent(`${hospitalName}, ${fullAddress}`)
    window.open(`https://maps.google.com/?q=${query}`, '_blank')
  }

  const handleViewLicense = () => {
    if (onViewDocument) {
      onViewDocument()
    } else if (doctor.licenseDocumentUrl) {
      window.open(doctor.licenseDocumentUrl, '_blank')
    } else {
      alert(`Medical Council Registration Proof: ${doctor.medicalCouncilRegistrationNumber || 'MCI/12345/2012'}\nStatus: Verified Specialist`)
    }
  }

  return (
    <div className="space-y-5">
      {/* 1. Quick Info Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="size-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Info className="size-4" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">Quick Info</h3>
        </div>

        <div className="space-y-3.5 text-xs sm:text-sm">
          {/* Experience */}
          <div className="flex items-center justify-between py-0.5">
            <span className="text-slate-500 flex items-center gap-2">
              <Briefcase className="size-4 text-slate-400" />
              <span>Experience</span>
            </span>
            <span className="font-bold text-slate-800">{doctor.experienceYears}+ Years</span>
          </div>

          {/* Consultation Fee */}
          <div className="flex items-center justify-between py-0.5">
            <span className="text-slate-500 flex items-center gap-2">
              <IndianRupee className="size-4 text-slate-400" />
              <span>Consultation Fee</span>
            </span>
            <span className="font-extrabold text-slate-900">₹{doctor.consultationFee || 500}</span>
          </div>

          {/* Department */}
          <div className="flex items-center justify-between py-0.5">
            <span className="text-slate-500 flex items-center gap-2">
              <Layers className="size-4 text-slate-400" />
              <span>Department</span>
            </span>
            <span className="font-bold text-slate-800 truncate max-w-[150px]">
              {doctor.department || 'Cardiology'}
            </span>
          </div>

          {/* Registration No */}
          <div className="flex items-center justify-between py-0.5">
            <span className="text-slate-500 flex items-center gap-2">
              <FileCheck2 className="size-4 text-slate-400" />
              <span>Registration No.</span>
            </span>
            <span className="font-mono text-xs font-semibold text-slate-700">
              {doctor.medicalCouncilRegistrationNumber || 'MCI/12345/2012'}
            </span>
          </div>

          {/* Affiliation Status */}
          <div className="flex items-center justify-between py-0.5">
            <span className="text-slate-500">Affiliation Status</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {doctor.hospitalAffiliationStatus || 'Approved'}
            </span>
          </div>

          {/* Verification Status */}
          <div className="flex items-center justify-between py-0.5">
            <span className="text-slate-500">Verification Status</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="size-3 text-emerald-600" />
              <span>Verified</span>
            </span>
          </div>

          {/* Availability */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
            <span className="text-slate-500">Availability</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Available for Appointments</span>
            </span>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <Button
            onClick={onBookAppointment}
            className="w-full h-11 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <CalendarPlus className="size-4" />
            <span>Book Appointment</span>
          </Button>

          <Button
            variant="outline"
            onClick={onContactDoctor}
            className="w-full h-10 rounded-2xl border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <PhoneCall className="size-3.5 text-blue-600" />
            <span>Contact Doctor</span>
          </Button>
        </div>
      </div>

      {/* 2. Contact Information Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="size-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Phone className="size-4" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">Contact Information</h3>
        </div>

        <div className="space-y-3 text-xs sm:text-sm">
          {/* Phone */}
          <div className="flex items-center gap-3">
            <div className="size-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
              <Phone className="size-3.5" />
            </div>
            <a
              href={`tel:${doctor.phoneNumber || '+919876543210'}`}
              className="font-bold text-slate-800 hover:text-blue-600 transition-colors"
            >
              {doctor.phoneNumber || '+91 98765 43210'}
            </a>
          </div>

          {/* Email */}
          <div className="flex items-center gap-3">
            <div className="size-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
              <Mail className="size-3.5" />
            </div>
            <a
              href={`mailto:${doctor.email || 'amit.singh@hospital.com'}`}
              className="font-medium text-slate-600 hover:text-blue-600 truncate transition-colors"
            >
              {doctor.email || 'amit.singh@hospital.com'}
            </a>
          </div>

          {/* Hospital Address */}
          <div className="flex items-start gap-3 pt-1">
            <div className="size-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
              <MapPin className="size-3.5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-slate-800">Hospital Address</p>
              <p className="text-xs text-slate-500 leading-relaxed">{fullAddress}</p>
            </div>
          </div>
        </div>

        {/* View on Map Button */}
        <div className="pt-2">
          <Button
            variant="outline"
            onClick={handleOpenMap}
            className="w-full h-10 rounded-2xl border-slate-200 hover:bg-slate-50 text-blue-600 hover:text-blue-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <MapPin className="size-3.5" />
            <span>View on Map</span>
          </Button>
        </div>
      </div>

      {/* 3. License & Documents Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileBadge className="size-4" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">License & Documents</h3>
          </div>

          <button
            type="button"
            onClick={handleViewLicense}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            <span>View Document</span>
            <ExternalLink className="size-3" />
          </button>
        </div>

        <div className="flex items-start justify-between gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
          <div className="space-y-0.5">
            <p className="text-xs text-slate-500">Medical Council Registration Number</p>
            <p className="text-sm font-bold font-mono text-slate-800">
              {doctor.medicalCouncilRegistrationNumber || 'MCI/12345/2012'}
            </p>
          </div>

          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full shrink-0">
            <CheckCircle2 className="size-3 text-emerald-600" />
            <span>Verified</span>
          </span>
        </div>
      </div>
    </div>
  )
}
