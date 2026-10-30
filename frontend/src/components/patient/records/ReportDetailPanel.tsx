import { useState, type FC } from 'react'
import {
  X,
  Calendar,
  Building2,
  User,
  FileText,
  Tag,
  Download,
  Share2,
  Heart,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react'
import type { MedicalRecordItem } from '@/types/patient'
import { usePatientStore } from '@/store/patientStore'

interface ReportDetailPanelProps {
  record: MedicalRecordItem
  onClose: () => void
  isMobileModal?: boolean
}

export const ReportDetailPanel: FC<ReportDetailPanelProps> = ({
  record,
  onClose,
  isMobileModal = false,
}) => {
  const { toggleFavorite, openDeleteModal, openViewer } = usePatientStore()
  const [currentPage, setCurrentPage] = useState(1)
  const [zoomLevel, setZoomLevel] = useState(100)

  // Format Date (e.g. 12 Oct 2024, 10:30 AM)
  const formattedDateTime = new Date(record.uploadedAt).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = record.fileUrl || '#'
    link.download = `${record.title.replace(/\s+/g, '_')}.${record.fileType.toLowerCase() || 'pdf'}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: record.title, url: record.fileUrl }).catch(() => {})
    } else {
      navigator.clipboard.writeText(record.fileUrl || window.location.href)
      alert('Report link copied to clipboard!')
    }
  }

  // Tags list
  const tags = record.tags && record.tags.length > 0
    ? record.tags
    : ['Blood Test', 'Routine Checkup', 'Annual Diagnostic']

  // Category Badge
  const getCategoryClass = () => {
    const c = record.category.toLowerCase()
    if (c.includes('lab')) return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    if (c.includes('imaging')) return 'bg-blue-50 text-blue-700 border-blue-200'
    if (c.includes('prescription')) return 'bg-purple-50 text-purple-700 border-purple-200'
    if (c.includes('discharge')) return 'bg-amber-50 text-amber-700 border-amber-200'
    return 'bg-slate-50 text-slate-700 border-slate-200'
  }

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5 animate-in fade-in duration-200">
      {/* Panel Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          {isMobileModal && (
            <button
              onClick={onClose}
              className="p-1 -ml-1 text-slate-500 hover:text-slate-900 rounded-lg"
            >
              <ChevronLeft className="size-5" />
            </button>
          )}
          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            Report Details
          </h3>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          title="Close details"
        >
          <X className="size-5" />
        </button>
      </div>

      {/* Embedded Document Preview Box matching mockup */}
      <div className="relative rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shadow-inner">
        {/* Document Canvas Simulation */}
        <div className="p-4 bg-slate-200/60 flex items-center justify-center min-h-[200px] sm:min-h-[220px]">
          <div
            style={{ transform: `scale(${zoomLevel / 100})` }}
            className="w-full max-w-[340px] bg-white rounded-lg shadow-md border border-slate-200 p-4 space-y-2 transition-transform duration-150"
          >
            {/* Header of Report Document */}
            <div className="text-center pb-2 border-b border-slate-200">
              <div className="flex items-center justify-center gap-1.5 text-blue-700 font-extrabold text-[11px] uppercase tracking-wide">
                <Building2 className="size-3.5" />
                <span>{record.hospitalName || 'City Care Hospital'}</span>
              </div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                LABORATORY & CLINICAL REPORT
              </p>
            </div>

            {/* Patient & Test Row */}
            <div className="grid grid-cols-2 gap-2 text-[8px] text-slate-600 py-1 border-b border-slate-100">
              <div>
                <span className="text-slate-400">Patient: </span>
                <strong className="text-slate-800">You</strong>
              </div>
              <div className="text-right">
                <span className="text-slate-400">Date: </span>
                <strong className="text-slate-800">{new Date(record.uploadedAt).toLocaleDateString()}</strong>
              </div>
            </div>

            {/* Test Results Simulation Table */}
            <div className="space-y-1 py-1">
              <div className="flex justify-between text-[8px] font-bold text-slate-500 uppercase border-b border-slate-100 pb-0.5">
                <span>Test Investigation</span>
                <span>Result</span>
                <span>Ref Range</span>
              </div>
              <div className="flex justify-between text-[8px] text-slate-700">
                <span>Hemoglobin (Hb)</span>
                <strong className="text-emerald-700">14.2 g/dL</strong>
                <span className="text-slate-400">13.0 - 17.0</span>
              </div>
              <div className="flex justify-between text-[8px] text-slate-700">
                <span>RBC Count</span>
                <strong className="text-emerald-700">4.8 mil/uL</strong>
                <span className="text-slate-400">4.5 - 5.5</span>
              </div>
              <div className="flex justify-between text-[8px] text-slate-700">
                <span>Total WBC Count</span>
                <strong className="text-emerald-700">7,200 /uL</strong>
                <span className="text-slate-400">4,000 - 11,000</span>
              </div>
              <div className="flex justify-between text-[8px] text-slate-700">
                <span>Platelet Count</span>
                <strong className="text-emerald-700">240,000 /uL</strong>
                <span className="text-slate-400">150,000 - 450,000</span>
              </div>
            </div>

            {/* Doctor Seal */}
            <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[8px]">
              <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                <ShieldCheck className="size-2.5" /> Verified Sign
              </span>
              <span className="text-slate-500 font-semibold">{record.doctorName || 'Dr. Amit Kumar'}</span>
            </div>
          </div>
        </div>

        {/* Toolbar Bar below preview */}
        <div className="bg-slate-900/90 text-white px-3 py-1.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1 hover:bg-white/20 rounded disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="size-3.5" />
            </button>
            <span className="text-[11px] font-mono font-medium">{currentPage} / 2</span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(2, p + 1))}
              disabled={currentPage >= 2}
              className="p-1 hover:bg-white/20 rounded disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="size-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setZoomLevel((z) => Math.max(70, z - 15))}
              className="p-1 hover:bg-white/20 rounded cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="size-3.5" />
            </button>
            <span className="text-[10px] font-mono text-white/80">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(150, z + 15))}
              className="p-1 hover:bg-white/20 rounded cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="size-3.5" />
            </button>
            <button
              onClick={() => openViewer(record)}
              className="p-1 hover:bg-white/20 rounded ml-1 cursor-pointer"
              title="Full screen view"
            >
              <Maximize2 className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Title & Badge */}
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h4 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            {record.title}
          </h4>
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getCategoryClass()}`}>
            {record.category}
          </span>
        </div>
      </div>

      {/* Info Key-Value Grid */}
      <div className="space-y-2.5 py-1 text-xs">
        <div className="flex items-center justify-between py-1 border-b border-slate-100">
          <span className="text-slate-500 font-semibold flex items-center gap-1.5">
            <Calendar className="size-3.5 text-slate-400" /> Date
          </span>
          <span className="font-bold text-slate-900">{formattedDateTime}</span>
        </div>

        <div className="flex items-center justify-between py-1 border-b border-slate-100">
          <span className="text-slate-500 font-semibold flex items-center gap-1.5">
            <Building2 className="size-3.5 text-slate-400" /> Hospital
          </span>
          <span className="font-bold text-slate-900 truncate max-w-[200px]">
            {record.hospitalName || 'City Care Hospital'}
          </span>
        </div>

        <div className="flex items-center justify-between py-1 border-b border-slate-100">
          <span className="text-slate-500 font-semibold flex items-center gap-1.5">
            <User className="size-3.5 text-slate-400" /> Doctor
          </span>
          <span className="font-bold text-slate-900">
            {record.doctorName || 'Dr. Amit Kumar'}
          </span>
        </div>

        <div className="flex items-center justify-between py-1 border-b border-slate-100">
          <span className="text-slate-500 font-semibold flex items-center gap-1.5">
            <FileText className="size-3.5 text-slate-400" /> File Type
          </span>
          <span className="font-bold text-slate-900">
            {record.fileType.toUpperCase()} ({record.fileSize || '245 KB'})
          </span>
        </div>

        <div className="flex items-center justify-between py-1 border-b border-slate-100">
          <span className="text-slate-500 font-semibold flex items-center gap-1.5">
            <Tag className="size-3.5 text-slate-400" /> Category
          </span>
          <span className="font-bold text-slate-900">{record.category}</span>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Description</h5>
        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
          {record.notes ||
            'Complete blood count test to check overall health and detect a wide range of disorders such as anemia, infection, and other diseases.'}
        </p>
      </div>

      {/* Tags */}
      <div className="space-y-1.5">
        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Tags</h5>
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-100"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2 pt-2">
        {/* Full-width Download Button */}
        <button
          type="button"
          onClick={handleDownload}
          className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-md shadow-blue-600/25 transition-all cursor-pointer hover:shadow-lg hover:-translate-y-0.5"
        >
          <Download className="size-4" />
          <span>Download Report</span>
        </button>

        {/* Secondary Buttons Row: Share & Favorite */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center justify-center gap-2 py-2.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-2xl font-bold text-xs transition-all cursor-pointer"
          >
            <Share2 className="size-3.5 text-slate-500" />
            <span>Share</span>
          </button>

          <button
            type="button"
            onClick={() => toggleFavorite(record._id)}
            className={`inline-flex items-center justify-center gap-2 py-2.5 px-3 border rounded-2xl font-bold text-xs transition-all cursor-pointer ${
              record.isFavorite
                ? 'bg-rose-50 border-rose-200 text-rose-700'
                : 'bg-white hover:bg-rose-50/40 border-slate-200 text-slate-700'
            }`}
          >
            <Heart
              className={`size-3.5 ${
                record.isFavorite ? 'fill-rose-600 text-rose-600' : 'text-slate-400'
              }`}
            />
            <span>{record.isFavorite ? 'Favorited' : 'Add to Favorites'}</span>
          </button>
        </div>

        {/* Delete button */}
        <button
          type="button"
          onClick={() => openDeleteModal(record)}
          className="w-full inline-flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
        >
          <Trash2 className="size-3.5" />
          <span>Delete Report</span>
        </button>
      </div>
    </div>
  )
}
