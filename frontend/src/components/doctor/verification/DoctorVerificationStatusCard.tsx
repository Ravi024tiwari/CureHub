import type { FC } from 'react'
import {
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Circle,
  HelpCircle,
  Sparkles,
} from 'lucide-react'

interface DoctorVerificationStatusCardProps {
  status: 'INCOMPLETE' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
  rejectionReason?: string
  checklist: {
    basicInfo: boolean
    qualifications: boolean
    experience: boolean
    documents: boolean
  }
}

export const DoctorVerificationStatusCard: FC<DoctorVerificationStatusCardProps> = ({
  status = 'INCOMPLETE',
  rejectionReason,
  checklist,
}) => {
  const completedCount = Object.values(checklist).filter(Boolean).length
  const totalCount = 4
  const progressPercent = Math.round((completedCount / totalCount) * 100)

  const renderStatusBanner = () => {
    switch (status) {
      case 'APPROVED':
        return (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/90 space-y-1">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
              <ShieldCheck className="size-4 text-emerald-600" />
              <span>Verified & Approved</span>
            </div>
            <p className="text-[11px] text-emerald-700 leading-relaxed">
              Your profile has been approved! All clinical features (Appointments, Schedule, Prescriptions) are unlocked.
            </p>
          </div>
        )
      case 'PENDING':
        return (
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200/90 space-y-1">
            <div className="flex items-center gap-2 text-blue-800 font-bold text-xs">
              <Clock className="size-4 text-blue-600" />
              <span>Under Review by Super Admin</span>
            </div>
            <p className="text-[11px] text-blue-700 leading-relaxed">
              Your profile has been submitted and is in the verification queue. The admin team usually reviews within 24–48 hours.
            </p>
          </div>
        )
      case 'REJECTED':
        return (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200/90 space-y-1.5">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
              <AlertTriangle className="size-4 text-rose-600" />
              <span>Verification Rejected</span>
            </div>
            {rejectionReason ? (
              <p className="text-[11px] text-rose-700 font-medium leading-relaxed bg-white/70 p-2 rounded-lg border border-rose-100">
                "{rejectionReason}"
              </p>
            ) : null}
            <p className="text-[11px] text-rose-600">
              Please resolve the above remarks and click <strong>Submit for Verification</strong> again.
            </p>
          </div>
        )
      default:
        return (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/90 space-y-1">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
              <Sparkles className="size-4 text-amber-600" />
              <span>Profile Incomplete</span>
            </div>
            <p className="text-[11px] text-amber-700 leading-relaxed">
              Fill all mandatory sections and upload your license certificate to submit for review.
            </p>
          </div>
        )
    }
  }

  const checklistItems = [
    { label: 'Basic Information & Bio', isDone: checklist.basicInfo },
    { label: 'Qualifications & Degrees', isDone: checklist.qualifications },
    { label: 'Professional Experience', isDone: checklist.experience },
    { label: 'Documents & Medical License', isDone: checklist.documents },
  ]

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="size-3.5" />
          </div>
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Verification Status
          </span>
        </div>

        <span className="text-xs font-bold text-blue-600">
          {progressPercent}% Complete
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 rounded-full ${
            progressPercent === 100
              ? 'bg-emerald-500'
              : progressPercent > 50
              ? 'bg-blue-600'
              : 'bg-amber-500'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Status Notice Banner */}
      {renderStatusBanner()}

      {/* Section Checklist */}
      <div className="space-y-2 pt-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Requirements Checklist
        </p>

        <div className="space-y-2">
          {checklistItems.map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors ${
                item.isDone
                  ? 'bg-emerald-50/60 text-emerald-800 border border-emerald-100'
                  : 'bg-slate-50 text-slate-500 border border-slate-100'
              }`}
            >
              {item.isDone ? (
                <CheckCircle2 className="size-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <Circle className="size-4 text-slate-300 flex-shrink-0" />
              )}
              <span className="font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Helpful Tip */}
      <div className="pt-2 text-[11px] text-slate-400 flex items-start gap-1.5 leading-relaxed">
        <HelpCircle className="size-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
        <span>
          Once verified, patients can discover your profile, book consultations, and view your verified credentials.
        </span>
      </div>
    </div>
  )
}
