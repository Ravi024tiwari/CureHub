import { useState, useRef, useEffect, type FC } from 'react'
import {
  Calendar,
  Building2,
  User,
  Heart,
  Eye,
  Download,
  MoreHorizontal,
  Share2,
  Trash2,
  FileText,
  Activity,
  Scan,
} from 'lucide-react'
import type { MedicalRecordItem } from '@/types/patient'
import { usePatientStore } from '@/store/patientStore'

interface MedicalRecordCardProps {
  record: MedicalRecordItem
  isSelected?: boolean
  onSelect?: (record: MedicalRecordItem) => void
}

export const MedicalRecordCard: FC<MedicalRecordCardProps> = ({
  record,
  isSelected = false,
  onSelect,
}) => {
  const { toggleFavorite, openDeleteModal } = usePatientStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close popup menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMenuOpen])

  // Category Badge Theming matching exact UI mockup
  const getCategoryBadge = () => {
    const cat = record.category.toLowerCase()
    const title = record.title.toLowerCase()

    if (cat.includes('lab') || title.includes('blood') || title.includes('test') || title.includes('lipid') || title.includes('sugar') || title.includes('thyroid')) {
      return {
        label: 'Lab Report',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
        type: 'lab',
      }
    }
    if (cat.includes('imaging') || title.includes('x-ray') || title.includes('mri') || title.includes('scan') || title.includes('ultrasound')) {
      return {
        label: 'Imaging',
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200/80',
        type: 'imaging',
      }
    }
    if (cat.includes('prescription') || title.includes('prescription') || title.includes('rx')) {
      return {
        label: 'Prescription',
        badgeClass: 'bg-purple-50 text-purple-700 border-purple-200/80',
        type: 'prescription',
      }
    }
    if (cat.includes('discharge') || title.includes('discharge')) {
      return {
        label: 'Discharge Summary',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200/80',
        type: 'discharge',
      }
    }
    if (title.includes('ecg')) {
      return {
        label: 'Other',
        badgeClass: 'bg-sky-50 text-sky-700 border-sky-200/80',
        type: 'ecg',
      }
    }
    return {
      label: record.category || 'Other',
      badgeClass: 'bg-slate-50 text-slate-700 border-slate-200/80',
      type: 'other',
    }
  }

  const category = getCategoryBadge()

  // Format Date (e.g. 12 Oct 2024)
  const formattedDate = new Date(record.uploadedAt).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation()
    const link = document.createElement('a')
    link.href = record.fileUrl || '#'
    link.download = `${record.title.replace(/\s+/g, '_')}.${record.fileType.toLowerCase() || 'pdf'}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div
      onClick={() => onSelect?.(record)}
      className={`group relative bg-white border rounded-3xl p-4 sm:p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between ${
        isSelected
          ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md bg-blue-50/15'
          : 'border-slate-200/80 hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5 shadow-xs'
      }`}
    >
      <div>
        {/* Top Header: Category Pill & Favorite Heart Icon */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${category.badgeClass}`}
          >
            {category.label}
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              toggleFavorite(record._id)
            }}
            className={`p-1.5 rounded-full transition-all cursor-pointer ${
              record.isFavorite
                ? 'text-rose-500 bg-rose-50 hover:bg-rose-100 scale-105'
                : 'text-slate-300 hover:text-rose-500 hover:bg-rose-50/50'
            }`}
            title={record.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              className={`size-4 ${record.isFavorite ? 'fill-rose-500 stroke-rose-500' : 'stroke-current'}`}
            />
          </button>
        </div>

        {/* Thumbnail Preview Box matching mockup */}
        <div className="relative w-full h-28 sm:h-32 mb-3.5 rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center bg-slate-50 group-hover:border-slate-200 transition-colors">
          {category.type === 'imaging' ? (
            /* X-Ray / MRI Scan Dark Card Preview */
            <div className="w-full h-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-3 relative">
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:12px_12px]" />
              <div className="size-12 rounded-xl bg-sky-950/80 border border-sky-400/30 flex items-center justify-center text-sky-400 shadow-inner mb-1">
                <Scan className="size-6 animate-pulse" />
              </div>
              <span className="text-[10px] font-mono tracking-wider text-sky-200/80 font-bold uppercase">
                RADIOLOGY SCAN
              </span>
            </div>
          ) : category.type === 'ecg' ? (
            /* ECG Waveform Preview */
            <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center p-2 relative">
              <div className="w-full h-12 flex items-center justify-center text-rose-500">
                <Activity className="size-10 stroke-[2] animate-pulse" />
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-500">ECG TRACE • 72 BPM</span>
            </div>
          ) : (
            /* Lab / Prescription / Document Card Preview */
            <div className="w-24 sm:w-28 h-full bg-white shadow-xs border border-slate-200/80 rounded-t-xl p-2.5 flex flex-col justify-between mt-2 transform group-hover:-translate-y-1 transition-transform">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <div className="size-4 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center">
                  <FileText className="size-2.5" />
                </div>
                <div className="w-8 h-1 bg-slate-200 rounded-full" />
              </div>
              <div className="space-y-1 py-1">
                <div className="w-full h-1 bg-slate-100 rounded-full" />
                <div className="w-3/4 h-1 bg-slate-100 rounded-full" />
                <div className="w-1/2 h-1 bg-slate-100 rounded-full" />
              </div>
              <div className="pt-1 border-t border-slate-100 flex items-center justify-between">
                <div className="w-6 h-1 bg-emerald-300 rounded-full" />
                <span className="text-[8px] font-bold text-slate-400">PDF</span>
              </div>
            </div>
          )}
        </div>

        {/* Report Title */}
        <h4 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-2.5">
          {record.title}
        </h4>

        {/* Metadata Lines with clean icons */}
        <div className="space-y-1.5 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Calendar className="size-3.5 text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-600 truncate">{formattedDate}</span>
          </div>

          <div className="flex items-center gap-2">
            <Building2 className="size-3.5 text-slate-400 shrink-0" />
            <span className="font-medium text-slate-600 truncate">
              {record.hospitalName || 'City Care Hospital'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <User className="size-3.5 text-slate-400 shrink-0" />
            <span className="font-medium text-slate-600 truncate">
              {record.doctorName || 'Dr. Amit Kumar'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Row at Bottom */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onSelect?.(record)
          }}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-200/70 hover:border-blue-200"
        >
          <Eye className="size-3.5" />
          <span>View</span>
        </button>

        <button
          type="button"
          onClick={handleDownload}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-200/70"
          title="Download report"
        >
          <Download className="size-3.5" />
          <span>Download</span>
        </button>

        {/* More Actions Menu */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setIsMenuOpen((prev) => !prev)
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <MoreHorizontal className="size-4" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 bottom-full mb-1.5 w-40 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsMenuOpen(false)
                  onSelect?.(record)
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-xl font-medium"
              >
                <Eye className="size-3.5 text-slate-400" />
                <span>View Details</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsMenuOpen(false)
                  if (navigator.share) {
                    navigator.share({ title: record.title, url: record.fileUrl }).catch(() => {})
                  } else {
                    navigator.clipboard.writeText(record.fileUrl || window.location.href)
                    alert('Report link copied to clipboard!')
                  }
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-xl font-medium"
              >
                <Share2 className="size-3.5 text-slate-400" />
                <span>Share</span>
              </button>

              <div className="my-1 border-t border-slate-100" />

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsMenuOpen(false)
                  openDeleteModal(record)
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-xl font-bold"
              >
                <Trash2 className="size-3.5" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
