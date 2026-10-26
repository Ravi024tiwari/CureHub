import React, { useEffect, useState, useMemo } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useDoctorStore } from '@/store/doctorStore'
import { toast } from '@/store/toastStore'
import { DoctorSidebar, DoctorHeader } from '@/components/doctor/dashboard'
import {
  DoctorProfileHeader,
  DoctorProfileTabs,
  type DoctorProfileTabKey,
  DoctorProfileSummaryCard,
  DoctorBasicInfoCard,
  DoctorQualificationsCard,
  DoctorMedicalCouncilCard,
  DoctorExperienceCard,
  DoctorScheduleTab,
  DoctorHospitalTab,
  DoctorDocumentsTab,
  DoctorProfileBottomBar,
  DoctorMobileSectionNav,
  QualificationModal,
  type QualificationData,
  ExperienceModal,
  type ExperienceData,
  DocumentPreviewModal,
  AvatarModal,
} from '@/components/doctor/profile'

export const DoctorProfilePage: React.FC = () => {
  const { user, setUser } = useAuthStore()
  const {
    myDoctorProfile,
    isProfileLoading,
    isSavingProfile,
    fetchMyDoctorProfile,
    updateMyDoctorProfile,
    scheduleRules,
  } = useDoctorStore()

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<DoctorProfileTabKey>('personal')

  // Form States
  const [department, setDepartment] = useState('Cardiology')
  const [specializations, setSpecializations] = useState<string[]>([
    'Interventional Cardiology',
    'Cardiac Electrophysiology',
  ])
  const [experienceYears, setExperienceYears] = useState<number>(0)
  const [consultationFee, setConsultationFee] = useState<number>(500)
  const [bio, setBio] = useState(
    'Experienced Cardiologist with a passion for preventive cardiology and patient-centered care. I specialize in diagnosing and treating heart conditions with a focus on long-term heart health and lifestyle management.'
  )
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [licenseDocumentUrl, setLicenseDocumentUrl] = useState('')
  const [avatar, setAvatar] = useState<string>(
    user?.avatar ||
      'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80'
  )
  const [qualifications, setQualifications] = useState<QualificationData[]>([
    {
      degree: 'MBBS',
      institution: 'AIIMS, New Delhi',
      period: '2010 - 2015',
    },
    {
      degree: 'MD (Cardiology)',
      institution: 'PGI, Chandigarh',
      period: '2015 - 2018',
    },
  ])
  const [experiences, setExperiences] = useState<ExperienceData[]>([
    {
      title: 'Consultant Cardiologist',
      institution: 'Apollo Multispeciality Hospital, Bilaspur',
      period: '2021 - Present',
      duration: '3+ years',
    },
    {
      title: 'Senior Resident - Cardiology',
      institution: 'AIIMS, New Delhi',
      period: '2018 - 2021',
      duration: '3 years',
    },
  ])

  // Modals state
  const [isQualModalOpen, setIsQualModalOpen] = useState(false)
  const [editingQualIndex, setEditingQualIndex] = useState<number | null>(null)

  const [isExpModalOpen, setIsExpModalOpen] = useState(false)
  const [editingExpIndex, setEditingExpIndex] = useState<number | null>(null)

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [previewDocUrl, setPreviewDocUrl] = useState('')
  const [previewDocTitle, setPreviewDocTitle] = useState('')

  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false)

  // Initial Data Fetch
  useEffect(() => {
    fetchMyDoctorProfile()
  }, [])

  // Sync form state when myDoctorProfile is loaded
  useEffect(() => {
    if (myDoctorProfile) {
      if (myDoctorProfile.department) setDepartment(myDoctorProfile.department)
      if (myDoctorProfile.specialization && myDoctorProfile.specialization.length > 0) {
        setSpecializations(myDoctorProfile.specialization)
      }
      if (typeof myDoctorProfile.experienceYears === 'number') {
        setExperienceYears(myDoctorProfile.experienceYears)
      }
      if (typeof myDoctorProfile.consultationFee === 'number') {
        setConsultationFee(myDoctorProfile.consultationFee)
      }
      if (myDoctorProfile.bio !== undefined) setBio(myDoctorProfile.bio)
      setRegistrationNumber(myDoctorProfile.medicalCouncilRegistrationNumber || '')
      setLicenseDocumentUrl(myDoctorProfile.licenseDocumentUrl || '')
      if (myDoctorProfile.userId?.avatar) {
        setAvatar(myDoctorProfile.userId.avatar)
      }

      // Sync qualifications
      if (myDoctorProfile.qualifications && myDoctorProfile.qualifications.length > 0) {
        const parsed: QualificationData[] = myDoctorProfile.qualifications.map((q) => {
          const parts = q.split('|').map((s) => s.trim())
          return {
            degree: parts[0] || q,
            institution: parts[1] || 'Medical College',
            period: parts[2] || '2015 - 2020',
          }
        })
        setQualifications(parsed)
      }

      // Sync experiences
      if (myDoctorProfile.experiences && myDoctorProfile.experiences.length > 0) {
        const parsedExp: ExperienceData[] = myDoctorProfile.experiences.map((exp) => ({
          title: exp.title,
          institution: exp.institution,
          period: exp.period,
          duration: exp.duration,
          description: exp.description,
        }))
        setExperiences(parsedExp)
      }
    }
  }, [myDoctorProfile])

  // Profile completion calculation
  const completionPercentage = useMemo(() => {
    let score = 0
    if (department.trim()) score += 15
    if (specializations.length > 0) score += 15
    if (qualifications.length > 0) score += 15
    if (registrationNumber.trim()) score += 15
    if (licenseDocumentUrl.trim()) score += 15
    if (consultationFee > 0) score += 10
    if (experiences.length > 0) score += 10
    if (bio.trim().length > 30) score += 10
    return Math.min(100, score)
  }, [
    department,
    specializations,
    qualifications,
    registrationNumber,
    licenseDocumentUrl,
    consultationFee,
    experiences,
    bio,
  ])

  // Qualification handlers
  const handleAddQualification = (data: QualificationData) => {
    setQualifications((prev) => [...prev, data])
    toast.success('Qualification added!')
  }

  const handleUpdateQualification = (data: QualificationData) => {
    if (editingQualIndex === null) return
    setQualifications((prev) =>
      prev.map((item, idx) => (idx === editingQualIndex ? data : item))
    )
    toast.success('Qualification updated!')
    setEditingQualIndex(null)
  }

  const handleDeleteQualification = (index: number) => {
    setQualifications((prev) => prev.filter((_, idx) => idx !== index))
    toast.info('Qualification removed.')
  }

  // Experience handlers
  const handleAddExperience = (data: ExperienceData) => {
    setExperiences((prev) => [...prev, data])
    toast.success('Experience record added!')
  }

  const handleUpdateExperience = (data: ExperienceData) => {
    if (editingExpIndex === null) return
    setExperiences((prev) =>
      prev.map((item, idx) => (idx === editingExpIndex ? data : item))
    )
    toast.success('Experience record updated!')
    setEditingExpIndex(null)
  }

  const handleDeleteExperience = (index: number) => {
    setExperiences((prev) => prev.filter((_, idx) => idx !== index))
    toast.info('Experience record removed.')
  }

  // Discard changes to server values
  const handleDiscardChanges = () => {
    if (myDoctorProfile) {
      setDepartment(myDoctorProfile.department || 'Cardiology')
      setSpecializations(
        myDoctorProfile.specialization?.length
          ? myDoctorProfile.specialization
          : ['Interventional Cardiology']
      )
      setExperienceYears(myDoctorProfile.experienceYears || 12)
      setConsultationFee(myDoctorProfile.consultationFee || 800)
      setBio(myDoctorProfile.bio || '')
      setRegistrationNumber(myDoctorProfile.medicalCouncilRegistrationNumber || '')
      setLicenseDocumentUrl(myDoctorProfile.licenseDocumentUrl || '')
      setAvatar(myDoctorProfile.userId?.avatar || avatar)
    }
    toast.info('Changes discarded. Profile reset to saved state.')
  }

  // Save / Update Profile
  const handleSaveProfile = async (isSubmit = false) => {
    if (!department.trim()) {
      toast.error('Department is required.')
      return
    }
    if (!registrationNumber.trim()) {
      toast.error('Medical Council Registration Number is required.')
      return
    }
    if (specializations.length === 0) {
      toast.error('Please add at least one medical specialization.')
      return
    }

    try {
      const formattedQualifications = qualifications.map(
        (q) => `${q.degree} | ${q.institution} | ${q.period}`
      )

      const payload = {
        department: department.trim(),
        specialization: specializations,
        qualifications: formattedQualifications,
        medicalCouncilRegistrationNumber: registrationNumber.trim(),
        licenseDocumentUrl: licenseDocumentUrl.trim(),
        experienceYears,
        experiences,
        consultationFee,
        bio: bio.trim(),
        avatar,
        isSubmit,
      }

      await updateMyDoctorProfile(payload)

      // Update auth store user avatar if changed
      if (user && avatar !== user.avatar) {
        setUser({ ...user, avatar })
      }

      toast.success(
        isSubmit
          ? 'Doctor profile updated and submitted for verification!'
          : 'Profile details saved successfully!'
      )
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || 'Failed to update doctor profile.'
      )
    }
  }

  const doctorName =
    myDoctorProfile?.userId?.name ||
    (user?.name ? (user.name.startsWith('Dr.') ? user.name : `Dr. ${user.name}`) : 'Doctor Profile')

  const hospitalName =
    myDoctorProfile?.hospitalAffiliationStatus === 'APPROVED' && myDoctorProfile?.hospitalId?.name
      ? myDoctorProfile.hospitalId.name
      : myDoctorProfile?.hospitalAffiliationStatus === 'PENDING_APPROVAL' && myDoctorProfile?.hospitalId?.name
        ? `${myDoctorProfile.hospitalId.name} (Pending)`
        : myDoctorProfile?.hospitalAffiliationStatus === 'PENDING_APPROVAL'
          ? 'Affiliation Pending'
          : 'Independent Practice'

  const memberSinceDate = myDoctorProfile?.createdAt || user?.createdAt
  const formattedMemberSince = memberSinceDate
    ? new Date(memberSinceDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recently Joined'

  const qualificationsStr = qualifications.length
    ? qualifications.map((q) => q.degree).join(', ')
    : ''

  return (
    <div className="h-screen w-full overflow-hidden bg-[#F8FAFC] text-slate-900 flex selection:bg-blue-100 selection:text-blue-700 antialiased">
      {/* 1. Desktop Persistent Sidebar */}
      <div className="hidden lg:block h-screen shrink-0">
        <DoctorSidebar />
      </div>

      {/* 2. Mobile Drawer Sidebar */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative z-50 w-64 max-w-[80vw] h-full shadow-2xl animate-in slide-in-from-left duration-200">
            <DoctorSidebar onCloseMobile={() => setIsMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* 3. Main Content Container */}
      <div className="flex-1 h-screen overflow-y-auto overflow-x-hidden flex flex-col min-w-0">
        <DoctorHeader
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
          doctorName={doctorName}
          department={department}
          avatar={avatar}
        />

        <main className="flex-1 w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5">
          {/* Top Page Header */}
          <DoctorProfileHeader
            lastUpdated={myDoctorProfile?.updatedAt}
            verificationStatus={myDoctorProfile?.verificationStatus || 'PENDING'}
          />

          {/* Desktop Tab Selector Bar */}
          <div className="hidden lg:block">
            <DoctorProfileTabs
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              qualificationsCount={qualifications.length}
              experienceCount={experiences.length}
            />
          </div>

          {/* Main Grid: Left Column Summary + Right Column Tab Views */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column (Desktop 4 cols): Doctor Profile Card & Metrics */}
            <div className="lg:col-span-4 space-y-6">
              <DoctorProfileSummaryCard
                name={doctorName}
                avatar={avatar}
                qualifications={qualifications}
                qualificationsStr={qualificationsStr}
                department={department || 'General Medicine'}
                hospitalName={hospitalName}
                ratingAverage={myDoctorProfile?.ratingAverage ?? 0}
                reviewCount={myDoctorProfile?.reviewCount ?? 0}
                consultationFee={consultationFee}
                experienceYears={experienceYears}
                verificationStatus={myDoctorProfile?.verificationStatus || 'PENDING'}
                hospitalAffiliationStatus={
                  myDoctorProfile?.hospitalAffiliationStatus || 'NOT_AFFILIATED'
                }
                memberSince={formattedMemberSince}
                completionPercentage={completionPercentage}
                onChangeAvatarClick={() => setIsAvatarModalOpen(true)}
                onNavigateTab={(tab) => setActiveTab(tab as DoctorProfileTabKey)}
              />

              {/* Mobile Section Nav List (Matches right side of user mockup) */}
              <div className="lg:hidden">
                <DoctorMobileSectionNav
                  activeTab={activeTab}
                  onSelectTab={setActiveTab}
                  qualificationsCount={qualifications.length}
                  experienceCount={experiences.length}
                />
              </div>
            </div>

            {/* Right Column (Desktop 8 cols): Active Content Form Sections */}
            <div className="lg:col-span-8 space-y-6">
              {/* Tab 1: Personal & Professional (Full overview flow matching desktop mockup) */}
              {(activeTab === 'personal' || activeTab === 'qualifications' || activeTab === 'experience') && (
                <>
                  {/* Basic Information Card */}
                  <DoctorBasicInfoCard
                    department={department}
                    specializations={specializations}
                    experienceYears={experienceYears}
                    consultationFee={consultationFee}
                    bio={bio}
                    onDepartmentChange={setDepartment}
                    onAddSpecialization={(spec) =>
                      setSpecializations((prev) =>
                        prev.includes(spec) ? prev : [...prev, spec]
                      )
                    }
                    onRemoveSpecialization={(spec) =>
                      setSpecializations((prev) => prev.filter((s) => s !== spec))
                    }
                    onExperienceYearsChange={setExperienceYears}
                    onConsultationFeeChange={setConsultationFee}
                    onBioChange={setBio}
                  />

                  {/* Qualifications Card */}
                  <DoctorQualificationsCard
                    qualifications={qualifications}
                    onAddClick={() => {
                      setEditingQualIndex(null)
                      setIsQualModalOpen(true)
                    }}
                    onEditClick={(idx) => {
                      setEditingQualIndex(idx)
                      setIsQualModalOpen(true)
                    }}
                    onDeleteClick={handleDeleteQualification}
                  />

                  {/* Medical Council Registration Card */}
                  <DoctorMedicalCouncilCard
                    registrationNumber={registrationNumber}
                    licenseDocumentUrl={licenseDocumentUrl}
                    onRegistrationNumberChange={setRegistrationNumber}
                    onLicenseDocumentUrlChange={setLicenseDocumentUrl}
                    onPreviewDocument={() => {
                      setPreviewDocUrl(licenseDocumentUrl)
                      setPreviewDocTitle('Medical Council Registration Certificate')
                      setIsPreviewModalOpen(true)
                    }}
                  />

                  {/* Professional Experience Card */}
                  <DoctorExperienceCard
                    experiences={experiences}
                    onAddClick={() => {
                      setEditingExpIndex(null)
                      setIsExpModalOpen(true)
                    }}
                    onEditClick={(idx) => {
                      setEditingExpIndex(idx)
                      setIsExpModalOpen(true)
                    }}
                    onDeleteClick={handleDeleteExperience}
                  />
                </>
              )}

              {/* Tab 4: Schedule & Availability */}
              {activeTab === 'schedule' && (
                <DoctorScheduleTab
                  scheduleRules={myDoctorProfile?.scheduleRules || scheduleRules}
                  consultationFee={consultationFee}
                />
              )}

              {/* Tab 5: Hospital Affiliation */}
              {activeTab === 'hospital' && (
                <DoctorHospitalTab
                  hospitalId={myDoctorProfile?.hospitalId as any}
                  hospitalAffiliationStatus={
                    myDoctorProfile?.hospitalAffiliationStatus || 'APPROVED'
                  }
                  doctorDepartment={department}
                  onAffiliationUpdated={fetchMyDoctorProfile}
                />
              )}

              {/* Tab 6: Documents */}
              {activeTab === 'documents' && (
                <DoctorDocumentsTab
                  licenseDocumentUrl={licenseDocumentUrl}
                  registrationNumber={registrationNumber}
                  verificationStatus={myDoctorProfile?.verificationStatus}
                  rejectionReason={myDoctorProfile?.rejectionReason}
                  onLicenseDocumentChange={setLicenseDocumentUrl}
                  onPreviewDocument={(url, title) => {
                    setPreviewDocUrl(url || licenseDocumentUrl)
                    setPreviewDocTitle(title || 'Document Preview')
                    setIsPreviewModalOpen(true)
                  }}
                />
              )}
            </div>
          </div>

          {/* Sticky Bottom Action Bar */}
          <DoctorProfileBottomBar
            onDiscard={handleDiscardChanges}
            onSaveDraft={() => handleSaveProfile(false)}
            onUpdateProfile={() => handleSaveProfile(false)}
            isSaving={isSavingProfile}
            hasChanges={true}
          />
        </main>
      </div>

      {/* Add / Edit Qualification Modal */}
      <QualificationModal
        isOpen={isQualModalOpen}
        onClose={() => {
          setIsQualModalOpen(false)
          setEditingQualIndex(null)
        }}
        onSave={(data) => {
          if (editingQualIndex !== null) {
            handleUpdateQualification(data)
          } else {
            handleAddQualification(data)
          }
        }}
        initialData={
          editingQualIndex !== null ? qualifications[editingQualIndex] : null
        }
      />

      {/* Add / Edit Experience Modal */}
      <ExperienceModal
        isOpen={isExpModalOpen}
        onClose={() => {
          setIsExpModalOpen(false)
          setEditingExpIndex(null)
        }}
        onSave={(data) => {
          if (editingExpIndex !== null) {
            handleUpdateExperience(data)
          } else {
            handleAddExperience(data)
          }
        }}
        initialData={
          editingExpIndex !== null ? experiences[editingExpIndex] : null
        }
      />

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        documentUrl={previewDocUrl}
        title={previewDocTitle}
      />

      {/* Change Avatar Modal */}
      <AvatarModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        onSelectAvatar={(newAvatar) => {
          setAvatar(newAvatar)
          toast.success('Avatar selected! Click Update Profile to save.')
        }}
        currentAvatar={avatar}
      />
    </div>
  )
}

export default DoctorProfilePage
