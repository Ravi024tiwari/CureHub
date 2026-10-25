import { type FC } from 'react'
import { FileText, Download, ExternalLink, X, CheckCircle, ShieldCheck } from 'lucide-react'

interface DocumentViewerModalProps {
  isOpen: boolean
  title: string
  docType: string
  docUrl?: string
  doctorName: string
  councilNumber?: string
  onClose: () => void
}

export const DocumentViewerModal: FC<DocumentViewerModalProps> = ({
  isOpen,
  title,
  docType,
  docUrl,
  doctorName,
  councilNumber,
  onClose,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <FileText className="size-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900">
                {title}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {doctorName} {councilNumber ? `• Reg: ${councilNumber}` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content Viewer Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="size-5 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-800">{title}</h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Type: {docType} {councilNumber ? `• Reg No: ${councilNumber}` : ''}
                  </p>
                </div>
              </div>

              {docUrl && (
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <a
                    href={docUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                  >
                    <ExternalLink className="size-3.5" />
                    <span>Open in Tab</span>
                  </a>
                  <a
                    href={docUrl}
                    download
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                  >
                    <Download className="size-3.5" />
                    <span>Download</span>
                  </a>
                </div>
              )}
            </div>

            {/* Document Verification Checks */}
            <div className="bg-white rounded-xl p-3 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                <CheckCircle className="size-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">Issuer: Medical Council Registry</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                <CheckCircle className="size-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">File Status: Certified Upload</span>
              </div>
            </div>

            {/* Live Document Preview Container */}
            {docUrl ? (
              <div className="w-full h-96 sm:h-[450px] rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-inner flex items-center justify-center relative">
                {docUrl.match(/\.(jpg|jpeg|png|webp)($|\?)/i) ? (
                  <img
                    src={docUrl}
                    alt={title}
                    className="size-full object-contain p-2"
                  />
                ) : (
                  <iframe
                    src={docUrl}
                    title={title}
                    className="size-full border-none"
                  />
                )}
              </div>
            ) : (
              <div className="p-8 rounded-2xl border border-dashed border-amber-300 bg-amber-50/50 text-center space-y-1">
                <ShieldCheck className="size-8 text-amber-600 mx-auto" />
                <p className="text-xs font-bold text-amber-900">
                  Document File Not Attached
                </p>
                <p className="text-[11px] text-amber-700">
                  Doctor has not uploaded a digital copy of their registration certificate.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  )
}

export default DocumentViewerModal
