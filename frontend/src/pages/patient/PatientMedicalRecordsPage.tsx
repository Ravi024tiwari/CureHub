import { useEffect, useState, useMemo, type FC } from 'react'
import {
  Search,
  X,
  ChevronDown,
  RotateCcw,
  FileText,
  Plus,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PatientHeader } from '@/components/patient/PatientHeader'
import { PatientSidebar } from '@/components/patient/PatientSidebar'
import { MobileBottomNav } from '@/components/patient/MobileBottomNav'
import { ReportKpis } from '@/components/patient/records/ReportKpis'
import { MedicalRecordCard } from '@/components/patient/records/MedicalRecordCard'
import { ReportDetailPanel } from '@/components/patient/records/ReportDetailPanel'
import { ReportDetailViewerModal } from '@/components/patient/records/ReportDetailViewerModal'
import { UploadReportModal } from '@/components/patient/records/UploadReportModal'
import { DeleteConfirmModal } from '@/components/patient/records/DeleteConfirmModal'
import { usePatientStore } from '@/store/patientStore'

export const PatientMedicalRecordsPage: FC = () => {
  const navigate = useNavigate()
  const [isSidebarDrawerOpen, setIsSidebarDrawerOpen] = useState(false)
  const [selectedCity, setSelectedCity] = useState('All Cities')

  // Filter States matching mockup
  const [selectedDateRange, setSelectedDateRange] = useState('All Time')
  const [selectedReportType, setSelectedReportType] = useState('All Types')
  const [selectedHospital, setSelectedHospital] = useState('All Hospitals')
  const [selectedDoctor, setSelectedDoctor] = useState('All Doctors')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)

  const {
    records,
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    selectedRecord,
    setSelectedRecord,
    openUploadModal,
    loadPatientInitialData,
  } = usePatientStore()

  // Fetch real patient records on mount
  useEffect(() => {
    loadPatientInitialData()
  }, [])

  // Dynamic Category Tabs matching mockup
  const categoryTabs = [
    { id: 'All Reports', label: 'All Reports' },
    { id: 'Lab Reports', label: 'Lab Reports' },
    { id: 'Imaging Reports', label: 'Imaging Reports' },
    { id: 'Prescriptions', label: 'Prescriptions' },
    { id: 'Discharge Summaries', label: 'Discharge Summaries' },
    { id: 'Other Documents', label: 'Other Documents' },
  ]

  // Unique Hospitals & Doctors for dynamic filter dropdowns
  const uniqueHospitals = useMemo(() => {
    const set = new Set<string>()
    records.forEach((r) => {
      if (r.hospitalName) set.add(r.hospitalName)
    })
    return Array.from(set)
  }, [records])

  const uniqueDoctors = useMemo(() => {
    const set = new Set<string>()
    records.forEach((r) => {
      if (r.doctorName) set.add(r.doctorName)
    })
    return Array.from(set)
  }, [records])

  // Filtered Records based on all active criteria
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      // 1. Category Tab Filter
      if (activeCategory !== 'All Reports') {
        const cat = rec.category.toLowerCase()
        const title = rec.title.toLowerCase()

        if (activeCategory === 'Lab Reports') {
          if (
            !cat.includes('lab') &&
            !title.includes('blood') &&
            !title.includes('test') &&
            !title.includes('lipid') &&
            !title.includes('sugar') &&
            !title.includes('thyroid') &&
            !title.includes('ecg')
          ) {
            return false
          }
        } else if (activeCategory === 'Imaging Reports') {
          if (
            !cat.includes('imaging') &&
            !title.includes('x-ray') &&
            !title.includes('mri') &&
            !title.includes('scan') &&
            !title.includes('ultrasound')
          ) {
            return false
          }
        } else if (activeCategory === 'Prescriptions') {
          if (
            !cat.includes('prescription') &&
            !title.includes('prescription') &&
            !title.includes('rx')
          ) {
            return false
          }
        } else if (activeCategory === 'Discharge Summaries') {
          if (!cat.includes('discharge') && !title.includes('discharge')) {
            return false
          }
        } else if (activeCategory === 'Other Documents') {
          if (
            cat.includes('lab') ||
            cat.includes('imaging') ||
            cat.includes('prescription') ||
            cat.includes('discharge') ||
            title.includes('blood') ||
            title.includes('x-ray') ||
            title.includes('mri') ||
            title.includes('scan') ||
            title.includes('ultrasound') ||
            title.includes('prescription')
          ) {
            return false
          }
        }
      }

      // 2. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchTitle = rec.title.toLowerCase().includes(q)
        const matchCat = rec.category.toLowerCase().includes(q)
        const matchDoc = (rec.doctorName || '').toLowerCase().includes(q)
        const matchHosp = (rec.hospitalName || '').toLowerCase().includes(q)
        if (!matchTitle && !matchCat && !matchDoc && !matchHosp) {
          return false
        }
      }

      // 3. Date Range Filter
      if (selectedDateRange !== 'All Time') {
        const recTime = new Date(rec.uploadedAt).getTime()
        const now = Date.now()
        if (selectedDateRange === 'Last 30 Days' && now - recTime > 30 * 24 * 60 * 60 * 1000) {
          return false
        }
        if (selectedDateRange === 'Last 6 Months' && now - recTime > 180 * 24 * 60 * 60 * 1000) {
          return false
        }
        if (selectedDateRange === 'This Year') {
          const recYear = new Date(rec.uploadedAt).getFullYear()
          const currentYear = new Date().getFullYear()
          if (recYear !== currentYear) return false
        }
      }

      // 4. Report Type Filter
      if (selectedReportType !== 'All Types') {
        const fType = rec.fileType.toLowerCase()
        if (selectedReportType === 'PDF' && !fType.includes('pdf')) return false
        if (selectedReportType === 'Image' && (fType.includes('pdf') || !fType)) return false
      }

      // 5. Hospital Filter
      if (selectedHospital !== 'All Hospitals') {
        if (rec.hospitalName !== selectedHospital) return false
      }

      // 6. Doctor Filter
      if (selectedDoctor !== 'All Doctors') {
        if (rec.doctorName !== selectedDoctor) return false
      }

      return true
    })
  }, [
    records,
    activeCategory,
    searchQuery,
    selectedDateRange,
    selectedReportType,
    selectedHospital,
    selectedDoctor,
  ])

  // Pagination calculation
  const totalReportsCount = filteredRecords.length
  const totalPages = Math.ceil(totalReportsCount / itemsPerPage) || 1
  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredRecords.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredRecords, currentPage, itemsPerPage])

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('')
    setActiveCategory('All Reports')
    setSelectedDateRange('All Time')
    setSelectedReportType('All Types')
    setSelectedHospital('All Hospitals')
    setSelectedDoctor('All Doctors')
    setCurrentPage(1)
  }

  const hasActiveFilters =
    activeCategory !== 'All Reports' ||
    searchQuery.trim() !== '' ||
    selectedDateRange !== 'All Time' ||
    selectedReportType !== 'All Types' ||
    selectedHospital !== 'All Hospitals' ||
    selectedDoctor !== 'All Doctors'

  return (
    <div className="min-h-screen bg-[#f8fbff] text-slate-900 selection:bg-blue-100 selection:text-blue-700 flex flex-col antialiased">
      {/* Top Header */}
      <PatientHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCity={selectedCity}
        onSelectCity={setSelectedCity}
        onToggleSidebar={() => setIsSidebarDrawerOpen(!isSidebarDrawerOpen)}
      />

      <div className="flex-1 flex w-full">
        {/* Collapsible Slide-out Sidebar Drawer for All Screen Sizes */}
        {isSidebarDrawerOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
              onClick={() => setIsSidebarDrawerOpen(false)}
            />
            <div className="relative z-10 animate-in slide-in-from-left duration-200">
              <PatientSidebar
                activeTab="records"
                isMobileDrawer={true}
                onCloseDrawer={() => setIsSidebarDrawerOpen(false)}
                onSelectTab={(tab) => {
                  setIsSidebarDrawerOpen(false)
                  if (tab === 'home') navigate('/patient/home')
                  if (tab === 'doctors') navigate('/patient/doctors')
                  if (tab === 'hospitals') navigate('/patient/hospitals')
                  if (tab === 'appointments') navigate('/patient/appointments')
                  if (tab === 'records') navigate('/patient/records')
                }}
                onOpenUploadModal={() => {
                  setIsSidebarDrawerOpen(false)
                  openUploadModal()
                }}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 2xl:p-10 space-y-6 pb-24 md:pb-12 max-w-[1720px] mx-auto w-full">
          {/* Header Title & Upload Action Bar matching mockup */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                My Medical Reports
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-xl mt-0.5">
                View, manage and securely access all your medical reports in one place.
              </p>
            </div>

            <button
              type="button"
              onClick={openUploadModal}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-blue-600/25 transition-all cursor-pointer hover:shadow-lg hover:-translate-y-0.5 shrink-0"
            >
              <Plus className="size-4 stroke-[2.5]" />
              <span>Upload Report</span>
            </button>
          </div>

          {/* 4 KPI Metric Cards matching mockup */}
          <ReportKpis records={records} />

          {/* Category Tabs & Multi-Dropdown Filter Bar Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
            {/* Category Navigation Tabs */}
            <div className="border-b border-slate-200/80">
              <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-0.5 scrollbar-none">
                {categoryTabs.map((tab) => {
                  const isActive = activeCategory === tab.id
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveCategory(tab.id)
                        setCurrentPage(1)
                      }}
                      className={`pb-3 text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer border-b-2 relative ${
                        isActive
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Filter Controls Row: Search + 4 Select Dropdowns + Reset */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-1">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[240px]">
                <Search className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                  placeholder="Search reports by name, hospital, doctor..."
                  className="w-full pl-9.5 pr-8 py-2 bg-slate-50 border border-slate-200/90 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              {/* 4 Filter Dropdowns & Reset */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
                {/* Date Range Dropdown */}
                <div className="relative shrink-0">
                  <select
                    value={selectedDateRange}
                    onChange={(e) => {
                      setSelectedDateRange(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="appearance-none pl-3 pr-8 py-2 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:border-blue-500"
                  >
                    <option value="All Time">All Time</option>
                    <option value="Last 30 Days">Last 30 Days</option>
                    <option value="Last 6 Months">Last 6 Months</option>
                    <option value="This Year">This Year</option>
                  </select>
                  <ChevronDown className="size-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Report Type Dropdown */}
                <div className="relative shrink-0">
                  <select
                    value={selectedReportType}
                    onChange={(e) => {
                      setSelectedReportType(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="appearance-none pl-3 pr-8 py-2 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:border-blue-500"
                  >
                    <option value="All Types">All Types</option>
                    <option value="PDF">PDF</option>
                    <option value="Image">Image / Scan</option>
                  </select>
                  <ChevronDown className="size-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Hospital Dropdown */}
                <div className="relative shrink-0">
                  <select
                    value={selectedHospital}
                    onChange={(e) => {
                      setSelectedHospital(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="appearance-none pl-3 pr-8 py-2 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:border-blue-500 max-w-[140px] truncate"
                  >
                    <option value="All Hospitals">All Hospitals</option>
                    {uniqueHospitals.map((hosp) => (
                      <option key={hosp} value={hosp}>
                        {hosp}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="size-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Doctor Dropdown */}
                <div className="relative shrink-0">
                  <select
                    value={selectedDoctor}
                    onChange={(e) => {
                      setSelectedDoctor(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="appearance-none pl-3 pr-8 py-2 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:border-blue-500 max-w-[140px] truncate"
                  >
                    <option value="All Doctors">All Doctors</option>
                    {uniqueDoctors.map((doc) => (
                      <option key={doc} value={doc}>
                        {doc}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="size-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Reset Button */}
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                  title="Reset all filters"
                >
                  <RotateCcw className="size-3" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Layout: Split Grid & Report Details Panel */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* Left Column: Report Cards Grid */}
            <div
              className={`${
                selectedRecord ? 'xl:col-span-8 2xl:col-span-8' : 'xl:col-span-12'
              } space-y-6`}
            >
              {filteredRecords.length > 0 ? (
                <>
                  <div
                    className={`grid gap-4 sm:gap-5 ${
                      selectedRecord
                        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                    }`}
                  >
                    {paginatedRecords.map((record) => (
                      <MedicalRecordCard
                        key={record._id}
                        record={record}
                        isSelected={selectedRecord?._id === record._id}
                        onSelect={(rec) => setSelectedRecord(rec)}
                      />
                    ))}
                  </div>

                  {/* Pagination Footer matching mockup */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200/80">
                    <span className="text-xs text-slate-500 font-medium">
                      Showing{' '}
                      <strong className="text-slate-900">
                        {totalReportsCount > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
                      </strong>{' '}
                      to{' '}
                      <strong className="text-slate-900">
                        {Math.min(currentPage * itemsPerPage, totalReportsCount)}
                      </strong>{' '}
                      of <strong className="text-slate-900">{totalReportsCount}</strong> reports
                    </span>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage <= 1}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                      >
                        ‹
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setCurrentPage(pageNum)}
                          className={`size-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}

                      <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage >= totalPages}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                      >
                        ›
                      </button>

                      {/* Items Per Page Select */}
                      <div className="relative ml-2">
                        <select
                          value={itemsPerPage}
                          onChange={(e) => {
                            setItemsPerPage(Number(e.target.value))
                            setCurrentPage(1)
                          }}
                          className="appearance-none pl-2.5 pr-7 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
                        >
                          <option value={8}>8 per page</option>
                          <option value={12}>12 per page</option>
                          <option value={24}>24 per page</option>
                        </select>
                        <ChevronDown className="size-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* Empty State */
                <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-xs space-y-4">
                  <div className="size-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
                    <FileText className="size-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 mb-1">
                      No medical reports found
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                      {hasActiveFilters
                        ? 'No reports matching your selected filter criteria. Try adjusting your search keywords.'
                        : 'Start building your secure digital health record by uploading your diagnostic reports and prescriptions.'}
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Clear Filters
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={openUploadModal}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 cursor-pointer"
                    >
                      <Plus className="size-4" />
                      <span>Upload Report</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Desktop Report Details Side Panel (xl and above) */}
            {selectedRecord && (
              <div className="hidden xl:block xl:col-span-4 2xl:col-span-4 sticky top-6">
                <ReportDetailPanel
                  record={selectedRecord}
                  onClose={() => setSelectedRecord(null)}
                />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Mobile Sticky Bottom Navigation */}
      <MobileBottomNav
        activeTab="records"
        onSelectTab={(tab) => {
          if (tab === 'home') navigate('/patient/home')
          else if (tab === 'doctors') navigate('/patient/doctors')
          else if (tab === 'hospitals') navigate('/patient/hospitals')
          else if (tab === 'records') navigate('/patient/records')
          else if (tab === 'profile') setIsSidebarDrawerOpen(true)
        }}
      />

      {/* Mobile Report Details Bottom Sheet / Modal (Screen size < xl) */}
      {selectedRecord && (
        <div className="xl:hidden fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setSelectedRecord(null)}
          />
          <div className="relative z-10 w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <ReportDetailPanel
              record={selectedRecord}
              onClose={() => setSelectedRecord(null)}
              isMobileModal={true}
            />
          </div>
        </div>
      )}

      {/* Interactive Modals */}
      <UploadReportModal />
      <DeleteConfirmModal />
      <ReportDetailViewerModal />
    </div>
  )
}

export default PatientMedicalRecordsPage
