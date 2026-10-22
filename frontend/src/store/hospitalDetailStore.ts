import { create } from 'zustand'
import { hospitalService } from '@/services/hospitalService'
import type {
  HospitalDetailData,
  HospitalDoctorItem,
  HospitalBranchPagination,
} from '@/types/hospitalAdmin'

// Curated avatar fallbacks
import drAmitImg from '@/assets/dr-amit-singh.jpg'
import drNehaImg from '@/assets/dr-sneha-patel.jpg'
import drRajeshImg from '@/assets/dr-rajesh-verma.jpg'
import drPriyaImg from '@/assets/dr-priya-sharma.jpg'

const DEMO_APOLLO_DOCTORS: HospitalDoctorItem[] = [
  {
    _id: 'doc-1',
    userId: {
      _id: 'u-1',
      name: 'Dr. Amit Singh',
      email: 'amit.singh@apollo.com',
      phoneNumber: '+91 98765 11001',
      avatar: drAmitImg,
    },
    department: 'Cardiology',
    specialization: ['Cardiologist', 'Interventional Cardiology'],
    experienceYears: 12,
    consultationFee: 800,
    ratingAverage: 4.8,
    reviewCount: 310,
    medicalCouncilRegistrationNumber: 'MCI-2012-7814',
  },
  {
    _id: 'doc-2',
    userId: {
      _id: 'u-2',
      name: 'Dr. Neha Gupta',
      email: 'neha.gupta@apollo.com',
      phoneNumber: '+91 98765 11002',
      avatar: drNehaImg,
    },
    department: 'Dermatology',
    specialization: ['Dermatologist', 'Cosmetic Dermatology'],
    experienceYears: 8,
    consultationFee: 650,
    ratingAverage: 4.6,
    reviewCount: 198,
    medicalCouncilRegistrationNumber: 'MCI-2016-3391',
  },
  {
    _id: 'doc-3',
    userId: {
      _id: 'u-3',
      name: 'Dr. Vikram Jain',
      email: 'vikram.jain@apollo.com',
      phoneNumber: '+91 98765 11003',
      avatar: drRajeshImg,
    },
    department: 'Orthopedics',
    specialization: ['Orthopedic Surgeon', 'Joint Replacement'],
    experienceYears: 15,
    consultationFee: 900,
    ratingAverage: 4.7,
    reviewCount: 245,
    medicalCouncilRegistrationNumber: 'MCI-2009-1142',
  },
  {
    _id: 'doc-4',
    userId: {
      _id: 'u-4',
      name: 'Dr. Sneha Patel',
      email: 'sneha.patel@apollo.com',
      phoneNumber: '+91 98765 11004',
      avatar: drPriyaImg,
    },
    department: 'Pediatrics',
    specialization: ['Pediatrician', 'Child Health Specialist'],
    experienceYears: 10,
    consultationFee: 700,
    ratingAverage: 4.5,
    reviewCount: 182,
    medicalCouncilRegistrationNumber: 'MCI-2014-9902',
  },
  {
    _id: 'doc-5',
    userId: {
      _id: 'u-5',
      name: 'Dr. Arjun Mehta',
      email: 'arjun.mehta@apollo.com',
      phoneNumber: '+91 98765 11005',
      avatar: drAmitImg,
    },
    department: 'Neurology',
    specialization: ['Neurologist', 'Stroke & Critical Care'],
    experienceYears: 14,
    consultationFee: 1000,
    ratingAverage: 4.8,
    reviewCount: 290,
    medicalCouncilRegistrationNumber: 'MCI-2010-4412',
  },
  {
    _id: 'doc-6',
    userId: {
      _id: 'u-6',
      name: 'Dr. Pooja Verma',
      email: 'pooja.verma@apollo.com',
      phoneNumber: '+91 98765 11006',
      avatar: drNehaImg,
    },
    department: 'Gynecology',
    specialization: ['Gynecologist', 'Obstetrician'],
    experienceYears: 11,
    consultationFee: 750,
    ratingAverage: 4.9,
    reviewCount: 420,
    medicalCouncilRegistrationNumber: 'MCI-2013-6623',
  },
  {
    _id: 'doc-7',
    userId: {
      _id: 'u-7',
      name: 'Dr. Rajesh Sharma',
      email: 'rajesh.sharma@apollo.com',
      phoneNumber: '+91 98765 11007',
      avatar: drRajeshImg,
    },
    department: 'General Medicine',
    specialization: ['Internal Medicine', 'Diabetes Specialist'],
    experienceYears: 16,
    consultationFee: 600,
    ratingAverage: 4.7,
    reviewCount: 512,
    medicalCouncilRegistrationNumber: 'MCI-2008-8834',
  },
  {
    _id: 'doc-8',
    userId: {
      _id: 'u-8',
      name: 'Dr. Meera Iyer',
      email: 'meera.iyer@apollo.com',
      phoneNumber: '+91 98765 11008',
      avatar: drPriyaImg,
    },
    department: 'Cardiology',
    specialization: ['Cardiologist', 'Echocardiography'],
    experienceYears: 9,
    consultationFee: 850,
    ratingAverage: 4.6,
    reviewCount: 160,
    medicalCouncilRegistrationNumber: 'MCI-2015-7721',
  },
  {
    _id: 'doc-9',
    userId: {
      _id: 'u-9',
      name: 'Dr. Sanjay Kulkarni',
      email: 'sanjay.kulkarni@apollo.com',
      phoneNumber: '+91 98765 11009',
      avatar: drAmitImg,
    },
    department: 'Urology',
    specialization: ['Urologist', 'Endourology'],
    experienceYears: 13,
    consultationFee: 950,
    ratingAverage: 4.8,
    reviewCount: 210,
    medicalCouncilRegistrationNumber: 'MCI-2011-5529',
  },
  {
    _id: 'doc-10',
    userId: {
      _id: 'u-10',
      name: 'Dr. Kavita Nair',
      email: 'kavita.nair@apollo.com',
      phoneNumber: '+91 98765 11010',
      avatar: drNehaImg,
    },
    department: 'Ophthalmology',
    specialization: ['Eye Specialist', 'Cataract Surgeon'],
    experienceYears: 7,
    consultationFee: 500,
    ratingAverage: 4.5,
    reviewCount: 134,
    medicalCouncilRegistrationNumber: 'MCI-2017-9102',
  },
]

