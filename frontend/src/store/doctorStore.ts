import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { DoctorCardData, DoctorDetailData } from '@/types/patient'
import { fetchDoctorsListApi, fetchDoctorByIdApi } from '@/services/patientService'
import {
  doctorService,
  type DoctorDashboardData,
  type DoctorScheduleRule,
  type DoctorLeaveItem,
  type ApplyDoctorLeavePayload,
  type DoctorAppointmentItem,
  type DoctorAppointmentCounts,
  type DoctorProfileData,
  type UpdateDoctorProfilePayload,
  type DoctorExperience,
} from '@/services/doctorService'

export interface DoctorFilterParams {
  searchQuery: string
  selectedCity: string
  activeSpecialtyPill: string
  selectedSpecializations: string[]
  selectedHospitals: string[]
  selectedConsultationType: string
  selectedAvailability: string
  maxFee: number
  sortBy: string
}

export interface DoctorStoreState {
  // Data State
  doctors: DoctorCardData[]
  totalDoctors: number
  page: number
  limit: number
  hasMore: boolean
  isLoadingInitial: boolean
  isLoadingMore: boolean
  error: string | null

  // Selection & Details
  selectedDoctor: DoctorCardData | null
  currentDoctorDetail: DoctorDetailData | null
  isDetailLoading: boolean
  detailError: string | null
  favoriteDoctorIds: string[]

  // Filter State
  searchQuery: string
  selectedCity: string
  activeSpecialtyPill: string
  selectedSpecializations: string[]
  selectedHospitals: string[]
  selectedConsultationType: string
  selectedAvailability: string
  maxFee: number
  sortBy: string

  // Setters
  setSearchQuery: (query: string) => void
  setSelectedCity: (city: string) => void
  setActiveSpecialtyPill: (pill: string) => void
  setSelectedSpecializations: (specs: string[]) => void
  setSelectedHospitals: (hospitals: string[]) => void
  setSelectedConsultationType: (type: string) => void
  setSelectedAvailability: (availability: string) => void
  setMaxFee: (fee: number) => void
  setSortBy: (sort: string) => void
  setSelectedDoctor: (doctor: DoctorCardData | null) => void
  setCurrentDoctorDetail: (doctor: DoctorDetailData | null) => void
  toggleFavorite: (doctorId: string) => void
  clearFilters: () => void

  // Async API Actions
  fetchDoctors: (pageNumber?: number, isNewFilter?: boolean) => Promise<void>
  fetchNextPage: () => Promise<void>
  fetchDoctorById: (doctorId: string) => Promise<DoctorCardData | null>
  fetchDoctorDetailById: (doctorId: string) => Promise<DoctorDetailData | null>

  // Logged-in Doctor Profile State & Actions
  myDoctorProfile: DoctorProfileData | null
  isProfileLoading: boolean
  isSavingProfile: boolean
  profileError: string | null
  fetchMyDoctorProfile: () => Promise<DoctorProfileData | null>
  updateMyDoctorProfile: (payload: UpdateDoctorProfilePayload) => Promise<DoctorProfileData | null>
  setMyDoctorProfile: (profile: DoctorProfileData | null) => void

  // Logged-in Doctor Portal Practice Dashboard State & Actions
  dashboardData: DoctorDashboardData | null
  isDashboardLoading: boolean
  dashboardError: string | null
  fetchDoctorDashboard: () => Promise<DoctorDashboardData | null>
  setDashboardData: (data: DoctorDashboardData | null) => void
  clearDashboardData: () => void

  // Doctor Schedule & Availability Management
  scheduleRules: DoctorScheduleRule[]
  leaves: DoctorLeaveItem[]
  isScheduleLoading: boolean
  scheduleError: string | null
  isSavingSchedule: boolean
  fetchScheduleAndLeaves: () => Promise<void>
  saveScheduleRules: (rules: DoctorScheduleRule[]) => Promise<boolean>
  applyLeave: (
    payload: string | ApplyDoctorLeavePayload,
    reason?: string
  ) => Promise<{ success: boolean; affectedCount?: number; message?: string }>
  cancelLeave: (idOrDate: string) => Promise<boolean>

