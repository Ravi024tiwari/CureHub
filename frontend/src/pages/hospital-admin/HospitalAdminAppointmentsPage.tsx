import React, { useEffect, useState, useRef } from 'react'
import {
  Calendar,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
} from 'lucide-react'
import { HospitalAdminLayout } from '@/components/hospital-admin/HospitalAdminLayout'
import {
  AppointmentsKpiGrid,
  AppointmentsFilterBar,
  AppointmentsTable,
  CancelAppointmentModal,
  RescheduleAppointmentModal,
} from '@/components/hospital-admin/appointments'
import { useHospitalAdminAppointmentsStore } from '@/store/hospitalAdminAppointmentsStore'
import type { AdminAppointmentItem } from '@/types/hospitalAdmin'

export const HospitalAdminAppointmentsPage: React.FC = () => {
  const {
    fetchInitialAppointments,
    isLoading,
    actionSuccessMessage,
    actionErrorMessage,
    clearActionMessages,
    selectedDate,
    setSelectedDate,
  } = useHospitalAdminAppointmentsStore()

  // Modal states for action dialogs
  const [rescheduleTarget, setRescheduleTarget] = useState<AdminAppointmentItem | null>(null)
  const [cancelTarget, setCancelTarget] = useState<AdminAppointmentItem | null>(null)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const dateDropdownRef = useRef<HTMLDivElement | null>(null)

  // Fetch initial batch of 10 appointments on page mount
  useEffect(() => {
    fetchInitialAppointments()
  }, [fetchInitialAppointments])

  // Close date picker dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(e.target as Node)) {
        setIsDatePickerOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Auto-dismiss success toast after 6 seconds
  useEffect(() => {
    if (actionSuccessMessage) {
      const timer = setTimeout(() => {
        clearActionMessages()
      }, 6000)
      return () => clearTimeout(timer)
    }
  }, [actionSuccessMessage, clearActionMessages])

  const quickDates = [
    { label: 'All Dates', value: '' },
    { label: 'Today, 27 Oct 2024', value: '2024-10-27' },
    { label: 'Tomorrow, 28 Oct 2024', value: '2024-10-28' },
    { label: 'Yesterday, 26 Oct 2024', value: '2024-10-26' },
  ]

  const currentDisplayDate =
    quickDates.find((q) => q.value === selectedDate)?.label ||
    (selectedDate ? `Date: ${selectedDate}` : 'All Dates')

  return (
    <HospitalAdminLayout activePage="appointments">
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8 space-y-6 sm:space-y-8 min-h-full pb-20 animate-in fade-in duration-200">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Appointments
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              View and manage all appointments for doctors in your hospital(s).
            </p>
          </div>

          {/* Action buttons (Date Selector & Refresh) */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Date Selector Dropdown */}
            <div className="relative" ref={dateDropdownRef}>
              <button
                type="button"
                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs sm:text-sm font-semibold text-slate-700 shadow-2xs hover:border-slate-300 transition-colors cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>{currentDisplayDate}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isDatePickerOpen && (
                <div className="absolute right-0 mt-1.5 w-60 rounded-xl bg-white shadow-xl border border-slate-200 p-2 z-30 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                    Quick Filter
                  </div>
                  {quickDates.map((q) => (
                    <button
                      key={q.value}
                      type="button"
                      onClick={() => {
                        setSelectedDate(q.value)
                        setIsDatePickerOpen(false)
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                        selectedDate === q.value
                          ? 'bg-blue-50 text-blue-700 font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {q.label}
                    </button>
                  ))}
                  <div className="pt-2 border-t border-slate-100 px-2 pb-1">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Custom Date:
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => {
                        setSelectedDate(e.target.value)
                        setIsDatePickerOpen(false)
                      }}
                      className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={() => fetchInitialAppointments()}
              disabled={isLoading}
              title="Refresh Appointments"
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 shadow-2xs transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Action Feedback Notifications */}
        {actionSuccessMessage && (
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm shadow-2xs animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="font-medium">{actionSuccessMessage}</span>
            </div>
            <button
              onClick={clearActionMessages}
              className="p-1 text-emerald-600 hover:text-emerald-800 rounded-lg hover:bg-emerald-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {actionErrorMessage && (
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm shadow-2xs animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span className="font-medium">{actionErrorMessage}</span>
            </div>
            <button
              onClick={clearActionMessages}
              className="p-1 text-red-600 hover:text-red-800 rounded-lg hover:bg-red-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 4-KPI Grid */}
        <AppointmentsKpiGrid />

        {/* Filter Bar with Search, Selects, Reset */}
        <AppointmentsFilterBar />

        {/* Infinite-Scroll Appointments Table & Mobile Cards */}
        <AppointmentsTable
          onOpenReschedule={(appointment) => setRescheduleTarget(appointment)}
          onOpenCancel={(appointment) => setCancelTarget(appointment)}
        />

        {/* Action Modals */}
        <CancelAppointmentModal
          appointment={cancelTarget}
          isOpen={!!cancelTarget}
          onClose={() => setCancelTarget(null)}
        />

        <RescheduleAppointmentModal
          appointment={rescheduleTarget}
          isOpen={!!rescheduleTarget}
          onClose={() => setRescheduleTarget(null)}
        />
      </main>
    </HospitalAdminLayout>
  )
}

export default HospitalAdminAppointmentsPage
