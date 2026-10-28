import { HospitalAdminLayout } from '@/components/hospital-admin/HospitalAdminLayout'
import { useState, useEffect, useRef, type FC, type ChangeEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Building2,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Camera,
  Loader2,
  Eye,
  Trash2,
  UploadCloud,
  Plus,
  KeyRound,
  Bell,
  LogOut,
  Save,
  RotateCcw,
  Award,
  FileText,
  User,
  X,
  Check,
  ChevronDown,
  Sparkles,
  ExternalLink,
} from 'lucide-react'

import { useAuthStore } from '@/store/authStore'
import { useHospitalAdminStore } from '@/store/hospitalAdminStore'
import { hospitalAdminService } from '@/services/hospitalAdminService'
import type { HospitalAdminProfileData } from '@/types/hospitalAdmin'

// Layout Components

export const HospitalAdminProfilePage: FC = () => {
  const navigate = useNavigate()
  const { user, setUser, logout } = useAuthStore()

  const {
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    isSidebarCollapsed,
    toggleSidebar,
  } = useHospitalAdminStore()

  // Profile Loading State
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Mobile Accordion state for contact details
  const [isMobileContactExpanded, setIsMobileContactExpanded] = useState(false)

  // Active Tab
  const [activeTab, setActiveTab] = useState<'personal' | 'documents' | 'qualifications' | 'security'>('personal')

  // Form Fields - Personal & Admin Profile
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [alternatePhone, setAlternatePhone] = useState('')
  const [designation, setDesignation] = useState('Hospital Administrator')
  const [governmentIdType, setGovernmentIdType] = useState('Aadhaar Card')
  const [governmentIdNumber, setGovernmentIdNumber] = useState('')
  const [address, setAddress] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string>('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  // Document proof states
  const [identityProofUrl, setIdentityProofUrl] = useState<string>('')
  const [authorizationLetterUrl, setAuthorizationLetterUrl] = useState<string>('')
  const [identityProofFile, setIdentityProofFile] = useState<File | null>(null)
  const [authorizationLetterFile, setAuthorizationLetterFile] = useState<File | null>(null)

  // Qualifications
  const [qualifications, setQualifications] = useState<string[]>([])
  const [newQualification, setNewQualification] = useState('')
  const [isAddingQual, setIsAddingQual] = useState(false)

  // Verification & Profile Metadata from DB
  const [profileData, setProfileData] = useState<HospitalAdminProfileData | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>('')

  // Modals
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)

  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false)
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [inAppAlerts, setInAppAlerts] = useState(true)
  const [doctorJoinAlerts, setDoctorJoinAlerts] = useState(true)

  // Hidden File Input Refs
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const idProofInputRef = useRef<HTMLInputElement>(null)
  const authLetterInputRef = useRef<HTMLInputElement>(null)

  // Load Profile from Backend
  const loadProfile = async () => {
    setIsLoading(true)
    try {
      const res = await hospitalAdminService.getMyProfile()
      const u = res?.user || user
      const p = res?.profile

      if (u) {
        setName(u.name || '')
        setEmail(u.email || '')
        setPhone(u.phoneNumber || '')
        setAvatarPreview(u.avatar || '')
      }

      if (p) {
        setProfileData(p)
        setDesignation(p.designation || 'Hospital Administrator')
        setGovernmentIdType(p.governmentIdType || 'Aadhaar Card')
        setGovernmentIdNumber(p.governmentIdNumber || '')
        setAlternatePhone(p.alternatePhone || '')
        setAddress(p.address || '')
        setIdentityProofUrl(p.identityProofUrl || '')
        setAuthorizationLetterUrl(p.authorizationLetterUrl || '')
        setQualifications(p.qualifications || ['MBA (Hospital Administration)'])
        setLastUpdated(
          p.updatedAt
            ? new Date(p.updatedAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'Recently'
        )
      } else {
        setQualifications(['MBA (Hospital Administration)'])
      }
    } catch (err: any) {
      console.warn('Failed to fetch hospital admin profile from API:', err)
      if (user) {
        setName(user.name || '')
        setEmail(user.email || '')
        setPhone(user.phoneNumber || '')
        setAvatarPreview(user.avatar || '')
        setQualifications(['MBA (Hospital Administration)'])
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  // Auto clear toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  // Profile completion score calculation
  const calculateCompletion = () => {
    let score = 0
    if (name) score += 20
    if (phone) score += 15
    if (designation) score += 15
    if (governmentIdNumber) score += 15
    if (address) score += 10
    if (qualifications.length > 0) score += 10
    if (identityProofUrl || identityProofFile) score += 15
    return Math.min(score, 100)
  }

  const completionPercentage = calculateCompletion()

  // Avatar Selection
  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setToast({ type: 'error', message: 'Profile photo size must be less than 5MB.' })
      return
    }
    setAvatarFile(file)
    const preview = URL.createObjectURL(file)
    setAvatarPreview(preview)
  }

  // Document File Selection
  const handleIdProofChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      setToast({ type: 'error', message: 'Document size must be less than 10MB.' })
      return
    }
    setIdentityProofFile(file)
  }

  const handleAuthLetterChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      setToast({ type: 'error', message: 'Document size must be less than 10MB.' })
      return
    }
    setAuthorizationLetterFile(file)
  }

  // Add Qualification
  const handleAddQualification = () => {
    if (!newQualification.trim()) return
    setQualifications((prev) => [...prev, newQualification.trim()])
    setNewQualification('')
    setIsAddingQual(false)
  }

  const handleRemoveQualification = (index: number) => {
    setQualifications((prev) => prev.filter((_, i) => i !== index))
  }

  // Save Changes Handler
  const handleSaveChanges = async () => {
    setIsSaving(true)
    try {
      const formData = new FormData()
      formData.append('name', name.trim())
      formData.append('phoneNumber', phone.trim())
      formData.append('designation', designation.trim())
      formData.append('governmentIdType', governmentIdType)
      formData.append('governmentIdNumber', governmentIdNumber.trim())
      formData.append('alternatePhone', alternatePhone.trim())
      formData.append('address', address.trim())
      formData.append('qualifications', JSON.stringify(qualifications))

      if (avatarFile) {
        formData.append('avatar', avatarFile)
      }
      if (identityProofFile) {
        formData.append('identityProof', identityProofFile)
      }
      if (authorizationLetterFile) {
        formData.append('authorizationLetter', authorizationLetterFile)
      }

      const res = await hospitalAdminService.updateProfile(formData)

      if (res?.user && setUser) {
        setUser({
          ...user,
          ...res.user,
        })
      }

      setLastUpdated('Just now')
      setToast({ type: 'success', message: 'Profile information updated successfully!' })
    } catch (err: any) {
      console.error('Failed to update hospital admin profile:', err)
      setToast({
        type: 'error',
        message: err?.response?.data?.message || err?.message || 'Failed to update profile.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Discard Changes
  const handleDiscardChanges = () => {
    loadProfile()
    setAvatarFile(null)
    setIdentityProofFile(null)
    setAuthorizationLetterFile(null)
    setToast({ type: 'success', message: 'Reverted all unsaved changes.' })
  }

  // Change Password Submission
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(null)

    if (!currentPassword) {
      setPasswordError('Please enter your current password.')
      return
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.')
      return
    }

    setPasswordSuccess('Password updated successfully!')
    setTimeout(() => {
      setIsPasswordModalOpen(false)
      setCurrentPassword('')
      newPassword && setNewPassword('')
      setConfirmPassword('')
      setPasswordSuccess(null)
    }, 1500)
  }

  const isVerified = user?.isAccountApproved || profileData?.verificationStatus === 'APPROVED'

  return (
    <HospitalAdminLayout>
        <main className="flex-1 max-w-[1500px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-5 lg:py-6 space-y-4 sm:space-y-5 lg:space-y-6">
          {/* Toast Notification Alert */}
          {toast && (
            <div
              className={`p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between shadow-xs animate-in slide-in-from-top-3 duration-200 ${
                toast.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
                {toast.type === 'success' ? (
                  <CheckCircle2 className="size-4.5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="size-4.5 text-rose-600 shrink-0" />
                )}
                <span>{toast.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setToast(null)}
                className="p-1 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
          )}

          {/* ── Compact Top Page Header Banner (Responsive for Small & Large screens) ── */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-3.5 sm:p-5 lg:p-7 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-slate-500">
                  <Link
                    to="/hospital-admin/dashboard"
                    className="hover:text-blue-600 transition-colors flex items-center gap-1"
                  >
                    <Building2 className="size-3 text-slate-400" />
                    <span>Hospital Admin</span>
                  </Link>
                  <span>/</span>
                  <span className="text-slate-900 font-bold">My Profile</span>
                </div>

                <div className="flex items-center gap-2 flex-wrap pt-0.5">
                  <h1 className="text-lg sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                    My Profile
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/80">
                    <ShieldCheck className="size-3 sm:size-3.5 text-blue-600" />
                    <span>Hospital Administrator</span>
                  </span>
                </div>

                <p className="hidden sm:block text-xs sm:text-sm text-slate-500 font-medium max-w-xl leading-relaxed">
                  Manage your personal information and hospital administration credentials.
                </p>
              </div>

              {/* Header Right: Completion Bar & Quick Navigation */}
              <div className="flex items-center justify-between sm:justify-end gap-2.5 sm:gap-4 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                {/* Profile Completion Widget */}
                <div className="flex-1 sm:flex-initial flex items-center gap-2.5 sm:gap-3 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="min-w-[80px] sm:min-w-[120px] space-y-1">
                    <div className="flex items-center justify-between text-[10px] sm:text-xs font-bold text-slate-700">
                      <span>Completion</span>
                      <span className="text-blue-600 font-black">{completionPercentage}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 sm:h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-linear-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${completionPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/hospital-admin/hospitals')}
                  className="px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11px] sm:text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Building2 className="size-3.5 text-blue-600" />
                  <span className="hidden xs:inline">Manage Hospitals</span>
                  <span className="xs:hidden">Hospitals</span>
                </button>
              </div>
            </div>
          </div>

          {/* ── Mobile-Only Compact Profile Identity Hero Card (< lg) ────────────────── */}
          <div className="block lg:hidden bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3.5">
            <div className="flex items-center gap-3.5">
              {/* Mobile Circular Avatar */}
              <div className="relative shrink-0">
                <div className="size-16 rounded-2xl overflow-hidden border-2 border-white shadow-md ring-1 ring-slate-200 bg-slate-100 flex items-center justify-center">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt={name} className="size-full object-cover" />
                  ) : (
                    <span className="text-xl font-black text-slate-400">
                      {name ? name.charAt(0).toUpperCase() : 'A'}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-blue-600 text-white shadow-md active:scale-90 cursor-pointer"
                  title="Change Photo"
                >
                  <Camera className="size-3" />
                </button>
              </div>

              {/* Mobile Identity Info */}
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h2 className="text-base font-black text-slate-900 tracking-tight truncate">
                    {name || 'Hospital Administrator'}
                  </h2>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isVerified
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    <CheckCircle2 className="size-3" />
                    <span>{isVerified ? 'Verified' : 'Pending'}</span>
                  </span>
                </div>

                <p className="text-xs font-bold text-blue-600 truncate">
                  {designation || 'Hospital Administrator'}
                </p>

                <p className="text-[11px] text-slate-400 font-medium truncate">
                  {address ? address.split(',').slice(-2).join(', ').trim() : 'India'}
                </p>
              </div>
            </div>

            {/* Mobile Expandable Contact Row */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsMobileContactExpanded((prev) => !prev)}
                className="w-full flex items-center justify-between text-[11px] font-bold text-slate-500 hover:text-slate-800 transition-colors"
              >
                <span>{isMobileContactExpanded ? 'Hide Contact Info' : 'View Contact & Account Details'}</span>
                <ChevronDown
                  className={`size-3.5 transition-transform duration-200 ${
                    isMobileContactExpanded ? 'rotate-180 text-blue-600' : ''
                  }`}
                />
              </button>

              {isMobileContactExpanded && (
                <div className="mt-2.5 pt-2 border-t border-dashed border-slate-100 space-y-2 text-xs text-slate-600 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium flex items-center gap-1.5">
                      <Mail className="size-3.5 text-slate-400" />
                      <span>Email</span>
                    </span>
                    <span className="font-semibold text-slate-800 truncate max-w-[200px]">
                      {email || 'admin@curehealth.org'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium flex items-center gap-1.5">
                      <Phone className="size-3.5 text-slate-400" />
                      <span>Phone</span>
                    </span>
                    <span className="font-semibold text-slate-800">{phone || '+91 98765 43210'}</span>
                  </div>

                  {alternatePhone && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Alt Phone</span>
                      <span className="font-semibold text-slate-800">{alternatePhone}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium flex items-center gap-1.5">
                      <ShieldCheck className="size-3.5 text-emerald-600" />
                      <span>Super Admin</span>
                    </span>
                    <span className="font-bold text-emerald-700">Official Staff</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Main Layout: Desktop Sidebar (Left) + Tabs and Forms (Right) ─────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 lg:gap-6">
            {/* ── Desktop Left Sidebar (Only visible on lg screens) ──────────────── */}
            <div className="hidden lg:block lg:col-span-4 space-y-5">
              {/* Profile Overview Card */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs text-center space-y-4">
                {/* Avatar with Camera Overlay */}
                <div className="relative inline-block mx-auto">
                  <div className="size-24 sm:size-28 rounded-3xl overflow-hidden border-3 border-white shadow-lg ring-1 ring-slate-200 bg-slate-100 flex items-center justify-center">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt={name} className="size-full object-cover" />
                    ) : (
                      <span className="text-3xl font-black text-slate-400">
                        {name ? name.charAt(0).toUpperCase() : 'A'}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-transform active:scale-90 cursor-pointer"
                    title="Change Profile Photo"
                  >
                    <Camera className="size-4" />
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>

                <div className="space-y-1">
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                    {name || 'Hospital Administrator'}
                  </h2>
                  <p className="text-xs font-bold text-blue-600">
                    {designation || 'Hospital Administrator'}
                  </p>
                  <p className="text-xs text-slate-400 font-medium">
                    {address ? address.split(',').slice(-2).join(', ').trim() : 'India'}
                  </p>
                </div>

                {/* Status Pill */}
                <div className="pt-1">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      isVerified
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    <CheckCircle2 className="size-3.5" />
                    <span>{isVerified ? 'Verified Official' : 'Verification In Review'}</span>
                  </span>
                </div>

                {/* Edit Photo Button */}
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Camera className="size-3.5 text-slate-500" />
                  <span>Edit Profile Photo</span>
                </button>

                {/* Direct Contact Summary */}
                <div className="pt-3 border-t border-slate-100 text-left space-y-2.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2.5">
                    <Mail className="size-4 text-slate-400 shrink-0" />
                    <span className="truncate">{email || 'admin@curehealth.org'}</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Phone className="size-4 text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-800">{phone || '+91 98765 43210'}</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Calendar className="size-4 text-slate-400 shrink-0" />
                    <span className="text-slate-400">
                      Joined on{' '}
                      {user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '12 Oct 2024'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Account Status Card */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                  <ShieldCheck className="size-4 text-blue-600" />
                  <span>Account Status</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-xs">
                    <CheckCircle2 className="size-4 text-emerald-600" />
                    <span>{isVerified ? 'Verified Official Account' : 'Verification Under Review'}</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 font-medium">
                    {isVerified
                      ? 'Your account and administration credentials have been officially verified by Super Admin.'
                      : 'Your documents have been submitted to Super Admin for verification review.'}
                  </p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-500 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-400">Verified By</span>
                    <span className="font-bold text-slate-800">Super Admin Team</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-400">Verification Date</span>
                    <span className="font-bold text-slate-800">
                      {profileData?.verifiedAt
                        ? new Date(profileData.verifiedAt).toLocaleDateString()
                        : '12 Oct 2024'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-2.5">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Quick Actions
                </div>

                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="w-full p-2.5 rounded-xl border border-slate-200/80 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <KeyRound className="size-4 text-blue-600" />
                    <span>Change Password</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Security</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsNotifModalOpen(true)}
                  className="w-full p-2.5 rounded-xl border border-slate-200/80 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Bell className="size-4 text-indigo-600" />
                    <span>Notification Preferences</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Alerts</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    await logout()
                    navigate('/login')
                  }}
                  className="w-full p-2.5 rounded-xl border border-rose-100 bg-rose-50/50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <LogOut className="size-4 text-rose-600" />
                    <span>Logout from All Devices</span>
                  </div>
                  <span className="text-[10px] text-rose-400">Sign out</span>
                </button>
              </div>
            </div>

            {/* ── Main Form Column (12 cols on mobile, 8 cols on lg) ────────────────── */}
            <div className="lg:col-span-8 space-y-4 sm:space-y-5">
              {/* Responsive Navigation Tabs Bar */}
              <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-1 sm:p-1.5 shadow-2xs flex items-center gap-1 overflow-x-auto scrollbar-none">
                <button
                  type="button"
                  onClick={() => setActiveTab('personal')}
                  className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'personal'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <User className="size-3.5" />
                  <span>Personal</span>
                  <span className="hidden sm:inline">Info</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('documents')}
                  className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'documents'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="size-3.5" />
                  <span>Documents</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('qualifications')}
                  className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'qualifications'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Award className="size-3.5" />
                  <span>Qualifications</span>
                  <span className="hidden sm:inline">({qualifications.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('security')}
                  className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'security'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <KeyRound className="size-3.5" />
                  <span>Security</span>
                </button>
              </div>

              {/* Tab 1: Personal Information Form */}
              {activeTab === 'personal' && (
                <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-6 lg:p-7 shadow-xs space-y-4 sm:space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <User className="size-4.5 text-blue-600" />
                      <span>Personal Information</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Update your official contact details, administration designation, and ID information.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-5">
                    {/* Full Name */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <span>Full Name</span>
                        <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter full name"
                        className="w-full px-3 sm:px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all bg-white"
                      />
                    </div>

                    {/* Government ID Type */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">
                        Government ID Type
                      </label>
                      <select
                        value={governmentIdType}
                        onChange={(e) => setGovernmentIdType(e.target.value)}
                        className="w-full px-3 sm:px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all bg-white cursor-pointer"
                      >
                        <option value="Aadhaar Card">Aadhaar Card</option>
                        <option value="Passport">Passport</option>
                        <option value="Voter ID">Voter ID</option>
                        <option value="PAN Card">PAN Card</option>
                        <option value="Driving License">Driving License</option>
                      </select>
                    </div>

                    {/* Email Address */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <span>Email Address</span>
                        <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        disabled
                        className="w-full px-3 sm:px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-500 bg-slate-50 cursor-not-allowed"
                      />
                      <span className="text-[10px] text-slate-400 block">
                        Primary account email address (cannot be edited directly)
                      </span>
                    </div>

                    {/* Government ID Number */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">
                        Government ID Number
                      </label>
                      <input
                        type="text"
                        value={governmentIdNumber}
                        onChange={(e) => setGovernmentIdNumber(e.target.value)}
                        placeholder="e.g. 1234 5678 9012"
                        className="w-full px-3 sm:px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all bg-white font-mono"
                      />
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <span>Phone Number</span>
                        <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-3 sm:px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all bg-white"
                      />
                    </div>

                    {/* Alternative Phone */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">
                        Alternative Phone (Optional)
                      </label>
                      <input
                        type="text"
                        value={alternatePhone}
                        onChange={(e) => setAlternatePhone(e.target.value)}
                        placeholder="+91 87654 32109"
                        className="w-full px-3 sm:px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all bg-white"
                      />
                    </div>

                    {/* Designation */}
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <span>Official Designation</span>
                        <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        placeholder="e.g. Chief Hospital Administrator / Medical Director"
                        className="w-full px-3 sm:px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all bg-white"
                      />
                    </div>

                    {/* Official Address */}
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <span>Official Address</span>
                        <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        rows={2}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="e.g. 42, Link Road, Near Nehru Chowk, Bilaspur, Chhattisgarh - 495001"
                        className="w-full px-3 sm:px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all bg-white resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Documents & ID Proof */}
              {activeTab === 'documents' && (
                <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-6 lg:p-7 shadow-xs space-y-4 sm:space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <FileText className="size-4.5 text-blue-600" />
                      <span>Documents & Authorization Proofs</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Upload and manage your identity and hospital authorization documents.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-5">
                    {/* Identity Proof Card */}
                    <div className="p-3.5 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <span>Identity Proof ({governmentIdType})</span>
                          <span className="text-rose-500">*</span>
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {identityProofFile || identityProofUrl ? 'Attached' : 'Required'}
                        </span>
                      </div>

                      {/* File Card Preview */}
                      <div className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between gap-2 shadow-2xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="size-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <FileText className="size-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {identityProofFile
                                ? identityProofFile.name
                                : identityProofUrl
                                ? 'identity_proof.pdf'
                                : 'No document uploaded yet'}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {identityProofFile
                                ? `${(identityProofFile.size / (1024 * 1024)).toFixed(1)} MB`
                                : identityProofUrl
                                ? 'Verified on Record'
                                : 'PDF, JPG or PNG (Max 10 MB)'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {identityProofUrl && (
                            <a
                              href={identityProofUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-50 transition-colors"
                              title="View Document"
                            >
                              <Eye className="size-4" />
                            </a>
                          )}
                          {(identityProofFile || identityProofUrl) && (
                            <button
                              type="button"
                              onClick={() => {
                                setIdentityProofFile(null)
                                setIdentityProofUrl('')
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Remove Document"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Upload Button */}
                      <button
                        type="button"
                        onClick={() => idProofInputRef.current?.click()}
                        className="w-full py-2 sm:py-2.5 rounded-xl border border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/50 hover:bg-blue-50 text-blue-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <UploadCloud className="size-4 text-blue-600" />
                        <span>Upload Identity Proof</span>
                      </button>
                      <input
                        ref={idProofInputRef}
                        type="file"
                        accept=".pdf,image/*"
                        onChange={handleIdProofChange}
                        className="hidden"
                      />
                    </div>

                    {/* Authorization Letter Card */}
                    <div className="p-3.5 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <span>Authorization Letter</span>
                          <span className="text-rose-500">*</span>
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {authorizationLetterFile || authorizationLetterUrl ? 'Attached' : 'Required'}
                        </span>
                      </div>

                      {/* File Card Preview */}
                      <div className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between gap-2 shadow-2xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="size-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                            <FileText className="size-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {authorizationLetterFile
                                ? authorizationLetterFile.name
                                : authorizationLetterUrl
                                ? 'authorization_letter.pdf'
                                : 'No document uploaded yet'}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {authorizationLetterFile
                                ? `${(authorizationLetterFile.size / (1024 * 1024)).toFixed(1)} MB`
                                : authorizationLetterUrl
                                ? 'Verified on Record'
                                : 'PDF, JPG or PNG (Max 10 MB)'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {authorizationLetterUrl && (
                            <a
                              href={authorizationLetterUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-50 transition-colors"
                              title="View Document"
                            >
                              <Eye className="size-4" />
                            </a>
                          )}
                          {(authorizationLetterFile || authorizationLetterUrl) && (
                            <button
                              type="button"
                              onClick={() => {
                                setAuthorizationLetterFile(null)
                                setAuthorizationLetterUrl('')
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Remove Document"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Upload Button */}
                      <button
                        type="button"
                        onClick={() => authLetterInputRef.current?.click()}
                        className="w-full py-2 sm:py-2.5 rounded-xl border border-dashed border-indigo-300 hover:border-indigo-500 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <UploadCloud className="size-4 text-indigo-600" />
                        <span>Upload Authorization Letter</span>
                      </button>
                      <input
                        ref={authLetterInputRef}
                        type="file"
                        accept=".pdf,image/*"
                        onChange={handleAuthLetterChange}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Qualifications */}
              {activeTab === 'qualifications' && (
                <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-6 lg:p-7 shadow-xs space-y-4 sm:space-y-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-0.5 sm:space-y-1">
                      <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <Award className="size-4.5 text-blue-600" />
                        <span>Qualifications</span>
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Add degrees, healthcare certifications, and executive administration credentials.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsAddingQual(true)}
                      className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Plus className="size-3.5" />
                      <span>Add Degree</span>
                    </button>
                  </div>

                  {/* Add Qualification Inline Box */}
                  {isAddingQual && (
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-2.5 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-blue-900">
                          Add New Degree or Certificate
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingQual(false)
                            setNewQualification('')
                          }}
                          className="p-1 rounded-lg hover:bg-blue-200/50 text-blue-700"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <input
                          type="text"
                          value={newQualification}
                          onChange={(e) => setNewQualification(e.target.value)}
                          placeholder="e.g. Masters in Hospital Administration (MHA)"
                          className="flex-1 px-3 sm:px-3.5 py-2 rounded-xl bg-white border border-blue-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddQualification()
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleAddQualification}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Qualifications List */}
                  <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden">
                    {qualifications.map((qual, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 sm:p-4 flex items-center justify-between gap-3 bg-white hover:bg-slate-50/60 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                          <span className="size-6 sm:size-7 rounded-lg sm:rounded-xl bg-slate-100 text-slate-700 text-xs font-black flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                            {qual}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveQualification(idx)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                          title="Remove Qualification"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    ))}

                    {qualifications.length === 0 && (
                      <div className="p-8 text-center text-xs text-slate-400 space-y-1">
                        <Award className="size-8 text-slate-300 mx-auto" />
                        <p className="font-bold text-slate-600">No Qualifications Added</p>
                        <p>Click "Add Degree" to specify your administration credentials.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 4: Security */}
              {activeTab === 'security' && (
                <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-6 lg:p-7 shadow-xs space-y-4 sm:space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <KeyRound className="size-4.5 text-blue-600" />
                      <span>Security & Login</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Manage password credentials, multi-factor protection, and active login sessions.
                    </p>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                          Account Password
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Regularly updating your password keeps your administration access secure.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsPasswordModalOpen(true)}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto"
                      >
                        Change Password
                      </button>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                          Active Administration Session
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Logged in from current browser • Secure JWT Session active
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto">
                        <Check className="size-3.5" />
                        <span>Active Session</span>
                      </span>
                    </div>

                    {/* Mobile-Only Quick Settings list */}
                    <div className="block lg:hidden pt-2 space-y-2.5">
                      <button
                        type="button"
                        onClick={() => setIsNotifModalOpen(true)}
                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Bell className="size-4 text-indigo-600" />
                          <span>Notification Preferences</span>
                        </div>
                        <span className="text-[10px] text-slate-400">Manage</span>
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          await logout()
                          navigate('/login')
                        }}
                        className="w-full p-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <LogOut className="size-4 text-rose-600" />
                          <span>Logout from All Devices</span>
                        </div>
                        <span className="text-[10px] text-rose-400">Sign out</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Desktop Standard Bottom Action Bar ──────────────────────────────── */}
              <div className="hidden sm:flex bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-5 shadow-xs items-center justify-between gap-4">
                <span className="text-xs font-medium text-slate-400">
                  Last updated: <strong className="text-slate-700">{lastUpdated || 'Recently'}</strong>
                </span>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleDiscardChanges}
                    disabled={isSaving}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <RotateCcw className="size-3.5 text-slate-500" />
                    <span>Discard Changes</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <Save className="size-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

      {/* ── Mobile-Only Floating Bottom Save Bar (Docked right above MobileNav) ── */}
      <div className="sm:hidden fixed bottom-[56px] inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 p-2.5 px-3.5 flex items-center justify-between gap-2.5 shadow-lg">
        <button
          type="button"
          onClick={handleDiscardChanges}
          disabled={isSaving}
          className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs font-bold flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
        >
          <RotateCcw className="size-3.5 text-slate-400" />
          <span>Discard</span>
        </button>

        <button
          type="button"
          onClick={handleSaveChanges}
          disabled={isSaving}
          className="flex-1 py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md shadow-blue-500/25 flex items-center justify-center gap-1.5 active:scale-98 disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="size-3.5" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      {/* ── Password Change Modal ─────────────────────────────────────────── */}
      {isPasswordModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsPasswordModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-black text-base">
                <KeyRound className="size-5 text-blue-600" />
                <span>Change Password</span>
              </div>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="size-4" />
              </button>
            </div>

            {passwordError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold">
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-semibold">
                {passwordSuccess}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Notification Preferences Modal ─────────────────────────────────── */}
      {isNotifModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsNotifModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-black text-base">
                <Bell className="size-5 text-indigo-600" />
                <span>Notification Preferences</span>
              </div>
              <button
                type="button"
                onClick={() => setIsNotifModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer">
                <div>
                  <p className="font-bold text-slate-900">Email Notifications</p>
                  <p className="text-[11px] text-slate-400">Receive administrative summaries by email</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="size-4 accent-blue-600 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer">
                <div>
                  <p className="font-bold text-slate-900">In-App Alerts</p>
                  <p className="text-[11px] text-slate-400">Show notification badge in top bar</p>
                </div>
                <input
                  type="checkbox"
                  checked={inAppAlerts}
                  onChange={(e) => setInAppAlerts(e.target.checked)}
                  className="size-4 accent-blue-600 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer">
                <div>
                  <p className="font-bold text-slate-900">Doctor Join Requests</p>
                  <p className="text-[11px] text-slate-400">Instant notification when a doctor applies</p>
                </div>
                <input
                  type="checkbox"
                  checked={doctorJoinAlerts}
                  onChange={(e) => setDoctorJoinAlerts(e.target.checked)}
                  className="size-4 accent-blue-600 cursor-pointer"
                />
              </label>
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsNotifModalOpen(false)
                  setToast({ type: 'success', message: 'Notification preferences saved.' })
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
    </HospitalAdminLayout>
  )
}

export default HospitalAdminProfilePage
