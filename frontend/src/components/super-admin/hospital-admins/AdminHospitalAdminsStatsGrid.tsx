import type { FC } from 'react'
import {
  Building2,
  Building,
  Clock,
  Ban,
  TrendingUp,
  ChevronRight,
} from 'lucide-react'
import { useAdminHospitalAdminsStore } from '@/store/adminHospitalAdminsStore'

export const AdminHospitalAdminsStatsGrid: FC = () => {
  const { stats, setFilters, filters } = useAdminHospitalAdminsStore()

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4.5">
      {/* 1. Total Verified Admins */}
      <div
        onClick={() => setFilters({ status: 'APPROVED' })}
        className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all duration-200 cursor-pointer group shadow-2xs hover:shadow-sm ${
          filters.status === 'APPROVED'
            ? 'border-blue-500 ring-2 ring-blue-500/10'
            : 'border-slate-200/80 hover:border-blue-200'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div className="size-11 sm:size-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
            <Building2 className="size-6 stroke-[2]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {stats.totalVerified}
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500 truncate mt-0.5">
              Total Verified Admins
            </p>
          </div>
        </div>
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span className="inline-flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
            <TrendingUp className="size-3 stroke-[2.5]" />
            <span>{stats.verifiedGrowth >= 0 ? `+${stats.verifiedGrowth}%` : `${stats.verifiedGrowth}%`}</span>
            <span className="font-medium text-emerald-700/80">from last month</span>
          </span>
          <span className="text-slate-400 font-semibold group-hover:text-blue-600 transition-colors">
            View All
          </span>
        </div>
      </div>

      {/* 2. Hospitals Managed */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 hover:border-emerald-200 transition-all duration-200 shadow-2xs hover:shadow-sm group">
        <div className="flex items-center gap-3.5">
          <div className="size-11 sm:size-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
            <Building className="size-6 stroke-[2]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {stats.hospitalsManaged}
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500 truncate mt-0.5">
              Hospitals Managed
            </p>
          </div>
        </div>
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span className="inline-flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
            <TrendingUp className="size-3 stroke-[2.5]" />
            <span>{stats.hospitalsGrowth >= 0 ? `+${stats.hospitalsGrowth}%` : `${stats.hospitalsGrowth}%`}</span>
            <span className="font-medium text-emerald-700/80">from last month</span>
          </span>
          <span className="text-slate-400 font-semibold">Platform Total</span>
        </div>
      </div>

      {/* 3. Pending Verifications */}
      <div
        onClick={() => setFilters({ status: 'PENDING' })}
        className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all duration-200 cursor-pointer group shadow-2xs hover:shadow-sm ${
          filters.status === 'PENDING'
            ? 'border-violet-500 ring-2 ring-violet-500/10'
            : 'border-slate-200/80 hover:border-violet-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="size-11 sm:size-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
              <Clock className="size-6 stroke-[2]" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {stats.pendingVerifications}
              </span>
              <p className="text-xs font-semibold text-slate-500 truncate mt-0.5">
                Pending Verifications
              </p>
            </div>
          </div>
          <ChevronRight className="size-4 text-slate-300 group-hover:text-violet-600 group-hover:translate-x-0.5 transition-all" />
        </div>
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span className="text-violet-600 font-bold bg-violet-50 px-2 py-0.5 rounded-md">
            Needs Review
          </span>
          <span className="text-slate-400 font-medium">Click to filter</span>
        </div>
      </div>

      {/* 4. Rejected Requests */}
      <div
        onClick={() => setFilters({ status: 'REJECTED' })}
        className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all duration-200 cursor-pointer group shadow-2xs hover:shadow-sm ${
          filters.status === 'REJECTED'
            ? 'border-rose-500 ring-2 ring-rose-500/10'
            : 'border-slate-200/80 hover:border-rose-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="size-11 sm:size-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
              <Ban className="size-6 stroke-[2]" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {stats.rejectedRequests}
              </span>
              <p className="text-xs font-semibold text-slate-500 truncate mt-0.5">
                Rejected Requests
              </p>
            </div>
          </div>
          <ChevronRight className="size-4 text-slate-300 group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all" />
        </div>
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-md">
            Declined
          </span>
          <span className="text-slate-400 font-medium">Click to filter</span>
        </div>
      </div>
    </div>
  )
}
