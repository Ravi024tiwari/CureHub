import { useState, useEffect, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Save,
  Send,
  AlertTriangle,
  Loader2,
  X,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { doctorService, type DoctorExperience } from '@/services/doctorService'
import { uploadService } from '@/services/uploadService'
import { DoctorPortalSidebar } from '@/components/doctor/verification/DoctorPortalSidebar'
import { DoctorVerificationHeader } from '@/components/doctor/verification/DoctorVerificationHeader'
import { DoctorLivePreviewCard } from '@/components/doctor/verification/DoctorLivePreviewCard'
import { DoctorVerificationStatusCard } from '@/components/doctor/verification/DoctorVerificationStatusCard'
import { DoctorBasicInfoSection } from '@/components/doctor/verification/DoctorBasicInfoSection'
import { DoctorQualificationsSection } from '@/components/doctor/verification/DoctorQualificationsSection'
import { DoctorExperienceSection } from '@/components/doctor/verification/DoctorExperienceSection'
import { DoctorDocumentsSection } from '@/components/doctor/verification/DoctorDocumentsSection'

export const DoctorVerificationOnboardingPage: FC = () => {
  const navigate = useNavigate()
  const { user, logout, fetchMe } = useAuthStore()

  // Loading & Action states
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Doctor Form State
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [avatar, setAvatar] = useState('')
  const [department, setDepartment] = useState('')
  const [specializations, setSpecializations] = useState<string[]>([])
  const [qualifications, setQualifications] = useState<string[]>([])
  const [experienceYears, setExperienceYears] = useState<number>(0)
  const [experiences, setExperiences] = useState<DoctorExperience[]>([])
  const [consultationFee, setConsultationFee] = useState<number>(500)
  const [bio, setBio] = useState('')
  const [medicalCouncilRegistrationNumber, setMedicalCouncilRegistrationNumber] = useState('')
  const [licenseDocumentUrl, setLicenseDocumentUrl] = useState('')
  const [verificationStatus, setVerificationStatus] = useState<
    'INCOMPLETE' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
  >('INCOMPLETE')
  const [rejectionReason, setRejectionReason] = useState('')

  // Load doctor profile on mount
  useEffect(() => {
    let isMounted = true

    const loadProfile = async () => {
      try {
        setIsLoading(true)
        const docProfile = await doctorService.getMyDoctorProfile()

        if (!isMounted) return

        if (docProfile) {
          setName(docProfile.userId?.name || user?.name || '')
          setEmail(docProfile.userId?.email || user?.email || '')
          setPhoneNumber(docProfile.userId?.phoneNumber || '')
          setAvatar(docProfile.userId?.avatar || '')
          setDepartment(docProfile.department || '')
          setSpecializations(docProfile.specialization || [])
          setQualifications(docProfile.qualifications || [])
          setExperienceYears(docProfile.experienceYears || 0)
          setExperiences(docProfile.experiences || [])
          setConsultationFee(docProfile.consultationFee ?? 500)
          setBio(docProfile.bio || '')
          setMedicalCouncilRegistrationNumber(docProfile.medicalCouncilRegistrationNumber || '')
          setLicenseDocumentUrl(docProfile.licenseDocumentUrl || '')
          setVerificationStatus(docProfile.verificationStatus || 'INCOMPLETE')
          setRejectionReason(docProfile.rejectionReason || '')
        }
      } catch (err: any) {
        console.error('Failed to load doctor profile:', err)
        // Fallback to basic auth store user if profile request fails
        if (user) {
          setName(user.name || '')
          setEmail(user.email || '')
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadProfile()

    return () => {
      isMounted = false
    }
  }, [user])

  // Sync verification status when real-time socket approval arrives
  useEffect(() => {
    if (user?.isAccountApproved) {
      setVerificationStatus('APPROVED')
    }
  }, [user?.isAccountApproved])

  // Checklist computation
  const checklist = {
    basicInfo: Boolean(department.trim() && consultationFee > 0 && experienceYears >= 0),
    qualifications: qualifications.length > 0,
    experience: experiences.length > 0,
    documents: Boolean(medicalCouncilRegistrationNumber.trim() && licenseDocumentUrl.trim()),
  }

  // Handle Avatar Upload
  const handleAvatarUpload = async (file: File) => {
    setIsUploadingAvatar(true)
    try {
      const result = await uploadService.uploadTempFile(file, 'avatars/doctors')
      if (result?.url) {
        setAvatar(result.url)
        // Auto-save avatar
        await doctorService.updateDoctorProfile({ avatar: result.url })
        setFeedback({
          type: 'success',
          message: 'Profile photo updated successfully!',
        })
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to upload photo.',
      })
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  // Save Draft (No validation required, isSubmit: false)
  const handleSaveDraft = async () => {
    setIsSavingDraft(true)
    setFeedback(null)

    try {
      const updated = await doctorService.updateDoctorProfile({
        name,
        phoneNumber,
        avatar,
        department,
        specialization: specializations,
        qualifications,
        experienceYears,
        experiences,
        consultationFee,
        bio,
        medicalCouncilRegistrationNumber,
        licenseDocumentUrl,
        isSubmit: false,
      })

      if (updated) {
        setVerificationStatus(updated.verificationStatus)
        setFeedback({
          type: 'success',
          message: 'Draft profile saved successfully. You can continue anytime.',
        })
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Error saving draft profile.',
      })
    } finally {
      setIsSavingDraft(false)
    }
  }

  // Submit for Super Admin Verification (isSubmit: true)
  const handleSubmitForVerification = async () => {
    // 1. Client-side Pre-Validation Check
    const missing: string[] = []
    if (!department.trim()) missing.push('Department')
    if (!medicalCouncilRegistrationNumber.trim()) missing.push('Medical Council Registration Number')
    if (!licenseDocumentUrl.trim()) missing.push('License / Degree Certificate Document')
    if (qualifications.length === 0) missing.push('At least one Qualification / Degree')
    if (specializations.length === 0) missing.push('At least one Specialization')
    if (consultationFee === undefined || consultationFee < 0) missing.push('Consultation Fee')

    if (missing.length > 0) {
      setFeedback({
        type: 'error',
        message: `Please complete required fields before submitting: ${missing.join(', ')}`,
      })
      setShowSubmitModal(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setIsSubmitting(true)
    setFeedback(null)

    try {
      const updated = await doctorService.updateDoctorProfile({
        name,
        phoneNumber,
        avatar,
        department,
        specialization: specializations,
        qualifications,
        experienceYears,
        experiences,
        consultationFee,
        bio,
        medicalCouncilRegistrationNumber,
        licenseDocumentUrl,
        isSubmit: true,
      })

      if (updated) {
        setVerificationStatus(updated.verificationStatus)
        setRejectionReason('')
        setShowSubmitModal(false)
        setFeedback({
          type: 'success',
          message:
            'Profile submitted successfully! Your application is now in the Super Admin verification queue.',
        })
        await fetchMe()
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } catch (err: any) {
      setShowSubmitModal(false)
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to submit profile for verification.',
      })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fbff] flex flex-col items-center justify-center gap-3">
        <Loader2 className="size-10 animate-spin text-blue-600" />
        <p className="text-sm font-semibold text-slate-600">Loading your doctor portal...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fbff] text-slate-900 flex flex-col antialiased">
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <DoctorPortalSidebar />
        </div>

        {/* Mobile Sliding Drawer Sidebar */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative w-72 max-w-[80vw] h-full bg-white z-10 shadow-2xl flex flex-col">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="size-5" />
              </button>
              <DoctorPortalSidebar onCloseMobile={() => setIsMobileMenuOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Header */}
          <DoctorVerificationHeader
            doctorName={name || 'Doctor'}
            verificationStatus={verificationStatus}
            avatarUrl={avatar}
            onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
            onLogout={handleLogout}
          />

          {/* Page Body */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* Feedback Alert Toast */}
            {feedback && (
              <div
                className={`p-4 rounded-2xl border flex items-start gap-3 transition-all ${
                  feedback.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="size-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="size-5 text-rose-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 text-xs sm:text-sm font-medium leading-relaxed">
                  {feedback.message}
                </div>
                <button
                  type="button"
                  onClick={() => setFeedback(null)}
                  className="text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="size-4" />
                </button>
              </div>
            )}

            {/* If Under Review, display prominent info banner */}
            {verificationStatus === 'PENDING' && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-600 text-white shadow-lg shadow-blue-500/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="size-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0">
                    <Clock className="size-6 text-white animate-spin-slow" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold">Profile Submitted & Under Review</h2>
                    <p className="text-xs text-blue-100 max-w-xl">
                      Your details and medical license proof are currently being reviewed by the Super Admin. You will receive access to clinical tools once verified.
                    </p>
                  </div>
                </div>

                <div className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold self-end sm:self-center border border-white/30">
                  Estimated: 24–48 Hours
                </div>
              </div>
            )}

            {/* If Rejected, display reason and prompt */}
            {verificationStatus === 'REJECTED' && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-lg shadow-rose-600/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="size-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="size-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold">Action Required: Application Returned</h2>
                    <p className="text-xs text-rose-100 max-w-xl">
                      {rejectionReason
                        ? `Admin Remarks: "${rejectionReason}"`
                        : 'Your profile requires updates. Please fix the highlighted issues and re-submit for approval.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 400, behavior: 'smooth' })}
                  className="px-4 py-2 rounded-xl bg-white text-rose-700 font-bold text-xs hover:bg-rose-50 transition-colors shadow-xs"
                >
                  Review & Fix
                </button>
              </div>
            )}

            {/* Main 2-Column Responsive Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Form Sections (lg:col-span-8) */}
              <div className="lg:col-span-8 space-y-6">
                {/* 1. Basic & Professional Information */}
                <DoctorBasicInfoSection
                  name={name}
                  email={email}
                  phoneNumber={phoneNumber}
                  department={department}
                  specializations={specializations}
                  consultationFee={consultationFee}
                  experienceYears={experienceYears}
                  bio={bio}
                  onChange={(fields) => {
                    if (fields.name !== undefined) setName(fields.name)
                    if (fields.phoneNumber !== undefined) setPhoneNumber(fields.phoneNumber)
                    if (fields.department !== undefined) setDepartment(fields.department)
                    if (fields.specializations !== undefined) setSpecializations(fields.specializations)
                    if (fields.consultationFee !== undefined) setConsultationFee(fields.consultationFee)
                    if (fields.experienceYears !== undefined) setExperienceYears(fields.experienceYears)
                    if (fields.bio !== undefined) setBio(fields.bio)
                  }}
                />

                {/* 2. Qualifications */}
                <DoctorQualificationsSection
                  qualifications={qualifications}
                  onChange={setQualifications}
                />

                {/* 3. Professional Experience */}
                <DoctorExperienceSection
                  experiences={experiences}
                  onChange={setExperiences}
                />

                {/* 4. Documents & Medical Council Number */}
                <DoctorDocumentsSection
                  medicalCouncilRegistrationNumber={medicalCouncilRegistrationNumber}
                  licenseDocumentUrl={licenseDocumentUrl}
                  onChange={(fields) => {
                    if (fields.medicalCouncilRegistrationNumber !== undefined) {
                      setMedicalCouncilRegistrationNumber(fields.medicalCouncilRegistrationNumber)
                    }
                    if (fields.licenseDocumentUrl !== undefined) {
                      setLicenseDocumentUrl(fields.licenseDocumentUrl)
                    }
                  }}
                />

                {/* Action Buttons Footer */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">
                    {verificationStatus === 'PENDING' ? (
                      <span className="text-blue-600 font-medium flex items-center gap-1.5">
                        <Clock className="size-4" />
                        Application is currently under Super Admin review.
                      </span>
                    ) : (
                      <span>
                        Save draft anytime or submit when all required sections are completed.
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* Save Draft */}
                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      disabled={isSavingDraft || isSubmitting || verificationStatus === 'PENDING'}
                      className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSavingDraft ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin text-slate-600" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="size-3.5" />
                          <span>Save Draft</span>
                        </>
                      )}
                    </button>

                    {/* Submit for Verification */}
                    <button
                      type="button"
                      onClick={() => setShowSubmitModal(true)}
                      disabled={isSubmitting || isSavingDraft || verificationStatus === 'PENDING'}
                      className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="size-4" />
                          <span>Submit for Verification</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Sticky Live Preview & Verification Checklist (lg:col-span-4) */}
              <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">
                {/* Live Profile Preview Card */}
                <DoctorLivePreviewCard
                  doctorName={name}
                  department={department}
                  experienceYears={experienceYears}
                  specializations={specializations}
                  consultationFee={consultationFee}
                  medicalCouncilRegistrationNumber={medicalCouncilRegistrationNumber}
                  avatarUrl={avatar}
                  onAvatarUpload={handleAvatarUpload}
                  isUploadingAvatar={isUploadingAvatar}
                />

                {/* Verification Status Card */}
                <DoctorVerificationStatusCard
                  status={verificationStatus}
                  rejectionReason={rejectionReason}
                  checklist={checklist}
                />
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Confirmation Modal Before Submission */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="size-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
              <ShieldCheck className="size-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Submit Profile for Super Admin Verification?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                By submitting, your profile details and license documents will be sent to the Super Admin review queue. You will be notified once verified.
              </p>
            </div>

            {/* Checklist summary in modal */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Department:</span>
                <span className="font-semibold text-slate-900">{department || 'Not selected'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Registration Number:</span>
                <span className="font-mono font-semibold text-slate-900">{medicalCouncilRegistrationNumber || 'Missing'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">License Document:</span>
                <span className={`font-semibold ${licenseDocumentUrl ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {licenseDocumentUrl ? 'Uploaded & Attached' : 'Missing'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Consultation Fee:</span>
                <span className="font-semibold text-slate-900">₹ {consultationFee}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Go Back & Edit
              </button>
              <button
                type="button"
                onClick={handleSubmitForVerification}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="size-3.5" />
                    <span>Confirm & Submit</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DoctorVerificationOnboardingPage
