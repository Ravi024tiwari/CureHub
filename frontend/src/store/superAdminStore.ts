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

import apolloImg from '@/assets/apollo-hospital.jpg'
import cityCareImg from '@/assets/city-care-hospital.jpg'
import shreeSaiImg from '@/assets/shree-sai-hospital.jpg'
import lifecareImg from '@/assets/lifecare-hospital.jpg'
import drAmitImg from '@/assets/dr-amit-singh.jpg'
import drPriyaImg from '@/assets/dr-priya-sharma.jpg'
import drRajeshImg from '@/assets/dr-rajesh-verma.jpg'
import drSnehaImg from '@/assets/dr-sneha-patel.jpg'

const INITIAL_KPIS: SuperAdminKpis = {
  totalHospitals: 48,
  totalHospitalsTrend: '+12%',
  hospitalsMonthDelta: '+5 this month',

  totalDoctors: 320,
  totalDoctorsTrend: '+18%',
  doctorsMonthDelta: '+48 this month',

  totalPatients: 12580,
  totalPatientsTrend: '+25%',
  patientsMonthDelta: '+2,490 this month',

  totalAppointments: 28420,
  totalAppointmentsTrend: '+22%',
  appointmentsMonthDelta: '+5,120 this month',

  totalRevenue: 4280000,
  totalRevenueFormatted: '₹ 42.8L',
  totalRevenueTrend: '+28%',
  revenueMonthDelta: '+₹ 9.4L this month',

  pendingVerifications: 18,
  pendingVerificationsTrend: '-10%',
  pendingBreakdown: '12 doctors • 6 hospitals',
}

const INITIAL_APPOINTMENTS_OVERVIEW: MonthlyAppointmentStat[] = [
  { month: 'Jan', completed: 850, cancelled: 80, rescheduled: 60, noShow: 30 },
  { month: 'Feb', completed: 920, cancelled: 90, rescheduled: 70, noShow: 40 },
  { month: 'Mar', completed: 1050, cancelled: 110, rescheduled: 80, noShow: 50 },
  { month: 'Apr', completed: 1180, cancelled: 130, rescheduled: 90, noShow: 45 },
  { month: 'May', completed: 1300, cancelled: 140, rescheduled: 110, noShow: 60 },
  { month: 'Jun', completed: 1250, cancelled: 120, rescheduled: 95, noShow: 50 },
  { month: 'Jul', completed: 1380, cancelled: 150, rescheduled: 105, noShow: 55 },
  { month: 'Aug', completed: 1420, cancelled: 160, rescheduled: 115, noShow: 60 },
  { month: 'Sep', completed: 1510, cancelled: 140, rescheduled: 120, noShow: 65 },
  { month: 'Oct', completed: 1680, cancelled: 170, rescheduled: 130, noShow: 70 },
  { month: 'Nov', completed: 1750, cancelled: 180, rescheduled: 140, noShow: 75 },
  { month: 'Dec', completed: 1890, cancelled: 190, rescheduled: 150, noShow: 80 },
]

const INITIAL_USER_GROWTH: MonthlyUserGrowthStat[] = [
  { month: 'Jan', patients: 1400, doctors: 80, hospitalAdmins: 12 },
  { month: 'Feb', patients: 2100, doctors: 110, hospitalAdmins: 16 },
  { month: 'Mar', patients: 2900, doctors: 145, hospitalAdmins: 22 },
  { month: 'Apr', patients: 3800, doctors: 180, hospitalAdmins: 26 },
  { month: 'May', patients: 4500, doctors: 210, hospitalAdmins: 30 },
  { month: 'Jun', patients: 5200, doctors: 240, hospitalAdmins: 34 },
  { month: 'Jul', patients: 5800, doctors: 265, hospitalAdmins: 38 },
  { month: 'Aug', patients: 6420, doctors: 290, hospitalAdmins: 42 },
  { month: 'Sep', patients: 7100, doctors: 305, hospitalAdmins: 44 },
  { month: 'Oct', patients: 7800, doctors: 320, hospitalAdmins: 48 },
  { month: 'Nov', patients: 8400, doctors: 340, hospitalAdmins: 52 },
  { month: 'Dec', patients: 9200, doctors: 360, hospitalAdmins: 56 },
]

