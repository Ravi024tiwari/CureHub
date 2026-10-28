import { useState, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MapPin,
  Star,
  BedDouble,
  Users,
  Calendar,
  Heart,
} from 'lucide-react'
import type { HospitalBranchItem } from '@/types/hospitalAdmin'
import { useHospitalBranchesStore } from '@/store/hospitalBranchesStore'

import apolloImg from '@/assets/apollo-hospital.jpg'
import cityCareImg from '@/assets/city-care-hospital.jpg'
import shreeSaiImg from '@/assets/shree-sai-hospital.jpg'
import lifecareImg from '@/assets/lifecare-hospital.jpg'

interface HospitalListItemProps {
  hospital: HospitalBranchItem
  index?: number
}

export const HospitalListItem: FC<HospitalListItemProps> = ({ hospital, index = 0 }) => {
  const navigate = useNavigate()
  const {
    favorites,
    toggleFavorite,
    setSelectedHospital,
    setIsDetailsModalOpen,
  } = useHospitalBranchesStore()

  const [imgError, setImgError] = useState(false)
  const isFav = Boolean(favorites[hospital._id])

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

  const addressLine = [
    hospital.address?.street,
    hospital.address?.city,
    hospital.address?.state,
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 group">
      {/* Thumbnail & Basic Info */}
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="relative size-20 sm:size-24 rounded-2xl overflow-hidden shrink-0 bg-slate-100">
          <img
            src={getCoverImage()}
            alt={hospital.name}
            onError={() => setImgError(true)}
            className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <button
            onClick={(e) => {
              e.stopPropagation()
              toggleFavorite(hospital._id)
            }}
            className={`absolute top-1.5 right-1.5 size-6 rounded-full flex items-center justify-center backdrop-blur-md cursor-pointer ${
              isFav ? 'bg-rose-500 text-white' : 'bg-white/80 text-slate-500 hover:text-rose-500'
            }`}
          >
            <Heart className={`size-3 ${isFav ? 'fill-current' : ''}`} />
          </button>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              onClick={() => {
                setSelectedHospital(hospital)
                setIsDetailsModalOpen(true)
              }}
              className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer truncate"
            >
              {hospital.name}
            </h3>

            {/* Status Pill (if inactive) */}
            {!hospital.isActive && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                Inactive
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
            <span className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="size-3.5 fill-current" />
              <span>{hospital.rating?.toFixed(1) || '4.8'}</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-blue-600 font-semibold">{hospital.hospitalType || 'Multi-Speciality'}</span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1 truncate max-w-[200px]">
              <MapPin className="size-3 text-slate-400 shrink-0" />
              <span>{addressLine}</span>
            </span>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 mt-2 text-xs text-slate-600 font-medium">
            <span className="flex items-center gap-1">
              <BedDouble className="size-3.5 text-blue-600" />
              <strong className="text-slate-900 font-bold">{hospital.totalBeds || 120}</strong> Beds
            </span>
            <span className="flex items-center gap-1">
              <Users className="size-3.5 text-emerald-600" />
              <strong className="text-slate-900 font-bold">{hospital.doctorCount || 18}</strong> Doctors
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="size-3.5 text-purple-600" />
              <strong className="text-slate-900 font-bold">{hospital.appointmentCount || 286}</strong> Appointments
            </span>
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center justify-between md:justify-end gap-2.5 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
        <div className="text-right text-[11px] text-slate-400 hidden sm:block">
          <div>Est. {hospital.establishmentYear || 2018}</div>
          <div className={hospital.isActive ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
            {hospital.isActive ? '● Active' : '● Inactive'}
          </div>
        </div>

        <button
          onClick={() => {
            setSelectedHospital(hospital)
            navigate(`/hospital-admin/hospitals/${hospital._id}`)
          }}
          className="px-3.5 py-2 rounded-xl border border-slate-200 hover:border-blue-300 text-blue-600 hover:bg-blue-50/70 text-xs font-bold transition-all cursor-pointer shadow-2xs"
        >
          View Details
        </button>
        <button
          onClick={() => {
            setSelectedHospital(hospital)
            navigate(`/hospital-admin/hospitals/${hospital._id}/edit`)
          }}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer shadow-2xs hover:shadow-xs"
        >
          Manage
        </button>
      </div>
    </div>
  )
}
export default HospitalListItem
