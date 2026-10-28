import { useState, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MapPin,
  BedDouble,
  Building2,
  Users,
  Heart,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle,
  UserPlus,
  Eye,
} from 'lucide-react'
import type { DoctorHospitalItem } from '@/types/doctorHospital'

import apolloImg from '@/assets/apollo-hospital.jpg'
import cityCareImg from '@/assets/city-care-hospital.jpg'
import shreeSaiImg from '@/assets/shree-sai-hospital.jpg'
import lifecareImg from '@/assets/lifecare-hospital.jpg'

interface DoctorHospitalCardProps {
  hospital: DoctorHospitalItem
  index?: number
  isFavorite?: boolean
  onToggleFavorite?: (hospitalId: string) => void
  onRequestJoin: (hospital: DoctorHospitalItem) => void
  onViewDetails?: (hospitalId: string) => void
}

export const DoctorHospitalCard: FC<DoctorHospitalCardProps> = ({
  hospital,
  index = 0,
  isFavorite = false,
  onToggleFavorite,
  onRequestJoin,
  onViewDetails,
}) => {
  const navigate = useNavigate()
  const [imgError, setImgError] = useState(false)

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(hospital._id)
    } else {
      navigate(`/doctor/hospitals/${hospital._id}`)
    }
  }

  const getCoverImage = () => {
    if (!imgError && hospital.images?.coverImage) {
      return hospital.images.coverImage
    }
    const name = hospital.name.toLowerCase()
    if (name.includes('apollo') || name.includes('aarogya')) return apolloImg
    if (name.includes('city') || name.includes('care')) return cityCareImg
    if (name.includes('sai') || name.includes('sunrise')) return shreeSaiImg
    return [apolloImg, cityCareImg, shreeSaiImg, lifecareImg][index % 4]
  }

  const addressLine = [hospital.address?.city, hospital.address?.state].filter(Boolean).join(', ')
  const distanceText = hospital.distance || `${((index * 1.7) % 15 + 1.2).toFixed(1)} km`

  // Status Badge Logic
  const renderStatusBadge = () => {
    if (hospital.isAffiliated) {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/95 text-white backdrop-blur-md shadow-xs flex items-center gap-1.5">
          <CheckCircle2 className="size-3.5" />
          <span>Affiliated</span>
        </span>
      )
    }

    if (hospital.requestStatus === 'PENDING') {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-600/95 text-white backdrop-blur-md shadow-xs flex items-center gap-1.5">
          <Clock className="size-3.5" />
          <span>Already Requested</span>
        </span>
      )
    }

    if (hospital.requestStatus === 'REJECTED') {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/95 text-white backdrop-blur-md shadow-xs flex items-center gap-1.5">
          <AlertCircle className="size-3.5" />
          <span>Rejected</span>
        </span>
      )
    }

    if (!hospital.isActive) {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-700/90 text-white backdrop-blur-md shadow-xs flex items-center gap-1.5">
          <AlertCircle className="size-3.5" />
          <span>Not Accepting Now</span>
        </span>
      )
    }

    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/95 text-white backdrop-blur-md shadow-xs flex items-center gap-1.5">
        <Sparkles className="size-3.5" />
        <span>Open for Requests</span>
      </span>
    )
  }

  const isPending = hospital.requestStatus === 'PENDING'
  const isAffiliated = hospital.isAffiliated

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
      {/* 1. Hospital Image Header */}
      <div>
        <div 
          onClick={handleViewDetails}
          className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-100 cursor-pointer"
        >
          <img
            src={getCoverImage()}
            alt={hospital.name}
            onError={() => setImgError(true)}
            className="size-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />

          {/* Top-Left Badge */}
          <div className="absolute top-3 left-3 z-10">{renderStatusBadge()}</div>

          {/* Top-Right Favorite Button */}
          {onToggleFavorite && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onToggleFavorite(hospital._id)
              }}
              className={`absolute top-3 right-3 z-10 size-8 rounded-full flex items-center justify-center backdrop-blur-md transition-transform active:scale-90 cursor-pointer ${
                isFavorite
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-white/90 text-slate-600 hover:text-rose-500 hover:bg-white shadow-2xs'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`size-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>

        {/* 2. Card Body */}
        <div className="p-4 sm:p-5 space-y-3">
          {/* Hospital Title */}
          <div>
            <h3 
              onClick={handleViewDetails}
              className="text-base sm:text-lg font-black text-slate-900 hover:text-blue-600 transition-colors line-clamp-1 cursor-pointer"
            >
              {hospital.name}
            </h3>
            <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-1 truncate">
              <MapPin className="size-3.5 text-slate-400 shrink-0" />
              <span>{addressLine || 'Location available'}</span>
              <span className="text-slate-300">•</span>
              <span className="font-semibold text-slate-600">{distanceText}</span>
            </p>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
              {hospital.hospitalType || 'Multi-Speciality'}
            </span>
            <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              {hospital.establishmentYear
                ? `Est. ${hospital.establishmentYear}`
                : hospital.hospitalType?.includes('Private')
                ? 'Private'
                : 'Recognized'}
            </span>
          </div>

          {/* 3 Quick Stats Strip */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
            <div className="p-1.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-center gap-1 text-slate-400 mb-0.5">
                <BedDouble className="size-3 text-blue-600" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Beds</span>
              </div>
              <span className="text-xs sm:text-sm font-black text-slate-900">
                {hospital.totalBeds || 120}
              </span>
            </div>

            <div className="p-1.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-center gap-1 text-slate-400 mb-0.5">
                <Building2 className="size-3 text-purple-600" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Depts</span>
              </div>
              <span className="text-xs sm:text-sm font-black text-slate-900">
                {hospital.departments?.length || 8}
              </span>
            </div>

            <div className="p-1.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-center gap-1 text-slate-400 mb-0.5">
                <Users className="size-3 text-emerald-600" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Doctors</span>
              </div>
              <span className="text-xs sm:text-sm font-black text-slate-900">
                {hospital.doctorCount || 24}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Card Bottom Action */}
      <div className="p-4 sm:p-5 pt-0">
        {isAffiliated ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleViewDetails}
              className="flex-1 py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200/80 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Eye className="size-3.5" />
              <span>View Details</span>
            </button>
            <div className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200/80 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="size-3.5" />
              <span>Affiliated</span>
            </div>
          </div>
        ) : isPending ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleViewDetails}
              className="flex-1 py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200/80 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Eye className="size-3.5" />
              <span>View Details</span>
            </button>
            <div className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs border border-slate-200 flex items-center justify-center gap-1.5">
              <Clock className="size-3.5 text-blue-600" />
              <span>Requested</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleViewDetails}
              className="flex-1 py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200/80 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Eye className="size-3.5 text-slate-500" />
              <span>View Details</span>
            </button>
            <button
              type="button"
              onClick={() => onRequestJoin(hospital)}
              className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="size-3.5" />
              <span>Join</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
export default DoctorHospitalCard
