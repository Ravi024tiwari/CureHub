import apiClient from './apiClient'

export interface DoctorExperience {
  _id?: string
  title: string
  institution: string
  period: string
  duration?: string
  description?: string
}

export interface DoctorProfileData {
  _id: string
  userId: {
    _id: string
    name: string
    email: string
    phoneNumber?: string
    avatar?: string
    role: string
    isAccountApproved: boolean
    isActive: boolean
  }
  hospitalId?: {
    _id: string
    name: string
    slug?: string
    address?: string
  } | null
  department: string
  specialization: string[]
  qualifications: string[]
  medicalCouncilRegistrationNumber: string
  licenseDocumentUrl?: string
  experienceYears: number
  experiences?: DoctorExperience[]
  consultationFee: number
  bio?: string
  verificationStatus: 'INCOMPLETE' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
  isSubmitted: boolean
  submittedAt?: string
  rejectionReason?: string
  createdAt?: string
  updatedAt?: string
}

export interface UpdateDoctorProfilePayload {
  name?: string
  phoneNumber?: string
  avatar?: string
  department?: string
  specialization?: string[]
  qualifications?: string[]
  medicalCouncilRegistrationNumber?: string
  licenseDocumentUrl?: string
  experienceYears?: number
  experiences?: DoctorExperience[]
  consultationFee?: number
  bio?: string
  isSubmit?: boolean
}

export const doctorService = {
  getMyDoctorProfile: async (): Promise<DoctorProfileData> => {
    const res: any = await apiClient.get('/doctors/profile')
    return res?.data || res
  },

  updateDoctorProfile: async (
    payload: UpdateDoctorProfilePayload
  ): Promise<DoctorProfileData> => {
    const res: any = await apiClient.patch('/doctors/profile', payload)
    return res?.data || res
  },
}

export default doctorService
