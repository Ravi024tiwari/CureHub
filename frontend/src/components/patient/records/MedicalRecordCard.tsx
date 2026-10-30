import { useState, useRef, useEffect, type FC } from 'react'
import {
  FileText,
  Calendar,
  MoreVertical,
  Download,
  Share2,
  Trash2,
  Eye,
  FlaskConical,
  Scan,
  Pill,
  ShieldCheck,
  Activity,
  HeartPulse,
} from 'lucide-react'
import type { MedicalRecordItem } from '@/types/patient'
import { usePatientStore } from '@/store/patientStore'

interface MedicalRecordCardProps {
  record: MedicalRecordItem
}

export const MedicalRecordCard: FC<MedicalRecordCardProps> = ({ record }) => {
  const { openViewer, openDeleteModal } = usePatientStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu on click outside
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

  // Resolve themed category styling & icon
  const getCategoryTheme = () => {
    const cat = record.category.toLowerCase()
    const title = record.title.toLowerCase()

    if (cat.includes('lab') || title.includes('blood') || title.includes('test') || title.includes('ecg')) {
      return {
        badgeBg: 'bg-rose-50 text-rose-600 border-rose-200/80',
        iconBg: 'bg-rose-50 border-rose-100 text-rose-600',
        Icon: title.includes('ecg') ? HeartPulse : FlaskConical,
        label: 'Lab Report',
      }
    }
    if (cat.includes('imaging') || title.includes('x-ray') || title.includes('mri') || title.includes('scan') || title.includes('ultrasound')) {
      return {
        badgeBg: 'bg-sky-50 text-sky-600 border-sky-200/80',
        iconBg: 'bg-sky-50 border-sky-100 text-sky-600',
        Icon: Scan,
        label: 'Imaging',
      }
    }
    if (cat.includes('prescription') || title.includes('prescription') || title.includes('rx')) {
      return {
        badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
        iconBg: 'bg-emerald-50 border-emerald-100 text-emerald-600',
        Icon: Pill,
        label: 'Prescription',
      }
    }
    return {
      badgeBg: 'bg-purple-50 text-purple-600 border-purple-200/80',
      iconBg: 'bg-purple-50 border-purple-100 text-purple-600',
      Icon: ShieldCheck,
      label: record.category || 'Others',
    }
  }

  const theme = getCategoryTheme()
  const CategoryIcon = theme.Icon

  // Format date display (e.g., "12 Oct 2026")
  const formattedDate = new Date(record.uploadedAt).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsMenuOpen(false)
    // Create download anchor
    const link = document.createElement('a')
    link.href = record.fileUrl
    link.download = `${record.title.replace(/\s+/g, '_')}.${record.fileType.toLowerCase() || 'pdf'}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsMenuOpen(false)
    if (navigator.share) {
      navigator
        .share({
          title: record.title,
          text: `Medical Report: ${record.title} (${record.category})`,
          url: window.location.href,
        })
        .catch(() => {})
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/patient/records?id=${record._id}`)
      alert('Report link copied to clipboard!')
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsMenuOpen(false)
    openDeleteModal(record)
  }

  return (
    <div
      onClick={() => openViewer(record)}
      className="group relative bg-white border border-slate-200/90 hover:border-blue-400/80 rounded-3xl p-5 transition-all duration-200 shadow-xs hover:shadow-xl hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Top Header: Icon & Category Badge */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div
            className={`size-12 rounded-2xl border flex items-center justify-center transition-transform group-hover:scale-105 shrink-0 shadow-2xs ${theme.iconBg}`}
          >
            <CategoryIcon className="size-5.5 stroke-[2.2]" />
          </div>

          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${theme.badgeBg}`}
          >
            <Activity className="size-3.5 shrink-0 stroke-[2.2]" />
            <span>{theme.label}</span>
          </span>
        </div>

        {/* Title */}
        <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 mt-3 mb-2">
          {record.title}
        </h4>

        {/* Metadata info */}
        <div className="space-y-1.5 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-2 text-slate-500">
            <Calendar className="size-4 text-slate-400 shrink-0" />
            <span>{formattedDate}</span>
          </div>

          <div className="flex items-center gap-2 text-slate-500">
            <FileText className="size-4 text-slate-400 shrink-0" />
            <span>
              {record.fileType.toUpperCase()} • {record.fileSize || '1.2 MB'}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation()
            openViewer(record)
          }}
          className="flex-1 py-2.5 px-4 bg-[#f0f6ff] hover:bg-blue-600 text-blue-600 hover:text-white rounded-2xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
        >
          <Eye className="size-4 stroke-[2.2]" />
          <span>View</span>
        </button>

        {/* More options menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsMenuOpen(!isMenuOpen)
            }}
            aria-label="More options"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-200"
          >
            <MoreVertical className="size-4" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 bottom-full mb-1.5 w-44 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={handleDownload}
                className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
              >
                <Download className="size-3.5 text-slate-400" />
                <span>Download File</span>
              </button>
              <button
                onClick={handleShare}
                className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
              >
                <Share2 className="size-3.5 text-slate-400" />
                <span>Share Record</span>
              </button>
              <div className="my-1 border-t border-slate-100" />
              <button
                onClick={handleDelete}
                className="w-full px-3 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
              >
                <Trash2 className="size-3.5 text-rose-500" />
                <span>Delete Report</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