  // Doctor Appointments Management
  appointments: DoctorAppointmentItem[]
  recentCompletedAppointments: DoctorAppointmentItem[]
  appointmentCounts: DoctorAppointmentCounts
  selectedAppointment: DoctorAppointmentItem | null
  isAppointmentsLoading: boolean
  appointmentError: string | null
  appointmentTab: 'today' | 'upcoming' | 'past'
  appointmentSelectedDate: string | null
  appointmentSearchQuery: string
  appointmentPage: number
  appointmentTotalPages: number
  appointmentTotalDocs: number
  fetchDoctorAppointments: (overrides?: {
    tab?: string
    date?: string
    status?: string
    search?: string
    page?: number
  }) => Promise<void>
  setSelectedAppointment: (appt: DoctorAppointmentItem | null) => void
  setAppointmentTab: (tab: 'today' | 'upcoming' | 'past') => void
  setAppointmentSelectedDate: (date: string | null) => void
  setAppointmentSearchQuery: (query: string) => void
  updateAppointmentStatusAction: (
    id: string,
    status: string,
    reason?: string
  ) => Promise<boolean>
  completeAppointmentAction: (
    id: string,
    prescriptionData: {
      diagnosis: string
      advice?: string
      medicines?: Array<{
        name: string
        dosage: string
        frequency: string
        duration: string
        instructions?: string
      }>
      followUpDate?: string
    }
  ) => Promise<boolean>
}

const DEFAULT_SCHEDULE_RULES: DoctorScheduleRule[] = [
  // Monday to Friday: 09:00 - 13:00 and 17:00 - 20:00
  { dayOfWeek: 1, startTime: '09:00', endTime: '13:00', slotDurationMinutes: 20 },
  { dayOfWeek: 1, startTime: '17:00', endTime: '20:00', slotDurationMinutes: 20 },
  { dayOfWeek: 2, startTime: '09:00', endTime: '13:00', slotDurationMinutes: 20 },
  { dayOfWeek: 2, startTime: '17:00', endTime: '20:00', slotDurationMinutes: 20 },
  { dayOfWeek: 3, startTime: '09:00', endTime: '13:00', slotDurationMinutes: 20 },
  { dayOfWeek: 3, startTime: '17:00', endTime: '20:00', slotDurationMinutes: 20 },
  { dayOfWeek: 4, startTime: '09:00', endTime: '13:00', slotDurationMinutes: 20 },
  { dayOfWeek: 4, startTime: '17:00', endTime: '20:00', slotDurationMinutes: 20 },
  { dayOfWeek: 5, startTime: '09:00', endTime: '13:00', slotDurationMinutes: 20 },
  { dayOfWeek: 5, startTime: '17:00', endTime: '20:00', slotDurationMinutes: 20 },
  // Saturday: 09:00 - 14:00
  { dayOfWeek: 6, startTime: '09:00', endTime: '14:00', slotDurationMinutes: 20 },
]

const DEFAULT_FILTERS = {
  searchQuery: '',
  selectedCity: 'Bilaspur, Chhattisgarh',
  activeSpecialtyPill: 'all',
  selectedSpecializations: [] as string[],
  selectedHospitals: [] as string[],
  selectedConsultationType: 'all',
  selectedAvailability: 'all',
  maxFee: 3000,
  sortBy: 'relevance',
}

