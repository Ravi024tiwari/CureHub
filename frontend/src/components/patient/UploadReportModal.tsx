import { useState, type FC } from 'react'
import { X, UploadCloud, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface UploadReportModalProps {
  isOpen: boolean
  onClose: () => void
}

export const UploadReportModal: FC<UploadReportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  const [fileName, setFileName] = useState<string | null>(null)
  const [reportType, setReportType] = useState('Blood Test')
  const [isSuccess, setIsSuccess] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const handleSimulatedUpload = () => {
    if (!fileName) return
    setIsUploading(true)
    setTimeout(() => {
      setIsUploading(false)
      setIsSuccess(true)
    }, 1200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <UploadCloud className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Upload Health Report</h3>
              <p className="text-[11px] text-slate-400">Add to your electronic medical records</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-6 text-center space-y-3">
            <div className="size-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="size-8" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Report Uploaded Successfully!</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              "{fileName}" has been securely stored and linked to your patient profile.
            </p>
            <Button
              onClick={onClose}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs px-6"
            >
              Done
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Report Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Report Type
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="Blood Test">Blood Test & Pathology</option>
                <option value="Radiology">X-Ray / MRI / CT Scan</option>
                <option value="Prescription">Doctor Prescription</option>
                <option value="Discharge Summary">Discharge Summary</option>
                <option value="Vaccination">Vaccination Record</option>
              </select>
            </div>

            {/* Dropzone */}
            <label
              htmlFor="report-file-input"
              className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-50/50 hover:bg-blue-50/20 transition-all text-center"
            >
              <UploadCloud className="size-8 text-blue-500" />
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-800">
                  {fileName ? fileName : 'Click to select or drag and drop'}
                </p>
                <p className="text-[10px] text-slate-400">PDF, PNG, JPG (up to 15MB)</p>
              </div>
              <input
                id="report-file-input"
                type="file"
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFileName(e.target.files[0].name)
                  }
                }}
              />
            </label>

            <Button
              disabled={!fileName || isUploading}
              onClick={handleSimulatedUpload}
              className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs cursor-pointer shadow-md shadow-blue-500/20 disabled:opacity-50"
            >
              {isUploading ? 'Uploading...' : 'Upload & Encrypt'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
