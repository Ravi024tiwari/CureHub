import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { DoctorCardData, DoctorDetailData } from '@/types/patient'
import { fetchDoctorsListApi, fetchDoctorByIdApi } from '@/services/patientService'
import { doctorService, type DoctorDashboardData } from '@/services/doctorService'

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
}

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
    }),
    {
      name: 'curehealth_doctor_store',
      partialize: (state) => ({
        favoriteDoctorIds: state.favoriteDoctorIds,
        selectedCity: state.selectedCity,
        currentDoctorDetail: state.currentDoctorDetail,
        dashboardData: state.dashboardData,
      }),
    }
  ),
  { name: 'DoctorStore' }
)
)

export const useDoctorPortalStore = useDoctorStore

