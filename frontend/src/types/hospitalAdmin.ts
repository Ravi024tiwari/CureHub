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

