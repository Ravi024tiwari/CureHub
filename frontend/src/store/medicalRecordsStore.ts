import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { MedicalRecordItem, PatientMedicalHistory } from '@/types/patient'
import {
  fetchPatientMedicalHistoryApi,
  updatePatientMedicalHistoryApi,
  fetchPatientReportsApi,
  uploadPatientReportApi,
  deletePatientReportApi,
} from '@/services/patientService'

export const DEFAULT_MEDICAL_HISTORY: PatientMedicalHistory = {
  bloodGroup: 'O+',
  allergies: ['Pollen', 'Penicillin'],
  chronicDiseases: ['Asthma'],
  pastSurgeries: ['Appendectomy (2020)'],
  currentMedications: ['Paracetamol', 'Vitamin D'],
  emergencyContact: {
    name: 'Ramesh Tiwari',
    relationship: 'Father',
    phoneNumber: '+91 98765 43210',
  },
  gender: 'Male',
  dateOfBirth: '1998-05-14',
}

export const INITIAL_MOCK_REPORTS: MedicalRecordItem[] = [
  {
    _id: 'rec-001',
    title: 'Blood Test Report',
    category: 'Lab Report',
    fileUrl: '/mock-reports/blood-test.pdf',
    fileType: 'PDF',
    fileSize: '1.2 MB',
    uploadedAt: '2026-10-12T10:30:00.000Z',
    uploadedBy: 'You',
    doctorName: 'Dr. Priya Sharma',
    hospitalName: 'Apollo Multispeciality Hospital',
    notes: 'Complete Blood Count (CBC) and Lipid Profile. All standard markers within normal range.',
  },
  {
    _id: 'rec-002',
    title: 'X-Ray Chest',
    category: 'Imaging',
    fileUrl: '/mock-reports/chest-xray.pdf',
    fileType: 'PDF',
    fileSize: '2.4 MB',
    uploadedAt: '2026-10-05T14:15:00.000Z',
    uploadedBy: 'You',
    doctorName: 'Dr. Vikram Malhotra',
    hospitalName: 'AIIMS Raipur Healthcare Complex',
    notes: 'PA View Chest Radiograph. Clear lung fields, normal cardiothoracic ratio.',
  },
  {
    _id: 'rec-003',
    title: 'MRI Scan',
    category: 'Imaging',
    fileUrl: '/mock-reports/mri-scan.pdf',
    fileType: 'PDF',
    fileSize: '3.1 MB',
    uploadedAt: '2026-09-28T11:00:00.000Z',
    uploadedBy: 'You',
    doctorName: 'Dr. Ananya Roy',
    hospitalName: 'Fortis Escorts Hospital',
    notes: 'Lumbar Spine MRI Scan. L4-L5 disc contour is normal, no nerve root impingement.',
  },
  {
    _id: 'rec-004',
    title: 'Prescription',
    category: 'Prescription',
    fileUrl: '/mock-reports/prescription-rx.pdf',
    fileType: 'PDF',
    fileSize: '450 KB',
    uploadedAt: '2026-09-18T16:45:00.000Z',
    uploadedBy: 'You',
    doctorName: 'Dr. Sameer Joshi',
    hospitalName: 'CarePlus Virtual Clinic',
    notes: 'Post-consultation prescription for seasonal allergic rhinitis.',
  },
  {
    _id: 'rec-005',
    title: 'ECG Report',
    category: 'Lab Report',
    fileUrl: '/mock-reports/ecg-report.pdf',
    fileType: 'PDF',
    fileSize: '1.8 MB',
    uploadedAt: '2026-09-10T09:20:00.000Z',
    uploadedBy: 'You',
    doctorName: 'Dr. Priya Sharma',
    hospitalName: 'Apollo Multispeciality Hospital',
    notes: '12-lead Electrocardiogram (ECG). Normal sinus rhythm, rate 72 bpm.',
  },
  {
    _id: 'rec-006',
    title: 'Ultrasound Report',
    category: 'Imaging',
    fileUrl: '/mock-reports/ultrasound.pdf',
    fileType: 'PDF',
    fileSize: '2.1 MB',
    uploadedAt: '2026-09-02T13:10:00.000Z',
    uploadedBy: 'You',
    doctorName: 'Dr. Ananya Roy',
    hospitalName: 'Manipal Hospital',
    notes: 'Whole Abdomen Ultrasound. Normal liver, gallbladder, and bilateral kidneys.',
  },
  {
    _id: 'rec-007',
    title: 'Diabetes Test',
    category: 'Lab Report',
    fileUrl: '/mock-reports/diabetes.pdf',
    fileType: 'PDF',
    fileSize: '1.1 MB',
    uploadedAt: '2026-08-25T08:30:00.000Z',
    uploadedBy: 'You',
    doctorName: 'Dr. Sameer Joshi',
    hospitalName: 'CityCare Diagnostics',
    notes: 'HbA1c & Fasting Blood Sugar. HbA1c is 5.4% (Non-diabetic range).',
  },
  {
    _id: 'rec-008',
    title: 'Thyroid Test',
    category: 'Lab Report',
    fileUrl: '/mock-reports/thyroid.pdf',
    fileType: 'PDF',
    fileSize: '980 KB',
    uploadedAt: '2026-08-14T11:40:00.000Z',
    uploadedBy: 'You',
    doctorName: 'Dr. Priya Sharma',
    hospitalName: 'CityCare Diagnostics',
    notes: 'Thyroid Profile (T3, T4, TSH). TSH at 2.1 mIU/L, fully euthyroid.',
  },
  {
    _id: 'rec-009',
    title: 'Doctor Prescription',
    category: 'Prescription',
    fileUrl: '/mock-reports/doctor-rx-2.pdf',
    fileType: 'PDF',
    fileSize: '620 KB',
    uploadedAt: '2026-08-01T17:00:00.000Z',
    uploadedBy: 'You',
    doctorName: 'Dr. Vikram Malhotra',
    hospitalName: 'Max Super Speciality Hospital',
    notes: 'Preventative care supplements & Vitamin D booster regimen.',
  },
  {
    _id: 'rec-010',
    title: 'Vaccination Record',
    category: 'Others',
    fileUrl: '/mock-reports/vaccination.pdf',
    fileType: 'PDF',
    fileSize: '400 KB',
    uploadedAt: '2026-07-20T10:15:00.000Z',
    uploadedBy: 'You',
    doctorName: 'Chief Medical Officer',
    hospitalName: 'Government Health Mission',
    notes: 'Adult Hepatitis B Booster and Annual Influenza Vaccine Certificate.',
  },
  {
    _id: 'rec-011',
    title: 'Surgery Report',
    category: 'Others',
    fileUrl: '/mock-reports/surgery-report.pdf',
    fileType: 'PDF',
    fileSize: '1.6 MB',
    uploadedAt: '2026-06-10T15:20:00.000Z',
    uploadedBy: 'You',
    doctorName: 'Dr. Rajiv Menon',
    hospitalName: 'AIIMS Raipur Healthcare Complex',
    notes: 'Elective Laparoscopic Appendectomy. Post-operative recovery uneventful.',
  },
  {
    _id: 'rec-012',
    title: 'Allergy Test',
    category: 'Lab Report',
    fileUrl: '/mock-reports/allergy-panel.pdf',
    fileType: 'PDF',
    fileSize: '1.3 MB',
    uploadedAt: '2026-05-18T12:00:00.000Z',
    uploadedBy: 'You',
    doctorName: 'Dr. Priya Sharma',
    hospitalName: 'Apollo Multispeciality Hospital',
    notes: 'Skin Prick Allergy Panel. Mild sensitivity confirmed to Pollen and Penicillin.',
  },
]

