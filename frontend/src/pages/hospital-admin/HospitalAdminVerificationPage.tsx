import { useState, useEffect, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Loader2,
  Building2,
  CheckCircle,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/store/toastStore'
import { hospitalAdminService } from '@/services/hospitalAdminService'
import {
  HospitalAdminPortalSidebar,
  HospitalAdminVerificationHeader,
  HospitalAdminHeroBanner,
  HospitalAdminStepper,
  HospitalAdminPersonalInfoSection,
  type PersonalInfoState,
  HospitalAdminHospitalInfoSection,
  type HospitalInfoState,
  HospitalAdminIdentitySection,
  type IdentityDocsState,
  HospitalAdminQualificationsSection,
  HospitalAdminReviewSection,
  HospitalAdminActionBottomBar,
  SupportContactModal,
} from '@/components/hospital-admin/verification'

export const HospitalAdminVerificationPage: FC = () => {
  const navigate = useNavigate()
  const { user, setUser } = useAuthStore()

  // Loading & Action states
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSupportOpen, setIsSupportOpen] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  // Stepper state
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  // Search state
  const [searchQuery, setSearchQuery] = useState('')

  // 1. Personal Information State
  const [personalInfo, setPersonalInfo] = useState<PersonalInfoState>({
    name: user?.name || '',
    email: user?.email || '',
    phonePrefix: '+91',
    phoneNumber: user?.phoneNumber || '',
    designation: 'Hospital Administrator',
  })

  // 2. Hospital Information State (Optional)
  const [hospitalInfo, setHospitalInfo] = useState<HospitalInfoState>({
    hospitalName: '',
    hospitalRegistrationNumber: '',
    hospitalType: 'Private Hospital',
    numberOfBeds: '',
    hospitalAddress: '',
  })

  // 3. Identity Documents State
  const [identityDocs, setIdentityDocs] = useState<IdentityDocsState>({
    governmentIdType: 'Aadhaar Card',
    governmentIdNumber: '',
    identityProofFile: null,
    identityProofUrl: '',
    authorizationLetterFile: null,
    authorizationLetterUrl: '',
    additionalDocFile: null,
    additionalDocUrl: '',
  })

  // 4. Qualifications State (Optional)
  const [qualifications, setQualifications] = useState<string[]>([
    'MBA - Hospital Administration',
  ])

  // 5. Review & Status
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<
    'INCOMPLETE' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
  >('INCOMPLETE')
  const [rejectionReason, setRejectionReason] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load existing profile on mount
  useEffect(() => {
    let isMounted = true

    const loadProfile = async () => {
      try {
        setIsLoading(true)
        const res = await hospitalAdminService.getMyProfile()

        if (!isMounted) return

        if (res?.profile) {
          const prof = res.profile

          const effectiveUser =
            res?.user ||
            (typeof prof.userId === 'object' && prof.userId ? (prof.userId as any) : null) ||
            user

          setPersonalInfo({
            name: effectiveUser?.name || '',
            email: effectiveUser?.email || '',
            phonePrefix: '+91',
            phoneNumber: effectiveUser?.phoneNumber || '',
            designation: prof.designation || 'Hospital Administrator',
          })

          setHospitalInfo({
            hospitalName: prof.hospitalName || prof.hospitalId?.name || '',
            hospitalRegistrationNumber: prof.hospitalRegistrationNumber || '',
            hospitalType: prof.hospitalType || 'Private Hospital',
            numberOfBeds: prof.numberOfBeds ? String(prof.numberOfBeds) : '',
            hospitalAddress: prof.hospitalAddress || prof.hospitalId?.address?.street || '',
          })

          setIdentityDocs({
            governmentIdType: prof.governmentIdType || 'Aadhaar Card',
            governmentIdNumber: prof.governmentIdNumber || '',
            identityProofFile: null,
            identityProofUrl: prof.identityProofUrl || '',
            authorizationLetterFile: null,
            authorizationLetterUrl: prof.authorizationLetterUrl || '',
            additionalDocFile: null,
            additionalDocUrl: prof.additionalDocUrl || '',
          })

          if (Array.isArray(prof.qualifications) && prof.qualifications.length > 0) {
            setQualifications(prof.qualifications)
          }

          setVerificationStatus(prof.verificationStatus || 'INCOMPLETE')
          setRejectionReason(prof.rejectionReason || '')
          setIsSubmitted(!!prof.isSubmitted)
        }
      } catch (err: any) {
        console.warn('Could not fetch hospital admin profile; using session defaults:', err)
        if (user) {
          setPersonalInfo((prev) => ({
            ...prev,
            name: user.name || '',
            email: user.email || '',
            phoneNumber: user.phoneNumber || '',
          }))
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

  // Build FormData for saving
  const buildFormData = (isSubmittingFinal = false) => {
    const formData = new FormData()

    formData.append('name', personalInfo.name.trim())
    formData.append('phoneNumber', personalInfo.phoneNumber.trim())
    formData.append('phone', personalInfo.phoneNumber.trim())
    formData.append('designation', personalInfo.designation)

    // Hospital fields (Optional)
    if (hospitalInfo.hospitalName) {
      formData.append('hospitalName', hospitalInfo.hospitalName.trim())
    }
    if (hospitalInfo.hospitalRegistrationNumber) {
      formData.append(
        'hospitalRegistrationNumber',
        hospitalInfo.hospitalRegistrationNumber.trim()
      )
    }
    if (hospitalInfo.hospitalType) {
      formData.append('hospitalType', hospitalInfo.hospitalType)
    }
    if (hospitalInfo.hospitalAddress) {
      formData.append('hospitalAddress', hospitalInfo.hospitalAddress.trim())
    }
    if (hospitalInfo.numberOfBeds) {
      formData.append('numberOfBeds', hospitalInfo.numberOfBeds)
    }

    // Identity fields
    formData.append('governmentIdType', identityDocs.governmentIdType)
    formData.append('governmentIdNumber', identityDocs.governmentIdNumber.trim())

    // File uploads
    if (identityDocs.identityProofFile) {
      formData.append('identityProof', identityDocs.identityProofFile)
    } else if (identityDocs.identityProofUrl) {
      formData.append('identityProofUrl', identityDocs.identityProofUrl)
    }

    if (identityDocs.authorizationLetterFile) {
      formData.append('authorizationLetter', identityDocs.authorizationLetterFile)
    } else if (identityDocs.authorizationLetterUrl) {
      formData.append('authorizationLetterUrl', identityDocs.authorizationLetterUrl)
    }

    if (identityDocs.additionalDocFile) {
      formData.append('additionalDoc', identityDocs.additionalDocFile)
    } else if (identityDocs.additionalDocUrl) {
      formData.append('additionalDocUrl', identityDocs.additionalDocUrl)
    }

    // Qualifications array
    formData.append('qualifications', JSON.stringify(qualifications))

    if (isSubmittingFinal) {
      formData.append('isSubmitted', 'true')
    }

    return formData
  }

  // Validate specific step
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!personalInfo.name.trim()) {
        newErrors.name = 'Full name is required'
      }
      if (!personalInfo.phoneNumber.trim()) {
        newErrors.phoneNumber = 'Phone number is required'
      } else if (!/^\+?[0-9\s-]{8,15}$/.test(personalInfo.phoneNumber.trim())) {
        newErrors.phoneNumber = 'Please enter a valid phone number'
      }
    }

    // Step 2 (Hospital Information) is explicitly optional per user requirement

    if (step === 3) {
      if (!identityDocs.governmentIdNumber.trim()) {
        newErrors.governmentIdNumber = 'Government ID number is required'
      }
      if (!identityDocs.identityProofFile && !identityDocs.identityProofUrl) {
        newErrors.identityProof = 'Please upload a copy of your government ID'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Save as Draft
  const handleSaveDraft = async () => {
    try {
      setIsSavingDraft(true)
      const data = buildFormData(false)
      const res = await hospitalAdminService.updateProfile(data)

      if (res?.user && user) {
        setUser({ ...user, ...res.user })
      }

      toast.success('Profile progress saved as draft.')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to save draft.')
    } finally {
      setIsSavingDraft(false)
    }
  }

  // Next Step
  const handleNext = async () => {
    if (!validateStep(currentStep)) {
      toast.error('Please complete all required fields on this step.')
      return
    }

    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep])
    }

    // Optionally auto-save progress in background
    try {
      const data = buildFormData(false)
      hospitalAdminService.updateProfile(data).catch(() => {})
    } catch (_) {}

    if (currentStep < 5) {
      setCurrentStep((prev) => prev + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Back Step
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Step click navigation
  const handleStepClick = (targetStep: number) => {
    if (targetStep < currentStep) {
      setCurrentStep(targetStep)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    // If moving forward, validate current step
    if (validateStep(currentStep)) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep])
      }
      setCurrentStep(targetStep)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Final Submit
  const handleSubmit = async () => {
    if (!isConfirmed) {
      toast.error('Please check the confirmation declaration to proceed.')
      return
    }

    if (!identityDocs.identityProofUrl && !identityDocs.identityProofFile) {
      toast.error('Government ID document is required for verification.')
      setCurrentStep(3)
      return
    }

    try {
      setIsSubmitting(true)
      const data = buildFormData(true)
      const res = await hospitalAdminService.updateProfile(data)

      if (res?.user && user) {
        setUser({ ...user, ...res.user })
      }

      setVerificationStatus('PENDING')
      setIsSubmitted(true)
      setShowSuccessModal(true)
      toast.success('Your profile has been submitted for Super Admin verification!')
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || 'Failed to submit profile for verification.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#F8FAFC]">
        <div className="w-14 h-14 rounded-2xl bg-blue-600/10 flex items-center justify-center mb-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
        <h3 className="font-bold text-slate-800 text-lg">Loading Profile Onboarding...</h3>
        <p className="text-slate-500 text-xs mt-1">
          Setting up your hospital administrator credentials
        </p>
      </div>
    )
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-[#F8FAFC] text-slate-900 flex selection:bg-blue-100 selection:text-blue-700 antialiased">
      {/* 1. Desktop Left Persistent Sidebar */}
      <div className="hidden lg:block h-screen shrink-0">
        <HospitalAdminPortalSidebar
          onOpenSupport={() => setIsSupportOpen(true)}
          verificationStatus={verificationStatus}
        />
      </div>

      {/* 2. Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <HospitalAdminPortalSidebar
          isMobileDrawer
          onCloseDrawer={() => setIsMobileMenuOpen(false)}
          onOpenSupport={() => {
            setIsMobileMenuOpen(false)
            setIsSupportOpen(true)
          }}
          verificationStatus={verificationStatus}
        />
      )}

      {/* 3. Main Center Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <HospitalAdminVerificationHeader
          onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Scrollable Form Body */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6 max-w-5xl w-full mx-auto pb-24">
          {/* Status Alert Banners */}
          {verificationStatus === 'APPROVED' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-950">
                    Account Verified by Super Admin!
                  </h4>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Your hospital administrator account is verified. You now have full access to
                    manage hospitals, doctor applications, and appointments.
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/hospital-admin/dashboard')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 shrink-0 cursor-pointer"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {verificationStatus === 'PENDING' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/90 border border-amber-200 flex items-start gap-3.5 shadow-xs animate-in fade-in duration-200">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-950">
                  Verification Request Under Review
                </h4>
                <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                  Your profile and hospital administration credentials are currently being reviewed
                  by our Super Admin team. Verification typically completes within 24–48 hours.
                  You can update any details below if needed.
                </p>
              </div>
            </div>
          )}

          {verificationStatus === 'REJECTED' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3.5 shadow-xs animate-in fade-in duration-200">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-red-950">Verification Needs Attention</h4>
                <p className="text-xs text-red-800 mt-0.5 leading-relaxed">
                  {rejectionReason ||
                    'Please update your hospital proof or authorization letter and resubmit for verification.'}
                </p>
              </div>
            </div>
          )}

          {/* Hero Banner with illustration */}
          <HospitalAdminHeroBanner />

          {/* Stepper Bar */}
          <HospitalAdminStepper
            currentStep={currentStep}
            onStepClick={handleStepClick}
            completedSteps={completedSteps}
          />

          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
              <HospitalAdminPersonalInfoSection
                formData={personalInfo}
                onChange={(fields) => setPersonalInfo((prev) => ({ ...prev, ...fields }))}
                errors={errors}
              />
            </div>
          )}

          {/* Step 2: Hospital Details (Optional) */}
          {currentStep === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
              <HospitalAdminHospitalInfoSection
                formData={hospitalInfo}
                onChange={(fields) => setHospitalInfo((prev) => ({ ...prev, ...fields }))}
                errors={errors}
              />
            </div>
          )}

          {/* Step 3: Identity & Documents */}
          {currentStep === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
              <HospitalAdminIdentitySection
                formData={identityDocs}
                onChange={(fields) => setIdentityDocs((prev) => ({ ...prev, ...fields }))}
                errors={errors}
              />
            </div>
          )}

          {/* Step 4: Qualifications (Optional) */}
          {currentStep === 4 && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
              <HospitalAdminQualificationsSection
                qualifications={qualifications}
                onChange={setQualifications}
              />
            </div>
          )}

          {/* Step 5: Review & Submit */}
          {currentStep === 5 && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
              <HospitalAdminReviewSection
                personalInfo={personalInfo}
                hospitalInfo={hospitalInfo}
                identityDocs={identityDocs}
                qualifications={qualifications}
                isConfirmed={isConfirmed}
                onToggleConfirmed={setIsConfirmed}
                onEditSection={(step) => {
                  setCurrentStep(step)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              />
            </div>
          )}

          {/* Bottom Action Footer Bar */}
          <HospitalAdminActionBottomBar
            currentStep={currentStep}
            totalSteps={5}
            onBack={handleBack}
            onNext={handleNext}
            onSaveDraft={handleSaveDraft}
            onSubmit={handleSubmit}
            isSavingDraft={isSavingDraft}
            isSubmitting={isSubmitting}
            isSubmitDisabled={!isConfirmed}
          />
        </main>
      </div>

      {/* Support Modal */}
      <SupportContactModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />

      {/* Submission Success Dialog */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setShowSuccessModal(false)}
          />
          <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-7 text-center animate-in zoom-in-95 duration-200 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-md shadow-emerald-500/20">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Application Submitted Successfully!
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Thank you for completing your hospital admin profile. Our compliance team has
                received your credentials and will review them shortly.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-semibold text-amber-600 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Pending Super Admin Review
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estimated SLA:</span>
                <span className="font-semibold text-slate-700">24 – 48 Hours</span>
              </div>
            </div>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              Continue to Portal
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
