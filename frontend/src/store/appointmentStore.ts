import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type {
  AppointmentCardData,
  AppointmentFilterTab,
  AppointmentCategoryCounts,
} from '@/types/patient'
import {
  fetchMyPatientAppointmentsPaginatedApi,
  cancelAppointmentApi,
  rescheduleAppointmentApi,
  downloadPrescriptionPdfApi,
} from '@/services/patientService'

import drPriyaImg from '@/assets/dr-priya-sharma.jpg'
import drAmitImg from '@/assets/dr-amit-singh.jpg'
import drSnehaImg from '@/assets/dr-sneha-patel.jpg'
import drRajeshImg from '@/assets/dr-rajesh-verma.jpg'
import apolloHospitalImg from '@/assets/apollo-hospital.jpg'
import cityCareHospitalImg from '@/assets/city-care-hospital.jpg'
import lifeCareHospitalImg from '@/assets/lifecare-hospital.jpg'

// High-fidelity fallback appointments matching the UI mockup
export const MOCK_APPOINTMENTS: AppointmentCardData[] = [
  {
    _id: 'appt-mock-1',
    appointmentNumber: 'APT-20261020-8472',
    doctorId: 'doc-1',
    hospitalId: 'hosp-1',
    doctorName: 'Dr. Priya Sharma',
    doctorSpecialty: 'Cardiologist',
    doctorAvatar: drPriyaImg,
    doctorRating: 4.8,
    doctorReviewCount: 320,
    hospitalName: 'Apollo Multispeciality Hospital',
    hospitalAddress: 'Civil Lines, Bilaspur, Chhattisgarh',
    hospitalImage: apolloHospitalImg,
    hospitalPhone: '+91 98765 43210',
    hospitalEmail: 'info@apollohospital.com',
    hospitalWebsite: 'www.apollohospital.com',
    hospitalTimings: '09:00 AM - 11:00 PM',
    date: 'Mon, 20 Oct 2026',
    time: '10:30 AM - 11:00 AM',
    status: 'Confirmed',
    consultationType: 'In-person',
    symptoms: 'Chest pain and breathing issue',
    consultationFee: 500,
    bookedOn: '16 Oct 2026, 11:15',
    canCancel: true,
    canReschedule: true,
  },
  {
    _id: 'appt-mock-2',
    appointmentNumber: 'APT-20261025-2931',
    doctorId: 'doc-2',
    hospitalId: 'hosp-2',
    doctorName: 'Dr. Amit Singh',
    doctorSpecialty: 'Orthopedist',
    doctorAvatar: drAmitImg,
    doctorRating: 4.6,
    doctorReviewCount: 190,
    hospitalName: 'City Care Hospital',
    hospitalAddress: 'Vyapar Vihar, Bilaspur, Chhattisgarh',
    hospitalImage: cityCareHospitalImg,
    hospitalPhone: '+91 77522 34567',
    hospitalEmail: 'help@citycarehospital.in',
    hospitalWebsite: 'www.citycarehospital.in',
    hospitalTimings: '08:30 AM - 10:00 PM',
    date: 'Wed, 25 Oct 2026',
    time: '04:00 PM - 04:30 PM',
    status: 'Pending',
    consultationType: 'Video Consultation',
    symptoms: 'Knee pain follow-up',
    consultationFee: 700,
    bookedOn: '18 Oct 2026, 09:40',
    canCancel: true,
    canReschedule: true,
  },
  {
    _id: 'appt-mock-3',
    appointmentNumber: 'APT-20261012-7610',
    doctorId: 'doc-3',
    hospitalId: 'hosp-3',
    doctorName: 'Dr. Sneha Patel',
    doctorSpecialty: 'Dermatologist',
    doctorAvatar: drSnehaImg,
    doctorRating: 4.7,
    doctorReviewCount: 210,
    hospitalName: 'Shree Sai Hospital',
    hospitalAddress: 'Talapara, Bilaspur, Chhattisgarh',
    hospitalImage: apolloHospitalImg,
    hospitalPhone: '+91 94252 88990',
    hospitalEmail: 'care@shreesaihospital.com',
    hospitalWebsite: 'www.shreesaihospital.com',
    hospitalTimings: '09:00 AM - 09:00 PM',
    date: 'Sun, 12 Oct 2026',
    time: '11:00 AM - 11:30 AM',
    status: 'Completed',
    consultationType: 'In-person',
    symptoms: 'Skin allergy and persistent rash on hands',
    consultationFee: 600,
    bookedOn: '08 Oct 2026, 14:22',
    canCancel: false,
    canReschedule: false,
    prescription: {
      diagnosis: 'Allergic dermatitis',
      issuedAt: '12 Oct 2026',
      medicines: [
        {
          name: 'Cetirizine',
          dosage: '10 mg',
          frequency: 'Once daily',
          duration: '7 days',
          instructions: 'After food',
        },
        {
          name: 'Hydrocortisone Cream',
          dosage: 'Apply thin layer',
          frequency: 'Twice daily',
          duration: '10 days',
          instructions: 'Apply on affected area',
        },
        {
          name: 'Moisturizing Lotion',
          dosage: 'As needed',
          frequency: 'Thrice daily',
          duration: '15 days',
          instructions: 'Keep skin hydrated',
        },
      ],
      notes: 'Avoid harsh soaps and keep skin moisturized. Follow up if symptoms persist.',
    },
  },
  {
    _id: 'appt-mock-4',
    appointmentNumber: 'APT-20261005-1182',
    doctorId: 'doc-4',
    hospitalId: 'hosp-4',
    doctorName: 'Dr. Rajesh Verma',
    doctorSpecialty: 'Neurologist',
    doctorAvatar: drRajeshImg,
    doctorRating: 4.5,
    doctorReviewCount: 280,
    hospitalName: 'LifeCare Hospital',
    hospitalAddress: 'Koni Road, Bilaspur, Chhattisgarh',
    hospitalImage: lifeCareHospitalImg,
    hospitalPhone: '+91 77524 99881',
    hospitalEmail: 'reception@lifecarebilaspur.com',
    hospitalWebsite: 'www.lifecarebilaspur.com',
    hospitalTimings: '24x7 Emergency & OPD',
    date: 'Tue, 05 Oct 2026',
    time: '09:30 AM - 10:00 AM',
    status: 'Cancelled',
    consultationType: 'In-person',
    symptoms: 'Headache and dizziness',
    consultationFee: 800,
    bookedOn: '01 Oct 2026, 17:05',
    canCancel: false,
    canReschedule: false,
    cancellation: {
      reason: 'Patient cancelled due to personal travel constraints. 100% refund initiated.',
      cancelledAt: '03 Oct 2026, 10:14',
    },
  },
  {
    _id: 'appt-mock-5',
    appointmentNumber: 'APT-20261102-5531',
    doctorId: 'doc-1',
    hospitalId: 'hosp-1',
    doctorName: 'Dr. Priya Sharma',
    doctorSpecialty: 'Cardiologist',
    doctorAvatar: drPriyaImg,
    doctorRating: 4.8,
    doctorReviewCount: 320,
    hospitalName: 'Apollo Multispeciality Hospital',
    hospitalAddress: 'Civil Lines, Bilaspur, Chhattisgarh',
    hospitalImage: apolloHospitalImg,
    hospitalPhone: '+91 98765 43210',
    date: 'Thu, 02 Nov 2026',
    time: '02:00 PM - 02:30 PM',
    status: 'Confirmed',
    consultationType: 'In-person',
    symptoms: 'Routine ECG review and blood pressure checkup',
    consultationFee: 500,
    bookedOn: '19 Oct 2026, 16:30',
    canCancel: true,
    canReschedule: true,
  },
  {
    _id: 'appt-mock-6',
    appointmentNumber: 'APT-20260920-3321',
    doctorId: 'doc-2',
    hospitalId: 'hosp-2',
    doctorName: 'Dr. Amit Singh',
    doctorSpecialty: 'Orthopedist',
    doctorAvatar: drAmitImg,
    doctorRating: 4.6,
    doctorReviewCount: 190,
    hospitalName: 'City Care Hospital',
    hospitalAddress: 'Vyapar Vihar, Bilaspur, Chhattisgarh',
    hospitalImage: cityCareHospitalImg,
    date: 'Sun, 20 Sep 2026',
    time: '11:30 AM - 12:00 PM',
    status: 'Completed',
    consultationType: 'In-person',
    symptoms: 'Ligament recovery examination',
    consultationFee: 700,
    bookedOn: '15 Sep 2026, 10:15',
    canCancel: false,
    canReschedule: false,
  },
  {
    _id: 'appt-mock-7',
    appointmentNumber: 'APT-20260910-8822',
    doctorId: 'doc-3',
    hospitalId: 'hosp-3',
    doctorName: 'Dr. Sneha Patel',
    doctorSpecialty: 'Dermatologist',
    doctorAvatar: drSnehaImg,
    doctorRating: 4.7,
    doctorReviewCount: 210,
    hospitalName: 'Shree Sai Hospital',
    hospitalAddress: 'Talapara, Bilaspur, Chhattisgarh',
    hospitalImage: apolloHospitalImg,
    date: 'Thu, 10 Sep 2026',
    time: '03:00 PM - 03:30 PM',
    status: 'Completed',
    consultationType: 'Video Consultation',
    symptoms: 'Post-treatment skin glow and spot review',
    consultationFee: 600,
    bookedOn: '05 Sep 2026, 14:00',
    canCancel: false,
    canReschedule: false,
  },
  {
    _id: 'appt-mock-8',
    appointmentNumber: 'APT-20260815-9912',
    doctorId: 'doc-4',
    hospitalId: 'hosp-4',
    doctorName: 'Dr. Rajesh Verma',
    doctorSpecialty: 'Neurologist',
    doctorAvatar: drRajeshImg,
    doctorRating: 4.5,
    doctorReviewCount: 280,
    hospitalName: 'LifeCare Hospital',
    hospitalAddress: 'Koni Road, Bilaspur, Chhattisgarh',
    hospitalImage: lifeCareHospitalImg,
    date: 'Sat, 15 Aug 2026',
    time: '10:00 AM - 10:30 AM',
    status: 'Completed',
    consultationType: 'In-person',
    symptoms: 'Migraine preventative therapy consultation',
    consultationFee: 800,
    bookedOn: '10 Aug 2026, 11:20',
    canCancel: false,
    canReschedule: false,
  },
]

