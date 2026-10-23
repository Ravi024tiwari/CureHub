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
} from 'lucide-react'
import type { DoctorVerificationRecord } from '@/types/superAdmin'
import { useDoctorVerificationStore } from '@/store/doctorVerificationStore'
import { DoctorRejectionModal } from './DoctorRejectionModal'
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
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-2xs h-full flex flex-col items-center justify-center text-center">
        <div className="size-16 rounded-3xl bg-blue-50 text-blue-500 flex items-center justify-center mb-3">
          <ShieldCheck className="size-8 stroke-[1.8]" />
        </div>
        <h3 className="text-base font-black text-slate-800">No Doctor Selected</h3>
        <p className="text-xs text-slate-400 max-w-xs mt-1">
          Select any doctor verification request from the list on the left to inspect their medical credentials and documents.
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
    : 'Oct 22, 2026'

  const hospitalName = doctor.hospitalId?.name || 'Unaffiliated / General OPD'
  const hospitalLoc = doctor.hospitalId?.address?.city
    ? `${doctor.hospitalId.address.city}, ${doctor.hospitalId.address.state || 'India'}`
    : 'Hospital Location'

  const handleApprove = async () => {
    if (confirm(`Are you sure you want to approve and verify ${doctorName}?`)) {
      await approveDoctor(doctor._id)
    }
  }

  const handleConfirmReject = async (reason: string) => {
    const success = await rejectDoctor(doctor._id, reason)
    if (success) {
      setIsRejectModalOpen(false)
    }
  }

  const handleRequestInfo = () => {
    alert(
      `Information request sent to ${doctorName} at ${doctor.userId?.email || 'email'}. They will receive a notification to update their profile.`
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

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'documents', label: 'Documents' },
    { key: 'experience', label: 'Experience' },
    { key: 'schedule', label: 'Schedule' },
    { key: 'leaves', label: 'Leave History' },
  ]

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col h-full overflow-hidden">
      {/* Mobile Back Button */}
      {isMobileView && onBack && (
        <div className="p-3 border-b border-slate-100 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-xs font-black text-blue-600 hover:text-blue-700 cursor-pointer"
          >
            ← Back to Requests List
          </button>
          <span className="text-[11px] font-bold text-slate-400">Doctor Verification</span>
        </div>
      )}

      {/* 1. Doctor Header Summary matching mockup */}
      <div className="p-4 sm:p-5 border-b border-slate-100 space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="size-14 sm:size-16 rounded-2xl overflow-hidden bg-gradient-to-tr from-blue-100 to-indigo-100 shrink-0 border border-slate-200/80 shadow-xs flex items-center justify-center">
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

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
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
                    : '+ Pending Verification'}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-600 mt-0.5">
                {doctor.department || 'Specialist'}
              </p>
              <p className="text-[11px] text-slate-400 font-medium">
                {qualificationsStr}
              </p>
            </div>
          </div>

          <div className="hidden sm:flex flex-col items-end gap-1.5 shrink-0">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-700 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200/60 shadow-2xs">
              <Clock className="size-3.5 text-blue-600" />
              <span>{doctor.experienceYears || 10}+ Years Experience</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-black text-slate-900 bg-emerald-50/70 text-emerald-800 px-2.5 py-1 rounded-xl border border-emerald-200/60 shadow-2xs">
              <IndianRupee className="size-3.5 text-emerald-600" />
              <span>{doctor.consultationFee || 800} Consultation Fee</span>
            </div>
          </div>
        </div>

        {/* Applied to Join Hospital Card */}
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="size-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 shrink-0 shadow-2xs">
              <Building2 className="size-4.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Applied to Join
              </span>
              <p className="text-xs font-black text-slate-800 truncate">
                {hospitalName}
              </p>
              <p className="text-[10px] text-slate-400 truncate">{hospitalLoc}</p>
            </div>
          </div>

          <button
            onClick={() => alert(`Navigating to Hospital Details: ${hospitalName}`)}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <span>View Hospital</span>
            <ExternalLink className="size-3" />
          </button>
        </div>

        {/* 2. Interactive Navigation Tabs matching mockup */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-100 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* 3. Tab Contents Area */}
      <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Rejection Notice if rejected */}
            {doctor.verificationStatus === 'REJECTED' && doctor.rejectionReason && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800 font-semibold">
                <AlertCircle className="size-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Rejection Reason:</span>
                  <p className="mt-0.5 text-rose-700">{doctor.rejectionReason}</p>
                </div>
              </div>
            )}

            {/* Basic Information Section */}
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <FileBadge className="size-3.5 text-blue-600" />
                <span>Basic Information</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block">Full Name</span>
                  <span className="font-black text-slate-800">{doctorName}</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block">Email</span>
                  <div className="flex items-center gap-1 font-bold text-slate-700">
                    <Mail className="size-3 text-slate-400" />
                    <span>{doctor.userId?.email || 'doctor@careplus.org'}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block">Phone</span>
                  <div className="flex items-center gap-1 font-bold text-slate-700">
                    <Phone className="size-3 text-slate-400" />
                    <span>{doctor.userId?.phoneNumber || '+91 98765 43210'}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block">Registration No.</span>
                  <span className="font-mono font-black text-blue-700">
                    {doctor.medicalCouncilRegistrationNumber || 'MCI/12345/2016'}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block">Department</span>
                  <span className="font-bold text-slate-800">{doctor.department}</span>
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
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-md text-[10px] font-bold">
                        General Consultation
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {doctor.bio && (
                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-[11px] font-bold text-slate-400 block mb-1">Bio</span>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {doctor.bio}
                  </p>
                </div>
              )}
            </div>

            {/* License & Verification Section matching mockup */}
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-blue-600" />
                <span>License & Verification</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Registration Document */}
                <div className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Registration Document
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-800 text-xs">
                      {doctor.medicalCouncilRegistrationNumber || 'MCI/12345/2016'}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold flex items-center gap-1">
                      <CheckCircle2 className="size-3 text-emerald-600" />
                      <span>Valid</span>
                    </span>
                  </div>
                </div>

                {/* License Document with View Button */}
                <div className="bg-white p-3 rounded-xl border border-slate-200/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="size-8 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
                      <FileText className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        medical_license.pdf
                      </p>
                      <p className="text-[10px] text-slate-400">2.4 MB • PDF</p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      openDocument('Medical Council License Document', 'Medical License PDF')
                    }
                    className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-blue-600 font-bold text-xs rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    View
                  </button>
                </div>

                {/* Status & Applied On */}
                <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">
                    Verification Status
                  </span>
                  <span
                    className={`font-black text-xs inline-block mt-0.5 ${
                      doctor.verificationStatus === 'APPROVED'
                        ? 'text-emerald-600'
                        : doctor.verificationStatus === 'REJECTED'
                        ? 'text-rose-600'
                        : 'text-amber-600'
                    }`}
                  >
                    {doctor.verificationStatus}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">
                    Applied On
                  </span>
                  <span className="font-bold text-xs text-slate-800 inline-block mt-0.5">
                    {appliedDate}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DOCUMENTS TAB matching mockup */}
        {activeTab === 'documents' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500 font-medium">
              Official legal documents and credentials submitted during doctor registration.
            </p>

            <div className="space-y-2.5">
              {[
                {
                  id: 'license',
                  title: 'Medical Council License Certificate',
                  filename: 'medical_license.pdf',
                  size: '2.4 MB',
                  type: 'State Medical Council Board Certificate',
                  status: 'Valid',
                },
                {
                  id: 'reg_cert',
                  title: 'Registration Certificate (NMC / MCI)',
                  filename: 'mci_certificate.pdf',
                  size: '1.8 MB',
                  type: 'National Medical Commission Registration',
                  status: 'Valid',
                },
                {
                  id: 'degree',
                  title: 'Specialist Degree & PG Qualification Certificate',
                  filename: 'pg_cardiology_degree.pdf',
                  size: '3.1 MB',
                  type: 'Doctor of Medicine (MD) Diploma',
                  status: 'Verified',
                },
                {
                  id: 'id_proof',
                  title: 'Government Identity Proof',
                  filename: 'doctor_id_aadhaar.pdf',
                  size: '1.1 MB',
                  type: 'National Identity Credential',
                  status: 'Active',
                },
              ].map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white p-3.5 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 shadow-2xs hover:border-slate-300 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
                      <FileText className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h5 className="text-xs font-black text-slate-800 truncate">
                          {doc.title}
                        </h5>
                        <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[9px] font-black">
                          {doc.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                        {doc.filename} • {doc.size} • {doc.type}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => openDocument(doc.title, doc.type)}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-bold text-xs rounded-xl transition-colors cursor-pointer shrink-0"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EXPERIENCE TAB */}
        {activeTab === 'experience' && (
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <Briefcase className="size-3.5 text-blue-600" />
              <span>Professional Clinical Experience ({doctor.experienceYears || 10}+ Years)</span>
            </h4>

            {Array.isArray(doctor.experiences) && doctor.experiences.length > 0 ? (
              <div className="space-y-2.5">
                {doctor.experiences.map((exp, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-black text-slate-900">{exp.title}</h5>
                      <span className="text-[11px] font-bold text-blue-600">{exp.period}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-700">{exp.institution}</p>
                    {exp.description && (
                      <p className="text-xs text-slate-500 font-medium">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-black text-slate-900">Senior Consultant</h5>
                    <span className="text-[11px] font-bold text-blue-600">2019 - Present</span>
                  </div>
                  <p className="text-xs font-bold text-slate-700">{hospitalName}</p>
                  <p className="text-xs text-slate-500 font-medium">
                    Leading diagnostic OPD consultations, specialized patient care, and clinical operations.
                  </p>
                </div>
                <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-black text-slate-900">Associate Specialist</h5>
                    <span className="text-[11px] font-bold text-slate-500">2014 - 2019</span>
                  </div>
                  <p className="text-xs font-bold text-slate-700">Metro Healthcare Institute</p>
                  <p className="text-xs text-slate-500 font-medium">
                    Supervised resident doctors, emergency medical interventions, and in-patient rounds.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SCHEDULE TAB */}
        {activeTab === 'schedule' && (
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <Calendar className="size-3.5 text-blue-600" />
              <span>Weekly OPD Consultation Schedule</span>
            </h4>

            {Array.isArray(doctor.scheduleRules) && doctor.scheduleRules.length > 0 ? (
              <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[11px]">
                    <tr>
                      <th className="p-2.5">Day</th>
                      <th className="p-2.5">Timings</th>
                      <th className="p-2.5">Slot Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {doctor.scheduleRules.map((rule, idx) => {
                      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                      return (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-2.5 font-black text-slate-900">
                            {days[rule.dayOfWeek] || 'Everyday'}
                          </td>
                          <td className="p-2.5 font-mono">
                            {rule.startTime} - {rule.endTime}
                          </td>
                          <td className="p-2.5">{rule.slotDurationMinutes} mins</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 text-center space-y-1">
                <p className="text-xs font-bold text-slate-700">Regular OPD Routine</p>
                <p className="text-xs text-slate-500">
                  Monday to Saturday • 09:00 AM - 05:00 PM • 30 mins slot duration
                </p>
              </div>
            )}
          </div>
        )}

        {/* LEAVES TAB */}
        {activeTab === 'leaves' && (
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <Calendar className="size-3.5 text-blue-600" />
              <span>Doctor Leave History & Availability</span>
            </h4>

            {Array.isArray(doctor.leaves) && doctor.leaves.length > 0 ? (
              <div className="space-y-2">
                {doctor.leaves.map((leave, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800">{leave.date}</span>
                      <p className="text-[11px] text-slate-400">
                        {leave.reason || 'Personal Leave'}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                      Planned Leave
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200/80 text-center">
                <p className="text-xs font-bold text-slate-600">No leaves registered</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  The doctor is currently available for full consultations.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Action Footer matching mockup */}
      <div className="p-3.5 sm:p-4 bg-white border-t border-slate-100 flex items-center justify-between gap-2 shrink-0">
        <button
          type="button"
          disabled={isActionLoading}
          onClick={() => setIsRejectModalOpen(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <XCircle className="size-3.5" />
          <span>Reject</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isActionLoading}
            onClick={handleRequestInfo}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-blue-200 text-blue-700 hover:bg-blue-50 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <HelpCircle className="size-3.5" />
            <span className="hidden sm:inline">Request More Info</span>
            <span className="sm:hidden">Info</span>
          </button>

          <button
            type="button"
            disabled={isActionLoading || doctor.verificationStatus === 'APPROVED'}
            onClick={handleApprove}
            className={`px-5 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
              doctor.verificationStatus === 'APPROVED'
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25'
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25'
            }`}
          >
            <CheckCircle2 className="size-3.5 stroke-[2.5]" />
            <span>
              {doctor.verificationStatus === 'APPROVED' ? 'Approved' : 'Approve'}
            </span>
          </button>
        </div>
      </div>

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
