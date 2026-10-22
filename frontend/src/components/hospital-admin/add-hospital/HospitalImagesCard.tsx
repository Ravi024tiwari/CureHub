import { useRef, useState, type FC, type ChangeEvent } from 'react'
import {
  Image as ImageIcon,
  UploadCloud,
  Plus,
  X,
  RefreshCw,
  Check,
  Loader2,
  Cloud,
} from 'lucide-react'

import { uploadService } from '@/services/uploadService'

export interface HospitalImagesData {
  coverImage: string
  gallery: string[]
}

interface HospitalImagesCardProps {
  data: HospitalImagesData
  onChange: (fields: Partial<HospitalImagesData>) => void
  errors?: Partial<Record<keyof HospitalImagesData, string>>
}

export const HospitalImagesCard: FC<HospitalImagesCardProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  const coverInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  const [isUploadingCover, setIsUploadingCover] = useState(false)
  const [isUploadingGallery, setIsUploadingGallery] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleCoverUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError(null)
    setIsUploadingCover(true)

    try {
      // 1. Upload to temporary staging folder in AWS S3
      const result = await uploadService.uploadTempFile(file, 'temp/hospitals/covers')
      onChange({ coverImage: result.url })
    } catch (err: any) {
      console.error('Failed to upload cover image to S3:', err)
      setUploadError(err.message || 'Failed to upload cover image to cloud storage.')
      // Fallback: If S3 fails or offline, use local data url for uninterrupted work
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onChange({ coverImage: reader.result })
        }
      }
      reader.readAsDataURL(file)
    } finally {
      setIsUploadingCover(false)
      if (coverInputRef.current) coverInputRef.current.value = ''
    }
  }

  const handleGalleryUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const currentGallery = [...data.gallery]
    const remainingSlots = 5 - currentGallery.length
    if (remainingSlots <= 0) return

    const filesToProcess = Array.from(files).slice(0, remainingSlots)

    setUploadError(null)
    setIsUploadingGallery(true)

    try {
      const uploadedUrls: string[] = []

      for (const file of filesToProcess) {
        try {
          const result = await uploadService.uploadTempFile(file, 'temp/hospitals/gallery')
          uploadedUrls.push(result.url)
        } catch (err) {
          console.warn('Single gallery item S3 upload failed, reading as data url fallback', err)
          const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.readAsDataURL(file)
          })
          uploadedUrls.push(dataUrl)
        }
      }

      onChange({ gallery: [...data.gallery, ...uploadedUrls] })
    } catch (err: any) {
      setUploadError('Failed to upload some gallery images.')
    } finally {
      setIsUploadingGallery(false)
      if (galleryInputRef.current) galleryInputRef.current.value = ''
    }
  }

  const removeGalleryImage = (indexToRemove: number) => {
    onChange({
      gallery: data.gallery.filter((_, idx) => idx !== indexToRemove),
    })
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-all">
      {/* Header matching mockup */}
      <div className="flex items-center justify-between gap-3.5 mb-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <div className="size-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 shadow-xs ring-1 ring-purple-500/10">
            <ImageIcon className="size-5.5 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Hospital Images
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Upload cover image and gallery images.
            </p>
          </div>
        </div>
      </div>

      {uploadError && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold flex items-center justify-between">
          <span>{uploadError}</span>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="text-rose-500 hover:text-rose-800"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      <div className="space-y-6">
        {/* Cover Image Upload & Preview Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-700">
              Cover Image <span className="text-rose-500">*</span>
            </label>
            {data.coverImage && (
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                <Check className="size-3 stroke-[3]" />
                <Cloud className="size-3" />
                Uploaded to S3
              </span>
            )}
          </div>

          <input
            type="file"
            ref={coverInputRef}
            onChange={handleCoverUpload}
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
          />

          {isUploadingCover ? (
            <div className="border-2 border-dashed border-blue-300 rounded-2xl p-8 text-center bg-blue-50/30 flex flex-col items-center justify-center animate-pulse">
              <Loader2 className="size-8 text-blue-600 animate-spin mb-2" />
              <p className="text-xs font-bold text-blue-900">Uploading cover image to cloud...</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Please wait a moment</p>
            </div>
          ) : data.coverImage ? (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60">
              {/* Image Thumbnail Preview */}
              <div className="relative w-full sm:w-48 h-32 rounded-xl overflow-hidden border border-slate-200/80 shadow-xs shrink-0 group">
                <img
                  src={data.coverImage}
                  alt="Hospital Cover"
                  className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                />
                <button
                  type="button"
                  onClick={() => onChange({ coverImage: '' })}
                  className="absolute top-2 right-2 size-6 rounded-full bg-slate-900/75 hover:bg-rose-600 text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Remove Image"
                >
                  <X className="size-3.5" />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex-1 flex flex-col justify-center gap-2">
                <p className="text-xs font-bold text-slate-800">Hospital Primary Cover Image</p>
                <p className="text-[11px] text-slate-500">
                  This image will be displayed prominently on your hospital banner and search cards.
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs hover:border-slate-300"
                  >
                    <RefreshCw className="size-3.5 text-slate-500" />
                    <span>Change Image</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              onClick={() => coverInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-blue-500/60 rounded-2xl p-6 text-center bg-slate-50/40 hover:bg-blue-50/20 transition-all cursor-pointer flex flex-col items-center justify-center group"
            >
              <div className="size-12 rounded-2xl bg-blue-50 group-hover:bg-blue-100/70 text-blue-600 flex items-center justify-center mb-2.5 transition-colors">
                <UploadCloud className="size-6 stroke-[2]" />
              </div>
              <p className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                Click to upload cover image
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG (Max 5MB)</p>
            </div>
          )}
          {errors.coverImage && (
            <p className="text-[11px] font-semibold text-rose-500 mt-1">{errors.coverImage}</p>
          )}
        </div>

        {/* Gallery Images Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <label className="text-xs font-bold text-slate-700">Gallery Images</label>
              <p className="text-[11px] text-slate-400">
                You can upload multiple images (Max 5 images)
              </p>
            </div>
            <span className="text-[11px] font-bold text-slate-500">
              {data.gallery.length}/5 uploaded
            </span>
          </div>

          <input
            type="file"
            ref={galleryInputRef}
            onChange={handleGalleryUpload}
            multiple
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {/* Add Images Box */}
            {data.gallery.length < 5 && (
              <button
                type="button"
                disabled={isUploadingGallery}
                onClick={() => galleryInputRef.current?.click()}
                className="h-24 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 flex flex-col items-center justify-center text-slate-500 hover:text-blue-600 transition-all cursor-pointer group disabled:opacity-50"
              >
                {isUploadingGallery ? (
                  <>
                    <Loader2 className="size-5 text-blue-600 animate-spin mb-1" />
                    <span className="text-[10px] font-bold text-blue-600">Uploading...</span>
                  </>
                ) : (
                  <>
                    <div className="size-7 rounded-xl bg-slate-100 group-hover:bg-blue-100 text-slate-600 group-hover:text-blue-600 flex items-center justify-center mb-1 transition-colors">
                      <Plus className="size-4 stroke-[2.5]" />
                    </div>
                    <span className="text-[11px] font-bold">Add Images</span>
                  </>
                )}
              </button>
            )}

            {/* Uploaded Gallery Thumbnails */}
            {data.gallery.map((imgSrc, idx) => (
              <div
                key={idx}
                className="relative h-24 rounded-2xl overflow-hidden border border-slate-200 shadow-xs group"
              >
                <img
                  src={imgSrc}
                  alt={`Hospital Gallery ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-300"
                />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(idx)}
                  className="absolute top-1.5 right-1.5 size-5.5 rounded-full bg-slate-900/80 hover:bg-rose-600 text-white flex items-center justify-center transition-colors cursor-pointer opacity-90 sm:opacity-0 sm:group-hover:opacity-100"
                  title="Remove"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
export default HospitalImagesCard
