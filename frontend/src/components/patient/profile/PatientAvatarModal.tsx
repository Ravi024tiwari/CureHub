import { useState, useRef, type FC, type ChangeEvent } from 'react'
import {
  X,
  UploadCloud,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react'

interface PatientAvatarModalProps {
  isOpen: boolean
  currentAvatar?: string
  patientName?: string
  onClose: () => void
  onSaveAvatar: (file: File | null, urlString?: string) => Promise<boolean | void>
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
]

export const PatientAvatarModal: FC<PatientAvatarModalProps> = ({
  isOpen,
  currentAvatar,
  patientName = 'Patient',
  onClose,
  onSaveAvatar,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>(currentAvatar || '')
  const [urlInput, setUrlInput] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null)
    const file = e.target.files?.[0]
    if (!file) return

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image size must be under 5MB')
      return
    }

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPG, PNG, WEBP)')
      return
    }

    setSelectedFile(file)
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
  }

  const handlePresetSelect = (preset: string) => {
    setErrorMessage(null)
    setSelectedFile(null)
    setPreviewUrl(preset)
  }

  const handleUrlApply = () => {
    if (!urlInput.trim()) return
    setErrorMessage(null)
    setSelectedFile(null)
    setPreviewUrl(urlInput.trim())
  }

  const handleConfirm = async () => {
    if (!selectedFile && !previewUrl) {
      setErrorMessage('Please select or upload an avatar image')
      return
    }

    setIsUploading(true)
    setErrorMessage(null)

    try {
      if (selectedFile) {
        await onSaveAvatar(selectedFile)
      } else if (previewUrl) {
        await onSaveAvatar(null, previewUrl)
      }
      onClose()
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to upload photo')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-white border border-slate-200/90 shadow-2xl p-6 sm:p-7 space-y-6 relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="size-10 rounded-2xl bg-[#eef3ff] text-[#5170f4] flex items-center justify-center">
              <ImageIcon className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Change Profile Photo</h3>
              <p className="text-xs text-slate-500 font-medium">Upload or select a verified avatar for your health card</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors disabled:opacity-50"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Live Circular Preview */}
        <div className="flex flex-col items-center justify-center py-2 space-y-2">
          <div className="relative size-28 sm:size-32 rounded-3xl overflow-hidden ring-4 ring-[#c8d7fd] bg-slate-100 shadow-xl shadow-[#5170f4]/15 flex items-center justify-center text-white text-4xl font-black">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Avatar preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-[#5170f4]">
                {patientName ? patientName.charAt(0).toUpperCase() : 'P'}
              </span>
            )}

            {isUploading && (
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-2xs flex flex-col items-center justify-center text-white">
                <Loader2 className="size-7 animate-spin" />
                <span className="text-[10px] font-bold mt-1">Uploading...</span>
              </div>
            )}
          </div>
          <span className="text-xs font-bold text-slate-500">Live Circular Preview</span>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Option 1: Drag & Drop File Browse Zone */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-wider text-slate-600 block">
            Upload from device
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleFileChange}
            className="hidden"
          />

          <div
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#c8d7fd] hover:border-[#5170f4] rounded-2xl p-5 text-center bg-[#f8fbff]/60 hover:bg-[#eef3ff]/60 cursor-pointer transition-all group"
          >
            <UploadCloud className="size-8 mx-auto text-[#637ff5] group-hover:scale-110 transition-transform mb-1.5" />
            <p className="text-xs font-bold text-slate-800">
              {selectedFile ? `Selected: ${selectedFile.name}` : 'Click to browse image from your device'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Supports JPG, PNG or WEBP (Max 5MB)
            </p>
          </div>
        </div>

        {/* Option 2: Quick Select Preset Avatars */}
        <div className="space-y-2 pt-1">
          <label className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-[#637ff5]" />
            <span>Or choose a verified preset avatar</span>
          </label>
          <div className="grid grid-cols-6 gap-2">
            {PRESET_AVATARS.map((url, idx) => {
              const isSelected = previewUrl === url
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePresetSelect(url)}
                  disabled={isUploading}
                  className={`relative aspect-square rounded-2xl overflow-hidden ring-2 transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                    isSelected
                      ? 'ring-[#5170f4] shadow-md shadow-[#5170f4]/30 scale-105'
                      : 'ring-transparent hover:ring-slate-300'
                  }`}
                >
                  <img
                    src={url}
                    alt={`Preset ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-[#5170f4]/25 flex items-center justify-center text-white">
                      <Check className="size-4 stroke-[3]" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Option 3: Or Paste Image URL */}
        <div className="space-y-1.5 pt-1">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Or paste direct image URL
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              disabled={isUploading}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#5170f4]/20"
            />
            <button
              type="button"
              onClick={handleUrlApply}
              disabled={isUploading}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer transition-colors"
            >
              Apply
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold cursor-pointer transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isUploading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#5170f4] to-[#637ff5] hover:from-[#4361ee] hover:to-[#5170f4] text-white text-xs font-black shadow-md shadow-[#637ff5]/25 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Saving to CarePlus...</span>
              </>
            ) : (
              <>
                <Check className="size-4" />
                <span>Upload & Save Photo</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
