import { create } from 'zustand'
import { superAdminService } from '@/services/superAdminService'
import type {
  HospitalAdminVerificationRecord,
  AdminHospitalAdminsStats,
  AdminHospitalAdminsFilters,
} from '@/types/superAdmin'

interface PaginationMeta {
  totalDocs: number
  totalPages: number
  currentPage: number
  limit: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

interface AdminHospitalAdminsState {
  hospitalAdmins: HospitalAdminVerificationRecord[]
  stats: AdminHospitalAdminsStats
  pagination: PaginationMeta
  filters: AdminHospitalAdminsFilters
  selectedAdmin: HospitalAdminVerificationRecord | null
  selectedHospital: any | null
  isDetailDrawerOpen: boolean
  activeDrawerTab: 'overview' | 'documents' | 'hospital'
  statusModal: {
    isOpen: boolean
    admin: HospitalAdminVerificationRecord | null
    action: 'enable' | 'disable'
  }
  isLoading: boolean
  isDrawerLoading: boolean
  isActionLoading: boolean
  isExporting: boolean
  actionNotification: { type: 'success' | 'error'; message: string } | null

  // Actions
  fetchHospitalAdmins: (pageOverride?: number) => Promise<void>
  setFilters: (newFilters: Partial<AdminHospitalAdminsFilters>) => void
  resetFilters: () => void
  openAdminDetails: (admin: HospitalAdminVerificationRecord) => Promise<void>
  closeAdminDetails: () => void
  setActiveDrawerTab: (tab: 'overview' | 'documents' | 'hospital') => void
  openStatusModal: (admin: HospitalAdminVerificationRecord, action: 'enable' | 'disable') => void
  closeStatusModal: () => void
  toggleAdminStatus: (adminId: string, nextActiveState: boolean, reason?: string) => Promise<boolean>
  exportList: () => Promise<void>
  clearNotification: () => void
}

const DEFAULT_FILTERS: AdminHospitalAdminsFilters = {
  search: '',
  status: 'ALL',
  hospitalType: 'ALL',
  state: 'ALL',
  accountStatus: 'ALL',
  sortBy: 'newest',
  viewMode: 'table',
  page: 1,
  limit: 10,
}

export const useAdminHospitalAdminsStore = create<AdminHospitalAdminsState>((set, get) => ({
  hospitalAdmins: [],
  stats: {
    totalVerified: 0,
    verifiedGrowth: 0,
    hospitalsManaged: 0,
    hospitalsGrowth: 0,
    pendingVerifications: 0,
    rejectedRequests: 0,
    totalAll: 0,
  },
  pagination: {
    totalDocs: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
  },
  filters: { ...DEFAULT_FILTERS },
  selectedAdmin: null,
  selectedHospital: null,
  isDetailDrawerOpen: false,
  activeDrawerTab: 'overview',
  statusModal: {
    isOpen: false,
    admin: null,
    action: 'disable',
  },
  isLoading: false,
  isDrawerLoading: false,
  isActionLoading: false,
  isExporting: false,
  actionNotification: null,

  fetchHospitalAdmins: async (pageOverride?: number) => {
    set({ isLoading: true })
    const { filters } = get()
    const targetPage = pageOverride !== undefined ? pageOverride : filters.page

    try {
      const response = await superAdminService.getAllHospitalAdmins({
        page: targetPage,
        limit: 10,
        status: filters.status,
        hospitalType: filters.hospitalType,
        state: filters.state,
        search: filters.search,
        accountStatus: filters.accountStatus,
        sortBy: filters.sortBy,
      })

      if (response && response.hospitalAdmins) {
        set({
          hospitalAdmins: response.hospitalAdmins,
          pagination: response.pagination || {
            totalDocs: response.hospitalAdmins.length,
            totalPages: Math.ceil(response.hospitalAdmins.length / 10) || 1,
            currentPage: targetPage,
            limit: 10,
            hasNextPage: false,
            hasPrevPage: targetPage > 1,
          },
          stats: response.stats || get().stats,
          filters: { ...filters, page: targetPage },
        })
      }
    } catch (err: any) {
      console.error('Error in fetchHospitalAdmins:', err)
      set({
        actionNotification: {
          type: 'error',
          message: err?.response?.data?.message || 'Failed to load hospital administrators',
        },
      })
    } finally {
      set({ isLoading: false })
    }
  },

  setFilters: (newFilters: Partial<AdminHospitalAdminsFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }))
    // Trigger fetch with page reset to 1 if search or status changed
    const shouldResetPage = newFilters.page === undefined
    get().fetchHospitalAdmins(shouldResetPage ? 1 : newFilters.page)
  },

