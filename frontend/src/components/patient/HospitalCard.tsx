import { type FC } from 'react'
import {
  Star,
  MapPin,
  Heart,
  ShieldCheck,
  Bed,
  Ambulance,
  Pill,
  Clock,
} from 'lucide-react'
import type { HospitalCardData } from '@/types/patient'
import { Button } from '@/components/ui/button'
import { LazyImage } from '@/components/common/LazyImage'

interface HospitalCardProps {
  hospital: HospitalCardData
  onViewDetails: (hospital: HospitalCardData) => void
  onBookAppointment?: (hospital: HospitalCardData) => void
  onToggleFavorite?: (id: string) => void
}

export const HospitalCard: FC<HospitalCardProps> = ({
  hospital,
  onViewDetails,
  onBookAppointment,
  onToggleFavorite,
}) => {
  const isFav = hospital.isFavorite || false

  const coverImageUrl =
    hospital.images?.coverImage ||
    hospital.image ||
    '/src/assets/apollo-hospital.jpg'

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col overflow-hidden group">
      {/* Hospital Image with Badges & LazyImage */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <LazyImage
          src={coverImageUrl}
          alt={hospital.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Favorite Heart Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite?.(hospital._id)
          }}
          className="absolute top-3 right-3 size-8.5 rounded-full bg-white/95 backdrop-blur-md hover:bg-white text-slate-600 flex items-center justify-center transition-transform active:scale-90 shadow-sm cursor-pointer z-10"
          title={isFav ? 'Remove from favorites' : 'Save to favorites'}
        >
          <Heart
            className={`size-4.5 transition-colors ${
              isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-600 hover:text-rose-500'
            }`}
          />
        </button>

        {/* Verified Badge (Top Left) */}
        <div className="absolute top-3 left-3 bg-emerald-600/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-md flex items-center gap-1.5 text-white text-[11px] font-bold">
          <ShieldCheck className="size-3.5" />
          <span>Verified</span>
        </div>

        {/* Distance Badge (Bottom Right) */}
        <div className="absolute bottom-3 right-3 bg-slate-900/75 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[11px] font-bold flex items-center gap-1 shadow-sm">
          <MapPin className="size-3 text-blue-300" />
          <span>{hospital.distance || '2.5 km'}</span>
        </div>
      </div>

      {/* Hospital Details Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
        <div className="space-y-2">
          {/* Title & Rating */}
          <div>
            <h3
              onClick={() => onViewDetails(hospital)}
              className="font-extrabold text-slate-900 text-base sm:text-lg leading-snug group-hover:text-blue-600 transition-colors line-clamp-1 cursor-pointer"
            >
              {hospital.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-1.5 pt-1">
              <div className="flex items-center text-amber-500">
                <Star className="size-3.5 fill-amber-400 text-amber-400" />
              </div>
              <span className="text-xs font-black text-slate-900">
                {Number(hospital.rating || 4.5).toFixed(1)}
              </span>
              <span className="text-[11px] font-semibold text-slate-400">
                • Accredited
              </span>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-slate-500 text-xs">
            <MapPin className="size-3.5 shrink-0 text-slate-400" />
            <span className="truncate">{hospital.location}</span>
          </div>

          {/* Department / Specialty Tags */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {(hospital.departments && hospital.departments.length > 0
              ? hospital.departments.slice(0, 3)
              : hospital.tags?.slice(0, 3) || ['Multi-Speciality']
            ).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-blue-50/70 text-blue-700 border border-blue-100/80"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Key Amenities & Stats Line */}
          <div className="pt-2 border-t border-slate-100 grid grid-cols-4 gap-1 text-[11px] text-slate-600">
            {/* Beds */}
            <div className="flex flex-col items-center justify-center p-1 rounded-lg bg-slate-50/80 text-center">
              <span className="font-bold text-slate-900 flex items-center gap-1">
                <Bed className="size-3 text-blue-600" />
                {hospital.totalBeds || 150}+
              </span>
              <span className="text-[9px] text-slate-400">Beds</span>
            </div>

            {/* Emergency */}
            <div className="flex flex-col items-center justify-center p-1 rounded-lg bg-slate-50/80 text-center">
              <span className="font-bold text-slate-900 flex items-center gap-0.5">
                <Clock className="size-3 text-rose-500" />
                24/7
              </span>
              <span className="text-[9px] text-slate-400">Emergency</span>
            </div>

            {/* Ambulance / ICU */}
            <div className="flex flex-col items-center justify-center p-1 rounded-lg bg-slate-50/80 text-center">
              <span className="font-bold text-slate-900 flex items-center gap-0.5">
                <Ambulance className="size-3 text-blue-500" />
                Avail
              </span>
              <span className="text-[9px] text-slate-400">Ambulance</span>
            </div>

            {/* Pharmacy */}
            <div className="flex flex-col items-center justify-center p-1 rounded-lg bg-slate-50/80 text-center">
              <span className="font-bold text-slate-900 flex items-center gap-0.5">
                <Pill className="size-3 text-purple-500" />
                In-house
              </span>
              <span className="text-[9px] text-slate-400">Pharmacy</span>
            </div>
          </div>
        </div>

        {/* CTA Buttons matching mockup */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onViewDetails(hospital)}
            className="w-full text-xs font-bold rounded-xl border-slate-200 text-blue-600 hover:bg-blue-50 hover:border-blue-200 cursor-pointer h-9"
          >
            View Details
          </Button>

          <Button
            type="button"
            onClick={() => onBookAppointment?.(hospital)}
            className="w-full text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 cursor-pointer h-9"
          >
            Book Appt
          </Button>
        </div>
      </div>
    </div>
  )
}
