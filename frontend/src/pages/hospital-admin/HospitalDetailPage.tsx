import { useState, useEffect, type FC } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { HospitalAdminSidebar } from '@/components/hospital-admin/HospitalAdminSidebar'
import { HospitalAdminHeader } from '@/components/hospital-admin/HospitalAdminHeader'
import { HospitalAdminMobileNav } from '@/components/hospital-admin/HospitalAdminMobileNav'
import { EditHospitalModal } from '@/components/hospital-admin/hospitals/EditHospitalModal'

import { HospitalDetailHeader } from '@/components/hospital-admin/hospital-detail/HospitalDetailHeader'
import { HospitalHeroGallery } from '@/components/hospital-admin/hospital-detail/HospitalHeroGallery'
import {
  HospitalIdentityBanner,
  type HospitalTabKey,
} from '@/components/hospital-admin/hospital-detail/HospitalIdentityBanner'
import { HospitalQuickStats } from '@/components/hospital-admin/hospital-detail/HospitalQuickStats'
import { HospitalContactAddressSidebar } from '@/components/hospital-admin/hospital-detail/HospitalContactAddressSidebar'
import { HospitalOverviewTab } from '@/components/hospital-admin/hospital-detail/HospitalOverviewTab'
import { HospitalDoctorsTab } from '@/components/hospital-admin/hospital-detail/HospitalDoctorsTab'
import { HospitalDepartmentsTab } from '@/components/hospital-admin/hospital-detail/HospitalDepartmentsTab'
import { HospitalFacilitiesTab } from '@/components/hospital-admin/hospital-detail/HospitalFacilitiesTab'
import { HospitalGalleryTab } from '@/components/hospital-admin/hospital-detail/HospitalGalleryTab'
import { HospitalSettingsTab } from '@/components/hospital-admin/hospital-detail/HospitalSettingsTab'
import { HospitalDoctorDetailModal } from '@/components/hospital-admin/hospital-detail/HospitalDoctorDetailModal'

import { useHospitalDetailStore } from '@/store/hospitalDetailStore'
import { useHospitalBranchesStore } from '@/store/hospitalBranchesStore'
import { useHospitalAdminStore } from '@/store/hospitalAdminStore'
import { hospitalAdminService } from '@/services/hospitalAdminService'

