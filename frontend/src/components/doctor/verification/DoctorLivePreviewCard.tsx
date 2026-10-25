import { useRef, type FC, type ChangeEvent } from 'react'
import {
  User,
  Camera,
  IndianRupee,
  ShieldCheck,
  Stethoscope,
  Award,
  Sparkles,
} from 'lucide-react'

interface DoctorLivePreviewCardProps {
  doctorName: string
  department?: string
  experienceYears?: number
  specializations?: string[]
  consultationFee?: number
  medicalCouncilRegistrationNumber?: string
  avatarUrl?: string
  onAvatarUpload?: (file: File) => void
  isUploadingAvatar?: boolean
}

export const DoctorLivePreviewCard: FC<DoctorLivePreviewCardProps> = ({
  doctorName,
  department = 'Specialty Not Set',
  experienceYears = 0,
  specializations = [],
  consultationFee = 0,
  medicalCouncilRegistrationNumber = '',
  avatarUrl,
  onAvatarUpload,
  isUploadingAvatar = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onAvatarUpload) {
      onAvatarUpload(file)
    }
  }

  const displayName = doctorName?.startsWith('Dr.') ? doctorName : `Dr. ${doctorName || 'Doctor Name'}`

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs transition-all hover:shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Sparkles className="size-3.5" />
          </div>
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Live Profile Preview
          </span>
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploadingAvatar}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <Camera className="size-3" />
          <span>{isUploadingAvatar ? 'Uploading...' : 'Edit Photo'}</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Main Avatar & Identity */}
      <div className="pt-5 pb-4 flex flex-col items-center text-center">
        <div className="relative group mb-3">
          <div className="size-20 sm:size-22 rounded-full ring-4 ring-blue-50 shadow-md overflow-hidden bg-gradient-to-tr from-slate-100 to-slate-200 flex items-center justify-center">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <User className="size-10 text-slate-400" />
            )}
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Change Profile Photo"
            className="absolute bottom-0 right-0 p-1.5 rounded-full bg-blue-600 text-white shadow-md hover:bg-blue-700 transition-colors"
          >
            <Camera className="size-3.5" />
          </button>
        </div>

        <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
          {displayName}
        </h3>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
          <Stethoscope className="size-3.5 text-blue-600" />
          <span>{department || 'Department pending'}</span>
          <span>•</span>
          <Award className="size-3.5 text-amber-500" />
          <span>{experienceYears > 0 ? `${experienceYears}+ Years Exp.` : 'Experience pending'}</span>
        </div>

        {/* Specialization Tags Preview */}
        {specializations && specializations.length > 0 ? (
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 max-w-xs">
            {specializations.slice(0, 3).map((spec) => (
              <span
                key={spec}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60"
              >
                {spec}
              </span>
            ))}
            {specializations.length > 3 && (
              <span className="text-[10px] font-medium text-slate-400 px-1">
                +{specializations.length - 3} more
              </span>
            )}
          </div>
        ) : (
          <p className="text-[11px] text-slate-400 italic mt-2">
            Add specializations to display here
          </p>
        )}
      </div>

      {/* Meta Highlights Grid */}
      <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs">
        {/* Consultation Fee */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-slate-500 font-medium flex items-center gap-1.5">
            <IndianRupee className="size-3.5 text-emerald-600" />
            Consultation Fee
          </span>
          <span className="font-bold text-slate-900">
            {consultationFee > 0 ? `₹ ${consultationFee.toLocaleString('en-IN')}` : 'Not set'}
          </span>
        </div>

        {/* Medical Council Number */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-slate-500 font-medium flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-blue-600" />
            Medical Council Reg.
          </span>
          <span className="font-mono font-semibold text-slate-800 text-[11px] truncate max-w-[140px]">
            {medicalCouncilRegistrationNumber || 'Not provided'}
          </span>
        </div>
      </div>
    </div>
  )
}
