import React from 'react'
import { CheckCircle2, Clock, ShieldCheck, AlertCircle } from 'lucide-react'

interface DoctorProfileHeaderProps {
  lastUpdated?: string
  verificationStatus?: string
}

export const DoctorProfileHeader: React.FC<DoctorProfileHeaderProps> = ({
  lastUpdated,
  verificationStatus = 'APPROVED',
}) => {
  const formattedDate = lastUpdated
    ? new Date(lastUpdated).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Recently updated'

  const isVerified = verificationStatus === 'APPROVED' || verificationStatus === 'VERIFIED'
  const isPending = verificationStatus === 'PENDING'
  const isRejected = verificationStatus === 'REJECTED'

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            My Profile
          </h1>
          {/* Mobile badge */}
          <div className="sm:hidden">
            {isVerified ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="size-3 text-emerald-600" />
                <span>Verified</span>
              </span>
            ) : isRejected ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                <AlertCircle className="size-3 text-rose-600" />
                <span>Action Required</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                <Clock className="size-3 text-amber-600" />
                <span>Under Review</span>
              </span>
            )}
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 max-w-2xl leading-relaxed">
          Manage your professional information, qualifications, experience, and availability. Keep your profile updated for better patient engagement.
        </p>
      </div>

      {/* Desktop meta right pill */}
      <div className="hidden sm:flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <Clock className="size-3.5 text-slate-400" />
          <span>Last updated: {formattedDate}</span>
        </div>

        {isVerified ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
            <CheckCircle2 className="size-4 text-emerald-600 stroke-[2.2]" />
            <span>Verified</span>
          </span>
        ) : isRejected ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
            <AlertCircle className="size-4 text-rose-600 stroke-[2.2]" />
            <span>Action Required</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
            <ShieldCheck className="size-4 text-amber-600 stroke-[2.2]" />
            <span>Under Review</span>
          </span>
        )}
      </div>
    </div>
  )
}
