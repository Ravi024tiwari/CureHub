import React, { useState, useEffect } from 'react'
import { X, Upload, FileText, Check, AlertCircle } from 'lucide-react'

// ==========================================
// 1. Add / Edit Qualification Modal
// ==========================================
export interface QualificationData {
  degree: string
  institution: string
  period: string
}

interface QualificationModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: QualificationData) => void
  initialData?: QualificationData | null
}

export const QualificationModal: React.FC<QualificationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [degree, setDegree] = useState('')
  const [institution, setInstitution] = useState('')
  const [period, setPeriod] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (initialData) {
      setDegree(initialData.degree || '')
      setInstitution(initialData.institution || '')
      setPeriod(initialData.period || '')
    } else {
      setDegree('')
      setInstitution('')
      setPeriod('')
    }
    setError('')
  }, [initialData, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!degree.trim()) {
      setError('Please enter degree or qualification title.')
      return
    }
    if (!institution.trim()) {
      setError('Please enter university or institution name.')
      return
    }
    if (!period.trim()) {
      setError('Please enter period or year (e.g. 2010 - 2015).')
      return
    }

    onSave({
      degree: degree.trim(),
      institution: institution.trim(),
      period: period.trim(),
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {initialData ? 'Edit Qualification' : 'Add Qualification'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your medical degree, college, and completion years
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Degree / Qualification Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. MBBS, MD (Cardiology), MS, DNB"
              value={degree}
              onChange={(e) => setDegree(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              University / Medical College <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. AIIMS, New Delhi or PGI, Chandigarh"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Years / Period <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 2010 - 2015"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              {initialData ? 'Update Qualification' : 'Add Qualification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ==========================================
// 2. Add / Edit Experience Modal
// ==========================================
export interface ExperienceData {
  title: string
  institution: string
  period: string
  duration?: string
  description?: string
}

interface ExperienceModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: ExperienceData) => void
  initialData?: ExperienceData | null
}

export const ExperienceModal: React.FC<ExperienceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [title, setTitle] = useState('')
  const [institution, setInstitution] = useState('')
  const [period, setPeriod] = useState('')
  const [duration, setDuration] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '')
      setInstitution(initialData.institution || '')
      setPeriod(initialData.period || '')
      setDuration(initialData.duration || '')
      setDescription(initialData.description || '')
    } else {
      setTitle('')
      setInstitution('')
      setPeriod('')
      setDuration('')
      setDescription('')
    }
    setError('')
  }, [initialData, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Please enter your role or job title.')
      return
    }
    if (!institution.trim()) {
      setError('Please enter hospital or institution name.')
      return
    }
    if (!period.trim()) {
      setError('Please enter working period (e.g. 2021 - Present).')
      return
    }

    onSave({
      title: title.trim(),
      institution: institution.trim(),
      period: period.trim(),
      duration: duration.trim() || undefined,
      description: description.trim() || undefined,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {initialData ? 'Edit Experience' : 'Add Experience'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Specify your clinical designation, hospital, and tenure
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Role / Designation <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Consultant Cardiologist, Senior Resident"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Hospital / Institution Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Apollo Multispeciality Hospital, Bilaspur"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Period <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 2021 - Present"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Duration (optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 3+ years"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Responsibilities / Highlights (optional)
            </label>
            <textarea
              rows={2}
              placeholder="Key accomplishments or specialized procedures performed..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              {initialData ? 'Update Experience' : 'Add Experience'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ==========================================
// 3. Document Preview Modal
// ==========================================
interface DocumentPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  documentUrl?: string
  title?: string
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  documentUrl,
  title = 'Medical License Certificate',
}) => {
  if (!isOpen) return null

  const isPdf = documentUrl?.toLowerCase().includes('.pdf') || !documentUrl?.match(/\.(jpeg|jpg|gif|png|webp)$/i)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <FileText className="size-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{title}</h3>
              <p className="text-[11px] text-slate-500">Official verified document preview</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto flex items-center justify-center bg-slate-100/50">
          {documentUrl ? (
            isPdf ? (
              <div className="w-full text-center space-y-4 py-8">
                <div className="size-16 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
                  <FileText className="size-8" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">PDF Document Stored</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto truncate">
                    {documentUrl}
                  </p>
                </div>
                <a
                  href={documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all"
                >
                  <span>Open Document in New Tab</span>
                </a>
              </div>
            ) : (
              <img
                src={documentUrl}
                alt={title}
                className="max-h-[60vh] max-w-full rounded-xl object-contain shadow-sm border border-slate-200"
              />
            )
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              No document URL attached yet.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ==========================================
// 4. Change Avatar Modal
// ==========================================
interface AvatarModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectAvatar: (avatarUrl: string) => void
  currentAvatar?: string | null
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1594824813589-383794b1509a?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&auto=format&fit=crop&q=80',
]

export const AvatarModal: React.FC<AvatarModalProps> = ({
  isOpen,
  onClose,
  onSelectAvatar,
  currentAvatar,
}) => {
  const [customUrl, setCustomUrl] = useState('')
  const [selected, setSelected] = useState(currentAvatar || PRESET_AVATARS[0])

  useEffect(() => {
    if (currentAvatar) setSelected(currentAvatar)
  }, [currentAvatar, isOpen])

  if (!isOpen) return null

  const handleApply = () => {
    const finalAvatar = customUrl.trim() || selected
    onSelectAvatar(finalAvatar)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">Update Profile Photo</h3>
            <p className="text-xs text-slate-500 mt-0.5">Choose a photo for your doctor profile</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Select from Presets
            </label>
            <div className="grid grid-cols-3 gap-3">
              {PRESET_AVATARS.map((url, idx) => {
                const isSelected = selected === url && !customUrl
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelected(url)
                      setCustomUrl('')
                    }}
                    className={`relative rounded-2xl overflow-hidden aspect-square border-2 transition-all cursor-pointer group ${
                      isSelected
                        ? 'border-blue-600 ring-2 ring-blue-500/30'
                        : 'border-slate-200 hover:border-blue-400'
                    }`}
                  >
                    <img
                      src={url}
                      alt={`Avatar option ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-blue-600/30 flex items-center justify-center text-white">
                        <Check className="size-5 drop-shadow" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Or Paste Direct Image URL
            </label>
            <input
              type="url"
              placeholder="https://example.com/photo.jpg"
              value={customUrl}
              onChange={(e) => {
                setCustomUrl(e.target.value)
                if (e.target.value) setSelected(e.target.value)
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              Apply Photo
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
