import apiClient from './apiClient'
import type { SuperAdminDashboardData } from '@/types/superAdmin'

export const superAdminService = {
  // Fetch executive platform dashboard analytics
  getDashboard: async (year?: number): Promise<SuperAdminDashboardData | any> => {
    try {
      const q = year ? `?year=${year}` : ''
      const res = await apiClient.get<{ data: any }>(`/admin/dashboard${q}`)
      return (res as any)?.data || res
    } catch (err) {
      console.warn('Super Admin dashboard API unavailable, falling back to local dataset:', err)
      return null
    }
  },

  // Fetch verifications summary stats
  getVerificationStats: async (): Promise<any> => {
    try {
      const res = await apiClient.get('/admin/verifications/stats')
      return (res as any)?.data || res
    } catch (err) {
      console.warn('Verification stats API unavailable:', err)
      return null
    }
  },

  // Approve / Reject / Suspend Doctor
  verifyDoctor: async (
    doctorId: string,
    status: 'APPROVED' | 'REJECTED' | 'SUSPENDED',
    rejectionReason?: string
  ): Promise<any> => {
    const res = await apiClient.patch(`/admin/verifications/doctors/${doctorId}`, {
      status,
      rejectionReason,
    })
    return (res as any)?.data || res
  },

  // Approve / Reject / Suspend Hospital Admin
  verifyHospitalAdmin: async (
    adminId: string,
    status: 'APPROVED' | 'REJECTED' | 'SUSPENDED',
    rejectionReason?: string
  ): Promise<any> => {
    const res = await apiClient.patch(`/admin/verifications/hospital-admins/${adminId}`, {
      status,
      rejectionReason,
    })
    return (res as any)?.data || res
  },
}

export default superAdminService
