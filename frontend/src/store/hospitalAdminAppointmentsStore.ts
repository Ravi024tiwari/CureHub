import { create } from 'zustand'
import { hospitalAdminService } from '@/services/hospitalAdminService'
import type {
  AdminAppointmentItem,
  AdminAppointmentsKpis,
  AdminAppointmentsFilterOptions,
  AdminAppointmentsPagination,
  AdminAppointmentDetailResponse,
} from '@/types/hospitalAdmin'

interface HospitalAdminAppointmentsState {
  appointments: AdminAppointmentItem[]
  kpis: AdminAppointmentsKpis
  filterOptions: AdminAppointmentsFilterOptions
  pagination: AdminAppointmentsPagination
  isLoading: boolean
  isLoadingMore: boolean
  error: string | null

  // Filters
  searchQuery: string
  selectedHospitalId: string
  selectedDoctorId: string
  selectedDepartment: string
  selectedDate: string
  selectedStatus: string
  activeTab: 'all' | 'today' | 'upcoming' | 'completed' | 'cancelled'

  // Appointment Details Panel
  selectedAppointment: AdminAppointmentItem | null
  appointmentDetail: AdminAppointmentDetailResponse | null
  isDetailLoading: boolean
  activeDrawerTab: 'details' | 'history'

  // Action feedback
  actionSuccessMessage: string | null
  actionErrorMessage: string | null

  // Methods
  fetchInitialAppointments: () => Promise<void>
  fetchNextPage: () => Promise<void>
  setSearchQuery: (query: string) => void
  setSelectedHospitalId: (id: string) => void
  setSelectedDoctorId: (id: string) => void
  setSelectedDepartment: (dept: string) => void
  setSelectedDate: (date: string) => void
  setSelectedStatus: (status: string) => void
  setActiveTab: (tab: 'all' | 'today' | 'upcoming' | 'completed' | 'cancelled') => void
  resetFilters: () => void

  // Details & Action Handlers
  openAppointmentDetails: (appointment: AdminAppointmentItem) => Promise<void>
  closeAppointmentDetails: () => void
  setActiveDrawerTab: (tab: 'details' | 'history') => void
  cancelAppointment: (appointmentId: string, reason?: string) => Promise<boolean>
  rescheduleAppointment: (
    appointmentId: string,
    payload: { newSlotId?: string; date?: string; startTime?: string; reason?: string }
  ) => Promise<boolean>
  bookAppointment: (payload: {
    patientName: string
    phoneNumber: string
    age?: number | ''
    gender?: string
    hospitalId: string
    doctorId: string
    date: string
    startTime: string
    consultationFee?: number
    symptoms?: string
    notes?: string
  }) => Promise<boolean>
  clearActionMessages: () => void
}