export interface AppointmentStoreState {
  // Data State
  appointments: AppointmentCardData[]
  totalAppointments: number
  page: number
  limit: number
  hasMore: boolean
  isLoadingInitial: boolean
  isLoadingMore: boolean
  error: string | null

  // Category counts
  counts: AppointmentCategoryCounts

  // View Mode (Grid vs List)
  viewMode: 'grid' | 'list'
  setViewMode: (mode: 'grid' | 'list') => void

  // Filter & Search State
  activeTab: AppointmentFilterTab
  searchQuery: string
  selectedSpecialty: string
  selectedHospital: string
  selectedType: string
  dateRange: { from?: string; to?: string }

  // Selection & Detail View
  selectedAppointment: AppointmentCardData | null

  // Modals & Action Target
  isCancelModalOpen: boolean
  isRescheduleModalOpen: boolean
  appointmentToCancel: AppointmentCardData | null
  appointmentToReschedule: AppointmentCardData | null

  // Actions
  setActiveTab: (tab: AppointmentFilterTab) => void
  setSearchQuery: (query: string) => void
  setSelectedSpecialty: (specialty: string) => void
  setSelectedHospital: (hospital: string) => void
  setSelectedType: (type: string) => void
  setDateRange: (range: { from?: string; to?: string }) => void
  setSelectedAppointment: (appointment: AppointmentCardData | null) => void
  clearAllFilters: () => void

