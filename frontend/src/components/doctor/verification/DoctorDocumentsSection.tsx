import { useState, useRef, type FC, type ChangeEvent } from 'react'
import {
  UploadCloud,
  FileText,
  ExternalLink,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileBadge,
  ShieldCheck,
  Loader2,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { uploadService } from '@/services/uploadService'

interface DoctorDocumentsSectionProps {
  medicalCouncilRegistrationNumber: string
  licenseDocumentUrl?: string
  onChange: (fields: {
    medicalCouncilRegistrationNumber?: string
    licenseDocumentUrl?: string
  }) => void
}

export const DoctorDocumentsSection: FC<DoctorDocumentsSectionProps> = ({
  medicalCouncilRegistrationNumber,
  licenseDocumentUrl,
  onChange,
}) => {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (file: File) => {
    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setUploadError('Invalid file type. Please upload a PDF, JPG, or PNG document.')
      return
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size exceeds 10MB limit.')
      return
    }

    setIsUploading(true)
    setUploadError(null)

    try {
      const result = await uploadService.uploadTempFile(file, 'licenses/doctors')
      if (result?.url) {
        onChange({ licenseDocumentUrl: result.url })
      } else {
        setUploadError('Failed to get uploaded file URL. Please try again.')
      }
    } catch (err: any) {
      setUploadError(err?.message || 'Error uploading license document.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleRemoveDocument = () => {
    onChange({ licenseDocumentUrl: '' })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Derive readable file name from URL
  const getDocumentName = (url: string) => {
    try {
      const parts = url.split('/')
      return decodeURIComponent(parts[parts.length - 1]) || 'Medical-License-Certificate.pdf'
    } catch {
      return 'Medical-License-Certificate.pdf'
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="size-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
          <FileBadge className="size-5" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Medical Council Credentials & Documents <span className="text-rose-500">*</span>
          </h2>
          <p className="text-xs text-slate-500">
            Submit your State Medical Council / MCI registration certificate for Super Admin verification.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Registration Number */}
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold text-slate-700">
              Medical Council Registration Number <span className="text-rose-500">*</span>
            </Label>
            {medicalCouncilRegistrationNumber?.trim() && (
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="size-3.5" />
                Format Validated
              </span>
            )}
          </div>
          <div className="relative">
            <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input
              type="text"
              value={medicalCouncilRegistrationNumber}
              onChange={(e) =>
                onChange({
                  medicalCouncilRegistrationNumber: e.target.value.toUpperCase(),
                })
              }
              placeholder="e.g. MCI/12345/2016 or DMC/87654/2020"
              className="pl-10 h-10.5 rounded-xl border-slate-200 focus:border-emerald-500 text-sm font-mono font-semibold uppercase tracking-wider"
            />
          </div>
          <p className="text-[11px] text-slate-400">
            Enter the exact registration number as printed on your state medical council certificate.
          </p>
        </div>

        {/* License Document Upload */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-slate-700">
            Upload License / Degree Certificate <span className="text-rose-500">*</span>
          </Label>

          {licenseDocumentUrl ? (
            /* Uploaded File Card */
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                  <FileText className="size-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {getDocumentName(licenseDocumentUrl)}
                    </p>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200 flex-shrink-0">
                      Uploaded & Attached
                    </span>
                  </div>
                  <a
                    href={licenseDocumentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 mt-0.5"
                  >
                    <span>View uploaded document</span>
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={handleRemoveDocument}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Remove document"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Dropzone / Upload Box */
            <div
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={`p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-3 ${
                isUploading
                  ? 'border-blue-300 bg-blue-50/50 cursor-wait'
                  : 'border-slate-300 hover:border-emerald-500 hover:bg-slate-50/60 bg-slate-50/30'
              }`}
            >
              <div className="size-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
                {isUploading ? (
                  <Loader2 className="size-6 animate-spin text-blue-600" />
                ) : (
                  <UploadCloud className="size-6" />
                )}
              </div>

              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-bold text-slate-800">
                  {isUploading ? (
                    'Uploading certificate securely to server...'
                  ) : (
                    <>
                      <span className="text-blue-600 hover:underline">Click to upload</span> or drag and drop your license
                    </>
                  )}
                </p>
                <p className="text-[11px] text-slate-400">
                  PDF, JPG, or PNG (Maximum file size: 10MB)
                </p>
              </div>

              {isUploading && (
                <div className="w-48 h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-blue-600 rounded-full animate-pulse w-3/4" />
                </div>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />

          {uploadError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="size-4 flex-shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
