import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { HospitalCardData } from '@/types/patient'
import { fetchHospitalsListApi, fetchHospitalDetailApi } from '@/services/patientService'

export interface HospitalStoreState {
  // Data
  hospitals: HospitalCardData[]
  totalHospitals: number
  selectedHospital: HospitalCardData | null
  favoriteHospitalIds: string[]
  isLoading: boolean
  isLoadingInitial: boolean
  isLoadingMore: boolean
  hasMore: boolean
  error: string | null

  // Pagination
  page: number
  limit: number

  // Filter States
  searchQuery: string
  selectedCity: string
  activeQuickPill: string
  selectedHospitalTypes: string[]
  selectedDepartments: string[]
  selectedFacilities: string[]
  distanceRadius: string
  minYear: number
  maxYear: number
  sortBy: string

  // Setters
  setSearchQuery: (query: string) => void
  setSelectedCity: (city: string) => void
  setActiveQuickPill: (pill: string) => void
  setSelectedHospitalTypes: (types: string[]) => void
  setSelectedDepartments: (departments: string[]) => void
  setSelectedFacilities: (facilities: string[]) => void
  setDistanceRadius: (radius: string) => void
  setYearRange: (min: number, max: number) => void
  setSortBy: (sort: string) => void
  setSelectedHospital: (hospital: HospitalCardData | null) => void
  toggleFavoriteHospital: (id: string) => void
  clearAllFilters: () => void

  // Async API Calls
  fetchHospitals: (pageNumber?: number, isNewFilter?: boolean) => Promise<void>
  fetchNextPage: () => Promise<void>
  loadHospitalDetails: (idOrSlug: string) => Promise<HospitalCardData | null>
}

const DEFAULT_FILTERS = {
  searchQuery: '',
  selectedCity: 'All Cities',
  activeQuickPill: 'all',
  selectedHospitalTypes: [] as string[],
  selectedDepartments: [] as string[],
  selectedFacilities: [] as string[],
  distanceRadius: 'within-10km',
  minYear: 1800,
  maxYear: 2026,
  sortBy: 'relevance',
  page: 1,
  limit: 6,
}

