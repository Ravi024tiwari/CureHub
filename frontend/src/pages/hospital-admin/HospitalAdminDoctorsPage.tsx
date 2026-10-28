import { HospitalAdminLayout } from '@/components/hospital-admin/HospitalAdminLayout'
import { useEffect, type FC } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  UserPlus,
  RefreshCw,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building2,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useHospitalAdminStore } from '@/store/hospitalAdminStore'
import { useHospitalAdminDoctorsStore } from '@/store/hospitalAdminDoctorsStore'

// Components
import { HospitalDoctorKpis } from '@/components/hospital-admin/doctors/HospitalDoctorKpis'
import { HospitalDoctorFilters } from '@/components/hospital-admin/doctors/HospitalDoctorFilters'
import { HospitalDoctorsGrid } from '@/components/hospital-admin/doctors/HospitalDoctorsGrid'
import { HospitalDoctorsTable } from '@/components/hospital-admin/doctors/HospitalDoctorsTable'
import { HospitalDoctorDisaffiliateModal } from '@/components/hospital-admin/doctors/HospitalDoctorDisaffiliateModal'
import { HospitalDoctorDetailModal } from '@/components/hospital-admin/hospital-detail/HospitalDoctorDetailModal'

export const HospitalAdminDoctorsPage: FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const {
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    isSidebarCollapsed,
    toggleSidebar,
  } = useHospitalAdminStore()

  const {
    doctors,
    pagination,
    viewMode,
    isLoading,
    toastMessage,
    selectedDoctorForModal,
    fetchDoctors,
    setCurrentPage,
    setSelectedDoctorForModal,
    clearToast,
  } = useHospitalAdminDoctorsStore()

  useEffect(() => {
    if (user && !user.isAccountApproved) {
      navigate('/hospital-admin/verification', { replace: true })
      return
    }
    fetchDoctors()
  }, [user, navigate, fetchDoctors])

  // Auto clear toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        clearToast()
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [toastMessage, clearToast])

  const startIndex = (pagination.currentPage - 1) * pagination.limit
  const totalPages = pagination.totalPages || 1

  return (
    <HospitalAdminLayout>
        <main className="flex-1 max-w-[1600px] w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5 sm:space-y-6">
          {/* Toast Notification */}
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
                type="button"
                onClick={clearToast}
                className="p-1 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
          )}

          {/* Page Header Banner */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <Link
                  to="/hospital-admin/hospitals"
                  className="hover:text-blue-600 transition-colors flex items-center gap-1"
                >
                  <Building2 className="size-3.5 text-slate-400" />
                  <span>Hospital Admin</span>
                </Link>
                <span>/</span>
                <span className="text-slate-900 font-bold">Affiliated Doctors</span>
              </div>

              <div className="flex items-center gap-3 flex-wrap pt-0.5">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  Affiliated Doctors Directory
                </h1>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/80">
                  <ShieldCheck className="size-3.5 text-blue-600" />
                  <span>Official Hospital Staff</span>
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl leading-relaxed">
                Comprehensive roster of verified specialist physicians and clinical consultants currently practicing across your registered hospital facilities.
              </p>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => fetchDoctors()}
                disabled={isLoading}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
                <span>Sync</span>
              </button>

              <Link
                to="/hospital-admin/join-requests"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black transition-all shadow-sm shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="size-4" />
                <span>Join Requests</span>
              </Link>
            </div>
          </div>

          {/* 1. KPI Metric Summary Cards */}
          <HospitalDoctorKpis />

          {/* 2. Search & Filter Bar */}
          <HospitalDoctorFilters />

          {/* 3. Doctors Display (Grid / Table) */}
          {viewMode === 'grid' ? (
            <HospitalDoctorsGrid />
          ) : (
            <div className="space-y-4">
              <HospitalDoctorsTable />
              {/* Fallback to grid on small screens when in table mode */}
              <div className="block sm:hidden">
                <HospitalDoctorsGrid />
              </div>
            </div>
          )}

          {/* 4. Interactive Pagination Bar */}
          {doctors.length > 0 && pagination.totalDocs > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs font-bold text-slate-500">
                Showing{' '}
                <span className="text-slate-900 font-black">
                  {startIndex + 1}
                </span>{' '}
                to{' '}
                <span className="text-slate-900 font-black">
                  {Math.min(startIndex + pagination.limit, pagination.totalDocs)}
                </span>{' '}
                of{' '}
                <span className="text-slate-900 font-black">
                  {pagination.totalDocs}
                </span>{' '}
                affiliated doctors
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCurrentPage(Math.max(1, pagination.currentPage - 1))}
                    disabled={pagination.currentPage <= 1 || isLoading}
                    className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs cursor-pointer"
                    title="Previous Page"
                  >
                    <ChevronLeft className="size-4" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                    const isActive = pagination.currentPage === pageNum
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        disabled={isLoading}
                        className={`size-8 rounded-xl text-xs font-black transition-all cursor-pointer ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}

                  <button
                    type="button"
                    onClick={() => setCurrentPage(Math.min(totalPages, pagination.currentPage + 1))}
                    disabled={pagination.currentPage >= totalPages || isLoading}
                    className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs cursor-pointer"
                    title="Next Page"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </main>

      {/* Disaffiliate Confirmation Modal */}
      <HospitalDoctorDisaffiliateModal />

      {/* Full Doctor Detail Profile Modal (Live DB lookup) */}
      <HospitalDoctorDetailModal
        doctorId={selectedDoctorForModal?._id || null}
        isOpen={Boolean(selectedDoctorForModal)}
        onClose={() => setSelectedDoctorForModal(null)}
        initialData={
          selectedDoctorForModal
            ? {
                name: selectedDoctorForModal.userId?.name,
                department: selectedDoctorForModal.department,
                avatar: selectedDoctorForModal.userId?.avatar,
                experienceYears: selectedDoctorForModal.experienceYears,
                consultationFee: selectedDoctorForModal.consultationFee,
              }
            : undefined
        }
      />

      {/* Mobile Bottom Navigation */}
    </HospitalAdminLayout>
  )
}

export default HospitalAdminDoctorsPage