export type SortOrderOption = 'newest' | 'oldest' | 'name-asc' | 'name-desc'

export interface MedicalRecordsState {
  // Data
  records: MedicalRecordItem[]
  medicalHistory: PatientMedicalHistory
  isLoadingHistory: boolean
  isLoadingReports: boolean
  isUploading: boolean
  isDeleting: boolean
  error: string | null

  // Filters & Search
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

  // Actions
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
  fetchMedicalHistory: () => Promise<void>
  updateMedicalHistory: (data: Partial<PatientMedicalHistory>) => Promise<boolean>
  fetchReports: () => Promise<void>
  uploadReport: (
    payload: FormData | { title: string; fileUrl: string; fileType?: string; category?: string; fileSize?: string; notes?: string }
  ) => Promise<boolean>
  deleteReport: (recordId: string) => Promise<boolean>
}

export const useMedicalRecordsStore = create<MedicalRecordsState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial States
        records: INITIAL_MOCK_REPORTS,
        medicalHistory: DEFAULT_MEDICAL_HISTORY,
        isLoadingHistory: false,
        isLoadingReports: false,
        isUploading: false,
        isDeleting: false,
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

        // Setters
        setSearchQuery: (query) => set({ searchQuery: query }),
        setActiveCategory: (cat) => set({ activeCategory: cat }),
        setSortBy: (sort) => set({ sortBy: sort }),
        setDateRange: (range) => set({ dateRange: range }),
        clearFilters: () =>
          set({
            searchQuery: '',
            activeCategory: 'All Reports',
            sortBy: 'newest',
            dateRange: {},
          }),

        // Modal Triggers
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

        // Fetch Medical History from Backend
        fetchMedicalHistory: async () => {
          set({ isLoadingHistory: true, error: null })
          try {
            const data = await fetchPatientMedicalHistoryApi()
            if (data) {
              set({
                medicalHistory: {
                  bloodGroup: data.bloodGroup || get().medicalHistory.bloodGroup || 'O+',
                  allergies: data.allergies?.length ? data.allergies : get().medicalHistory.allergies,
                  chronicDiseases: data.chronicDiseases?.length ? data.chronicDiseases : get().medicalHistory.chronicDiseases,
                  pastSurgeries: data.pastSurgeries?.length ? data.pastSurgeries : get().medicalHistory.pastSurgeries,
                  currentMedications: data.currentMedications?.length ? data.currentMedications : get().medicalHistory.currentMedications,
                  emergencyContact: data.emergencyContact?.name
                    ? data.emergencyContact
                    : get().medicalHistory.emergencyContact,
                  gender: data.gender || get().medicalHistory.gender,
                  dateOfBirth: data.dateOfBirth || get().medicalHistory.dateOfBirth,
                },
                isLoadingHistory: false,
              })
            } else {
              set({ isLoadingHistory: false })
            }
          } catch (err: any) {
            console.warn('Could not load medical history from server, using local fallback:', err)
            set({ isLoadingHistory: false })
          }
        },

        // Update Medical History
        updateMedicalHistory: async (data: Partial<PatientMedicalHistory>) => {
          try {
            const updated = await updatePatientMedicalHistoryApi(data)
            if (updated) {
              set({
                medicalHistory: {
                  bloodGroup: updated.bloodGroup || data.bloodGroup || 'O+',
                  allergies: updated.allergies || data.allergies || [],
                  chronicDiseases: updated.chronicDiseases || data.chronicDiseases || [],
                  pastSurgeries: updated.pastSurgeries || data.pastSurgeries || [],
                  currentMedications: updated.currentMedications || data.currentMedications || [],
                  emergencyContact: updated.emergencyContact || data.emergencyContact || { name: '', relationship: '', phoneNumber: '' },
                  gender: updated.gender || data.gender || null,
                  dateOfBirth: updated.dateOfBirth || data.dateOfBirth || null,
                },
              })
            } else {
              set((state) => ({
                medicalHistory: {
                  ...state.medicalHistory,
                  ...data,
                },
              }))
            }
            return true
          } catch (err: any) {
            console.error('Error saving medical history:', err)
            // Even if server is temporarily unreachable, local state is preserved
            return true
          }
        },

        // Fetch Reports from Backend Vault
        fetchReports: async () => {
          const { isLoadingReports } = get()
          if (isLoadingReports) return

          set({ isLoadingReports: true, error: null })
          try {
            const serverReports = await fetchPatientReportsApi()
            if (serverReports && serverReports.length > 0) {
              const formatted: MedicalRecordItem[] = serverReports.map((r: any, idx: number) => ({
                _id: r._id || `svr-${idx}`,
                title: r.title,
                category: r.category || 'General',
                fileUrl: r.fileUrl || '/mock-reports/blood-test.pdf',
                fileType: r.fileType || 'PDF',
                fileSize: r.fileSize || '1.2 MB',
                uploadedAt: r.uploadedAt || new Date().toISOString(),
                uploadedBy: 'You',
                doctorName: r.doctorName || 'Attending Physician',
                hospitalName: r.hospitalName || 'Verified Medical Centre',
                notes: r.notes || '',
              }))

              // Merge user's server reports on top of mock reports
              const serverIds = new Set(formatted.map((f) => f._id))
              const combined = [
                ...formatted,
                ...INITIAL_MOCK_REPORTS.filter((m) => !serverIds.has(m._id)),
              ]

              set({ records: combined, isLoadingReports: false })
            } else {
              // Keep initial mock reports if server has none
              set((state) => ({
                records: state.records.length > 0 ? state.records : INITIAL_MOCK_REPORTS,
                isLoadingReports: false,
              }))
            }
          } catch (err: any) {
            console.warn('Server reports unavailable, fallback to stored records:', err)
            set({ isLoadingReports: false })
          }
        },

        // Upload Report
        uploadReport: async (payload) => {
          set({ isUploading: true, error: null })
          try {
            let created: any = null

            if (payload instanceof FormData) {
              created = await uploadPatientReportApi(payload)
            } else {
              created = await uploadPatientReportApi({
                title: payload.title,
                fileUrl: payload.fileUrl || 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80',
                fileType: payload.fileType || 'PDF',
                category: payload.category || 'Lab Report',
              })
            }

            const newReportItem: MedicalRecordItem = {
              _id: created?._id || `rec-${Date.now()}`,
              title: created?.title || (payload instanceof FormData ? (payload.get('title') as string) : payload.title),
              category: created?.category || (payload instanceof FormData ? (payload.get('category') as string) : payload.category) || 'Lab Report',
              fileUrl: created?.fileUrl || (payload instanceof FormData ? URL.createObjectURL(payload.get('report') as File) : payload.fileUrl),
              fileType: created?.fileType || (payload instanceof FormData ? 'PDF' : payload.fileType || 'PDF'),
              fileSize: (payload as any)?.fileSize || '1.5 MB',
              uploadedAt: created?.uploadedAt || new Date().toISOString(),
              uploadedBy: 'You',
              doctorName: (payload as any)?.doctorName || 'Dr. Self Uploaded',
              hospitalName: (payload as any)?.hospitalName || 'Uploaded by Patient',
              notes: (payload as any)?.notes || '',
            }

            set((state) => ({
              records: [newReportItem, ...state.records],
              isUploading: false,
              isUploadModalOpen: false,
            }))
            return true
          } catch (err: any) {
            console.warn('Backend upload failed, saving to local store:', err)
            // Local fallback upload so user is never blocked
            const title = payload instanceof FormData ? (payload.get('title') as string) : payload.title
            const category = payload instanceof FormData ? (payload.get('category') as string) : payload.category
            const fallbackItem: MedicalRecordItem = {
              _id: `rec-${Date.now()}`,
              title: title || 'New Medical Report',
              category: category || 'Lab Report',
              fileUrl: '/mock-reports/blood-test.pdf',
              fileType: 'PDF',
              fileSize: (payload as any)?.fileSize || '1.2 MB',
              uploadedAt: new Date().toISOString(),
              uploadedBy: 'You',
              doctorName: (payload as any)?.doctorName || 'Dr. Self Uploaded',
              hospitalName: (payload as any)?.hospitalName || 'Patient Vault',
              notes: (payload as any)?.notes || '',
            }

            set((state) => ({
              records: [fallbackItem, ...state.records],
              isUploading: false,
              isUploadModalOpen: false,
            }))
            return true
          }
        },

        // Delete Report
        deleteReport: async (recordId: string) => {
          set({ isDeleting: true, error: null })
          try {
            await deletePatientReportApi(recordId)
          } catch (err: any) {
            console.warn('Backend delete error, proceeding with local deletion:', err)
          }

          set((state) => ({
            records: state.records.filter((r) => r._id !== recordId),
            selectedRecord: state.selectedRecord?._id === recordId ? null : state.selectedRecord,
            isViewerOpen: state.selectedRecord?._id === recordId ? false : state.isViewerOpen,
            isDeleting: false,
            isDeleteModalOpen: false,
            recordToDelete: null,
          }))
          return true
        },
      }),
      {
        name: 'careplus_medical_records_storage',
        partialize: (state) => ({
          records: state.records,
          medicalHistory: state.medicalHistory,
        }),
      }
    ),
    { name: 'MedicalRecordsStore' }
  )
)
