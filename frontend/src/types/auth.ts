export const UserRole = {
  PATIENT: 'PATIENT',
  DOCTOR: 'DOCTOR',
  HOSPITAL_ADMIN: 'HOSPITAL_ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const

export type UserRole = (typeof UserRole)[keyof typeof UserRole]

export type RoleType = UserRole

export interface PatientRegisterPayload {
  name: string
  email: string
  password: string
  phoneNumber: string
}

export interface DoctorRegisterPayload {
  name: string
  email: string
  password: string
  phoneNumber: string
  hospitalId: string
  department: string
  medicalCouncilRegistrationNumber: string
}

export interface HospitalAdminRegisterPayload {
  name: string
  email: string
  password: string
  phoneNumber: string
  hospitalName: string
  designation: string
  hospitalRegistrationNumber: string
}

export interface HospitalOption {
  _id: string
  name: string
  address?: {
    street?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
  }
  departments?: string[]
  city?: string
  state?: string
}

export interface FormValidationErrors {
  firstName?: string
  lastName?: string
  email?: string
  phoneNumber?: string
  password?: string
  hospitalName?: string
  designation?: string
  hospitalRegistrationNumber?: string
  department?: string
  medicalCouncilRegistrationNumber?: string
  hospitalId?: string
  general?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface AuthUser {
  _id: string
  name: string
  email: string
  phoneNumber?: string
  role: UserRole
  isAccountApproved?: boolean
  avatar?: string
  createdAt?: string
  updatedAt?: string
}

export interface LoginResponse {
  user: AuthUser
  profile: any
  token: string
}
