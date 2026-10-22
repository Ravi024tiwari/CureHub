import { type FC } from 'react'
import { Clock } from 'lucide-react'

export interface OperatingHoursData {
  openingTime: string
  closingTime: string
  isEmergency24x7: boolean
}

interface OperatingHoursCardProps {
  data: OperatingHoursData
  onChange: (fields: Partial<OperatingHoursData>) => void
}

export const OperatingHoursCard: FC<OperatingHoursCardProps> = ({ data, onChange }) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-all">
      {/* Header */}
      <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-slate-100">
        <div className="size-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-xs ring-1 ring-indigo-500/10">
          <Clock className="size-5.5 stroke-[2.2]" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            Operating Hours
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Set hospital operating hours and emergency availability.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Row 1: Opening & Closing Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Opening Time</label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={data.openingTime}
                onChange={(e) => onChange({ openingTime: e.target.value })}
                placeholder="09:00 AM"
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-white focus:bg-white text-xs sm:text-sm font-medium transition-all outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              <Clock className="size-4 text-slate-400 absolute right-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Closing Time</label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={data.closingTime}
                onChange={(e) => onChange({ closingTime: e.target.value })}
                placeholder="11:00 PM"
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-white focus:bg-white text-xs sm:text-sm font-medium transition-all outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              <Clock className="size-4 text-slate-400 absolute right-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Row 2: 24x7 Emergency Services Toggle */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-3">
            {/* Custom interactive toggle switch */}
            <button
              type="button"
              role="switch"
              aria-checked={data.isEmergency24x7}
              onClick={() => onChange({ isEmergency24x7: !data.isEmergency24x7 })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                data.isEmergency24x7 ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  data.isEmergency24x7 ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-900">
                24x7 Emergency Services
              </p>
              <p className="text-[11px] text-slate-500">
                Enable if emergency services are available 24/7
              </p>
            </div>
          </div>

          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
              data.isEmergency24x7
                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/20'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            {data.isEmergency24x7 ? 'Active 24x7' : 'Standard Hours'}
          </span>
        </div>
      </div>
    </div>
  )
}
export default OperatingHoursCard
