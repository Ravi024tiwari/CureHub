import { useState, useEffect, type FC, type FormEvent } from 'react'
import { useNavigate, Link, useParams } from 'react-router-dom'
import {
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  RotateCcw,
  X,
  FileCheck2,
  Loader2,
  Building2,
  Sparkles,
  ShieldCheck,
  BedDouble,
  Stethoscope,
  Clock,
} from 'lucide-react'
import { HospitalAdminSidebar } from '@/components/hospital-admin/HospitalAdminSidebar'
import { HospitalAdminHeader } from '@/components/hospital-admin/HospitalAdminHeader'
import { HospitalAdminMobileNav } from '@/components/hospital-admin/HospitalAdminMobileNav'
import { AddHospitalStepper } from '@/components/hospital-admin/add-hospital/AddHospitalStepper'
import { BasicInfoCard } from '@/components/hospital-admin/add-hospital/BasicInfoCard'
import { HospitalImagesCard } from '@/components/hospital-admin/add-hospital/HospitalImagesCard'
import { LicenseInfoCard } from '@/components/hospital-admin/add-hospital/LicenseInfoCard'
import { OperatingHoursCard } from '@/components/hospital-admin/add-hospital/OperatingHoursCard'
import { AddressCard } from '@/components/hospital-admin/add-hospital/AddressCard'
import { ContactCard } from '@/components/hospital-admin/add-hospital/ContactCard'
import { DepartmentsCard } from '@/components/hospital-admin/add-hospital/DepartmentsCard'
import { FacilitiesCard } from '@/components/hospital-admin/add-hospital/FacilitiesCard'
import { HospitalPreviewCard } from '@/components/hospital-admin/add-hospital/HospitalPreviewCard'
import { ReviewSubmitSection } from '@/components/hospital-admin/add-hospital/ReviewSubmitSection'
import { MobilePreviewDrawer } from '@/components/hospital-admin/add-hospital/MobilePreviewDrawer'
import { useHospitalBranchesStore } from '@/store/hospitalBranchesStore'
import { useHospitalAdminStore } from '@/store/hospitalAdminStore'
import { hospitalAdminService } from '@/services/hospitalAdminService'
import type { AddHospitalFormData } from '@/types/hospitalAdmin'

export type { AddHospitalFormData }

const INITIAL_FORM_STATE: AddHospitalFormData = {
  name: '',
  hospitalType: '',
  slug: '',
  establishmentYear: '',
  totalBeds: '',
  website: '',
  description: '',
  street: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'India',
  contactEmail: '',
  contactPhone: '',
  departments: [],
  facilities: [],
  openingTime: '09:00 AM',
  closingTime: '11:00 PM',
  isEmergency24x7: false,
  coverImage: '',
  gallery: [],
  licenseNumber: '',
  licenseDocumentUrl: '',
  licenseDocumentName: '',
}

const DRAFT_STORAGE_KEY = 'curehealth_add_hospital_draft_v1'

