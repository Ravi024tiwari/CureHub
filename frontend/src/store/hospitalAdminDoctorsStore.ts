import { create } from 'zustand'
import { hospitalAdminService } from '@/services/hospitalAdminService'
import type {
  AffiliatedDoctorItem,
  HospitalAdminDoctorsKpis,
  HospitalBranchPagination,
} from '@/types/hospitalAdmin'

export interface HospitalAdminDoctorsState {
  doctors: AffiliatedDoctorItem[]
  pagination: HospitalBranchPagination
  kpis: HospitalAdminDoctorsKpis
  departmentStats: Array<{ department: string; count: number }>
  hospitalsList: Array<{ id: string; name: string; city: string }>
  isLoading: boolean
  error: string | null

  // Filters
  searchQuery: string
  selectedHospitalId: string
  selectedDepartment: string
  sortBy: string
  viewMode: 'grid' | 'table'
  currentPage: number
  itemsPerPage: number

  // Disaffiliate Modal State
  disaffiliateModal: {
    isOpen: boolean
    doctor: AffiliatedDoctorItem | null
    isSubmitting: boolean
  }

  // Doctor Detail Modal
  selectedDoctorForModal: AffiliatedDoctorItem | null

  // Toast
  toastMessage: { type: 'success' | 'error'; text: string } | null

  // Actions
  fetchDoctors: () => Promise<void>
  setSearchQuery: (query: string) => void
  setSelectedHospitalId: (hospId: string) => void
  setSelectedDepartment: (dept: string) => void
  setSortBy: (sort: string) => void
  setViewMode: (mode: 'grid' | 'table') => void
  setCurrentPage: (page: number) => void
  resetFilters: () => void

  // Disaffiliate Actions
  openDisaffiliateModal: (doctor: AffiliatedDoctorItem) => void
  closeDisaffiliateModal: () => void
  confirmDisaffiliate: () => Promise<void>

  // Profile modal action
  setSelectedDoctorForModal: (doctor: AffiliatedDoctorItem | null) => void
  clearToast: () => void
}

export const useHospitalAdminDoctorsStore = create<HospitalAdminDoctorsState>((set, get) => ({
  doctors: [],
  pagination: {
    totalDocs: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
  },
  kpis: {
    totalDoctors: 0,
    totalDepartments: 0,
    averageRating: 0,
    averageFee: 0,
  },
  departmentStats: [],
  hospitalsList: [],
  isLoading: false,
  error: null,

  searchQuery: '',
  selectedHospitalId: 'all',
  selectedDepartment: 'ALL',
  sortBy: 'newest',
  viewMode: 'grid',
  currentPage: 1,
  itemsPerPage: 10,

  disaffiliateModal: {
    isOpen: false,
    doctor: null,
    isSubmitting: false,
  },

  selectedDoctorForModal: null,
  toastMessage: null,

  fetchDoctors: async () => {
    set({ isLoading: true, error: null })
    const { currentPage, itemsPerPage, selectedHospitalId, selectedDepartment, searchQuery, sortBy } = get()

    try {
      const response = await hospitalAdminService.getAffiliatedDoctors({
        page: currentPage,
        limit: itemsPerPage,
        hospitalId: selectedHospitalId !== 'all' ? selectedHospitalId : undefined,
        department: selectedDepartment !== 'ALL' ? selectedDepartment : undefined,
        search: searchQuery.trim() || undefined,
        sortBy,
      })

      if (response && Array.isArray(response.doctors)) {
        set({
          doctors: response.doctors,
          pagination: response.pagination || {
            totalDocs: response.doctors.length,
            totalPages: 1,
            currentPage: 1,
            limit: itemsPerPage,
            hasNextPage: false,
            hasPrevPage: false,
          },
          kpis: response.kpis || {
            totalDoctors: response.doctors.length,
            totalDepartments: 0,
            averageRating: 0,
            averageFee: 0,
          },
          departmentStats: response.departmentStats || [],
          hospitalsList: response.hospitalsList || [],
          error: null,
        })
      } else {
        set({
          doctors: [],
          error: null,
        })
      }
    } catch (err: any) {
      console.error('Error fetching affiliated doctors:', err)
      set({
        doctors: [],
        error: err.message || 'Failed to fetch doctors',
      })
    } finally {
      set({ isLoading: false })
    }
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query, currentPage: 1 })
    get().fetchDoctors()
  },

  setSelectedHospitalId: (hospId: string) => {
    set({ selectedHospitalId: hospId, currentPage: 1 })
    get().fetchDoctors()
  },

  setSelectedDepartment: (dept: string) => {
    set({ selectedDepartment: dept, currentPage: 1 })
    get().fetchDoctors()
  },

  setSortBy: (sort: string) => {
    set({ sortBy: sort, currentPage: 1 })
    get().fetchDoctors()
  },

  setViewMode: (mode: 'grid' | 'table') => set({ viewMode: mode }),

  setCurrentPage: (page: number) => {
    set({ currentPage: page })
    get().fetchDoctors()
  },

  resetFilters: () => {
    set({
      searchQuery: '',
      selectedHospitalId: 'all',
      selectedDepartment: 'ALL',
      sortBy: 'newest',
      currentPage: 1,
    })
    get().fetchDoctors()
  },

  openDisaffiliateModal: (doctor: AffiliatedDoctorItem) => {
    set({
      disaffiliateModal: {
        isOpen: true,
        doctor,
        isSubmitting: false,
      },
    })
  },

  closeDisaffiliateModal: () => {
    set((state) => ({
      disaffiliateModal: {
        ...state.disaffiliateModal,
        isOpen: false,
        doctor: null,
        isSubmitting: false,
      },
    }))
  },

  confirmDisaffiliate: async () => {
    const { disaffiliateModal } = get()
    const doc = disaffiliateModal.doctor
    if (!doc || !doc.hospitalId?._id) return

    set((state) => ({
      disaffiliateModal: { ...state.disaffiliateModal, isSubmitting: true },
    }))

    try {
      await hospitalAdminService.disaffiliateDoctor(doc.hospitalId._id, doc._id)

      set({
        disaffiliateModal: {
          isOpen: false,
          doctor: null,
          isSubmitting: false,
        },
        toastMessage: {
          type: 'success',
          text: `Dr. ${doc.userId?.name?.replace(/^Dr\.\s*/i, '') || 'Doctor'} was removed from ${doc.hospitalId?.name || 'hospital'}.`,
        },
      })

      // Refresh list
      await get().fetchDoctors()
    } catch (err: any) {
      set((state) => ({
        disaffiliateModal: { ...state.disaffiliateModal, isSubmitting: false },
        toastMessage: {
          type: 'error',
          text: err.message || 'Failed to remove doctor from hospital.',
        },
      }))
    }
  },

  setSelectedDoctorForModal: (doctor: AffiliatedDoctorItem | null) => {
    set({ selectedDoctorForModal: doctor })
  },

  clearToast: () => set({ toastMessage: null }),
}))
