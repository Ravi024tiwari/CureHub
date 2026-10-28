import { type FC } from 'react'
import { Link } from 'react-router-dom'
import {
  Stethoscope,
  Star,
  IndianRupee,
  Building2,
  ChevronRight,
  ShieldCheck,
  UserX,
  UserPlus,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import { useHospitalAdminDoctorsStore } from '@/store/hospitalAdminDoctorsStore'
import { DoctorAvatar } from '@/components/hospital-admin/join-requests/JoinRequestsTable'

export const HospitalDoctorsGrid: FC = () => {
  const {
    doctors,
    isLoading,
    searchQuery,
    selectedDepartment,
    selectedHospitalId,
    fetchDoctors,
    resetFilters,
    openDisaffiliateModal,
    setSelectedDoctorForModal,
  } = useHospitalAdminDoctorsStore()

  const isFiltersActive =
    searchQuery !== '' || selectedHospitalId !== 'all' || selectedDepartment !== 'ALL'

  // Loading Skeleton
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs animate-pulse space-y-4"
          >
            <div className="flex items-start gap-3.5">
              <div className="size-14 rounded-2xl bg-slate-200 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
                <div className="h-3 bg-slate-100 rounded w-2/3" />
              </div>
            </div>
            <div className="h-10 bg-slate-100 rounded-xl" />
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="h-4 bg-slate-200 rounded w-20" />
              <div className="h-8 bg-slate-200 rounded-xl w-24" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Empty State
  if (doctors.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-14 text-center max-w-xl mx-auto space-y-4 shadow-xs">
        <div className="size-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-sm ring-8 ring-blue-50/50">
          <Stethoscope className="size-8" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            {isFiltersActive ? 'No Doctors Match Filters' : 'No Affiliated Doctors Yet'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            {isFiltersActive
              ? 'No specialist doctors match your search keywords or branch filters. Try resetting the filters to view all staff.'
              : 'Doctors who apply and get approved to join your registered hospital branches will appear here in your active clinical directory.'}
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          {isFiltersActive ? (
            <button
              type="button"
              onClick={resetFilters}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              Reset Filters
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => fetchDoctors()}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="size-3.5" />
                <span>Refresh</span>
              </button>

              <Link
                to="/hospital-admin/join-requests"
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="size-3.5" />
                <span>Review Join Requests</span>
              </Link>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5">
      {doctors.map((doc) => {
        const doctorName = doc.userId?.name || 'Dr. Specialist'
        const avatarUrl = doc.userId?.avatar
        const hospitalName = doc.hospitalId?.name || 'Hospital Branch'
        const expYears = doc.experienceYears || 5
        const fee = doc.consultationFee || 650
        const rating = doc.ratingAverage || 4.8
        const reviewCount = doc.reviewCount || 42
        const dept = doc.department || 'General Medicine'

        return (
          <div
            key={doc._id}
            className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-blue-200 transition-all flex flex-col justify-between group space-y-4"
          >
            <div className="space-y-3.5">
              {/* Top Row: Avatar + Name + Rating */}
              <div className="flex items-start gap-3.5">
                <DoctorAvatar
                  name={doctorName}
                  avatarUrl={avatarUrl}
                  size="md"
                  className="size-14 rounded-2xl group-hover:scale-105 transition-transform"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1.5">
                    <h3 className="font-black text-sm sm:text-base text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                      {doctorName}
                    </h3>

                    {/* Rating Pill */}
                    <div className="flex items-center gap-1 text-xs font-black text-slate-800 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/60 shrink-0">
                      <Star className="size-3.5 fill-amber-400 text-amber-500" />
                      <span>{rating.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Department & Specialty */}
                  <p className="text-xs font-bold text-blue-600 truncate mt-0.5">
                    {dept}
                  </p>

                  {/* Hospital Branch Chip */}
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 mt-1 truncate">
                    <Building2 className="size-3 text-slate-400 shrink-0" />
                    <span className="truncate">{hospitalName}</span>
                  </div>
                </div>
              </div>

              {/* Specialization Tags */}
              {doc.specialization && doc.specialization.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {doc.specialization.slice(0, 2).map((spec, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2.5 py-0.5 rounded-lg bg-slate-50 text-slate-600 border border-slate-200/70 text-[10px] font-bold"
                    >
                      {spec}
                    </span>
                  ))}
                  {doc.specialization.length > 2 && (
                    <span className="px-2 py-0.5 rounded-lg bg-slate-50 text-slate-400 text-[10px] font-bold">
                      +{doc.specialization.length - 2}
                    </span>
                  )}
                </div>
              )}

              {/* Credential Metrics Bar */}
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-2xl bg-slate-50/70 border border-slate-100 text-[11px]">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Experience
                  </span>
                  <span className="font-extrabold text-slate-800 flex items-center gap-1">
                    <Sparkles className="size-3 text-blue-500" />
                    <span>{expYears}+ Years</span>
                  </span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    OPD Visit Fee
                  </span>
                  <span className="font-extrabold text-slate-800 flex items-center gap-0.5">
                    <IndianRupee className="size-3 text-slate-400" />
                    <span>₹{fee}</span>
                  </span>
                </div>
              </div>

              {/* Medical Council Registration Number */}
              {doc.medicalCouncilRegistrationNumber && (
                <div className="text-[10px] font-mono text-slate-400 font-semibold flex items-center gap-1 truncate">
                  <ShieldCheck className="size-3 text-teal-600 shrink-0" />
                  <span className="truncate">Reg: {doc.medicalCouncilRegistrationNumber}</span>
                </div>
              )}
            </div>

            {/* Bottom Actions Bar */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => openDisaffiliateModal(doc)}
                className="p-2 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1"
                title="Remove Doctor from Hospital"
              >
                <UserX className="size-3.5" />
                <span className="text-[11px] hidden sm:inline">Remove</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedDoctorForModal(doc)}
                className="flex-1 py-2 px-3 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-600 text-blue-700 hover:text-white text-xs font-black transition-all shadow-2xs cursor-pointer flex items-center justify-center gap-1.5 active:scale-98"
              >
                <span>View Full Profile</span>
                <ChevronRight className="size-3.5" />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default HospitalDoctorsGrid
