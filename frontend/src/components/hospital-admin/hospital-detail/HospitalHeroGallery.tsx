import { useState, type FC } from 'react'
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Camera,
  Layers,
} from 'lucide-react'

// Curated high-res assets matching mockup fallback
import apolloImg from '@/assets/apollo-hospital.jpg'
import cityCareImg from '@/assets/city-care-hospital.jpg'
import lifecareImg from '@/assets/lifecare-hospital.jpg'
import shreeSaiImg from '@/assets/shree-sai-hospital.jpg'
import consultationImg from '@/assets/careplus-consultation.jpg'

interface HospitalHeroGalleryProps {
  coverImage?: string
  gallery?: string[]
  hospitalName: string
  onOpenGalleryTab?: () => void
}

export const HospitalHeroGallery: FC<HospitalHeroGalleryProps> = ({
  coverImage,
  gallery = [],
  hospitalName,
  onOpenGalleryTab,
}) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  // Construct full image list for the gallery
  const mainImage = coverImage || apolloImg
  const fallbackThumbnails = [
    consultationImg,
    cityCareImg,
    lifecareImg,
    shreeSaiImg,
  ]

  const thumbnails = gallery.length >= 4
    ? gallery.slice(0, 4)
    : [...gallery, ...fallbackThumbnails].slice(0, 4)

  const allImages = [mainImage, ...thumbnails]
  const extraPhotosCount = Math.max(12, gallery.length > 4 ? gallery.length - 3 : 12)

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
  }

  const closeLightbox = () => {
    setLightboxIndex(null)
  }

  const nextImage = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % allImages.length)
    }
  }

  const prevImage = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + allImages.length) % allImages.length)
    }
  }

  return (
    <>
      <div className="relative rounded-3xl overflow-hidden border border-slate-200/80 bg-white shadow-xs p-2 sm:p-2.5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 sm:gap-2.5 h-[220px] sm:h-[320px] md:h-[400px]">
          {/* Main Large Hero Image (Col 7 / ~60%) */}
          <div
            onClick={() => openLightbox(0)}
            className="md:col-span-7 relative h-full rounded-2xl overflow-hidden group cursor-pointer bg-slate-900"
          >
            <img
              src={mainImage}
              alt={hospitalName}
              className="size-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent pointer-events-none" />

            {/* Quick Badge */}
            <div className="absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-slate-950/60 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-2 border border-white/10">
              <Camera className="size-3.5 text-blue-400" />
              <span>Exterior Campus</span>
            </div>

            {/* Desktop View Full overlay */}
            <div className="hidden md:block absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md text-slate-800 text-xs font-bold flex items-center gap-1.5 shadow-md">
                <Maximize2 className="size-3.5 text-blue-600" /> View Full
              </span>
            </div>

            {/* Mobile "+12 Photos" overlay badge in bottom-right corner matching user phone mockup */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onOpenGalleryTab?.()
              }}
              className="md:hidden absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md text-white text-xs font-black flex items-center gap-1.5 border border-white/15 shadow-md active:scale-95 transition-transform cursor-pointer"
            >
              <Layers className="size-3.5 text-blue-400" />
              <span>+{extraPhotosCount}</span>
            </button>
          </div>

          {/* 2x2 Thumbnail Grid (Col 5 / ~40%) */}
          <div className="hidden md:grid md:col-span-5 grid-cols-2 grid-rows-2 gap-2 sm:gap-2.5 h-full">
            {thumbnails.map((imgSrc, idx) => {
              const isLastItem = idx === 3
              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (isLastItem && onOpenGalleryTab) {
                      onOpenGalleryTab()
                    } else {
                      openLightbox(idx + 1)
                    }
                  }}
                  className="relative h-full rounded-2xl overflow-hidden group cursor-pointer bg-slate-100 border border-slate-200/60"
                >
                  <img
                    src={imgSrc}
                    alt={`${hospitalName} photo ${idx + 1}`}
                    className="size-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />

                  {/* 4th Image "+12 Photos" overlay matching mockup */}
                  {isLastItem ? (
                    <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-[2px] flex flex-col items-center justify-center text-white transition-all group-hover:bg-slate-950/75">
                      <Layers className="size-6 mb-1 text-blue-400" />
                      <span className="text-sm font-black tracking-wide">
                        +{extraPhotosCount} Photos
                      </span>
                      <span className="text-[10px] text-slate-300 font-medium">Click to view all</span>
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/20 transition-colors flex items-center justify-center">
                      <Maximize2 className="size-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Mobile View Gallery Counter Strip */}
        <div className="md:hidden flex items-center justify-between pt-2 px-1 text-xs text-slate-500">
          <span className="font-semibold text-slate-700 flex items-center gap-1">
            <Camera className="size-3.5 text-blue-600" /> Photo Gallery
          </span>
          <button
            type="button"
            onClick={onOpenGalleryTab}
            className="text-blue-600 font-bold hover:underline"
          >
            +{extraPhotosCount} Photos
          </button>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4">
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute top-5 right-5 size-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer z-50"
            title="Close"
          >
            <X className="size-5" />
          </button>

          <button
            type="button"
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 size-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer z-50"
            title="Previous"
          >
            <ChevronLeft className="size-6" />
          </button>

          <div className="max-w-4xl max-h-[85vh] relative flex flex-col items-center">
            <img
              src={allImages[lightboxIndex]}
              alt={`Photo ${lightboxIndex + 1}`}
              className="max-h-[75vh] w-auto rounded-2xl object-contain shadow-2xl border border-white/10"
            />
            <div className="mt-3 text-white/80 text-xs font-semibold">
              Photo {lightboxIndex + 1} of {allImages.length}
            </div>
          </div>

          <button
            type="button"
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 size-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer z-50"
            title="Next"
          >
            <ChevronRight className="size-6" />
          </button>
        </div>
      )}
    </>
  )
}