// Demo Fallback matching user mockup if database is empty or offline
const DEMO_APOLLO_DETAIL: HospitalDetailData = {
  hospital: {
    _id: 'demo-hosp-1',
    name: 'Apollo Multispeciality Hospital',
    slug: 'apollo-multispeciality-hospital',
    licenseNumber: 'MH/123456/2010',
    verificationStatus: 'APPROVED',
    isActive: true,
    images: {
      coverImage: '/src/assets/apollo-hospital.jpg',
    },
    address: {
      street: 'Civil Lines, Near High Court Road',
      city: 'Bilaspur',
      state: 'Chhattisgarh',
      zipCode: '495001',
      country: 'India',
    },
    contactPhone: '+91 98765 43210',
    contactEmail: 'info@apollohospital.com',
    departments: [
      'General Medicine',
      'Cardiology',
      'Neurology',
      'Orthopedics',
      'Pediatrics',
      'Gynecology',
      'Urology',
      'Dermatology',
      'Ophthalmology',
      'ENT',
    ],
    establishmentYear: 2010,
    totalBeds: 200,
    hospitalType: 'Multi-Speciality',
    facilities: [
      '24x7 Emergency',
      'Pharmacy',
      'Lab',
      'ICU',
      'Ambulance',
      'Pathology',
      'Blood Bank',
    ],
    rating: 4.8,
    reviewCount: 1240,
    doctorCount: 24,
    appointmentCount: 412,
    description:
      'Apollo Multispeciality Hospital is a leading healthcare institution providing world-class medical care with advanced technology, experienced doctors, and patient-centric services. We are committed to delivering high-quality healthcare across multiple specialties.',
    isEmergency24x7: true,
    website: 'https://www.apollohospital.com',
    openingTime: '09:00 AM',
    closingTime: '11:00 PM',
    createdAt: new Date('2021-03-15').toISOString(),
  },
  stats: {
    totalBeds: 200,
    totalDoctors: 24,
    totalAppointments: 412,
    totalPatients: 2680,
  },
  departmentCounts: [
    { department: 'General Medicine', doctorCount: 6 },
    { department: 'Cardiology', doctorCount: 4 },
    { department: 'Neurology', doctorCount: 3 },
    { department: 'Orthopedics', doctorCount: 5 },
    { department: 'Pediatrics', doctorCount: 3 },
    { department: 'Gynecology', doctorCount: 3 },
  ],
  topDoctors: DEMO_APOLLO_DOCTORS.slice(0, 5),
  recentActivities: [
    {
      id: 'act-1',
      type: 'doctor_joined',
      title: 'New doctor joined',
      description: 'Dr. Rahul Verma joined as Cardiology Specialist',
      timestamp: '2 hours ago',
    },
    {
      id: 'act-2',
      type: 'hospital_updated',
      title: 'Hospital details verified',
      description: 'Operating hours: 09:00 AM - 11:00 PM',
      timestamp: '6 hours ago',
    },
    {
      id: 'act-3',
      type: 'appointment',
      title: 'New appointments',
      description: '412 total appointments scheduled at this facility',
      timestamp: 'Today',
    },
    {
      id: 'act-4',
      type: 'license_verified',
      title: 'License document verified',
      description: 'Hospital license MH/123456/2010 verified by admin',
      timestamp: '1 day ago',
    },
  ],
  isOwner: true,
}