  resetFilters: () => {
    set({ filters: { ...DEFAULT_FILTERS } })
    get().fetchHospitalAdmins(1)
  },

  openAdminDetails: async (admin: HospitalAdminVerificationRecord) => {
    set({
      selectedAdmin: admin,
      selectedHospital: admin.hospitalId || null,
      isDetailDrawerOpen: true,
      activeDrawerTab: 'overview',
      isDrawerLoading: true,
    })

    try {
      const details = await superAdminService.getHospitalAdminDetails(admin._id)
      if (details) {
        set({
          selectedAdmin: details.hospitalAdmin || admin,
          selectedHospital: details.hospital || details.hospitalAdmin?.hospitalId || admin.hospitalId || null,
        })
      }
    } catch (err) {
      console.warn('Could not fetch enhanced hospital admin details, using cached row data:', err)
    } finally {
      set({ isDrawerLoading: false })
    }
  },

  closeAdminDetails: () => {
    set({
      isDetailDrawerOpen: false,
      selectedAdmin: null,
      selectedHospital: null,
    })
  },

  setActiveDrawerTab: (tab: 'overview' | 'documents' | 'hospital') => {
    set({ activeDrawerTab: tab })
  },

  openStatusModal: (admin: HospitalAdminVerificationRecord, action: 'enable' | 'disable') => {
    set({
      statusModal: {
        isOpen: true,
        admin,
        action,
      },
    })
  },

  closeStatusModal: () => {
    set({
      statusModal: {
        isOpen: false,
        admin: null,
        action: 'disable',
      },
    })
  },

  toggleAdminStatus: async (adminId: string, nextActiveState: boolean, reason?: string) => {
    set({ isActionLoading: true })
    try {
      await superAdminService.toggleHospitalAdminStatus(adminId, nextActiveState, reason)
      set({
        actionNotification: {
          type: 'success',
          message: `Hospital admin has been successfully ${nextActiveState ? 'activated' : 'disabled'}.`,
        },
      })
      // Refresh current page
      await get().fetchHospitalAdmins()
      return true
    } catch (err: any) {
      set({
        actionNotification: {
          type: 'error',
          message: err?.response?.data?.message || 'Failed to update hospital administrator status',
        },
      })
      return false
    } finally {
      set({ isActionLoading: false })
    }
  },

  exportList: async () => {
    const { filters } = get()
    set({ isExporting: true })
    try {
      const res = await superAdminService.exportHospitalAdmins({
        status: filters.status,
        hospitalType: filters.hospitalType,
      })

      const data = res?.admins || []
      if (!data.length) {
        set({
          actionNotification: {
            type: 'error',
            message: 'No administrator records available for export.',
          },
        })
        return
      }

      // Convert to CSV
      const headers = [
        'Admin Name',
        'Email',
        'Phone',
        'Designation',
        'Hospital Name',
        'Hospital Type',
        'Registration Number',
        'Verification Status',
        'Account Status',
        'Verified At',
      ]

      const rows = data.map((item: any) => [
        `"${item.name || ''}"`,
        `"${item.email || ''}"`,
        `"${item.phone || ''}"`,
        `"${item.designation || ''}"`,
        `"${item.hospitalName || ''}"`,
        `"${item.hospitalType || ''}"`,
        `"${item.registrationNumber || ''}"`,
        `"${item.verificationStatus || ''}"`,
        `"${item.accountStatus || ''}"`,
        `"${item.verifiedAt ? new Date(item.verifiedAt).toLocaleDateString() : 'N/A'}"`,
      ])

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e: any[]) => e.join(','))].join('\n')
      const encodedUri = encodeURI(csvContent)
      const link = document.createElement('a')
      link.setAttribute('href', encodedUri)
      link.setAttribute('download', `hospital_admins_export_${new Date().toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      set({
        actionNotification: {
          type: 'success',
          message: `Successfully exported ${data.length} hospital administrators.`,
        },
      })
    } catch (err: any) {
      set({
        actionNotification: {
          type: 'error',
          message: err?.response?.data?.message || 'Failed to export administrators list',
        },
      })
    } finally {
      set({ isExporting: false })
    }
  },

  clearNotification: () => {
    set({ actionNotification: null })
  },
}))