export const useHospitalStore = create<HospitalStoreState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        hospitals: [],
        totalHospitals: 0,
        selectedHospital: null,
        favoriteHospitalIds: [],
        isLoading: false,
        isLoadingInitial: false,
        isLoadingMore: false,
        hasMore: true,
        error: null,

        ...DEFAULT_FILTERS,

        setSearchQuery: (query) => set({ searchQuery: query }),
        setSelectedCity: (city) => set({ selectedCity: city }),
        setActiveQuickPill: (pill) => set({ activeQuickPill: pill }),
        setSelectedHospitalTypes: (types) => set({ selectedHospitalTypes: types }),
        setSelectedDepartments: (departments) => set({ selectedDepartments: departments }),
        setSelectedFacilities: (facilities) => set({ selectedFacilities: facilities }),
        setDistanceRadius: (radius) => set({ distanceRadius: radius }),
        setYearRange: (min, max) => set({ minYear: min, maxYear: max }),
        setSortBy: (sort) => set({ sortBy: sort }),
        setSelectedHospital: (hospital) => set({ selectedHospital: hospital }),

        toggleFavoriteHospital: (id) => {
          const { favoriteHospitalIds, hospitals } = get()
          const isFav = favoriteHospitalIds.includes(id)
          const updatedFavs = isFav
            ? favoriteHospitalIds.filter((favId) => favId !== id)
            : [...favoriteHospitalIds, id]

          const updatedHospitals = hospitals.map((h) =>
            h._id === id ? { ...h, isFavorite: !isFav } : h
          )
          set({ favoriteHospitalIds: updatedFavs, hospitals: updatedHospitals })
        },

        clearAllFilters: () => {
          set({
            ...DEFAULT_FILTERS,
          })
          get().fetchHospitals(1, true)
        },

        fetchHospitals: async (pageNumber = 1, isNewFilter = false) => {
          if (isNewFilter || pageNumber === 1) {
            set({ isLoading: true, isLoadingInitial: true, error: null })
          } else {
            set({ isLoadingMore: true, error: null })
          }

          try {
            const state = get()
            const isAllCities =
              !state.selectedCity ||
              state.selectedCity.toLowerCase().includes('all') ||
              state.selectedCity === 'all'
            const city = isAllCities ? undefined : state.selectedCity.split(',')[0].trim()

            // Resolve quick pill filter
            let quickDept = 'all'
            let quickType = 'all'
            let emergency = false

            if (state.activeQuickPill === 'emergency') {
              emergency = true
            } else if (state.activeQuickPill === 'multi-speciality') {
              quickType = 'Multi-Speciality'
            } else if (state.activeQuickPill !== 'all') {
              quickDept = state.activeQuickPill
            }

            const response = await fetchHospitalsListApi({
              search: state.searchQuery.trim() || undefined,
              city: city,
              department: quickDept !== 'all' ? quickDept : state.selectedDepartments[0] || 'all',
              hospitalType: quickType !== 'all' ? quickType : state.selectedHospitalTypes[0] || 'all',
              facility: state.selectedFacilities.length > 0 ? state.selectedFacilities.join(',') : undefined,
              emergency: emergency || state.selectedFacilities.includes('24x7 Emergency') || undefined,
              minYear: state.minYear > 1800 ? state.minYear : undefined,
              maxYear: state.maxYear < 2026 ? state.maxYear : undefined,
              sortBy: state.sortBy !== 'relevance' ? state.sortBy : undefined,
              page: pageNumber,
              limit: state.limit,
            })

            const rawHospitals: HospitalCardData[] = response.hospitals || []
            const favIds = state.favoriteHospitalIds
            const formattedHospitals = rawHospitals.map((h) => ({
              ...h,
              isFavorite: favIds.includes(h._id),
            }))

            if (isNewFilter || pageNumber === 1) {
              set({
                hospitals: formattedHospitals,
                totalHospitals: response.total ?? formattedHospitals.length,
                page: 1,
                hasMore: response.hasMore ?? false,
                isLoading: false,
                isLoadingInitial: false,
                isLoadingMore: false,
              })
            } else {
              // Append newly fetched hospitals avoiding duplicate keys
              const existingIds = new Set(state.hospitals.map((h) => h._id))
              const uniqueNew = formattedHospitals.filter((h) => !existingIds.has(h._id))
              set({
                hospitals: [...state.hospitals, ...uniqueNew],
                totalHospitals: response.total ?? state.totalHospitals,
                page: pageNumber,
                hasMore: response.hasMore ?? false,
                isLoading: false,
                isLoadingInitial: false,
                isLoadingMore: false,
              })
            }
          } catch (err: any) {
            console.error('Failed to fetch hospitals in store:', err)
            set({
              isLoading: false,
              isLoadingInitial: false,
              isLoadingMore: false,
              error: err?.message || 'Failed to load hospitals list',
            })
          }
        },

        fetchNextPage: async () => {
          const { page, hasMore, isLoadingInitial, isLoadingMore, fetchHospitals } = get()
          if (!hasMore || isLoadingInitial || isLoadingMore) return
          await fetchHospitals(page + 1, false)
        },

        loadHospitalDetails: async (idOrSlug: string) => {
          try {
            const hospital = await fetchHospitalDetailApi(idOrSlug)
            if (hospital) {
              const favIds = get().favoriteHospitalIds
              const enriched = {
                ...hospital,
                isFavorite: favIds.includes(hospital._id),
              }
              set({ selectedHospital: enriched })
              return enriched
            }
            return null
          } catch (err) {
            console.error('Error in loadHospitalDetails:', err)
            return null
          }
        },
      }),
      {
        name: 'careplus_hospital_storage',
        partialize: (state) => ({
          favoriteHospitalIds: state.favoriteHospitalIds,
          selectedCity: state.selectedCity,
        }),
      }
    ),
    { name: 'HospitalStore' }
  )
)
