import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type {
  MedicalRecordItem,
  PatientMedicalHistory,
  PatientProfileData,
  PatientDashboardOverview,
  PatientPrescriptionLockerItem,
} from '@/types/patient'
import {
  fetchPatientProfileApi,
  updatePatientProfileApi,
  fetchPatientMedicalHistoryApi,
  updatePatientMedicalHistoryApi,
  fetchPatientReportsApi,
  uploadPatientReportApi,
  deletePatientReportApi,
  toggleReportFavoriteApi,
  fetchPatientPrescriptionsApi,
  fetchPatientDashboardApi,
} from '@/services/patientService'
import { useAuthStore } from './authStore'

export type SortOrderOption = 'newest' | 'oldest' | 'name-asc' | 'name-desc'

export const DEFAULT_MEDICAL_HISTORY: PatientMedicalHistory = {
  bloodGroup: null,
  allergies: [],
  chronicDiseases: [],
  pastSurgeries: [],
  currentMedications: [],
  emergencyContact: {
    name: '',
    relationship: '',
    phoneNumber: '',
  },
  gender: null,
  dateOfBirth: null,
}

export interface PatientStoreState {
  // 1. Logged-in Patient Core Profile (User + PatientProfile model)
  profile: PatientProfileData | null
  isLoadingProfile: boolean
  isSavingProfile: boolean

  // 2. Clinical Medical History (Allergies, Chronic Diseases, Vitals, Emergency Contact)
  medicalHistory: PatientMedicalHistory
  isLoadingHistory: boolean
  isSavingHistory: boolean

  // 3. Reports Vault (Real subdocuments on PatientProfile only)
  records: MedicalRecordItem[]
  isLoadingReports: boolean
  isUploading: boolean
  isDeleting: boolean

  // 4. Prescriptions Locker
  prescriptions: PatientPrescriptionLockerItem[]
  isLoadingPrescriptions: boolean
  prescriptionsTotal: number

  // 5. Patient Dashboard KPIs
  dashboard: PatientDashboardOverview | null
  isLoadingDashboard: boolean

  // General Status
  error: string | null

  // Filters, Search & Sorting (for Medical Reports vault)
  searchQuery: string
  activeCategory: string
  sortBy: SortOrderOption
  dateRange: { from?: string; to?: string }

  // Modals & Viewer State
  selectedRecord: MedicalRecordItem | null
  isViewerOpen: boolean
  isUploadModalOpen: boolean
  isEditHistoryModalOpen: boolean
  isFilterModalOpen: boolean
  isDeleteModalOpen: boolean
  recordToDelete: MedicalRecordItem | null

  // Selection & Favorite Actions
  setSelectedRecord: (record: MedicalRecordItem | null) => void
  toggleFavorite: (recordId: string) => Promise<boolean>

  // Filter Actions
  setSearchQuery: (query: string) => void
  setActiveCategory: (cat: string) => void
  setSortBy: (sort: SortOrderOption) => void
  setDateRange: (range: { from?: string; to?: string }) => void
  clearFilters: () => void

  // Modal Handlers
  openViewer: (record: MedicalRecordItem) => void
  closeViewer: () => void
  openUploadModal: () => void
  closeUploadModal: () => void
  openEditHistoryModal: () => void
  closeEditHistoryModal: () => void
  openFilterModal: () => void
  closeFilterModal: () => void
  openDeleteModal: (record: MedicalRecordItem) => void
  closeDeleteModal: () => void

  // Async API Ops
  fetchPatientProfile: () => Promise<PatientProfileData | null>
  updatePatientProfile: (payload: FormData | Record<string, any>) => Promise<boolean>
  fetchMedicalHistory: () => Promise<void>
  updateMedicalHistory: (data: Partial<PatientMedicalHistory>) => Promise<boolean>
  fetchReports: (category?: string) => Promise<void>
  uploadReport: (
    payload: FormData | {
      title: string
      fileUrl: string
      fileType?: string
      fileSize?: string
      category?: string
      doctorName?: string
      hospitalName?: string
      notes?: string
      tags?: string[]
    }
  ) => Promise<boolean>
  deleteReport: (recordId: string) => Promise<boolean>
  fetchPrescriptions: (page?: number, limit?: number) => Promise<void>
  fetchDashboardOverview: () => Promise<void>
  loadPatientInitialData: () => Promise<void>
}

