export interface HospitalAdminKpis {
  totalHospitals: number
  totalDoctors: number
  totalAppointments: number
  activePatients: number
  pendingJoinRequests: number
  totalRevenue: number
  // Trends
  hospitalsTrend?: string
  doctorsTrend?: string
  appointmentsTrend?: string
  patientsTrend?: string
  requestsTrend?: string
  revenueTrend?: string
}

export interface AppointmentDailyStat {
  date: string
  dayLabel: string
  appointments: number
  total: number
}

export interface AppointmentStatusBreakdown {
  completed: number
  completedPct: number
  upcoming: number
  upcomingPct: number
  cancelled: number
  cancelledPct: number
  pending: number
  pendingPct: number
  total: number
}

export interface TopHospitalStat {
  id: string
  name: string
  city: string
  appointments: number
  patients: number
  revenue: number
  revenueFormatted: string
  occupancyRate: number
  image?: string
}

export interface DepartmentAppointmentStat {
  department: string
  appointments: number
  percentage: number
  iconName?: string
}

export interface AdminActivityItem {
  id: string
  type: 'doctor_application' | 'appointment_completed' | 'hospital_updated' | 'appointment_booked' | 'doctor_updated'
  title: string
  description: string
  timestamp: string
  doctorName?: string
  patientName?: string
  hospitalName?: string
}

export interface DoctorJoinRequestItem {
  id: string
  doctorId: string
  doctorName: string
  doctorEmail: string
  doctorPhone?: string
  avatar?: string
  specialization: string[]
  department: string
  experienceYears: number
  qualifications?: string[]
  consultationFee?: number
  medicalCouncilRegistrationNumber?: string
  message?: string
  appliedDaysAgo: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  hospitalId: string
  hospitalName?: string
}

export interface HospitalAdminDashboardData {
  adminName: string
  selectedHospitalId: string // 'all' | hospitalId
  hospitalsList: Array<{ id: string; name: string; city: string; active: boolean }>
  kpis: HospitalAdminKpis
  appointmentsTrend: AppointmentDailyStat[]
  statusBreakdown: AppointmentStatusBreakdown
  topHospitals: TopHospitalStat[]
  departmentStats: DepartmentAppointmentStat[]
  recentActivities: AdminActivityItem[]
  pendingRequests: DoctorJoinRequestItem[]
}

export interface HospitalBranchItem {
  _id: string
  name: string
  slug: string
  licenseNumber: string
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
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
  contactPhone: string
  contactEmail: string
  departments: string[]
  establishmentYear?: number
  totalBeds?: number
  hospitalType?: string
  facilities?: string[]
  rating?: number
  reviewCount?: number
  doctorCount?: number
  appointmentCount?: number
  description?: string
  openingTime?: string
  closingTime?: string
  isEmergency24x7?: boolean
  website?: string
  createdAt?: string
}

export interface HospitalBranchKpis {
  totalHospitals: number
  approvedHospitals: number
  pendingHospitals: number
  rejectedHospitals: number
  activeHospitals: number
  inactiveHospitals: number
  totalBeds?: number
}

export interface HospitalBranchPagination {
  totalDocs: number
  totalPages: number
  currentPage: number
  limit: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface AddHospitalFormData {
  name: string
  hospitalType: string
  slug: string
  establishmentYear: number | ''
  totalBeds: number | ''
  website: string
  description: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  contactEmail: string
  contactPhone: string
  departments: string[]
  facilities: string[]
  openingTime: string
  closingTime: string
  isEmergency24x7: boolean
  coverImage: string
  gallery: string[]
  licenseNumber: string
  licenseDocumentUrl: string
  licenseDocumentName?: string
}

export interface HospitalDoctorUser {
  _id: string
  name: string
  email: string
  phoneNumber?: string
  avatar?: string
}

export interface HospitalDoctorItem {
  _id: string
  userId: HospitalDoctorUser
  department: string
  specialization: string[]
  experienceYears: number
  consultationFee: number
  ratingAverage: number
  reviewCount?: number
  bio?: string
  medicalCouncilRegistrationNumber?: string
  qualifications?: string[]
  createdAt?: string
}

export interface HospitalActivityItem {
  id: string
  type: string
  title: string
  description: string
  timestamp: string
}

export interface HospitalDetailData {
  hospital: HospitalBranchItem & {
    hospitalAdminId?: HospitalDoctorUser
    verifiedBy?: { _id: string; name: string; email: string }
  }
  stats: {
    totalBeds: number
    totalDoctors: number
    totalAppointments: number
    totalPatients: number
  }
  departmentCounts: Array<{ department: string; doctorCount: number }>
  topDoctors: HospitalDoctorItem[]
  recentActivities: HospitalActivityItem[]
  isOwner?: boolean
  pendingRequestsCount?: number
}

export interface HospitalDoctorsResponse {
  doctors: HospitalDoctorItem[]
  pagination: HospitalBranchPagination
}

export interface HospitalAdminProfileData {
  _id: string
  userId: {
    _id: string
    name: string
    email: string
    phoneNumber?: string
    avatar?: string
    role: string
    isAccountApproved?: boolean
    createdAt?: string
  }
  hospitalId?: {
    _id: string
    name: string
    slug: string
    address?: any
  } | null
  hospitalName?: string
  hospitalRegistrationNumber?: string
  hospitalType?: string
  hospitalAddress?: string
  numberOfBeds?: number
  designation: string
  governmentIdType?: string
  governmentIdNumber?: string
  identityProofUrl?: string
  authorizationLetterUrl?: string
  additionalDocUrl?: string
  qualifications?: string[]
  verificationStatus: 'INCOMPLETE' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
  isSubmitted?: boolean
  submittedAt?: string
  verifiedBy?: any
  verifiedAt?: string
  rejectionReason?: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface HospitalAdminProfileUpdatePayload {
  name?: string
  phoneNumber?: string
  phone?: string
  avatarUrl?: string
  hospitalName?: string
  hospitalRegistrationNumber?: string
  hospitalType?: string
  hospitalAddress?: string
  numberOfBeds?: number
  designation?: string
  governmentIdType?: string
  governmentIdNumber?: string
  identityProofUrl?: string
  authorizationLetterUrl?: string
  additionalDocUrl?: string
  qualifications?: string[]
  isSubmitted?: boolean
}


