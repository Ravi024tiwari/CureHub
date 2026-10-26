import { create } from 'zustand'
import { superAdminService } from '@/services/superAdminService'
import type {
  HospitalAdminVerificationRecord,
  HospitalAdminVerificationStats,
  HospitalAdminVerificationFilters,
} from '@/types/superAdmin'

interface PaginationMeta {
  totalDocs: number
  totalPages: number
  currentPage: number
  limit: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

interface HospitalAdminVerificationState {
  stats: HospitalAdminVerificationStats
  admins: HospitalAdminVerificationRecord[]
  pagination: PaginationMeta
  selectedAdmin: HospitalAdminVerificationRecord | null
  filters: HospitalAdminVerificationFilters
  isLoading: boolean
  isDetailLoading: boolean
  isActionLoading: boolean
  actionMessage: { type: 'success' | 'error'; text: string } | null

  // Actions
  fetchStats: () => Promise<void>
  fetchAdmins: (pageOverride?: number) => Promise<void>
  fetchAdminDetails: (adminId: string) => Promise<void>
  setFilters: (newFilters: Partial<HospitalAdminVerificationFilters>) => void
  resetFilters: () => void
  setSelectedAdmin: (admin: HospitalAdminVerificationRecord | null) => void
  approveAdmin: (adminId: string) => Promise<boolean>
  rejectAdmin: (adminId: string, reason: string) => Promise<boolean>
  clearActionMessage: () => void
}

const DEFAULT_FILTERS: HospitalAdminVerificationFilters = {
  search: '',
  status: 'PENDING',
  designation: 'ALL',
  sortBy: 'newest',
  page: 1,
  limit: 20,
}

export const useHospitalAdminVerificationStore = create<HospitalAdminVerificationState>(
  (set, get) => ({
    stats: {
      pending: 0,
      approved: 0,
      rejected: 0,
      total: 0,
    },
    admins: [],
    pagination: {
      totalDocs: 0,
      totalPages: 1,
      currentPage: 1,
      limit: 20,
      hasNextPage: false,
      hasPrevPage: false,
    },
    selectedAdmin: null,
    filters: DEFAULT_FILTERS,
    isLoading: false,
    isDetailLoading: false,
    isActionLoading: false,
    actionMessage: null,

    // Fetch aggregate verification stats from server
    fetchStats: async () => {
      try {
        const res = await superAdminService.getVerificationStats()
        if (res?.hospitalAdmins) {
          set({
            stats: {
              pending: res.hospitalAdmins.pending || 0,
              approved: res.hospitalAdmins.approved || 0,
              rejected: res.hospitalAdmins.rejected || 0,
              total: res.hospitalAdmins.total || 0,
            },
          })
        }
      } catch (err) {
        console.warn('Failed to fetch hospital admin verification stats:', err)
      }
    },

    // Fetch hospital admins list for verification
    fetchAdmins: async (pageOverride?: number) => {
      const { filters, selectedAdmin } = get()
      const pageToFetch = pageOverride !== undefined ? pageOverride : filters.page

      set({ isLoading: true })
      try {
        const res = await superAdminService.getHospitalAdminsForVerification({
          page: pageToFetch,
          limit: filters.limit,
          status: filters.status,
          search: filters.search,
          designation: filters.designation,
          sortBy: filters.sortBy,
        })

        const rawList = res?.hospitalAdmins || []
        const pagination = res?.pagination || {
          totalDocs: rawList.length,
          totalPages: 1,
          currentPage: pageToFetch,
          limit: filters.limit,
          hasNextPage: false,
          hasPrevPage: false,
        }

        let updatedSelected = selectedAdmin
        if (rawList.length > 0) {
          if (!selectedAdmin || !rawList.some((a: any) => a._id === selectedAdmin._id)) {
            updatedSelected = rawList[0]
          }
        } else {
          updatedSelected = null
        }

        set({
          admins: rawList,
          pagination,
          selectedAdmin: updatedSelected,
          isLoading: false,
        })
      } catch (err: any) {
        console.error('Failed to load hospital admins for verification:', err)
        set({
          isLoading: false,
          actionMessage: {
            type: 'error',
            text: err?.message || 'Failed to fetch hospital admin records.',
          },
        })
      }
    },

    // Fetch single admin detail
    fetchAdminDetails: async (adminId: string) => {
      set({ isDetailLoading: true })
      try {
        const res = await superAdminService.getHospitalAdminVerificationDetails(adminId)
        if (res?.hospitalAdmin) {
          set({ selectedAdmin: res.hospitalAdmin, isDetailLoading: false })
        }
      } catch (err) {
        console.error('Failed to fetch admin verification details:', err)
        set({ isDetailLoading: false })
      }
    },

    // Set filters & trigger re-fetch
    setFilters: (newFilters: Partial<HospitalAdminVerificationFilters>) => {
      const updated = { ...get().filters, ...newFilters, page: newFilters.page || 1 }
      set({ filters: updated })
      get().fetchAdmins(updated.page)
    },

    // Reset filters
    resetFilters: () => {
      set({ filters: DEFAULT_FILTERS })
      get().fetchAdmins(1)
    },

    // Select admin
    setSelectedAdmin: (admin: HospitalAdminVerificationRecord | null) => {
      set({ selectedAdmin: admin })
    },

    // Approve hospital admin
    approveAdmin: async (adminId: string): Promise<boolean> => {
      set({ isActionLoading: true })
      try {
        await superAdminService.verifyHospitalAdmin(adminId, 'APPROVED')

        // Update local stats & list
        set((state) => {
          const updatedAdmins = state.admins.map((a) =>
            a._id === adminId
              ? {
                  ...a,
                  verificationStatus: 'APPROVED' as const,
                  userId: { ...a.userId, isAccountApproved: true },
                }
              : a
          )

          const nextSelected =
            state.selectedAdmin?._id === adminId
              ? {
                  ...state.selectedAdmin,
                  verificationStatus: 'APPROVED' as const,
                  userId: { ...state.selectedAdmin.userId, isAccountApproved: true },
                }
              : state.selectedAdmin

          return {
            admins: updatedAdmins,
            selectedAdmin: nextSelected,
            stats: {
              ...state.stats,
              pending: Math.max(0, state.stats.pending - 1),
              approved: state.stats.approved + 1,
            },
            actionMessage: {
              type: 'success',
              text: `Hospital Admin approved successfully. Their account is now activated.`,
            },
            isActionLoading: false,
          }
        })

        // Refresh stats in background
        get().fetchStats()
        return true
      } catch (err: any) {
        console.error('Approve hospital admin error:', err)
        set({
          isActionLoading: false,
          actionMessage: {
            type: 'error',
            text: err?.message || 'Failed to approve hospital admin.',
          },
        })
        return false
      }
    },

    // Reject hospital admin
    rejectAdmin: async (adminId: string, reason: string): Promise<boolean> => {
      if (!reason || !reason.trim()) {
        set({
          actionMessage: {
            type: 'error',
            text: 'A formal reason is required to reject an application.',
          },
        })
        return false
      }

      set({ isActionLoading: true })
      try {
        await superAdminService.verifyHospitalAdmin(adminId, 'REJECTED', reason)

        set((state) => {
          const updatedAdmins = state.admins.map((a) =>
            a._id === adminId
              ? {
                  ...a,
                  verificationStatus: 'REJECTED' as const,
                  rejectionReason: reason.trim(),
                  userId: { ...a.userId, isAccountApproved: false },
                }
              : a
          )

          const nextSelected =
            state.selectedAdmin?._id === adminId
              ? {
                  ...state.selectedAdmin,
                  verificationStatus: 'REJECTED' as const,
                  rejectionReason: reason.trim(),
                  userId: { ...state.selectedAdmin.userId, isAccountApproved: false },
                }
              : state.selectedAdmin

          return {
            admins: updatedAdmins,
            selectedAdmin: nextSelected,
            stats: {
              ...state.stats,
              pending: Math.max(0, state.stats.pending - 1),
              rejected: state.stats.rejected + 1,
            },
            actionMessage: {
              type: 'success',
              text: 'Hospital Admin application rejected. Feedback has been sent.',
            },
            isActionLoading: false,
          }
        })

        get().fetchStats()
        return true
      } catch (err: any) {
        console.error('Reject hospital admin error:', err)
        set({
          isActionLoading: false,
          actionMessage: {
            type: 'error',
            text: err?.message || 'Failed to reject hospital admin.',
          },
        })
        return false
      }
    },

    clearActionMessage: () => {
      set({ actionMessage: null })
    },
  })
)
