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
