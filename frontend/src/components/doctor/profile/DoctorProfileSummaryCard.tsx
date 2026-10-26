import React, { useState } from 'react'
import {
  Camera,
  Star,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  Sparkles,
  Stethoscope,
  IndianRupee,
  Briefcase,
  ChevronRight,
  GraduationCap,
  Globe,
  ShieldCheck,
} from 'lucide-react'
import type { QualificationData } from './QualificationModal'

export interface DoctorProfileSummaryCardProps {
  name: string
  avatar?: string | null
  qualifications?: QualificationData[]
  qualificationsStr?: string
  department?: string
  hospitalName?: string
  ratingAverage?: number
  reviewCount?: number
  consultationFee?: number
  experienceYears?: number
  verificationStatus?: string
  hospitalAffiliationStatus?: string
  memberSince?: string
  completionPercentage?: number
  onChangeAvatarClick: () => void
  onNavigateTab?: (tab: string) => void
}

export const DoctorProfileSummaryCard: React.FC<DoctorProfileSummaryCardProps> = ({
  name,
  avatar,
  qualifications = [],
  qualificationsStr,
  department = 'General Medicine',
  hospitalName = 'Independent Practice',
  ratingAverage = 0,
  reviewCount = 0,
  consultationFee = 0,
  experienceYears = 0,
  verificationStatus = 'PENDING',
  hospitalAffiliationStatus = 'NOT_AFFILIATED',
  memberSince = 'Recently Joined',
  completionPercentage = 0,
  onChangeAvatarClick,
  onNavigateTab,
}) => {
  const [showAllQuals, setShowAllQuals] = useState(false)

  // Status flags
  const isVerified = verificationStatus === 'APPROVED' || verificationStatus === 'VERIFIED'
  const isPendingVerification = verificationStatus === 'PENDING'
  const isRejected = verificationStatus === 'REJECTED'

  const isHospitalApproved = hospitalAffiliationStatus === 'APPROVED'
  const isHospitalPending = hospitalAffiliationStatus === 'PENDING_APPROVAL'

  // Extract initials for fallback avatar
  const initials = name
    .replace(/^Dr\.\s*/i, '')
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'DR'

  // Degree badges list
  const degreeList = qualifications.length
    ? qualifications.map((q) => q.degree.trim())
    : qualificationsStr
      ? qualificationsStr.split(',').map((s) => s.trim()).filter(Boolean)
      : []

  const visibleDegrees = showAllQuals ? degreeList : degreeList.slice(0, 3)
  const remainingDegreesCount = degreeList.length - 3

  return (
    <div className="space-y-5">
      {/* 1. Main Profile Identity Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs relative overflow-hidden transition-all duration-300 hover:shadow-md">
        {/* Soft top gradient accent */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600" />

        <div className="flex flex-col items-center text-center pt-2">
          {/* Avatar with Interactive Camera Button */}
          <div className="relative group mb-3.5">
            <div className="size-28 sm:size-32 rounded-full p-1 bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-500 shadow-md group-hover:shadow-blue-500/25 transition-all duration-300">
              {avatar ? (
                <img
                  src={avatar}
                  alt={name}
                  className="size-full rounded-full object-cover bg-white"
                  onError={(e) => {
                    // Fallback if image fails to load
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ) : (
                <div className="size-full rounded-full bg-gradient-to-br from-blue-50 to-sky-100 flex items-center justify-center text-blue-700 font-black text-2xl tracking-wider select-none">
                  {initials}
                </div>
              )}
            </div>

            {/* Change Avatar Button */}
            <button
              type="button"
              onClick={onChangeAvatarClick}
              title="Update profile photo"
              className="absolute bottom-1 right-1 p-2.5 rounded-full bg-slate-900/90 hover:bg-blue-600 text-white shadow-lg border-2 border-white transition-all transform hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center group-hover:ring-4 group-hover:ring-blue-100"
            >
              <Camera className="size-4 stroke-[2.2]" />
            </button>
          </div>

          {/* Name & Dynamic Verification Badge */}
          <div className="flex items-center justify-center gap-2 flex-wrap mb-1.5">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {name}
            </h2>

            {isVerified ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70 shadow-2xs">
                <CheckCircle2 className="size-3 text-emerald-600" />
                <span>Verified</span>
              </span>
            ) : isPendingVerification ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/70 shadow-2xs">
                <Clock className="size-3 text-amber-600" />
                <span>Pending Review</span>
              </span>
            ) : isRejected ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/70 shadow-2xs">
                <AlertCircle className="size-3 text-rose-600" />
                <span>Action Required</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                <span>Incomplete</span>
              </span>
            )}
          </div>

          {/* Department / Specialty Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50/80 text-blue-700 border border-blue-200/60 font-bold text-xs mb-3 shadow-2xs">
            <Stethoscope className="size-3.5 text-blue-600" />
            <span>{department}</span>
          </div>

          {/* Qualifications Badges */}
          <div className="w-full mb-3.5">
            {degreeList.length > 0 ? (
              <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-sm mx-auto">
                {visibleDegrees.map((deg, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-slate-100/90 text-slate-700 border border-slate-200/80 hover:bg-slate-200/60 transition-colors"
                  >
                    <GraduationCap className="size-3 text-slate-400" />
                    <span>{deg}</span>
                  </span>
                ))}
                {remainingDegreesCount > 0 && !showAllQuals && (
                  <button
                    type="button"
                    onClick={() => setShowAllQuals(true)}
                    className="px-2 py-0.5 rounded-lg text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
                  >
                    +{remainingDegreesCount} more
                  </button>
                )}
                {showAllQuals && degreeList.length > 3 && (
                  <button
                    type="button"
                    onClick={() => setShowAllQuals(false)}
                    className="px-2 py-0.5 rounded-lg text-[10px] font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    Show less
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onNavigateTab?.('qualifications')}
                className="text-xs text-slate-400 hover:text-blue-600 font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
              >
                <GraduationCap className="size-3.5" />
                <span>+ Add Medical Qualifications</span>
              </button>
            )}
          </div>

          {/* Hospital Affiliation Row */}
          <button
            type="button"
            onClick={() => onNavigateTab?.('hospital')}
            title="Manage hospital affiliation"
            className="w-full max-w-xs flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 text-slate-700 text-xs font-semibold transition-all group cursor-pointer"
          >
            <Building2 className="size-3.5 text-slate-400 group-hover:text-blue-600 shrink-0 transition-colors" />
            <span className="truncate max-w-[200px]">{hospitalName}</span>
            {isHospitalApproved && (
              <CheckCircle2 className="size-3 text-emerald-600 shrink-0" />
            )}
            {isHospitalPending && (
              <span className="text-[10px] text-amber-600 font-bold shrink-0">(Pending)</span>
            )}
            <ChevronRight className="size-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Interactive Stats Grid */}
          <div className="w-full grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-slate-100 text-center">
            {/* Stat 1: Rating */}
            <div className="flex flex-col items-center p-2 rounded-2xl hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-1 font-black text-xs sm:text-sm">
                <Star className="size-3.5 fill-amber-400 text-amber-400" />
                <span className="text-slate-800">
                  {ratingAverage > 0 ? ratingAverage.toFixed(1) : 'New'}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
                {reviewCount > 0 ? `(${reviewCount} reviews)` : 'No ratings yet'}
              </span>
            </div>

            {/* Stat 2: Clinical Experience */}
            <div className="flex flex-col items-center p-2 rounded-2xl hover:bg-slate-50 transition-colors border-x border-slate-100">
              <div className="flex items-center gap-1 font-black text-xs sm:text-sm text-slate-800">
                <Briefcase className="size-3.5 text-blue-600" />
                <span>{experienceYears > 0 ? `${experienceYears}+ Yrs` : 'Fresher'}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
                Experience
              </span>
            </div>

            {/* Stat 3: Consultation Fee */}
            <div className="flex flex-col items-center p-2 rounded-2xl hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-0.5 font-black text-xs sm:text-sm text-slate-800">
                <IndianRupee className="size-3.5 text-emerald-600" />
                <span>{consultationFee > 0 ? consultationFee : 'Free'}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
                Fee / Session
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Profile Completion Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-3 transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Sparkles className="size-3.5 stroke-[2.2]" />
            </div>
            <span className="text-xs font-bold text-slate-800">Profile Health</span>
          </div>
          <span className="text-xs font-black text-blue-600">{completionPercentage}%</span>
        </div>

        {/* Progress bar with smooth animation */}
        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${Math.min(100, Math.max(5, completionPercentage))}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] pt-0.5">
          <p className="text-slate-500 font-medium">
            {completionPercentage >= 100
              ? 'Your profile is 100% complete & ready for patient booking.'
              : 'Complete all sections for maximum visibility & patient trust.'}
          </p>
          {completionPercentage < 100 && onNavigateTab && (
            <button
              type="button"
              onClick={() => onNavigateTab('personal')}
              className="text-blue-600 hover:text-blue-700 font-bold shrink-0 ml-2 cursor-pointer hover:underline"
            >
              Complete now
            </button>
          )}
        </div>
      </div>

      {/* 3. Account Status Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-3.5 transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            Verification & Status
          </h4>
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        <div className="space-y-2.5 text-xs">
          {/* Regulatory Verification Status */}
          <div className="flex items-center justify-between py-1 border-b border-slate-100">
            <div className="flex items-center gap-2 text-slate-600">
              <ShieldCheck className="size-4 text-slate-400" />
              <span>Medical License</span>
            </div>
            {isVerified ? (
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200/60 text-[11px]">
                Verified
              </span>
            ) : isPendingVerification ? (
              <span className="text-amber-700 font-bold bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200/60 text-[11px]">
                Under Review
              </span>
            ) : isRejected ? (
              <span className="text-rose-700 font-bold bg-rose-50 px-2.5 py-0.5 rounded-lg border border-rose-200/60 text-[11px]">
                Rejected
              </span>
            ) : (
              <span className="text-slate-600 font-bold bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200 text-[11px]">
                Incomplete
              </span>
            )}
          </div>

          {/* Hospital Affiliation Status */}
          <div className="flex items-center justify-between py-1 border-b border-slate-100">
            <div className="flex items-center gap-2 text-slate-600">
              <Building2 className="size-4 text-slate-400" />
              <span>Hospital Affiliation</span>
            </div>
            {isHospitalApproved ? (
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200/60 text-[11px]">
                Approved
              </span>
            ) : isHospitalPending ? (
              <span className="text-amber-700 font-bold bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200/60 text-[11px]">
                Pending
              </span>
            ) : (
              <span className="text-slate-600 font-bold bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200 text-[11px]">
                Independent
              </span>
            )}
          </div>

          {/* Profile Visibility */}
          <div className="flex items-center justify-between py-1 border-b border-slate-100">
            <div className="flex items-center gap-2 text-slate-600">
              <Globe className="size-4 text-slate-400" />
              <span>Directory Status</span>
            </div>
            <span className="text-blue-700 font-bold bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200/60 text-[11px]">
              Active & Listed
            </span>
          </div>

          {/* Member Since (Real Date) */}
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2 text-slate-600">
              <Clock className="size-4 text-slate-400" />
              <span>Registered Since</span>
            </div>
            <span className="text-slate-800 font-semibold text-[11px]">{memberSince}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorProfileSummaryCard
