import { create } from 'zustand'
import { superAdminService } from '@/services/superAdminService'
import type { DoctorVerificationRecord } from '@/types/superAdmin'

interface PaginationMeta {
  totalDocs: number
  totalPages: number
  currentPage: number
  limit: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface AdminDoctorsFilters {
  search: string
  status: 'ALL' | 'APPROVED' | 'PENDING' | 'REJECTED' | 'SUSPENDED'
  accountStatus: 'all' | 'active' | 'inactive'
  hospitalId: string
  department: string
  specialization: string
  sortBy: 'newest' | 'oldest' | 'experience_desc' | 'rating_desc' | 'fee_desc' | 'fee_asc'
  viewMode: 'grid' | 'table'
  page: number
  limit: number
}

interface AdminDoctorsState {
  doctors: DoctorVerificationRecord[]
  stats: {
    total: number
    active: number
    disabled: number
    pending: number
  }
  pagination: PaginationMeta
  filters: AdminDoctorsFilters
  hospitals: Array<{ _id: string; name: string; city?: string }>
  departments: string[]
  selectedDoctor: DoctorVerificationRecord | null
  isDetailDrawerOpen: boolean
  statusModal: {
    isOpen: boolean
    doctor: DoctorVerificationRecord | null
    action: 'enable' | 'disable'
  }
  isLoading: boolean
  isActionLoading: boolean
  actionNotification: { type: 'success' | 'error'; message: string } | null

