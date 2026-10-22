import apiClient from './apiClient'
import type {
  HospitalDetailData,
  HospitalDoctorsResponse,
  HospitalBranchItem,
} from '@/types/hospitalAdmin'

export const hospitalService = {
  /**
   * Fetch hospital details by ID (Public & Multi-Role: works for patients, doctors, guests, and admins)
   * If logged in as the owning hospital admin, returns additional admin metadata (e.g. pending requests, isOwner).
   */
  getHospitalById: async (id: string): Promise<HospitalDetailData> => {
    const response = await apiClient.get<{ data: HospitalDetailData }>(`/hospitals/${id}`)
    return (response as any)?.data || response
  },

  /**
   * Fetch hospital doctors with progressive 10-at-a-time pagination
   * Query options: page, limit (default 10), department, search
   */
  getHospitalDoctors: async (
    hospitalId: string,
    params?: { page?: number; limit?: number; department?: string; search?: string }
  ): Promise<HospitalDoctorsResponse> => {
    const q = new URLSearchParams()
    if (params?.page) q.append('page', params.page.toString())
    if (params?.limit) q.append('limit', params.limit.toString())
    if (params?.department && params.department !== 'All') q.append('department', params.department)
    if (params?.search) q.append('search', params.search)

    const response = await apiClient.get<{ data: HospitalDoctorsResponse }>(
      `/hospitals/${hospitalId}/doctors?${q.toString()}`
    )
    return (response as any)?.data || response
  },

  /**
   * Fetch all active hospitals (public search / discovery)
   */
  getAllHospitals: async (params?: Record<string, any>): Promise<HospitalBranchItem[]> => {
    const q = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') q.append(k, String(v))
      })
    }
    const response = await apiClient.get<{ data: HospitalBranchItem[] }>(`/hospitals?${q.toString()}`)
    return (response as any)?.data || response
  },

  /**
   * Fetch hospital by URL slug
   */
  getHospitalBySlug: async (slug: string): Promise<HospitalDetailData> => {
    const response = await apiClient.get<{ data: HospitalDetailData }>(`/hospitals/slug/${slug}`)
    return (response as any)?.data || response
  },
}
