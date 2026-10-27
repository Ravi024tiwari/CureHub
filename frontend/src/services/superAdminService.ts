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

  // Fetch real hospital admins list for verification with filters, search, and pagination
  getHospitalAdminsForVerification: async (params?: {
    page?: number
    limit?: number
    status?: string
    search?: string
    designation?: string
    sortBy?: string
  }): Promise<{ hospitalAdmins: any[]; pagination: any }> => {
    try {
      const query = new URLSearchParams()
      if (params?.page) query.append('page', String(params.page))
      if (params?.limit) query.append('limit', String(params.limit))
      if (params?.status && params.status !== 'ALL') query.append('status', params.status)
      if (params?.search && params.search.trim()) query.append('search', params.search.trim())
      if (params?.sortBy) query.append('sortBy', params.sortBy)

      const qs = query.toString() ? `?${query.toString()}` : ''
      const res = await apiClient.get<{ data: any }>(`/admin/verifications/hospital-admins${qs}`)
      return (res as any)?.data || res
    } catch (err) {
      console.error('Failed to fetch hospital admins for verification:', err)
      throw err
    }
  },

  // Fetch single hospital admin verification detail
  getHospitalAdminVerificationDetails: async (adminId: string): Promise<any> => {
    try {
      const res = await apiClient.get<{ data: any }>(`/admin/verifications/hospital-admins/${adminId}`)
      return (res as any)?.data || res
    } catch (err) {
      console.error(`Failed to fetch hospital admin ${adminId} verification details:`, err)
      throw err
    }
  },

  // Fetch real doctors list for verification with filters, search, and pagination
  getDoctorsForVerification: async (params?: {
    page?: number
    limit?: number
    status?: string
    search?: string
    hospitalId?: string
    specialization?: string
    dateFilter?: string
    sortBy?: string
  }): Promise<any> => {
    try {
      const query = new URLSearchParams()
      if (params?.page) query.append('page', String(params.page))
      if (params?.limit) query.append('limit', String(params.limit))
      if (params?.status && params.status !== 'ALL') query.append('status', params.status)
      if (params?.search && params.search.trim()) query.append('search', params.search.trim())
      if (params?.hospitalId && params.hospitalId !== 'ALL') query.append('hospitalId', params.hospitalId)
      if (params?.specialization && params.specialization !== 'ALL') query.append('specialization', params.specialization)
      if (params?.dateFilter && params.dateFilter !== 'ALL') query.append('dateFilter', params.dateFilter)
      if (params?.sortBy) query.append('sortBy', params.sortBy)

      const qs = query.toString() ? `?${query.toString()}` : ''
      const res = await apiClient.get<{ data: any }>(`/admin/verifications/doctors${qs}`)
      return (res as any)?.data || res
    } catch (err) {
      console.error('Failed to fetch doctors for verification:', err)
      throw err
    }
  },

  // Fetch single doctor verification detail
  getDoctorVerificationDetails: async (doctorId: string): Promise<any> => {
    try {
      const res = await apiClient.get<{ data: any }>(`/admin/verifications/doctors/${doctorId}`)
      return (res as any)?.data || res
    } catch (err) {
      console.error(`Failed to fetch doctor ${doctorId} verification details:`, err)
      throw err
    }
  },

  // Fetch list of registered hospitals for filtering dropdown
  getHospitals: async (): Promise<any> => {
    try {
      const res = await apiClient.get('/hospitals?limit=100')
      return (res as any)?.data || res
    } catch (err) {
      console.warn('Hospitals API query failed:', err)
      return []
    }
  },

  // Fetch all doctors directory for Super Admin
  getAllDoctors: async (params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
    accountStatus?: string
    hospitalId?: string
    department?: string
    specialization?: string
    sortBy?: string
  }): Promise<any> => {
    try {
      const query = new URLSearchParams()
      if (params?.page) query.append('page', String(params.page))
      if (params?.limit) query.append('limit', String(params.limit))
      if (params?.search && params.search.trim()) query.append('search', params.search.trim())
      if (params?.status && params.status !== 'ALL') query.append('status', params.status)
      if (params?.accountStatus && params.accountStatus !== 'all') query.append('accountStatus', params.accountStatus)
      if (params?.hospitalId && params.hospitalId !== 'ALL') query.append('hospitalId', params.hospitalId)
      if (params?.department && params.department !== 'ALL') query.append('department', params.department)
      if (params?.specialization && params.specialization !== 'ALL') query.append('specialization', params.specialization)
      if (params?.sortBy) query.append('sortBy', params.sortBy)

      const qs = query.toString() ? `?${query.toString()}` : ''
      const res = await apiClient.get<{ data: any }>(`/admin/doctors${qs}`)
      return (res as any)?.data || res
    } catch (err) {
      console.error('Failed to fetch doctors directory:', err)
      throw err
    }
  },

  // Toggle Doctor Active / Disabled Status
  toggleDoctorStatus: async (
    doctorId: string,
    isActive: boolean,
    reason?: string
  ): Promise<any> => {
    try {
      const res = await apiClient.patch<{ data: any }>(`/admin/doctors/${doctorId}/status`, {
        isActive,
        reason,
      })
      return (res as any)?.data || res
    } catch (err) {
      console.error(`Failed to update doctor ${doctorId} status:`, err)
      throw err
    }
  },

  // Fetch verified & all hospital admins directory with filters, search, and pagination (default limit: 10)
  getAllHospitalAdmins: async (params?: {
    page?: number
    limit?: number
    status?: string
    hospitalType?: string
    state?: string
    search?: string
    accountStatus?: string
    sortBy?: string
  }): Promise<{ hospitalAdmins: any[]; pagination: any; stats: any }> => {
    try {
      const query = new URLSearchParams()
      if (params?.page) query.append('page', String(params.page))
      query.append('limit', String(params?.limit || 10))
      if (params?.status && params.status !== 'ALL') query.append('status', params.status)
      if (params?.hospitalType && params.hospitalType !== 'ALL') query.append('hospitalType', params.hospitalType)
      if (params?.state && params.state !== 'ALL') query.append('state', params.state)
      if (params?.search && params.search.trim()) query.append('search', params.search.trim())
      if (params?.accountStatus && params.accountStatus !== 'ALL') query.append('accountStatus', params.accountStatus)
      if (params?.sortBy) query.append('sortBy', params.sortBy)

      const qs = query.toString() ? `?${query.toString()}` : ''
      const res = await apiClient.get<{ data: any }>(`/admin/hospital-admins${qs}`)
      return (res as any)?.data || res
    } catch (err) {
      console.error('Failed to fetch hospital admins directory:', err)
      throw err
    }
  },

  // Fetch single hospital admin full details
  getHospitalAdminDetails: async (adminId: string): Promise<any> => {
    try {
      const res = await apiClient.get<{ data: any }>(`/admin/hospital-admins/${adminId}`)
      return (res as any)?.data || res
    } catch (err) {
      console.error(`Failed to fetch hospital admin ${adminId} details:`, err)
      throw err
    }
  },

  // Toggle Hospital Admin Active / Disabled Status
  toggleHospitalAdminStatus: async (
    adminId: string,
    isActive: boolean,
    reason?: string
  ): Promise<any> => {
    try {
      const res = await apiClient.patch<{ data: any }>(`/admin/hospital-admins/${adminId}/status`, {
        isActive,
        reason,
      })
      return (res as any)?.data || res
    } catch (err) {
      console.error(`Failed to update hospital admin ${adminId} status:`, err)
      throw err
    }
  },

  // Export hospital admins list
  exportHospitalAdmins: async (params?: {
    status?: string
    hospitalType?: string
  }): Promise<any> => {
    try {
      const query = new URLSearchParams()
      if (params?.status && params.status !== 'ALL') query.append('status', params.status)
      if (params?.hospitalType && params.hospitalType !== 'ALL') query.append('hospitalType', params.hospitalType)

      const qs = query.toString() ? `?${query.toString()}` : ''
      const res = await apiClient.get<{ data: any }>(`/admin/hospital-admins/export${qs}`)
      return (res as any)?.data || res
    } catch (err) {
      console.error('Failed to export hospital admins:', err)
      throw err
    }
  },
}

export default superAdminService
