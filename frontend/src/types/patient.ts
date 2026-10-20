export interface HospitalCardData {
  _id: string
  name: string
  slug?: string
  image?: string
  rating: number
  reviewCount?: number
  distance: string
  location: string
  tags: string[]
  departments?: string[]
  emergencyAvailable?: boolean
  icuAvailable?: boolean
  phoneNumber?: string
}

export interface DoctorCardData {
  _id: string
  name: string
  specialty: string
  department?: string
  rating: number
  reviewCount: number
  experienceYears: number
  hospitalName: string
  hospitalLocation?: string
  avatar?: string
  consultationFee?: number
  availableToday?: boolean
  availableStatus?: string
  modes?: string[]
  distance?: string
  isFavorite?: boolean
  qualifications?: string[]
  specialization?: string[]
  bio?: string
  medicalCouncilRegistrationNumber?: string
  verificationStatus?: string
  email?: string
  phoneNumber?: string
}

export interface DoctorFilterState {
  specializations: string[]
  hospitals: string[]
  consultationTypes: string[]
  availability: string
  maxFee: number
  search: string
  selectedSpecialty: string
  selectedCity: string
  sort: string
}

export interface DoctorsApiResponse {
  doctors: DoctorCardData[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface AppointmentCardData {
  _id: string
  doctorName: string
  doctorSpecialty: string
  doctorAvatar?: string
  hospitalName: string
  date: string
  time: string
  status: 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled'
}

export interface SpecialtyCategory {
  id: string
  label: string
  iconName: string
  color: string
  bgColor: string
}

export interface HealthTipItem {
  id: string
  title: string
  date: string
  category: string
  readTime: string
  description: string
  imageUrl?: string
}
