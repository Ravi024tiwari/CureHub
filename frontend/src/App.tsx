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
  FindHospitalsPage,
} from '@/pages/patient'
import { DashboardPage } from '@/pages/dashboard'

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
        <Route path="/patient/hospitals" element={<FindHospitalsPage />} />
        <Route path="/hospitals" element={<FindHospitalsPage />} />

        {/* Logged in Dashboard */}
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
