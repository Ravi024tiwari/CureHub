import { useState, type FC } from 'react'
import {
  Building2,
  Calendar,
  Clock,
  IndianRupee,
  Mail,
  Phone,
  FileBadge,
  FileText,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ExternalLink,
  Briefcase,
  AlertCircle,
  Award,
  UserCheck,
  Stethoscope,
  Eye,
} from 'lucide-react'
import type { DoctorVerificationRecord } from '@/types/superAdmin'
import { useDoctorVerificationStore } from '@/store/doctorVerificationStore'
import { DoctorRejectionModal } from './DoctorRejectionModal'
import { DoctorApproveModal } from './DoctorApproveModal'
import { DocumentViewerModal } from './DocumentViewerModal'

interface DoctorVerificationDetailPanelProps {
  doctor: DoctorVerificationRecord | null
  onBack?: () => void
  isMobileView?: boolean
}

type TabKey = 'overview' | 'documents' | 'experience' | 'schedule' | 'leaves'

export const DoctorVerificationDetailPanel: FC<DoctorVerificationDetailPanelProps> = ({
  doctor,
  onBack,
  isMobileView = false,
}) => {
  const { approveDoctor, rejectDoctor, isActionLoading } = useDoctorVerificationStore()
  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false)
  const [viewerModal, setViewerModal] = useState<{
    isOpen: boolean
    title: string
    docType: string
    docUrl?: string
  }>({
    isOpen: false,
    title: '',
    docType: '',
  })

  if (!doctor) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-2xs h-full flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="size-16 rounded-3xl bg-blue-50 text-blue-500 flex items-center justify-center mb-3">
          <ShieldCheck className="size-8 stroke-[1.8]" />
        </div>
        <h3 className="text-base font-black text-slate-800">No Doctor Selected</h3>
        <p className="text-xs text-slate-400 max-w-xs mt-1">
          Select any doctor verification request from the list on the left to inspect their medical credentials, license documents, and experience.
        </p>
      </div>
    )
  }

  const doctorName = doctor.userId?.name
    ? doctor.userId.name.startsWith('Dr.')
      ? doctor.userId.name
      : `Dr. ${doctor.userId.name}`
    : 'Dr. Unknown'

  const qualificationsStr =
    Array.isArray(doctor.qualifications) && doctor.qualifications.length > 0
      ? doctor.qualifications.join(', ')
      : 'MBBS, Specialist'

  const appliedDate = doctor.createdAt
    ? new Date(doctor.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recent'

  const hasHospital = Boolean(doctor.hospitalId?.name)
  const hospitalName = hasHospital ? doctor.hospitalId!.name : 'Independent Practitioner'
  const hospitalLoc = doctor.hospitalId?.address?.city
    ? `${doctor.hospitalId.address.city}, ${doctor.hospitalId.address.state || 'India'}`
    : ''

  const handleApprove = () => {
    setIsApproveModalOpen(true)
  }

  const handleConfirmApprove = async () => {
    await approveDoctor(doctor._id)
    setIsApproveModalOpen(false)
  }

  const handleConfirmReject = async (reason: string) => {
    const success = await rejectDoctor(doctor._id, reason)
    if (success) {
      setIsRejectModalOpen(false)
    }
  }

  const handleRequestInfo = () => {
    alert(
      `Information request sent to ${doctorName} (${doctor.userId?.email || 'email'}). They will receive a notification to update their profile.`
    )
  }

  const openDocument = (title: string, docType: string, url?: string) => {
    setViewerModal({
      isOpen: true,
      title,
      docType,
      docUrl: url || doctor.licenseDocumentUrl,
    })
  }

  // Construct dynamic tabs list
  const tabs: { key: TabKey; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'documents', label: 'Documents & License' },
    { key: 'experience', label: 'Work Experience' },
  ]
  if (doctor.scheduleRules && doctor.scheduleRules.length > 0) {
    tabs.push({ key: 'schedule', label: 'Schedule' })
  }
  if (doctor.leaves && doctor.leaves.length > 0) {
    tabs.push({ key: 'leaves', label: 'Leave History' })
  }

  // Helper for document name
  const getDocumentFilename = (url?: string) => {
    if (!url) return 'medical_license_document.pdf'
    try {
      const parts = url.split('/')
      return decodeURIComponent(parts[parts.length - 1]) || 'medical_license_document.pdf'
    } catch {
      return 'medical_license_document.pdf'
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col h-full overflow-hidden">
      {/* Mobile Back Button - Hidden on large screens where list & details are shown side by side */}
      {isMobileView && onBack && (
        <div className="p-3 border-b border-slate-100 flex items-center justify-between lg:hidden">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-xs font-black text-blue-600 hover:text-blue-700 cursor-pointer"
          >
            ← Back to Requests List
          </button>
          <span className="text-[11px] font-bold text-slate-400">Doctor Verification</span>
        </div>
      )}

      {/* 1. Doctor Header Summary */}
      <div className="p-5 border-b border-slate-100 space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="size-16 rounded-2xl overflow-hidden bg-gradient-to-tr from-blue-100 to-indigo-100 shrink-0 border border-slate-200/80 shadow-xs flex items-center justify-center">
              {doctor.userId?.avatar ? (
                <img
                  src={doctor.userId.avatar}
                  alt={doctorName}
                  className="size-full object-cover"
                />
              ) : (
                <span className="font-black text-xl text-blue-700">
                  {doctorName.replace('Dr. ', '').charAt(0) || 'D'}
                </span>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate">
                  {doctorName}
                </h3>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                    doctor.verificationStatus === 'APPROVED'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : doctor.verificationStatus === 'REJECTED'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {doctor.verificationStatus === 'APPROVED'
                    ? 'Verified'
                    : doctor.verificationStatus === 'REJECTED'
                    ? 'Rejected'
                    : '• Pending Verification'}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-600 mt-0.5 flex items-center gap-1.5 truncate">
                <Stethoscope className="size-3.5 text-blue-600 shrink-0" />
                <span>{doctor.department || 'General Medicine'}</span>
              </p>
              <p className="text-[11px] text-slate-400 font-medium truncate">
                {qualificationsStr}
              </p>
              <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                <Calendar className="size-3 text-slate-400" />
                <span>Applied: {appliedDate}</span>
              </p>
            </div>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex sm:flex-col items-center sm:items-end gap-1.5 shrink-0 self-end sm:self-start">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200/70 shadow-2xs">
              <Clock className="size-3.5 text-blue-600" />
              <span>{doctor.experienceYears || 0}+ Years Experience</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50/70 px-2.5 py-1 rounded-xl border border-emerald-200/70 shadow-2xs">
              <IndianRupee className="size-3.5 text-emerald-600" />
              <span>₹ {doctor.consultationFee || 0} Consultation Fee</span>
            </div>
          </div>
        </div>

        {/* Affiliation Banner */}
        {hasHospital ? (
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="size-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 shrink-0 shadow-2xs">
                <Building2 className="size-4.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Affiliated Hospital
                </span>
                <p className="text-xs font-black text-slate-800 truncate">{hospitalName}</p>
                {hospitalLoc && <p className="text-[10px] text-slate-400 truncate">{hospitalLoc}</p>}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50/40 border border-blue-100 rounded-2xl p-3 flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-blue-100/70 text-blue-700 flex items-center justify-center shrink-0">
              <UserCheck className="size-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">
                Independent Practice (No Hospital Affiliation)
              </p>
              <p className="text-[11px] text-slate-500">
                Doctor registered independently. Hospital affiliation can be requested post-verification.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 2. Navigation Tabs */}
      <div className="px-5 border-b border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Tab Contents Area */}
      <div className="p-5 flex-1 overflow-y-auto space-y-4">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Rejection Notice */}
            {doctor.verificationStatus === 'REJECTED' && doctor.rejectionReason && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800 font-semibold">
                <AlertCircle className="size-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Previous Rejection Reason:</span>
                  <p className="mt-0.5 text-rose-700">{doctor.rejectionReason}</p>
                </div>
              </div>
            )}

            {/* Basic Information Card */}
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-3.5">
              <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                <FileBadge className="size-3.5 text-blue-600" />
                <span>Doctor Contact & Identity Details</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block">Full Name</span>
                  <span className="font-black text-slate-800">{doctorName}</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block">Email Address</span>
                  <div className="flex items-center gap-1 font-bold text-slate-700">
                    <Mail className="size-3 text-slate-400" />
                    <span>{doctor.userId?.email || 'N/A'}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block">Phone Number</span>
                  <div className="flex items-center gap-1 font-bold text-slate-700">
                    <Phone className="size-3 text-slate-400" />
                    <span>{doctor.userId?.phoneNumber || 'N/A'}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block">Medical Registration No.</span>
                  <span className="font-mono font-black text-blue-700">
                    {doctor.medicalCouncilRegistrationNumber || 'Not provided'}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block">Department</span>
                  <span className="font-bold text-slate-800">{doctor.department || 'General Medicine'}</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block">Specializations</span>
                  <div className="flex items-center gap-1 flex-wrap mt-0.5">
                    {Array.isArray(doctor.specialization) && doctor.specialization.length > 0 ? (
                      doctor.specialization.map((spec, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-md text-[10px] font-bold"
                        >
                          {spec}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">None listed</span>
                    )}
                  </div>
                </div>
              </div>

              {doctor.bio && (
                <div className="pt-2.5 border-t border-slate-200/60">
                  <span className="text-[11px] font-bold text-slate-400 block mb-1">Professional Bio</span>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {doctor.bio}
                  </p>
                </div>
              )}
            </div>

            {/* Qualifications Card */}
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-3">
              <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                <Award className="size-3.5 text-purple-600" />
                <span>Degrees & Medical Qualifications</span>
              </h4>

              {Array.isArray(doctor.qualifications) && doctor.qualifications.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {doctor.qualifications.map((q, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-purple-800 text-xs font-bold border border-purple-200/70 shadow-2xs"
                    >
                      <Award className="size-3 text-purple-600" />
                      <span>{q}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No qualifications added.</p>
              )}
            </div>
          </div>
        )}

        {/* DOCUMENTS & LICENSE TAB */}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            {/* Medical Council Certificate Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <ShieldCheck className="size-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Medical Council Registration Proof
                    </h4>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Registration Number: {doctor.medicalCouncilRegistrationNumber || 'N/A'}
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="size-3 text-emerald-600" />
                  <span>Verified Format</span>
                </span>
              </div>

              {doctor.licenseDocumentUrl ? (
                <div className="mt-3 p-4 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                      <FileText className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {getDocumentFilename(doctor.licenseDocumentUrl)}
                      </p>
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 inline-block mt-0.5">
                        Uploaded by Doctor
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        openDocument(
                          'State Medical Council Registration Certificate',
                          'Medical License Certificate',
                          doctor.licenseDocumentUrl
                        )
                      }
                      className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer border border-blue-200/60"
                    >
                      <Eye className="size-3.5" />
                      <span>Inspect Preview</span>
                    </button>

                    <a
                      href={doctor.licenseDocumentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors border border-slate-200"
                      title="Open in new window"
                    >
                      <ExternalLink className="size-4" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-xl border border-dashed border-amber-300 bg-amber-50/50 text-center space-y-1">
                  <AlertCircle className="size-5 text-amber-600 mx-auto" />
                  <p className="text-xs font-bold text-amber-900">
                    License Certificate Not Attached
                  </p>
                  <p className="text-[11px] text-amber-700">
                    The doctor has not uploaded the digital copy of their medical council certificate yet.
                  </p>
                </div>
              )}
            </div>

            {/* Direct Document Preview Embed if available */}
            {doctor.licenseDocumentUrl && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    Direct Certificate Inspection Window
                  </span>
                  <a
                    href={doctor.licenseDocumentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Full Screen</span>
                    <ExternalLink className="size-3" />
                  </a>
                </div>

                <div className="w-full h-80 rounded-xl overflow-hidden border border-slate-200 bg-white shadow-inner flex items-center justify-center">
                  {doctor.licenseDocumentUrl.match(/\.(jpg|jpeg|png|webp)($|\?)/i) ? (
                    <img
                      src={doctor.licenseDocumentUrl}
                      alt="Doctor License Certificate"
                      className="size-full object-contain"
                    />
                  ) : (
                    <iframe
                      src={doctor.licenseDocumentUrl}
                      title="Doctor License Document Preview"
                      className="size-full border-none"
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* EXPERIENCE TAB */}
        {activeTab === 'experience' && (
          <div className="space-y-3">
            {Array.isArray(doctor.experiences) && doctor.experiences.length > 0 ? (
              <div className="space-y-3">
                {doctor.experiences.map((exp, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Briefcase className="size-3.5 text-blue-600" />
                        <span>{exp.title}</span>
                      </h4>
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold">
                        {exp.institution}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3 text-slate-400" />
                        {exp.period}
                      </span>
                      {exp.duration && <span>• {exp.duration}</span>}
                    </div>

                    {exp.description && (
                      <p className="text-xs text-slate-600 font-medium leading-relaxed pt-1 border-t border-slate-200/60">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                Doctor has not registered any past employment records.
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Action Footer Bar */}
      <div className="p-4 bg-white border-t border-slate-200/80 flex items-center justify-between gap-3 shrink-0">
        <button
          type="button"
          disabled={isActionLoading}
          onClick={() => setIsRejectModalOpen(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-bold border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <XCircle className="size-4" />
          <span>Reject Application</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isActionLoading}
            onClick={handleRequestInfo}
            className="px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <HelpCircle className="size-4 text-slate-400" />
            <span className="hidden sm:inline">Request Info</span>
          </button>

          <button
            type="button"
            disabled={isActionLoading || doctor.verificationStatus === 'APPROVED'}
            onClick={handleApprove}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50 ${
              doctor.verificationStatus === 'APPROVED'
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25'
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25'
            }`}
          >
            <CheckCircle2 className="size-4 stroke-[2.5]" />
            <span>
              {doctor.verificationStatus === 'APPROVED' ? 'Approved & Verified' : 'Approve & Verify'}
            </span>
          </button>
        </div>
      </div>

      {/* Approval Confirmation Modal */}
      <DoctorApproveModal
        isOpen={isApproveModalOpen}
        doctorName={doctorName}
        department={doctor.department}
        registrationNumber={doctor.medicalCouncilRegistrationNumber}
        hospitalName={doctor.hospitalId?.name}
        hasHospital={hasHospital}
        isLoading={isActionLoading}
        onClose={() => setIsApproveModalOpen(false)}
        onConfirm={handleConfirmApprove}
      />

      {/* Rejection Reason Modal */}
      <DoctorRejectionModal
        isOpen={isRejectModalOpen}
        doctorName={doctorName}
        isLoading={isActionLoading}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={handleConfirmReject}
      />

      {/* Document Viewer Modal */}
      <DocumentViewerModal
        isOpen={viewerModal.isOpen}
        title={viewerModal.title}
        docType={viewerModal.docType}
        docUrl={viewerModal.docUrl}
        doctorName={doctorName}
        councilNumber={doctor.medicalCouncilRegistrationNumber}
        onClose={() => setViewerModal({ isOpen: false, title: '', docType: '' })}
      />
    </div>
  )
}

export default DoctorVerificationDetailPanel
