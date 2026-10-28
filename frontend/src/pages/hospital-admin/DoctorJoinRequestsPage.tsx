import { useEffect, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, X } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useHospitalAdminStore } from '@/store/hospitalAdminStore'
import { useHospitalAdminJoinRequestsStore } from '@/store/hospitalAdminJoinRequestsStore'

// Components
import { HospitalAdminLayout } from '@/components/hospital-admin/HospitalAdminLayout'
import { JoinRequestKpis } from '@/components/hospital-admin/join-requests/JoinRequestKpis'
import { JoinRequestFilters } from '@/components/hospital-admin/join-requests/JoinRequestFilters'
import { JoinRequestsTable } from '@/components/hospital-admin/join-requests/JoinRequestsTable'
import { JoinRequestActionModal } from '@/components/hospital-admin/join-requests/JoinRequestActionModal'

export const DoctorJoinRequestsPage: FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { selectedHospitalId } = useHospitalAdminStore()

  const {
    fetchRequests,
    toastMessage,
    clearToast,
  } = useHospitalAdminJoinRequestsStore()

  useEffect(() => {
    if (user && !user.isAccountApproved) {
      navigate('/hospital-admin/verification', { replace: true })
      return
    }
    fetchRequests(selectedHospitalId !== 'all' ? selectedHospitalId : undefined)
  }, [user, navigate, fetchRequests, selectedHospitalId])

  // Auto clear toast after 4s
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        clearToast()
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [toastMessage, clearToast])

  return (
    <HospitalAdminLayout>
      {/* Scrollable Page Body */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Action Success / Error Notification */}
        {toastMessage && (
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between shadow-xs animate-in slide-in-from-top-3 duration-200 ${
              toastMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
              <CheckCircle2 className="size-4.5 text-emerald-600 shrink-0" />
              <span>{toastMessage.text}</span>
            </div>
            <button
              onClick={clearToast}
              className="p-1 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {/* Page Header with Large Screen Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Doctor Join Requests
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Review and manage requests from doctors who want to join your hospital.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <div className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs font-bold text-emerald-800 shadow-2xs">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Verification Queue</span>
            </div>

            <button
              onClick={() => fetchRequests(selectedHospitalId !== 'all' ? selectedHospitalId : undefined)}
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-xs font-bold text-slate-700 hover:text-blue-600 transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span>Sync Requests</span>
            </button>
          </div>
        </div>

        {/* 4 KPI Metrics Cards */}
        <JoinRequestKpis />

        {/* Search & Filter Controls Bar */}
        <JoinRequestFilters />

        {/* Doctor Join Requests Table */}
        <JoinRequestsTable />
      </main>

      {/* Action Approval / Rejection Modal */}
      <JoinRequestActionModal />
    </HospitalAdminLayout>
  )
}

export default DoctorJoinRequestsPage
