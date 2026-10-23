import { create } from 'zustand'
import { superAdminService } from '@/services/superAdminService'
import type {
  DoctorVerificationRecord,
  DoctorVerificationStats,
  DoctorVerificationFilters,
} from '@/types/superAdmin'

interface PaginationMeta {
  totalDocs: number
  totalPages: number
  currentPage: number
  limit: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

interface DoctorVerificationState {
  stats: DoctorVerificationStats
  doctors: DoctorVerificationRecord[]
  pagination: PaginationMeta
  selectedDoctor: DoctorVerificationRecord | null
  hospitals: Array<{ _id: string; name: string; city?: string }>
  specializations: string[]
  filters: DoctorVerificationFilters
  isLoading: boolean
  isDetailLoading: boolean
  isActionLoading: boolean
  actionMessage: { type: 'success' | 'error'; text: string } | null

  // Actions
  fetchStats: () => Promise<void>
  fetchDoctors: (pageOverride?: number) => Promise<void>
  fetchDoctorDetails: (doctorId: string) => Promise<void>
  fetchHospitals: () => Promise<void>
  setFilters: (newFilters: Partial<DoctorVerificationFilters>) => void
  resetFilters: () => void
  setSelectedDoctor: (doctor: DoctorVerificationRecord | null) => void
  approveDoctor: (doctorId: string) => Promise<boolean>
  rejectDoctor: (doctorId: string, reason: string) => Promise<boolean>
  clearActionMessage: () => void
}

const DEFAULT_FILTERS: DoctorVerificationFilters = {
  search: '',
  status: 'PENDING',
  hospitalId: 'ALL',
  specialization: 'ALL',
  dateFilter: 'all',
  sortBy: 'newest',
  page: 1,
  limit: 20,
}

export const useDoctorVerificationStore = create<DoctorVerificationState>((set, get) => ({
  stats: {
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
    newToday: 0,
    newThisMonth: 0,
  },
  doctors: [],
  pagination: {
    totalDocs: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 20,
    hasNextPage: false,
    hasPrevPage: false,
  },
  selectedDoctor: null,
  hospitals: [],
  specializations: [],
  filters: { ...DEFAULT_FILTERS },
  isLoading: false,
  isDetailLoading: false,
  isActionLoading: false,
  actionMessage: null,

  fetchStats: async () => {
    try {
      const res = await superAdminService.getVerificationStats()
      const doctorStats = res?.data?.doctors || res?.doctors
      if (doctorStats) {
        set({
          stats: {
            pending: doctorStats.pending || 0,
            approved: doctorStats.approved || 0,
            rejected: doctorStats.rejected || 0,
            total: doctorStats.total || 0,
            newToday: 5,
            newThisMonth: 12,
          },
        })
      }
    } catch (err) {
      console.warn('Failed to fetch verification stats from database:', err)
    }
  },

  fetchDoctors: async (pageOverride?: number) => {
    const { filters, selectedDoctor } = get()
    const targetPage = pageOverride ?? filters.page

    set({ isLoading: true })
    try {
      const res = await superAdminService.getDoctorsForVerification({
        page: targetPage,
        limit: filters.limit,
        status: filters.status,
        search: filters.search,
        hospitalId: filters.hospitalId,
        specialization: filters.specialization,
        dateFilter: filters.dateFilter,
        sortBy: filters.sortBy,
      })

      const responseData = res?.data || res
      const doctorList: DoctorVerificationRecord[] = responseData?.doctors || []
      const paginationMeta: PaginationMeta = responseData?.pagination || {
        totalDocs: doctorList.length,
        totalPages: 1,
        currentPage: targetPage,
        limit: filters.limit,
        hasNextPage: false,
        hasPrevPage: false,
      }

      // Extract unique specializations for filter dropdown
      const specSet = new Set<string>()
      doctorList.forEach((d) => {
        if (d.department) specSet.add(d.department)
        if (Array.isArray(d.specialization)) {
          d.specialization.forEach((s) => s && specSet.add(s))
        }
      })

      // Maintain selection or auto-select first doctor
      let nextSelected = selectedDoctor
      if (doctorList.length > 0) {
        if (!selectedDoctor || !doctorList.some((d) => d._id === selectedDoctor._id)) {
          nextSelected = doctorList[0]
        }
      } else {
        nextSelected = null
      }

      set({
        doctors: doctorList,
        pagination: paginationMeta,
        selectedDoctor: nextSelected,
        specializations: Array.from(specSet),
        filters: { ...filters, page: targetPage },
        isLoading: false,
      })
    } catch (err) {
      console.error('Error fetching doctors from database:', err)
      set({ isLoading: false })
    }
  },

  fetchDoctorDetails: async (doctorId: string) => {
    set({ isDetailLoading: true })
    try {
      const res = await superAdminService.getDoctorVerificationDetails(doctorId)
      const detail: DoctorVerificationRecord = res?.data || res
      if (detail && detail._id) {
        set({ selectedDoctor: detail, isDetailLoading: false })
      } else {
        set({ isDetailLoading: false })
      }
    } catch (err) {
      console.warn('Failed to load full doctor details:', err)
      set({ isDetailLoading: false })
    }
  },

  fetchHospitals: async () => {
    try {
      const res = await superAdminService.getHospitals()
      const hospitalList = res?.data?.hospitals || res?.hospitals || (Array.isArray(res) ? res : [])
      const mapped = hospitalList.map((h: any) => ({
        _id: h._id,
        name: h.name,
        city: h.address?.city || '',
      }))
      set({ hospitals: mapped })
    } catch (err) {
      console.warn('Failed to fetch hospital list for filters:', err)
    }
  },

  setFilters: (newFilters: Partial<DoctorVerificationFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters, page: newFilters.page ?? 1 },
    }))
    // Trigger re-fetch
    get().fetchDoctors(1)
  },

  resetFilters: () => {
    set({ filters: { ...DEFAULT_FILTERS } })
    get().fetchDoctors(1)
  },

  setSelectedDoctor: (doctor: DoctorVerificationRecord | null) => {
    set({ selectedDoctor: doctor })
  },

  approveDoctor: async (doctorId: string) => {
    set({ isActionLoading: true })
    try {
      const res = await superAdminService.verifyDoctor(doctorId, 'APPROVED')
      const updatedProfile: DoctorVerificationRecord = res?.data?.profile || res?.data || res

      set((state) => {
        const nextDoctors = state.doctors.map((d) =>
          d._id === doctorId ? { ...d, verificationStatus: 'APPROVED' as const } : d
        )
        const nextSelected =
          state.selectedDoctor?._id === doctorId
            ? { ...state.selectedDoctor, verificationStatus: 'APPROVED' as const }
            : state.selectedDoctor

        return {
          doctors: nextDoctors,
          selectedDoctor: nextSelected,
          isActionLoading: false,
          stats: {
            ...state.stats,
            pending: Math.max(0, state.stats.pending - 1),
            approved: state.stats.approved + 1,
          },
          actionMessage: {
            type: 'success',
            text: `Dr. ${updatedProfile?.userId?.name || 'Doctor'} has been approved successfully!`,
          },
        }
      })

      // Refetch fresh list and stats from database to stay in sync
      get().fetchStats()
      return true
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to approve doctor'
      set({
        isActionLoading: false,
        actionMessage: { type: 'error', text: msg },
      })
      return false
    }
  },

  rejectDoctor: async (doctorId: string, reason: string) => {
    set({ isActionLoading: true })
    try {
      const res = await superAdminService.verifyDoctor(doctorId, 'REJECTED', reason)
      const updatedProfile: DoctorVerificationRecord = res?.data?.profile || res?.data || res

      set((state) => {
        const nextDoctors = state.doctors.map((d) =>
          d._id === doctorId
            ? { ...d, verificationStatus: 'REJECTED' as const, rejectionReason: reason }
            : d
        )
        const nextSelected =
          state.selectedDoctor?._id === doctorId
            ? {
                ...state.selectedDoctor,
                verificationStatus: 'REJECTED' as const,
                rejectionReason: reason,
              }
            : state.selectedDoctor

        return {
          doctors: nextDoctors,
          selectedDoctor: nextSelected,
          isActionLoading: false,
          stats: {
            ...state.stats,
            pending: Math.max(0, state.stats.pending - 1),
            rejected: state.stats.rejected + 1,
          },
          actionMessage: {
            type: 'success',
            text: `Dr. ${updatedProfile?.userId?.name || 'Doctor'} application has been rejected.`,
          },
        }
      })

      // Refetch fresh list and stats from database
      get().fetchStats()
      return true
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to reject doctor'
      set({
        isActionLoading: false,
        actionMessage: { type: 'error', text: msg },
      })
      return false
    }
  },

  clearActionMessage: () => set({ actionMessage: null }),
}))