const INITIAL_ROLE_DISTRIBUTION: RoleDistributionItem[] = [
  { role: 'Patients', count: 12580, percentage: 82.4, color: '#3B82F6', bg: 'bg-blue-500' },
  { role: 'Doctors', count: 320, percentage: 2.1, color: '#10B981', bg: 'bg-emerald-500' },
  { role: 'Hospital Admins', count: 48, percentage: 0.3, color: '#EC4899', bg: 'bg-pink-500' },
  { role: 'Super Admins', count: 2, percentage: 0.0, color: '#F59E0B', bg: 'bg-amber-500' },
]

const INITIAL_REVENUE_TREND: MonthlyRevenueStat[] = [
  { month: 'Jan', revenue: 320000, revenueFormatted: '₹ 3.2L' },
  { month: 'Feb', revenue: 410000, revenueFormatted: '₹ 4.1L' },
  { month: 'Mar', revenue: 560000, revenueFormatted: '₹ 5.6L' },
  { month: 'Apr', revenue: 490000, revenueFormatted: '₹ 4.9L' },
  { month: 'May', revenue: 680000, revenueFormatted: '₹ 6.8L' },
  { month: 'Jun', revenue: 790000, revenueFormatted: '₹ 7.9L' },
  { month: 'Jul', revenue: 710000, revenueFormatted: '₹ 7.1L' },
  { month: 'Aug', revenue: 880000, revenueFormatted: '₹ 8.8L' },
  { month: 'Sep', revenue: 940000, revenueFormatted: '₹ 9.4L' },
  { month: 'Oct', revenue: 1240000, revenueFormatted: '₹ 12.4L' },
  { month: 'Nov', revenue: 1350000, revenueFormatted: '₹ 13.5L' },
  { month: 'Dec', revenue: 1520000, revenueFormatted: '₹ 15.2L' },
]

const INITIAL_HOSPITAL_TREND: MonthlyHospitalTrendStat[] = [
  { month: 'Jan', count: 4 },
  { month: 'Feb', count: 5 },
  { month: 'Mar', count: 6 },
  { month: 'Apr', count: 9 },
  { month: 'May', count: 8 },
  { month: 'Jun', count: 11 },
  { month: 'Jul', count: 10 },
  { month: 'Aug', count: 8 },
  { month: 'Sep', count: 11 },
  { month: 'Oct', count: 13 },
  { month: 'Nov', count: 15 },
  { month: 'Dec', count: 17 },
]

const INITIAL_TOP_HOSPITALS: TopPerformingHospital[] = [
  {
    id: 'hosp-1',
    name: 'Apollo Multispeciality Hospital',
    city: 'Bilaspur, Chhattisgarh',
    image: apolloImg,
    rating: 4.8,
    appointmentsCount: 2420,
  },
  {
    id: 'hosp-2',
    name: 'City Care Hospital',
    city: 'Raipur, Chhattisgarh',
    image: cityCareImg,
    rating: 4.6,
    appointmentsCount: 1890,
  },
  {
    id: 'hosp-3',
    name: 'Shree Sai Hospital',
    city: 'Bilaspur, Chhattisgarh',
    image: shreeSaiImg,
    rating: 4.5,
    appointmentsCount: 1420,
  },
  {
    id: 'hosp-4',
    name: 'LifeCare Hospital',
    city: 'Durg, Chhattisgarh',
    image: lifecareImg,
    rating: 4.4,
    appointmentsCount: 980,
  },
]

