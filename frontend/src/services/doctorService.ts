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
  scheduleRules?: DoctorScheduleRule[]
  leaves?: DoctorLeaveItem[]
  verificationStatus: 'INCOMPLETE' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
  isSubmitted: boolean
  submittedAt?: string
  rejectionReason?: string
  createdAt?: string
  updatedAt?: string
}

export interface DoctorScheduleRule {
  dayOfWeek: number // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  startTime: string // "09:00"
  endTime: string   // "13:00"
  slotDurationMinutes: number // 20
}

export interface DoctorLeaveItem {
  _id?: string
  date: string // YYYY-MM-DD
  reason?: string
  createdAt?: string
  status?: 'Approved' | 'Pending'
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
  scheduleRules?: DoctorScheduleRule[]
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

export interface DoctorAppointmentItem {
  _id: string
  appointmentNumber: string
  doctorId: string
  patientId: {
    _id: string
    name: string
    email: string
    phoneNumber?: string
    avatar?: string
    dateOfBirth?: string
    gender?: string
    bloodGroup?: string
  }
  hospitalId?: {
    _id: string
    name: string
    slug?: string
    address?: string
  }
  slotId?: {
    _id: string
    startTime: string
    endTime: string
    status: string
  }
  type: string
  status:
    | 'CONFIRMED'
    | 'CHECKED_IN'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'CANCELLED_BY_PATIENT'
    | 'CANCELLED_BY_DOCTOR'
    | 'NO_SHOW'
  date: string
  startTime: string
  endTime: string
  consultationFee: number
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED'
  paymentMethod?: string
  symptoms?: string
  patientDetails?: {
    fullName?: string
    age?: number
    gender?: string
    isDependent?: boolean
    relationship?: string
  }
  previousVisitsCount?: number
  lastVisitDate?: string | null
  allergies?: string[]
  chronicDiseases?: string[]
  bloodGroup?: string
  createdAt?: string
}

export interface DoctorAppointmentCounts {
  today: number
  todayWaiting: number
  todayInProgress: number
  todayCompleted: number
  todayCancelled: number
  upcoming: number
  completed: number
  cancelled: number
}

export interface DoctorAppointmentsResponse {
  appointments: DoctorAppointmentItem[]
  recentCompleted: DoctorAppointmentItem[]
  counts: DoctorAppointmentCounts
  pagination: {
    totalDocs: number
    totalPages: number
    currentPage: number
    limit: number
    hasNextPage: boolean
    hasPrevPage: boolean
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

  updateDoctorSchedule: async (
    scheduleRules: DoctorScheduleRule[]
  ): Promise<DoctorProfileData> => {
    const res: any = await apiClient.patch('/doctors/profile', { scheduleRules })
    return res?.data || res
  },

  getDoctorLeaves: async (): Promise<DoctorLeaveItem[]> => {
    const res: any = await apiClient.get('/doctors/leaves')
    return res?.data || res
  },

  applyDoctorLeave: async (
    date: string,
    reason?: string
  ): Promise<{
    date: string
    reason: string
    affectedAppointmentsCount: number
    leaves: DoctorLeaveItem[]
  }> => {
    const res: any = await apiClient.post('/doctors/leaves', { date, reason })
    return res?.data || res
  },

  cancelDoctorLeave: async (date: string): Promise<DoctorLeaveItem[]> => {
    const res: any = await apiClient.delete(`/doctors/leaves/${date}`)
    return res?.data || res
  },

  getDoctorAppointments: async (params?: {
    tab?: string
    date?: string
    status?: string
    search?: string
    page?: number
    limit?: number
  }): Promise<DoctorAppointmentsResponse> => {
    const res: any = await apiClient.get('/doctors/appointments', { params })
    return res?.data || res
  },

  updateAppointmentStatus: async (
    id: string,
    status: string,
    reason?: string
  ): Promise<DoctorAppointmentItem> => {
    const res: any = await apiClient.patch(`/doctors/appointments/${id}/status`, {
      status,
      reason,
    })
    return res?.data || res
  },

  completeAppointment: async (
    id: string,
    prescriptionData: {
      diagnosis: string
      advice?: string
      medicines?: Array<{
        name: string
        dosage: string
        frequency: string
        duration: string
        instructions?: string
      }>
      followUpDate?: string
    }
  ): Promise<DoctorAppointmentItem> => {
    const res: any = await apiClient.post(
      `/doctors/appointments/${id}/complete`,
      prescriptionData
    )
    return res?.data || res
  },
}

export default doctorService

