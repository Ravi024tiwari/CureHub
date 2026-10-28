export interface DoctorHospitalItem {
  _id: string
  name: string
  slug: string
  licenseNumber?: string
  isActive: boolean
  images?: {
    coverImage?: string
    gallery?: string[]
  }
  address: {
    street: string
    city: string
    state: string
    zipCode?: string
    country?: string
  }
  contactPhone?: string
  contactEmail?: string
  website?: string
  departments: string[]
  establishmentYear?: number
  totalBeds?: number
  hospitalType?: string
  facilities?: string[]
  rating?: number
  distance?: string
  doctorCount?: number
  description?: string
  isEmergency24x7?: boolean
  openingTime?: string
  closingTime?: string
  isAffiliated?: boolean
  hasRequested?: boolean
  requestStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | null
  requestId?: string | null
  requestedDepartment?: string | null
}

export interface DoctorHospitalKpis {
  totalHospitals: number
  multiSpeciality: number
  privateHospitals: number
  governmentHospitals: number
  openForRequests: number
}

export interface DoctorHospitalFilterState {
  search: string
  city: string
  hospitalType: string
  department: string
  sortBy: string
  page: number
  limit: number
}

// Runtime marker to ensure Vite treats module as having runtime JS exports
export const DOCTOR_HOSPITAL_MODULE = true as const
