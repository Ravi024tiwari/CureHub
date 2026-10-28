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

export interface DoctorJoinRequestFull {
  _id: string
  doctorId: {
    _id: string
    department: string
    specialization: string[]
    qualifications: string[]
    experienceYears: number
    experiences?: Array<{
      title: string
      institution: string
      period: string
      duration?: string
      description?: string
    }>
    consultationFee: number
    ratingAverage: number
    reviewCount: number
    medicalCouncilRegistrationNumber: string
    licenseDocumentUrl?: string
    bio?: string
    verificationStatus?: string
    hospitalAffiliationStatus?: string
    scheduleRules?: any[]
  } | null
  doctorUserId: {
    _id: string
    name: string
    email: string
    phoneNumber?: string
    avatar?: string
    address?: {
      street?: string
      city?: string
      state?: string
      zipCode?: string
      country?: string
    }
  } | null
  hospitalId: {
    _id: string
    name: string
    slug: string
    address?: {
      street?: string
      city?: string
      state?: string
      zipCode?: string
    }
    departments?: string[]
    contactEmail?: string
    contactPhone?: string
    images?: {
      coverImage?: string
      gallery?: string[]
    }
  } | null
  department: string
  message?: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  rejectionReason?: string
  reviewedBy?: {
    _id: string
    name: string
    email: string
  } | null
  reviewedAt?: string
  createdAt: string
  updatedAt: string
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
  activeHospitals: number
  inactiveHospitals: number
  totalBeds?: number
  approvedHospitals?: number
  pendingHospitals?: number
  rejectedHospitals?: number
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
  alternatePhone?: string
  address?: string
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

export interface AffiliatedDoctorItem {
  _id: string
  userId: {
    _id: string
    name: string
    email: string
    phoneNumber?: string
    avatar?: string
    address?: {
      street?: string
      city?: string
      state?: string
      zipCode?: string
      country?: string
    }
  }
  hospitalId: {
    _id: string
    name: string
    slug: string
    address?: {
      street?: string
      city?: string
      state?: string
      zipCode?: string
    }
    departments?: string[]
  }
  department: string
  specialization: string[]
  qualifications: string[]
  experienceYears: number
  consultationFee: number
  ratingAverage: number
  reviewCount: number
  bio?: string
  medicalCouncilRegistrationNumber?: string
  licenseDocumentUrl?: string
  hospitalAffiliationStatus: 'APPROVED' | 'PENDING_APPROVAL' | 'NOT_AFFILIATED' | 'REJECTED'
  scheduleRules?: any[]
  createdAt: string
}

export interface HospitalAdminDoctorsKpis {
  totalDoctors: number
  totalDepartments: number
  averageRating: number
  averageFee: number
}

export interface HospitalAdminDoctorsResponse {
  doctors: AffiliatedDoctorItem[]
  pagination: HospitalBranchPagination
  kpis: HospitalAdminDoctorsKpis
  departmentStats: Array<{ department: string; count: number }>
  hospitalsList: Array<{ id: string; name: string; city: string }>
}


