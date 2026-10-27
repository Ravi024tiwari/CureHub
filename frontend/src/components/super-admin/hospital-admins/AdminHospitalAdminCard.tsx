import { useState, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2,
  Phone,
  Mail,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  Clock,
  ArrowRight,
  UserX,
  UserCheck,
  MapPin,
  Copy,
  Check,
} from 'lucide-react'
import type { HospitalAdminVerificationRecord } from '@/types/superAdmin'
import { useAdminHospitalAdminsStore } from '@/store/adminHospitalAdminsStore'

interface Props {
  admin: HospitalAdminVerificationRecord
}

export const AdminHospitalAdminCard: FC<Props> = ({ admin }) => {
  const navigate = useNavigate()
  const { openStatusModal } = useAdminHospitalAdminsStore()
  const [copiedType, setCopiedType] = useState<'email' | 'phone' | null>(null)

  const user = admin.userId || ({} as any)
  const hospital: any = admin.hospitalId || {}
  const hospitalName = hospital.name || admin.hospitalName || 'Unassigned Hospital'
  const hospitalType = hospital.hospitalType || admin.hospitalType
  const hospitalCity =
    hospital.address?.city ||
    (admin.hospitalAddress ? admin.hospitalAddress.split(',')[0].trim() : '')
  const hospitalState =
    hospital.address?.state ||
    (admin.hospitalAddress && admin.hospitalAddress.includes(',')
      ? admin.hospitalAddress.split(',')[1].trim()
      : '')
  const locationStr = [hospitalCity, hospitalState].filter(Boolean).join(', ')

  const isVerified = admin.verificationStatus === 'APPROVED'
  const isPending = admin.verificationStatus === 'PENDING'
  const isRejected = admin.verificationStatus === 'REJECTED'
  const isAccountActive = user.isActive !== false

  const handleCopy = (e: React.MouseEvent, text: string | undefined, type: 'email' | 'phone') => {
    e.stopPropagation()
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedType(type)
    setTimeout(() => setCopiedType(null), 1800)
  }

  const handleCardClick = () => {
    navigate(`/super-admin/hospital-admins/${admin._id}`)
  }

  return (
    <div
      onClick={handleCardClick}
      className="relative bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400 p-3.5 sm:p-4 shadow-2xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between group cursor-pointer overflow-hidden"
    >
      {/* Top ambient color glow on hover */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-blue-500/0 to-transparent group-hover:via-blue-500 transition-all duration-300" />

      <div className="space-y-2.5">
        {/* 1. Header: Avatar + Identity + Status Pill */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Avatar with Status Dot */}
            <div className="relative shrink-0">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name || 'Admin'}
                  className="size-10 rounded-xl object-cover ring-2 ring-slate-100 shadow-2xs"
                />
              ) : (
                <div className="size-10 rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 text-white font-black flex items-center justify-center text-xs shadow-2xs shadow-blue-500/20">
                  {user.name ? user.name.slice(0, 2).toUpperCase() : 'HA'}
                </div>
              )}

              {/* Status Indicator */}
              <span
                className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full ring-2 ring-white flex items-center justify-center ${
                  isAccountActive ? 'bg-emerald-500' : 'bg-slate-400'
                }`}
                title={isAccountActive ? 'Active' : 'Disabled'}
              >
                {isAccountActive && (
                  <span className="size-1 rounded-full bg-white animate-pulse" />
                )}
              </span>
            </div>

            {/* Admin Name & Designation */}
            <div className="min-w-0">
              <h3 className="font-black text-slate-900 group-hover:text-blue-600 transition-colors text-xs sm:text-sm leading-tight truncate">
                {user.name || 'Unnamed Admin'}
              </h3>
              <p className="text-[11px] font-medium text-slate-500 truncate mt-0.5">
                {admin.designation || 'Hospital Administrator'}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="shrink-0">
            {isVerified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="size-3" />
                <span>Verified</span>
              </span>
            )}
            {isPending && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                <Clock className="size-3" />
                <span>Pending</span>
              </span>
            )}
            {isRejected && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                <ShieldAlert className="size-3" />
                <span>Rejected</span>
              </span>
            )}
            {!isVerified && !isPending && !isRejected && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                {admin.verificationStatus || 'Unverified'}
              </span>
            )}
          </div>
        </div>

        {/* 2. Hospital Details Block */}
        <div className="p-2.5 rounded-xl bg-slate-50/90 border border-slate-200/70 group-hover:border-blue-200/80 transition-colors">
          <div className="flex items-center gap-2 min-w-0">
            <div className="size-6 rounded-lg bg-white text-blue-600 flex items-center justify-center shrink-0 border border-slate-200/70 shadow-2xs">
              <Building2 className="size-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <h4 className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-700 transition-colors">
                  {hospitalName}
                </h4>
                {hospitalType && (
                  <span className="text-[9px] font-semibold text-slate-500 bg-white border border-slate-200/60 px-1.5 py-0.2 rounded shrink-0">
                    {hospitalType}
                  </span>
                )}
              </div>
              {locationStr && (
                <div className="flex items-center gap-1 text-[10.5px] font-medium text-slate-400 truncate mt-0.5">
                  <MapPin className="size-2.5 shrink-0" />
                  <span className="truncate">{locationStr}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. Contact & Verification Meta */}
        <div className="space-y-1.5 text-[11px] pt-0.5">
          {user.email && (
            <div
              onClick={(e) => handleCopy(e, user.email, 'email')}
              className="flex items-center justify-between py-1 px-2 rounded-lg bg-slate-50/60 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer group/item"
              title="Click to copy email"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Mail className="size-3 text-slate-400 shrink-0" />
                <span className="truncate font-medium">{user.email}</span>
              </div>
              <span className="text-[10px] text-slate-400 group-hover/item:text-blue-600 shrink-0 ml-1">
                {copiedType === 'email' ? (
                  <span className="inline-flex items-center gap-0.5 text-emerald-600 font-bold">
                    <Check className="size-3" />
                    Copied
                  </span>
                ) : (
                  <Copy className="size-2.5 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                )}
              </span>
            </div>
          )}

          {user.phoneNumber && (
            <div
              onClick={(e) => handleCopy(e, user.phoneNumber, 'phone')}
              className="flex items-center justify-between py-1 px-2 rounded-lg bg-slate-50/60 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer group/item"
              title="Click to copy phone number"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Phone className="size-3 text-slate-400 shrink-0" />
                <span className="truncate font-medium">{user.phoneNumber}</span>
              </div>
              <span className="text-[10px] text-slate-400 group-hover/item:text-blue-600 shrink-0 ml-1">
                {copiedType === 'phone' ? (
                  <span className="inline-flex items-center gap-0.5 text-emerald-600 font-bold">
                    <Check className="size-3" />
                    Copied
                  </span>
                ) : (
                  <Copy className="size-2.5 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                )}
              </span>
            </div>
          )}

          {admin.verifiedAt && (
            <div className="flex items-center gap-1.5 px-2 text-[10px] text-slate-400">
              <Calendar className="size-3 shrink-0" />
              <span>
                Verified on{' '}
                <span className="font-semibold text-slate-600">
                  {new Date(admin.verifiedAt).toLocaleDateString('en-US', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 4. Action Footer */}
      <div
        className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        {isAccountActive ? (
          <button
            onClick={() => openStatusModal(admin, 'disable')}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
          >
            <UserX className="size-3" />
            <span>Disable</span>
          </button>
        ) : (
          <button
            onClick={() => openStatusModal(admin, 'enable')}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
          >
            <UserCheck className="size-3" />
            <span>Enable</span>
          </button>
        )}

        <button
          onClick={() => navigate(`/super-admin/hospital-admins/${admin._id}`)}
          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-bold text-[11px] rounded-lg transition-all cursor-pointer group/btn"
        >
          <span>View Details</span>
          <ArrowRight className="size-3 group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  )
}
