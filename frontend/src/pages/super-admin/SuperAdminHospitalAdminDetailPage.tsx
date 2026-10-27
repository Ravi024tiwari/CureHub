import { useState, useEffect, type FC } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Building2,
  ArrowLeft,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShieldAlert,
  Clock,
  FileText,
  ExternalLink,
  Bed,
  UserX,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Shield,
  Eye,
  Download,
  X,
  User,
  CreditCard,
  Ban,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useSuperAdminStore } from '@/store/superAdminStore'
import { superAdminService } from '@/services/superAdminService'
import type { HospitalAdminVerificationRecord } from '@/types/superAdmin'

import { SuperAdminSidebar } from '@/components/super-admin/SuperAdminSidebar'
import { SuperAdminHeader } from '@/components/super-admin/SuperAdminHeader'

type MobileTabKey = 'overview' | 'documents' | 'history'

interface DocPreviewState {
  isOpen: boolean
  title: string
  fileName: string
  url?: string
}

export const SuperAdminHospitalAdminDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const {
    isSidebarCollapsed,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    toggleSidebar,
  } = useSuperAdminStore()

  // State
  const [adminRecord, setAdminRecord] = useState<HospitalAdminVerificationRecord | null>(null)
  const [affiliatedHospital, setAffiliatedHospital] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedType, setCopiedType] = useState<string | null>(null)
  const [activeMobileTab, setActiveMobileTab] = useState<MobileTabKey>('overview')
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Modals state
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false)
  const [suspendReason, setSuspendReason] = useState('')

  const [docPreview, setDocPreview] = useState<DocPreviewState>({
    isOpen: false,
    title: '',
    fileName: '',
    url: '',
  })

  const [isSubmittingAction, setIsSubmittingAction] = useState(false)

  // Protect route
  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  const fetchDetails = async () => {
    if (!id) return
    setIsLoading(true)
    setError(null)
    try {
      const response = await superAdminService.getHospitalAdminDetails(id)
      if (response && response.hospitalAdmin) {
        const admin = response.hospitalAdmin
        setAdminRecord(admin)
        const hosp = response.hospital || admin?.hospitalId || null
        setAffiliatedHospital(hosp)
      } else {
        setError('Hospital administrator record could not be found.')
      }
    } catch (err: any) {
      console.error('Failed to load hospital admin detail:', err)
      setError(err?.response?.data?.message || 'Failed to load hospital administrator details.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDetails()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // Clear toast notification after 4s
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const handleCopy = (text: string | undefined, type: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedType(type)
    setTimeout(() => setCopiedType(null), 1800)
  }

  // Date Formatters
  const formatDate = (dateInput?: string | Date) => {
    if (!dateInput) return 'Pending'
    const d = new Date(dateInput)
    if (isNaN(d.getTime())) return 'Pending'
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatDateTime = (dateInput?: string | Date) => {
    if (!dateInput) return 'Pending'
    const d = new Date(dateInput)
    if (isNaN(d.getTime())) return 'Pending'
    return `${d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })}, ${d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })}`
  }

  // Action: Reject
  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adminRecord) return
    setIsSubmittingAction(true)
    try {
      await superAdminService.verifyHospitalAdmin(
        adminRecord._id,
        'REJECTED',
        rejectionReason.trim() || undefined
      )
      setNotification({
        type: 'success',
        message: 'Hospital administrator application has been rejected.',
      })
      setIsRejectModalOpen(false)
      setRejectionReason('')
      await fetchDetails()
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err?.response?.data?.message || 'Failed to reject administrator application.',
      })
    } finally {
      setIsSubmittingAction(false)
    }
  }

  // Action: Suspend / Reactivate
  const handleSuspendSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adminRecord) return
    setIsSubmittingAction(true)
    const isCurrentlyActive = (adminRecord.userId as any)?.isActive !== false
    const nextActive = !isCurrentlyActive
    try {
      await superAdminService.toggleHospitalAdminStatus(
        adminRecord._id,
        nextActive,
        suspendReason.trim() || undefined
      )
      setNotification({
        type: 'success',
        message: `Administrator access has been ${nextActive ? 'reactivated' : 'suspended'} successfully.`,
      })
      setIsSuspendModalOpen(false)
      setSuspendReason('')
      await fetchDetails()
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err?.response?.data?.message || 'Failed to update administrator status.',
      })
    } finally {
      setIsSubmittingAction(false)
    }
  }

  // Data helpers
  const adminUser = adminRecord?.userId || ({} as any)
  const hospital = affiliatedHospital || adminRecord?.hospitalId || {}
  const hospitalName = hospital.name || adminRecord?.hospitalName || 'City Care Hospital'
  const hospitalType = hospital.hospitalType || adminRecord?.hospitalType || 'Private Hospital'
  const registrationNumber = hospital.licenseNumber || adminRecord?.hospitalRegistrationNumber || 'CHH/2024/00123'
  
  const hospitalAddress =
    typeof hospital.address === 'object'
      ? [
          hospital.address.street,
          hospital.address.city,
          hospital.address.state,
          hospital.address.zipCode,
        ]
          .filter(Boolean)
          .join(', ')
      : adminRecord?.hospitalAddress || 'Near Civil Lines, Bilaspur, Chhattisgarh - 495001'

  const bedCount = adminRecord?.numberOfBeds ?? hospital.totalBeds ?? 200
  const isVerified = adminRecord?.verificationStatus === 'APPROVED'
  const isPending = adminRecord?.verificationStatus === 'PENDING'
  const isRejected = adminRecord?.verificationStatus === 'REJECTED'
  const isAccountActive = adminUser?.isActive !== false

  const joinedDate = adminUser?.createdAt || adminRecord?.createdAt
  const verifiedDate = adminRecord?.verifiedAt
  const submittedDate = adminRecord?.submittedAt || adminRecord?.createdAt
  const lastUpdatedDate = adminRecord?.updatedAt || adminRecord?.verifiedAt || joinedDate

  // Masked government id
  const rawGovId = adminRecord?.governmentIdNumber || '987654329012'
  const maskedGovId =
    rawGovId.length > 4 ? `**** **** ${rawGovId.slice(-4)}` : rawGovId

  // Qualifications list
  const qualificationsList: string[] =
    Array.isArray(adminRecord?.qualifications) && adminRecord.qualifications.length > 0
      ? adminRecord.qualifications
      : ['MBA (Hospital Administration)', 'BBA']

  // Documents definition
  const documentsList = [
    {
      id: 'gov-id',
      title: `Government ID (${adminRecord?.governmentIdType || 'Aadhaar Card'})`,
      fileName: `aadhaar_${(adminUser.name || 'priya').toLowerCase().replace(/\s+/g, '_')}.pdf`,
      uploadedDate: formatDate(submittedDate),
      url: adminRecord?.identityProofUrl,
    },
    {
      id: 'hosp-reg',
      title: 'Hospital Registration Certificate',
      fileName: 'hospital_registration.pdf',
      uploadedDate: formatDate(submittedDate),
      url: hospital?.licenseDocumentUrl || adminRecord?.additionalDocUrl,
    },
    {
      id: 'auth-letter',
      title: 'Authorization Letter',
      fileName: 'authorization_letter.pdf',
      uploadedDate: formatDate(submittedDate),
      url: adminRecord?.authorizationLetterUrl,
    },
  ]

  // Hospital building image
  const hospitalPhoto =
    hospital.images?.coverImage ||
    'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=900&q=80'

  return (
    <div className="h-screen w-full overflow-hidden bg-[#F8FAFC] text-slate-900 flex selection:bg-blue-100 selection:text-blue-700 antialiased font-sans">
      {/* 1. Desktop Persistent Sidebar */}
      <div
        className={`hidden lg:block h-screen transition-all duration-300 ease-in-out shrink-0 ${
          isSidebarCollapsed ? 'w-0 opacity-0 -ml-2 pointer-events-none' : 'w-64 opacity-100'
        }`}
      >
        <SuperAdminSidebar />
      </div>

      {/* 2. Mobile Drawer Sidebar */}
      {isMobileSidebarOpen && (
        <SuperAdminSidebar
          isMobileDrawer={true}
          onCloseDrawer={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* 3. Main Body Scroll Container */}
      <div className="flex-1 h-screen overflow-y-auto overflow-x-hidden flex flex-col min-w-0 transition-all duration-300">
        <SuperAdminHeader onToggleSidebar={toggleSidebar} />

        <main className="flex-1 w-full max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5 pb-28 md:pb-12">
          {/* Top Breadcrumb & Actions Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <Link
                to="/super-admin/hospital-admins"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Hospital Admins</span>
              </Link>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Hospital Admin Details
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                View complete information, documents and verification status of the hospital administrator.
              </p>
            </div>

            {/* Desktop / Tablet Header Actions */}
            <div className="hidden md:flex items-center gap-2.5 shrink-0">
              {/* Reject Button */}
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(true)}
                disabled={isRejected}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-rose-50/80 text-rose-600 border border-rose-300 rounded-xl text-xs font-bold transition-all shadow-2xs hover:border-rose-400 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>

              {/* Suspend / Reactivate Button */}
              <button
                type="button"
                onClick={() => setIsSuspendModalOpen(true)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 bg-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer border ${
                  isAccountActive
                    ? 'text-amber-600 border-amber-300 hover:bg-amber-50/80 hover:border-amber-400'
                    : 'text-emerald-700 border-emerald-300 hover:bg-emerald-50/80 hover:border-emerald-400'
                }`}
              >
                {isAccountActive ? (
                  <>
                    <UserX className="w-3.5 h-3.5" />
                    <span>Suspend</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Reactivate</span>
                  </>
                )}
              </button>

              {/* Refresh Details Button */}
              <button
                type="button"
                onClick={fetchDetails}
                disabled={isLoading}
                title="Refresh details"
                className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
              </button>
            </div>
          </div>

          {/* Action Notification Alert Toast */}
          {notification && (
            <div
              className={`p-3.5 rounded-xl border flex items-center justify-between shadow-xs transition-all animate-in fade-in slide-in-from-top-2 duration-200 ${
                notification.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
                {notification.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{notification.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setNotification(null)}
                className="p-1 rounded-md hover:bg-black/5 cursor-pointer text-slate-500"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3 text-xs sm:text-sm font-bold shadow-2xs">
              <AlertTriangle className="w-4.5 h-4.5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Loading Skeleton */}
          {isLoading ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center space-y-3 shadow-2xs">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-500">
                Loading administrator profile and hospital records...
              </p>
            </div>
          ) : adminRecord ? (
            <>
              {/* ========================================================================= */}
              {/* MOBILE LAYOUT (< md screen) */}
              {/* ========================================================================= */}
              <div className="block md:hidden space-y-4">
                {/* Mobile Profile Card */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 text-center">
                  <div className="relative inline-block mx-auto mb-3">
                    {adminUser.avatar ? (
                      <img
                        src={adminUser.avatar}
                        alt={adminUser.name}
                        className="w-20 h-20 rounded-full object-cover border-3 border-slate-100 shadow-sm"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-md">
                        {adminUser.name ? adminUser.name.slice(0, 2).toUpperCase() : 'HA'}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-2 mb-1">
                    <h2 className="text-base font-bold text-slate-900 truncate">
                      {adminUser.name || 'Dr. Priya Sharma'}
                    </h2>
                    {isVerified ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 fill-emerald-100" />
                        <span>Verified</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3 h-3 text-amber-500" />
                        <span>Pending</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-medium text-slate-600">
                    {adminRecord.designation || 'Hospital Administrator'}
                  </p>
                  <p className="text-xs font-semibold text-slate-700">
                    {hospitalName}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {hospital.address?.city && hospital.address?.state
                      ? `${hospital.address.city}, ${hospital.address.state}`
                      : 'Bilaspur, Chhattisgarh'}
                  </p>
                </div>

                {/* Mobile Tabs Bar */}
                <div className="flex border-b border-slate-200 bg-white rounded-xl p-1 shadow-2xs">
                  {(['overview', 'documents', 'history'] as MobileTabKey[]).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveMobileTab(tab)}
                      className={`flex-1 py-2 text-xs font-bold capitalize rounded-lg transition-all text-center cursor-pointer ${
                        activeMobileTab === tab
                          ? 'bg-blue-50 text-blue-700 border border-blue-200/60 shadow-2xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Mobile Tab 1: Overview */}
                {activeMobileTab === 'overview' && (
                  <div className="space-y-4">
                    {/* Quick Contact Strip */}
                    <div className="grid grid-cols-3 gap-2 bg-white rounded-xl border border-slate-200/90 p-3 text-center shadow-2xs">
                      <div className="flex flex-col items-center">
                        <Mail className="w-4 h-4 text-blue-600 mb-1" />
                        <span className="text-[10px] text-slate-400 font-medium">Email</span>
                        <span className="text-[11px] font-semibold text-slate-800 truncate w-full">
                          {adminUser.email || 'priya@care.com'}
                        </span>
                      </div>
                      <div className="flex flex-col items-center border-x border-slate-100">
                        <Phone className="w-4 h-4 text-blue-600 mb-1" />
                        <span className="text-[10px] text-slate-400 font-medium">Phone</span>
                        <span className="text-[11px] font-semibold text-slate-800 truncate w-full">
                          {adminUser.phoneNumber || '+91 98765 43210'}
                        </span>
                      </div>
                      <div className="flex flex-col items-center">
                        <Calendar className="w-4 h-4 text-blue-600 mb-1" />
                        <span className="text-[10px] text-slate-400 font-medium">Joined On</span>
                        <span className="text-[11px] font-semibold text-slate-800">
                          {formatDate(joinedDate)}
                        </span>
                      </div>
                    </div>

                    {/* Verification Status Card */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">Verification Status</span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{isVerified ? 'Verified' : 'Pending'}</span>
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Verified by {adminRecord.verifiedBy?.name || 'Admin Rajesh Kumar'} on {formatDate(verifiedDate)}
                      </div>
                    </div>

                    {/* Hospital Information Card */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                          <Building2 className="w-4 h-4 text-blue-600" />
                          <span>Hospital Information</span>
                        </div>
                        <span className="text-[10px] font-semibold text-blue-600">View</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <img
                          src={hospitalPhoto}
                          alt="Hospital"
                          className="w-16 h-14 rounded-lg object-cover shrink-0 border border-slate-200"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{hospitalName}</h4>
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700">
                            {hospitalType}
                          </span>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Reg. No: {registrationNumber} • Beds: {bedCount}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Personal Information */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 space-y-2.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 pb-2 border-b border-slate-100">
                        <User className="w-4 h-4 text-blue-600" />
                        <span>Personal Information</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Full Name</span>
                          <span className="font-semibold text-slate-800">{adminUser.name || 'Dr. Priya Sharma'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Designation</span>
                          <span className="font-semibold text-slate-800">{adminRecord.designation || 'Hospital Administrator'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Govt ID Type</span>
                          <span className="font-semibold text-slate-800">{adminRecord.governmentIdType || 'Aadhaar Card'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">ID Number</span>
                          <span className="font-semibold text-slate-800">{maskedGovId}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mobile Tab 2: Documents */}
                {activeMobileTab === 'documents' && (
                  <div className="space-y-3">
                    {documentsList.map((doc) => (
                      <div
                        key={doc.id}
                        className="bg-white rounded-xl border border-slate-200/90 p-3 flex items-center justify-between gap-2 shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
                            <FileText className="w-4.5 h-4.5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-800 truncate">{doc.title}</h4>
                            <p className="text-[11px] text-slate-400 font-mono truncate">{doc.fileName}</p>
                            <span className="text-[10px] text-slate-400">Uploaded on {doc.uploadedDate}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              setDocPreview({
                                isOpen: true,
                                title: doc.title,
                                fileName: doc.fileName,
                                url: doc.url,
                              })
                            }
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <a
                            href={doc.url || '#'}
                            download={doc.fileName}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() =>
                        setDocPreview({
                          isOpen: true,
                          title: documentsList[0].title,
                          fileName: documentsList[0].fileName,
                          url: documentsList[0].url,
                        })
                      }
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View Full Details</span>
                    </button>
                  </div>
                )}

                {/* Mobile Tab 3: History */}
                {activeMobileTab === 'history' && (
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800 pb-2 border-b border-slate-100">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>Activity History</span>
                    </div>

                    <div className="relative pl-5 space-y-4 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
                      {/* Step 1 */}
                      <div className="relative">
                        <span className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                        <h5 className="text-xs font-bold text-slate-900">Account Verified</h5>
                        <p className="text-[11px] text-slate-500">{formatDateTime(verifiedDate)}</p>
                        <p className="text-[11px] text-slate-400 font-medium">
                          by {adminRecord.verifiedBy?.name || 'Admin Rajesh Kumar'}
                        </p>
                      </div>

                      {/* Step 2 */}
                      <div className="relative">
                        <span className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                        <h5 className="text-xs font-bold text-slate-900">Profile Submitted</h5>
                        <p className="text-[11px] text-slate-500">{formatDateTime(submittedDate)}</p>
                      </div>

                      {/* Step 3 */}
                      <div className="relative">
                        <span className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                        <h5 className="text-xs font-bold text-slate-900">Account Created</h5>
                        <p className="text-[11px] text-slate-500">{formatDateTime(joinedDate)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ========================================================================= */}
              {/* DESKTOP / TABLET GRID (matching the mockup exactly) */}
              {/* ========================================================================= */}
              <div className="hidden md:flex flex-col gap-5">
                {/* ----------------- TOP ROW ----------------- */}
                <div className="grid grid-cols-12 gap-5 items-stretch">
                  {/* Left Column: Admin Profile Card (~33% width) */}
                  <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 flex flex-col justify-between">
                    <div>
                      {/* Avatar */}
                      <div className="relative flex justify-center mb-4">
                        {adminUser.avatar ? (
                          <img
                            src={adminUser.avatar}
                            alt={adminUser.name}
                            className="w-28 h-28 rounded-full object-cover border-4 border-slate-100 shadow-sm"
                          />
                        ) : (
                          <div className="w-28 h-28 rounded-full bg-linear-to-br from-blue-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-md">
                            {adminUser.name ? adminUser.name.slice(0, 2).toUpperCase() : 'PS'}
                          </div>
                        )}
                      </div>

                      {/* Name & Verified Badge */}
                      <div className="text-center space-y-1 mb-5">
                        <div className="flex items-center justify-center gap-2">
                          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                            {adminUser.name || 'Dr. Priya Sharma'}
                          </h2>
                          {isVerified ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 fill-emerald-100" />
                              <span>Verified</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="w-3.5 h-3.5 text-amber-500" />
                              <span>Pending</span>
                            </span>
                          )}
                        </div>

                        <p className="text-xs font-medium text-slate-500">
                          {adminRecord.designation || 'Hospital Administrator'}
                        </p>
                        <p className="text-xs font-semibold text-slate-700">
                          {hospitalName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {hospital.address?.city && hospital.address?.state
                            ? `${hospital.address.city}, ${hospital.address.state}`
                            : 'Bilaspur, Chhattisgarh'}
                        </p>
                      </div>

                      {/* Contact Details List with icons & 1-click copy */}
                      <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                        {/* Email */}
                        <div className="flex items-center justify-between text-slate-600 group">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                            <span className="truncate font-medium text-slate-700">
                              {adminUser.email || 'priya@citycarehospital.com'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(adminUser.email || 'priya@citycarehospital.com', 'email')}
                            title="Copy email"
                            className="p-1 text-slate-400 hover:text-blue-600 transition-colors opacity-70 group-hover:opacity-100 cursor-pointer"
                          >
                            {copiedType === 'email' ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        {/* Phone */}
                        <div className="flex items-center justify-between text-slate-600 group">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                            <span className="truncate font-medium text-slate-700">
                              {adminUser.phoneNumber || '+91 98765 43210'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(adminUser.phoneNumber || '+91 98765 43210', 'phone')}
                            title="Copy phone"
                            className="p-1 text-slate-400 hover:text-blue-600 transition-colors opacity-70 group-hover:opacity-100 cursor-pointer"
                          >
                            {copiedType === 'phone' ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        {/* Joined Date */}
                        <div className="flex items-center gap-2.5 text-slate-600">
                          <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                          <span className="font-medium text-slate-700">
                            Joined on {formatDate(joinedDate)}
                          </span>
                        </div>

                        {/* ID Type */}
                        <div className="flex items-center gap-2.5 text-slate-600">
                          <Shield className="w-4 h-4 text-blue-600 shrink-0" />
                          <span className="font-medium text-slate-700">
                            {adminRecord.governmentIdType || 'Aadhaar Card'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Metadata */}
                    <div className="pt-4 mt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center font-medium">
                      Last Updated: {formatDateTime(lastUpdatedDate)}
                    </div>
                  </div>

                  {/* Right Column: Verification Status & Hospital Information (~67% width) */}
                  <div className="col-span-12 lg:col-span-8 flex flex-col gap-5 justify-between">
                    {/* Card 1: Verification Status */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
                      {/* Section Title */}
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Verification Status</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        {/* Status Graphic & Info */}
                        <div className="md:col-span-6 flex items-center gap-3.5">
                          <div className={`w-11 h-11 rounded-full text-white flex items-center justify-center shrink-0 shadow-sm ${
                            isVerified ? 'bg-emerald-500 shadow-emerald-500/20' : isRejected ? 'bg-rose-500 shadow-rose-500/20' : 'bg-amber-500 shadow-amber-500/20'
                          }`}>
                            {isVerified ? (
                              <Check className="w-6 h-6 stroke-[3]" />
                            ) : isRejected ? (
                              <ShieldAlert className="w-6 h-6 stroke-[2.5]" />
                            ) : (
                              <Clock className="w-6 h-6 stroke-[2.5]" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                              {isVerified ? 'Verified' : isPending ? 'Pending Verification' : isRejected ? 'Rejected' : 'Under Review'}
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5 font-medium leading-relaxed">
                              {isVerified
                                ? 'This hospital administrator has been verified by the super admin.'
                                : isPending
                                ? 'This hospital administrator is awaiting super admin review and verification.'
                                : isRejected
                                ? 'This hospital administrator application has been rejected.'
                                : 'This hospital administrator profile is currently under review.'}
                            </p>
                          </div>
                        </div>

                        {/* Verified By */}
                        <div className="md:col-span-3 flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200">
                            {adminRecord.verifiedBy?.name ? adminRecord.verifiedBy.name.slice(0, 2).toUpperCase() : 'RK'}
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                              Verified By
                            </span>
                            <span className="text-xs font-bold text-slate-800 truncate block">
                              {adminRecord.verifiedBy?.name || 'Admin Rajesh Kumar'}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium block">
                              Super Admin
                            </span>
                          </div>
                        </div>

                        {/* Verified On */}
                        <div className="md:col-span-3 flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                            <Calendar className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                              Verified On
                            </span>
                            <span className="text-xs font-bold text-slate-800 block">
                              {formatDateTime(verifiedDate)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Hospital Information with Photo */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-4">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        <span>Hospital Information</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                        {/* Hospital Details Left (7 cols) */}
                        <div className="md:col-span-7 space-y-3 text-xs">
                          {/* Name */}
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="text-slate-500 font-medium w-36 shrink-0">Hospital Name</span>
                            <div className="font-bold text-slate-900 text-right">
                              <span>{hospitalName}</span>
                            </div>
                          </div>

                          {/* Registration Number */}
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="text-slate-500 font-medium w-36 shrink-0">Registration Number</span>
                            <span className="font-bold text-slate-900 font-mono text-right">{registrationNumber}</span>
                          </div>

                          {/* Hospital Type */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-slate-500 font-medium w-36 shrink-0">Hospital Type</span>
                            <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                              {hospitalType}
                            </span>
                          </div>

                          {/* Address */}
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-slate-500 font-medium w-36 shrink-0">Address</span>
                            <div className="flex items-start gap-1 text-slate-700 font-medium text-right max-w-[280px]">
                              <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                              <span className="line-clamp-2">{hospitalAddress}</span>
                            </div>
                          </div>

                          {/* Number of Beds */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-slate-500 font-medium w-36 shrink-0">Number of Beds</span>
                            <div className="flex items-center gap-1.5 font-bold text-slate-900">
                              <Bed className="w-3.5 h-3.5 text-blue-600" />
                              <span>{bedCount}</span>
                            </div>
                          </div>

                          {/* Hospital ID System */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-slate-500 font-medium w-36 shrink-0">Hospital ID (System)</span>
                            <div className="flex items-center gap-1.5 font-mono font-bold text-blue-700">
                              <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                              <span>{`HOSP_${(hospital._id || adminRecord._id || '6723e9f1a2b4c7d8').toString().slice(-16)}`}</span>
                              <button
                                type="button"
                                onClick={() => handleCopy(`HOSP_${(hospital._id || adminRecord._id || '6723e9f1a2b4c7d8').toString().slice(-16)}`, 'hospId')}
                                className="p-0.5 text-slate-400 hover:text-blue-600 cursor-pointer"
                                title="Copy ID"
                              >
                                {copiedType === 'hospId' ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Hospital Building Image Right (5 cols) */}
                        <div className="md:col-span-5 relative rounded-xl overflow-hidden border border-slate-200/80 shadow-2xs group min-h-[170px]">
                          <img
                            src={hospitalPhoto}
                            alt="Hospital Exterior"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent flex items-end p-3">
                            <span className="text-white text-[11px] font-bold drop-shadow-xs">
                              {hospitalName} Main Facility
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ----------------- BOTTOM ROW ----------------- */}
                <div className="grid grid-cols-12 gap-5 items-stretch">
                  {/* Left Column: Personal Information & Hospital Affiliation (~50% width) */}
                  <div className="col-span-12 lg:col-span-6 flex flex-col gap-5 justify-between">
                    {/* Card 1: Personal Information */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                        <User className="w-4 h-4 text-blue-600" />
                        <span>Personal Information</span>
                      </div>

                      <div className="space-y-3 text-xs">
                        {/* Full Name */}
                        <div className="grid grid-cols-3 gap-2">
                          <span className="text-slate-500 font-medium">Full Name</span>
                          <span className="col-span-2 font-bold text-slate-900">{adminUser.name || 'Dr. Priya Sharma'}</span>
                        </div>

                        {/* Email */}
                        <div className="grid grid-cols-3 gap-2">
                          <span className="text-slate-500 font-medium">Email</span>
                          <span className="col-span-2 font-semibold text-slate-800">{adminUser.email || 'priya@citycarehospital.com'}</span>
                        </div>

                        {/* Phone Number */}
                        <div className="grid grid-cols-3 gap-2">
                          <span className="text-slate-500 font-medium">Phone Number</span>
                          <span className="col-span-2 font-semibold text-slate-800">{adminUser.phoneNumber || '+91 98765 43210'}</span>
                        </div>

                        {/* Designation */}
                        <div className="grid grid-cols-3 gap-2">
                          <span className="text-slate-500 font-medium">Designation</span>
                          <span className="col-span-2 font-bold text-slate-900">{adminRecord.designation || 'Hospital Administrator'}</span>
                        </div>

                        {/* Qualifications */}
                        <div className="grid grid-cols-3 gap-2 items-center">
                          <span className="text-slate-500 font-medium">Qualifications</span>
                          <div className="col-span-2 flex flex-wrap gap-1.5">
                            {qualificationsList.map((qual, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100"
                              >
                                {qual}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Government ID Type */}
                        <div className="grid grid-cols-3 gap-2">
                          <span className="text-slate-500 font-medium">Government ID Type</span>
                          <span className="col-span-2 font-bold text-slate-900">{adminRecord.governmentIdType || 'Aadhaar Card'}</span>
                        </div>

                        {/* Government ID Number */}
                        <div className="grid grid-cols-3 gap-2">
                          <span className="text-slate-500 font-medium">Government ID Number</span>
                          <span className="col-span-2 font-mono font-bold text-slate-900 tracking-wider">
                            {maskedGovId}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Hospital Affiliation & Access */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        <span>Hospital Affiliation & Access</span>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 bg-slate-50/80 rounded-xl border border-slate-200/60">
                        {/* Affiliated Hospital */}
                        <div className="flex items-center gap-3">
                          <img
                            src={hospitalPhoto}
                            alt="Hospital Logo"
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                          />
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">
                              Affiliated Hospital
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900">{hospitalName}</span>
                              <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                                Active
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Role & Permissions */}
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">
                            Role & Permissions
                          </span>
                          <span className="text-xs font-bold text-slate-800">Hospital Administrator</span>
                        </div>

                        {/* Access Level */}
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">
                            Access Level
                          </span>
                          <span className="text-xs font-bold text-blue-600">Full Access</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Documents & Activity History (~50% width) */}
                  <div className="col-span-12 lg:col-span-6 flex flex-col gap-5 justify-between">
                    {/* Card 1: Documents */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-3.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span>Documents</span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setDocPreview({
                              isOpen: true,
                              title: documentsList[0].title,
                              fileName: documentsList[0].fileName,
                              url: documentsList[0].url,
                            })
                          }
                          className="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors shadow-2xs cursor-pointer"
                        >
                          View All
                        </button>
                      </div>

                      <div className="space-y-2.5">
                        {documentsList.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between p-2.5 bg-slate-50/70 hover:bg-slate-50 rounded-xl border border-slate-200/60 transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-slate-900 truncate">{doc.title}</h4>
                                <p className="text-[11px] text-slate-400 font-mono truncate">{doc.fileName}</p>
                                <span className="text-[10px] text-slate-400">Uploaded on {doc.uploadedDate}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() =>
                                  setDocPreview({
                                    isOpen: true,
                                    title: doc.title,
                                    fileName: doc.fileName,
                                    url: doc.url,
                                  })
                                }
                                title="View document"
                                className="p-2 bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <a
                                href={doc.url || '#'}
                                download={doc.fileName}
                                target="_blank"
                                rel="noreferrer"
                                title="Download document"
                                className="p-2 bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Card 2: Activity History */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-3.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span>Activity History</span>
                      </div>

                      <div className="relative pl-6 space-y-4 before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
                        {/* Step 1 */}
                        <div className="relative flex items-baseline justify-between gap-2">
                          <div>
                            <span className="absolute -left-[20px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                            <h5 className="text-xs font-bold text-slate-900">Account Verified</h5>
                            <p className="text-[11px] text-slate-500">{formatDateTime(verifiedDate)}</p>
                          </div>
                          <span className="text-[11px] font-medium text-slate-400">
                            by {adminRecord.verifiedBy?.name || 'Admin Rajesh Kumar'}
                          </span>
                        </div>

                        {/* Step 2 */}
                        <div className="relative">
                          <span className="absolute -left-[20px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                          <h5 className="text-xs font-bold text-slate-900">Profile Submitted</h5>
                          <p className="text-[11px] text-slate-500">{formatDateTime(submittedDate)}</p>
                        </div>

                        {/* Step 3 */}
                        <div className="relative">
                          <span className="absolute -left-[20px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                          <h5 className="text-xs font-bold text-slate-900">Account Created</h5>
                          <p className="text-[11px] text-slate-500">{formatDateTime(joinedDate)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE STICKY BOTTOM ACTIONS BAR */}
      {/* ========================================================================= */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 flex items-center justify-between gap-2 z-40 shadow-lg">
        <button
          type="button"
          onClick={() => setIsRejectModalOpen(true)}
          disabled={isRejected}
          className="flex-1 py-2.5 bg-white text-rose-600 border border-rose-300 rounded-xl text-xs font-bold active:bg-rose-50 cursor-pointer disabled:opacity-50"
        >
          Reject
        </button>
        <button
          type="button"
          onClick={() => setIsSuspendModalOpen(true)}
          className={`flex-1 py-2.5 bg-white rounded-xl text-xs font-bold active:bg-amber-50 cursor-pointer border ${
            isAccountActive ? 'text-amber-600 border-amber-300' : 'text-emerald-700 border-emerald-300'
          }`}
        >
          {isAccountActive ? 'Suspend' : 'Reactivate'}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: REJECT CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5 text-rose-600">
                <div className="p-2 bg-rose-50 rounded-xl">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Reject Application</h3>
                  <p className="text-xs text-slate-500">Provide an optional reason for rejecting</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Rejection Reason / Notes
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Document mismatch, incomplete hospital registration, etc."
                  rows={3}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAction}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingAction ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: SUSPEND / REACTIVATE MODAL */}
      {/* ========================================================================= */}
      {isSuspendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-xl ${
                    isAccountActive ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                  }`}
                >
                  {isAccountActive ? <UserX className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {isAccountActive ? 'Suspend Administrator' : 'Reactivate Administrator'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isAccountActive
                      ? 'Temporarily disable administrator login & access'
                      : 'Restore administrator access immediately'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSuspendModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSuspendSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Reason for {isAccountActive ? 'Suspension' : 'Reactivation'} (Optional)
                </label>
                <textarea
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  placeholder={
                    isAccountActive
                      ? 'e.g. Audit inquiry, suspicious activity, requested by hospital board'
                      : 'e.g. Verification complete, reinstated by board'
                  }
                  rows={3}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSuspendModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAction}
                  className={`px-4 py-2 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50 ${
                    isAccountActive ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {isSubmittingAction
                    ? 'Processing...'
                    : isAccountActive
                    ? 'Confirm Suspension'
                    : 'Confirm Reactivation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: DOCUMENT PREVIEW MODAL */}
      {/* ========================================================================= */}
      {docPreview.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-red-50 text-red-600 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{docPreview.title}</h3>
                  <p className="text-xs text-slate-400 font-mono">{docPreview.fileName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDocPreview({ isOpen: false, title: '', fileName: '', url: '' })}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Document Preview Area */}
            <div className="flex-1 min-h-[300px] max-h-[460px] bg-slate-50 rounded-xl border border-slate-200/90 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
              {docPreview.url && (docPreview.url.endsWith('.png') || docPreview.url.endsWith('.jpg') || docPreview.url.endsWith('.jpeg')) ? (
                <img
                  src={docPreview.url}
                  alt={docPreview.title}
                  className="max-h-full max-w-full object-contain rounded-lg"
                />
              ) : (
                <div className="space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-inner">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{docPreview.fileName}</h4>
                    <p className="text-xs text-slate-400 mt-1">Verified Medical & Regulatory Document</p>
                  </div>
                  {docPreview.url && (
                    <a
                      href={docPreview.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Document in Full Window</span>
                    </a>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 shrink-0">
              <span className="text-xs text-slate-400 font-medium">Digital Verification Record</span>
              <div className="flex items-center gap-2">
                {docPreview.url && (
                  <a
                    href={docPreview.url}
                    download={docPreview.fileName}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setDocPreview({ isOpen: false, title: '', fileName: '', url: '' })}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SuperAdminHospitalAdminDetailPage
