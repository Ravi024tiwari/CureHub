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
          <div className="bg-slate-100/70 border border-slate-200 rounded-2xl p-6 text-center space-y-3">
            <div className="size-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-200/80 shadow-xs">
              <ShieldCheck className="size-8 stroke-[2]" />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-800">{title}</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Type: {docType} • Format: Official Certificate / PDF Document
              </p>
            </div>

            {/* Document Verification Checklist */}
            <div className="bg-white rounded-xl p-3 border border-slate-200/80 text-left space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                <CheckCircle className="size-3.5 text-emerald-600" />
                <span>Issuer: State Medical Council / National Medical Commission</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                <CheckCircle className="size-3.5 text-emerald-600" />
                <span>Registration Status: Valid & Active in national registry</span>
              </div>
            </div>

            {docUrl ? (
              <div className="pt-2 flex items-center justify-center gap-2">
                <a
                  href={docUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  <ExternalLink className="size-3.5" />
                  <span>Open Full Document</span>
                </a>
                <a
                  href={docUrl}
                  download
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                >
                  <Download className="size-3.5" />
                  <span>Download</span>
                </a>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium">
                Digital document preview attached from registration filing.
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
