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

interface DoctorHospitalListItemProps {
  hospital: DoctorHospitalItem
  index?: number
  isFavorite?: boolean
  onToggleFavorite?: (hospitalId: string) => void
  onRequestJoin: (hospital: DoctorHospitalItem) => void
  onViewDetails?: (hospitalId: string) => void
}

export const DoctorHospitalListItem: FC<DoctorHospitalListItemProps> = ({
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
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white flex items-center gap-1">
          <CheckCircle2 className="size-3" />
          <span>Affiliated</span>
        </span>
      )
    }

    if (hospital.requestStatus === 'PENDING') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white flex items-center gap-1">
          <Clock className="size-3" />
          <span>Requested</span>
        </span>
      )
    }

    if (!hospital.isActive) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-700 text-white flex items-center gap-1">
          <AlertCircle className="size-3" />
          <span>Closed</span>
        </span>
      )
    }

    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white flex items-center gap-1">
        <Sparkles className="size-3" />
        <span>Open</span>
      </span>
    )
  }

  const isPending = hospital.requestStatus === 'PENDING'
  const isAffiliated = hospital.isAffiliated

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-all duration-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 group">
      {/* Left side: Thumbnail & Main Info */}
      <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
        <div 
          onClick={handleViewDetails}
          className="relative size-20 sm:size-24 rounded-xl overflow-hidden bg-slate-100 shrink-0 cursor-pointer"
        >
          <img
            src={getCoverImage()}
            alt={hospital.name}
            onError={() => setImgError(true)}
            className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-1 left-1">{renderStatusBadge()}</div>
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <h3 
              onClick={handleViewDetails}
              className="text-sm sm:text-base font-black text-slate-900 hover:text-blue-600 transition-colors truncate cursor-pointer"
            >
              {hospital.name}
            </h3>
            {onToggleFavorite && (
              <button
                type="button"
                onClick={() => onToggleFavorite(hospital._id)}
                className={`p-1 rounded-full hover:bg-slate-100 transition-colors ${
                  isFavorite ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'
                }`}
              >
                <Heart className={`size-3.5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            )}
          </div>

          <p className="text-xs text-slate-500 flex items-center gap-1.5 truncate">
            <MapPin className="size-3 text-slate-400 shrink-0" />
            <span>{addressLine || 'Location available'}</span>
            <span className="text-slate-300">•</span>
            <span className="font-semibold text-slate-600">{distanceText}</span>
          </p>

          <div className="flex items-center gap-2 flex-wrap pt-0.5">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700">
              {hospital.hospitalType || 'Multi-Speciality'}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-600 font-semibold flex items-center gap-1">
              <BedDouble className="size-3 text-slate-400" />
              {hospital.totalBeds || 120} Beds
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-600 font-semibold flex items-center gap-1">
              <Building2 className="size-3 text-slate-400" />
              {hospital.departments?.length || 8} Depts
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-600 font-semibold flex items-center gap-1">
              <Users className="size-3 text-slate-400" />
              {hospital.doctorCount || 24} Doctors
            </span>
          </div>
        </div>
      </div>

      {/* Right side: Action Buttons */}
      <div className="shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 flex items-center gap-2 justify-end">
        <button
          type="button"
          onClick={handleViewDetails}
          className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200/80 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Eye className="size-3.5 text-slate-500" />
          <span>View Details</span>
        </button>

        {isAffiliated ? (
          <span className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="size-3.5" />
            <span>Affiliated</span>
          </span>
        ) : isPending ? (
          <span className="px-3 py-2 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200 flex items-center gap-1">
            <Clock className="size-3.5 text-blue-600" />
            <span>Requested</span>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => onRequestJoin(hospital)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="size-3.5" />
            <span>Request to Join</span>
          </button>
        )}
      </div>
    </div>
  )
}
export default DoctorHospitalListItem
