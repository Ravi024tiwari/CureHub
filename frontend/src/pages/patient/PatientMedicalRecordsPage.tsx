import { useEffect, useState, useMemo, useRef, type FC } from 'react'
import {
  UploadCloud,
  Search,
  Filter,
  FileText,
  ChevronDown,
  Check,
  Plus,
  Activity,
  X,
  LayoutGrid,
  List,
  Download,
  Eye,
  Trash2,
  FlaskConical,
  Scan,
  Pill,
  ShieldCheck,
} from 'lucide-react'
import { PatientHeader } from '@/components/patient/PatientHeader'
import { PatientSidebar } from '@/components/patient/PatientSidebar'
import { MobileBottomNav } from '@/components/patient/MobileBottomNav'
import { HealthSummaryCards } from '@/components/patient/records/HealthSummaryCards'
import { MedicalRecordCard } from '@/components/patient/records/MedicalRecordCard'
import { ReportDetailViewerModal } from '@/components/patient/records/ReportDetailViewerModal'
import { UploadReportModal } from '@/components/patient/records/UploadReportModal'
import { EditHealthHistoryModal } from '@/components/patient/records/EditHealthHistoryModal'
import { RecordFiltersDrawer } from '@/components/patient/records/RecordFiltersDrawer'
import { DeleteConfirmModal } from '@/components/patient/records/DeleteConfirmModal'
import {
  usePatientStore,
  type SortOrderOption,
} from '@/store/patientStore'
import { useNavigate } from 'react-router-dom'
import type { MedicalRecordItem } from '@/types/patient'

