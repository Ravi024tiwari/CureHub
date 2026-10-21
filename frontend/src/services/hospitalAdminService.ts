import apiClient from './apiClient'
import type {
  HospitalAdminDashboardData,
  DoctorJoinRequestItem,
  HospitalBranchItem,
  HospitalBranchKpis,
  HospitalBranchPagination,
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
  getHospitalDetail: async (id: string): Promise<any> => {
    const response = await apiClient.get(`/hospital-admin/hospitals/${id}`)
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
}
