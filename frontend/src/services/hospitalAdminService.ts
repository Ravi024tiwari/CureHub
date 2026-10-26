import apiClient from './apiClient'
import type {
  HospitalAdminDashboardData,
  DoctorJoinRequestItem,
  HospitalBranchItem,
  HospitalBranchKpis,
  HospitalBranchPagination,
  HospitalDetailData,
  HospitalDoctorsResponse,
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

  // Fetch doctor join requests
  getJoinRequests: async (
    hospitalId?: string,
    status = 'PENDING'
  ): Promise<{ requests: DoctorJoinRequestItem[]; total: number }> => {
    const q = new URLSearchParams()
    if (hospitalId && hospitalId !== 'all') q.append('hospitalId', hospitalId)
    if (status) q.append('status', status)

    const response = await apiClient.get(`/hospital-admin/join-requests?${q.toString()}`)
    return (response as any)?.data || response
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
}
