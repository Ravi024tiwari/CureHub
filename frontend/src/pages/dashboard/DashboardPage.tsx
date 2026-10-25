import { useEffect, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { PatientHomePage } from '@/pages/patient'
import { HospitalAdminDashboardPage } from '@/pages/hospital-admin'
import { SuperAdminDashboardPage } from '@/pages/super-admin'
import { DoctorVerificationOnboardingPage, DoctorDashboardPage } from '@/pages/doctor'
import { UserRole } from '@/types/auth'

export const DashboardPage: FC = () => {
  const navigate = useNavigate()
  const { user, fetchMe } = useAuthStore()

  useEffect(() => {
    // If not authenticated in Zustand store, redirect to login
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  useEffect(() => {
    // Fetch latest user details only once on mount to prevent infinite loop
    fetchMe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!user) {
    return null
  }

  // 1. Patient Portal
  if (user.role === UserRole.PATIENT) {
    return <PatientHomePage />
  }

  // 2. Hospital Admin Portal
  if (user.role === UserRole.HOSPITAL_ADMIN) {
    return <HospitalAdminDashboardPage />
  }

  // 3. Super Admin Console
  if (user.role === UserRole.SUPER_ADMIN) {
    return <SuperAdminDashboardPage />
  }

  // 4. Doctor Portal
  if (user.role === UserRole.DOCTOR) {
    // Unapproved doctors are routed to onboarding/verification
    if (!user.isAccountApproved) {
      return <DoctorVerificationOnboardingPage />
    }
    // Verified doctors get the production-grade clinical practice dashboard
    return <DoctorDashboardPage />
  }

  return null
}

export default DashboardPage
