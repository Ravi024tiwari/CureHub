import React, { useEffect, useState } from 'react'
import {
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
} from 'lucide-react'
import { HospitalAdminLayout } from '@/components/hospital-admin/HospitalAdminLayout'
import {
  DoctorLeavesKpiGrid,
  DoctorLeavesFilterBar,
  DoctorLeavesTable,
  DoctorLeavesMobileCards,
  DoctorLeaveActionModal,
} from '@/components/hospital-admin/leaves'
import { useHospitalAdminLeavesStore } from '@/store/hospitalAdminLeavesStore'

export const HospitalAdminDoctorLeavesPage: React.FC = () => {
  const {
    fetchLeaves,
    isLoading,
    actionSuccessMessage,
    actionErrorMessage,
    clearActionMessages,
  } = useHospitalAdminLeavesStore()

  const [showInfoBanner, setShowInfoBanner] = useState(false)

  // Fetch initial batch of leave requests on mount
  useEffect(() => {
    fetchLeaves(1)
  }, [fetchLeaves])

  // Auto-dismiss success toast
  useEffect(() => {
    if (actionSuccessMessage) {
      const timer = setTimeout(() => {
        clearActionMessages()
      }, 6000)
      return () => clearTimeout(timer)
    }
  }, [actionSuccessMessage, clearActionMessages])

  return (
    <HospitalAdminLayout>
      <main className="flex-1 max-w-[1680px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-5 sm:py-7 space-y-5 sm:space-y-6 min-h-full pb-24 animate-in fade-in duration-200">
        {/* Top Header Bar matching mockup */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>Doctor Leave Requests</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Review and manage leave applications from doctors in your hospital(s).
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => fetchLeaves()}
              disabled={isLoading}
              title="Refresh leave requests"
              className="p-2.5 rounded-2xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
            >
              <RefreshCw className={`size-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => setShowInfoBanner(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Plus className="size-4 stroke-[2.5]" />
              <span>New Leave Request</span>
            </button>
          </div>
        </div>

        {/* Informational banner when admin clicks "+ New Leave Request" */}
        {showInfoBanner && (
          <div className="p-4 rounded-3xl bg-blue-50 border border-blue-200 text-blue-900 flex items-start justify-between gap-3 shadow-xs animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-start gap-3">
              <Sparkles className="size-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm space-y-0.5">
                <p className="font-bold">Doctor-Led Leave Application System:</p>
                <p className="text-blue-800/90 text-xs leading-relaxed">
                  Doctor leave applications are initiated directly by doctors through their Doctor
                  Portal schedule settings. This ensures the doctor reviews and reassigns their
                  scheduled patient bookings with zero deduction before hospital administrative
                  approval.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowInfoBanner(false)}
              className="p-1 text-blue-500 hover:text-blue-800 rounded-lg cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {/* Global Action Notifications */}
        {actionSuccessMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between shadow-xs animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold">
              <CheckCircle2 className="size-4.5 text-emerald-600 shrink-0" />
              <span>{actionSuccessMessage}</span>
            </div>
            <button
              type="button"
              onClick={clearActionMessages}
              className="p-1 text-emerald-600 hover:text-emerald-900 rounded-lg cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {actionErrorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center justify-between shadow-xs animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold">
              <AlertCircle className="size-4.5 text-rose-600 shrink-0" />
              <span>{actionErrorMessage}</span>
            </div>
            <button
              type="button"
              onClick={clearActionMessages}
              className="p-1 text-rose-600 hover:text-rose-900 rounded-lg cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {/* 1. Top 4 KPI Cards matching mockup */}
        <DoctorLeavesKpiGrid />

        {/* 2. Search & Filters Bar matching mockup */}
        <DoctorLeavesFilterBar />

        {/* 3. Mobile View (< 1024px) */}
        <DoctorLeavesMobileCards />

        {/* 4. Desktop Full-Width Responsive Table (1024px+) */}
        <div className="hidden lg:block w-full">
          <DoctorLeavesTable />
        </div>

        {/* Global Action Modal for Confirmation/Rejection Reason */}
        <DoctorLeaveActionModal />
      </main>
    </HospitalAdminLayout>
  )
}

export default HospitalAdminDoctorLeavesPage

