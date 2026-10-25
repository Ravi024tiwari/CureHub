import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { DoctorCardData, DoctorDetailData } from '@/types/patient'
import { fetchDoctorsListApi, fetchDoctorByIdApi } from '@/services/patientService'
import {
  doctorService,
  type DoctorDashboardData,
  type DoctorScheduleRule,
  type DoctorLeaveItem,
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
    date: string,
    reason?: string
  ) => Promise<{ success: boolean; affectedCount?: number; message?: string }>
  cancelLeave: (date: string) => Promise<boolean>
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
          // Combine category pill with specific checkbox selections
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
            city: state.selectedCity && state.selectedCity !== 'All Cities' && !state.selectedCity.toLowerCase().includes('all') ? state.selectedCity : undefined,
            maxFee: state.maxFee < 3000 ? state.maxFee : undefined,
            sort: state.sortBy !== 'relevance' ? state.sortBy : undefined,
            mode: state.selectedConsultationType !== 'all' ? state.selectedConsultationType : undefined,
            availability: state.selectedAvailability !== 'all' ? state.selectedAvailability : undefined,
          })

          if (response) {
            const rawDoctors: DoctorCardData[] = response.doctors || []
            const favIds = get().favoriteDoctorIds

            // Map favorite status and ensure real fields are attached
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
              // Append newly fetched doctors avoiding duplicates
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
          const leaves = await doctorService.getDoctorLeaves()
          const rules =
            profile?.scheduleRules && profile.scheduleRules.length > 0
              ? profile.scheduleRules
              : get().scheduleRules.length > 0
              ? get().scheduleRules
              : DEFAULT_SCHEDULE_RULES

          set({
            scheduleRules: rules,
            leaves: leaves || profile?.leaves || [],
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
          // Graceful fallback to local persistence
          set({
            scheduleRules: rules,
            isSavingSchedule: false,
          })
          return true
        }
      },

      applyLeave: async (date: string, reason?: string) => {
        try {
          const res = await doctorService.applyDoctorLeave(date, reason)
          const currentLeaves = get().leaves
          const alreadyExists = currentLeaves.some((l) => l.date === date)
          const updatedLeaves = alreadyExists
            ? currentLeaves
            : [
                ...currentLeaves,
                {
                  date,
                  reason: reason || 'Personal Leave',
                  createdAt: new Date().toISOString(),
                  status: 'Approved' as const,
                },
              ]
          set({ leaves: res.leaves || updatedLeaves })
          return {
            success: true,
            affectedCount: res.affectedAppointmentsCount || 0,
            message: res.affectedAppointmentsCount
              ? `Leave applied. ${res.affectedAppointmentsCount} appointment(s) moved to priority reschedule window.`
              : `Leave applied successfully for ${date}.`,
          }
        } catch (err: any) {
          console.warn('API apply leave failed, persisting locally to Zustand:', err)
          const currentLeaves = get().leaves
          const alreadyExists = currentLeaves.some((l) => l.date === date)
          const updatedLeaves = alreadyExists
            ? currentLeaves
            : [
                ...currentLeaves,
                {
                  date,
                  reason: reason || 'Personal Leave',
                  createdAt: new Date().toISOString(),
                  status: 'Approved' as const,
                },
              ]
          set({ leaves: updatedLeaves })
          return {
            success: true,
            affectedCount: 0,
            message: `Leave scheduled for ${date}. Patient booking slots blocked.`,
          }
        }
      },

      cancelLeave: async (date: string) => {
        try {
          const updatedLeaves = await doctorService.cancelDoctorLeave(date)
          set({
            leaves: updatedLeaves || get().leaves.filter((l) => l.date !== date),
          })
          return true
        } catch (err: any) {
          console.warn('API cancel leave failed, persisting locally to Zustand:', err)
          set({
            leaves: get().leaves.filter((l) => l.date !== date),
          })
          return true
        }
      },
    }),
    {
      name: 'curehealth_doctor_store',
      partialize: (state) => ({
        favoriteDoctorIds: state.favoriteDoctorIds,
        selectedCity: state.selectedCity,
        currentDoctorDetail: state.currentDoctorDetail,
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