export const useDoctorStore = create<DoctorStoreState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial Data
        doctors: [],
        totalDoctors: 0,
        page: 1,
        limit: 10,
        hasMore: true,
        isLoadingInitial: false,
        isLoadingMore: false,
        error: null,
        selectedDoctor: null,
        currentDoctorDetail: null,
        isDetailLoading: false,
        detailError: null,
        favoriteDoctorIds: [],

        // Doctor Profile State
        myDoctorProfile: null,
        isProfileLoading: false,
        isSavingProfile: false,
        profileError: null,

        // Doctor Practice Dashboard State
        dashboardData: null,
        isDashboardLoading: false,
        dashboardError: null,

        // Doctor Schedule & Leaves State
        scheduleRules: DEFAULT_SCHEDULE_RULES,
        leaves: [],
        isScheduleLoading: false,
        scheduleError: null,
        isSavingSchedule: false,

        // Doctor Appointments State
        appointments: [],
        recentCompletedAppointments: [],
        appointmentCounts: {
          today: 0,
          todayWaiting: 0,
          todayInProgress: 0,
          todayCompleted: 0,
          todayCancelled: 0,
          upcoming: 0,
          completed: 0,
          cancelled: 0,
        },
        selectedAppointment: null,
        isAppointmentsLoading: false,
        appointmentError: null,
        appointmentTab: 'today',
        appointmentSelectedDate: null,
        appointmentSearchQuery: '',
        appointmentPage: 1,
        appointmentTotalPages: 1,
        appointmentTotalDocs: 0,

        // Initial Filters
        ...DEFAULT_FILTERS,

        // Filter Setters
        setSearchQuery: (query: string) => {
          set({ searchQuery: query })
        },
        setSelectedCity: (city: string) => {
          set({ selectedCity: city })
        },
        setActiveSpecialtyPill: (pill: string) => {
          set({ activeSpecialtyPill: pill })
        },
        setSelectedSpecializations: (specs: string[]) => {
          set({ selectedSpecializations: specs })
        },
        setSelectedHospitals: (hospitals: string[]) => {
          set({ selectedHospitals: hospitals })
        },
        setSelectedConsultationType: (type: string) => {
          set({ selectedConsultationType: type })
        },
        setSelectedAvailability: (availability: string) => {
          set({ selectedAvailability: availability })
        },
        setMaxFee: (fee: number) => {
          set({ maxFee: fee })
        },
        setSortBy: (sort: string) => {
          set({ sortBy: sort })
        },
        setSelectedDoctor: (doctor: DoctorCardData | null) => {
          set({ selectedDoctor: doctor })
        },
        setCurrentDoctorDetail: (doctor: DoctorDetailData | null) => {
          set({ currentDoctorDetail: doctor })
        },

        toggleFavorite: (doctorId: string) => {
          const { favoriteDoctorIds, doctors } = get()
          const isFav = favoriteDoctorIds.includes(doctorId)
          const updatedFavs = isFav
            ? favoriteDoctorIds.filter((id) => id !== doctorId)
            : [...favoriteDoctorIds, doctorId]

          const updatedDoctors = doctors.map((doc) =>
            doc._id === doctorId ? { ...doc, isFavorite: !isFav } : doc
          )

          set({ favoriteDoctorIds: updatedFavs, doctors: updatedDoctors })
        },

        clearFilters: () => {
          set({
            ...DEFAULT_FILTERS,
          })
          get().fetchDoctors(1, true)
        },

        // Fetch Doctors from Database
        fetchDoctors: async (pageNumber = 1, isNewFilter = false) => {
          const state = get()
          if (isNewFilter || pageNumber === 1) {
            set({ isLoadingInitial: true, error: null })
          } else {
            if (state.isLoadingMore || !state.hasMore) return
            set({ isLoadingMore: true, error: null })
          }

          try {
            let combinedSpecialties = [...state.selectedSpecializations]
            if (
              state.activeSpecialtyPill !== 'all' &&
              !combinedSpecialties.includes(state.activeSpecialtyPill)
            ) {
              combinedSpecialties.push(state.activeSpecialtyPill)
            }

            const response = await fetchDoctorsListApi({
              page: pageNumber,
              limit: 10,
              search: state.searchQuery.trim() || undefined,
              specialty: combinedSpecialties.length > 0 ? combinedSpecialties.join(',') : undefined,
              hospital: state.selectedHospitals.length > 0 ? state.selectedHospitals.join(',') : undefined,
              city:
                state.selectedCity &&
                state.selectedCity !== 'All Cities' &&
                !state.selectedCity.toLowerCase().includes('all')
                  ? state.selectedCity
                  : undefined,
              maxFee: state.maxFee < 3000 ? state.maxFee : undefined,
              sort: state.sortBy !== 'relevance' ? state.sortBy : undefined,
              mode: state.selectedConsultationType !== 'all' ? state.selectedConsultationType : undefined,
              availability: state.selectedAvailability !== 'all' ? state.selectedAvailability : undefined,
            })

            if (response) {
              const rawDoctors: DoctorCardData[] = response.doctors || []
              const favIds = get().favoriteDoctorIds

              const formattedDoctors: DoctorCardData[] = rawDoctors.map((doc) => ({
                ...doc,
                isFavorite: favIds.includes(doc._id),
                qualifications: doc.qualifications || ['MBBS', 'MD'],
                specialization: doc.specialization || [doc.specialty || 'General Medicine'],
                bio:
                  doc.bio ||
                  `Senior Specialist with ${doc.experienceYears || 8}+ years of extensive clinical practice in ${doc.department || doc.specialty || 'General Medicine'}.`,
                medicalCouncilRegistrationNumber:
                  doc.medicalCouncilRegistrationNumber || 'MCI-REG-VALID',
                verificationStatus: doc.verificationStatus || 'VERIFIED',
              }))

              if (isNewFilter || pageNumber === 1) {
                set({
                  doctors: formattedDoctors,
                  totalDoctors: response.total ?? formattedDoctors.length,
                  page: 1,
                  hasMore: response.hasMore ?? false,
                  isLoadingInitial: false,
                  isLoadingMore: false,
                })
              } else {
                const existingIds = new Set(state.doctors.map((d) => d._id))
                const uniqueNew = formattedDoctors.filter((d) => !existingIds.has(d._id))
                set({
                  doctors: [...state.doctors, ...uniqueNew],
                  totalDoctors: response.total ?? state.totalDoctors,
                  page: pageNumber,
                  hasMore: response.hasMore ?? false,
                  isLoadingInitial: false,
                  isLoadingMore: false,
                })
              }
            } else {
              set({
                isLoadingInitial: false,
                isLoadingMore: false,
                hasMore: false,
                error: 'Failed to retrieve doctors from database',
              })
            }
          } catch (err: any) {
            console.error('Error in doctorStore.fetchDoctors:', err)
            set({
              isLoadingInitial: false,
              isLoadingMore: false,
              hasMore: false,
              error: err.message || 'Error fetching doctors',
            })
          }
        },

        fetchNextPage: async () => {
          const { isLoadingMore, hasMore, page, fetchDoctors } = get()
          if (isLoadingMore || !hasMore) return
          await fetchDoctors(page + 1, false)
        },

        fetchDoctorById: async (doctorId: string) => {
          try {
            const doctor = await fetchDoctorByIdApi(doctorId)
            if (doctor) {
              const favIds = get().favoriteDoctorIds
              return {
                ...doctor,
                isFavorite: favIds.includes(doctor._id),
              }
            }
            return null
          } catch (err) {
            console.error('Error fetching doctor by id:', err)
            return null
          }
        },

        fetchDoctorDetailById: async (doctorId: string) => {
          set({ isDetailLoading: true, detailError: null })
          try {
            const doctor = await fetchDoctorByIdApi(doctorId)
            if (doctor) {
              const favIds = get().favoriteDoctorIds
              const formattedDetail: DoctorDetailData = {
                ...doctor,
                isFavorite: favIds.includes(doctor._id),
                qualifications: doctor.qualifications || ['MBBS', 'MD'],
                specialization: doctor.specialization || [doctor.specialty || doctor.department || 'General Medicine'],
                bio:
                  doctor.bio ||
                  `Dr. ${doctor.name} is a senior medical specialist with extensive clinical practice.`,
                medicalCouncilRegistrationNumber:
                  doctor.medicalCouncilRegistrationNumber || 'MCI/12345/2012',
                verificationStatus: doctor.verificationStatus || 'VERIFIED',
                scheduleRules: doctor.scheduleRules || [],
                leaves: doctor.leaves || [],
                reviews: doctor.reviews || [],
              }
              set({ currentDoctorDetail: formattedDetail, isDetailLoading: false })
              return formattedDetail
            } else {
              set({ isDetailLoading: false, detailError: 'Doctor details could not be retrieved' })
              return null
            }
          } catch (err: any) {
            console.error('Error in doctorStore.fetchDoctorDetailById:', err)
            set({
              isDetailLoading: false,
              detailError: err.message || 'Error fetching doctor details',
            })
            return null
          }
        },

        // Logged-in Doctor Profile Actions
        setMyDoctorProfile: (profile) => {
          set({ myDoctorProfile: profile })
        },

        fetchMyDoctorProfile: async () => {
          set({ isProfileLoading: true, profileError: null })
          try {
            const profile = await doctorService.getMyDoctorProfile()
            set({ myDoctorProfile: profile, isProfileLoading: false })
            return profile
          } catch (err: any) {
            console.error('Error in doctorStore.fetchMyDoctorProfile:', err)
            const errorMsg =
              err?.response?.data?.message || err?.message || 'Failed to fetch doctor profile'
            set({ profileError: errorMsg, isProfileLoading: false })
            return null
          }
        },

        updateMyDoctorProfile: async (payload: UpdateDoctorProfilePayload) => {
          set({ isSavingProfile: true, profileError: null })
          try {
            const updated = await doctorService.updateDoctorProfile(payload)
            set({ myDoctorProfile: updated, isSavingProfile: false })
            return updated
          } catch (err: any) {
            console.error('Error in doctorStore.updateMyDoctorProfile:', err)
            const errorMsg =
              err?.response?.data?.message || err?.message || 'Failed to update doctor profile'
            set({ profileError: errorMsg, isSavingProfile: false })
            throw err
          }
        },

        // Logged-in Doctor Dashboard Actions
        setDashboardData: (data: DoctorDashboardData | null) => {
          set({ dashboardData: data })
        },

        clearDashboardData: () => {
          set({ dashboardData: null, dashboardError: null })
        },

        fetchDoctorDashboard: async () => {
          set({ isDashboardLoading: true, dashboardError: null })
          try {
            const data = await doctorService.getDoctorDashboardData()
            set({ dashboardData: data, isDashboardLoading: false })
            return data
          } catch (err: any) {
            console.error('Error in doctorStore.fetchDoctorDashboard:', err)
            const errorMsg =
              err?.response?.data?.message || err?.message || 'Failed to fetch doctor dashboard data'
            set({ dashboardError: errorMsg, isDashboardLoading: false })
            return null
          }
        },

        // Schedule & Availability Actions
        fetchScheduleAndLeaves: async () => {
          set({ isScheduleLoading: true, scheduleError: null })
          try {
            const profile = await doctorService.getMyDoctorProfile()
            const rawLeaves = await doctorService.getDoctorLeaves()
            const leaves = Array.isArray(rawLeaves) ? rawLeaves : (rawLeaves as any)?.leaves || profile?.leaves || []
            const rules =
              profile?.scheduleRules && profile.scheduleRules.length > 0
                ? profile.scheduleRules
                : get().scheduleRules.length > 0
                ? get().scheduleRules
                : DEFAULT_SCHEDULE_RULES

            set({
              scheduleRules: rules,
              leaves: leaves,
              isScheduleLoading: false,
            })
          } catch (err: any) {
            console.error('Error fetching schedule and leaves:', err)
            set({
              isScheduleLoading: false,
              scheduleError:
                err?.response?.data?.message || err?.message || 'Failed to load schedule and leaves',
            })
          }
        },

        saveScheduleRules: async (rules: DoctorScheduleRule[]) => {
          set({ isSavingSchedule: true, scheduleError: null })
          try {
            const updatedProfile = await doctorService.updateDoctorSchedule(rules)
            set({
              scheduleRules:
                updatedProfile.scheduleRules && updatedProfile.scheduleRules.length > 0
                  ? updatedProfile.scheduleRules
                  : rules,
              isSavingSchedule: false,
            })
            return true
          } catch (err: any) {
            console.warn('API save schedule failed, persisting locally to Zustand:', err)
            set({
              scheduleRules: rules,
              isSavingSchedule: false,
            })
            return true
          }
        },

        applyLeave: async (payload: string | ApplyDoctorLeavePayload, reason?: string) => {
          try {
            const res = await doctorService.applyDoctorLeave(payload, reason)
            await get().fetchScheduleAndLeaves()
            const affectedCount =
              res.totalAffected ?? res.affectedAppointmentsCount ?? res.rescheduledCount ?? 0
            return {
              success: true,
              affectedCount,
              message:
                res.message ||
                (affectedCount
                  ? `Leave application submitted (PENDING approval). ${affectedCount} appointment(s) processed.`
                  : 'Leave application submitted successfully (PENDING approval).'),
            }
          } catch (err: any) {
            console.error('API apply leave failed:', err)
            const errorMsg =
              err?.response?.data?.message || err?.message || 'Failed to submit leave application.'
            return {
              success: false,
              affectedCount: 0,
              message: errorMsg,
            }
          }
        },

        cancelLeave: async (idOrDate: string) => {
          try {
            await doctorService.cancelDoctorLeave(idOrDate)
            await get().fetchScheduleAndLeaves()
            return true
          } catch (err: any) {
            console.error('API cancel leave failed:', err)
            return false
          }
        },

        setSelectedAppointment: (appt) => {
          set({ selectedAppointment: appt })
        },

        setAppointmentTab: (tab) => {
          set({ appointmentTab: tab, appointmentPage: 1 })
          get().fetchDoctorAppointments({ tab, page: 1 })
        },

        setAppointmentSelectedDate: (date) => {
          set({ appointmentSelectedDate: date, appointmentPage: 1 })
          get().fetchDoctorAppointments({ date: date || undefined, page: 1 })
        },

        setAppointmentSearchQuery: (query) => {
          set({ appointmentSearchQuery: query })
        },

        fetchDoctorAppointments: async (overrides = {}) => {
          set({ isAppointmentsLoading: true, appointmentError: null })
          try {
            const tab = overrides.tab ?? get().appointmentTab
            const date =
              overrides.date !== undefined
                ? overrides.date
                : get().appointmentSelectedDate || undefined
            const search =
              overrides.search !== undefined
                ? overrides.search
                : get().appointmentSearchQuery || undefined
            const page = overrides.page ?? get().appointmentPage

            const res = await doctorService.getDoctorAppointments({
              tab,
              date,
              search,
              page,
              limit: 15,
              status: overrides.status,
            })

            const appointments = res?.appointments || []
            const counts = res?.counts || get().appointmentCounts
            const recentCompleted = res?.recentCompleted || []
            const pagination = res?.pagination || {
              totalDocs: appointments.length,
              totalPages: 1,
              currentPage: 1,
            }

            const currentSelected = get().selectedAppointment
            let nextSelected = currentSelected
            if (!currentSelected && appointments.length > 0) {
              nextSelected = appointments[0]
            } else if (currentSelected) {
              const found = appointments.find((a) => a._id === currentSelected._id)
              if (found) nextSelected = found
              else if (appointments.length > 0) nextSelected = appointments[0]
            }

            set({
              appointments,
              recentCompletedAppointments: recentCompleted,
              appointmentCounts: counts,
              selectedAppointment: nextSelected,
              isAppointmentsLoading: false,
              appointmentPage: pagination.currentPage,
              appointmentTotalPages: pagination.totalPages,
              appointmentTotalDocs: pagination.totalDocs,
            })
          } catch (err: any) {
            console.error('Failed to fetch doctor appointments:', err)
            set({
              isAppointmentsLoading: false,
              appointmentError:
                err?.response?.data?.message ||
                err?.message ||
                'Unable to load appointments from server.',
            })
          }
        },

        updateAppointmentStatusAction: async (id, status, reason) => {
          try {
            const updated = await doctorService.updateAppointmentStatus(id, status, reason)
            set((state) => {
              const updatedList = state.appointments.map((a) =>
                a._id === id ? { ...a, status: updated.status || (status as any) } : a
              )
              const updatedSelected =
                state.selectedAppointment?._id === id
                  ? { ...state.selectedAppointment, status: updated.status || (status as any) }
                  : state.selectedAppointment
              return {
                appointments: updatedList,
                selectedAppointment: updatedSelected,
              }
            })
            get().fetchDoctorAppointments()
            return true
          } catch (err: any) {
            console.error('Failed to update appointment status:', err)
            return false
          }
        },

        completeAppointmentAction: async (id, data) => {
          try {
            await doctorService.completeAppointment(id, data)
            get().fetchDoctorAppointments()
            return true
          } catch (err: any) {
            console.error('Failed to complete appointment:', err)
            return false
          }
        },
      }),
      {
        name: 'curehealth_doctor_store',
        partialize: (state) => ({
          favoriteDoctorIds: state.favoriteDoctorIds,
          selectedCity: state.selectedCity,
          currentDoctorDetail: state.currentDoctorDetail,
          myDoctorProfile: state.myDoctorProfile,
          dashboardData: state.dashboardData,
          scheduleRules: state.scheduleRules,
          leaves: state.leaves,
        }),
      }
    ),
    { name: 'DoctorStore' }
  )
)

export const useDoctorPortalStore = useDoctorStore
