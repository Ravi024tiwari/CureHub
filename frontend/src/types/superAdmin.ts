export interface SuperAdminKpis {
  totalHospitals: number
  totalHospitalsTrend: string
  hospitalsMonthDelta: string

  totalDoctors: number
  totalDoctorsTrend: string
  doctorsMonthDelta: string

  totalPatients: number
  totalPatientsTrend: string
  patientsMonthDelta: string

  totalAppointments: number
  totalAppointmentsTrend: string
  appointmentsMonthDelta: string

  totalRevenue: number
  totalRevenueFormatted: string
  totalRevenueTrend: string
  revenueMonthDelta: string

  pendingVerifications: number
  pendingVerificationsTrend: string
  pendingBreakdown: string
}

export interface MonthlyAppointmentStat {
  month: string
  completed: number
  cancelled: number
  rescheduled: number
  noShow: number
}

export interface MonthlyUserGrowthStat {
  month: string
  patients: number
  doctors: number
  hospitalAdmins: number
}

export interface RoleDistributionItem {
  role: string
  count: number
  percentage: number
  color: string
  bg: string
}

export interface MonthlyRevenueStat {
  month: string
  revenue: number
  revenueFormatted: string
}

export interface MonthlyHospitalTrendStat {
  month: string
  count: number
}

export interface TopPerformingHospital {
  id: string
  name: string
  city: string
  image: string
  rating: number
  appointmentsCount: number
}

export interface RecentAppointmentRow {
  id: string
  patientName: string
  patientAvatar?: string
  department: string
  status: 'Completed' | 'Scheduled' | 'Cancelled' | 'Rescheduled'
  time: string
  doctorName: string
  doctorAvatar?: string
}

export interface PendingVerificationItem {
  id: string
  name: string
  avatar?: string
  type: 'Doctor Verification' | 'Hospital Verification'
  category: 'doctor' | 'hospital'
  timeAgo: string
  status: 'Pending'
  departmentOrCity: string
  registrationNumber?: string
}

export interface AdminActivityTimelineItem {
  id: string
  title: string
  type: 'doctor' | 'hospital' | 'leave' | 'appointment' | 'verification'
  timestamp: string
}

export interface SuperAdminDashboardData {
  kpis: SuperAdminKpis
  appointmentsOverview: MonthlyAppointmentStat[]
  userGrowth: MonthlyUserGrowthStat[]
  roleDistribution: RoleDistributionItem[]
  revenueTrend: MonthlyRevenueStat[]
  hospitalTrend: MonthlyHospitalTrendStat[]
  topHospitals: TopPerformingHospital[]
  recentAppointments: RecentAppointmentRow[]
  pendingVerifications: PendingVerificationItem[]
  recentActivities: AdminActivityTimelineItem[]
}

export interface DoctorVerificationUser {
  _id: string
  name: string
  email: string
  phoneNumber?: string
  avatar?: string
  isAccountApproved: boolean
  isActive: boolean
  createdAt: string
}

export interface DoctorVerificationHospital {
  _id: string
  name: string
  slug: string
  address?: {
    street?: string
    city?: string
    state?: string
    country?: string
    zipCode?: string
  }
  contactEmail?: string
  contactPhone?: string
}

export interface DoctorVerificationExperience {
  title: string
  institution: string
  period: string
  duration?: string
  description?: string
}

export interface DoctorVerificationScheduleRule {
  dayOfWeek: number
  startTime: string
  endTime: string
  slotDurationMinutes: number
}

export interface DoctorVerificationLeave {
  date: string
  reason?: string
  createdAt: string
}

export interface DoctorVerificationRecord {
  _id: string
  userId: DoctorVerificationUser
  hospitalId?: DoctorVerificationHospital | null
  hospitalAffiliationStatus: 'NOT_AFFILIATED' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED'
  department: string
  specialization: string[]
  qualifications: string[]
  medicalCouncilRegistrationNumber: string
  licenseDocumentUrl?: string
  experienceYears: number
  experiences?: DoctorVerificationExperience[]
  consultationFee: number
  bio?: string
  scheduleRules?: DoctorVerificationScheduleRule[]
  leaves?: DoctorVerificationLeave[]
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
  verifiedBy?: {
    _id: string
    name: string
    email: string
    role: string
  } | null
  verifiedAt?: string
  rejectionReason?: string
  createdAt: string
  updatedAt: string
}

export interface DoctorVerificationStats {
  pending: number
  approved: number
  rejected: number
  total: number
  newToday?: number
  newThisMonth?: number
}

export interface DoctorVerificationFilters {
  search: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'
  hospitalId: string
  specialization: string
  dateFilter: 'all' | 'today' | 'week' | 'month'
  sortBy: 'newest' | 'oldest' | 'experience_desc'
  page: number
  limit: number
}

export interface HospitalAdminVerificationUser {
  _id: string
  name: string
  email: string
  phoneNumber?: string
  avatar?: string
  isAccountApproved: boolean
  isActive: boolean
  createdAt: string
}

export interface HospitalAdminVerificationHospital {
  _id: string
  name: string
  slug: string
  address?: {
    street?: string
    city?: string
    state?: string
    country?: string
    zipCode?: string
  }
  contactEmail?: string
  contactPhone?: string
  verificationStatus?: string
}

export interface HospitalAdminVerificationRecord {
  _id: string
  userId: HospitalAdminVerificationUser
  hospitalId?: HospitalAdminVerificationHospital | null
  hospitalName?: string
  hospitalRegistrationNumber?: string
  designation: string
  hospitalType?: string
  hospitalAddress?: string
  numberOfBeds?: number
  governmentIdType?: string
  governmentIdNumber?: string
  identityProofUrl?: string
  authorizationLetterUrl?: string
  additionalDocUrl?: string
  qualifications?: string[]
  verificationStatus: 'INCOMPLETE' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
  isSubmitted?: boolean
  submittedAt?: string
  verifiedBy?: {
    _id: string
    name: string
    email: string
    role: string
  } | null
  verifiedAt?: string
  rejectionReason?: string
  createdAt: string
  updatedAt: string
}

export interface HospitalAdminVerificationStats {
  pending: number
  approved: number
  rejected: number
  total: number
}

export interface HospitalAdminVerificationFilters {
  search: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'
  designation: string
  sortBy: 'newest' | 'oldest'
  page: number
  limit: number
}

