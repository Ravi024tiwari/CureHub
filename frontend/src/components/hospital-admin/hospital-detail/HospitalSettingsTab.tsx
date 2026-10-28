import { type FC } from 'react'
import {
  Settings,
  ShieldCheck,
  Clock,
  Power,
  PowerOff,
  Edit3,
} from 'lucide-react'
import type { HospitalBranchItem } from '@/types/hospitalAdmin'

interface HospitalSettingsTabProps {
  hospital: HospitalBranchItem
  onEdit: () => void
  onToggleActive: () => void
  isToggling?: boolean
}

export const HospitalSettingsTab: FC<HospitalSettingsTabProps> = ({
  hospital,
  onEdit,
  onToggleActive,
  isToggling = false,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="size-5 text-blue-600" />
            <span>Branch Operational Settings</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure hospital availability, administrative state, and documentation.
          </p>
        </div>

        <button
          type="button"
          onClick={onEdit}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
        >
          <Edit3 className="size-3.5" />
          <span>Edit Profile</span>
        </button>
      </div>

      <div className="space-y-4">
        {/* Status management block */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Hospital Active Status</h4>
            <p className="text-xs text-slate-500 mt-0.5 max-w-md">
              {hospital.isActive
                ? 'This hospital branch is currently visible to patients and accepting new appointments.'
                : 'This hospital branch is paused and temporarily hidden from new patient discovery.'}
            </p>
          </div>

          <button
            type="button"
            disabled={isToggling}
            onClick={onToggleActive}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50 ${
              hospital.isActive
                ? 'bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100'
                : 'bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            {hospital.isActive ? (
              <>
                <PowerOff className="size-3.5 text-rose-600" />
                <span>Deactivate Branch</span>
              </>
            ) : (
              <>
                <Power className="size-3.5 text-emerald-600" />
                <span>Activate Branch</span>
              </>
            )}
          </button>
        </div>

        {/* Verification and License block */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-600" />
            <span>License & Regulatory Verification</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 font-semibold block">License Registration Number</span>
              <span className="font-bold text-slate-800 font-mono text-xs">
                {hospital.licenseNumber || 'MH/123456/2010'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">Facility Status</span>
              <span className="font-bold text-emerald-600">
                {hospital.isActive !== false ? 'Active & Registered' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        {/* Operating schedule block */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="size-4 text-blue-600" />
            <span>Emergency & OPD Schedule</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 font-semibold block">24x7 Emergency Care</span>
              <span className="font-bold text-slate-800">
                {hospital.isEmergency24x7 !== false ? 'Enabled (Always Open)' : 'Disabled'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">OPD Working Hours</span>
              <span className="font-bold text-slate-800">
                {hospital.openingTime || '09:00 AM'} - {hospital.closingTime || '11:00 PM'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
