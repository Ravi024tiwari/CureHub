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

export interface DoctorDashboardData {
  doctorInfo: {
    id: string
    name: string
    email: string
    phoneNumber?: string
    avatar?: string | null
    ratingAverage: number
    reviewCount: number
    department: string
    specialization: string[]
    consultationFee: number
    experienceYears: number
    medicalCouncilRegistrationNumber: string
    hospitalAffiliationStatus: string
    hospital: {
      id: string
      name: string
      city: string
      state: string
    } | null
  }
  kpis: {
    today: {
      total: number
      completed: number
      pending: number
      cancelled: number
    }
    lifetime: {
      totalAppointments: number
      totalCompleted: number
      totalPatientsTreated: number
      totalRevenue: number
    }
  }
  nextUpcomingAppointment?: {
    _id: string
    appointmentNumber: string
    date: string
    startTime: string
    endTime: string
    symptoms?: string
    consultationFee: number
    patientId: {
      _id: string
      name: string
      email: string
      phoneNumber?: string
      avatar?: string
    }
  } | null
  recentConsultations: Array<{
    _id: string
    appointmentNumber: string
    date: string
    startTime: string
    endTime: string
    symptoms?: string
    consultationFee: number
    status: string
    patientId: {
      _id: string
      name: string
      email: string
      phoneNumber?: string
      avatar?: string
    }
  }>
  reviewsSummary: {
    average: number
    total: number
    ratingBreakdown: {
      5: number
      4: number
      3: number
      2: number
      1: number
    }
    recentReviews: Array<{
      _id: string
      rating: number
      comment: string
      createdAt: string
      patientId?: {
        name: string
        avatar?: string
      }
    }>
  }
  upcomingLeaves: Array<{
    _id?: string
    startDate: string
    endDate: string
    reason?: string
    status: string
  }>
  analytics: {
    currentYear: number
    monthlyStats: Array<{
      month: string
      monthNumber: number
      appointments: number
      completed: number
      cancelled: number
      revenue: number
    }>
    yearlyStats: Array<{
      year: number
      appointments: number
      revenue: number
    }>
    statusDistribution: Record<string, number>
  }
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

  getDoctorDashboardData: async (): Promise<DoctorDashboardData> => {
    const res: any = await apiClient.get('/doctors/dashboard')
    return res?.data || res
  },
}

export default doctorService