  // Actions
  fetchDoctors: (pageOverride?: number) => Promise<void>
  fetchHospitals: () => Promise<void>
  setFilters: (newFilters: Partial<AdminDoctorsFilters>) => void
  resetFilters: () => void
  openDoctorDetails: (doctor: DoctorVerificationRecord) => void
  closeDoctorDetails: () => void
  openStatusModal: (doctor: DoctorVerificationRecord, action: 'enable' | 'disable') => void
  closeStatusModal: () => void
  toggleDoctorStatus: (doctorId: string, nextActiveState: boolean, reason?: string) => Promise<boolean>
  clearNotification: () => void
}

const DEFAULT_FILTERS: AdminDoctorsFilters = {
  search: '',
  status: 'ALL',
  accountStatus: 'all',
  hospitalId: 'ALL',
  department: 'ALL',
  specialization: 'ALL',
  sortBy: 'newest',
  viewMode: 'grid',
  page: 1,
  limit: 12,
}

export const useAdminDoctorsStore = create<AdminDoctorsState>((set, get) => ({
  doctors: [],
  stats: {
    total: 0,
    active: 0,
    disabled: 0,
    pending: 0,
  },
  pagination: {
    totalDocs: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 12,
    hasNextPage: false,
    hasPrevPage: false,
  },
  filters: { ...DEFAULT_FILTERS },
  hospitals: [],
  departments: [],
  selectedDoctor: null,
  isDetailDrawerOpen: false,
  statusModal: {
    isOpen: false,
    doctor: null,
    action: 'disable',
  },
  isLoading: false,
  isActionLoading: false,
  actionNotification: null,

  fetchDoctors: async (pageOverride?: number) => {
    const { filters } = get()
    const targetPage = pageOverride ?? filters.page

    set({ isLoading: true })
    try {
      const res = await superAdminService.getAllDoctors({
        page: targetPage,
        limit: filters.limit,
        search: filters.search,
        status: filters.status,
        accountStatus: filters.accountStatus,
        hospitalId: filters.hospitalId,
        department: filters.department,
        specialization: filters.specialization,
        sortBy: filters.sortBy,
      })

      const responseData = res?.data || res
      const doctorList: DoctorVerificationRecord[] = responseData?.doctors || []
      const paginationMeta: PaginationMeta = responseData?.pagination || {
        totalDocs: doctorList.length,
        totalPages: Math.ceil(doctorList.length / filters.limit) || 1,
        currentPage: targetPage,
        limit: filters.limit,
        hasNextPage: false,
        hasPrevPage: false,
      }

      // Extract unique departments for filter
      const deptSet = new Set<string>()
      doctorList.forEach((d) => {
        if (d.department) deptSet.add(d.department)
      })

      const stats = responseData?.stats || {
        total: paginationMeta.totalDocs,
        active: doctorList.filter((d) => d.userId?.isActive).length,
        disabled: doctorList.filter((d) => d.userId && !d.userId.isActive).length,
        pending: doctorList.filter((d) => d.verificationStatus === 'PENDING').length,
      }

      set({
        doctors: doctorList,
        pagination: paginationMeta,
        stats,
        departments: Array.from(deptSet),
        filters: { ...filters, page: targetPage },
        isLoading: false,
      })
    } catch (err) {
      console.error('Failed to fetch admin doctors:', err)
      set({ isLoading: false })
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
      console.warn('Failed to load hospitals for doctor filters:', err)
    }
  },

  setFilters: (newFilters: Partial<AdminDoctorsFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters, page: newFilters.page ?? 1 },
    }))
    get().fetchDoctors(1)
  },

  resetFilters: () => {
    set({ filters: { ...DEFAULT_FILTERS } })
    get().fetchDoctors(1)
  },

  openDoctorDetails: (doctor: DoctorVerificationRecord) => {
    set({ selectedDoctor: doctor, isDetailDrawerOpen: true })
  },

  closeDoctorDetails: () => {
    set({ isDetailDrawerOpen: false, selectedDoctor: null })
  },

  openStatusModal: (doctor: DoctorVerificationRecord, action: 'enable' | 'disable') => {
    set({
      statusModal: {
        isOpen: true,
        doctor,
        action,
      },
    })
  },

  closeStatusModal: () => {
    set({
      statusModal: {
        isOpen: false,
        doctor: null,
        action: 'disable',
      },
    })
  },

  toggleDoctorStatus: async (doctorId: string, nextActiveState: boolean, reason?: string) => {
    set({ isActionLoading: true })
    try {
      const res = await superAdminService.toggleDoctorStatus(doctorId, nextActiveState, reason)
      const updatedProfile: DoctorVerificationRecord = res?.data || res

      set((state) => {
        const nextDoctors = state.doctors.map((d) => {
          if (d._id === doctorId) {
            return {
              ...d,
              verificationStatus: nextActiveState ? ('APPROVED' as const) : ('SUSPENDED' as const),
              rejectionReason: nextActiveState ? '' : reason || 'Account disabled by Super Admin',
              userId: {
                ...d.userId,
                isActive: nextActiveState,
                isAccountApproved: nextActiveState,
              },
            }
          }
          return d
        })

        const nextSelected =
          state.selectedDoctor?._id === doctorId
            ? {
                ...state.selectedDoctor,
                verificationStatus: nextActiveState ? ('APPROVED' as const) : ('SUSPENDED' as const),
                rejectionReason: nextActiveState ? '' : reason || 'Account disabled by Super Admin',
                userId: {
                  ...state.selectedDoctor.userId,
                  isActive: nextActiveState,
                  isAccountApproved: nextActiveState,
                },
              }
            : state.selectedDoctor

        const deltaActive = nextActiveState ? 1 : -1
        const deltaDisabled = nextActiveState ? -1 : 1

        return {
          doctors: nextDoctors,
          selectedDoctor: nextSelected,
          isActionLoading: false,
          stats: {
            ...state.stats,
            active: Math.max(0, state.stats.active + deltaActive),
            disabled: Math.max(0, state.stats.disabled + deltaDisabled),
          },
          actionNotification: {
            type: 'success',
            message: `Dr. ${updatedProfile?.userId?.name || 'Doctor'} account has been ${
              nextActiveState ? 'activated and enabled' : 'disabled and access revoked'
            }!`,
          },
        }
      })

      // Close modal
      get().closeStatusModal()
      return true
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update doctor status'
      set({
        isActionLoading: false,
        actionNotification: { type: 'error', message: msg },
      })
      return false
    }
  },

  clearNotification: () => set({ actionNotification: null }),
}))