const INITIAL_RECENT_APPOINTMENTS: RecentAppointmentRow[] = [
  {
    id: 'appt-1',
    patientName: 'Priya Sharma',
    patientAvatar: drPriyaImg,
    department: 'General Consultation',
    status: 'Completed',
    time: 'Today, 10:30 AM',
    doctorName: 'Dr. Amit Singh',
    doctorAvatar: drAmitImg,
  },
  {
    id: 'appt-2',
    patientName: 'Rohit Verma',
    patientAvatar: drRajeshImg,
    department: 'Cardiology',
    status: 'Scheduled',
    time: 'Today, 11:00 AM',
    doctorName: 'Dr. Neha Gupta',
    doctorAvatar: drSnehaImg,
  },
  {
    id: 'appt-3',
    patientName: 'Anjali Patel',
    patientAvatar: drSnehaImg,
    department: 'Dermatology',
    status: 'Completed',
    time: 'Today, 12:15 PM',
    doctorName: 'Dr. Vikram Jain',
    doctorAvatar: drAmitImg,
  },
  {
    id: 'appt-4',
    patientName: 'Suresh Yadav',
    patientAvatar: drRajeshImg,
    department: 'Orthopedics',
    status: 'Cancelled',
    time: 'Today, 01:00 PM',
    doctorName: 'Dr. Sneha Patel',
    doctorAvatar: drSnehaImg,
  },
]

const INITIAL_PENDING_VERIFICATIONS: PendingVerificationItem[] = [
  {
    id: 'ver-1',
    name: 'Dr. Karan Mehta',
    avatar: drAmitImg,
    type: 'Doctor Verification',
    category: 'doctor',
    timeAgo: '2 hours ago',
    status: 'Pending',
    departmentOrCity: 'Neurology • MCI-84920',
    registrationNumber: 'MCI-84920',
  },
  {
    id: 'ver-2',
    name: 'Dr. Ritu Sharma',
    avatar: drPriyaImg,
    type: 'Doctor Verification',
    category: 'doctor',
    timeAgo: '5 hours ago',
    status: 'Pending',
    departmentOrCity: 'Pediatrics • MCI-61245',
    registrationNumber: 'MCI-61245',
  },
  {
    id: 'ver-3',
    name: 'City Health Hospital',
    avatar: cityCareImg,
    type: 'Hospital Verification',
    category: 'hospital',
    timeAgo: '1 day ago',
    status: 'Pending',
    departmentOrCity: 'Raipur, Chhattisgarh • Reg: HOSP-4412',
    registrationNumber: 'HOSP-4412',
  },
  {
    id: 'ver-4',
    name: 'Medicare Hospital',
    avatar: shreeSaiImg,
    type: 'Hospital Verification',
    category: 'hospital',
    timeAgo: '2 days ago',
    status: 'Pending',
    departmentOrCity: 'Bilaspur, Chhattisgarh • Reg: HOSP-9921',
    registrationNumber: 'HOSP-9921',
  },
]

const INITIAL_RECENT_ACTIVITIES: AdminActivityTimelineItem[] = [
  {
    id: 'act-1',
    title: 'New doctor registered',
    type: 'doctor',
    timestamp: '10 minutes ago',
  },
  {
    id: 'act-2',
    title: 'Hospital application submitted',
    type: 'hospital',
    timestamp: '1 hour ago',
  },
  {
    id: 'act-3',
    title: 'Doctor leave request approved',
    type: 'leave',
    timestamp: '2 hours ago',
  },
  {
    id: 'act-4',
    title: 'New appointment booked',
    type: 'appointment',
    timestamp: '3 hours ago',
  },
  {
    id: 'act-5',
    title: 'Hospital verified',
    type: 'verification',
    timestamp: '5 hours ago',
  },
]

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
  fetchDashboard: () => Promise<void>
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

  fetchDashboard: async () => {
    set({ isLoading: true, error: null })
    try {
      const data = await superAdminService.getDashboard(2026)
      if (data && data.kpis) {
        set((state) => ({
          kpis: {
            ...state.kpis,
            totalHospitals: data.kpis.totalHospitals || state.kpis.totalHospitals,
            totalDoctors: data.kpis.totalDoctors || state.kpis.totalDoctors,
            totalPatients: data.kpis.totalPatients || state.kpis.totalPatients,
            totalAppointments: data.kpis.totalAppointments || state.kpis.totalAppointments,
          },
        }))
      }
    } catch (e: any) {
      console.warn('Backend sync failed, continuing with cached dashboard mock dataset:', e)
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
