import { useState, type FC } from 'react'
import { LandingNavbar } from '@/components/landing/LandingNavbar'
import { LandingHero } from '@/components/landing/LandingHero'
import { LandingStatsTicker } from '@/components/landing/LandingStatsTicker'
import { LandingCapsuleShowcase } from '@/components/landing/LandingCapsuleShowcase'
import { LandingSpecialtiesGrid } from '@/components/landing/LandingSpecialtiesGrid'
import { LandingDoctorMarquee } from '@/components/landing/LandingDoctorMarquee'
import { LandingHowItWorks } from '@/components/landing/LandingHowItWorks'
import { LandingHospitalSpotlight } from '@/components/landing/LandingHospitalSpotlight'
import { LandingArticlesSection } from '@/components/landing/LandingArticlesSection'
import { LandingTestimonials } from '@/components/landing/LandingTestimonials'
import { LandingCtaBanner } from '@/components/landing/LandingCtaBanner'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { LandingEmergencyModal } from '@/components/landing/LandingEmergencyModal'
import { BookAppointmentModal } from '@/components/patient/BookAppointmentModal'
import { useAuthStore } from '@/store/authStore'
import type { DoctorCardData } from '@/types/patient'

import drPriyaImg from '@/assets/dr-priya-sharma.jpg'

export const LandingPage: FC = () => {
  const { isAuthenticated } = useAuthStore()

  // Modals state
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<DoctorCardData | null>(null)

  const handleOpenBooking = (doctor?: DoctorCardData) => {
    if (!isAuthenticated) {
      setSelectedDoctorForBooking(doctor || null)
      setIsBookingModalOpen(true)
    } else {
      setSelectedDoctorForBooking(doctor || null)
      setIsBookingModalOpen(true)
    }
  }

  const defaultDoctor: DoctorCardData = {
    _id: 'doc-hero',
    name: 'Dr. Priya Sharma',
    avatar: drPriyaImg,
    specialty: 'Cardiologist',
    department: 'Cardiology',
    qualifications: ['MBBS', 'MD', 'DM (Cardiology)'],
    experienceYears: 12,
    consultationFee: 800,
    rating: 4.9,
    reviewCount: 340,
    hospitalName: 'Apollo Hospital',
    hospitalLocation: 'Bilaspur',
  }

  return (
    <div className="min-h-screen bg-[#f8fbff] text-slate-900 selection:bg-blue-600 selection:text-white flex flex-col antialiased">
      {/* 1. Sticky Glassmorphism Header */}
      <LandingNavbar
        onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
        onBookConsultationClick={() => handleOpenBooking(defaultDoctor)}
      />

      {/* Main Landing Page Content */}
      <main className="flex-1">
        {/* 2. Hero Section + PureMed Animated 3D Capsule */}
        <LandingHero onBookClick={() => handleOpenBooking(defaultDoctor)} />

        {/* 3. Sentracare Animated Rolling Stats Ticker */}
        <LandingStatsTicker />

        {/* 3.5 PureMed 3D Holographic Medical Capsule Showcase */}
        <LandingCapsuleShowcase onBookClick={() => handleOpenBooking(defaultDoctor)} />

        {/* 4. Interactive Specialties & Clinical Departments Explorer */}
        <LandingSpecialtiesGrid />

        {/* 5. StarMedical Continuous Dual-Row Moving Doctors Marquee */}
        <LandingDoctorMarquee onBookDoctor={(doc) => handleOpenBooking(doc)} />

        {/* 6. "How CarePlus Works" 4-Step Patient Journey */}
        <LandingHowItWorks />

        {/* 7. Accredited Hospital Network & 24/7 Emergency Care */}
        <LandingHospitalSpotlight
          onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
        />

        {/* 8. Doctor-Authored Health Articles Preview */}
        <LandingArticlesSection />

        {/* 9. Patient Stories & Security Trust Proof */}
        <LandingTestimonials />

        {/* 10. High-Impact Call To Action Banner */}
        <LandingCtaBanner onBookClick={() => handleOpenBooking(defaultDoctor)} />
      </main>

      {/* 11. Multi-Column Comprehensive Footer */}
      <LandingFooter onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)} />

      {/* 12. 24/7 Emergency SOS Modal */}
      <LandingEmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
      />

      {/* 13. Interactive Book Appointment Modal */}
      <BookAppointmentModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        preselectedDoctor={selectedDoctorForBooking || defaultDoctor}
        doctorsList={selectedDoctorForBooking ? [selectedDoctorForBooking] : [defaultDoctor]}
      />
    </div>
  )
}

export default LandingPage
