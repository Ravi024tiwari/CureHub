import { useState, type FC } from 'react'
import {
  MapPin,
  Star,
  BedDouble,
  Users,
  Calendar,
  Heart,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react'
import type { HospitalBranchItem } from '@/types/hospitalAdmin'
import { useHospitalBranchesStore } from '@/store/hospitalBranchesStore'

// Fallback images matching mockup assets
import apolloImg from '@/assets/apollo-hospital.jpg'
import cityCareImg from '@/assets/city-care-hospital.jpg'
import shreeSaiImg from '@/assets/shree-sai-hospital.jpg'
import lifecareImg from '@/assets/lifecare-hospital.jpg'

interface HospitalCardProps {
  hospital: HospitalBranchItem
  index?: number
}

export const HospitalCard: FC<HospitalCardProps> = ({ hospital, index = 0 }) => {
  const {
    favorites,
    toggleFavorite,
    setSelectedHospital,
    setIsDetailsModalOpen,
    setIsEditModalOpen,
  } = useHospitalBranchesStore()

  const [imgError, setImgError] = useState(false)

  const isFav = Boolean(favorites[hospital._id])

  // Smart fallback image selection matching mockup
  const getCoverImage = () => {
    if (!imgError && hospital.images?.coverImage) {
      return hospital.images.coverImage
    }
    const name = hospital.name.toLowerCase()
    if (name.includes('apollo')) return apolloImg
    if (name.includes('city') || name.includes('care')) return cityCareImg
    if (name.includes('sai')) return shreeSaiImg
    return [apolloImg, cityCareImg, shreeSaiImg, lifecareImg][index % 4]
  }

  // Address line
  const addressLine = [
    hospital.address?.street,
    hospital.address?.city,
    hospital.address?.state,
  ]
    .filter(Boolean)
    .join(', ')

  // Facilities display with "+N more" badge
  const facilities = hospital.facilities || [
    '24x7 Emergency',
    'Pharmacy',
    'Lab',
    'Ambulance',
  ]
  const visibleFacilities = facilities.slice(0, 4)
  const remainingFacilities = facilities.length - visibleFacilities.length

  const handleOpenDetails = () => {
    setSelectedHospital(hospital)
    setIsDetailsModalOpen(true)
  }

  const handleOpenManage = () => {
    setSelectedHospital(hospital)
    setIsEditModalOpen(true)
  }

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
      {/* 1. Cover Image Section */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100">
        <img
          src={getCoverImage()}
          alt={hospital.name}
          onError={() => setImgError(true)}
          className="size-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />

        {/* Verification Status Badge (Top-Left) */}
        <div className="absolute top-3 left-3 z-10">
          {hospital.verificationStatus === 'APPROVED' ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/90 text-white backdrop-blur-md shadow-sm flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5" />
              <span>Verified</span>
            </span>
          ) : hospital.verificationStatus === 'PENDING' ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/90 text-white backdrop-blur-md shadow-sm flex items-center gap-1.5">
              <Clock className="size-3.5" />
              <span>Pending</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/90 text-white backdrop-blur-md shadow-sm flex items-center gap-1.5">
              <XCircle className="size-3.5" />
              <span>Rejected</span>
            </span>
          )}
        </div>

        {/* Heart / Favorite Button (Top-Right) */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggleFavorite(hospital._id)
          }}
          className={`absolute top-3 right-3 z-10 size-8 rounded-full flex items-center justify-center backdrop-blur-md transition-transform active:scale-90 cursor-pointer ${
            isFav
              ? 'bg-rose-500 text-white shadow-sm'
              : 'bg-white/90 text-slate-600 hover:text-rose-500 hover:bg-white shadow-2xs'
          }`}
          title={isFav ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`size-4 ${isFav ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* 2. Card Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Hospital Name */}
          <h3
            onClick={handleOpenDetails}
            className="text-base sm:text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 cursor-pointer tracking-tight"
          >
            {hospital.name}
          </h3>

          {/* Rating & Hospital Type */}
          <div className="flex items-center justify-between gap-2 mt-1.5 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="flex items-center gap-1 text-amber-500 font-black">
                <Star className="size-3.5 fill-current" />
                <span>{hospital.rating ? hospital.rating.toFixed(1) : '4.8'}</span>
              </span>
              <span className="text-slate-400 font-medium">
                ({(hospital.reviewCount || 860).toLocaleString()} reviews)
              </span>
            </div>

            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
              {hospital.hospitalType || 'Multi-Speciality'}
            </span>
          </div>

          {/* Location Address */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
            <MapPin className="size-3.5 text-slate-400 shrink-0" />
            <span className="truncate font-medium">{addressLine || 'Bilaspur, Chhattisgarh'}</span>
          </div>

          {/* 3 Capacity Metrics Grid */}
          <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 my-3 text-center">
            {/* Beds */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-slate-500 text-xs font-semibold">
                <BedDouble className="size-3.5 text-blue-600" />
                <span className="font-black text-slate-900 text-sm">
                  {hospital.totalBeds || 120}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                Beds
              </span>
            </div>

            {/* Doctors */}
            <div className="flex flex-col items-center border-x border-slate-100">
              <div className="flex items-center gap-1 text-slate-500 text-xs font-semibold">
                <Users className="size-3.5 text-emerald-600" />
                <span className="font-black text-slate-900 text-sm">
                  {hospital.doctorCount || 18}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                Doctors
              </span>
            </div>

            {/* Appointments */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-slate-500 text-xs font-semibold">
                <Calendar className="size-3.5 text-purple-600" />
                <span className="font-black text-slate-900 text-sm">
                  {hospital.appointmentCount || 286}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                Appointments
              </span>
            </div>
          </div>

          {/* Facility Tags */}
          <div className="flex items-center gap-1.5 flex-wrap min-h-[26px]">
            {visibleFacilities.map((facility, idx) => {
              const isEmergency = facility.toLowerCase().includes('emergency')
              return (
                <span
                  key={facility}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                    isEmergency || idx === 0
                      ? 'bg-rose-50 text-rose-600 border border-rose-100'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {facility}
                </span>
              )
            })}
            {remainingFacilities > 0 && (
              <span className="px-1.5 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-500">
                +{remainingFacilities}
              </span>
            )}
          </div>
        </div>

        {/* 3. Card Footer with Status & Action Buttons */}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs">
          {/* Est. Year & Active Status */}
          <div className="flex items-center gap-2 text-slate-500 font-medium text-[11px]">
            <span>Est. {hospital.establishmentYear || 2018}</span>
            <span className="size-1 rounded-full bg-slate-300" />
            <span
              className={`flex items-center gap-1 font-bold ${
                hospital.isActive ? 'text-emerald-600' : 'text-slate-400'
              }`}
            >
              <span
                className={`size-1.5 rounded-full ${
                  hospital.isActive ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              />
              <span>{hospital.isActive ? 'Active' : 'Inactive'}</span>
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenDetails}
              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-blue-300 text-blue-600 hover:bg-blue-50/70 text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              View Details
            </button>
            <button
              onClick={handleOpenManage}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer shadow-2xs hover:shadow-xs"
            >
              Manage
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
export default HospitalCard
