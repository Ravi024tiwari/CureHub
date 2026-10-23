import { type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, ShieldCheck, Check, X } from 'lucide-react'
import { useSuperAdminStore } from '@/store/superAdminStore'

export const PendingVerificationsCard: FC = () => {
  const navigate = useNavigate()
  const { pendingVerifications, quickApproveVerification, quickRejectVerification } =
    useSuperAdminStore()

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
            Pending Verifications
          </h3>
          <p className="text-[11px] text-slate-400 font-medium">
            Medical council licenses & facility registration proofs
          </p>
        </div>

        <button
          onClick={() => navigate('/super-admin/verifications')}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-0.5 cursor-pointer"
        >
          <span>View All</span>
          <ChevronRight className="size-3.5" />
        </button>
      </div>

      {/* Verification List Items */}
      <div className="space-y-2.5">
        {pendingVerifications.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50/60 hover:bg-slate-50 transition-all border border-slate-100 group"
          >
            {/* Left: Avatar + Details */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="size-9 sm:size-10 rounded-xl overflow-hidden bg-white shrink-0 border border-slate-200/80 shadow-2xs">
                {item.avatar ? (
                  <img src={item.avatar} alt={item.name} className="size-full object-cover" />
                ) : (
                  <div className="size-full flex items-center justify-center text-blue-600 bg-blue-50">
                    <ShieldCheck className="size-5" />
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                  {item.name}
                </h4>
                <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                  {item.type}
                </p>
              </div>
            </div>

            {/* Middle: Pending Badge & Time */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200/70">
                Pending
              </span>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                {item.timeAgo}
              </span>
            </div>

            {/* Quick Action Buttons on Hover */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  quickApproveVerification(item.id, item.name)
                }}
                className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/70 transition-colors cursor-pointer"
                title="Quick Approve"
                aria-label="Quick Approve"
              >
                <Check className="size-3.5 stroke-[2.5]" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  quickRejectVerification(item.id, item.name, 'Credentials require re-submission')
                }}
                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/70 transition-colors cursor-pointer"
                title="Quick Reject"
                aria-label="Quick Reject"
              >
                <X className="size-3.5 stroke-[2.5]" />
              </button>

              <button
                onClick={() => navigate('/super-admin/verifications')}
                className="p-1 text-slate-400 hover:text-blue-600 rounded-lg cursor-pointer"
                title="View Full Profile & Credentials"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PendingVerificationsCard