export const AddNewHospitalPage: FC = () => {
  const { id } = useParams<{ id?: string }>()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()
  const { isMobileSidebarOpen, setIsMobileSidebarOpen } = useHospitalAdminStore()
  const { createHospital, updateHospital, isSubmitting } = useHospitalBranchesStore()

  // Stepper state
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  // Loading state for fetching existing hospital data in edit mode
  const [isLoadingExisting, setIsLoadingExisting] = useState<boolean>(isEditMode)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Form data state - clean empty form for new hospital, or prefilled for edit mode
  const [formData, setFormData] = useState<AddHospitalFormData>(() => {
    if (!isEditMode) {
      try {
        const saved = localStorage.getItem(DRAFT_STORAGE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved)
          if (parsed.name === 'Apollo Multispeciality Hospital' || parsed.licenseNumber === 'MH/123456/2023') {
            localStorage.removeItem(DRAFT_STORAGE_KEY)
            return INITIAL_FORM_STATE
          }
          return parsed
        }
      } catch (e) {
        // ignore
      }
    }
    return INITIAL_FORM_STATE
  })

  // Prefill existing hospital data when in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      setIsLoadingExisting(true)
      setLoadError(null)
      hospitalAdminService
        .getHospitalDetail(id)
        .then((res: any) => {
          const hosp = res?.hospital || res
          if (hosp) {
            setFormData({
              name: hosp.name || '',
              hospitalType: hosp.hospitalType || '',
              slug: hosp.slug || '',
              establishmentYear: hosp.establishmentYear ? Number(hosp.establishmentYear) : '',
              totalBeds: hosp.totalBeds ? Number(hosp.totalBeds) : '',
              website: hosp.website || '',
              description: hosp.description || '',
              street: hosp.address?.street || '',
              city: hosp.address?.city || '',
              state: hosp.address?.state || '',
              zipCode: hosp.address?.zipCode || '',
              country: hosp.address?.country || 'India',
              contactEmail: hosp.contactEmail || '',
              contactPhone: hosp.contactPhone || '',
              departments: Array.isArray(hosp.departments) ? hosp.departments : [],
              facilities: Array.isArray(hosp.facilities) ? hosp.facilities : [],
              openingTime: hosp.openingTime || '09:00 AM',
              closingTime: hosp.closingTime || '11:00 PM',
              isEmergency24x7: Boolean(hosp.isEmergency24x7),
              coverImage: hosp.images?.coverImage || '',
              gallery: Array.isArray(hosp.images?.gallery) ? hosp.images.gallery : [],
              licenseNumber: hosp.licenseNumber || '',
              licenseDocumentUrl: hosp.licenseDocumentUrl || '',
              licenseDocumentName: hosp.licenseDocumentUrl
                ? (() => {
                    const rawName = hosp.licenseDocumentUrl.split('/').pop() || ''
                    if (rawName.length > 30 || rawName.startsWith('AEMAZQ')) {
                      const ext = rawName.split('.').pop() || 'pdf'
                      return `Registration-Certificate.${ext}`
                    }
                    return rawName || 'Registration-Certificate.pdf'
                  })()
                : '',
            })
            setTermsAccepted(true)
          }
        })
        .catch((err: any) => {
          console.error('Failed to load hospital details for editing:', err)
          setLoadError(
            err?.response?.data?.message ||
              'Could not load hospital facility details for editing. Please check your connection or permissions.'
          )
        })
        .finally(() => {
          setIsLoadingExisting(false)
        })
    } else {
      setIsLoadingExisting(false)
    }
  }, [id, isEditMode])

  // Form validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)

  // Feedback notifications & modals
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false)

  // Auto-hide toast after 4s
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [toastMessage])

  // Form change handler
  const updateFormData = (fields: Partial<AddHospitalFormData>) => {
    setFormData((prev) => ({
      ...prev,
      ...fields,
    }))
    // Clear field-level error on change
    Object.keys(fields).forEach((key) => {
      if (errors[key]) {
        setErrors((prev) => {
          const updated = { ...prev }
          delete updated[key]
          return updated
        })
      }
    })
  }

  // Save current progress as draft
  const handleSaveDraft = () => {
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formData))
      setToastMessage('Hospital application saved as draft successfully!')
    } catch (e) {
      setToastMessage('Unable to save draft locally.')
    }
  }

  // Reset form
  const handleResetForm = () => {
    if (window.confirm('Clear all fields and start fresh?')) {
      setFormData(INITIAL_FORM_STATE)
      localStorage.removeItem(DRAFT_STORAGE_KEY)
      setErrors({})
      setCurrentStep(1)
      setToastMessage('Form cleared.')
    }
  }

  // Step Validation
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Hospital name is required'
      if (!formData.hospitalType) newErrors.hospitalType = 'Please select a hospital type'
      if (!formData.totalBeds || Number(formData.totalBeds) < 1) {
        newErrors.totalBeds = 'Number of beds must be at least 1'
      }
    } else if (step === 2) {
      if (!formData.street.trim()) newErrors.street = 'Street address is required'
      if (!formData.city.trim()) newErrors.city = 'City is required'
      if (!formData.state.trim()) newErrors.state = 'State is required'
      if (!formData.zipCode.trim()) newErrors.zipCode = 'Zip/PIN Code is required'
      if (!formData.contactEmail.trim() || !/^\S+@\S+\.\S+$/.test(formData.contactEmail)) {
        newErrors.contactEmail = 'Valid contact email is required'
      }
      if (!formData.contactPhone.trim()) {
        newErrors.contactPhone = 'Contact phone number is required'
      }
    } else if (step === 3) {
      if (formData.departments.length === 0) {
        newErrors.departments = 'At least one hospital department is required'
      }
      if (formData.facilities.length === 0) {
        newErrors.facilities = 'At least one facility is required'
      }
    } else if (step === 4) {
      if (!formData.licenseNumber.trim()) {
        newErrors.licenseNumber = 'Government license number is required'
      }
      if (!formData.licenseDocumentUrl.trim()) {
        newErrors.licenseDocumentUrl = 'License document proof is required'
      }
      if (!formData.coverImage) {
        newErrors.coverImage = 'Hospital cover image is required'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Advance to next step
  const handleNextStep = () => {
    setGlobalError(null)
    const isValid = validateStep(currentStep)
    if (!isValid) {
      setGlobalError('Please fix the highlighted fields to continue.')
      return
    }

    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps((prev) => [...prev, currentStep])
    }

    if (currentStep < 5) {
      setCurrentStep((prev) => prev + 1)
      window.scrollTo({ top: 120, behavior: 'smooth' })
    }
  }

  // Navigate backward
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
      window.scrollTo({ top: 120, behavior: 'smooth' })
    }
  }

  // Direct step click
  const handleStepClick = (stepId: number) => {
    setCurrentStep(stepId)
    window.scrollTo({ top: 120, behavior: 'smooth' })
  }

  // Final Form Submission
  const handleSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault()
    setGlobalError(null)

    // Full validation across all steps
    const step1Valid = validateStep(1)
    const step2Valid = validateStep(2)
    const step3Valid = validateStep(3)
    const step4Valid = validateStep(4)

    if (!step1Valid || !step2Valid || !step3Valid || !step4Valid) {
      setGlobalError('Please fill out all required fields before submitting.')
      setCurrentStep(!step1Valid ? 1 : !step2Valid ? 2 : !step3Valid ? 3 : 4)
      return
    }

    if (!termsAccepted) {
      setGlobalError('Please confirm the authorized admin declaration checkbox.')
      return
    }

    // Build payload matching backend Hospital schema
    const payload = {
      name: formData.name.trim(),
      slug: formData.slug.trim() || formData.name.toLowerCase().replace(/\s+/g, '-'),
      hospitalType: formData.hospitalType,
      licenseNumber: formData.licenseNumber.trim(),
      licenseDocumentUrl: formData.licenseDocumentUrl.trim(),
      contactEmail: formData.contactEmail.trim(),
      contactPhone: formData.contactPhone.trim(),
      address: {
        street: formData.street.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        zipCode: formData.zipCode.trim(),
        country: formData.country || 'India',
      },
      totalBeds: Number(formData.totalBeds) || 50,
      establishmentYear: Number(formData.establishmentYear) || 2024,
      departments: formData.departments,
      facilities: formData.facilities,
      openingTime: formData.openingTime || '09:00 AM',
      closingTime: formData.closingTime || '11:00 PM',
      isEmergency24x7: formData.isEmergency24x7,
      website: formData.website.trim(),
      description: formData.description.trim(),
      images: {
        coverImage: formData.coverImage,
        gallery: formData.gallery,
      },
    }

    let success = false
    if (isEditMode && id) {
      success = await updateHospital(id, payload)
    } else {
      success = await createHospital(payload)
      if (success) {
        localStorage.removeItem(DRAFT_STORAGE_KEY)
      }
    }

    if (success) {
      setIsSuccessModalOpen(true)
    } else {
      setGlobalError(
        isEditMode
          ? 'Failed to update hospital facility. Please verify server connection and try again.'
          : 'Failed to register hospital branch. Please verify server connection.'
      )
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex selection:bg-blue-100 selection:text-blue-700 antialiased">
      {/* 1. Desktop Persistent Sidebar */}
      <div className="hidden lg:block w-64 shrink-0">
        <HospitalAdminSidebar />
      </div>

      {/* 2. Mobile Drawer Sidebar */}
      {isMobileSidebarOpen && (
        <HospitalAdminSidebar
          isMobileDrawer={true}
          onCloseDrawer={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* 3. Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 pb-28 lg:pb-16">
        {/* Top Header with Hamburger menu */}
        <HospitalAdminHeader onToggleSidebar={() => setIsMobileSidebarOpen(true)} />

        {/* Page Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Breadcrumbs: Hospitals > (Hospital Name) > Edit or Add New */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <nav className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <Link
                to="/hospital-admin/hospitals"
                className="hover:text-blue-600 transition-colors"
              >
                Hospitals
              </Link>
              <ChevronRight className="size-3.5 text-slate-400" />
              {isEditMode ? (
                <>
                  <Link
                    to={`/hospital-admin/hospitals/${id}`}
                    className="hover:text-blue-600 transition-colors max-w-[180px] sm:max-w-xs truncate"
                  >
                    {formData.name || 'Hospital Details'}
                  </Link>
                  <ChevronRight className="size-3.5 text-slate-400" />
                  <span className="text-slate-900 font-extrabold">Edit</span>
                </>
              ) : (
                <span className="text-slate-900 font-extrabold">Add New</span>
              )}
            </nav>

            {/* Helper Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetForm}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-3xs"
                title={isEditMode ? 'Reset Changes' : 'Clear Form'}
              >
                <RotateCcw className="size-3.5 text-slate-500" />
                <span>{isEditMode ? 'Reset Changes' : 'Clear Form'}</span>
              </button>

              {/* Mobile Live Preview Trigger Button */}
              <button
                type="button"
                onClick={() => setIsMobilePreviewOpen(true)}
                className="lg:hidden px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Eye className="size-3.5" />
                <span>Live Preview</span>
              </button>
            </div>
          </div>

          {/* Title & Subtitle */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {isEditMode ? 'Edit Hospital Facility' : 'Add New Hospital'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              {isEditMode
                ? `Update facility information, operating hours, and media for ${formData.name || 'this hospital branch'}.`
                : 'Register a new hospital branch to expand your healthcare network.'}
            </p>
          </div>

          {isLoadingExisting ? (
            <div className="py-24 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs">
              <Loader2 className="size-10 text-blue-600 animate-spin mb-3" />
              <p className="text-sm font-bold text-slate-800">Loading facility details for editing...</p>
              <p className="text-xs text-slate-400 mt-1">Retrieving hospital profile, media, and licensing records</p>
            </div>
          ) : loadError ? (
            <div className="bg-white rounded-3xl border border-rose-200 p-8 text-center space-y-3">
              <AlertCircle className="size-10 text-rose-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">Failed to load hospital</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">{loadError}</p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/hospital-admin/hospitals')}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Back to Hospitals
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* 5-Step Progress Tracker */}
              <AddHospitalStepper
                currentStep={currentStep}
                onStepClick={handleStepClick}
                completedSteps={completedSteps}
              />

          {/* Toast Notification Alert */}
          {toastMessage && (
            <div className="p-3.5 rounded-2xl bg-slate-900 text-white text-xs font-semibold flex items-center justify-between shadow-lg animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="size-4.5 text-emerald-400" />
                <span>{toastMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setToastMessage(null)}
                className="p-1 hover:bg-white/10 rounded-lg cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
          )}

          {/* Global Form Error Alert */}
          {globalError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-3 animate-in fade-in duration-200">
              <AlertCircle className="size-5 text-rose-600 shrink-0" />
              <span>{globalError}</span>
            </div>
          )}

          {/* Main 2-Column Responsive Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            {/* Left Form Area (8 cols on Desktop) */}
            <div className="lg:col-span-8 space-y-6">
              {/* When on Review Step (Step 5) */}
              {currentStep === 5 ? (
                <ReviewSubmitSection
                  data={formData}
                  onGoToStep={handleStepClick}
                  termsAccepted={termsAccepted}
                  onToggleTerms={setTermsAccepted}
                  isEditMode={isEditMode}
                />
              ) : (
                /* Cards layout matching mockup */
                <div className="space-y-6">
                  {/* Basic Information Card */}
                  <div id="section-basic">
                    <BasicInfoCard
                      data={{
                        name: formData.name,
                        hospitalType: formData.hospitalType,
                        slug: formData.slug,
                        establishmentYear: formData.establishmentYear,
                        totalBeds: formData.totalBeds,
                        website: formData.website,
                        description: formData.description,
                      }}
                      onChange={updateFormData}
                      errors={errors as any}
                    />
                  </div>

                  {/* Hospital Images Card */}
                  <div id="section-images">
                    <HospitalImagesCard
                      data={{
                        coverImage: formData.coverImage,
                        gallery: formData.gallery,
                      }}
                      onChange={updateFormData}
                      errors={errors as any}
                    />
                  </div>

                  {/* License Information Card */}
                  <div id="section-license">
                    <LicenseInfoCard
                      data={{
                        licenseNumber: formData.licenseNumber,
                        licenseDocumentUrl: formData.licenseDocumentUrl,
                        licenseDocumentName: formData.licenseDocumentName,
                      }}
                      onChange={updateFormData}
                      errors={errors as any}
                    />
                  </div>

                  {/* Operating Hours Card */}
                  <div id="section-hours">
                    <OperatingHoursCard
                      data={{
                        openingTime: formData.openingTime,
                        closingTime: formData.closingTime,
                        isEmergency24x7: formData.isEmergency24x7,
                      }}
                      onChange={updateFormData}
                    />
                  </div>

                  {/* Address Information Card */}
                  <div id="section-address">
                    <AddressCard
                      data={{
                        street: formData.street,
                        city: formData.city,
                        state: formData.state,
                        zipCode: formData.zipCode,
                        country: formData.country,
                      }}
                      onChange={updateFormData}
                      errors={errors as any}
                    />
                  </div>

                  {/* Contact Information Card */}
                  <div id="section-contact">
                    <ContactCard
                      data={{
                        contactEmail: formData.contactEmail,
                        contactPhone: formData.contactPhone,
                      }}
                      onChange={updateFormData}
                      errors={errors as any}
                    />
                  </div>

                  {/* Departments Card */}
                  <div id="section-departments">
                    <DepartmentsCard
                      departments={formData.departments}
                      onChange={(departments) => updateFormData({ departments })}
                      error={errors.departments}
                    />
                  </div>

                  {/* Facilities Card */}
                  <div id="section-facilities">
                    <FacilitiesCard
                      facilities={formData.facilities}
                      onChange={(facilities) => updateFormData({ facilities })}
                      error={errors.facilities}
                    />
                  </div>
                </div>
              )}

              {/* Bottom Actions Bar (Desktop View) */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                {/* Left side actions */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => navigate('/hospital-admin/hospitals')}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm transition-all cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs"
                  >
                    <Save className="size-4 text-slate-500" />
                    <span>Save as Draft</span>
                  </button>
                </div>

                {/* Right side navigation buttons */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="size-4" />
                      <span>Back</span>
                    </button>
                  )}

                  {currentStep < 5 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                    >
                      <span>
                        {currentStep === 1
                          ? 'Next: Address & Contact'
                          : currentStep === 2
                          ? 'Next: Departments & Facilities'
                          : currentStep === 3
                          ? 'Next: Images & Documents'
                          : 'Next: Review & Submit'}
                      </span>
                      <ArrowRight className="size-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSubmit()}
                      disabled={isSubmitting}
                      className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-black text-xs sm:text-sm shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>{isEditMode ? 'Saving Changes...' : 'Submitting Application...'}</span>
                        </>
                      ) : (
                        <>
                          <FileCheck2 className="size-4.5" />
                          <span>{isEditMode ? 'Save & Update Hospital' : 'Submit Hospital Application'}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Sticky Hospital Live Preview (4 cols on Desktop) */}
            <div className="hidden lg:block lg:col-span-4">
              <HospitalPreviewCard data={formData} />
            </div>
          </div>
            </>
          )}
        </main>
      </div>

      {/* Floating Sticky Mobile Bottom Action Bar */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200/90 p-3 sm:p-4 z-40 lg:hidden shadow-lg flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => navigate('/hospital-admin/hospitals')}
          className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
        >
          Cancel
        </button>

        <div className="flex items-center gap-2">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handlePrevStep}
              className="p-2 rounded-xl border border-slate-200 text-slate-700"
            >
              <ArrowLeft className="size-4" />
            </button>
          )}

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="px-4 py-2.5 rounded-xl bg-blue-600 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-transform"
            >
              <span>Next: {currentStep === 1 ? 'Address' : currentStep === 2 ? 'Facilities' : currentStep === 3 ? 'Images' : 'Review'}</span>
              <ArrowRight className="size-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <CheckCircle2 className="size-4" />
              <span>{isEditMode ? 'Save Changes' : 'Submit'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Live Preview Drawer */}
      <MobilePreviewDrawer
        isOpen={isMobilePreviewOpen}
        onClose={() => setIsMobilePreviewOpen(false)}
        data={formData}
      />

      {/* Enhanced Industrial-Grade Success Confirmation Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-5 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Ambient Background Decorative Glow */}
            <div className="absolute -top-24 -right-24 size-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 size-48 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

            {/* Top Close Button */}
            <button
              type="button"
              onClick={() => {
                setIsSuccessModalOpen(false)
                if (isEditMode && id) {
                  navigate(`/hospital-admin/hospitals/${id}`)
                } else {
                  navigate('/hospital-admin/hospitals')
                }
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="size-5" />
            </button>

            {/* Animated Multi-Ring Glowing Success Badge */}
            <div className="relative mx-auto size-20 flex items-center justify-center mb-5">
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping duration-1000" />
              <div className="absolute inset-1 rounded-full bg-emerald-100 ring-8 ring-emerald-500/10" />
              <div className="relative size-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <CheckCircle2 className="size-8 stroke-[2.5]" />
              </div>
            </div>

            {/* Header Title & Description */}
            <div className="text-center space-y-1.5 mb-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-extrabold text-emerald-700 mb-1">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{isEditMode ? 'Live Updates Synced' : 'Registration Acknowledged'}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {isEditMode ? 'Hospital Profile Updated!' : 'Hospital Application Submitted!'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                <strong className="text-slate-800">{formData.name}</strong> has been {isEditMode ? 'successfully updated with the latest operating parameters, licensing, and media.' : 'registered into your healthcare network and queued for compliance.'}
              </p>
            </div>

            {/* Industrial Facility Snapshot Preview Card */}
            <div className="bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200/80 rounded-2xl p-4 space-y-3.5 mb-6">
              {/* Facility Identity Row */}
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-xl bg-white border border-slate-200 shadow-2xs overflow-hidden shrink-0 flex items-center justify-center">
                  {formData.coverImage ? (
                    <img
                      src={formData.coverImage}
                      alt={formData.name}
                      className="size-full object-cover"
                    />
                  ) : (
                    <Building2 className="size-6 text-blue-600" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-black text-slate-900 truncate">
                    {formData.name || 'Hospital Branch'}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                    <span>{formData.city || 'City'}, {formData.state || 'India'}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-blue-600 font-bold">{formData.hospitalType || 'Multi-Speciality'}</span>
                  </p>
                </div>
              </div>

              {/* 3 Quick Metrics Pills */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 text-center">
                <div className="p-2 rounded-xl bg-white border border-slate-200/70 shadow-3xs">
                  <div className="flex items-center justify-center gap-1 text-slate-400 mb-0.5">
                    <BedDouble className="size-3.5 text-blue-600" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Beds</span>
                  </div>
                  <span className="text-xs sm:text-sm font-black text-slate-900">{formData.totalBeds || 50}</span>
                </div>

                <div className="p-2 rounded-xl bg-white border border-slate-200/70 shadow-3xs">
                  <div className="flex items-center justify-center gap-1 text-slate-400 mb-0.5">
                    <Stethoscope className="size-3.5 text-violet-600" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Depts</span>
                  </div>
                  <span className="text-xs sm:text-sm font-black text-slate-900">{formData.departments.length || 1}</span>
                </div>

                <div className="p-2 rounded-xl bg-white border border-slate-200/70 shadow-3xs">
                  <div className="flex items-center justify-center gap-1 text-slate-400 mb-0.5">
                    <Clock className="size-3.5 text-emerald-600" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">ER</span>
                  </div>
                  <span className="text-xs sm:text-sm font-black text-emerald-700">
                    {formData.isEmergency24x7 ? '24/7' : 'Standard'}
                  </span>
                </div>
              </div>

              {/* Cloud Storage & Compliance Audit Status */}
              <div className="flex items-center justify-between text-[11px] pt-1 px-1 text-slate-500">
                <span className="flex items-center gap-1 font-semibold text-slate-600">
                  <ShieldCheck className="size-3.5 text-emerald-600" />
                  <span>Reg: <strong className="font-mono text-slate-800">{formData.licenseNumber || 'Verified'}</strong></span>
                </span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <Sparkles className="size-3" />
                  S3 Storage Cleaned & Synced
                </span>
              </div>
            </div>

            {/* High-Impact Action Buttons */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => navigate(isEditMode && id ? `/hospital-admin/hospitals/${id}` : '/hospital-admin/hospitals')}
                className="group w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isEditMode ? 'View Hospital Details' : 'Go to Hospital Dashboard'}</span>
                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => {
                  if (isEditMode) {
                    navigate('/hospital-admin/hospitals')
                  } else {
                    setIsSuccessModalOpen(false)
                    setFormData(INITIAL_FORM_STATE)
                    setCurrentStep(1)
                  }
                }}
                className="w-full py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Building2 className="size-4 text-slate-500" />
                <span>{isEditMode ? 'Back to All Hospitals' : 'Register Another Hospital'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Nav */}
      <HospitalAdminMobileNav />
    </div>
  )
}
export default AddNewHospitalPage