export const PatientMedicalRecordsPage: FC = () => {
  const navigate = useNavigate()
  const [isSidebarDrawerOpen, setIsSidebarDrawerOpen] = useState(false)
  const [selectedCity, setSelectedCity] = useState('Bilaspur, Chhattisgarh')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeDateFilter, setActiveDateFilter] = useState<'all' | '30days' | '6months' | 'year'>('all')
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false)
  const sortDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const sortOptions: { value: SortOrderOption; label: string }[] = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'name-asc', label: 'File Name (A-Z)' },
    { value: 'name-desc', label: 'File Name (Z-A)' },
  ]

  const {
    records,
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    sortBy,
    setSortBy,
    dateRange,
    setDateRange,
    clearFilters,
    openUploadModal,
    openFilterModal,
    openViewer,
    openDeleteModal,
    fetchMedicalHistory,
    fetchReports,
  } = usePatientStore()

  // Fetch live patient history and reports on mount
  useEffect(() => {
    fetchMedicalHistory()
    fetchReports()
  }, [])

  // Dynamic Category Counts
  const counts = useMemo(() => {
    const total = records.length
    const lab = records.filter(
      (r) =>
        r.category.toLowerCase().includes('lab') ||
        r.title.toLowerCase().includes('blood') ||
        r.title.toLowerCase().includes('test') ||
        r.title.toLowerCase().includes('ecg')
    ).length
    const imaging = records.filter(
      (r) =>
        r.category.toLowerCase().includes('imaging') ||
        r.title.toLowerCase().includes('x-ray') ||
        r.title.toLowerCase().includes('mri') ||
        r.title.toLowerCase().includes('scan') ||
        r.title.toLowerCase().includes('ultrasound')
    ).length
    const prescriptions = records.filter(
      (r) =>
        r.category.toLowerCase().includes('prescription') ||
        r.title.toLowerCase().includes('prescription') ||
        r.title.toLowerCase().includes('rx')
    ).length
    const others = records.filter(
      (r) =>
        !r.category.toLowerCase().includes('lab') &&
        !r.category.toLowerCase().includes('imaging') &&
        !r.category.toLowerCase().includes('prescription') &&
        !r.title.toLowerCase().includes('blood') &&
        !r.title.toLowerCase().includes('x-ray') &&
        !r.title.toLowerCase().includes('mri') &&
        !r.title.toLowerCase().includes('prescription') &&
        !r.title.toLowerCase().includes('rx') &&
        !r.title.toLowerCase().includes('scan') &&
        !r.title.toLowerCase().includes('ultrasound')
    ).length

    return { total, lab, imaging, prescriptions, others }
  }, [records])

  const categoryTabs = [
    { id: 'All Reports', label: `All Reports (${counts.total})` },
    { id: 'Lab Report', label: `Lab Reports (${counts.lab})` },
    { id: 'Imaging', label: `Imaging (${counts.imaging})` },
    { id: 'Prescription', label: `Prescriptions (${counts.prescriptions})` },
    { id: 'Others', label: `Others (${counts.others})` },
  ]

  // Handle Quick Date Chips
  const handleQuickDate = (type: 'all' | '30days' | '6months' | 'year') => {
    setActiveDateFilter(type)
    const now = new Date()
    if (type === 'all') {
      setDateRange({})
    } else if (type === '30days') {
      const from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
      setDateRange({ from })
    } else if (type === '6months') {
      const from = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString()
      setDateRange({ from })
    } else if (type === 'year') {
      const from = `${now.getFullYear()}-01-01`
      setDateRange({ from })
    }
  }

  // Filtered & Sorted Records
  const filteredRecords = useMemo(() => {
    return records
      .filter((rec) => {
        // 1. Category Filter
        if (activeCategory !== 'All Reports') {
          const cat = rec.category.toLowerCase()
          const title = rec.title.toLowerCase()

          if (activeCategory === 'Lab Report') {
            if (
              !cat.includes('lab') &&
              !title.includes('blood') &&
              !title.includes('test') &&
              !title.includes('ecg')
            ) {
              return false
            }
          } else if (activeCategory === 'Imaging') {
            if (
              !cat.includes('imaging') &&
              !title.includes('x-ray') &&
              !title.includes('mri') &&
              !title.includes('scan') &&
              !title.includes('ultrasound')
            ) {
              return false
            }
          } else if (activeCategory === 'Prescription') {
            if (
              !cat.includes('prescription') &&
              !title.includes('prescription') &&
              !title.includes('rx')
            ) {
              return false
            }
          } else if (activeCategory === 'Others') {
            if (
              cat.includes('lab') ||
              cat.includes('imaging') ||
              cat.includes('prescription') ||
              title.includes('blood') ||
              title.includes('x-ray') ||
              title.includes('mri') ||
              title.includes('prescription') ||
              title.includes('rx')
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
          const matchDoc = rec.doctorName?.toLowerCase().includes(q)
          const matchHosp = rec.hospitalName?.toLowerCase().includes(q)
          if (!matchTitle && !matchCat && !matchDoc && !matchHosp) {
            return false
          }
        }

        // 3. Date Range Filter
        if (dateRange.from) {
          const recDate = new Date(rec.uploadedAt).getTime()
          const fromDate = new Date(dateRange.from).getTime()
          if (recDate < fromDate) return false
        }
        if (dateRange.to) {
          const recDate = new Date(rec.uploadedAt).getTime()
          const toDate = new Date(dateRange.to).getTime()
          if (recDate > toDate) return false
        }

        return true
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        }
        if (sortBy === 'oldest') {
          return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
        }
        if (sortBy === 'name-asc') {
          return a.title.localeCompare(b.title)
        }
        if (sortBy === 'name-desc') {
          return b.title.localeCompare(a.title)
        }
        return 0
      })
  }, [records, activeCategory, searchQuery, dateRange, sortBy])

  const hasActiveFilters =
    activeCategory !== 'All Reports' ||
    searchQuery.trim() !== '' ||
    dateRange.from !== undefined ||
    dateRange.to !== undefined ||
    sortBy !== 'newest'

  const handleDownloadFile = (rec: MedicalRecordItem, e: React.MouseEvent) => {
    e.stopPropagation()
    const link = document.createElement('a')
    link.href = rec.fileUrl
    link.download = `${rec.title.replace(/\s+/g, '_')}.${rec.fileType.toLowerCase() || 'pdf'}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getRecordIcon = (category: string) => {
    const c = category.toLowerCase()
    if (c.includes('lab')) return FlaskConical
    if (c.includes('imaging')) return Scan
    if (c.includes('prescription')) return Pill
    return ShieldCheck
  }

  return (
    <div className="min-h-screen bg-[#f8fbff] text-slate-900 selection:bg-blue-100 selection:text-blue-700 flex flex-col antialiased">
      {/* Top Header */}
      <PatientHeader
        searchQuery=""
        onSearchChange={() => {}}
        selectedCity={selectedCity}
        onSelectCity={setSelectedCity}
        onToggleSidebar={() => setIsSidebarDrawerOpen(!isSidebarDrawerOpen)}
      />

      <div className="flex-1 flex w-full">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 shrink-0">
          <PatientSidebar
            activeTab="records"
            onSelectTab={(tab) => {
              if (tab === 'home') navigate('/patient/home')
              if (tab === 'doctors') navigate('/patient/doctors')
              if (tab === 'hospitals') navigate('/patient/hospitals')
              if (tab === 'appointments') navigate('/patient/appointments')
              if (tab === 'records') navigate('/patient/records')
            }}
            onOpenUploadModal={openUploadModal}
          />
        </div>

        {/* Mobile Sidebar Drawer */}
        {isSidebarDrawerOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
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
                onOpenUploadModal={openUploadModal}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6 pb-24 md:pb-10">
          {/* Header Banner matching mockup */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1 rounded-lg bg-blue-100 text-blue-700">
                  <Activity className="size-4" />
                </span>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                  Electronic Health Records (EHR)
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Medical Records
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-xl mt-0.5">
                Manage your health information, reports, and medical history in one place.
              </p>
            </div>

            <button
              onClick={openUploadModal}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-bold rounded-full shadow-md shadow-blue-600/25 transition-all cursor-pointer hover:shadow-lg hover:-translate-y-0.5"
            >
              <UploadCloud className="size-4.5 stroke-[2.2]" />
              <span>Upload Report</span>
            </button>
          </div>

          {/* Health Information Summary Cards */}
          <HealthSummaryCards />

          {/* Modern Interactive Filter Section matching Screenshot 2 */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
            {/* Row 1: Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {categoryTabs.map((tab) => {
                const isActive = activeCategory === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCategory(tab.id)}
                    className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 scale-[1.02]'
                        : 'bg-slate-100/80 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* Row 2: Search, Sort, View Toggle, and Filter Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
              {/* Left: Pill-shaped Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search reports by name, type, doctor..."
                  className="w-full pl-9.5 pr-8 py-2 bg-slate-50/80 hover:bg-slate-50 border border-slate-200/90 rounded-full text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-2xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200/60"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              {/* Right: Sort Pill, View Switcher & Filter Button */}
              <div className="flex items-center gap-2 sm:gap-2.5">
                {/* Custom Interactive Sort Dropdown */}
                <div className="relative" ref={sortDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsSortDropdownOpen((prev) => !prev)}
                    className="flex items-center gap-2 pl-4 pr-3.5 py-2 bg-slate-50/90 hover:bg-slate-100 border border-slate-200/90 hover:border-slate-300 rounded-full text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-2xs hover:shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    <span>{sortOptions.find((o) => o.value === sortBy)?.label || 'Newest First'}</span>
                    <ChevronDown
                      className={`size-3.5 text-slate-400 transition-transform duration-200 ${
                        isSortDropdownOpen ? 'rotate-180 text-blue-600' : ''
                      }`}
                    />
                  </button>

                  {/* Popover Menu */}
                  {isSortDropdownOpen && (
                    <div className="absolute right-0 sm:left-0 sm:right-auto mt-2 w-48 bg-white border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-900/10 p-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Sort Records By
                      </div>
                      <div className="space-y-0.5 mt-0.5">
                        {sortOptions.map((opt) => {
                          const isSelected = sortBy === opt.value
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                setSortBy(opt.value)
                                setIsSortDropdownOpen(false)
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-blue-50 text-blue-700 font-bold'
                                  : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                              }`}
                            >
                              <span>{opt.label}</span>
                              {isSelected && <Check className="size-3.5 text-blue-600 stroke-[2.5]" />}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Circular / Pill Filter Drawer Button */}
                <button
                  onClick={openFilterModal}
                  className={`size-9 sm:size-9.5 rounded-full border flex items-center justify-center transition-all cursor-pointer shadow-2xs ${
                    dateRange.from || dateRange.to
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/25'
                      : 'bg-slate-50/80 hover:bg-slate-100 text-slate-600 border-slate-200/90 hover:text-blue-600'
                  }`}
                  title="Advanced Filters"
                >
                  <Filter className="size-4" />
                </button>

                {/* View Mode Toggle (Grid vs Table List) */}
                <div className="hidden sm:flex items-center bg-slate-100/90 p-0.5 rounded-full border border-slate-200/70">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-full transition-all cursor-pointer ${
                      viewMode === 'grid'
                        ? 'bg-white text-blue-600 shadow-2xs font-bold'
                        : 'text-slate-400 hover:text-slate-700'
                    }`}
                    title="Grid Card View"
                  >
                    <LayoutGrid className="size-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-full transition-all cursor-pointer ${
                      viewMode === 'list'
                        ? 'bg-white text-blue-600 shadow-2xs font-bold'
                        : 'text-slate-400 hover:text-slate-700'
                    }`}
                    title="EHR List View"
                  >
                    <List className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Time Range Filter Chips */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mr-1">
                  Time:
                </span>
                {[
                  { id: 'all', label: 'All Time' },
                  { id: '30days', label: 'Past 30 Days' },
                  { id: '6months', label: 'Past 6 Months' },
                  { id: 'year', label: '2026' },
                ].map((chip) => {
                  const isSel = activeDateFilter === chip.id
                  return (
                    <button
                      key={chip.id}
                      onClick={() => handleQuickDate(chip.id as any)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        isSel
                          ? 'bg-blue-50 text-blue-700 border border-blue-200/80 font-bold'
                          : 'bg-transparent text-slate-500 hover:bg-slate-100/80'
                      }`}
                    >
                      {chip.label}
                    </button>
                  )
                })}
              </div>

              {/* Live Count & Reset indicator */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-semibold">
                  Showing <strong className="text-slate-900">{filteredRecords.length}</strong> of{' '}
                  {records.length} reports
                </span>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                  >
                    Reset all
                  </button>
                )}
              </div>
            </div>

            {/* Active Filter Tags */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {activeCategory !== 'All Reports' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/80">
                    <span>Category: {activeCategory}</span>
                    <button
                      onClick={() => setActiveCategory('All Reports')}
                      className="hover:text-blue-900"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                )}
                {searchQuery.trim() && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/80">
                    <span>Search: "{searchQuery}"</span>
                    <button onClick={() => setSearchQuery('')} className="hover:text-amber-900">
                      <X className="size-3" />
                    </button>
                  </span>
                )}
                {(dateRange.from || dateRange.to) && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200/80">
                    <span>Date Filter Active</span>
                    <button
                      onClick={() => {
                        setDateRange({})
                        setActiveDateFilter('all')
                      }}
                      className="hover:text-purple-900"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Records Display: Grid View or List View */}
          {filteredRecords.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {filteredRecords.map((record) => (
                  <MedicalRecordCard key={record._id} record={record} />
                ))}
              </div>
            ) : (
              /* EHR Table / List View */
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="py-3.5 px-5">Report Document</th>
                        <th className="py-3.5 px-4">Category</th>
                        <th className="py-3.5 px-4">Uploaded Date</th>
                        <th className="py-3.5 px-4">Physician / Facility</th>
                        <th className="py-3.5 px-4">Format & Size</th>
                        <th className="py-3.5 px-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                      {filteredRecords.map((rec) => {
                        const Icon = getRecordIcon(rec.category)
                        const dStr = new Date(rec.uploadedAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })

                        return (
                          <tr
                            key={rec._id}
                            onClick={() => openViewer(rec)}
                            className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                          >
                            <td className="py-3.5 px-5">
                              <div className="flex items-center gap-3">
                                <div className="size-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                                  <Icon className="size-4.5" />
                                </div>
                                <div>
                                  <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors block text-xs sm:text-sm">
                                    {rec.title}
                                  </span>
                                  {rec.notes && (
                                    <span className="text-[11px] text-slate-400 line-clamp-1">
                                      {rec.notes}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                                {rec.category}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 text-slate-500 font-semibold">{dStr}</td>

                            <td className="py-3.5 px-4 text-slate-600">
                              {rec.doctorName || rec.hospitalName || 'Verified Medical Centre'}
                            </td>

                            <td className="py-3.5 px-4 text-slate-500">
                              {rec.fileType.toUpperCase()} • {rec.fileSize || '1.2 MB'}
                            </td>

                            <td className="py-3.5 px-5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    openViewer(rec)
                                  }}
                                  className="p-1.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-xl transition-all cursor-pointer"
                                  title="View Report"
                                >
                                  <Eye className="size-4" />
                                </button>
                                <button
                                  onClick={(e) => handleDownloadFile(rec, e)}
                                  className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-xl transition-all cursor-pointer"
                                  title="Download"
                                >
                                  <Download className="size-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    openDeleteModal(rec)
                                  }}
                                  className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 className="size-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-xs">
              <div className="size-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
                <FileText className="size-8" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-1">
                No medical reports found
              </h3>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                {searchQuery
                  ? `No reports matching "${searchQuery}" in ${activeCategory}. Try adjusting your keywords.`
                  : 'Start building your secure digital health record by uploading your diagnostic reports and prescriptions.'}
              </p>
              <div className="flex items-center justify-center gap-3">
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-bold transition-all cursor-pointer"
                  >
                    Clear Filters
                  </button>
                )}
                <button
                  onClick={openUploadModal}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition-all shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  <Plus className="size-4" />
                  <span>Upload First Report</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeTab="records"
        onSelectTab={(tab) => {
          if (tab === 'home') navigate('/patient/home')
          if (tab === 'doctors') navigate('/patient/doctors')
          if (tab === 'hospitals') navigate('/patient/hospitals')
          if (tab === 'appointments') navigate('/patient/appointments')
          if (tab === 'records') navigate('/patient/records')
        }}
      />

      {/* Modals & Overlays */}
      <ReportDetailViewerModal />
      <UploadReportModal />
      <EditHealthHistoryModal />
      <RecordFiltersDrawer />
      <DeleteConfirmModal />
    </div>
  )
}
