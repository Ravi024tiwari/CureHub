import { useState, type FC } from 'react'
import {
  X,
  Mail,
  Phone,
  Building2,
  Power,
  FileBadge,
  AlertCircle,
} from 'lucide-react'
import { useAdminDoctorsStore } from '@/store/adminDoctorsStore'

export const AdminDoctorDetailDrawer: FC = () => {
  const { selectedDoctor, isDetailDrawerOpen, closeDoctorDetails, openStatusModal } =
    useAdminDoctorsStore()
  const [activeTab, setActiveTab] = useState<'profile' | 'schedule' | 'experience' | 'leaves'>('profile')

  if (!isDetailDrawerOpen || !selectedDoctor) return null

  const doctorName = selectedDoctor.userId?.name
    ? selectedDoctor.userId.name.startsWith('Dr.')
      ? selectedDoctor.userId.name
      : `Dr. ${selectedDoctor.userId.name}`
    : 'Dr. Specialist'

  const isActive = selectedDoctor.userId?.isActive ?? (selectedDoctor.verificationStatus === 'APPROVED')
  const hospitalName = selectedDoctor.hospitalId?.name || 'Unaffiliated / General OPD'
  const hospitalLoc = selectedDoctor.hospitalId?.address?.city
    ? `${selectedDoctor.hospitalId.address.city}, ${selectedDoctor.hospitalId.address.state || 'India'}`
    : ''

  const handleToggleClick = () => {
    if (isActive) {
      openStatusModal(selectedDoctor, 'disable')
    } else {
      openStatusModal(selectedDoctor, 'enable')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={closeDoctorDetails}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity cursor-pointer"
      />

      {/* Slide-over panel */}
      <aside className="relative w-full max-w-full sm:max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-right duration-300 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black">
              {doctorName.replace('Dr. ', '').charAt(0) || 'D'}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                Doctor Profile & Governance
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium">
                Admin controls and credential management
              </p>
            </div>
          </div>

          <button
            onClick={closeDoctorDetails}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* Top Doctor Profile Summary Card */}
          <div className="bg-slate-50/80 rounded-3xl p-4 sm:p-5 border border-slate-200/80 space-y-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="size-14 sm:size-16 rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-xs flex items-center justify-center shrink-0">
                  {selectedDoctor.userId?.avatar ? (
                    <img
                      src={selectedDoctor.userId.avatar}
                      alt={doctorName}
                      className="size-full object-cover"
                    />
                  ) : (
                    <span className="font-black text-xl text-blue-700">
                      {doctorName.replace('Dr. ', '').charAt(0) || 'D'}
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-sm sm:text-base font-black text-slate-900">{doctorName}</h4>
                  <p className="text-xs font-bold text-slate-600">{selectedDoctor.department}</p>
                  <p className="text-[11px] text-slate-400">
                    {Array.isArray(selectedDoctor.qualifications)
                      ? selectedDoctor.qualifications.join(', ')
                      : 'MBBS'}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                {isActive ? (
                  <span className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Active Account</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-black bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
                    <span className="size-2 rounded-full bg-rose-500" />
                    <span>Account Disabled</span>
                  </span>
                )}
              </div>
            </div>

            {/* If disabled, display reason notice */}
            {!isActive && selectedDoctor.rejectionReason && (
              <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-xs text-rose-800 flex items-start gap-2 font-medium">
                <AlertCircle className="size-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Deactivation Reason:</span>
                  <p className="mt-0.5 text-rose-700">{selectedDoctor.rejectionReason}</p>
                </div>
              </div>
            )}

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 text-center">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block">Experience</span>
                <span className="text-xs font-black text-slate-800">
                  {selectedDoctor.experienceYears || 8}+ Years
                </span>
              </div>
              <div className="border-x border-slate-200/60">
                <span className="text-[10px] font-bold text-slate-400 block">Consultation Fee</span>
                <span className="text-xs font-black text-emerald-700">
                  ₹ {selectedDoctor.consultationFee || 600}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block">Verification</span>
                <span className="text-xs font-black text-blue-700">
                  {selectedDoctor.verificationStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Affiliated Hospital Banner */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="size-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                <Building2 className="size-4.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Affiliated Hospital
                </span>
                <p className="text-xs font-black text-slate-800 truncate">{hospitalName}</p>
                <p className="text-[10px] text-slate-400 truncate">{hospitalLoc}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-slate-200/80 pb-1 overflow-x-auto no-scrollbar">
            {(
              [
                { key: 'profile', label: 'Credentials' },
                { key: 'schedule', label: 'OPD Schedule' },
                { key: 'experience', label: 'Experience' },
                { key: 'leaves', label: 'Leaves' },
              ] as const
            ).map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeTab === t.key
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Profile & Credentials */}
          {activeTab === 'profile' && (
            <div className="space-y-3 text-xs">
              <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <h5 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <FileBadge className="size-3.5 text-blue-600" />
                  <span>Medical Registration & Licensing</span>
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">Council Reg Number</span>
                    <span className="font-mono font-black text-blue-700">
                      {selectedDoctor.medicalCouncilRegistrationNumber || 'MCI/12345/2016'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">Registration Authority</span>
                    <span className="font-bold text-slate-800">State Medical Council / NMC</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">Email Address</span>
                    <span className="font-bold text-slate-700 flex items-center gap-1 truncate">
                      <Mail className="size-3 text-slate-400 shrink-0" />
                      <span className="truncate">{selectedDoctor.userId?.email || 'N/A'}</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">Contact Phone</span>
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      <Phone className="size-3 text-slate-400 shrink-0" />
                      <span>{selectedDoctor.userId?.phoneNumber || 'N/A'}</span>
                    </span>
                  </div>
                </div>

                {selectedDoctor.bio && (
                  <div className="pt-2 border-t border-slate-200/60">
                    <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Bio</span>
                    <p className="text-slate-600 leading-relaxed font-medium">{selectedDoctor.bio}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Schedule */}
          {activeTab === 'schedule' && (
            <div className="space-y-3 text-xs">
              {Array.isArray(selectedDoctor.scheduleRules) && selectedDoctor.scheduleRules.length > 0 ? (
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-extrabold text-slate-400 uppercase">
                      <tr>
                        <th className="p-2.5">Day</th>
                        <th className="p-2.5">OPD Timings</th>
                        <th className="p-2.5">Slot</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {selectedDoctor.scheduleRules.map((rule, i) => {
                        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                        return (
                          <tr key={i}>
                            <td className="p-2.5 font-bold text-slate-900">{days[rule.dayOfWeek] || 'Everyday'}</td>
                            <td className="p-2.5 font-mono">{rule.startTime} - {rule.endTime}</td>
                            <td className="p-2.5">{rule.slotDurationMinutes} mins</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-center">
                  <p className="text-xs font-bold text-slate-700">Regular OPD Routine</p>
                  <p className="text-xs text-slate-400 mt-0.5">Mon - Sat • 09:00 AM - 05:00 PM</p>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Experience */}
          {activeTab === 'experience' && (
            <div className="space-y-2.5 text-xs">
              {Array.isArray(selectedDoctor.experiences) && selectedDoctor.experiences.length > 0 ? (
                selectedDoctor.experiences.map((exp, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-900">{exp.title}</span>
                      <span className="text-blue-600 font-bold text-[11px]">{exp.period}</span>
                    </div>
                    <p className="text-slate-700 font-bold mt-0.5">{exp.institution}</p>
                    {exp.description && <p className="text-slate-500 mt-1">{exp.description}</p>}
                  </div>
                ))
              ) : (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-center text-slate-500">
                  Clinical consultant with over {selectedDoctor.experienceYears || 8} years of specialized practice.
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Leaves */}
          {activeTab === 'leaves' && (
            <div className="space-y-2 text-xs">
              {Array.isArray(selectedDoctor.leaves) && selectedDoctor.leaves.length > 0 ? (
                selectedDoctor.leaves.map((l, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">{l.date}</span>
                      <p className="text-[11px] text-slate-400">{l.reason || 'Personal Leave'}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                      Planned
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-center text-slate-500">
                  No active or planned leaves scheduled.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Admin Action Controls */}
        <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={closeDoctorDetails}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Close
          </button>

          <button
            type="button"
            onClick={handleToggleClick}
            className={`px-4 sm:px-5 py-2 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer ${
              isActive
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/25'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25'
            }`}
          >
            <Power className="size-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">{isActive ? 'Disable Doctor Access' : 'Activate Doctor Account'}</span>
            <span className="sm:hidden">{isActive ? 'Disable Access' : 'Activate'}</span>
          </button>
        </div>
      </aside>
    </div>
  )
}

export default AdminDoctorDetailDrawer
