import { useEffect, useState, useRef, type FC } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useDoctorStore } from '@/store/doctorStore'
import { toast } from '@/components/common'
import { DoctorSidebar, DoctorHeader } from '@/components/doctor/dashboard'
import {
  DoctorScheduleHeader,
  DoctorScheduleKpiCards,
  DoctorScheduleTabs,
  DoctorWeeklyScheduleEditor,
  DoctorLiveSlotPreview,
  DoctorLeavesManager,
  type ScheduleTabType,
} from '@/components/doctor/schedule'
import type { DoctorScheduleRule } from '@/services/doctorService'

interface DoctorSchedulePageProps {
  initialTab?: ScheduleTabType
}

export const DoctorSchedulePage: FC<DoctorSchedulePageProps> = ({
  initialTab = 'routine',
}) => {
  const { user } = useAuthStore()
  const {
    scheduleRules,
    leaves,
    isScheduleLoading,
    scheduleError,
    isSavingSchedule,
    fetchScheduleAndLeaves,
    saveScheduleRules,
    applyLeave,
    cancelLeave,
    dashboardData,
  } = useDoctorStore()

  const [activeTab, setActiveTab] = useState<ScheduleTabType>(initialTab)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [draftRules, setDraftRules] = useState<DoctorScheduleRule[]>(scheduleRules)

  // Refs for scrolling to sections
  const routineRef = useRef<HTMLDivElement>(null)
  const leavesRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchScheduleAndLeaves()
  }, [])

  useEffect(() => {
    setDraftRules(scheduleRules)
  }, [scheduleRules])

  const handleTabChange = (tab: ScheduleTabType) => {
    setActiveTab(tab)
    if (tab === 'routine' && routineRef.current) {
      routineRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else if (tab === 'leaves' && leavesRef.current) {
      leavesRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else if (tab === 'preview' && previewRef.current) {
      previewRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Intercept save routine with global pop-up toast
  const handleSaveSchedule = async (rules: DoctorScheduleRule[]) => {
    const success = await saveScheduleRules(rules)
    if (success) {
      toast.success(
        'Your weekly clinic timings and patient booking slots have been updated.',
        'Routine Saved Successfully!'
      )
    } else {
      toast.error(
        scheduleError || 'Unable to update schedule rules. Please try again.',
        'Update Failed'
      )
    }
    return success
  }

  // Intercept apply leave with global pop-up toast
  const handleApplyLeave = async (date: string, reason: string) => {
    const res = await applyLeave(date, reason)
    if (res.success) {
      toast.success(
        res.affectedCount
          ? `Leave confirmed. ${res.affectedCount} appointment(s) moved to priority rescheduling.`
          : `Leave scheduled for ${date}. Patient booking slots blocked.`,
        'Leave Scheduled Successfully!'
      )
    } else {
      toast.error(res.message || 'Could not schedule leave.', 'Leave Request Failed')
    }
    return res
  }

  // Intercept cancel leave with global pop-up toast
  const handleCancelLeave = async (date: string) => {
    const success = await cancelLeave(date)
    if (success) {
      toast.success(
        `Leave for ${date} has been cancelled. Booking slots reopened.`,
        'Leave Cancelled'
      )
    } else {
      toast.error('Could not cancel leave.', 'Cancellation Failed')
    }
    return success
  }

  const doctorInfo = dashboardData?.doctorInfo
  const doctorName =
    doctorInfo?.name ||
    (user?.name ? (user.name.startsWith('Dr.') ? user.name : `Dr. ${user.name}`) : 'Doctor')
  const department = doctorInfo?.department || 'General OPD'
  const avatar = doctorInfo?.avatar || user?.avatar || null

  return (
    <div className="h-screen w-full overflow-hidden bg-[#F8FAFC] text-slate-900 flex selection:bg-blue-100 selection:text-blue-700 antialiased">
      {/* 1. Desktop Persistent Sidebar */}
      <div className="hidden lg:block h-screen shrink-0">
        <DoctorSidebar />
      </div>

      {/* 2. Mobile Drawer Sidebar */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative z-50 w-64 max-w-[80vw] h-full shadow-2xl animate-in slide-in-from-left duration-200">
            <DoctorSidebar onCloseMobile={() => setIsMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* 3. Main Body Scroll Container */}
      <div className="flex-1 h-screen overflow-y-auto overflow-x-hidden overscroll-contain flex flex-col min-w-0 transition-all">
        {/* Top Header */}
        <DoctorHeader
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
          doctorName={doctorName}
          department={department}
          avatar={avatar}
        />

        {/* Schedule Main Content Container */}
        <main className="flex-1 w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-6 pb-20">
          {/* Error Banner if any */}
          {scheduleError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold shadow-xs">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="size-5 text-rose-600 shrink-0" />
                <span>{scheduleError}</span>
              </div>
              <button
                type="button"
                onClick={fetchScheduleAndLeaves}
                className="px-3 py-1 rounded-xl bg-white border border-rose-200 text-rose-700 font-bold hover:bg-rose-100/50 cursor-pointer text-xs flex items-center gap-1.5"
              >
                <RefreshCw className="size-3" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* Loading Skeleton */}
          {isScheduleLoading && scheduleRules.length === 0 ? (
            <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
              <div className="size-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs sm:text-sm font-bold text-slate-500">
                Loading schedule rules and clinic timings...
              </p>
            </div>
          ) : (
            <>
              {/* 1. Page Header */}
              <DoctorScheduleHeader />

              {/* 2. Top Metric KPI Cards */}
              <DoctorScheduleKpiCards
                scheduleRules={scheduleRules}
                leaves={leaves}
              />

              {/* 3. Navigation View Tabs */}
              <div className="flex items-center justify-between gap-4 pt-1">
                <DoctorScheduleTabs
                  activeTab={activeTab}
                  onChangeTab={handleTabChange}
                />
              </div>

              {/* 4. Weekly Routine & Live Slot Preview Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                {/* Left Column: Weekly Routine Editor */}
                <div ref={routineRef} className="xl:col-span-8">
                  <DoctorWeeklyScheduleEditor
                    scheduleRules={scheduleRules}
                    isSaving={isSavingSchedule}
                    onSave={handleSaveSchedule}
                    onRulesChanged={(newRules) => setDraftRules(newRules)}
                  />
                </div>

                {/* Right Column: Live Slot Preview */}
                <div ref={previewRef} className="xl:col-span-4 xl:sticky xl:top-6">
                  <DoctorLiveSlotPreview
                    scheduleRules={draftRules.length > 0 ? draftRules : scheduleRules}
                    leaves={leaves}
                  />
                </div>
              </div>

              {/* 5. Leaves & Holidays Manager */}
              <div ref={leavesRef} className="pt-2">
                <DoctorLeavesManager
                  leaves={leaves}
                  onApplyLeave={handleApplyLeave}
                  onCancelLeave={handleCancelLeave}
                />
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default DoctorSchedulePage
