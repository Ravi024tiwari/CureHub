import { useState, type FC, type FormEvent } from 'react'
import {
  Search,
  Stethoscope,
  Star,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react'
import { useHospitalDetailStore } from '@/store/hospitalDetailStore'

// Fallback avatars
import drAmitImg from '@/assets/dr-amit-singh.jpg'
import drNehaImg from '@/assets/dr-sneha-patel.jpg'
import drRajeshImg from '@/assets/dr-rajesh-verma.jpg'
import drPriyaImg from '@/assets/dr-priya-sharma.jpg'

import { HospitalDoctorDetailModal } from './HospitalDoctorDetailModal'
import { DoctorAvatar } from '@/components/hospital-admin/join-requests/JoinRequestsTable'

interface HospitalDoctorsTabProps {
  hospitalId: string
  departmentsList?: string[]
  onSelectDoctorProfile?: (doc: any) => void
}

export const HospitalDoctorsTab: FC<HospitalDoctorsTabProps> = ({
  hospitalId,
  departmentsList = [],
  onSelectDoctorProfile,
}) => {
  const [selectedDoctorForModal, setSelectedDoctorForModal] = useState<any | null>(null)
  // Read state and actions directly from the dedicated hospital store
  const {
    doctors,
    doctorsPagination,
    isDoctorsLoading,
    doctorsError,
    selectedDepartment,
    doctorSearchQuery,
    currentDoctorPage,
    setSelectedDepartment,
    setDoctorSearchQuery,
    setCurrentDoctorPage,
    fetchHospitalDoctors,
  } = useHospitalDetailStore()

  const [localSearch, setLocalSearch] = useState(doctorSearchQuery)

  // Department filter list
  const allDepts = [
    'All',
    ...(departmentsList.length > 0
      ? departmentsList
      : ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'General Medicine', 'Dermatology']),
  ]

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault()
    setDoctorSearchQuery(localSearch)
    fetchHospitalDoctors(hospitalId, 1, selectedDepartment, localSearch)
  }

  const handleSelectDepartment = (dept: string) => {
    setSelectedDepartment(dept)
  }

  const handlePageChange = (newPage: number) => {
    setCurrentDoctorPage(newPage)
  }

  return (
    <div className="space-y-6">
      {/* 1. Filter Bar & Search */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search doctor by name, specialty, or qualification..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </form>

          {/* Doctors Count Indicator */}
          <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5 self-end sm:self-auto">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span>
              Showing {doctors.length} of {doctorsPagination.totalDocs || doctors.length} doctors (10 per page)
            </span>
          </div>
        </div>

        {/* Department Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          {allDepts.map((dept) => {
            const isSelected = selectedDepartment === dept
            return (
              <button
                key={dept}
                type="button"
                onClick={() => handleSelectDepartment(dept)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100/80 hover:bg-slate-200/80 text-slate-600'
                }`}
              >
                {dept}
              </button>
            )
          })}
        </div>
      </div>

      {/* Error alert if any */}
      {doctorsError && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0 text-amber-600" />
          <span>{doctorsError}</span>
        </div>
      )}

      {/* 2. Doctors Grid */}
      {isDoctorsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex items-center gap-4 animate-pulse"
            >
              <div className="size-16 rounded-2xl bg-slate-200 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded-md w-3/4" />
                <div className="h-3 bg-slate-100 rounded-md w-1/2" />
                <div className="h-3 bg-slate-100 rounded-md w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : doctors.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-xs space-y-3">
          <div className="size-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Stethoscope className="size-6" />
          </div>
          <h4 className="text-base font-black text-slate-900">No doctors found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No doctors match the selected department or search filter. Try resetting your search or choosing another department.
          </p>
          <button
            type="button"
            onClick={() => {
              setLocalSearch('')
              setDoctorSearchQuery('')
              setSelectedDepartment('All')
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {doctors.map((doc, idx) => {
            const avatar = doc.userId.avatar || [drAmitImg, drNehaImg, drRajeshImg, drPriyaImg][idx % 4]
            return (
              <div
                key={doc._id}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-blue-200 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Doctor Info Header */}
                  <div className="flex items-start gap-3.5">
                    <DoctorAvatar
                      name={doc.userId.name}
                      avatarUrl={avatar}
                      size="md"
                      className="size-14 sm:size-16 group-hover:scale-105 transition-transform"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                          {doc.userId.name}
                        </h4>
                        <div className="flex items-center gap-1 text-xs font-black text-slate-800 shrink-0 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/60">
                          <Star className="size-3.5 fill-amber-400 text-amber-400" />
                          <span>{doc.ratingAverage ? doc.ratingAverage.toFixed(1) : '4.8'}</span>
                        </div>
                      </div>

                      <p className="text-xs font-bold text-blue-600 truncate mt-0.5">
                        {doc.department}
                      </p>

                      <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 mt-1 flex-wrap">
                        <span>{doc.experienceYears}+ Years Exp</span>
                        <span className="text-slate-300">•</span>
                        <span>Fee: ₹{doc.consultationFee || 500}</span>
                      </div>
                    </div>
                  </div>

                  {/* Specialization Tags */}
                  {doc.specialization && doc.specialization.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3.5 pt-3 border-t border-slate-100">
                      {doc.specialization.map((spec, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2.5 py-0.5 rounded-lg bg-slate-50 text-slate-600 border border-slate-200/60 text-[10px] font-bold"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono font-semibold text-slate-400 truncate">
                    {doc.medicalCouncilRegistrationNumber ? `Reg: ${doc.medicalCouncilRegistrationNumber}` : 'Affiliated Specialist'}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectDoctorProfile) {
                        onSelectDoctorProfile(doc)
                      } else {
                        setSelectedDoctorForModal(doc)
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 3. Interactive Pagination (10 Doctors per batch) */}
      {doctorsPagination.totalPages > 1 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between gap-4 flex-wrap">
          <div className="text-xs font-bold text-slate-500">
            Page {doctorsPagination.currentPage} of {doctorsPagination.totalPages}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={doctorsPagination.currentPage <= 1 || isDoctorsLoading}
              onClick={() => handlePageChange(Math.max(1, currentDoctorPage - 1))}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shadow-2xs"
              title="Previous Page"
            >
              <ChevronLeft className="size-4" />
            </button>

            {[...Array(doctorsPagination.totalPages)].map((_, i) => {
              const pageNum = i + 1
              const isActive = doctorsPagination.currentPage === pageNum
              return (
                <button
                  key={pageNum}
                  type="button"
                  disabled={isDoctorsLoading}
                  onClick={() => handlePageChange(pageNum)}
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
              disabled={doctorsPagination.currentPage >= doctorsPagination.totalPages || isDoctorsLoading}
              onClick={() => handlePageChange(Math.min(doctorsPagination.totalPages, currentDoctorPage + 1))}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shadow-2xs"
              title="Next Page"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* Doctor Profile Detail Modal (fetches full live data from DB) */}
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
    </div>
  )
}