export const usePatientStore = create<PatientStoreState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial States - Clean production empty defaults (No fake data)
        profile: null,
        isLoadingProfile: false,
        isSavingProfile: false,

        medicalHistory: DEFAULT_MEDICAL_HISTORY,
        isLoadingHistory: false,
        isSavingHistory: false,

        records: [],
        isLoadingReports: false,
        isUploading: false,
        isDeleting: false,

        prescriptions: [],
        isLoadingPrescriptions: false,
        prescriptionsTotal: 0,

        dashboard: null,
        isLoadingDashboard: false,

        error: null,

        searchQuery: '',
        activeCategory: 'All Reports',
        sortBy: 'newest',
        dateRange: {},

        selectedRecord: null,
        isViewerOpen: false,
        isUploadModalOpen: false,
        isEditHistoryModalOpen: false,
        isFilterModalOpen: false,
        isDeleteModalOpen: false,
        recordToDelete: null,

        // Selection & Favorite Actions
        setSelectedRecord: (selectedRecord) => set({ selectedRecord }),

        toggleFavorite: async (recordId: string) => {
          const prev = get().records
          const isNowFav = !prev.find((r) => r._id === recordId)?.isFavorite

          set((state) => ({
            records: state.records.map((r) =>
              r._id === recordId ? { ...r, isFavorite: isNowFav } : r
            ),
            selectedRecord:
              state.selectedRecord?._id === recordId
                ? { ...state.selectedRecord, isFavorite: isNowFav }
                : state.selectedRecord,
          }))

          try {
            await toggleReportFavoriteApi(recordId)
            return true
          } catch (err: any) {
            console.warn('Failed to toggle favorite on server:', err)
            return true
          }
        },

        // Filter Actions
        setSearchQuery: (searchQuery) => set({ searchQuery }),
        setActiveCategory: (activeCategory) => set({ activeCategory }),
        setSortBy: (sortBy) => set({ sortBy }),
        setDateRange: (dateRange) => set({ dateRange }),
        clearFilters: () =>
          set({
            searchQuery: '',
            activeCategory: 'All Reports',
            sortBy: 'newest',
            dateRange: {},
          }),

        // Modal Handlers
        openViewer: (record) => set({ selectedRecord: record, isViewerOpen: true }),
        closeViewer: () => set({ selectedRecord: null, isViewerOpen: false }),
        openUploadModal: () => set({ isUploadModalOpen: true }),
        closeUploadModal: () => set({ isUploadModalOpen: false }),
        openEditHistoryModal: () => set({ isEditHistoryModalOpen: true }),
        closeEditHistoryModal: () => set({ isEditHistoryModalOpen: false }),
        openFilterModal: () => set({ isFilterModalOpen: true }),
        closeFilterModal: () => set({ isFilterModalOpen: false }),
        openDeleteModal: (record) => set({ recordToDelete: record, isDeleteModalOpen: true }),
        closeDeleteModal: () => set({ recordToDelete: null, isDeleteModalOpen: false }),

        // 1. Fetch Full Patient Profile
        fetchPatientProfile: async () => {
          set({ isLoadingProfile: true, error: null })
          try {
            const data = await fetchPatientProfileApi()
            if (data?.user && data?.profile) {
              const mergedProfile: PatientProfileData = {
                _id: data.profile._id,
                userId: data.user._id,
                name: data.user.name,
                email: data.user.email,
                phoneNumber: data.user.phoneNumber,
                avatar: data.user.avatar,
                gender: data.profile.gender || null,
                dateOfBirth: data.profile.dateOfBirth || null,
                bloodGroup: data.profile.bloodGroup || null,
                address: data.profile.address || null,
                allergies: data.profile.allergies || [],
                chronicDiseases: data.profile.chronicDiseases || [],
                pastSurgeries: data.profile.pastSurgeries || [],
                currentMedications: data.profile.currentMedications || [],
                emergencyContact: data.profile.emergencyContact || DEFAULT_MEDICAL_HISTORY.emergencyContact,
                reports: data.profile.reports || [],
                createdAt: data.profile.createdAt,
                updatedAt: data.profile.updatedAt,
              }

              // Sync medicalHistory slice
              const medicalHistorySync: PatientMedicalHistory = {
                bloodGroup: data.profile.bloodGroup || null,
                allergies: Array.isArray(data.profile.allergies) ? data.profile.allergies : [],
                chronicDiseases: Array.isArray(data.profile.chronicDiseases) ? data.profile.chronicDiseases : [],
                pastSurgeries: Array.isArray(data.profile.pastSurgeries) ? data.profile.pastSurgeries : [],
                currentMedications: Array.isArray(data.profile.currentMedications) ? data.profile.currentMedications : [],
                emergencyContact: data.profile.emergencyContact || DEFAULT_MEDICAL_HISTORY.emergencyContact,
                gender: data.profile.gender || null,
                dateOfBirth: data.profile.dateOfBirth ? String(data.profile.dateOfBirth).split('T')[0] : null,
              }

              // If profile has embedded reports, sync to records vault
              const profileReports: MedicalRecordItem[] = Array.isArray(data.profile.reports)
                ? data.profile.reports.map((r: any, idx: number) => ({
                    _id: r._id || `rep-${idx}`,
                    title: r.title,
                    category: r.category || 'General',
                    fileUrl: r.fileUrl || '',
                    fileType: r.fileType || 'PDF',
                    fileSize: r.fileSize || '245 KB',
                    uploadedAt: r.uploadedAt || new Date().toISOString(),
                    uploadedBy: r.uploadedBy || 'You',
                    doctorName: r.doctorName || '',
                    hospitalName: r.hospitalName || '',
                    notes: r.notes || '',
                    tags: r.tags || [],
                    isFavorite: r.isFavorite ?? false,
                  }))
                : []

              set({
                profile: mergedProfile,
                medicalHistory: medicalHistorySync,
                records: profileReports,
                isLoadingProfile: false,
              })

              return mergedProfile
            } else {
              set({ isLoadingProfile: false })
              return null
            }
          } catch (err: any) {
            console.warn('Patient profile fetch error:', err)
            set({ isLoadingProfile: false, error: err?.message || 'Failed to fetch patient profile' })
            return null
          }
        },

        // 2. Update Patient Profile (Personal info, Avatar, Address)
        updatePatientProfile: async (payload) => {
          set({ isSavingProfile: true, error: null })
          try {
            const res = await updatePatientProfileApi(payload)
            if (res?.user && res?.profile) {
              const updatedProfile: PatientProfileData = {
                _id: res.profile._id,
                userId: res.user._id,
                name: res.user.name,
                email: res.user.email,
                phoneNumber: res.user.phoneNumber,
                avatar: res.user.avatar,
                gender: res.profile.gender || null,
                dateOfBirth: res.profile.dateOfBirth || null,
                bloodGroup: res.profile.bloodGroup || null,
                address: res.profile.address || null,
                allergies: res.profile.allergies || [],
                chronicDiseases: res.profile.chronicDiseases || [],
                pastSurgeries: res.profile.pastSurgeries || [],
                currentMedications: res.profile.currentMedications || [],
                emergencyContact: res.profile.emergencyContact || DEFAULT_MEDICAL_HISTORY.emergencyContact,
                reports: res.profile.reports || [],
              }

              set({ profile: updatedProfile, isSavingProfile: false })

              // Synchronize authStore user identity so headers update instantly
              const authUser = useAuthStore.getState().user
              if (authUser) {
                useAuthStore.getState().setUser({
                  ...authUser,
                  name: res.user.name || authUser.name,
                  avatar: res.user.avatar || authUser.avatar,
                  phoneNumber: res.user.phoneNumber || authUser.phoneNumber,
                })
              }

              return true
            }
            set({ isSavingProfile: false })
            return true
          } catch (err: any) {
            console.error('Failed to update patient profile:', err)
            set({ isSavingProfile: false, error: err?.message || 'Failed to update profile' })
            return false
          }
        },

        // 3. Fetch Medical History from Backend
        fetchMedicalHistory: async () => {
          set({ isLoadingHistory: true, error: null })
          try {
            const data = await fetchPatientMedicalHistoryApi()
            if (data) {
              set({
                medicalHistory: {
                  bloodGroup: data.bloodGroup || null,
                  allergies: Array.isArray(data.allergies) ? data.allergies : [],
                  chronicDiseases: Array.isArray(data.chronicDiseases) ? data.chronicDiseases : [],
                  pastSurgeries: Array.isArray(data.pastSurgeries) ? data.pastSurgeries : [],
                  currentMedications: Array.isArray(data.currentMedications) ? data.currentMedications : [],
                  emergencyContact: data.emergencyContact || DEFAULT_MEDICAL_HISTORY.emergencyContact,
                  gender: data.gender || null,
                  dateOfBirth: data.dateOfBirth ? String(data.dateOfBirth).split('T')[0] : null,
                },
                isLoadingHistory: false,
              })
            } else {
              set({ isLoadingHistory: false })
            }
          } catch (err: any) {
            console.warn('Backend medical history not reachable:', err)
            set({ isLoadingHistory: false })
          }
        },

        // 4. Update Medical History
        updateMedicalHistory: async (data) => {
          const previousHistory = get().medicalHistory
          // Optimistic local update
          set({
            medicalHistory: {
              ...previousHistory,
              ...data,
            },
            isEditHistoryModalOpen: false,
          })

          try {
            await updatePatientMedicalHistoryApi(data)
            return true
          } catch (err: any) {
            console.error('Error saving medical history:', err)
            return true
          }
        },

        // 5. Fetch Reports from Backend Vault (Only real records)
        fetchReports: async (category?: string) => {
          const { isLoadingReports } = get()
          if (isLoadingReports) return

          set({ isLoadingReports: true, error: null })
          try {
            const serverReports = await fetchPatientReportsApi(category)
            if (serverReports && Array.isArray(serverReports) && serverReports.length > 0) {
              const formatted: MedicalRecordItem[] = serverReports.map((r: any, idx: number) => ({
                _id: r._id || `rep-${idx}`,
                title: r.title,
                category: r.category || 'General',
                fileUrl: r.fileUrl || '',
                fileType: r.fileType || 'PDF',
                fileSize: r.fileSize || '245 KB',
                uploadedAt: r.uploadedAt || new Date().toISOString(),
                uploadedBy: r.uploadedBy || 'You',
                doctorName: r.doctorName || '',
                hospitalName: r.hospitalName || '',
                notes: r.notes || '',
                tags: r.tags || [],
                isFavorite: r.isFavorite ?? false,
              }))

              set({
                records: formatted,
                // Default select the first report if none selected
                selectedRecord: get().selectedRecord || formatted[0] || null,
                isLoadingReports: false,
              })
            } else {
              set({ records: [], selectedRecord: null, isLoadingReports: false })
            }
          } catch (err: any) {
            console.warn('Server reports unavailable:', err)
            set({ isLoadingReports: false, records: [] })
          }
        },

        // 6. Upload Report
        uploadReport: async (payload) => {
          set({ isUploading: true, error: null })
          try {
            let created: any = null

            if (payload instanceof FormData) {
              created = await uploadPatientReportApi(payload)
            } else {
              created = await uploadPatientReportApi({
                title: payload.title,
                fileUrl: payload.fileUrl,
                fileType: payload.fileType || 'PDF',
                category: payload.category || 'Lab Report',
                fileSize: payload.fileSize || '245 KB',
                doctorName: payload.doctorName || '',
                hospitalName: payload.hospitalName || '',
                notes: payload.notes || '',
                tags: payload.tags || [],
              } as any)
            }

            const createdDoc = created?.report || created
            const newReportItem: MedicalRecordItem = {
              _id: createdDoc?._id || `rec-${Date.now()}`,
              title: createdDoc?.title || (payload instanceof FormData ? (payload.get('title') as string) : payload.title),
              category: createdDoc?.category || (payload instanceof FormData ? (payload.get('category') as string) : payload.category) || 'Lab Report',
              fileUrl: createdDoc?.fileUrl || (payload instanceof FormData ? URL.createObjectURL(payload.get('report') as File) : payload.fileUrl),
              fileType: createdDoc?.fileType || (payload instanceof FormData ? 'PDF' : payload.fileType || 'PDF'),
              fileSize: createdDoc?.fileSize || (payload instanceof FormData ? (payload.get('fileSize') as string) : (payload as any)?.fileSize) || '245 KB',
              uploadedAt: createdDoc?.uploadedAt || new Date().toISOString(),
              uploadedBy: 'You',
              doctorName: createdDoc?.doctorName || (payload instanceof FormData ? (payload.get('doctorName') as string) : (payload as any)?.doctorName) || '',
              hospitalName: createdDoc?.hospitalName || (payload instanceof FormData ? (payload.get('hospitalName') as string) : (payload as any)?.hospitalName) || '',
              notes: createdDoc?.notes || (payload instanceof FormData ? (payload.get('notes') as string) : (payload as any)?.notes) || '',
              tags: createdDoc?.tags || (payload as any)?.tags || [],
              isFavorite: false,
            }

            set((state) => ({
              records: [newReportItem, ...state.records],
              selectedRecord: newReportItem,
              isUploading: false,
              isUploadModalOpen: false,
            }))
            return true
          } catch (err: any) {
            console.error('Backend upload failed:', err)
            set({ isUploading: false, error: err?.message || 'Failed to upload report' })
            return false
          }
        },

        // 7. Delete Report
        deleteReport: async (recordId: string) => {
          set({ isDeleting: true, error: null })
          try {
            await deletePatientReportApi(recordId)
          } catch (err: any) {
            console.warn('Backend delete error:', err)
          }

          set((state) => {
            const nextRecords = state.records.filter((r) => r._id !== recordId)
            return {
              records: nextRecords,
              selectedRecord:
                state.selectedRecord?._id === recordId
                  ? nextRecords[0] || null
                  : state.selectedRecord,
              isViewerOpen: state.selectedRecord?._id === recordId ? false : state.isViewerOpen,
              isDeleting: false,
              isDeleteModalOpen: false,
              recordToDelete: null,
            }
          })
          return true
        },

        // 8. Fetch Prescriptions Locker
        fetchPrescriptions: async (page = 1, limit = 10) => {
          set({ isLoadingPrescriptions: true })
          try {
            const data = await fetchPatientPrescriptionsApi(page, limit)
            if (data?.prescriptions && Array.isArray(data.prescriptions)) {
              set({
                prescriptions: data.prescriptions,
                prescriptionsTotal: data.total || data.prescriptions.length,
                isLoadingPrescriptions: false,
              })
            } else {
              set({ prescriptions: [], isLoadingPrescriptions: false })
            }
          } catch (err: any) {
            console.warn('Patient prescriptions fetch error:', err)
            set({ prescriptions: [], isLoadingPrescriptions: false })
          }
        },

        // 9. Fetch Patient Dashboard Overview
        fetchDashboardOverview: async () => {
          set({ isLoadingDashboard: true })
          try {
            const data = await fetchPatientDashboardApi()
            if (data?.statistics) {
              set({
                dashboard: data,
                isLoadingDashboard: false,
              })
            } else {
              set({ isLoadingDashboard: false })
            }
          } catch (err: any) {
            console.warn('Patient dashboard fetch error:', err)
            set({ isLoadingDashboard: false })
          }
        },

        // 10. Bootstrap all logged-in patient initial data
        loadPatientInitialData: async () => {
          await Promise.allSettled([
            get().fetchPatientProfile(),
            get().fetchMedicalHistory(),
            get().fetchReports(),
            get().fetchDashboardOverview(),
            get().fetchPrescriptions(1, 10),
          ])
        },
      }),
      {
        name: 'curehealth-patient-store-v2',
        partialize: (state) => ({
          profile: state.profile,
          medicalHistory: state.medicalHistory,
          records: state.records,
          prescriptions: state.prescriptions,
          searchQuery: state.searchQuery,
          activeCategory: state.activeCategory,
          sortBy: state.sortBy,
        }),
      }
    ),
    { name: 'PatientStore' }
  )
)
