import { useState, type FC } from 'react'
import { Star, MapPin, Heart } from 'lucide-react'
import type { HospitalCardData } from '@/types/patient'
import { Button } from '@/components/ui/button'

interface HospitalCardProps {
  hospital: HospitalCardData
  onViewDetails: (hospital: HospitalCardData) => void
}

export const HospitalCard: FC<HospitalCardProps> = ({ hospital, onViewDetails }) => {
  const [isFavorited, setIsFavorited] = useState(false)

  const getTagStyle = (tag: string) => {
    const lower = tag.toLowerCase()
    if (lower.includes('emergency')) {
      return 'bg-rose-50 text-rose-600 border-rose-100'
    }
    if (lower.includes('icu') || lower.includes('general')) {
      return 'bg-blue-50 text-blue-600 border-blue-100'
    }
    if (lower.includes('pharmacy') || lower.includes('surgery')) {
      return 'bg-purple-50 text-purple-600 border-purple-100'
    }
    if (lower.includes('cardiology')) {
      return 'bg-amber-50 text-amber-700 border-amber-100'
    }
    return 'bg-slate-50 text-slate-600 border-slate-100'
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-blue-200 transition-all duration-300 flex flex-col overflow-hidden group">
      {/* Hospital Image with Badges */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
        <img
          src={hospital.image}
          alt={hospital.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Favorite Heart Button matching mockup */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsFavorited(!isFavorited)
          }}
          className="absolute top-3 right-3 size-8 rounded-full bg-white/90 backdrop-blur-md hover:bg-white text-slate-600 flex items-center justify-center transition-transform active:scale-90 shadow-sm cursor-pointer z-10"
          title={isFavorited ? 'Remove from favorites' : 'Save to favorites'}
        >
          <Heart
            className={`size-4 transition-colors ${
              isFavorited ? 'fill-rose-500 text-rose-500' : 'text-slate-600'
            }`}
          />
        </button>

        {/* Rating Badge */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
          <Star className="size-3.5 fill-amber-400 text-amber-400" />
          <span className="text-xs font-bold text-slate-900">{hospital.rating.toFixed(1)}</span>
        </div>

        {/* Distance Badge */}
        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[11px] font-semibold flex items-center gap-1">
          <MapPin className="size-3 text-white" />
          <span>{hospital.distance}</span>
        </div>

        {/* Verified Hospital Pill */}
        <div className="absolute bottom-3 left-3 bg-emerald-600/90 backdrop-blur-md px-2 py-0.5 rounded-md text-white text-[10px] font-bold">
          Open 24/7
        </div>
      </div>

      {/* Hospital Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug group-hover:text-blue-600 transition-colors line-clamp-1">
            {hospital.name}
          </h3>

          <div className="flex items-center gap-1.5 text-slate-400 text-xs">
            <MapPin className="size-3.5 shrink-0 text-slate-400" />
            <span className="truncate">{hospital.location}</span>
          </div>

          {/* Department / Feature Tags */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {hospital.tags.map((tag) => (
              <span
                key={tag}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${getTagStyle(tag)}`}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* View Details Button */}
        <div className="pt-2">
          <Button
            variant="outline"
            onClick={() => onViewDetails(hospital)}
            className="w-full h-9 rounded-xl border-slate-200 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
          >
            View Details
          </Button>
        </div>
      </div>
    </div>
  )
}