export const useHospitalAdminAppointmentsStore = create<HospitalAdminAppointmentsState>(
  (set, get) => ({
    appointments: [],
    kpis: {
      total: 0,
      totalTrend: '',
      completed: 0,
      completedPct: 0,
      upcoming: 0,
      upcomingPct: 0,
      cancelled: 0,
      cancelledPct: 0,
    },
    filterOptions: {
      hospitals: [],
      doctors: [],
      departments: [],
    },
    pagination: {
      totalDocs: 0,
      totalPages: 1,
      currentPage: 1,
      limit: 10,
      hasNextPage: false,
      hasPrevPage: false,
    },
    isLoading: false,
    isLoadingMore: false,
    error: null,

    // Filters
    searchQuery: '',
    selectedHospitalId: 'all',
    selectedDoctorId: 'all',
    selectedDepartment: 'all',
    selectedDate: '',
    selectedStatus: 'ALL',
    activeTab: 'all',

    // Details Drawer
    selectedAppointment: null,
    appointmentDetail: null,
    isDetailLoading: false,
    activeDrawerTab: 'details',

    actionSuccessMessage: null,
    actionErrorMessage: null,

    // ── Fetch Initial Appointments (10 records limit from real API) ─────
    fetchInitialAppointments: async () => {
      set({ isLoading: true, error: null })

      try {
        const {
          searchQuery,
          selectedHospitalId,
          selectedDoctorId,
          selectedDepartment,
          selectedDate,
          selectedStatus,
          activeTab,
        } = get()

        const params: Record<string, any> = {
          page: 1,
          limit: 10,
          mode: 'IN_PERSON',
        }

        if (searchQuery.trim()) params.search = searchQuery.trim()
        if (selectedHospitalId && selectedHospitalId !== 'all') params.hospitalId = selectedHospitalId
        if (selectedDoctorId && selectedDoctorId !== 'all') params.doctorId = selectedDoctorId
        if (selectedDepartment && selectedDepartment !== 'all' && selectedDepartment !== 'All Departments') {
          params.department = selectedDepartment
        }
        if (selectedDate) params.date = selectedDate
        if (selectedStatus && selectedStatus !== 'ALL') params.status = selectedStatus
        if (activeTab && activeTab !== 'all') params.tab = activeTab

        const response = await hospitalAdminService.getAppointments(params)
        const result = (response as any)?.data || response

        set({
          appointments: result?.appointments || [],
          kpis: result?.kpis || {
            total: 0,
            totalTrend: '',
            completed: 0,
            completedPct: 0,
            upcoming: 0,
            upcomingPct: 0,
            cancelled: 0,
            cancelledPct: 0,
          },
          filterOptions: result?.filterOptions || {
            hospitals: [],
            doctors: [],
            departments: [],
          },
          pagination: result?.pagination || {
            totalDocs: (result?.appointments || []).length,
            totalPages: 1,
            currentPage: 1,
            limit: 10,
            hasNextPage: false,
            hasPrevPage: false,
          },
          isLoading: false,
          error: null,
        })
      } catch (err: any) {
        set({
          appointments: [],
          error: err?.response?.data?.message || err?.message || 'Failed to load appointments from server.',
          isLoading: false,
        })
      }
    },

    // ── Fetch Next Page (Infinite Scroll - Real Database Pagination) ────
    fetchNextPage: async () => {
      const { pagination, isLoadingMore, isLoading, appointments } = get()

      if (isLoadingMore || isLoading || !pagination.hasNextPage) {
        return
      }

      set({ isLoadingMore: true })

      try {
        const nextPage = pagination.currentPage + 1
        const {
          searchQuery,
          selectedHospitalId,
          selectedDoctorId,
          selectedDepartment,
          selectedDate,
          selectedStatus,
          activeTab,
        } = get()

        const params: Record<string, any> = {
          page: nextPage,
          limit: 10,
          mode: 'IN_PERSON',
        }

        if (searchQuery.trim()) params.search = searchQuery.trim()
        if (selectedHospitalId && selectedHospitalId !== 'all') params.hospitalId = selectedHospitalId
        if (selectedDoctorId && selectedDoctorId !== 'all') params.doctorId = selectedDoctorId
        if (selectedDepartment && selectedDepartment !== 'all' && selectedDepartment !== 'All Departments') {
          params.department = selectedDepartment
        }
        if (selectedDate) params.date = selectedDate
        if (selectedStatus && selectedStatus !== 'ALL') params.status = selectedStatus
        if (activeTab && activeTab !== 'all') params.tab = activeTab

        const response = await hospitalAdminService.getAppointments(params)
        const result = (response as any)?.data || response
        const newBatch: AdminAppointmentItem[] = result?.appointments || []

        set({
          appointments: [...appointments, ...newBatch],
          pagination: result?.pagination || {
            ...pagination,
            currentPage: nextPage,
            hasNextPage: false,
          },
          isLoadingMore: false,
        })
      } catch (err: any) {
        set({ isLoadingMore: false })
      }
    },

    // Filter controls
    setSearchQuery: (query: string) => {
      set({ searchQuery: query })
      get().fetchInitialAppointments()
    },

    setSelectedHospitalId: (id: string) => {
      set({ selectedHospitalId: id })
      get().fetchInitialAppointments()
    },

    setSelectedDoctorId: (id: string) => {
      set({ selectedDoctorId: id })
      get().fetchInitialAppointments()
    },

    setSelectedDepartment: (dept: string) => {
      set({ selectedDepartment: dept })
      get().fetchInitialAppointments()
    },

    setSelectedDate: (date: string) => {
      set({ selectedDate: date })
      get().fetchInitialAppointments()
    },

    setSelectedStatus: (status: string) => {
      set({ selectedStatus: status })
      get().fetchInitialAppointments()
    },

    setActiveTab: (tab: 'all' | 'today' | 'upcoming' | 'completed' | 'cancelled') => {
      set({ activeTab: tab })
      get().fetchInitialAppointments()
    },

    resetFilters: () => {
      set({
        searchQuery: '',
        selectedHospitalId: 'all',
        selectedDoctorId: 'all',
        selectedDepartment: 'all',
        selectedDate: '',
        selectedStatus: 'ALL',
        activeTab: 'all',
      })
      get().fetchInitialAppointments()
    },

    // ── Open Appointment Details Drawer (Real Database Lookup) ─────────
    openAppointmentDetails: async (appointment: AdminAppointmentItem) => {
      set({
        selectedAppointment: appointment,
        isDetailLoading: true,
        activeDrawerTab: 'details',
      })

      try {
        const detailRes = await hospitalAdminService.getAppointmentById(appointment._id)
        const detail = (detailRes as any)?.data || detailRes

        set({
          appointmentDetail: detail,
          isDetailLoading: false,
        })
      } catch (err: any) {
        set({
          isDetailLoading: false,
          appointmentDetail: {
            appointment,
            patientProfile: appointment.patient as any,
            medicalHistory: [],
            payment: appointment.payment,
          },
        })
      }
    },

    closeAppointmentDetails: () => {
      set({ selectedAppointment: null, appointmentDetail: null })
    },

    setActiveDrawerTab: (tab: 'details' | 'history') => {
      set({ activeDrawerTab: tab })
    },

    // ── Cancel Appointment (Real Database Mutation) ─────────────────────
    cancelAppointment: async (appointmentId: string, reason?: string) => {
      try {
        await hospitalAdminService.cancelAppointment(appointmentId, reason)

        set((state) => ({
          appointments: state.appointments.map((a) =>
            a._id === appointmentId
              ? {
                  ...a,
                  status: 'CANCELLED_BY_PATIENT',
                  displayStatus: 'Cancelled',
                  cancellation: {
                    reason: reason || 'Cancelled by Hospital Administration',
                    cancelledAt: new Date().toISOString(),
                  },
                }
              : a
          ),
          kpis: {
            ...state.kpis,
            cancelled: state.kpis.cancelled + 1,
            upcoming: Math.max(0, state.kpis.upcoming - 1),
          },
          actionSuccessMessage: 'Appointment cancelled successfully.',
          actionErrorMessage: null,
        }))

        // Refresh details drawer if open
        const curAppt = get().selectedAppointment
        if (curAppt && curAppt._id === appointmentId) {
          get().openAppointmentDetails({
            ...curAppt,
            status: 'CANCELLED_BY_PATIENT',
            displayStatus: 'Cancelled',
          })
        }

        return true
      } catch (err: any) {
        set({
          actionErrorMessage:
            err?.response?.data?.message || err?.message || 'Failed to cancel appointment.',
        })
        return false
      }
    },

    // ── Reschedule Appointment (Real Database Mutation) ─────────────────
    rescheduleAppointment: async (appointmentId, payload) => {
      try {
        await hospitalAdminService.rescheduleAppointment(appointmentId, payload)
        await get().fetchInitialAppointments()

        set({
          actionSuccessMessage: 'Appointment rescheduled successfully.',
          actionErrorMessage: null,
        })
        return true
      } catch (err: any) {
        set({
          actionErrorMessage:
            err?.response?.data?.message || err?.message || 'Failed to reschedule appointment.',
        })
        return false
      }
    },

    // ── Book Real On-site Appointment (Real Database Creation) ──────────
    bookAppointment: async (payload) => {
      try {
        await hospitalAdminService.bookAppointment(payload)
        await get().fetchInitialAppointments()

        set({
          actionSuccessMessage: `Appointment booked successfully for ${payload.patientName}!`,
          actionErrorMessage: null,
        })
        return true
      } catch (err: any) {
        set({
          actionErrorMessage:
            err?.response?.data?.message || err?.message || 'Failed to book appointment.',
        })
        return false
      }
    },

    clearActionMessages: () => {
      set({ actionSuccessMessage: null, actionErrorMessage: null })
    },
  })
)
