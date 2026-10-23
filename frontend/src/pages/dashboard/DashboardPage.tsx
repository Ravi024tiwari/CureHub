import { useEffect, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Activity,
  LogOut,
  User,
  ShieldAlert,
  ShieldCheck,
  Calendar,
  Building,
  Stethoscope,
  HeartPulse,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'
import { PatientHomePage } from '@/pages/patient'
import { HospitalAdminDashboardPage } from '@/pages/hospital-admin'
import { SuperAdminDashboardPage } from '@/pages/super-admin'
import { UserRole } from '@/types/auth'

export const DashboardPage: FC = () => {
  const navigate = useNavigate()
  const { user, logout, fetchMe } = useAuthStore()

  useEffect(() => {
    // If not authenticated in Zustand store, redirect to login
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  useEffect(() => {
    // Fetch latest user details only once on mount to prevent infinite loop
    fetchMe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  if (!user) {
    return null
  }

  // If patient, render the dedicated production-grade Patient Home Screen
  if (user.role === UserRole.PATIENT) {
    return <PatientHomePage />
  }

  // If hospital admin, render the dedicated production-grade Hospital Admin Dashboard
  if (user.role === UserRole.HOSPITAL_ADMIN) {
    return <HospitalAdminDashboardPage />
  }

  // If super admin, render the dedicated production-grade Super Admin Dashboard
  if (user.role === UserRole.SUPER_ADMIN) {
    return <SuperAdminDashboardPage />
  }

  const getRoleDetails = (role: UserRole) => {
    if (role === UserRole.HOSPITAL_ADMIN) {
      return {
        title: 'Hospital Administration',
        icon: Building,
        badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
        desc: 'Manage hospital departments, doctor onboarding, bed allocations, and appointments.',
      }
    }
    if (role === UserRole.DOCTOR) {
      return {
        title: 'Doctor Portal',
        icon: Stethoscope,
        badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        desc: 'Manage your patients, review clinical appointments, and write electronic prescriptions.',
      }
    }
    if (role === UserRole.SUPER_ADMIN) {
      return {
        title: 'Super Admin Console',
        icon: ShieldCheck,
        badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
        desc: 'Platform-wide authority to verify doctors, onboard hospitals, and monitor security.',
      }
    }
    return {
      title: 'Patient Portal',
      icon: HeartPulse,
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      desc: 'Access quality healthcare, book appointments, and manage your electronic health records.',
    }
  }

  const roleInfo = getRoleDetails(user.role)
  const RoleIcon = roleInfo.icon

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fbff] text-slate-900 selection:bg-blue-100 selection:text-blue-700">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
              <Activity className="size-5 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Care<span className="text-blue-600">Plus</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide -mt-1">
                {roleInfo.title}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-right">
              <div className="size-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-900">{user.name}</p>
                <p className="text-[10px] text-slate-400 capitalize">{user.role.replace('_', ' ')}</p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="rounded-xl border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Verification Warning (If Doctor / Hospital Admin is pending approval) */}
        {user.isAccountApproved === false && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 shadow-xs">
            <ShieldAlert className="size-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h4 className="font-bold text-sm text-amber-900">
                Account Verification Pending
              </h4>
              <p className="text-xs text-amber-800 leading-relaxed">
                Your medical credentials or hospital documents are currently
                under review by the Super Admin. Full administrative and clinical
                features will become active once verified.
              </p>
            </div>
          </div>
        )}

        {/* Welcome Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xl shadow-blue-900/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="size-14 sm:size-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-xs border border-blue-100">
              <RoleIcon className="size-8" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Welcome back, {user.name}!
                </h1>
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-bold border ${roleInfo.badgeColor}`}
                >
                  {user.role.toUpperCase().replace('_', ' ')}
                </span>
              </div>
              <p className="text-sm text-slate-500 max-w-2xl">{roleInfo.desc}</p>
            </div>
          </div>

          <div className="w-full md:w-auto flex sm:flex-row gap-3">
            <Button
              onClick={() => navigate('/login')}
              variant="outline"
              className="rounded-xl border-slate-200"
            >
              Switch Account
            </Button>
          </div>
        </div>

        {/* Profile Card & Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
              <User className="size-4 text-blue-600" />
              <span>User Information</span>
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400">Full Name:</span>
                <p className="font-semibold text-slate-800">{user.name}</p>
              </div>
              <div>
                <span className="text-slate-400">Email Address:</span>
                <p className="font-semibold text-slate-800">{user.email}</p>
              </div>
              <div>
                <span className="text-slate-400">Role:</span>
                <p className="font-semibold text-slate-800 capitalize">
                  {user.role.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
              <ShieldCheck className="size-4 text-emerald-600" />
              <span>Account Status</span>
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400">Approval Status:</span>
                <p className="font-semibold text-slate-800">
                  {user.isAccountApproved === false ? 'Pending Review' : 'Active & Verified'}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Authentication Mode:</span>
                <p className="font-semibold text-slate-800">Email & Password (JWT)</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
              <Calendar className="size-4 text-purple-600" />
              <span>Quick Actions</span>
            </div>
            <p className="text-xs text-slate-500">
              Explore available portal operations and healthcare management tools.
            </p>
            <Button
              size="sm"
              onClick={handleLogout}
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs"
            >
              Log Out Session
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
export default DashboardPage