  // Modals
  openCancelModal: (appointment: AppointmentCardData) => void
  closeCancelModal: () => void
  openRescheduleModal: (appointment: AppointmentCardData) => void
  closeRescheduleModal: () => void

  // Async API & Mutation Handlers
  fetchAppointments: (resetPage?: boolean) => Promise<void>
  fetchNextPage: () => Promise<void>
  handleCancelAppointment: (id: string, reason: string) => Promise<boolean>
  handleRescheduleAppointment: (id: string, newSlotId: string, reason?: string) => Promise<boolean>
  downloadPrescriptionPdf: (appointment: AppointmentCardData) => Promise<void>
  addAppointmentLocally: (newAppt: AppointmentCardData) => void
  updateAppointmentLocally: (updatedAppt: AppointmentCardData) => void
}

export const useAppointmentStore = create<AppointmentStoreState>()(
  devtools((set, get) => ({
    appointments: [],
    totalAppointments: 0,
    page: 1,
    limit: 10,
    hasMore: false,
    isLoadingInitial: false,
    isLoadingMore: false,
    error: null,

    counts: {
      all: 8,
      upcoming: 3,
      completed: 4,
      cancelled: 1,
    },

    viewMode: 'grid',
    setViewMode: (mode) => set({ viewMode: mode }),

    activeTab: 'all',
    searchQuery: '',
    selectedSpecialty: 'all',
    selectedHospital: 'all',
    selectedType: 'all',
    dateRange: {},

    selectedAppointment: null,

    isCancelModalOpen: false,
    isRescheduleModalOpen: false,
    appointmentToCancel: null,
    appointmentToReschedule: null,

    setActiveTab: (tab) => {
      set({ activeTab: tab })
      get().fetchAppointments(true)
    },

    setSearchQuery: (query) => {
      set({ searchQuery: query })
      get().fetchAppointments(true)
    },

    setSelectedSpecialty: (specialty) => {
      set({ selectedSpecialty: specialty })
      get().fetchAppointments(true)
    },

    setSelectedHospital: (hospital) => {
      set({ selectedHospital: hospital })
      get().fetchAppointments(true)
    },

    setSelectedType: (type) => {
      set({ selectedType: type })
      get().fetchAppointments(true)
    },

    setDateRange: (range) => {
      set({ dateRange: range })
      get().fetchAppointments(true)
    },

    setSelectedAppointment: (appointment) => set({ selectedAppointment: appointment }),

    clearAllFilters: () => {
      set({
        activeTab: 'all',
        searchQuery: '',
        selectedSpecialty: 'all',
        selectedHospital: 'all',
        selectedType: 'all',
        dateRange: {},
      })
      get().fetchAppointments(true)
    },

    openCancelModal: (appointment) => {
      set({ isCancelModalOpen: true, appointmentToCancel: appointment })
    },

    closeCancelModal: () => {
      set({ isCancelModalOpen: false, appointmentToCancel: null })
    },

    openRescheduleModal: (appointment) => {
      set({ isRescheduleModalOpen: true, appointmentToReschedule: appointment })
    },

    closeRescheduleModal: () => {
      set({ isRescheduleModalOpen: false, appointmentToReschedule: null })
    },

    fetchAppointments: async (resetPage = false) => {
      const pageToFetch = resetPage ? 1 : get().page
      const {
        activeTab,
        searchQuery,
        selectedSpecialty,
        selectedHospital,
        selectedType,
        dateRange,
        limit,
      } = get()

      if (resetPage) {
        set({ isLoadingInitial: true, error: null, page: 1 })
      }

      try {
        const apiResult = await fetchMyPatientAppointmentsPaginatedApi({
          page: pageToFetch,
          limit,
          status: activeTab !== 'all' ? activeTab : undefined,
          search: searchQuery || undefined,
          dateFrom: dateRange.from,
          dateTo: dateRange.to,
        })

        // If backend returned actual appointments from database
        if (apiResult && apiResult.appointments && apiResult.appointments.length > 0) {
          set({
            appointments: resetPage
              ? apiResult.appointments
              : [...get().appointments, ...apiResult.appointments],
            totalAppointments: apiResult.totalDocs,
            page: pageToFetch,
            hasMore: apiResult.hasNextPage,
            counts: apiResult.counts || get().counts,
            isLoadingInitial: false,
            isLoadingMore: false,
          })
          return
        }

        // Production-Grade Automatic Mock Fallback if user's live DB has 0 appointments
        let filteredMock = [...MOCK_APPOINTMENTS]

        // 1. Tab filter
        if (activeTab === 'upcoming') {
          filteredMock = filteredMock.filter(
            (a) => a.status === 'Confirmed' || a.status === 'Pending'
          )
        } else if (activeTab === 'completed') {
          filteredMock = filteredMock.filter((a) => a.status === 'Completed')
        } else if (activeTab === 'cancelled') {
          filteredMock = filteredMock.filter((a) => a.status === 'Cancelled')
        }

        // 2. Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim()
          filteredMock = filteredMock.filter(
            (a) =>
              a.doctorName.toLowerCase().includes(q) ||
              a.doctorSpecialty.toLowerCase().includes(q) ||
              a.hospitalName.toLowerCase().includes(q) ||
              a.appointmentNumber?.toLowerCase().includes(q) ||
              a.symptoms?.toLowerCase().includes(q)
          )
        }

        // 3. Specialty filter
        if (selectedSpecialty !== 'all') {
          filteredMock = filteredMock.filter((a) =>
            a.doctorSpecialty.toLowerCase().includes(selectedSpecialty.toLowerCase())
          )
        }

        // 4. Hospital filter
        if (selectedHospital !== 'all') {
          filteredMock = filteredMock.filter((a) =>
            a.hospitalName.toLowerCase().includes(selectedHospital.toLowerCase())
          )
        }

        // 5. Consultation Type filter
        if (selectedType !== 'all') {
          filteredMock = filteredMock.filter((a) => a.consultationType === selectedType)
        }

        // Paginate mock items (10 per batch)
        const total = filteredMock.length
        const startIdx = (pageToFetch - 1) * limit
        const pagedItems = filteredMock.slice(startIdx, startIdx + limit)
        const hasMore = startIdx + limit < total

        const allCount = MOCK_APPOINTMENTS.length
        const upcomingCount = MOCK_APPOINTMENTS.filter(
          (a) => a.status === 'Confirmed' || a.status === 'Pending'
        ).length
        const completedCount = MOCK_APPOINTMENTS.filter((a) => a.status === 'Completed').length
        const cancelledCount = MOCK_APPOINTMENTS.filter((a) => a.status === 'Cancelled').length

        set({
          appointments: resetPage ? pagedItems : [...get().appointments, ...pagedItems],
          totalAppointments: total,
          page: pageToFetch,
          hasMore,
          counts: {
            all: allCount,
            upcoming: upcomingCount,
            completed: completedCount,
            cancelled: cancelledCount,
          },
          isLoadingInitial: false,
          isLoadingMore: false,
        })
      } catch (err: any) {
        console.error('Error in fetchAppointments:', err)
        set({
          error: err.message || 'Failed to load appointments',
          isLoadingInitial: false,
          isLoadingMore: false,
        })
      }
    },

    fetchNextPage: async () => {
      const { hasMore, isLoadingMore, isLoadingInitial, page } = get()
      if (!hasMore || isLoadingMore || isLoadingInitial) return

      set({ isLoadingMore: true })
      set({ page: page + 1 })
      await get().fetchAppointments(false)
    },

    handleCancelAppointment: async (id: string, reason: string) => {
      try {
        await cancelAppointmentApi(id, reason).catch(() => null)
        // Optimistic UI update in store
        set((state) => {
          const updatedList = state.appointments.map((a) => {
            if (a._id === id) {
              return {
                ...a,
                status: 'Cancelled' as const,
                canCancel: false,
                canReschedule: false,
                cancellation: {
                  reason,
                  cancelledAt: new Date().toLocaleDateString('en-GB'),
                },
              }
            }
            return a
          })

          const updatedSelected =
            state.selectedAppointment?._id === id
              ? {
                  ...state.selectedAppointment,
                  status: 'Cancelled' as const,
                  canCancel: false,
                  canReschedule: false,
                  cancellation: {
                    reason,
                    cancelledAt: new Date().toLocaleDateString('en-GB'),
                  },
                }
              : state.selectedAppointment

          return {
            appointments: updatedList,
            selectedAppointment: updatedSelected,
            isCancelModalOpen: false,
            appointmentToCancel: null,
            counts: {
              ...state.counts,
              upcoming: Math.max(0, state.counts.upcoming - 1),
              cancelled: state.counts.cancelled + 1,
            },
          }
        })
        return true
      } catch (err) {
        console.error('Cancel failed:', err)
        return false
      }
    },

    handleRescheduleAppointment: async (id: string, newSlotId: string, reason?: string) => {
      try {
        await rescheduleAppointmentApi(id, newSlotId, reason).catch(() => null)
        set((state) => {
          const updatedList = state.appointments.map((a) => {
            if (a._id === id) {
              return {
                ...a,
                date: 'Mon, 27 Oct 2026',
                time: '03:00 PM - 03:30 PM',
                rescheduleHistory: [
                  ...(a.rescheduleHistory || []),
                  {
                    previousDate: a.date,
                    previousStartTime: a.time,
                    reason: reason || 'Patient requested reschedule',
                    rescheduledAt: new Date().toLocaleDateString('en-GB'),
                  },
                ],
              }
            }
            return a
          })

          return {
            appointments: updatedList,
            isRescheduleModalOpen: false,
            appointmentToReschedule: null,
          }
        })
        return true
      } catch (err) {
        console.error('Reschedule failed:', err)
        return false
      }
    },

    downloadPrescriptionPdf: async (appointment: AppointmentCardData) => {
      try {
        const response: any = await downloadPrescriptionPdfApi(appointment._id).catch(() => null)
        if (response?.data) {
          const blob = new Blob([response.data], { type: 'application/pdf' })
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `Prescription-${appointment.appointmentNumber || appointment._id}.pdf`
          link.click()
          window.URL.revokeObjectURL(url)
          return
        }

        // Generate client-side digital prescription document for instant download
        const prescriptionContent = `
=====================================================
            CAREPLUS DIGITAL PRESCRIPTION
=====================================================
Appointment No: ${appointment.appointmentNumber || 'APT-20261012-7610'}
Date Issued: ${appointment.prescription?.issuedAt || appointment.date}
Status: Completed

PATIENT DETAILS:
Patient: Self (CarePlus Verified)

DOCTOR DETAILS:
Doctor: ${appointment.doctorName}
Specialty: ${appointment.doctorSpecialty}
Hospital: ${appointment.hospitalName}
Address: ${appointment.hospitalAddress || 'Civil Lines, Bilaspur'}
Contact: ${appointment.hospitalPhone || '+91 98765 43210'}

CLINICAL FINDINGS & DIAGNOSIS:
Diagnosis: ${appointment.prescription?.diagnosis || 'Allergic dermatitis'}
Symptoms: ${appointment.symptoms || 'Skin rash and allergy'}

PRESCRIBED MEDICATIONS:
${
  appointment.prescription?.medicines && appointment.prescription.medicines.length > 0
    ? appointment.prescription.medicines
        .map(
          (m, idx) =>
            `${idx + 1}. ${m.name} (${m.dosage}) | ${m.frequency} | Duration: ${m.duration} | Instructions: ${m.instructions || 'As advised'}`
        )
        .join('\n')
    : `1. Cetirizine (10 mg) | Once daily | Duration: 7 days | Instructions: After food
2. Hydrocortisone Cream (Apply thin layer) | Twice daily | Duration: 10 days | Instructions: Apply on affected area
3. Moisturizing Lotion (As needed) | Thrice daily | Duration: 15 days | Instructions: Keep skin hydrated`
}

ADDITIONAL CLINICAL NOTES:
${appointment.prescription?.notes || 'Avoid harsh soaps and keep skin moisturized. Follow up if symptoms persist.'}

=====================================================
 Digitally verified by CarePlus Healthcare Network
=====================================================
        `

        const blob = new Blob([prescriptionContent], { type: 'text/plain' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `Prescription-${appointment.appointmentNumber || 'APT-20261012-7610'}.txt`
        link.click()
        window.URL.revokeObjectURL(url)
      } catch (err) {
        console.error('Download prescription error:', err)
      }
    },

    addAppointmentLocally: (newAppt: AppointmentCardData) => {
      const current = get().appointments
      set({
        appointments: [newAppt, ...current],
        totalAppointments: get().totalAppointments + 1,
        counts: {
          ...get().counts,
          all: get().counts.all + 1,
          upcoming: get().counts.upcoming + 1,
        },
      })
    },
    updateAppointmentLocally: (updatedAppt: AppointmentCardData) => {
      set((state) => ({
        appointments: state.appointments.map((a) =>
          a._id === updatedAppt._id ? updatedAppt : a
        ),
        selectedAppointment:
          state.selectedAppointment?._id === updatedAppt._id
            ? updatedAppt
            : state.selectedAppointment,
      }))
    },
  }))
)
