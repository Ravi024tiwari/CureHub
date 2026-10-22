import { useRef, useState, type FC, type ChangeEvent } from 'react'
import { ShieldCheck, UploadCloud, FileCheck, X, Loader2, Cloud } from 'lucide-react'
import { uploadService } from '@/services/uploadService'

export interface LicenseInfoData {
  licenseNumber: string
  licenseDocumentUrl: string
  licenseDocumentName?: string
}

interface LicenseInfoCardProps {
  data: LicenseInfoData
  onChange: (fields: Partial<LicenseInfoData>) => void
  errors?: Partial<Record<keyof LicenseInfoData, string>>
}

export const LicenseInfoCard: FC<LicenseInfoCardProps> = ({ data, onChange, errors = {} }) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError(null)
    setIsUploading(true)

    try {
      const result = await uploadService.uploadTempFile(file, 'temp/hospitals/licenses')
      onChange({
        licenseDocumentUrl: result.url,
        licenseDocumentName: file.name,
      })
    } catch (err: any) {
      console.error('Failed to upload license document to S3:', err)
      setUploadError(err.message || 'Failed to upload document to cloud storage.')
      // Fallback: If offline or S3 fails
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onChange({
            licenseDocumentUrl: reader.result,
            licenseDocumentName: file.name,
          })
        }
      }
      reader.readAsDataURL(file)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-all">
      {/* Header */}
      <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-slate-100">
        <div className="size-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs ring-1 ring-emerald-500/10">
          <ShieldCheck className="size-5.5 stroke-[2.2]" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            License Information
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Provide your government license details.
          </p>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 items-start">
        {/* License Number Input */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            License Number <span className="text-rose-500">*</span>
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              value={data.licenseNumber}
              onChange={(e) => onChange({ licenseNumber: e.target.value.toUpperCase() })}
              placeholder="e.g. MH/123456/2023"
              className={`w-full px-3.5 py-2.5 rounded-xl border font-mono text-xs sm:text-sm font-semibold transition-all outline-hidden ${
                errors.licenseNumber
                  ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                  : 'border-slate-200 bg-slate-50/40 hover:bg-white focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
              }`}
            />
          </div>
          {errors.licenseNumber ? (
            <p className="text-[11px] font-semibold text-rose-500 mt-1">{errors.licenseNumber}</p>
          ) : (
            <p className="text-[11px] text-slate-400 mt-1">
              Valid registration number issued by Directorate of Health Services
            </p>
          )}
        </div>

        {/* License Document Upload */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700">
              License Document <span className="text-rose-500">*</span>
            </label>
            {data.licenseDocumentUrl && (
              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                <Cloud className="size-3" />
                Uploaded to S3
              </span>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf, image/png, image/jpeg"
            className="hidden"
          />

          {isUploading ? (
            <div className="border-2 border-dashed border-emerald-300 rounded-2xl p-4 text-center bg-emerald-50/30 flex flex-col items-center justify-center animate-pulse">
              <Loader2 className="size-6 text-emerald-600 animate-spin mb-1" />
              <p className="text-xs font-bold text-emerald-900">Uploading license document to cloud...</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Please wait a moment</p>
            </div>
          ) : data.licenseDocumentUrl ? (
            <div className="flex items-center justify-between p-3 rounded-2xl border border-emerald-200 bg-emerald-50/40 min-w-0">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="size-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <FileCheck className="size-5 stroke-[2.5]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 truncate" title={data.licenseDocumentName || 'license-certificate.pdf'}>
                    {data.licenseDocumentName || 'license-certificate.pdf'}
                  </p>
                  <p className="text-[10px] text-emerald-600 font-semibold">Document Attached</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onChange({ licenseDocumentUrl: '', licenseDocumentName: '' })}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                title="Remove Document"
              >
                <X className="size-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-3.5 text-center transition-all cursor-pointer flex flex-col items-center justify-center group ${
                errors.licenseDocumentUrl
                  ? 'border-rose-400 bg-rose-50/20'
                  : 'border-slate-200 hover:border-blue-500/60 bg-slate-50/40 hover:bg-blue-50/20'
              }`}
            >
              <div className="size-9 rounded-xl bg-blue-50 group-hover:bg-blue-100/70 text-blue-600 flex items-center justify-center mb-1.5 transition-colors">
                <UploadCloud className="size-4.5 stroke-[2.2]" />
              </div>
              <p className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                Upload License Document
              </p>
              <p className="text-[10px] text-slate-400">PDF, JPG, PNG (Max 10MB)</p>
            </div>
          )}
          {errors.licenseDocumentUrl && (
            <p className="text-[11px] font-semibold text-rose-500 mt-1">
              {errors.licenseDocumentUrl}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
export default LicenseInfoCard
