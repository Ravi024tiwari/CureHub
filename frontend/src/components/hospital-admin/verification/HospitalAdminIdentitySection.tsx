import { type FC, useRef } from 'react'
import {
  FileText,
  UploadCloud,
  X,
  CheckCircle2,
  FileCode,
  AlertCircle,
  Eye,
} from 'lucide-react'

export interface IdentityDocsState {
  governmentIdType: string
  governmentIdNumber: string
  identityProofFile: File | null
  identityProofUrl: string
  authorizationLetterFile: File | null
  authorizationLetterUrl: string
  additionalDocFile: File | null
  additionalDocUrl: string
}

interface HospitalAdminIdentitySectionProps {
  formData: IdentityDocsState
  onChange: (fields: Partial<IdentityDocsState>) => void
  errors?: Record<string, string>
}

const GOV_ID_TYPES = [
  'Aadhaar Card',
  'PAN Card',
  'Passport',
  'Voter ID',
  'Driving License',
]

export const HospitalAdminIdentitySection: FC<HospitalAdminIdentitySectionProps> = ({
  formData,
  onChange,
  errors = {},
}) => {
  const govIdInputRef = useRef<HTMLInputElement>(null)
  const authLetterInputRef = useRef<HTMLInputElement>(null)
  const addDocInputRef = useRef<HTMLInputElement>(null)

  const handleFileDrop = (
    e: React.DragEvent<HTMLDivElement>,
    fieldKey: 'identityProof' | 'authorizationLetter' | 'additionalDoc'
  ) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      const url = URL.createObjectURL(file)
      if (fieldKey === 'identityProof') {
        onChange({ identityProofFile: file, identityProofUrl: url })
      } else if (fieldKey === 'authorizationLetter') {
        onChange({ authorizationLetterFile: file, authorizationLetterUrl: url })
      } else {
        onChange({ additionalDocFile: file, additionalDocUrl: url })
      }
    }
  }

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldKey: 'identityProof' | 'authorizationLetter' | 'additionalDoc'
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const url = URL.createObjectURL(file)
      if (fieldKey === 'identityProof') {
        onChange({ identityProofFile: file, identityProofUrl: url })
      } else if (fieldKey === 'authorizationLetter') {
        onChange({ authorizationLetterFile: file, authorizationLetterUrl: url })
      } else {
        onChange({ additionalDocFile: file, additionalDocUrl: url })
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Identity Proof Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-7 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <FileText className="w-4.5 h-4.5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Identity Proof
            </h2>
            <p className="text-xs text-slate-500">
              Government issued photo identification for identity verification
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Government ID Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Government ID Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.governmentIdType}
              onChange={(e) => onChange({ governmentIdType: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer transition-all"
            >
              {GOV_ID_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Government ID Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Government ID Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.governmentIdNumber}
              onChange={(e) => onChange({ governmentIdNumber: e.target.value })}
              placeholder="e.g. 1234 5678 9012"
              className={`w-full px-3.5 py-2.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                errors.governmentIdNumber
                  ? 'border-red-400 focus:ring-red-400/20'
                  : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'
              }`}
            />
            {errors.governmentIdNumber && (
              <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3" />
                {errors.governmentIdNumber}
              </p>
            )}
          </div>

          {/* Upload Government ID */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Upload Government ID <span className="text-red-500">*</span>
            </label>

            <input
              ref={govIdInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={(e) => handleFileSelect(e, 'identityProof')}
              className="hidden"
            />

            {formData.identityProofUrl ? (
              <div className="flex items-center justify-between p-2.5 bg-blue-50/60 border border-blue-200 rounded-xl">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 text-blue-600 font-bold overflow-hidden">
                    {formData.identityProofFile?.type?.includes('image') ||
                    formData.identityProofUrl.match(/\.(jpeg|jpg|png|webp)/i) ? (
                      <img
                        src={formData.identityProofUrl}
                        alt="ID Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FileCode className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">
                      {formData.identityProofFile?.name || 'Government ID Document'}
                    </p>
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Ready
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <a
                    href={formData.identityProofUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-colors"
                    title="View Document"
                  >
                    <Eye className="w-4 h-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => onChange({ identityProofFile: null, identityProofUrl: '' })}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
                    title="Remove File"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleFileDrop(e, 'identityProof')}
                onClick={() => govIdInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all hover:border-blue-500 hover:bg-blue-50/30 flex flex-col items-center justify-center ${
                  errors.identityProof
                    ? 'border-red-300 bg-red-50/30'
                    : 'border-slate-200 bg-slate-50/50'
                }`}
              >
                <UploadCloud className="w-6 h-6 text-blue-600 mb-1" />
                <p className="text-xs font-semibold text-slate-700">
                  Click to upload or drag and drop
                </p>
                <p className="text-[10px] text-slate-400">PDF, JPG, PNG (Max 5MB)</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Authorization Letter & Additional Document Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Authorization Letter Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Authorization Letter <span className="text-red-500">*</span>
              </h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Upload an authorization letter from the hospital on official letterhead, confirming your
              role as hospital administrator.
            </p>
          </div>

          <input
            ref={authLetterInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            onChange={(e) => handleFileSelect(e, 'authorizationLetter')}
            className="hidden"
          />

          {formData.authorizationLetterUrl ? (
            <div className="flex items-center justify-between p-3 bg-blue-50/60 border border-blue-200 rounded-xl">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 text-blue-600 overflow-hidden font-bold">
                  {formData.authorizationLetterFile?.type?.includes('image') ||
                  formData.authorizationLetterUrl.match(/\.(jpeg|jpg|png|webp)/i) ? (
                    <img
                      src={formData.authorizationLetterUrl}
                      alt="Letter Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FileCode className="w-5 h-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">
                    {formData.authorizationLetterFile?.name || 'Authorization Letter'}
                  </p>
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Ready
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <a
                  href={formData.authorizationLetterUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() =>
                    onChange({ authorizationLetterFile: null, authorizationLetterUrl: '' })
                  }
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleFileDrop(e, 'authorizationLetter')}
              onClick={() => authLetterInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer transition-all hover:border-blue-500 hover:bg-blue-50/30 flex flex-col items-center justify-center bg-slate-50/50"
            >
              <UploadCloud className="w-6 h-6 text-blue-600 mb-1" />
              <p className="text-xs font-semibold text-slate-700">Click to upload or drag and drop</p>
              <p className="text-[10px] text-slate-400">PDF, JPG, PNG (Max 5MB)</p>
            </div>
          )}
        </div>

        {/* Additional Identity Proof (Optional) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Additional Identity Proof <span className="text-slate-400 font-normal">(Optional)</span>
              </h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              You can also upload any additional documents if required, such as a staff ID card,
              registration copy, or official certificate.
            </p>
          </div>

          <input
            ref={addDocInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            onChange={(e) => handleFileSelect(e, 'additionalDoc')}
            className="hidden"
          />

          {formData.additionalDocUrl ? (
            <div className="flex items-center justify-between p-3 bg-blue-50/60 border border-blue-200 rounded-xl">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 text-blue-600 overflow-hidden font-bold">
                  {formData.additionalDocFile?.type?.includes('image') ||
                  formData.additionalDocUrl.match(/\.(jpeg|jpg|png|webp)/i) ? (
                    <img
                      src={formData.additionalDocUrl}
                      alt="Doc Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FileCode className="w-5 h-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">
                    {formData.additionalDocFile?.name || 'Additional Document'}
                  </p>
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Ready
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <a
                  href={formData.additionalDocUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => onChange({ additionalDocFile: null, additionalDocUrl: '' })}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleFileDrop(e, 'additionalDoc')}
              onClick={() => addDocInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer transition-all hover:border-blue-500 hover:bg-blue-50/30 flex flex-col items-center justify-center bg-slate-50/50"
            >
              <UploadCloud className="w-6 h-6 text-blue-600 mb-1" />
              <p className="text-xs font-semibold text-slate-700">Click to upload or drag and drop</p>
              <p className="text-[10px] text-slate-400">PDF, JPG, PNG (Max 5MB)</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
