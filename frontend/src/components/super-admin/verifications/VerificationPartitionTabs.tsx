import { type FC } from 'react'
import { Stethoscope, Building2 } from 'lucide-react'

export type VerificationPartition = 'doctors' | 'hospital-admins'

interface VerificationPartitionTabsProps {
  activePartition: VerificationPartition
  onChange: (partition: VerificationPartition) => void
  doctorPendingCount?: number
  hospitalAdminPendingCount?: number
}

export const VerificationPartitionTabs: FC<VerificationPartitionTabsProps> = ({
  activePartition,
  onChange,
  doctorPendingCount = 0,
  hospitalAdminPendingCount = 0,
}) => {
  return (
    <div className="w-full sm:w-fit overflow-x-auto p-1.5 bg-slate-100/90 border border-slate-200/90 rounded-2xl flex items-center gap-1.5 shadow-2xs select-none">
      {/* 1. Doctor Verifications Tab */}
      <button
        type="button"
        onClick={() => onChange('doctors')}
        className={`flex-1 sm:flex-initial flex items-center justify-center sm:justify-start gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 ${
          activePartition === 'doctors'
            ? 'bg-white text-blue-700 shadow-xs border border-slate-200/70'
            : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
        }`}
      >
        <Stethoscope
          className={`w-4 h-4 shrink-0 transition-colors ${
            activePartition === 'doctors' ? 'text-blue-600' : 'text-slate-400'
          }`}
        />
        <span className="whitespace-nowrap">Doctor Verifications</span>

        {doctorPendingCount > 0 && (
          <span
            className={`text-[10px] font-black px-2 py-0.5 rounded-full transition-colors ${
              activePartition === 'doctors'
                ? 'bg-amber-100 text-amber-800 border border-amber-200/60'
                : 'bg-slate-200/80 text-slate-700'
            }`}
          >
            {doctorPendingCount}
          </span>
        )}
      </button>

      {/* 2. Hospital Admin Verifications Tab */}
      <button
        type="button"
        onClick={() => onChange('hospital-admins')}
        className={`flex-1 sm:flex-initial flex items-center justify-center sm:justify-start gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 ${
          activePartition === 'hospital-admins'
            ? 'bg-white text-blue-700 shadow-xs border border-slate-200/70'
            : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
        }`}
      >
        <Building2
          className={`w-4 h-4 shrink-0 transition-colors ${
            activePartition === 'hospital-admins' ? 'text-blue-600' : 'text-slate-400'
          }`}
        />
        <span className="whitespace-nowrap">Hospital Admin Verifications</span>

        {hospitalAdminPendingCount > 0 && (
          <span
            className={`text-[10px] font-black px-2 py-0.5 rounded-full transition-colors ${
              activePartition === 'hospital-admins'
                ? 'bg-amber-100 text-amber-800 border border-amber-200/60'
                : 'bg-slate-200/80 text-slate-700'
            }`}
          >
            {hospitalAdminPendingCount}
          </span>
        )}
      </button>
    </div>
  )
}

export default VerificationPartitionTabs
