import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { PatientHomePage } from '@/pages/PatientHomePage'
import { FindDoctorsPage } from '@/pages/FindDoctorsPage'
import { PatientRegisterPage } from '@/pages/PatientRegisterPage'
import { DoctorRegisterPage } from '@/pages/DoctorRegisterPage'
import { HospitalAdminRegisterPage } from '@/pages/HospitalAdminRegisterPage'

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

        {/* Logged in Dashboard */}
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
