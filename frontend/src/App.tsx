import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import {
  LoginPage,
  PatientRegisterPage,
  DoctorRegisterPage,
  HospitalAdminRegisterPage,
} from '@/pages/auth'

import {
  PatientHomePage,
  FindDoctorsPage,
  DoctorDetailPage,
  FindHospitalsPage,
  PatientAppointmentsPage,
  PatientMedicalRecordsPage,
} from '@/pages/patient'
import { DashboardPage } from '@/pages/dashboard'
import {
  HospitalAdminDashboardPage,
  HospitalAdminHospitalsPage,
  AddNewHospitalPage,
  HospitalDetailPage,
} from '@/pages/hospital-admin'
import {
  SuperAdminDashboardPage,
  DoctorVerificationPage,
  SuperAdminDoctorsPage,
} from '@/pages/super-admin'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default route redirects to Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signin" element={<Navigate to="/login" replace />} />

        {/* Dedicated role-based registration routes */}
        <Route path="/register" element={<Navigate to="/register/patient" replace />} />
        <Route path="/register/patient" element={<PatientRegisterPage />} />
        <Route path="/register/doctor" element={<DoctorRegisterPage />} />
        <Route path="/register/hospital-admin" element={<HospitalAdminRegisterPage />} />

        {/* Dedicated Patient Pages */}
        <Route path="/patient/home" element={<PatientHomePage />} />
        <Route path="/patient/doctors" element={<FindDoctorsPage />} />
        <Route path="/doctors" element={<FindDoctorsPage />} />
        <Route path="/patient/doctors/:id" element={<DoctorDetailPage />} />
        <Route path="/doctors/:id" element={<DoctorDetailPage />} />
        <Route path="/patient/hospitals" element={<FindHospitalsPage />} />
        <Route path="/hospitals" element={<FindHospitalsPage />} />
        <Route path="/patient/appointments" element={<PatientAppointmentsPage />} />
        <Route path="/appointments" element={<PatientAppointmentsPage />} />
        <Route path="/patient/records" element={<PatientMedicalRecordsPage />} />
        <Route path="/records" element={<PatientMedicalRecordsPage />} />
        <Route path="/patient/medical-records" element={<PatientMedicalRecordsPage />} />

        {/* Logged in Dashboard */}
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Dedicated Hospital Admin Routes */}
        <Route path="/hospital-admin/dashboard" element={<HospitalAdminDashboardPage />} />
        <Route path="/hospital-admin/hospitals" element={<HospitalAdminHospitalsPage />} />
        <Route path="/hospital-admin/hospitals/new" element={<AddNewHospitalPage />} />
        <Route path="/hospital-admin/hospitals/:id" element={<HospitalDetailPage />} />
        <Route path="/hospital-admin/hospitals/:id/edit" element={<AddNewHospitalPage />} />
        <Route path="/hospital-admin/hospitals/add" element={<Navigate to="/hospital-admin/hospitals/new" replace />} />
        <Route path="/hospital-admin/add-hospital" element={<Navigate to="/hospital-admin/hospitals/new" replace />} />

        {/* Dedicated Super Admin Routes */}
        <Route path="/super-admin/dashboard" element={<SuperAdminDashboardPage />} />
        <Route path="/super-admin/verifications" element={<DoctorVerificationPage />} />
        <Route path="/super-admin/doctors/verifications" element={<Navigate to="/super-admin/verifications" replace />} />
        <Route path="/super-admin/doctors" element={<SuperAdminDoctorsPage />} />
        <Route path="/super-admin" element={<Navigate to="/super-admin/dashboard" replace />} />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
