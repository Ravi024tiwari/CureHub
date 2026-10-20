import apiClient from './apiClient'
import type {
  PatientRegisterPayload,
  DoctorRegisterPayload,
  HospitalAdminRegisterPayload,
  HospitalOption,
  LoginPayload,
} from '@/types/auth'

export async function registerPatientApi(payload: PatientRegisterPayload) {
  return apiClient.post('/auth/register/patient', payload)
}

export async function registerDoctorApi(payload: DoctorRegisterPayload) {
  return apiClient.post('/auth/register/doctor', payload)
}

export async function registerHospitalAdminApi(payload: HospitalAdminRegisterPayload) {
  return apiClient.post('/auth/register/hospital-admin', payload)
}

export async function loginApi(payload: LoginPayload) {
  return apiClient.post('/auth/login', payload)
}

export async function logoutApi() {
  return apiClient.post('/auth/logout')
}

export async function getMeApi() {
  return apiClient.get('/auth/me')
}

export async function fetchHospitalsApi(): Promise<HospitalOption[]> {
  try {
    const res: any = await apiClient.get('/hospitals')
    if (Array.isArray(res?.data?.hospitals)) return res.data.hospitals
    if (Array.isArray(res?.hospitals)) return res.hospitals
    if (Array.isArray(res?.data)) return res.data
    if (Array.isArray(res)) return res
    return []
  } catch {
    return []
  }
}

