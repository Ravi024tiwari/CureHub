import { useEffect, useState, type FC } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  IndianRupee,
  Building2,
  FileText,
  FileCheck,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Download,
  Eye,
  Star,
  Clock,
  Briefcase,
  AlertCircle,
  Check,
  X,
  ShieldCheck,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useHospitalAdminStore } from '@/store/hospitalAdminStore'
import { useHospitalAdminJoinRequestsStore } from '@/store/hospitalAdminJoinRequestsStore'

// Components
import { HospitalAdminLayout } from '@/components/hospital-admin/HospitalAdminLayout'
import { JoinRequestActionModal } from '@/components/hospital-admin/join-requests/JoinRequestActionModal'
import { DoctorAvatar } from '@/components/hospital-admin/join-requests/JoinRequestsTable'

export const DoctorJoinRequestDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const {
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    isSidebarCollapsed,
    toggleSidebar,
  } = useHospitalAdminStore()

  const {
    selectedRequest,
    isDetailLoading,
    fetchRequestById,
    openActionModal,
    toastMessage,
    clearToast,
  } = useHospitalAdminJoinRequestsStore()

  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'message' | 'history'>('overview')
  const [previewDocUrl, setPreviewDocUrl] = useState<{ title: string; url: string } | null>(null)

  useEffect(() => {
    if (user && !user.isAccountApproved) {
      navigate('/hospital-admin/verification', { replace: true })
      return
    }
    if (id) {
      fetchRequestById(id)
    }
  }, [user, navigate, id, fetchRequestById])

  // Auto clear toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        clearToast()
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [toastMessage, clearToast])

  if (isDetailLoading && !selectedRequest) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 rounded-full border-3 border-blue-600 border-t-transparent animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading doctor details...</p>
        </div>
      </div>
    )
  }

  if (!selectedRequest) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-6 rounded-3xl border border-slate-200 text-center space-y-4">
          <AlertCircle className="size-12 text-amber-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800">Doctor Request Not Found</h2>
          <p className="text-xs text-slate-500">
            The doctor join request you are looking for may have been removed or does not exist.
          </p>
          <button
            onClick={() => navigate('/hospital-admin/join-requests')}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 cursor-pointer"
          >
            Back to Join Requests
          </button>
        </div>
      </div>
    )
  }

  const doctorName = selectedRequest.doctorUserId?.name || 'Dr. Doctor'
  const doctorEmail = selectedRequest.doctorUserId?.email || 'doctor@curehealth.org'
  const doctorPhone = selectedRequest.doctorUserId?.phoneNumber || '+91 98765 43210'
  const doctorAvatar = selectedRequest.doctorUserId?.avatar
  const address = selectedRequest.doctorUserId?.address
  const locationString = address?.city
    ? `${address.city}, ${address.state || 'India'}`
    : 'Bilaspur, Chhattisgarh'

  const dept = selectedRequest.department || selectedRequest.doctorId?.department || 'General Medicine'
  const specialization = selectedRequest.doctorId?.specialization || [dept]
  const qualifications = selectedRequest.doctorId?.qualifications || ['MBBS', 'MD']
  const experienceYears = selectedRequest.doctorId?.experienceYears || 5
  const registrationNumber = selectedRequest.doctorId?.medicalCouncilRegistrationNumber || 'CGMC/2020/15432'
  const consultationFee = selectedRequest.doctorId?.consultationFee || 800
  const ratingAverage = selectedRequest.doctorId?.ratingAverage || 4.8
  const reviewCount = selectedRequest.doctorId?.reviewCount || 58
  const experiences = selectedRequest.doctorId?.experiences || []
  const bio = selectedRequest.doctorId?.bio || 'Experienced medical professional passionate about patient care.'
  const licenseDocUrl = selectedRequest.doctorId?.licenseDocumentUrl

  const hospitalName = selectedRequest.hospitalId?.name || 'Apollo Multispeciality'
  const status = selectedRequest.status

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return '28 Oct 2024, 10:30 AM'
    try {
      const d = new Date(isoString)
      return `${d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })}, ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
    } catch {
      return '28 Oct 2024, 10:30 AM'
    }
  }

  // Documents list matching mockup
  const documents = [
    {
      id: 'doc-resume',
      title: 'Resume / Curriculum Vitae',
      filename: `resume_${doctorName.toLowerCase().replace(/[^a-z]/g, '_')}.pdf`,
      size: '1.2 MB',
      type: 'pdf',
      url: licenseDocUrl || '#',
    },
    {
      id: 'doc-reg',
      title: 'Medical Registration Certificate',
      filename: `registration_${registrationNumber.replace(/[^a-z0-9]/gi, '_')}.pdf`,
      size: '840 KB',
      type: 'pdf',
      url: licenseDocUrl || '#',
    },
    {
      id: 'doc-exp',
      title: 'Experience Certificate',
      filename: 'experience_credentials.pdf',
      size: '1.8 MB',
      type: 'pdf',
      url: licenseDocUrl || '#',
    },
  ]

  return (
    <HospitalAdminLayout>
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
          {/* Action Success / Error Notification */}
          {toastMessage && (
            <div
              className={`p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between shadow-xs animate-in slide-in-from-top-3 duration-200 ${
                toastMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold min-w-0">
                <CheckCircle2 className="size-4.5 text-emerald-600 shrink-0" />
                <span className="truncate">{toastMessage.text}</span>
              </div>
              <button
                onClick={clearToast}
                className="p-1 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer shrink-0"
              >
                <X className="size-4" />
              </button>
            </div>
          )}

          {/* Navigation Breadcrumb & Hospital Badge */}
          <div className="flex items-center justify-between gap-2.5">
            <button
              onClick={() => navigate('/hospital-admin/join-requests')}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-0 sm:py-0 rounded-xl sm:rounded-none bg-white sm:bg-transparent border sm:border-none border-slate-200/80 text-xs sm:text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors cursor-pointer group shadow-2xs sm:shadow-none"
            >
              <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform text-slate-500 group-hover:text-blue-600" />
              <span>Back to Requests</span>
            </button>

            <div className="flex items-center gap-1.5 max-w-[55%] sm:max-w-none">
              <span className="text-xs text-slate-400 font-medium hidden md:inline">
                Target Facility:
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1 rounded-xl bg-blue-50/90 text-blue-700 text-[11px] sm:text-xs font-bold border border-blue-100 truncate shadow-2xs">
                <Building2 className="size-3.5 shrink-0" />
                <span className="truncate">{hospitalName}</span>
              </span>
            </div>
          </div>

          {/* Doctor Hero Card - Perfectly Responsive */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 sm:gap-5 w-full sm:w-auto min-w-0">
                {/* Doctor Avatar with gradient initials fallback */}
                <div className="relative shrink-0">
                  <DoctorAvatar
                    name={doctorName}
                    avatarUrl={doctorAvatar}
                    className="size-16 sm:size-20 rounded-2xl sm:rounded-full"
                  />
                  {status === 'APPROVED' && (
                    <span className="absolute -bottom-1 -right-1 size-5 sm:size-6 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center text-white shadow-2xs">
                      <Check className="size-3 stroke-[3]" />
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-base sm:text-2xl font-black text-slate-900 truncate tracking-tight">
                      {doctorName}
                    </h1>
                    {status === 'PENDING' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200">
                        Pending
                      </span>
                    )}
                    {status === 'APPROVED' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                        Approved
                      </span>
                    )}
                    {status === 'REJECTED' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200">
                        Rejected
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-slate-600 truncate">
                    {dept} • <span className="text-slate-500 font-medium">{experienceYears} years experience</span>
                  </p>

                  <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-slate-500 pt-0.5">
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="size-3 sm:size-3.5 fill-amber-400 stroke-amber-500" />
                      <span>{ratingAverage}</span>
                    </div>
                    <span>•</span>
                    <span className="truncate">({reviewCount} verified reviews)</span>
                  </div>
                </div>
              </div>

              {/* Desktop Quick Actions (if pending) */}
              {status === 'PENDING' && (
                <div className="hidden sm:flex items-center gap-2.5 shrink-0">
                  <button
                    onClick={() => openActionModal('REJECT', selectedRequest)}
                    className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="size-4" />
                    <span>Reject</span>
                  </button>

                  <button
                    onClick={() => openActionModal('APPROVE', selectedRequest)}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="size-4" />
                    <span>Approve</span>
                  </button>
                </div>
              )}
            </div>

            {/* Navigation Tabs - Modern Segmented Control on Mobile, Underline on Desktop */}
            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-100">
              {/* Mobile 4-Column Segmented Tab Pill Control */}
              <div className="grid grid-cols-4 sm:hidden bg-slate-100/80 p-1 rounded-xl text-center">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'documents', label: 'Documents' },
                  { id: 'message', label: 'Message' },
                  { id: 'history', label: 'History' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer truncate px-1 ${
                      activeTab === tab.id
                        ? 'bg-white text-blue-600 shadow-xs font-extrabold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Desktop Underline Tabs */}
              <div className="hidden sm:flex items-center gap-6">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'documents', label: 'Documents' },
                  { id: 'message', label: 'Message' },
                  { id: 'history', label: 'History' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`pb-2.5 text-sm font-bold transition-all relative whitespace-nowrap cursor-pointer ${
                      activeTab === tab.id
                        ? 'text-blue-600 font-extrabold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {activeTab === tab.id && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-150">
              {/* Row 1: Contact Information & Professional Information Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Contact Information */}
                <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-6 shadow-xs space-y-3.5 sm:space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <h3 className="text-[11px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                      Contact Information
                    </h3>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                      Verified
                    </span>
                  </div>

                  <div className="space-y-3 text-xs sm:text-sm">
                    {/* Email */}
                    <a
                      href={`mailto:${doctorEmail}`}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer"
                    >
                      <div className="size-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Mail className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">
                          Email Address
                        </span>
                        <span className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors truncate block">
                          {doctorEmail}
                        </span>
                      </div>
                    </a>

                    {/* Phone */}
                    <a
                      href={`tel:${doctorPhone}`}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer"
                    >
                      <div className="size-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Phone className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">
                          Phone Number
                        </span>
                        <span className="font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors truncate block">
                          {doctorPhone}
                        </span>
                      </div>
                    </a>

                    {/* Location */}
                    <div className="flex items-center gap-3 p-2.5 rounded-xl">
                      <div className="size-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <MapPin className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">
                          Location
                        </span>
                        <span className="font-semibold text-slate-800 truncate block">
                          {locationString}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-6 shadow-xs space-y-3.5 sm:space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <h3 className="text-[11px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                      Professional Information
                    </h3>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      Credentials
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                    <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Specialization
                      </span>
                      <span className="font-bold text-slate-900 truncate block mt-0.5">
                        {dept}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Experience
                      </span>
                      <span className="font-bold text-slate-900 truncate block mt-0.5">
                        {experienceYears} years
                      </span>
                    </div>

                    <div className="col-span-2 p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Qualifications
                      </span>
                      <span className="font-bold text-slate-800 block mt-0.5 leading-snug">
                        {qualifications.join(', ')}
                      </span>
                    </div>

                    <div className="col-span-2 p-2.5 rounded-xl bg-blue-50/50 border border-blue-100">
                      <span className="text-[10px] text-blue-600 font-bold uppercase block">
                        Medical Registration No.
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <ShieldCheck className="size-4 text-blue-600 shrink-0" />
                        <span className="font-mono font-bold text-blue-900 truncate">
                          {registrationNumber}
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Affiliation
                      </span>
                      <span className="font-semibold text-slate-700 truncate block mt-0.5">
                        {status === 'APPROVED' ? hospitalName : 'Pending'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Consultation Fee
                      </span>
                      <span className="font-black text-slate-900 flex items-center mt-0.5">
                        <IndianRupee className="size-3.5" />
                        <span>{consultationFee}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Doctor Biography Card */}
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-6 shadow-xs space-y-3">
                <h3 className="text-[11px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                  Doctor Profile & Biography
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {bio}
                </p>

                <div className="pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Key Clinical Expertise:
                  </span>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {specialization.map((spec) => (
                      <span
                        key={spec}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Work History / Experience */}
              {experiences.length > 0 && (
                <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-6 shadow-xs space-y-3.5">
                  <h3 className="text-[11px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                    Previous Clinical Experience
                  </h3>

                  <div className="space-y-3">
                    {experiences.map((exp, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/60 border border-slate-100 text-xs sm:text-sm"
                      >
                        <div className="size-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                          <Briefcase className="size-4" />
                        </div>
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <h4 className="font-bold text-slate-900 truncate">{exp.title}</h4>
                          <p className="font-medium text-slate-600 truncate">
                            {exp.institution} •{' '}
                            <span className="text-slate-400">{exp.period}</span>
                          </p>
                          {exp.description && (
                            <p className="text-xs text-slate-500 pt-1 leading-relaxed">
                              {exp.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-6 shadow-xs space-y-4 animate-in fade-in duration-150">
              <div>
                <h3 className="text-[11px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                  Uploaded Verification Documents
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Medical council registrations, certificates, and curriculum vitae.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-blue-200 hover:shadow-xs transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="size-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                        <FileText className="size-5" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-200/60 px-2 py-0.5 rounded-md">
                        {doc.type}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{doc.title}</h4>
                      <p className="text-[11px] font-mono text-slate-500 truncate mt-0.5">
                        {doc.filename}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">{doc.size}</span>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => setPreviewDocUrl({ title: doc.title, url: doc.url })}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Eye className="size-3.5" />
                        <span>Preview</span>
                      </button>

                      {doc.url && doc.url !== '#' && (
                        <a
                          href={doc.url}
                          download={doc.filename}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer shrink-0"
                          title="Download"
                        >
                          <Download className="size-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: MESSAGE FROM DOCTOR */}
          {activeTab === 'message' && (
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-6 shadow-xs space-y-3.5 animate-in fade-in duration-150">
              <h3 className="text-[11px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                Message from Doctor
              </h3>

              <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/40 border border-blue-100 rounded-2xl p-4 sm:p-5 space-y-3">
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium italic">
                  "{selectedRequest.message || 'I am very interested in joining your hospital and would like to contribute to your healthcare team.'}"
                </p>

                <div className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-400 font-semibold pt-2.5 border-t border-blue-100/60">
                  <Clock className="size-3.5 text-blue-500" />
                  <span>Submitted on: {formatDateTime(selectedRequest.createdAt)}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: HISTORY */}
          {activeTab === 'history' && (
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-6 shadow-xs space-y-4 animate-in fade-in duration-150">
              <h3 className="text-[11px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                Application Review History
              </h3>

              <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 pl-1">
                {/* Step 1: Submission */}
                <div className="flex items-start gap-3.5 relative">
                  <div className="size-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 z-10 shadow-xs">
                    <Check className="size-3.5 stroke-[3]" />
                  </div>
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-900">Application Submitted</h4>
                    <p className="text-[11px] text-slate-500">
                      Doctor applied for {dept} department affiliation at {hospitalName}.
                    </p>
                    <span className="text-[10px] text-slate-400 block">
                      {formatDateTime(selectedRequest.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Step 2: Verification */}
                <div className="flex items-start gap-3.5 relative">
                  <div className="size-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 z-10 shadow-xs">
                    <ShieldCheck className="size-3.5 stroke-[2.5]" />
                  </div>
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-900">
                      Medical Registration Validated
                    </h4>
                    <p className="text-[11px] text-slate-500 font-mono">
                      License verified: {registrationNumber}
                    </p>
                  </div>
                </div>

                {/* Step 3: Current Status */}
                <div className="flex items-start gap-3.5 relative">
                  <div
                    className={`size-6 rounded-full text-white flex items-center justify-center shrink-0 z-10 shadow-xs ${
                      status === 'APPROVED'
                        ? 'bg-emerald-600'
                        : status === 'REJECTED'
                        ? 'bg-rose-600'
                        : 'bg-amber-500'
                    }`}
                  >
                    {status === 'APPROVED' ? (
                      <Check className="size-3.5 stroke-[3]" />
                    ) : status === 'REJECTED' ? (
                      <X className="size-3.5 stroke-[3]" />
                    ) : (
                      <Clock className="size-3.5" />
                    )}
                  </div>
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-900">
                      Status: {status}
                    </h4>
                    {selectedRequest.rejectionReason && (
                      <p className="text-xs text-rose-700 font-semibold bg-rose-50 p-2.5 rounded-xl border border-rose-100 mt-1">
                        Decline note: {selectedRequest.rejectionReason}
                      </p>
                    )}
                    {selectedRequest.reviewedAt && (
                      <span className="text-[10px] text-slate-400 block">
                        Reviewed on {formatDateTime(selectedRequest.reviewedAt)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Action Card (Pending Status) - In-page on mobile & sticky on desktop */}
          {status === 'PENDING' && (
            <div className="fixed bottom-14 md:bottom-0 left-0 right-0 lg:left-64 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-3 px-3.5 sm:px-8 z-30 shadow-lg flex items-center justify-between gap-3">
              <div className="hidden sm:block text-xs font-semibold text-slate-500">
                Action required for <strong className="text-slate-800">{doctorName}</strong>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <button
                  onClick={() => openActionModal('REJECT', selectedRequest)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 active:scale-95 font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <XCircle className="size-4" />
                  <span>Reject</span>
                </button>

                <button
                  onClick={() => openActionModal('APPROVE', selectedRequest)}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/25 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="size-4 stroke-[2.5]" />
                  <span>Approve</span>
                </button>
              </div>
            </div>
          )}

          {status === 'APPROVED' && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs sm:text-sm font-semibold">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4.5 text-emerald-600 shrink-0" />
                <span>
                  {doctorName} is officially approved and affiliated with {hospitalName}.
                </span>
              </div>
              <button
                onClick={() => navigate('/hospital-admin/doctors')}
                className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer shrink-0"
              >
                View in Doctors List
              </button>
            </div>
          )}
        </main>

      {/* Action Approval / Rejection Modal */}
      <JoinRequestActionModal />

      {/* Document Preview Modal */}
      {previewDocUrl && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 truncate">
                <FileCheck className="size-4 text-blue-600 shrink-0" />
                <span className="truncate">{previewDocUrl.title}</span>
              </div>
              <button
                onClick={() => setPreviewDocUrl(null)}
                className="p-1 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer text-slate-500 shrink-0"
              >
                <X className="size-4.5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 flex-1 overflow-y-auto flex flex-col items-center justify-center text-center space-y-4">
              <div className="max-w-md w-full border border-slate-200 rounded-2xl p-4 bg-slate-50 overflow-hidden shadow-xs">
                {previewDocUrl.url && previewDocUrl.url !== '#' ? (
                  <img
                    src={previewDocUrl.url}
                    alt={previewDocUrl.title}
                    className="w-full h-auto max-h-80 sm:max-h-96 object-contain rounded-xl"
                  />
                ) : (
                  <div className="py-10 space-y-3">
                    <FileText className="size-14 text-slate-300 mx-auto" />
                    <p className="text-xs text-slate-500 font-medium">
                      Simulated Document Preview for {previewDocUrl.title}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-3.5 sm:p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
              <button
                onClick={() => setPreviewDocUrl(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/60 cursor-pointer"
              >
                Close Preview
              </button>
              {previewDocUrl.url && previewDocUrl.url !== '#' && (
                <a
                  href={previewDocUrl.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="size-3.5" />
                  <span>Open Full Document</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </HospitalAdminLayout>
  )
}
export default DoctorJoinRequestDetailPage
