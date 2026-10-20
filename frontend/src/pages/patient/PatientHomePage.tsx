import { useState, useEffect, useMemo, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { PatientSidebar } from '@/components/patient/PatientSidebar'
import { PatientHeader } from '@/components/patient/PatientHeader'
import { PatientHeroBanner } from '@/components/patient/PatientHeroBanner'
import { SpecialtiesRow } from '@/components/patient/SpecialtiesRow'
import { HospitalCard } from '@/components/patient/HospitalCard'
import { AppointmentsWidget } from '@/components/patient/AppointmentsWidget'
import { QuickActionsWidget } from '@/components/patient/QuickActionsWidget'
import { HealthTipsWidget } from '@/components/patient/HealthTipsWidget'
import { TopDoctorsSection } from '@/components/patient/TopDoctorsSection'
import { PatientVitalsWidget } from '@/components/patient/PatientVitalsWidget'
import { MobileBottomNav } from '@/components/patient/MobileBottomNav'
import { HospitalDetailModal } from '@/components/patient/HospitalDetailModal'
import { BookAppointmentModal } from '@/components/patient/BookAppointmentModal'
import { UploadReportModal } from '@/components/patient/UploadReportModal'

import apolloImg from '@/assets/apollo-hospital.jpg'
import cityCareImg from '@/assets/city-care-hospital.jpg'
import shreeSaiImg from '@/assets/shree-sai-hospital.jpg'
import lifecareImg from '@/assets/lifecare-hospital.jpg'
import drPriyaImg from '@/assets/dr-priya-sharma.jpg'
import drRajeshImg from '@/assets/dr-rajesh-verma.jpg'
import drSnehaImg from '@/assets/dr-sneha-patel.jpg'
import drAmitImg from '@/assets/dr-amit-singh.jpg'

import type { HospitalCardData, DoctorCardData, AppointmentCardData } from '@/types/patient'
import { fetchHospitalsListApi, fetchMyPatientAppointmentsApi } from '@/services/patientService'
import { useDoctorStore } from '@/store/doctorStore'
import { Filter, Building2 } from 'lucide-react'

export const PatientHomePage: FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  // State
  const [activeTab, setActiveTab] = useState('home')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState('All Cities')
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null)
  const [hospitalFilter, setHospitalFilter] = useState<'all' | 'top-rated' | 'emergency' | 'near-me'>('all')
  const [isSidebarDrawerOpen, setIsSidebarDrawerOpen] = useState(false)

  // Interactive Modals
  const [selectedHospitalForModal, setSelectedHospitalForModal] = useState<HospitalCardData | null>(null)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [preselectedDoctor, setPreselectedDoctor] = useState<DoctorCardData | null>(null)
  const [preselectedHospital, setPreselectedHospital] = useState<HospitalCardData | null>(null)

  // Mock initial data matching mockup exactly
  const initialHospitals: HospitalCardData[] = [
    {
      _id: 'hosp-1',
      name: 'Apollo Multispeciality Hospital',
      image: apolloImg,
      rating: 4.8,
      distance: '2.3 km',
      location: 'Civil Lines, Bilaspur',
      tags: ['24/7 Emergency', 'ICU', 'Pharmacy'],
      departments: ['General Medicine', 'Cardiology', 'Orthopedics', 'Pediatrics', 'ICU'],
      phoneNumber: '07752-494000',
    },
    {
      _id: 'hosp-2',
      name: 'City Care Hospital',
      image: cityCareImg,
      rating: 4.5,
      distance: '3.1 km',
      location: 'Vyapar Vihar, Bilaspur',
      tags: ['General Medicine', 'Surgery'],
      departments: ['General Medicine', 'Surgery', 'Pediatrics'],
      phoneNumber: '07752-421111',
    },
    {
      _id: 'hosp-3',
      name: 'Shree Sai Hospital',
      image: shreeSaiImg,
      rating: 4.4,
      distance: '4.6 km',
      location: 'Talapara, Bilaspur',
      tags: ['Cardiology', 'Orthopedics'],
      departments: ['Cardiology', 'Orthopedics', 'Dentistry'],
      phoneNumber: '07752-234567',
    },
    {
      _id: 'hosp-4',
      name: 'LifeCare Hospital',
      image: lifecareImg,
      rating: 4.3,
      distance: '5.0 km',
      location: 'Koni Road, Bilaspur',
      tags: ['Pediatrics', 'Gynecology', 'Dermatology'],
      departments: ['Pediatrics', 'Gynecology', 'Dermatology', 'Neurology'],
      phoneNumber: '07752-289000',
    },
  ]

  const initialDoctors: DoctorCardData[] = [
    {
      _id: 'doc-1',
      name: 'Dr. Priya Sharma',
      specialty: 'General Physician',
      rating: 4.8,
      reviewCount: 320,
      experienceYears: 8,
      hospitalName: 'Apollo Multispeciality Hospital',
      avatar: drPriyaImg,
    },
    {
      _id: 'doc-2',
      name: 'Dr. Rajesh Verma',
      specialty: 'Cardiologist',
      rating: 4.7,
      reviewCount: 280,
      experienceYears: 12,
      hospitalName: 'City Care Hospital',
      avatar: drRajeshImg,
    },
    {
      _id: 'doc-3',
      name: 'Dr. Sneha Patel',
      specialty: 'Dermatologist',
      rating: 4.6,
      reviewCount: 210,
      experienceYears: 6,
      hospitalName: 'Apollo Multispeciality Hospital',
      avatar: drSnehaImg,
    },
    {
      _id: 'doc-4',
      name: 'Dr. Amit Singh',
      specialty: 'Orthopedist',
      rating: 4.5,
      reviewCount: 190,
      experienceYears: 10,
      hospitalName: 'City Care Hospital',
      avatar: drAmitImg,
    },
  ]

  const initialAppointments: AppointmentCardData[] = [
    {
      _id: 'appt-1',
      doctorName: 'Dr. Priya Sharma',
      doctorSpecialty: 'General Physician',
      doctorAvatar: drPriyaImg,
      hospitalName: 'Apollo Multispeciality Hospital',
      date: 'Mon, 20 Oct 2026',
      time: '10:30 AM',
      status: 'Confirmed',
    },
    {
      _id: 'appt-2',
      doctorName: 'Dr. Amit Singh',
      doctorSpecialty: 'Orthopedist',
      doctorAvatar: drAmitImg,
      hospitalName: 'City Care Hospital',
      date: 'Wed, 25 Oct 2026',
      time: '04:00 PM',
      status: 'Pending',
    },
  ]

  const [hospitals, setHospitals] = useState<HospitalCardData[]>(initialHospitals)
  const [appointments, setAppointments] = useState<AppointmentCardData[]>(initialAppointments)

  // Doctor Store Integration
  const { doctors: storeDoctors, fetchDoctors } = useDoctorStore()

  // Try fetching dynamic data from backend if available
  useEffect(() => {
    async function loadData() {
      // Fetch live doctors from database
      fetchDoctors(1, true)

      const serverHospitals = await fetchHospitalsListApi()
      if (serverHospitals?.hospitals && serverHospitals.hospitals.length > 0) {
        setHospitals(
          serverHospitals.hospitals.map((h, i) => ({
            ...h,
            image: h.image || initialHospitals[i % initialHospitals.length].image,
          }))
        )
      }

      const serverAppts = await fetchMyPatientAppointmentsApi()
      if (serverAppts && serverAppts.length > 0) {
        setAppointments(serverAppts)
      }
    }
    loadData()
  }, [fetchDoctors])

  // Filter hospitals based on search, specialty, and quick filters
  const filteredHospitals = useMemo(() => {
    return hospitals.filter((h) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesSpecialty =
        !selectedSpecialty ||
        h.tags.some((t) => t.toLowerCase().includes(selectedSpecialty.toLowerCase())) ||
        (h.departments &&
          h.departments.some((d) => d.toLowerCase().includes(selectedSpecialty.toLowerCase())))

      let matchesQuick = true
      if (hospitalFilter === 'top-rated') {
        matchesQuick = h.rating >= 4.5
      } else if (hospitalFilter === 'emergency') {
        matchesQuick = h.tags.some((t) => t.toLowerCase().includes('emergency') || t.toLowerCase().includes('icu'))
      } else if (hospitalFilter === 'near-me') {
        const km = parseFloat(h.distance) || 5
        matchesQuick = km <= 3.5
      }

      return matchesSearch && matchesSpecialty && matchesQuick
    })
  }, [hospitals, searchQuery, selectedSpecialty, hospitalFilter])

  // Active doctors list: uses live database doctors if available, otherwise initial mock
  const activeDoctorsList = storeDoctors.length > 0 ? storeDoctors : initialDoctors

  // Filter doctors based on search and specialty
  const filteredDoctors = useMemo(() => {
    return activeDoctorsList.filter((d) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.hospitalName.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesSpecialty =
        !selectedSpecialty || d.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase())

      return matchesSearch && matchesSpecialty
    })
  }, [activeDoctorsList, searchQuery, selectedSpecialty])

  const handleOpenBooking = (doc?: DoctorCardData, hosp?: HospitalCardData) => {
    setPreselectedDoctor(doc || null)
    setPreselectedHospital(hosp || null)
    setIsBookingModalOpen(true)
  }

  const handleAppointmentBooked = (newAppt: AppointmentCardData) => {
    setAppointments((prev) => [newAppt, ...prev])
  }

  const patientDisplayName = user?.name || 'Ravi Tiwari'

  return (
    <div className="min-h-screen bg-[#f8fbff] text-slate-900 selection:bg-blue-100 selection:text-blue-700 flex flex-col antialiased">
      {/* Top Header - Always visible with full CarePlus brand */}
      <PatientHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCity={selectedCity}
        onSelectCity={setSelectedCity}
        onToggleSidebar={() => setIsSidebarDrawerOpen(!isSidebarDrawerOpen)}
      />

      <div className="flex-1 flex w-full">
        {/* Collapsible Slide-out Sidebar Drawer for All Screen Sizes */}
        {isSidebarDrawerOpen && (
          <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
              onClick={() => setIsSidebarDrawerOpen(false)}
            />
            {/* Slide-out Drawer */}
            <div className="relative z-10 animate-in slide-in-from-left duration-200">
              <PatientSidebar
                activeTab={activeTab}
                onSelectTab={(tab) => {
                  setActiveTab(tab)
                  setIsSidebarDrawerOpen(false)
                  if (tab === 'hospitals') navigate('/patient/hospitals')
                  if (tab === 'doctors') navigate('/patient/doctors')
                }}
                isMobileDrawer={true}
                onCloseDrawer={() => setIsSidebarDrawerOpen(false)}
                onOpenBookingModal={() => {
                  setIsSidebarDrawerOpen(false)
                  handleOpenBooking()
                }}
                onOpenUploadModal={() => {
                  setIsSidebarDrawerOpen(false)
                  setIsUploadModalOpen(true)
                }}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-10">
          <main className="flex-1 w-full max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8 2xl:px-10 py-5 sm:py-7 space-y-6 sm:space-y-8">
            {/* Hero Section */}
            <PatientHeroBanner
              patientName={patientDisplayName}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSearchSubmit={() => {}}
              selectedCity={selectedCity}
            />

            {/* Specialty Categories */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Browse by Specialties
                </span>
                {selectedSpecialty && (
                  <button
                    onClick={() => setSelectedSpecialty(null)}
                    className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                  >
                    Clear Filter ({selectedSpecialty})
                  </button>
                )}
              </div>
              <SpecialtiesRow
                selectedSpecialty={selectedSpecialty}
                onSelectSpecialty={setSelectedSpecialty}
              />
            </section>

            {/* Main Content Grid: 2 columns (Left: Hospitals & Doctors | Right: Appointments & Vitals) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
              {/* Left / Center Column (Col 8 on lg) */}
              <div className="lg:col-span-8 space-y-8">
                {/* Top Hospitals Near You Section */}
                <section className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                        Top Hospitals Near You
                      </h2>
                      {selectedSpecialty && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-1">
                          <Filter className="size-3" />
                          {selectedSpecialty}
                        </span>
                      )}
                    </div>

                    {/* Interactive Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                      {[
                        { id: 'all', label: 'All Hospitals' },
                        { id: 'top-rated', label: '⭐ 4.5+ Rated' },
                        { id: 'emergency', label: '🚨 24/7 Emergency' },
                        { id: 'near-me', label: '📍 < 3.5 km' },
                      ].map((f) => (
                        <button
                          key={f.id}
                          onClick={() => setHospitalFilter(f.id as any)}
                          className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                            hospitalFilter === f.id
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {filteredHospitals.length === 0 ? (
                    <div className="bg-white rounded-3xl p-8 border border-slate-200/80 text-center space-y-2">
                      <Building2 className="size-10 text-slate-300 mx-auto" />
                      <p className="text-sm font-bold text-slate-700">
                        No hospitals match your search or filter criteria.
                      </p>
                      <button
                        onClick={() => {
                          setSearchQuery('')
                          setSelectedSpecialty(null)
                          setHospitalFilter('all')
                        }}
                        className="text-xs font-semibold text-blue-600 underline cursor-pointer"
                      >
                        Reset all filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                      {filteredHospitals.map((hospital) => (
                        <HospitalCard
                          key={hospital._id}
                          hospital={hospital}
                          onViewDetails={(h) => setSelectedHospitalForModal(h)}
                        />
                      ))}
                    </div>
                  )}
                </section>

                {/* Top Doctors Near You - Upgraded 2-column cards with full genuine portraits */}
                <TopDoctorsSection
                  doctors={filteredDoctors}
                  onSelectDoctor={(doc) => handleOpenBooking(doc)}
                  onBookDoctor={(doc) => handleOpenBooking(doc)}
                />
              </div>

              {/* Right Column / Widgets (Col 4 on lg) */}
              <div className="lg:col-span-4 space-y-6">
                {/* Upcoming Appointments */}
                <AppointmentsWidget
                  appointments={appointments}
                  onViewAll={() => setActiveTab('appointments')}
                  onSelectAppointment={(appt) => {
                    alert(`Viewing appointment details with ${appt.doctorName} on ${appt.date}`)
                  }}
                />

                {/* Quick Actions (6 colorful tiles) */}
                <QuickActionsWidget
                  onOpenBooking={() => handleOpenBooking()}
                  onFindDoctors={() => {
                    navigate('/patient/doctors')
                  }}
                  onFindHospitals={() => {
                    window.scrollTo({ top: 400, behavior: 'smooth' })
                  }}
                  onOpenLabTests={() => {
                    alert('CarePlus Diagnostic Lab Booking is active! Pick from CBC, Lipid Profile, etc.')
                  }}
                  onOpenPrescriptions={() => {
                    alert('Accessing your electronic digital prescriptions.')
                  }}
                  onUploadReport={() => setIsUploadModalOpen(true)}
                />

                {/* Patient Vitals & Health Summary Widget */}
                <PatientVitalsWidget />

                {/* Health Tips Card */}
                <HealthTipsWidget />
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Sticky Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab)
          if (tab === 'hospitals') navigate('/patient/hospitals')
          else if (tab === 'doctors') navigate('/patient/doctors')
          else if (tab === 'home') navigate('/patient/home')
          else if (tab === 'profile') setIsSidebarDrawerOpen(true)
        }}
      />

      {/* Interactive Modals */}
      <HospitalDetailModal
        hospital={selectedHospitalForModal}
        onClose={() => setSelectedHospitalForModal(null)}
        onBookAppointment={(hosp) => {
          setSelectedHospitalForModal(null)
          handleOpenBooking(undefined, hosp)
        }}
      />

      <BookAppointmentModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        preselectedDoctor={preselectedDoctor}
        preselectedHospital={preselectedHospital}
        doctorsList={activeDoctorsList}
        onAppointmentBooked={handleAppointmentBooked}
      />

      <UploadReportModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  )
}

export default PatientHomePage
