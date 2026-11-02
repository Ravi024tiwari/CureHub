import { create } from 'zustand'
import { superAdminService } from '@/services/superAdminService'
import type {
  SuperAdminKpis,
  MonthlyAppointmentStat,
  MonthlyUserGrowthStat,
  RoleDistributionItem,
  MonthlyRevenueStat,
  MonthlyHospitalTrendStat,
  TopPerformingHospital,
  RecentAppointmentRow,
  PendingVerificationItem,
  AdminActivityTimelineItem,
} from '@/types/superAdmin'

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const INITIAL_KPIS: SuperAdminKpis = {
  totalHospitals: 0,
  totalHospitalsTrend: '0%',
  hospitalsMonthDelta: '+0 this month',

  totalDoctors: 0,
  totalDoctorsTrend: '0%',
  doctorsMonthDelta: '+0 this month',

  totalPatients: 0,
  totalPatientsTrend: '0%',
  patientsMonthDelta: '+0 this month',

  totalAppointments: 0,
  totalAppointmentsTrend: '0%',
  appointmentsMonthDelta: '+0 this month',

  totalRevenue: 0,
  totalRevenueFormatted: '₹ 0',
  totalRevenueTrend: '0%',
  revenueMonthDelta: '+₹ 0 this month',

  pendingVerifications: 0,
  pendingVerificationsTrend: '0 pending',
  pendingBreakdown: '0 doctors • 0 hospitals',
}

const INITIAL_APPOINTMENTS_OVERVIEW: MonthlyAppointmentStat[] = MONTH_NAMES.map((month) => ({
  month,
  completed: 0,
  cancelled: 0,
  rescheduled: 0,
  noShow: 0,
}))

const INITIAL_USER_GROWTH: MonthlyUserGrowthStat[] = MONTH_NAMES.map((month) => ({
  month,
  patients: 0,
  doctors: 0,
  hospitalAdmins: 0,
}))

const INITIAL_ROLE_DISTRIBUTION: RoleDistributionItem[] = [
  { role: 'Patients', count: 0, percentage: 0, color: '#3B82F6', bg: 'bg-blue-500' },
  { role: 'Doctors', count: 0, percentage: 0, color: '#10B981', bg: 'bg-emerald-500' },
  { role: 'Hospital Admins', count: 0, percentage: 0, color: '#EC4899', bg: 'bg-pink-500' },
  { role: 'Super Admins', count: 0, percentage: 0, color: '#F59E0B', bg: 'bg-amber-500' },
]

const INITIAL_REVENUE_TREND: MonthlyRevenueStat[] = MONTH_NAMES.map((month) => ({
  month,
  revenue: 0,
  revenueFormatted: '₹ 0',
}))

const INITIAL_HOSPITAL_TREND: MonthlyHospitalTrendStat[] = MONTH_NAMES.map((month) => ({
  month,
  count: 0,
}))

const INITIAL_TOP_HOSPITALS: TopPerformingHospital[] = []
const INITIAL_RECENT_APPOINTMENTS: RecentAppointmentRow[] = []
const INITIAL_PENDING_VERIFICATIONS: PendingVerificationItem[] = []
const INITIAL_RECENT_ACTIVITIES: AdminActivityTimelineItem[] = []

interface SuperAdminState {
  isLoading: boolean
  error: string | null

  // Layout / Responsive Sidebar
  isSidebarCollapsed: boolean
  isMobileSidebarOpen: boolean
  toggleSidebar: () => void
  setIsSidebarCollapsed: (c: boolean) => void
  setIsMobileSidebarOpen: (o: boolean) => void

  // Filters
  selectedDateRange: string
  appointmentsFilter: string
  userGrowthFilter: string
  revenueFilter: string
  searchQuery: string
  setSelectedDateRange: (range: string) => void
  setAppointmentsFilter: (f: string) => void
  setUserGrowthFilter: (f: string) => void
  setRevenueFilter: (f: string) => void
  setSearchQuery: (q: string) => void

  // Master Data
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

  // Action feedback
  actionNotification: string | null
  clearNotification: () => void

  // Actions
  fetchDashboard: (year?: number) => Promise<void>
  quickApproveVerification: (id: string, name: string) => Promise<void>
  quickRejectVerification: (id: string, name: string, reason?: string) => Promise<void>
}

