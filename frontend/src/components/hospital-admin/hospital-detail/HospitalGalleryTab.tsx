import { useState, type FC } from 'react'
import {
  Camera,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

// Assets
import apolloImg from '@/assets/apollo-hospital.jpg'
import cityCareImg from '@/assets/city-care-hospital.jpg'
import lifecareImg from '@/assets/lifecare-hospital.jpg'
import shreeSaiImg from '@/assets/shree-sai-hospital.jpg'
import consultationImg from '@/assets/careplus-consultation.jpg'

interface HospitalGalleryTabProps {
  coverImage?: string
  gallery?: string[]
  hospitalName: string
}

export const HospitalGalleryTab: FC<HospitalGalleryTabProps> = ({
  coverImage,
  gallery = [],
  hospitalName,
}) => {
  const [activeIdx, setActiveIdx] = useState<number | null>(null)

  const defaultList = [
    coverImage || apolloImg,
    consultationImg,
    cityCareImg,
    lifecareImg,
    shreeSaiImg,
  ]

  const photos = gallery.length > 0 ? [coverImage || apolloImg, ...gallery] : defaultList

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Camera className="size-5 text-blue-600" />
            <span>Hospital Photo Gallery ({photos.length})</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Campus architecture, surgical suites, inpatient wards, and patient consultation spaces.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {photos.map((src, idx) => (
          <div
            key={idx}
            onClick={() => setActiveIdx(idx)}
            className="group relative h-40 sm:h-48 rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-100 shadow-2xs hover:shadow-md cursor-pointer transition-all"
          >
            <img
              src={src}
              alt={`${hospitalName} photo ${idx + 1}`}
              className="size-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
            <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/30 transition-colors flex items-center justify-center">
              <span className="p-2 rounded-xl bg-white/90 text-slate-800 opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                <Maximize2 className="size-4 text-blue-600" />
              </span>
            </div>
            {idx === 0 && (
              <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-lg text-[10px] font-black bg-blue-600 text-white shadow-xs">
                Cover Photo
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {activeIdx !== null && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setActiveIdx(null)}
            className="absolute top-5 right-5 size-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer z-50"
          >
            <X className="size-5" />
          </button>

          <button
            type="button"
            onClick={() => setActiveIdx((activeIdx - 1 + photos.length) % photos.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 size-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer z-50"
          >
            <ChevronLeft className="size-6" />
          </button>

          <div className="max-w-4xl max-h-[85vh] relative flex flex-col items-center">
            <img
              src={photos[activeIdx]}
              alt={`Photo ${activeIdx + 1}`}
              className="max-h-[75vh] w-auto rounded-2xl object-contain shadow-2xl border border-white/10"
            />
            <div className="mt-3 text-white/80 text-xs font-semibold">
              Photo {activeIdx + 1} of {photos.length}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveIdx((activeIdx + 1) % photos.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 size-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer z-50"
          >
            <ChevronRight className="size-6" />
          </button>
        </div>
      )}
    </div>
  )
}
