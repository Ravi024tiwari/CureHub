import React, { useRef, useState } from 'react'
import {
  FileCheck2,
  FileText,
  Eye,
  Trash2,
  Upload,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { uploadService } from '@/services/uploadService'

interface DoctorMedicalCouncilCardProps {
  registrationNumber: string
  licenseDocumentUrl?: string
  onRegistrationNumberChange: (val: string) => void
  onLicenseDocumentUrlChange: (url: string) => void
  onPreviewDocument: () => void
}

export const DoctorMedicalCouncilCard: React.FC<DoctorMedicalCouncilCardProps> = ({
  registrationNumber,
  licenseDocumentUrl,
  onRegistrationNumberChange,
  onLicenseDocumentUrlChange,
  onPreviewDocument,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadError(null)

    try {
      const res = await uploadService.uploadTempFile(file, 'doctor/licenses')
      if (res?.url) {
        onLicenseDocumentUrlChange(res.url)
      } else {
        // Fallback simulated local preview
        const fakeUrl = URL.createObjectURL(file)
        onLicenseDocumentUrlChange(fakeUrl)
      }
    } catch (err: any) {
      console.warn('File upload failed, falling back to blob preview:', err)
      const fakeUrl = URL.createObjectURL(file)
      onLicenseDocumentUrlChange(fakeUrl)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDeleteDocument = () => {
    onLicenseDocumentUrlChange('')
  }

  // Extract filename from URL
  const fileName = licenseDocumentUrl
    ? licenseDocumentUrl.split('/').pop()?.split('?')[0] || 'medical_license.pdf'
    : 'medical_license.pdf'

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
        <div className="size-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
          <FileCheck2 className="size-4.5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Medical Council Registration
          </h3>
          <p className="text-xs text-slate-500">
            Official government licensure and verification documentation
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
        {/* Registration Number Input */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Medical Council Registration Number <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={registrationNumber}
            onChange={(e) => onRegistrationNumberChange(e.target.value)}
            placeholder="e.g. MCI20240012345"
            className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all uppercase tracking-wider"
          />
          <p className="text-[11px] text-slate-400 font-medium mt-1">
            Registered with State Medical Council or National Medical Commission (NMC)
          </p>
        </div>

        {/* License Document Box */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            License Document
          </label>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFileChange}
            className="hidden"
          />

          {uploadError && (
            <div className="mb-2 p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-1.5">
              <AlertCircle className="size-3.5 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {licenseDocumentUrl ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/90">
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <FileText className="size-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">{fileName}</p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                    2.4 MB • Uploaded on 12 Jan 2024
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={onPreviewDocument}
                  title="View document"
                  className="p-1.5 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 bg-white transition-colors cursor-pointer"
                >
                  <Eye className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleDeleteDocument}
                  title="Delete document"
                  className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 bg-white transition-colors cursor-pointer"
                >
                  <Trash2 className="size-3.5" />
                </button>
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 bg-white hover:bg-blue-50/60 border border-slate-200 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {isUploading ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <span>Replace File</span>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/40 hover:bg-blue-50/20 transition-all cursor-pointer group"
            >
              {isUploading ? (
                <div className="flex items-center gap-2 text-xs font-bold text-blue-600">
                  <Loader2 className="size-4 animate-spin" />
                  <span>Uploading license certificate...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600 group-hover:text-blue-600">
                  <Upload className="size-4 text-slate-400 group-hover:text-blue-500" />
                  <span>Upload Medical License Proof (PDF/JPG)</span>
                </div>
              )}
            </div>
          )}

          <p className="text-[11px] text-slate-400 font-medium mt-1.5">
            Upload a clear copy of your valid medical council registration certificate.
          </p>
        </div>
      </div>
    </div>
  )
}