export const HospitalDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  // App-level sidebar drawer state
  const { isMobileSidebarOpen, setIsMobileSidebarOpen, isSidebarCollapsed, toggleSidebar } = useHospitalAdminStore()

  // Dedicated public/multi-role store
  const {
    hospitalDetail,
    isLoading,
    error,
    fetchHospitalDetail,
    updateHospitalActiveStatusLocally,
  } = useHospitalDetailStore()

  // Modal store for hospital admin edits
  const {
    setSelectedHospital,
  } = useHospitalBranchesStore()

  const [activeTab, setActiveTab] = useState<HospitalTabKey>('overview')
  const [isTogglingActive, setIsTogglingActive] = useState(false)
  const [selectedDoctorForModal, setSelectedDoctorForModal] = useState<any | null>(null)

  // Fetch hospital detail on component mount or id change
  useEffect(() => {
    if (id) {
      fetchHospitalDetail(id)
    }
  }, [id, fetchHospitalDetail])

  const hospital = hospitalDetail?.hospital
  const stats = hospitalDetail?.stats || {
    totalBeds: hospital?.totalBeds || 200,
    totalDoctors: hospital?.doctorCount || 24,
    totalAppointments: 412,
    totalPatients: 2680,
  }
  const departmentCounts = hospitalDetail?.departmentCounts || []
  const topDoctors = hospitalDetail?.topDoctors || []
  const recentActivities = hospitalDetail?.recentActivities || []

  // Handle Edit Hospital
  const handleEdit = () => {
    if (hospital) {
      setSelectedHospital(hospital)
      navigate(`/hospital-admin/hospitals/${hospital._id}/edit`)
    }
  }

  // Handle Deactivate / Activate
  const handleToggleActive = async () => {
    if (!hospital) return
    const nextState = !hospital.isActive
    const promptMsg = nextState
      ? `Activate ${hospital.name}? It will become available to patients.`
      : `Deactivate ${hospital.name}? It will be hidden from new patient searches.`

    if (!window.confirm(promptMsg)) return

    setIsTogglingActive(true)
    try {
      await hospitalAdminService.toggleHospitalStatus(hospital._id, nextState)
      updateHospitalActiveStatusLocally(nextState)
    } catch {
      // Optimistic local update
      updateHospitalActiveStatusLocally(nextState)
    } finally {
      setIsTogglingActive(false)
    }
  }

  const handleViewOnMap = () => {
    if (!hospital) return
    const address = [
      hospital.address?.street,
      hospital.address?.city,
      hospital.address?.state,
      hospital.address?.zipCode,
    ]
      .filter(Boolean)
      .join(', ')

    window.open(
      `https://maps.google.com/?q=${encodeURIComponent(`${hospital.name}, ${address}`)}`,
      '_blank'
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex selection:bg-blue-100 selection:text-blue-700 antialiased">
      {/* 1. Desktop Persistent Collapsible Sidebar */}
      <div
        className={`hidden lg:block transition-all duration-300 ease-in-out shrink-0 overflow-hidden ${
          isSidebarCollapsed ? 'w-0 opacity-0 -ml-2 pointer-events-none' : 'w-64 opacity-100'
        }`}
      >
        <HospitalAdminSidebar />
      </div>

      {/* 2. Mobile Drawer Sidebar (triggered by hamburger menu) */}
      {isMobileSidebarOpen && (
        <HospitalAdminSidebar
          isMobileDrawer={true}
          onCloseDrawer={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* 3. Main Page Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-10 transition-all duration-300">
        {/* Top Header with Hamburger Mobile Menu toggle */}
        <HospitalAdminHeader onToggleSidebar={toggleSidebar} />

        {/* Content Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5 sm:space-y-6">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center text-center">
              <Loader2 className="size-10 text-blue-600 animate-spin mb-3" />
              <p className="text-sm font-bold text-slate-700">Loading hospital details...</p>
              <p className="text-xs text-slate-400 mt-1">Fetching records & affiliated specialist doctors</p>
            </div>
          ) : error || !hospital ? (
            <div className="bg-white rounded-3xl border border-rose-200 p-8 text-center space-y-3">
              <AlertCircle className="size-10 text-rose-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">Failed to load hospital</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">{error || 'Hospital record not found.'}</p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/hospital-admin/hospitals')}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Back to Hospitals
                </button>
                <button
                  type="button"
                  onClick={() => id && fetchHospitalDetail(id)}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-xs font-bold text-white hover:bg-blue-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="size-3.5" /> Retry
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Header with Breadcrumb and Actions */}
              <HospitalDetailHeader
                hospital={hospital}
                onEdit={handleEdit}
                onToggleActive={handleToggleActive}
                isToggling={isTogglingActive}
              />

              {/* Hero Image Gallery (Left Big, Right 2x2 with +12 Photos) */}
              <HospitalHeroGallery
                coverImage={hospital.images?.coverImage}
                gallery={hospital.images?.gallery}
                hospitalName={hospital.name}
                onOpenGalleryTab={() => setActiveTab('gallery')}
              />

              {/* Identity & Meta Bar with Tabs */}
              <HospitalIdentityBanner
                hospital={hospital}
                totalDoctorsCount={stats.totalDoctors}
                activeTab={activeTab}
                onSelectTab={setActiveTab}
                onViewOnMap={handleViewOnMap}
                onEdit={handleEdit}
                onToggleActive={handleToggleActive}
                isTogglingActive={isTogglingActive}
              />

              {/* 2-Column Responsive Body Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
                {/* Left / Main Column (Cols 8 on Desktop) */}
                <div className="lg:col-span-8 space-y-5 sm:space-y-6">
                  {/* Quick Metric Cards */}
                  <HospitalQuickStats
                    totalBeds={stats.totalBeds}
                    totalDoctors={stats.totalDoctors}
                    totalAppointments={stats.totalAppointments}
                    totalPatients={stats.totalPatients}
                  />

                  {/* Tab Views */}
                  {activeTab === 'overview' && (
                    <HospitalOverviewTab
                      hospital={hospital}
                      topDoctors={topDoctors}
                      recentActivities={recentActivities}
                      onOpenDoctorsTab={() => setActiveTab('doctors')}
                      onOpenDepartmentsTab={() => setActiveTab('departments')}
                      onSelectDoctorProfile={(doc) => setSelectedDoctorForModal(doc)}
                    />
                  )}

                  {activeTab === 'doctors' && (
                    <HospitalDoctorsTab
                      hospitalId={hospital._id}
                      departmentsList={hospital.departments}
                      onSelectDoctorProfile={(doc) => setSelectedDoctorForModal(doc)}
                    />
                  )}

                  {activeTab === 'departments' && (
                    <HospitalDepartmentsTab
                      departments={departmentCounts}
                      onSelectDepartment={() => setActiveTab('doctors')}
                    />
                  )}

                  {activeTab === 'facilities' && (
                    <HospitalFacilitiesTab facilities={hospital.facilities} />
                  )}

                  {activeTab === 'gallery' && (
                    <HospitalGalleryTab
                      coverImage={hospital.images?.coverImage}
                      gallery={hospital.images?.gallery}
                      hospitalName={hospital.name}
                    />
                  )}

                  {activeTab === 'settings' && (
                    <HospitalSettingsTab
                      hospital={hospital}
                      onEdit={handleEdit}
                      onToggleActive={handleToggleActive}
                      isToggling={isTogglingActive}
                    />
                  )}
                </div>

                {/* Right / Sidebar Column (Cols 4 on Desktop) */}
                <div className="lg:col-span-4 sticky top-6">
                  <HospitalContactAddressSidebar
                    hospital={hospital}
                    onOpenFacilitiesTab={() => setActiveTab('facilities')}
                  />
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Edit Hospital Modal */}
      <EditHospitalModal />

      {/* Doctor Profile Detail Modal (fetches real-time DB doctor profile) */}
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
      <HospitalAdminMobileNav />
    </div>
  )
}

export default HospitalDetailPage
