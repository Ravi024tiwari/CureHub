import { useState, type FC } from 'react'
import {
  Building2,
  Calendar,
  Mail,
  Phone,
  FileText,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Briefcase,
  AlertCircle,
  Award,
  IdCard,
  FileCheck2,
  Eye,
  ArrowLeft,
  BedDouble,
  MapPin,
  Clock,
  User,
} from 'lucide-react'
import type { HospitalAdminVerificationRecord } from '@/types/superAdmin'
import { useHospitalAdminVerificationStore } from '@/store/hospitalAdminVerificationStore'
import { RejectAdminVerificationModal } from './RejectAdminVerificationModal'
import { ApproveAdminVerificationModal } from './ApproveAdminVerificationModal'
import { DocumentViewerModal } from './DocumentViewerModal'

interface HospitalAdminVerificationDetailPanelProps {
  admin: HospitalAdminVerificationRecord | null
  onBack?: () => void
  isMobileView?: boolean
}

type TabKey = 'overview' | 'documents'

export const HospitalAdminVerificationDetailPanel: FC<
  HospitalAdminVerificationDetailPanelProps
> = ({ admin, onBack, isMobileView = false }) => {
  const { approveAdmin, rejectAdmin, isActionLoading } =
    useHospitalAdminVerificationStore()

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

  if (!admin) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-2xs h-full flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="size-16 rounded-3xl bg-blue-50 text-blue-500 flex items-center justify-center mb-3">
          <ShieldCheck className="size-8 stroke-[1.8]" />
        </div>
        <h3 className="text-base font-black text-slate-800">
          No Hospital Administrator Selected
        </h3>
        <p className="text-xs text-slate-400 max-w-xs mt-1">
          Select any administrator verification application from the left list to review their identity proofs, authorization letters, and hospital credentials.
        </p>
      </div>
    )
  }

  const adminName = admin.userId?.name || 'Administrator'
  const designation = admin.designation || 'Hospital Administrator'
  const email = admin.userId?.email || 'N/A'
  const phone = admin.userId?.phoneNumber || 'N/A'

  const hasHospital = Boolean(admin.hospitalName || admin.hospitalId?.name)
  const hospitalName =
    admin.hospitalName || admin.hospitalId?.name || 'Affiliation Pending'

  const submittedDate = admin.submittedAt || admin.createdAt
  const formattedSubmittedDate = submittedDate
    ? new Date(submittedDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Recent'

  const handleConfirmApprove = async () => {
    await approveAdmin(admin._id)
    setIsApproveModalOpen(false)
  }

  const handleConfirmReject = async (reason: string) => {
    const success = await rejectAdmin(admin._id, reason)
    if (success) {
      setIsRejectModalOpen(false)
    }
  }

  const openDocument = (title: string, docType: string, url?: string) => {
    setViewerModal({
      isOpen: true,
      title,
      docType,
      docUrl: url,
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return {
          label: 'Approved & Verified',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
        }
      case 'REJECTED':
        return {
          label: 'Application Rejected',
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
        }
      case 'SUSPENDED':
        return {
          label: 'Account Suspended',
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
        }
      case 'INCOMPLETE':
        return {
          label: 'Draft / Incomplete',
          bg: 'bg-slate-100 text-slate-600 border-slate-200',
          dot: 'bg-slate-400',
        }
      default:
        return {
          label: 'Pending Super Admin Review',
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
        }
    }
  }

  const badge = getStatusBadge(admin.verificationStatus)

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col">
      {/* 1. Header Banner */}
      <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-50 via-white to-blue-50/30 border-b border-slate-200/80">
        <div className="flex flex-col gap-4">
          {/* Mobile Back Button */}
          {isMobileView && onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors w-fit pb-1"
            >
              <ArrowLeft className="size-4" />
              <span>Back to Requests List</span>
            </button>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Admin Avatar & Primary Info */}
            <div className="flex items-start gap-4">
              <div className="size-16 sm:size-18 rounded-2xl overflow-hidden bg-gradient-to-tr from-sky-100 via-blue-100 to-indigo-100 shrink-0 border border-slate-200/80 shadow-xs flex items-center justify-center">
                {admin.userId?.avatar ? (
                  <img
                    src={admin.userId.avatar}
                    alt={adminName}
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="font-black text-xl sm:text-2xl text-blue-700">
                    {adminName.charAt(0).toUpperCase() || 'A'}
                  </span>
                )}
              </div>

              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                    {adminName}
                  </h2>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.bg}`}
                  >
                    <span className={`size-1.5 rounded-full ${badge.dot}`} />
                    <span>{badge.label}</span>
                  </span>
                </div>

                <p className="text-xs sm:text-sm font-semibold text-slate-600 flex items-center gap-1.5">
                  <Briefcase className="size-3.5 text-blue-600 shrink-0" />
                  <span>{designation}</span>
                </p>

                <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                  <Building2 className="size-3.5 text-slate-400 shrink-0" />
                  <span className={hasHospital ? 'font-bold text-slate-700' : 'italic'}>
                    {hospitalName}
                  </span>
                </p>
              </div>
            </div>

            {/* Action Buttons for Super Admin */}
            <div className="flex items-center gap-2.5 sm:self-center shrink-0 flex-wrap">
              {admin.verificationStatus !== 'APPROVED' ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsRejectModalOpen(true)}
                    disabled={isActionLoading}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                  >
                    <XCircle className="size-3.5" />
                    <span>Reject</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsApproveModalOpen(true)}
                    disabled={isActionLoading}
                    className="flex items-center gap-1.5 px-4.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="size-3.5" />
                    <span>Approve & Verify</span>
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                  <ShieldCheck className="size-4 text-emerald-600" />
                  <span>Verified Administrator</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* If Rejected, display Rejection Reason callout */}
        {admin.verificationStatus === 'REJECTED' && admin.rejectionReason && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-900">
            <AlertCircle className="size-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Rejection Reason: </span>
              <span>{admin.rejectionReason}</span>
            </div>
          </div>
        )}

        {/* Tabs Bar */}
        <div className="flex items-center gap-1.5 mt-5 border-b border-slate-200/80 -mb-4 sm:-mb-6 pt-1 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 transition-all duration-150 cursor-pointer flex items-center gap-2 select-none active:scale-[0.98] focus-visible:outline-none ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <FileText className={`size-4 ${activeTab === 'overview' ? 'text-blue-600' : 'text-slate-400'}`} />
            <span>Overview & Details</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('documents')}
            className={`pb-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 transition-all duration-150 cursor-pointer flex items-center gap-2 select-none active:scale-[0.98] focus-visible:outline-none ${
              activeTab === 'documents'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <IdCard className={`size-4 ${activeTab === 'documents' ? 'text-blue-600' : 'text-slate-400'}`} />
            <span>Verification Documents</span>
            {(admin.identityProofUrl || admin.authorizationLetterUrl) && (
              <span className="size-2 rounded-full bg-blue-600 animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* 2. Tab Content Area */}
      <div className="p-4 sm:p-6 space-y-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Contact & Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Official Email
                </span>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <Mail className="size-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">{email}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Phone Number
                </span>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <Phone className="size-3.5 text-blue-600 shrink-0" />
                  <span>{phone}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Submission Date
                </span>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <Clock className="size-3.5 text-blue-600 shrink-0" />
                  <span>{formattedSubmittedDate}</span>
                </div>
              </div>
            </div>

            {/* Hospital Affiliation & Details Section */}
            <div className="space-y-3">
              <h3 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="size-4 text-blue-600" />
                <span>Hospital Facility Information</span>
              </h3>

              {hasHospital ? (
                <div className="rounded-2xl border border-slate-200/80 p-4 sm:p-5 bg-gradient-to-br from-white to-slate-50/50 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-slate-400 font-semibold block">
                        Hospital / Healthcare Facility Name
                      </span>
                      <p className="text-sm font-black text-slate-900 mt-0.5">
                        {admin.hospitalName || admin.hospitalId?.name}
                      </p>
                    </div>

                    {admin.hospitalRegistrationNumber && (
                      <div>
                        <span className="text-xs text-slate-400 font-semibold block">
                          Facility Registration Number
                        </span>
                        <p className="text-sm font-mono font-bold text-blue-700 mt-0.5">
                          {admin.hospitalRegistrationNumber}
                        </p>
                      </div>
                    )}

                    {admin.hospitalType && (
                      <div>
                        <span className="text-xs text-slate-400 font-semibold block">
                          Hospital Type
                        </span>
                        <p className="text-xs font-bold text-slate-800 mt-0.5">
                          {admin.hospitalType}
                        </p>
                      </div>
                    )}

                    {admin.numberOfBeds !== undefined && admin.numberOfBeds > 0 && (
                      <div>
                        <span className="text-xs text-slate-400 font-semibold block">
                          Bed Capacity
                        </span>
                        <p className="text-xs font-bold text-slate-800 mt-0.5 flex items-center gap-1">
                          <BedDouble className="size-3.5 text-blue-600" />
                          <span>{admin.numberOfBeds} Beds</span>
                        </p>
                      </div>
                    )}

                    {admin.hospitalAddress && (
                      <div className="sm:col-span-2">
                        <span className="text-xs text-slate-400 font-semibold block">
                          Facility Address
                        </span>
                        <p className="text-xs font-medium text-slate-700 mt-0.5 flex items-center gap-1.5">
                          <MapPin className="size-3.5 text-slate-400 shrink-0" />
                          <span>{admin.hospitalAddress}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4 sm:p-5 rounded-2xl border border-blue-100 bg-blue-50/40 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                    <AlertCircle className="size-4 text-blue-600 shrink-0" />
                    <span>Hospital Configuration Deferred</span>
                  </div>
                  <p className="text-xs text-blue-800/80 leading-relaxed font-medium">
                    This administrator applied without specifying an initial hospital. They will configure, register, or associate their hospital facility directly from their Hospital Admin dashboard once approved.
                  </p>
                </div>
              )}
            </div>

            {/* Qualifications & Educational Background */}
            {admin.qualifications && admin.qualifications.length > 0 && (
              <div className="space-y-2.5">
                <h3 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Award className="size-4 text-blue-600" />
                  <span>Qualifications & Degrees</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {admin.qualifications.map((q, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200/80"
                    >
                      {q}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* System Status Footnote */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <User className="size-3.5 text-slate-400" />
                <span>Account Approval Status:</span>
              </span>
              <span
                className={`font-bold ${
                  admin.userId?.isAccountApproved
                    ? 'text-emerald-700'
                    : 'text-amber-700'
                }`}
              >
                {admin.userId?.isAccountApproved
                  ? 'Access Granted (Approved)'
                  : 'Pending Verification'}
              </span>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-5">
            <p className="text-xs text-slate-500 leading-relaxed">
              Verify the administrator&apos;s government-issued identity proof and formal hospital authorization letter. Click on any document card to preview or download.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1. Government Identity Proof Card */}
              <div className="rounded-2xl border border-slate-200/80 p-4 sm:p-5 bg-white shadow-2xs space-y-3.5 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="size-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <IdCard className="size-4.5 stroke-[2.2]" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-black text-slate-900">
                          Government ID Proof
                        </h4>
                        <span className="text-[11px] font-bold text-slate-400">
                          {admin.governmentIdType || 'National ID'}
                        </span>
                      </div>
                    </div>

                    {admin.identityProofUrl ? (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-200">
                        ATTACHED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-black border border-slate-200">
                        MISSING
                      </span>
                    )}
                  </div>

                  {admin.governmentIdNumber && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 font-mono text-xs font-bold text-slate-800">
                      ID Number: {admin.governmentIdNumber}
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  {admin.identityProofUrl ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          openDocument(
                            `${admin.governmentIdType || 'Government ID'} - ${adminName}`,
                            'Identity Proof',
                            admin.identityProofUrl
                          )
                        }
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100/80 text-blue-700 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Eye className="size-3.5" />
                        <span>Inspect Document</span>
                      </button>

                      <a
                        href={admin.identityProofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors"
                        title="Open in new tab"
                      >
                        <ExternalLink className="size-3.5" />
                      </a>
                    </div>
                  ) : (
                    <div className="p-2 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                      No government ID file attached
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Hospital Authorization Letter Card */}
              <div className="rounded-2xl border border-slate-200/80 p-4 sm:p-5 bg-white shadow-2xs space-y-3.5 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="size-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <FileCheck2 className="size-4.5 stroke-[2.2]" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-black text-slate-900">
                          Hospital Authorization Letter
                        </h4>
                        <span className="text-[11px] font-bold text-slate-400">
                          Official Appointment Proof
                        </span>
                      </div>
                    </div>

                    {admin.authorizationLetterUrl ? (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-200">
                        ATTACHED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-black border border-slate-200">
                        MISSING
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500">
                    Official authorization, power of attorney, or board resolution letter issued by the hospital management.
                  </p>
                </div>

                <div className="pt-2">
                  {admin.authorizationLetterUrl ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          openDocument(
                            `Authorization Letter - ${adminName}`,
                            'Authorization Letter',
                            admin.authorizationLetterUrl
                          )
                        }
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Eye className="size-3.5" />
                        <span>Inspect Document</span>
                      </button>

                      <a
                        href={admin.authorizationLetterUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors"
                        title="Open in new tab"
                      >
                        <ExternalLink className="size-3.5" />
                      </a>
                    </div>
                  ) : (
                    <div className="p-2 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                      No authorization letter uploaded
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Additional Document (Optional) */}
              {admin.additionalDocUrl && (
                <div className="md:col-span-2 rounded-2xl border border-slate-200/80 p-4 sm:p-5 bg-white shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="size-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <FileText className="size-4.5 stroke-[2.2]" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-black text-slate-900">
                          Additional Supporting Documentation
                        </h4>
                        <span className="text-[11px] font-bold text-slate-400">
                          Supplementary Hospital Credentials
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-200">
                      ATTACHED
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        openDocument(
                          `Additional Document - ${adminName}`,
                          'Supplementary Document',
                          admin.additionalDocUrl
                        )
                      }
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100/80 text-amber-800 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Eye className="size-3.5" />
                      <span>Inspect Document</span>
                    </button>

                    <a
                      href={admin.additionalDocUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      <ExternalLink className="size-3.5" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Approve Confirmation Modal */}
      <ApproveAdminVerificationModal
        adminName={adminName}
        designation={designation}
        hospitalName={admin.hospitalName}
        hasHospital={hasHospital}
        governmentIdType={admin.governmentIdType}
        governmentIdNumber={admin.governmentIdNumber}
        isOpen={isApproveModalOpen}
        isLoading={isActionLoading}
        onClose={() => setIsApproveModalOpen(false)}
        onConfirm={handleConfirmApprove}
      />

      {/* Reject Modal with reason input */}
      <RejectAdminVerificationModal
        adminName={adminName}
        isOpen={isRejectModalOpen}
        isLoading={isActionLoading}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={handleConfirmReject}
      />

      {/* Full-screen Document Viewer */}
      <DocumentViewerModal
        isOpen={viewerModal.isOpen}
        title={viewerModal.title}
        docType={viewerModal.docType}
        docUrl={viewerModal.docUrl}
        doctorName={adminName}
        councilNumber={admin.governmentIdNumber}
        onClose={() =>
          setViewerModal({ isOpen: false, title: '', docType: '' })
        }
      />
    </div>
  )
}

export default HospitalAdminVerificationDetailPanel
