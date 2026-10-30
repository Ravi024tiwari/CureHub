import { create } from 'zustand'
import { hospitalAdminService } from '@/services/hospitalAdminService'
import {
  type AdminDoctorLeaveItem,
  type AdminDoctorLeavesKpis,
  DoctorLeaveStatus,
} from '@/types/hospitalAdmin'

export interface HospitalAdminLeavesState {
  leaves: AdminDoctorLeaveItem[]
  kpis: AdminDoctorLeavesKpis
  isLoading: boolean
  error: string | null

  // Action status messages
  actionSuccessMessage: string | null
  actionErrorMessage: string | null
  isUpdatingStatus: boolean

  // Filters
  searchQuery: string
  selectedHospitalId: string
  selectedDepartment: string
  selectedStatus: string
  startDate: string
  endDate: string
  currentPage: number
  limit: number
  totalPages: number
  totalDocs: number

  // Dynamic filter dropdown items
  hospitalsList: Array<{ id: string; name: string }>
  departmentsList: string[]

  // Selected leave request for detail panel/drawer
  selectedLeave: AdminDoctorLeaveItem | null
  selectedLeaveAffectedAppointments: any[]
  doctorLeaveHistory: AdminDoctorLeaveItem[]
  isLoadingLeaveDetails: boolean
  activeDetailTab: 'overview' | 'history'

  // Action dialog modal state
  actionModal: {
    isOpen: boolean
    mode: 'APPROVE' | 'REJECT'
    leave: AdminDoctorLeaveItem | null
    remark: string
  }

  // Actions
  fetchLeaves: (pageOverride?: number) => Promise<void>
  selectLeave: (leave: AdminDoctorLeaveItem | null) => Promise<void>
  setActiveDetailTab: (tab: 'overview' | 'history') => void
  setSearchQuery: (query: string) => void
  setSelectedHospitalId: (hospitalId: string) => void
  setSelectedDepartment: (department: string) => void
  setSelectedStatus: (status: string) => void
  setDateRange: (startDate: string, endDate: string) => void
  setCurrentPage: (page: number) => void
  resetFilters: () => void

  // Leave approval / rejection flow
  openActionModal: (mode: 'APPROVE' | 'REJECT', leave?: AdminDoctorLeaveItem) => void
  closeActionModal: () => void
  setActionModalRemark: (remark: string) => void
  submitStatusUpdate: (
    directMode?: 'APPROVE' | 'REJECT' | DoctorLeaveStatus,
    directRemark?: string
  ) => Promise<boolean>
  clearActionMessages: () => void
}

const DEFAULT_DEPARTMENTS = [
  'All Departments',
  'Cardiology',
  'Orthopedics',
  'Pediatrics',
  'General Medicine',
  'Dermatology',
  'Neurology',
  'Gynecology',
  'ENT',
  'Ophthalmology',
  'Radiology',
]

