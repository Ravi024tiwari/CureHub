import { useState, useRef, type FC, type DragEvent } from 'react'
import {
  UploadCloud,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { usePatientStore } from '@/store/patientStore'

export const UploadReportModal: FC = () => {
  const { isUploadModalOpen, closeUploadModal, uploadReport, isUploading } =
    usePatientStore()

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [reportTitle, setReportTitle] = useState('')
  const [category, setCategory] = useState('Lab Report')
  const [reportDate, setReportDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [doctorName, setDoctorName] = useState('')
  const [hospitalName, setHospitalName] = useState('')
  const [notes, setNotes] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isUploadModalOpen) return null

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0])
    }
  }

  const handleFileSelected = (file: File) => {
    // 10 MB limit
    if (file.size > 10 * 1024 * 1024) {
      setValidationError('File size exceeds the 10 MB limit.')
      return
    }

    setValidationError(null)
    setSelectedFile(file)
    if (!reportTitle) {
      // Auto-populate title without extension
      const cleanName = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase())
      setReportTitle(cleanName)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!reportTitle.trim()) {
      setValidationError('Please enter a title for the medical report.')
      return
    }

    const fileSizeFormatted = selectedFile
      ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`
      : '1.2 MB'
    const fileTypeFormatted = selectedFile?.name.endsWith('.pdf') ? 'PDF' : 'JPG'

    if (selectedFile) {
      const formData = new FormData()
      formData.append('report', selectedFile)
      formData.append('title', reportTitle.trim())
      formData.append('category', category)
      formData.append('fileSize', fileSizeFormatted)
      formData.append('doctorName', doctorName.trim())
      formData.append('hospitalName', hospitalName.trim())
      formData.append('notes', notes.trim())

      await uploadReport(formData)
    } else {
      // Direct mock upload without file
      await uploadReport({
        title: reportTitle.trim(),
        category,
        fileUrl: '/mock-reports/blood-test.pdf',
        fileType: fileTypeFormatted,
        fileSize: fileSizeFormatted,
        notes: notes.trim(),
      })
    }

    // Reset form
    setSelectedFile(null)
    setReportTitle('')
    setNotes('')
    setValidationError(null)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-lg my-auto overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
              Upload Medical Report
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Securely store lab test results, imaging, or prescriptions
            </p>
          </div>
          <button
            onClick={closeUploadModal}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
              isDragging
                ? 'border-blue-500 bg-blue-50/50 scale-[0.99]'
                : selectedFile
                ? 'border-emerald-400 bg-emerald-50/30'
                : 'border-slate-200 hover:border-blue-400 bg-slate-50/70 hover:bg-blue-50/20'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              className="hidden"
            />

            {selectedFile ? (
              <div className="flex items-center gap-3 text-left w-full bg-white p-3 rounded-xl border border-emerald-200 shadow-2xs">
                <div className="size-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {(selectedFile.size / 1024).toFixed(0)} KB • Ready to upload
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedFile(null)
                  }}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded-lg"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="size-12 rounded-2xl bg-blue-100/70 text-blue-600 flex items-center justify-center mb-2.5 shadow-xs">
                  <UploadCloud className="size-6 stroke-[2.2]" />
                </div>
                <p className="text-xs sm:text-sm font-bold text-slate-800">
                  Tap to upload <span className="font-normal text-slate-500">or drag and drop</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  PDF, JPG, PNG (Max 10 MB)
                </p>
              </>
            )}
          </div>

          {validationError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Report Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Report Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              placeholder="e.g. Complete Blood Count (CBC), Chest X-Ray..."
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100 transition-all"
            />
          </div>

          {/* Category Dropdown & Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="Lab Report">Lab Report</option>
                <option value="Imaging">Imaging (X-Ray, MRI, Scan)</option>
                <option value="Prescription">Prescription</option>
                <option value="Discharge Summary">Discharge Summary</option>
                <option value="Surgery">Surgery Report</option>
                <option value="Vaccination">Vaccination Record</option>
                <option value="Others">Others</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Report Date
              </label>
              <input
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Doctor or Hospital Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Consulting Doctor <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                placeholder="e.g. Dr. Priya Sharma"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Hospital / Lab <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                placeholder="e.g. Apollo Hospital"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Notes or Summary <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add personal notes or findings (e.g. Fasting sample taken, follow-up after 3 months)..."
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeUploadModal}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer"
            >
              {isUploading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <span>Upload Report</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
