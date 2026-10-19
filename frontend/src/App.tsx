import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { PatientRegisterPage } from '@/pages/PatientRegisterPage'
import { DoctorRegisterPage } from '@/pages/DoctorRegisterPage'
import { HospitalAdminRegisterPage } from '@/pages/HospitalAdminRegisterPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default route redirects to Patient registration */}
        <Route path="/" element={<Navigate to="/register/patient" replace />} />
        <Route path="/register" element={<Navigate to="/register/patient" replace />} />

        {/* Dedicated role-based registration routes */}
        <Route path="/register/patient" element={<PatientRegisterPage />} />
        <Route path="/register/doctor" element={<DoctorRegisterPage />} />
        <Route path="/register/hospital-admin" element={<HospitalAdminRegisterPage />} />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/register/patient" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