export const useHospitalAdminLeavesStore = create<HospitalAdminLeavesState>((set, get) => ({
  leaves: [],
  kpis: {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0,
    totalTrend: '+12% from last month',
    pendingPercentage: 0,
    approvedPercentage: 0,
    rejectedPercentage: 0,
  },
  isLoading: false,
  error: null,

  actionSuccessMessage: null,
  actionErrorMessage: null,
  isUpdatingStatus: false,

  searchQuery: '',
  selectedHospitalId: 'ALL',
  selectedDepartment: 'ALL',
  selectedStatus: 'ALL',
  startDate: '',
  endDate: '',
  currentPage: 1,
  limit: 10,
  totalPages: 1,
  totalDocs: 0,

  hospitalsList: [],
  departmentsList: DEFAULT_DEPARTMENTS,

  selectedLeave: null,
  selectedLeaveAffectedAppointments: [],
  doctorLeaveHistory: [],
  isLoadingLeaveDetails: false,
  activeDetailTab: 'overview',

  actionModal: {
    isOpen: false,
    mode: 'APPROVE',
    leave: null,
    remark: '',
  },

  fetchLeaves: async (pageOverride?: number) => {
    const page = pageOverride !== undefined ? pageOverride : get().currentPage
    set({ isLoading: true, error: null })

    try {
      const {
        searchQuery,
        selectedHospitalId,
        selectedDepartment,
        selectedStatus,
        startDate,
        endDate,
        limit,
      } = get()

      const res = await hospitalAdminService.getDoctorLeaves({
        page,
        limit,
        status: selectedStatus,
        hospitalId: selectedHospitalId,
        department: selectedDepartment,
        search: searchQuery,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      })

      const rawLeaves: AdminDoctorLeaveItem[] = res?.leaves || []
      const counts = res?.counts || { total: 0, pending: 0, approved: 0, rejected: 0, cancelled: 0 }
      const pagination = res?.pagination || { totalDocs: 0, totalPages: 1, currentPage: 1 }

      const safeTotal = counts.total > 0 ? counts.total : 1
      const computedKpis: AdminDoctorLeavesKpis = {
        total: counts.total || 0,
        pending: counts.pending || 0,
        approved: counts.approved || 0,
        rejected: counts.rejected || 0,
        cancelled: counts.cancelled || 0,
        totalTrend: '+12% from last month',
        pendingPercentage: Math.round(((counts.pending || 0) / safeTotal) * 1000) / 10,
        approvedPercentage: Math.round(((counts.approved || 0) / safeTotal) * 1000) / 10,
        rejectedPercentage: Math.round(((counts.rejected || 0) / safeTotal) * 1000) / 10,
      }

      // Extract unique hospitals & departments for dropdowns if not yet populated
      const hospitalsMap = new Map<string, string>()
      rawLeaves.forEach((l) => {
        if (l.hospitalId?._id && l.hospitalId?.name) {
          hospitalsMap.set(l.hospitalId._id, l.hospitalId.name)
        }
      })
      const dynamicHospitals = Array.from(hospitalsMap.entries()).map(([id, name]) => ({ id, name }))

      // Keep previously selected leave updated if present in new list, or auto-select first item on wide screens
      const currentSelected = get().selectedLeave
      let nextSelected = currentSelected
      if (currentSelected) {
        nextSelected = rawLeaves.find((l) => l._id === currentSelected._id) || currentSelected
      } else if (rawLeaves.length > 0) {
        // Auto-select first leave item for desktop split view
        nextSelected = rawLeaves[0]
      }

      set({
        leaves: rawLeaves,
        kpis: computedKpis,
        totalDocs: pagination.totalDocs || 0,
        totalPages: pagination.totalPages || 1,
        currentPage: pagination.currentPage || page,
        isLoading: false,
        hospitalsList: dynamicHospitals.length > 0 ? dynamicHospitals : get().hospitalsList,
        selectedLeave: nextSelected,
      })
    } catch (err: any) {
      console.error('Error fetching admin doctor leaves:', err)
      set({
        isLoading: false,
        error: err?.response?.data?.message || err?.message || 'Failed to load doctor leave requests.',
      })
    }
  },

  selectLeave: async (leave: AdminDoctorLeaveItem | null) => {
    if (!leave) {
      set({
        selectedLeave: null,
        selectedLeaveAffectedAppointments: [],
        doctorLeaveHistory: [],
      })
      return
    }

    set({
      selectedLeave: leave,
      isLoadingLeaveDetails: true,
      activeDetailTab: 'overview',
    })

    try {
      const res = await hospitalAdminService.getDoctorLeaveById(leave._id)
      const fullLeave = res?.leave || leave
      const affectedAppointments = res?.affectedAppointments || []

      // Also gather doctor leave history from current list or API
      const doctorIdStr =
        typeof leave.doctorId === 'object' ? leave.doctorId?._id : leave.doctorId
      const history = get().leaves.filter(
        (l) =>
          l._id !== leave._id &&
          (typeof l.doctorId === 'object' ? l.doctorId?._id : l.doctorId) === doctorIdStr
      )

      set({
        selectedLeave: fullLeave,
        selectedLeaveAffectedAppointments: affectedAppointments,
        doctorLeaveHistory: history,
        isLoadingLeaveDetails: false,
      })
    } catch (err: any) {
      console.warn('Could not fetch deep leave details:', err)
      set({
        selectedLeave: leave,
        isLoadingLeaveDetails: false,
      })
    }
  },

  setActiveDetailTab: (tab: 'overview' | 'history') => {
    set({ activeDetailTab: tab })
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query, currentPage: 1 })
    get().fetchLeaves(1)
  },

  setSelectedHospitalId: (hospitalId: string) => {
    set({ selectedHospitalId: hospitalId, currentPage: 1 })
    get().fetchLeaves(1)
  },

  setSelectedDepartment: (department: string) => {
    set({ selectedDepartment: department, currentPage: 1 })
    get().fetchLeaves(1)
  },

  setSelectedStatus: (status: string) => {
    set({ selectedStatus: status, currentPage: 1 })
    get().fetchLeaves(1)
  },

  setDateRange: (startDate: string, endDate: string) => {
    set({ startDate, endDate, currentPage: 1 })
    get().fetchLeaves(1)
  },

  setCurrentPage: (page: number) => {
    set({ currentPage: page })
    get().fetchLeaves(page)
  },

  resetFilters: () => {
    set({
      searchQuery: '',
      selectedHospitalId: 'ALL',
      selectedDepartment: 'ALL',
      selectedStatus: 'ALL',
      startDate: '',
      endDate: '',
      currentPage: 1,
    })
    get().fetchLeaves(1)
  },

  openActionModal: (mode: 'APPROVE' | 'REJECT', leave?: AdminDoctorLeaveItem) => {
    const targetLeave = leave || get().selectedLeave
    if (!targetLeave) return
    set({
      actionModal: {
        isOpen: true,
        mode,
        leave: targetLeave,
        remark: '',
      },
    })
  },

  closeActionModal: () => {
    set({
      actionModal: {
        isOpen: false,
        mode: 'APPROVE',
        leave: null,
        remark: '',
      },
    })
  },

  setActionModalRemark: (remark: string) => {
    set((state) => ({
      actionModal: {
        ...state.actionModal,
        remark,
      },
    }))
  },

  submitStatusUpdate: async (
    directMode?: 'APPROVE' | 'REJECT' | DoctorLeaveStatus,
    directRemark?: string
  ) => {
    const { actionModal, selectedLeave } = get()
    const mode = directMode || actionModal.mode
    const targetLeave = actionModal.leave || selectedLeave
    const remark = directRemark !== undefined ? directRemark : actionModal.remark

    if (!targetLeave) {
      set({ actionErrorMessage: 'No leave request selected to update.' })
      return false
    }

    if (mode === 'REJECT' && !remark.trim()) {
      set({
        actionErrorMessage: 'Please provide a clear rejection remark or feedback for the doctor.',
      })
      return false
    }

    set({ isUpdatingStatus: true, actionErrorMessage: null, actionSuccessMessage: null })

    try {
      const isApprove =
        mode === 'APPROVE' || (mode as string) === 'APPROVED' || (mode as string) === DoctorLeaveStatus.APPROVED
      const targetStatus: DoctorLeaveStatus = isApprove
        ? DoctorLeaveStatus.APPROVED
        : DoctorLeaveStatus.REJECTED
      const res = await hospitalAdminService.updateDoctorLeaveStatus(
        targetLeave._id,
        targetStatus,
        remark.trim() || undefined
      )

      const successMsg =
        res?.message ||
        (isApprove
          ? 'Doctor leave approved successfully. Affected bookings placed in 7-day continuity window.'
          : 'Doctor leave request has been rejected. Time slots have been reopened.')

      set({
        isUpdatingStatus: false,
        actionSuccessMessage: successMsg,
        actionModal: { isOpen: false, mode: 'APPROVE', leave: null, remark: '' },
      })

      // Refresh list to show updated status pill & KPIs
      await get().fetchLeaves()

      // Re-fetch active leave details
      if (get().selectedLeave?._id === targetLeave._id) {
        await get().selectLeave(targetLeave)
      }

      return true
    } catch (err: any) {
      console.error('Error updating doctor leave status:', err)
      set({
        isUpdatingStatus: false,
        actionErrorMessage:
          err?.response?.data?.message || err?.message || 'Failed to update leave status.',
      })
      return false
    }
  },

  clearActionMessages: () => {
    set({ actionSuccessMessage: null, actionErrorMessage: null })
  },
}))

