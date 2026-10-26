import React, { useRef, useState } from 'react'
import {
  FileText,
  Upload,
  Eye,
  Trash2,
  CheckCircle2,
  Clock,
  Loader2,
  AlertCircle,
  ShieldCheck,
  FileCheck,
  ExternalLink,
} from 'lucide-react'
import { uploadService } from '@/services/uploadService'
import { toast } from '@/store/toastStore'

interface DoctorDocumentsTabProps {
  licenseDocumentUrl?: string
  registrationNumber?: string
  verificationStatus?: string
  rejectionReason?: string
  onLicenseDocumentChange: (url: string) => void
  onPreviewDocument: (url?: string, title?: string) => void
}

export const DoctorDocumentsTab: React.FC<DoctorDocumentsTabProps> = ({
  licenseDocumentUrl,
  registrationNumber,
  verificationStatus = 'PENDING',
  rejectionReason,
  onLicenseDocumentChange,
  onPreviewDocument,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // File validation: PDF or Image up to 10MB
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid PDF or image file (JPG, PNG, WebP).')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds the 10MB limit.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setIsUploading(true)
    try {
      const res = await uploadService.uploadTempFile(file, 'doctor/documents')
      if (res?.url) {
        onLicenseDocumentChange(res.url)
        toast.success('Document uploaded successfully! Click Update Profile to save changes.')
      } else {
        toast.error('Failed to obtain uploaded document URL.')
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to upload document.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const hasDocument = !!licenseDocumentUrl && licenseDocumentUrl.trim().length > 0
  const isVerified = verificationStatus === 'VERIFIED'
  const isRejected = verificationStatus === 'REJECTED'

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-6">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.webp"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="size-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Medical Registration & Licenses</h3>
            <p className="text-xs text-slate-500">
              Official regulatory credentials stored in your CureHealth profile database
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/70">
          <span className="font-semibold text-slate-700">Council ID:</span>
          <span className="font-mono font-bold text-blue-700">{registrationNumber || 'Not Set'}</span>
        </div>
      </div>

      {/* Rejection Alert if rejected */}
      {isRejected && rejectionReason && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3">
          <AlertCircle className="size-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h5 className="font-bold text-rose-900">Document Verification Rejected</h5>
            <p className="text-rose-700 mt-0.5">{rejectionReason}</p>
            <p className="text-rose-600 font-medium mt-1">
              Please re-upload a clear, valid registration certificate using the replace button below.
            </p>
          </div>
        </div>
      )}

      {/* Official License Document Card */}
      <div className="space-y-4">
        <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="size-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                <FileText className="size-6" />
              </div>
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-slate-900">
                    Medical Council Registration Certificate
                  </h4>
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/60">
                    Mandatory
                  </span>
                  {hasDocument ? (
                    isVerified ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                        <CheckCircle2 className="size-3 text-emerald-600" />
                        <span>Council Verified</span>
                      </span>
                    ) : isRejected ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/60">
                        <AlertCircle className="size-3 text-rose-600" />
                        <span>Rejected</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                        <Clock className="size-3 text-amber-600" />
                        <span>Under Verification</span>
                      </span>
                    )
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                      <Clock className="size-3 text-slate-500" />
                      <span>Not Uploaded</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  National Medical Commission (NMC) or State Medical Council registration proof.
                </p>
                {registrationNumber && (
                  <p className="text-xs text-slate-600 font-mono">
                    <span className="text-slate-400 font-sans">Reg. No:</span> {registrationNumber}
                  </p>
                )}
              </div>
            </div>

            {/* Document Actions */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              {hasDocument && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      onPreviewDocument(licenseDocumentUrl, 'Medical Council Registration Certificate')
                    }
                    title="View Document"
                    className="p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 bg-white transition-colors cursor-pointer"
                  >
                    <Eye className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onLicenseDocumentChange('')}
                    title="Remove Document"
                    className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 bg-white transition-colors cursor-pointer"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-3.5 py-2 text-xs font-bold text-blue-600 hover:text-blue-700 bg-white hover:bg-blue-50 border border-blue-200 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                {isUploading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Upload className="size-3.5" />
                )}
                <span>{hasDocument ? 'Replace' : 'Upload Certificate'}</span>
              </button>
            </div>
          </div>

          {/* If document is uploaded, show URL or file snippet */}
          {hasDocument ? (
            <div className="flex items-center justify-between text-xs bg-white p-3 rounded-xl border border-slate-200/80">
              <div className="flex items-center gap-2 min-w-0">
                <FileCheck className="size-4 text-emerald-600 shrink-0" />
                <span className="font-medium text-slate-700 truncate">
                  {licenseDocumentUrl.split('/').pop() || 'Medical_Council_Certificate.pdf'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => window.open(licenseDocumentUrl, '_blank')}
                className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 text-xs shrink-0 cursor-pointer"
              >
                <span>Open in Tab</span>
                <ExternalLink className="size-3" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-5 text-center cursor-pointer transition-colors bg-white/70 hover:bg-blue-50/20"
            >
              <Upload className="size-6 text-slate-400 mx-auto mb-1.5" />
              <p className="text-xs font-semibold text-slate-700">
                Click to upload your Medical Council Registration Certificate
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Supported formats: PDF, PNG, JPG (Max 10MB)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Database Verification Summary Box */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
          <span className="text-slate-400 font-medium">Regulatory Body</span>
          <p className="text-sm font-bold text-slate-800">
            National Medical Commission / State Medical Council
          </p>
          <p className="text-[11px] text-slate-500">
            Official statutory authority governing medical practice registration
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
          <span className="text-slate-400 font-medium">Registry Status</span>
          <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            {isVerified ? (
              <span className="text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-600" />
                <span>Good Standing & Officially Verified</span>
              </span>
            ) : hasDocument ? (
              <span className="text-amber-700 flex items-center gap-1.5">
                <Clock className="size-4 text-amber-600" />
                <span>Verification Under Review</span>
              </span>
            ) : (
              <span className="text-slate-500 flex items-center gap-1.5">
                <AlertCircle className="size-4 text-slate-400" />
                <span>Pending Certificate Submission</span>
              </span>
            )}
          </p>
          <p className="text-[11px] text-slate-500">
            {isVerified
              ? 'Your registration is verified and visible to patients.'
              : 'Submit your document and click Update Profile to submit for review.'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default DoctorDocumentsTab