interface HospitalDetailState {
  // Detail state
  hospitalDetail: HospitalDetailData | null
  isLoading: boolean
  error: string | null

  // Doctors progressive pagination state (10 at a time)
  doctors: HospitalDoctorItem[]
  doctorsPagination: HospitalBranchPagination
  isDoctorsLoading: boolean
  doctorsError: string | null

  // Interactive filters
  selectedDepartment: string
  doctorSearchQuery: string
  currentDoctorPage: number

  // Actions
  fetchHospitalDetail: (id: string) => Promise<void>
  fetchHospitalDoctors: (
    id: string,
    page?: number,
    department?: string,
    search?: string
  ) => Promise<void>
  setSelectedDepartment: (dept: string) => void
  setDoctorSearchQuery: (query: string) => void
  setCurrentDoctorPage: (page: number) => void
  updateHospitalActiveStatusLocally: (isActive: boolean) => void
  resetStore: () => void
}

export const useHospitalDetailStore = create<HospitalDetailState>((set, get) => ({
  hospitalDetail: null,
  isLoading: false,
  error: null,

  doctors: DEMO_APOLLO_DOCTORS,
  doctorsPagination: {
    totalDocs: 24,
    totalPages: 3,
    currentPage: 1,
    limit: 10,
    hasNextPage: true,
    hasPrevPage: false,
  },
  isDoctorsLoading: false,
  doctorsError: null,

  selectedDepartment: 'All',
  doctorSearchQuery: '',
  currentDoctorPage: 1,

  // Fetch full hospital details (public/role-agnostic)
  fetchHospitalDetail: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await hospitalService.getHospitalById(id)

      if (response && response.hospital) {
        set({
          hospitalDetail: response,
          isLoading: false,
        })
      } else {
        // Fallback for demo ID or empty response
        set({
          hospitalDetail: {
            ...DEMO_APOLLO_DETAIL,
            hospital: {
              ...DEMO_APOLLO_DETAIL.hospital,
              _id: id,
              name: id.includes('city')
                ? 'City Care Hospital'
                : id.includes('sai')
                ? 'Shree Sai Hospital'
                : DEMO_APOLLO_DETAIL.hospital.name,
            },
          },
          isLoading: false,
        })
      }

      // Also automatically trigger doctors fetch for page 1
      get().fetchHospitalDoctors(id, 1, get().selectedDepartment, get().doctorSearchQuery)
    } catch (err: any) {
      console.warn('Backend hospital fetch returned error, using fallback demo hospital:', err)
      set({
        hospitalDetail: DEMO_APOLLO_DETAIL,
        isLoading: false,
      })
      get().fetchHospitalDoctors(id, 1, get().selectedDepartment, get().doctorSearchQuery)
    }
  },

  // Fetch doctors for this hospital with progressive 10-per-page pagination
  fetchHospitalDoctors: async (
    id: string,
    page = 1,
    department = get().selectedDepartment,
    search = get().doctorSearchQuery
  ) => {
    set({ isDoctorsLoading: true, doctorsError: null, currentDoctorPage: page })
    try {
      const response = await hospitalService.getHospitalDoctors(id, {
        page,
        limit: 10,
        department: department === 'All' ? undefined : department,
        search: search.trim() || undefined,
      })

      if (response && response.doctors && response.doctors.length > 0) {
        set({
          doctors: response.doctors,
          doctorsPagination: response.pagination,
          isDoctorsLoading: false,
        })
      } else {
        // High-fidelity fallback filtered by department or search
        let filtered = DEMO_APOLLO_DOCTORS
        if (department !== 'All') {
          filtered = filtered.filter(
            (d) => d.department.toLowerCase() === department.toLowerCase()
          )
        }
        if (search.trim()) {
          const q = search.toLowerCase()
          filtered = filtered.filter(
            (d) =>
              d.userId.name.toLowerCase().includes(q) ||
              d.department.toLowerCase().includes(q) ||
              d.specialization.some((s) => s.toLowerCase().includes(q))
          )
        }

        const limit = 10
        const startIndex = (page - 1) * limit
        const paginatedDocs = filtered.slice(startIndex, startIndex + limit)

        set({
          doctors: paginatedDocs,
          doctorsPagination: {
            totalDocs: filtered.length,
            totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
            currentPage: page,
            limit,
            hasNextPage: page < Math.ceil(filtered.length / limit),
            hasPrevPage: page > 1,
          },
          isDoctorsLoading: false,
        })
      }
    } catch (err: any) {
      console.warn('Failed to load doctors from server, using local doctors:', err)
      set({
        isDoctorsLoading: false,
        doctorsError: 'Unable to reach doctor directory server.',
      })
    }
  },

  setSelectedDepartment: (dept: string) => {
    set({ selectedDepartment: dept, currentDoctorPage: 1 })
    const hospitalId = get().hospitalDetail?.hospital?._id
    if (hospitalId) {
      get().fetchHospitalDoctors(hospitalId, 1, dept, get().doctorSearchQuery)
    }
  },

  setDoctorSearchQuery: (query: string) => {
    set({ doctorSearchQuery: query })
  },

  setCurrentDoctorPage: (page: number) => {
    set({ currentDoctorPage: page })
    const hospitalId = get().hospitalDetail?.hospital?._id
    if (hospitalId) {
      get().fetchHospitalDoctors(hospitalId, page, get().selectedDepartment, get().doctorSearchQuery)
    }
  },

  updateHospitalActiveStatusLocally: (isActive: boolean) => {
    const detail = get().hospitalDetail
    if (detail) {
      set({
        hospitalDetail: {
          ...detail,
          hospital: {
            ...detail.hospital,
            isActive,
          },
        },
      })
    }
  },

  resetStore: () => {
    set({
      hospitalDetail: null,
      doctors: DEMO_APOLLO_DOCTORS,
      isLoading: false,
      error: null,
      selectedDepartment: 'All',
      doctorSearchQuery: '',
      currentDoctorPage: 1,
    })
  },
}))
