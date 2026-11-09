import { useEffect, useState, useMemo, type FC } from 'react'
import {
  User,
  MapPin,
  PhoneCall,
  HeartPulse,
  Save,
  RotateCcw,
  Loader2,
} from 'lucide-react'
import { PatientHeader } from '@/components/patient/PatientHeader'
import { PatientSidebar } from '@/components/patient/PatientSidebar'
import { MobileBottomNav } from '@/components/patient/MobileBottomNav'
import {
  PatientProfileHeroCard,
  PatientPersonalInfoTab,
  PatientAddressTab,
  PatientEmergencyContactTab,
  PatientMedicalHistoryTab,
  PatientAvatarModal,
} from '@/components/patient/profile'
import { usePatientStore } from '@/store/patientStore'
import { toast } from '@/store/toastStore'

type ProfileTabKey = 'personal' | 'address' | 'emergency' | 'medical'

export const PatientProfilePage: FC = () => {
  const [isSidebarDrawerOpen, setIsSidebarDrawerOpen] = useState(false)
  const [selectedCity, setSelectedCity] = useState('All Cities')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<ProfileTabKey>('personal')
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false)

  const {
    profile,
    isLoadingProfile,
    isSavingProfile,
    fetchPatientProfile,
    updatePatientProfile,
    records,
  } = usePatientStore()

  // ─────────────────────────────────────────────────────────────────
  // FORM STATES (Editable locally before saving)
  // ─────────────────────────────────────────────────────────────────
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [avatar, setAvatar] = useState('')
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null)

  const [dateOfBirth, setDateOfBirth] = useState('')
  const [gender, setGender] = useState('')
  const [bloodGroup, setBloodGroup] = useState('')

  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [country, setCountry] = useState('India')

  const [emergencyName, setEmergencyName] = useState('')
  const [emergencyRelationship, setEmergencyRelationship] = useState('')
  const [emergencyPhone, setEmergencyPhone] = useState('')

  const [allergies, setAllergies] = useState<string[]>([])
  const [chronicDiseases, setChronicDiseases] = useState<string[]>([])
  const [pastSurgeries, setPastSurgeries] = useState<string[]>([])
  const [currentMedications, setCurrentMedications] = useState<string[]>([])

  // Load patient profile on initial mount
  useEffect(() => {
    fetchPatientProfile()
  }, [])

  // Populate local form fields when backend profile loads or updates
  useEffect(() => {
    if (profile) {
      setName(profile.name || '')
      setEmail(profile.email || '')
      setPhoneNumber(profile.phoneNumber || '')
      setAvatar(profile.avatar || '')
      setPendingAvatarFile(null)

      if (profile.dateOfBirth) {
        try {
          const d = new Date(profile.dateOfBirth)
          if (!isNaN(d.getTime())) {
            setDateOfBirth(d.toISOString().split('T')[0])
          }
        } catch {
          setDateOfBirth('')
        }
      } else {
        setDateOfBirth('')
      }

      setGender(profile.gender || '')
      setBloodGroup(profile.bloodGroup || '')

      setStreet(profile.address?.street || '')
      setCity(profile.address?.city || '')
      setState(profile.address?.state || '')
      setZipCode(profile.address?.zipCode || '')
      setCountry(profile.address?.country || 'India')

      setEmergencyName(profile.emergencyContact?.name || '')
      setEmergencyRelationship(profile.emergencyContact?.relationship || '')
      setEmergencyPhone(profile.emergencyContact?.phoneNumber || '')

      setAllergies(Array.isArray(profile.allergies) ? profile.allergies : [])
      setChronicDiseases(
        Array.isArray(profile.chronicDiseases) ? profile.chronicDiseases : []
      )
      setPastSurgeries(
        Array.isArray(profile.pastSurgeries) ? profile.pastSurgeries : []
      )
      setCurrentMedications(
        Array.isArray(profile.currentMedications)
          ? profile.currentMedications
          : []
      )
    }
  }, [profile])

  // ─────────────────────────────────────────────────────────────────
  // CALCULATE PROFILE COMPLETENESS (0 - 100%)
  // ─────────────────────────────────────────────────────────────────
  const completeness = useMemo(() => {
    let score = 0
    if (name.trim()) score += 15
    if (email.trim()) score += 15
    if (phoneNumber.trim()) score += 15
    if (dateOfBirth) score += 10
    if (gender) score += 10
    if (bloodGroup) score += 10
    if (city.trim() || street.trim()) score += 10
    if (emergencyName.trim() && emergencyPhone.trim()) score += 15
    return Math.min(100, score)
  }, [
    name,
    email,
    phoneNumber,
    dateOfBirth,
    gender,
    bloodGroup,
    city,
    street,
    emergencyName,
    emergencyPhone,
  ])

  // ─────────────────────────────────────────────────────────────────
  // DETECT UNSAVED CHANGES
  // ─────────────────────────────────────────────────────────────────
  const hasChanges = useMemo(() => {
    if (!profile) return false
    if (pendingAvatarFile) return true
    if (name.trim() !== (profile.name || '').trim()) return true
    if (email.trim() !== (profile.email || '').trim()) return true
    if (phoneNumber.trim() !== (profile.phoneNumber || '').trim()) return true
    if (gender !== (profile.gender || '')) return true
    if (bloodGroup !== (profile.bloodGroup || '')) return true

    const origDob = profile.dateOfBirth
      ? new Date(profile.dateOfBirth).toISOString().split('T')[0]
      : ''
    if (dateOfBirth !== origDob) return true

    if (street.trim() !== (profile.address?.street || '').trim()) return true
    if (city.trim() !== (profile.address?.city || '').trim()) return true
    if (state.trim() !== (profile.address?.state || '').trim()) return true
    if (zipCode.trim() !== (profile.address?.zipCode || '').trim()) return true
    if (country.trim() !== (profile.address?.country || 'India').trim())
      return true

    if (
      emergencyName.trim() !== (profile.emergencyContact?.name || '').trim()
    )
      return true
    if (
      emergencyRelationship.trim() !==
      (profile.emergencyContact?.relationship || '').trim()
    )
      return true
    if (
      emergencyPhone.trim() !==
      (profile.emergencyContact?.phoneNumber || '').trim()
    )
      return true

    if (
      JSON.stringify(allergies) !==
      JSON.stringify(profile.allergies || [])
    )
      return true
    if (
      JSON.stringify(chronicDiseases) !==
      JSON.stringify(profile.chronicDiseases || [])
    )
      return true
    if (
      JSON.stringify(pastSurgeries) !==
      JSON.stringify(profile.pastSurgeries || [])
    )
      return true
    if (
      JSON.stringify(currentMedications) !==
      JSON.stringify(profile.currentMedications || [])
    )
      return true

    return false
  }, [
    profile,
    pendingAvatarFile,
    name,
    email,
    phoneNumber,
    dateOfBirth,
    gender,
    bloodGroup,
    street,
    city,
    state,
    zipCode,
    country,
    emergencyName,
    emergencyRelationship,
    emergencyPhone,
    allergies,
    chronicDiseases,
    pastSurgeries,
    currentMedications,
  ])

  // Reset form to latest profile state
  const handleReset = () => {
    if (!profile) return
    setName(profile.name || '')
    setEmail(profile.email || '')
    setPhoneNumber(profile.phoneNumber || '')
    setAvatar(profile.avatar || '')
    setPendingAvatarFile(null)
    setDateOfBirth(
      profile.dateOfBirth
        ? new Date(profile.dateOfBirth).toISOString().split('T')[0]
        : ''
    )
    setGender(profile.gender || '')
    setBloodGroup(profile.bloodGroup || '')
    setStreet(profile.address?.street || '')
    setCity(profile.address?.city || '')
    setState(profile.address?.state || '')
    setZipCode(profile.address?.zipCode || '')
    setCountry(profile.address?.country || 'India')
    setEmergencyName(profile.emergencyContact?.name || '')
    setEmergencyRelationship(profile.emergencyContact?.relationship || '')
    setEmergencyPhone(profile.emergencyContact?.phoneNumber || '')
    setAllergies(profile.allergies || [])
    setChronicDiseases(profile.chronicDiseases || [])
    setPastSurgeries(profile.pastSurgeries || [])
    setCurrentMedications(profile.currentMedications || [])
    toast.info('Changes reset to last saved profile')
  }

  // ─────────────────────────────────────────────────────────────────
  // SAVE PROFILE CHANGES
  // ─────────────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    if (!name.trim()) {
      toast.error('Full Name is required')
      setActiveTab('personal')
      return
    }

    if (!phoneNumber.trim()) {
      toast.error('Mobile phone number is required')
      setActiveTab('personal')
      return
    }

    try {
      if (pendingAvatarFile) {
        // Multi-part FormData when file is uploaded
        const formData = new FormData()
        formData.append('avatar', pendingAvatarFile)
        formData.append('name', name.trim())
        formData.append('email', email.trim())
        formData.append('phoneNumber', phoneNumber.trim())
        if (dateOfBirth) formData.append('dateOfBirth', dateOfBirth)
        if (gender) formData.append('gender', gender)
        if (bloodGroup) formData.append('bloodGroup', bloodGroup)

        formData.append(
          'address',
          JSON.stringify({
            street: street.trim(),
            city: city.trim(),
            state: state.trim(),
            zipCode: zipCode.trim(),
            country: country.trim() || 'India',
          })
        )

        formData.append(
          'emergencyContact',
          JSON.stringify({
            name: emergencyName.trim(),
            relationship: emergencyRelationship.trim(),
            phoneNumber: emergencyPhone.trim(),
          })
        )

        formData.append('allergies', JSON.stringify(allergies))
        formData.append('chronicDiseases', JSON.stringify(chronicDiseases))
        formData.append('pastSurgeries', JSON.stringify(pastSurgeries))
        formData.append(
          'currentMedications',
          JSON.stringify(currentMedications)
        )

        const success = await updatePatientProfile(formData)
        if (success) {
          toast.success('Profile details and photo updated successfully!')
          setPendingAvatarFile(null)
        } else {
          toast.error('Could not save profile changes. Please try again.')
        }
      } else {
        // Standard JSON payload
        const payload = {
          name: name.trim(),
          email: email.trim(),
          phoneNumber: phoneNumber.trim(),
          avatar: avatar.trim(),
          dateOfBirth: dateOfBirth || null,
          gender: gender || null,
          bloodGroup: bloodGroup || null,
          address: {
            street: street.trim(),
            city: city.trim(),
            state: state.trim(),
            zipCode: zipCode.trim(),
            country: country.trim() || 'India',
          },
          emergencyContact: {
            name: emergencyName.trim(),
            relationship: emergencyRelationship.trim(),
            phoneNumber: emergencyPhone.trim(),
          },
          allergies,
          chronicDiseases,
          pastSurgeries,
          currentMedications,
        }

        const success = await updatePatientProfile(payload)
        if (success) {
          toast.success('Profile details updated successfully!')
        } else {
          toast.error('Could not save profile changes. Please try again.')
        }
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error saving patient profile')
    }
  }

  // Handle immediate avatar upload & save from modal
  const handleSaveAvatar = async (file: File | null, urlString?: string) => {
    try {
      if (file) {
        // Upload immediately via FormData to backend
        const formData = new FormData()
        formData.append('avatar', file)
        const success = await updatePatientProfile(formData)
        if (success) {
          toast.success('Profile photo updated and saved successfully!')
          setPendingAvatarFile(null)
          return true
        } else {
          toast.error('Failed to upload profile photo. Please try again.')
          return false
        }
      } else if (urlString) {
        // Update immediately with preset or custom URL
        const success = await updatePatientProfile({ avatar: urlString.trim() })
        if (success) {
          toast.success('Profile photo updated successfully!')
          setPendingAvatarFile(null)
          setAvatar(urlString.trim())
          return true
        } else {
          toast.error('Failed to update profile photo.')
          return false
        }
      }
      return false
    } catch (err: any) {
      toast.error(err?.message || 'Error updating avatar')
      return false
    }
  }

  const tabs = [
    { id: 'personal' as ProfileTabKey, label: 'Personal & Identity', icon: User },
    { id: 'address' as ProfileTabKey, label: 'Residential Address', icon: MapPin },
    { id: 'emergency' as ProfileTabKey, label: 'Emergency Contact', icon: PhoneCall },
    { id: 'medical' as ProfileTabKey, label: 'Medical History', icon: HeartPulse },
  ]

  return (
    <div className="min-h-screen bg-[#f8fbff] flex flex-col font-sans select-none pb-24 md:pb-16">
      {/* Top Patient Header */}
      <PatientHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCity={selectedCity}
        onSelectCity={setSelectedCity}
        onToggleSidebar={() => setIsSidebarDrawerOpen(!isSidebarDrawerOpen)}
        isSidebarOpen={isSidebarDrawerOpen}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop Fixed Left Sidebar */}
        <div className="hidden md:block shrink-0">
          <PatientSidebar
            activeTab="profile"
            onSelectTab={() => {}}
          />
        </div>

        {/* Mobile Sidebar Drawer Overlay */}
        {isSidebarDrawerOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
              onClick={() => setIsSidebarDrawerOpen(false)}
            />
            <div className="relative z-10 w-72 bg-white h-full shadow-2xl">
              <PatientSidebar
                activeTab="profile"
                onSelectTab={() => setIsSidebarDrawerOpen(false)}
                isMobileDrawer={true}
                onCloseDrawer={() => setIsSidebarDrawerOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-6xl mx-auto w-full space-y-6 sm:space-y-8">
          {/* Hero Profile Overview Card */}
          <PatientProfileHeroCard
            name={name}
            email={email}
            phoneNumber={phoneNumber}
            avatar={avatar}
            bloodGroup={bloodGroup}
            gender={gender}
            dateOfBirth={dateOfBirth}
            city={city}
            totalReports={records.length}
            completeness={completeness}
            onOpenAvatarModal={() => setIsAvatarModalOpen(true)}
          />

          {/* Navigation Tab Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-slate-200/80">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 sm:px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold transition-all duration-200 cursor-pointer flex items-center gap-2 shrink-0 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#5170f4] to-[#637ff5] text-white shadow-md shadow-[#637ff5]/25 scale-[1.02]'
                      : 'bg-white text-slate-600 border border-slate-200/90 hover:border-[#c8d7fd] hover:text-[#5170f4]'
                  }`}
                >
                  <Icon className="size-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* Dynamic Active Tab Content Stage */}
          <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm p-6 sm:p-8">
            {isLoadingProfile ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-3">
                <Loader2 className="size-8 text-[#5170f4] animate-spin" />
                <p className="text-xs font-bold text-slate-500">Loading your profile details...</p>
              </div>
            ) : (
              <>
                {activeTab === 'personal' && (
                  <PatientPersonalInfoTab
                    name={name}
                    onChangeName={setName}
                    email={email}
                    onChangeEmail={setEmail}
                    phoneNumber={phoneNumber}
                    onChangePhoneNumber={setPhoneNumber}
                    dateOfBirth={dateOfBirth}
                    onChangeDateOfBirth={setDateOfBirth}
                    gender={gender}
                    onChangeGender={setGender}
                    bloodGroup={bloodGroup}
                    onChangeBloodGroup={setBloodGroup}
                  />
                )}

                {activeTab === 'address' && (
                  <PatientAddressTab
                    street={street}
                    onChangeStreet={setStreet}
                    city={city}
                    onChangeCity={setCity}
                    state={state}
                    onChangeState={setState}
                    zipCode={zipCode}
                    onChangeZipCode={setZipCode}
                    country={country}
                    onChangeCountry={setCountry}
                  />
                )}

                {activeTab === 'emergency' && (
                  <PatientEmergencyContactTab
                    name={emergencyName}
                    onChangeName={setEmergencyName}
                    relationship={emergencyRelationship}
                    onChangeRelationship={setEmergencyRelationship}
                    phoneNumber={emergencyPhone}
                    onChangePhoneNumber={setEmergencyPhone}
                  />
                )}

                {activeTab === 'medical' && (
                  <PatientMedicalHistoryTab
                    allergies={allergies}
                    onChangeAllergies={setAllergies}
                    chronicDiseases={chronicDiseases}
                    onChangeChronicDiseases={setChronicDiseases}
                    pastSurgeries={pastSurgeries}
                    onChangePastSurgeries={setPastSurgeries}
                    currentMedications={currentMedications}
                    onChangeCurrentMedications={setCurrentMedications}
                  />
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          STICKY BOTTOM FLOATING SAVE/DISCARD ACTION BAR
          Visible whenever the patient makes changes to any field
          ───────────────────────────────────────────────────────────── */}
      {hasChanges && (
        <div className="fixed bottom-16 md:bottom-6 left-0 right-0 z-40 px-4 pointer-events-none">
          <div className="max-w-2xl mx-auto rounded-2xl bg-slate-900/95 backdrop-blur-md text-white p-3.5 sm:p-4 shadow-2xl border border-slate-700/80 flex items-center justify-between gap-3 pointer-events-auto animate-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="relative flex size-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-2.5 bg-amber-500" />
              </span>
              <div className="truncate">
                <p className="text-xs sm:text-sm font-black truncate">
                  You have unsaved changes
                </p>
                <p className="text-[10px] sm:text-xs text-slate-400 truncate">
                  Changes will not be applied until you save
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleReset}
                disabled={isSavingProfile}
                className="px-3 sm:px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <RotateCcw className="size-3.5" />
                <span className="hidden sm:inline">Discard</span>
              </button>

              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
                className="px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-[#5170f4] to-[#637ff5] hover:from-[#4361ee] hover:to-[#5170f4] text-white text-xs font-black shadow-md shadow-[#637ff5]/30 flex items-center gap-2 cursor-pointer active:scale-95 transition-all disabled:opacity-50"
              >
                {isSavingProfile ? (
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
          </div>
        </div>
      )}

      {/* Avatar Upload Modal */}
      <PatientAvatarModal
        isOpen={isAvatarModalOpen}
        currentAvatar={avatar}
        patientName={name}
        onClose={() => setIsAvatarModalOpen(false)}
        onSaveAvatar={handleSaveAvatar}
      />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav activeTab="profile" />
    </div>
  )
}