export const useSuperAdminStore = create<SuperAdminState>((set, get) => ({
  isLoading: false,
  error: null,

  isSidebarCollapsed: false,
  isMobileSidebarOpen: false,

  toggleSidebar: () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen }))
    } else {
      set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed }))
    }
  },
  setIsSidebarCollapsed: (c) => set({ isSidebarCollapsed: c }),
  setIsMobileSidebarOpen: (o) => set({ isMobileSidebarOpen: o }),

  selectedDateRange: 'Jan 01, 2026 - Dec 31, 2026',
  appointmentsFilter: 'This Year',
  userGrowthFilter: 'This Year',
  revenueFilter: 'This Year',
  searchQuery: '',

  setSelectedDateRange: (range) => set({ selectedDateRange: range }),
  setAppointmentsFilter: (f) => set({ appointmentsFilter: f }),
  setUserGrowthFilter: (f) => set({ userGrowthFilter: f }),
  setRevenueFilter: (f) => set({ revenueFilter: f }),
  setSearchQuery: (q) => set({ searchQuery: q }),

  kpis: INITIAL_KPIS,
  appointmentsOverview: INITIAL_APPOINTMENTS_OVERVIEW,
  userGrowth: INITIAL_USER_GROWTH,
  roleDistribution: INITIAL_ROLE_DISTRIBUTION,
  revenueTrend: INITIAL_REVENUE_TREND,
  hospitalTrend: INITIAL_HOSPITAL_TREND,
  topHospitals: INITIAL_TOP_HOSPITALS,
  recentAppointments: INITIAL_RECENT_APPOINTMENTS,
  pendingVerifications: INITIAL_PENDING_VERIFICATIONS,
  recentActivities: INITIAL_RECENT_ACTIVITIES,

  actionNotification: null,
  clearNotification: () => set({ actionNotification: null }),

  fetchDashboard: async (year?: number) => {
    set({ isLoading: true, error: null })
    try {
      const targetYear = year || 2026
      const data = await superAdminService.getDashboard(targetYear)
      if (data) {
        set((state) => ({
          kpis: data.kpis ? { ...data.kpis } : state.kpis,
          appointmentsOverview: Array.isArray(data.appointmentsOverview)
            ? data.appointmentsOverview
            : state.appointmentsOverview,
          userGrowth: Array.isArray(data.userGrowth)
            ? data.userGrowth
            : state.userGrowth,
          roleDistribution: Array.isArray(data.roleDistribution)
            ? data.roleDistribution
            : state.roleDistribution,
          revenueTrend: Array.isArray(data.revenueTrend)
            ? data.revenueTrend
            : state.revenueTrend,
          hospitalTrend: Array.isArray(data.hospitalTrend)
            ? data.hospitalTrend
            : state.hospitalTrend,
          topHospitals: Array.isArray(data.topHospitals)
            ? data.topHospitals
            : state.topHospitals,
          recentAppointments: Array.isArray(data.recentAppointments)
            ? data.recentAppointments
            : state.recentAppointments,
          pendingVerifications: Array.isArray(data.pendingVerifications)
            ? data.pendingVerifications
            : state.pendingVerifications,
          recentActivities: Array.isArray(data.recentActivities)
            ? data.recentActivities
            : state.recentActivities,
        }))
      }
    } catch (e: any) {
      console.warn('Backend sync error for Super Admin dashboard:', e)
      set({ error: e?.message || 'Failed to fetch dashboard data' })
    } finally {
      set({ isLoading: false })
    }
  },

  quickApproveVerification: async (id: string, name: string) => {
    try {
      const item = get().pendingVerifications.find((v) => v.id === id)
      if (item?.category === 'doctor') {
        await superAdminService.verifyDoctor(id, 'APPROVED')
      } else if (item?.category === 'hospital') {
        await superAdminService.verifyHospitalAdmin(id, 'APPROVED')
      }
    } catch (err) {
      console.warn('API verification request error, updating optimistic state:', err)
    }

    set((state) => ({
      pendingVerifications: state.pendingVerifications.filter((v) => v.id !== id),
      kpis: {
        ...state.kpis,
        pendingVerifications: Math.max(0, state.kpis.pendingVerifications - 1),
      },
      actionNotification: `${name} has been approved successfully!`,
      recentActivities: [
        {
          id: `act-${Date.now()}`,
          title: `${name} approved and verified`,
          type: 'verification',
          timestamp: 'Just now',
        },
        ...state.recentActivities,
      ],
    }))
  },

  quickRejectVerification: async (id: string, name: string, reason = 'Application rejected') => {
    try {
      const item = get().pendingVerifications.find((v) => v.id === id)
      if (item?.category === 'doctor') {
        await superAdminService.verifyDoctor(id, 'REJECTED', reason)
      } else if (item?.category === 'hospital') {
        await superAdminService.verifyHospitalAdmin(id, 'REJECTED', reason)
      }
    } catch (err) {
      console.warn('API rejection error, updating optimistic state:', err)
    }

    set((state) => ({
      pendingVerifications: state.pendingVerifications.filter((v) => v.id !== id),
      kpis: {
        ...state.kpis,
        pendingVerifications: Math.max(0, state.kpis.pendingVerifications - 1),
      },
      actionNotification: `${name}'s application has been rejected.`,
    }))
  },
}))
