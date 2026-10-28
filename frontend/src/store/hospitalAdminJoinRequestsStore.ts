import { create } from 'zustand'
import { hospitalAdminService } from '@/services/hospitalAdminService'
import type { DoctorJoinRequestFull } from '@/types/hospitalAdmin'

export interface DoctorJoinRequestKpis {
  totalRequests: number
  totalChangeMonth: string
  pending: number
  pendingPct: number
  approved: number
  approvedPct: number
  rejected: number
  rejectedPct: number
}

export interface HospitalAdminJoinRequestsState {
  requests: DoctorJoinRequestFull[]
  selectedRequest: DoctorJoinRequestFull | null
  isLoading: boolean
  isDetailLoading: boolean
  error: string | null

  // Filters
  searchQuery: string
  selectedDepartment: string
  selectedStatus: string
  selectedDateRange: string
  currentPage: number
  itemsPerPage: number

  // Action Modals
  actionModal: {
    isOpen: boolean
    type: 'APPROVE' | 'REJECT'
    requestId: string
    doctorName: string
    hospitalName?: string
    reason: string
    isSubmitting: boolean
  }
  toastMessage: { text: string; type: 'success' | 'error' } | null

  // Actions
  fetchRequests: (hospitalId?: string) => Promise<void>
  fetchRequestById: (requestId: string) => Promise<DoctorJoinRequestFull | null>
  setSearchQuery: (query: string) => void
  setSelectedDepartment: (dept: string) => void
  setSelectedStatus: (status: string) => void
  setSelectedDateRange: (range: string) => void
  setCurrentPage: (page: number) => void
  resetFilters: () => void

  // Modal actions
  openActionModal: (type: 'APPROVE' | 'REJECT', request: DoctorJoinRequestFull) => void
  closeActionModal: () => void
  setActionReason: (reason: string) => void
  confirmActionModal: () => Promise<void>
  clearToast: () => void
}

export const useHospitalAdminJoinRequestsStore = create<HospitalAdminJoinRequestsState>(
  (set, get) => ({
    // Initial state with empty real data
    requests: [],
    selectedRequest: null,
    isLoading: false,
    isDetailLoading: false,
    error: null,

    searchQuery: '',
    selectedDepartment: 'ALL',
    selectedStatus: 'ALL',
    selectedDateRange: 'ALL',
    currentPage: 1,
    itemsPerPage: 10,

    actionModal: {
      isOpen: false,
      type: 'APPROVE',
      requestId: '',
      doctorName: '',
      hospitalName: '',
      reason: '',
      isSubmitting: false,
    },
    toastMessage: null,

    fetchRequests: async (hospitalId?: string) => {
      set({ isLoading: true, error: null })
      try {
        const liveRequests = await hospitalAdminService.getJoinRequests({
          hospitalId,
          status: get().selectedStatus !== 'ALL' ? get().selectedStatus : undefined,
        })

        if (Array.isArray(liveRequests)) {
          set({ requests: liveRequests, error: null })
        } else {
          set({ requests: [], error: null })
        }
      } catch (err: any) {
        console.error('Error fetching real join requests from backend:', err)
        set({
          requests: [],
          error: err.message || 'Failed to load join requests from server',
        })
      } finally {
        set({ isLoading: false })
      }
    },

    fetchRequestById: async (requestId: string) => {
      set({ isDetailLoading: true, error: null })
      try {
        const fresh = await hospitalAdminService.getJoinRequestById(requestId)
        if (fresh && fresh._id) {
          set({ selectedRequest: fresh, error: null })
          return fresh
        }

        const local = get().requests.find((r) => r._id === requestId)
        if (local) {
          set({ selectedRequest: local, error: null })
          return local
        }

        set({ selectedRequest: null })
        return null
      } catch (err: any) {
        console.error('Error fetching join request by ID:', err)
        const local = get().requests.find((r) => r._id === requestId)
        if (local) {
          set({ selectedRequest: local, error: null })
          return local
        }
        set({
          error: err.message || 'Failed to load request details',
          selectedRequest: null,
        })
        return null
      } finally {
        set({ isDetailLoading: false })
      }
    },

    setSearchQuery: (query: string) => set({ searchQuery: query, currentPage: 1 }),
    setSelectedDepartment: (dept: string) => set({ selectedDepartment: dept, currentPage: 1 }),
    setSelectedStatus: (status: string) => set({ selectedStatus: status, currentPage: 1 }),
    setSelectedDateRange: (range: string) => set({ selectedDateRange: range, currentPage: 1 }),
    setCurrentPage: (page: number) => set({ currentPage: page }),

    resetFilters: () =>
      set({
        searchQuery: '',
        selectedDepartment: 'ALL',
        selectedStatus: 'ALL',
        selectedDateRange: 'ALL',
        currentPage: 1,
      }),

    openActionModal: (type, request) => {
      set({
        actionModal: {
          isOpen: true,
          type,
          requestId: request._id,
          doctorName: request.doctorUserId?.name || 'Doctor',
          hospitalName: request.hospitalId?.name || 'Hospital',
          reason: '',
          isSubmitting: false,
        },
      })
    },

    closeActionModal: () => {
      set((state) => ({
        actionModal: {
          ...state.actionModal,
          isOpen: false,
          reason: '',
          isSubmitting: false,
        },
      }))
    },

    setActionReason: (reason) => {
      set((state) => ({
        actionModal: { ...state.actionModal, reason },
      }))
    },

    confirmActionModal: async () => {
      const { actionModal, requests, selectedRequest } = get()
      if (!actionModal.requestId) return

      set((state) => ({
        actionModal: { ...state.actionModal, isSubmitting: true },
      }))

      try {
        await hospitalAdminService.respondToJoinRequest(
          actionModal.requestId,
          actionModal.type,
          actionModal.reason
        )

        // Update in-memory state
        const updatedRequests = requests.map((r) => {
          if (r._id === actionModal.requestId) {
            return {
              ...r,
              status: actionModal.type === 'APPROVE' ? ('APPROVED' as const) : ('REJECTED' as const),
              rejectionReason: actionModal.type === 'REJECT' ? actionModal.reason : undefined,
              reviewedAt: new Date().toISOString(),
            }
          }
          return r
        })

        let updatedSelected = selectedRequest
        if (selectedRequest && selectedRequest._id === actionModal.requestId) {
          updatedSelected = {
            ...selectedRequest,
            status: actionModal.type === 'APPROVE' ? 'APPROVED' : 'REJECTED',
            rejectionReason: actionModal.type === 'REJECT' ? actionModal.reason : undefined,
            reviewedAt: new Date().toISOString(),
          }
        }

        set({
          requests: updatedRequests,
          selectedRequest: updatedSelected,
          actionModal: {
            isOpen: false,
            type: 'APPROVE',
            requestId: '',
            doctorName: '',
            hospitalName: '',
            reason: '',
            isSubmitting: false,
          },
          toastMessage: {
            type: 'success',
            text:
              actionModal.type === 'APPROVE'
                ? `${actionModal.doctorName} successfully approved and affiliated!`
                : `${actionModal.doctorName}'s application was rejected.`,
          },
        })
      } catch (err: any) {
        set((state) => ({
          actionModal: { ...state.actionModal, isSubmitting: false },
          toastMessage: {
            type: 'error',
            text: err.message || 'Failed to update join request status. Please try again.',
          },
        }))
      }
    },

    clearToast: () => set({ toastMessage: null }),
  })
)
