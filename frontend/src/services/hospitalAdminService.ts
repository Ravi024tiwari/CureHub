import apiClient from './apiClient'
import { DoctorLeaveStatus } from '@/types/hospitalAdmin'
import type {
  HospitalAdminDashboardData,
  DoctorJoinRequestFull,
  HospitalBranchItem,
  HospitalBranchKpis,
  HospitalBranchPagination,
  HospitalDetailData,
  HospitalDoctorsResponse,
  HospitalAdminProfileData,
  HospitalAdminDoctorsResponse,
  AdminAppointmentsResponse,
  AdminAppointmentDetailResponse,
} from '@/types/hospitalAdmin'

export const hospitalAdminService = {
  // Fetch executive dashboard analytics
  getDashboard: async (year?: number, hospitalId?: string): Promise<HospitalAdminDashboardData> => {
    const params = new URLSearchParams()
    if (year) params.append('year', year.toString())
    if (hospitalId && hospitalId !== 'all') params.append('hospitalId', hospitalId)

    const response = await apiClient.get<{ data: HospitalAdminDashboardData }>(
      `/hospital-admin/dashboard?${params.toString()}`
    )
    return (response as any)?.data || response
  },

  // Fetch all hospitals managed by this admin
  getHospitals: async (params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
    city?: string
    isActive?: boolean | string
    hospitalType?: string
    sortBy?: string
  }): Promise<{
    kpis: HospitalBranchKpis
    hospitals: HospitalBranchItem[]
    pagination: HospitalBranchPagination
  }> => {
    const q = new URLSearchParams()
    if (params?.page) q.append('page', params.page.toString())
    if (params?.limit) q.append('limit', params.limit.toString())
    if (params?.search) q.append('search', params.search)
    if (params?.status && params.status !== 'ALL') q.append('status', params.status)
    if (params?.city && params.city !== 'ALL') q.append('city', params.city)
    if (params?.isActive !== undefined && params.isActive !== 'ALL') {
      q.append('isActive', params.isActive.toString())
    }
    if (params?.hospitalType && params.hospitalType !== 'ALL') {
      q.append('hospitalType', params.hospitalType)
    }
    if (params?.sortBy) q.append('sortBy', params.sortBy)

    const response = await apiClient.get(`/hospital-admin/hospitals?${q.toString()}`)
    return (response as any)?.data || response
  },

  // Fetch hospital detail with affiliated doctors
  getHospitalDetail: async (id: string): Promise<HospitalDetailData> => {
    const response = await apiClient.get(`/hospital-admin/hospitals/${id}`)
    return (response as any)?.data || response
  },

  // Fetch hospital doctors paginated (10 per page default)
  getHospitalDoctors: async (
    hospitalId: string,
    params?: { page?: number; limit?: number; department?: string; search?: string }
  ): Promise<HospitalDoctorsResponse> => {
    const q = new URLSearchParams()
    if (params?.page) q.append('page', params.page.toString())
    if (params?.limit) q.append('limit', params.limit.toString())
    if (params?.department && params.department !== 'All') q.append('department', params.department)
    if (params?.search) q.append('search', params.search)

    const response = await apiClient.get(
      `/hospital-admin/hospitals/${hospitalId}/doctors?${q.toString()}`
    )
    return (response as any)?.data || response
  },

  // Toggle active status (activate/deactivate)
  toggleHospitalStatus: async (id: string, isActive: boolean): Promise<any> => {
    const response = await apiClient.patch(`/hospital-admin/hospitals/${id}`, { isActive })
    return (response as any)?.data || response
  },

  // Create new hospital
  createHospital: async (data: any): Promise<any> => {
    const response = await apiClient.post('/hospital-admin/hospitals', data)
    return (response as any)?.data || response
  },

  // Update hospital
  updateHospital: async (id: string, data: any): Promise<any> => {
    const response = await apiClient.put(`/hospital-admin/hospitals/${id}`, data)
    return (response as any)?.data || response
  },

  // Delete / deactivate hospital
  deleteHospital: async (id: string, permanent = false): Promise<any> => {
    const response = await apiClient.delete(
      `/hospital-admin/hospitals/${id}?permanent=${permanent}`
    )
    return (response as any)?.data || response
  },

  // Fetch all doctors affiliated with hospital admin's hospitals
  getAffiliatedDoctors: async (params?: {
    page?: number
    limit?: number
    hospitalId?: string
    department?: string
    search?: string
    sortBy?: string
  }): Promise<HospitalAdminDoctorsResponse> => {
    const q = new URLSearchParams()
    if (params?.page) q.append('page', params.page.toString())
    if (params?.limit) q.append('limit', params.limit.toString())
    if (params?.hospitalId && params.hospitalId !== 'all') q.append('hospitalId', params.hospitalId)
    if (params?.department && params.department !== 'All' && params.department !== 'ALL') q.append('department', params.department)
    if (params?.search) q.append('search', params.search)
    if (params?.sortBy) q.append('sortBy', params.sortBy)

    const response = await apiClient.get(`/hospital-admin/doctors?${q.toString()}`)
    return (response as any)?.data || response
  },

  // Fetch doctor join requests
  getJoinRequests: async (params?: {
    hospitalId?: string
    status?: string
  }): Promise<DoctorJoinRequestFull[]> => {
    const q = new URLSearchParams()
    if (params?.hospitalId && params.hospitalId !== 'all') q.append('hospitalId', params.hospitalId)
    if (params?.status && params.status !== 'ALL') q.append('status', params.status)

    const response = await apiClient.get(`/hospital-admin/join-requests?${q.toString()}`)
    const payload = (response as any)?.data !== undefined ? (response as any).data : response
    return Array.isArray(payload) ? payload : []
  },

  // Fetch single doctor join request by ID
  getJoinRequestById: async (requestId: string): Promise<DoctorJoinRequestFull> => {
    const response = await apiClient.get(`/hospital-admin/join-requests/${requestId}`)
    const payload = (response as any)?.data !== undefined ? (response as any).data : response
    return payload
  },

  // Approve or Reject join request
  respondToJoinRequest: async (
    requestId: string,
    action: 'APPROVE' | 'REJECT',
    rejectionReason?: string
  ): Promise<any> => {
    const response = await apiClient.patch(`/hospital-admin/join-requests/${requestId}`, {
      action,
      rejectionReason,
    })
    return (response as any)?.data || response
  },

  // Disaffiliate doctor
  disaffiliateDoctor: async (hospitalId: string, doctorId: string): Promise<any> => {
    const response = await apiClient.delete(
      `/hospital-admin/hospitals/${hospitalId}/doctors/${doctorId}`
    )
    return (response as any)?.data || response
  },

  // Get hospital admin profile
  getMyProfile: async (): Promise<{ user: any; profile: HospitalAdminProfileData }> => {
    const response = await apiClient.get('/profile/hospital-admin')
    return (response as any)?.data || response
  },

  // Update hospital admin profile (supports FormData or JSON)
  updateProfile: async (data: FormData | any): Promise<{ user: any; profile: HospitalAdminProfileData }> => {
    const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}
    const response = await apiClient.patch('/profile/hospital-admin', data, { headers })
    return (response as any)?.data || response
  },

  // ── Hospital Admin Appointments ───────────────────────────────────────────
  getAppointments: async (params?: {
    page?: number
    limit?: number
    hospitalId?: string
    doctorId?: string
    department?: string
    status?: string
    tab?: string
    date?: string
    startDate?: string
    endDate?: string
    search?: string
    sortBy?: string
  }): Promise<AdminAppointmentsResponse> => {
    const q = new URLSearchParams()
    if (params?.page) q.append('page', params.page.toString())
    if (params?.limit) q.append('limit', params.limit.toString())
    if (params?.hospitalId && params.hospitalId !== 'all') q.append('hospitalId', params.hospitalId)
    if (params?.doctorId && params.doctorId !== 'all') q.append('doctorId', params.doctorId)
    if (params?.department && params.department !== 'all') q.append('department', params.department)
    if (params?.status && params.status !== 'ALL') q.append('status', params.status)
    if (params?.tab) q.append('tab', params.tab)
    if (params?.date) q.append('date', params.date)
    if (params?.startDate) q.append('startDate', params.startDate)
    if (params?.endDate) q.append('endDate', params.endDate)
    if (params?.search) q.append('search', params.search)
    if (params?.sortBy) q.append('sortBy', params.sortBy)

    const response = await apiClient.get(`/hospital-admin/appointments?${q.toString()}`)
    return (response as any)?.data || response
  },

  getAppointmentById: async (appointmentId: string): Promise<AdminAppointmentDetailResponse> => {
    const response = await apiClient.get(`/hospital-admin/appointments/${appointmentId}`)
    return (response as any)?.data || response
  },

  cancelAppointment: async (appointmentId: string, reason?: string): Promise<any> => {
    const response = await apiClient.patch(`/hospital-admin/appointments/${appointmentId}/cancel`, {
      reason,
    })
    return (response as any)?.data || response
  },

  rescheduleAppointment: async (
    appointmentId: string,
    payload: { newSlotId?: string; date?: string; startTime?: string; reason?: string }
  ): Promise<any> => {
    const response = await apiClient.patch(
      `/hospital-admin/appointments/${appointmentId}/reschedule`,
      payload
    )
    return (response as any)?.data || response
  },

  bookAppointment: async (payload: {
    patientName: string
    phoneNumber: string
    age?: number | ''
    gender?: string
    hospitalId: string
    doctorId: string
    date: string
    startTime: string
    consultationFee?: number
    symptoms?: string
    notes?: string
  }): Promise<any> => {
    const response = await apiClient.post('/hospital-admin/appointments', payload)
    return (response as any)?.data || response
  },

  getDoctorLeaves: async (params?: {
    page?: number
    limit?: number
    status?: string
    hospitalId?: string
    doctorId?: string
    department?: string
    search?: string
    leaveType?: string
    startDate?: string
    endDate?: string
  }): Promise<{
    leaves: any[]
    counts: {
      total: number
      pending: number
      approved: number
      rejected: number
      cancelled: number
    }
    summary: {
      total: number
      pending: number
      approved: number
      rejected: number
      cancelled: number
    }
    pagination: {
      totalDocs: number
      currentPage: number
      limit: number
      totalPages: number
      hasNextPage?: boolean
      hasPrevPage?: boolean
    }
  }> => {
    const q = new URLSearchParams()
    if (params?.page) q.append('page', params.page.toString())
    if (params?.limit) q.append('limit', params.limit.toString())
    if (params?.status && params.status !== 'ALL') q.append('status', params.status)
    if (params?.hospitalId && params.hospitalId !== 'ALL' && params.hospitalId !== 'all') {
      q.append('hospitalId', params.hospitalId)
    }
    if (params?.doctorId && params.doctorId !== 'ALL' && params.doctorId !== 'all') {
      q.append('doctorId', params.doctorId)
    }
    if (params?.department && params.department !== 'ALL' && params.department !== 'all') {
      q.append('department', params.department)
    }
    if (params?.search && params.search.trim()) {
      q.append('search', params.search.trim())
    }
    if (params?.leaveType && params.leaveType !== 'ALL' && params.leaveType !== 'all') {
      q.append('leaveType', params.leaveType)
    }
    if (params?.startDate) q.append('startDate', params.startDate)
    if (params?.endDate) q.append('endDate', params.endDate)

    const response = await apiClient.get(`/hospital-admin/leaves?${q.toString()}`)
    const payload = (response as any)?.data || response || {}
    const counts = payload.counts || payload.summary || {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      cancelled: 0,
    }
    return {
      leaves: payload.leaves || [],
      counts,
      summary: counts,
      pagination: payload.pagination || {
        totalDocs: 0,
        currentPage: 1,
        limit: 10,
        totalPages: 1,
      },
    }
  },

  getDoctorLeaveById: async (leaveId: string): Promise<any> => {
    const response = await apiClient.get(`/hospital-admin/leaves/${leaveId}`)
    return (response as any)?.data || response
  },

  updateDoctorLeaveStatus: async (
    leaveId: string,
    status: DoctorLeaveStatus | 'APPROVED' | 'REJECTED' | 'APPROVE' | 'REJECT' | string,
    rejectionReason?: string
  ): Promise<any> => {
    const normalizedStatus =
      status === 'APPROVE' ? 'APPROVED' : status === 'REJECT' ? 'REJECTED' : status
    const response = await apiClient.patch(`/hospital-admin/leaves/${leaveId}/status`, {
      status: normalizedStatus,
      rejectionReason,
    })
    return (response as any)?.data || response
  },
}
