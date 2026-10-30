import { useState, type FC } from 'react'
import {
  Ambulance,
  PhoneCall,
  X,
  ChevronRight,
  Clock,
} from 'lucide-react'

interface EmergencySosBannerProps {
  nearestHospitalName?: string
  nearestHospitalDistance?: string
  onFindEmergencyHospitals?: () => void
}

export const EmergencySosBanner: FC<EmergencySosBannerProps> = ({
  nearestHospitalName = 'Apollo Multispeciality Hospital',
  nearestHospitalDistance = '2.3 km',
  onFindEmergencyHospitals,
}) => {
  const [isDismissed, setIsDismissed] = useState(false)

  if (isDismissed) return null

  return (
    <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 text-white p-4 sm:p-5 shadow-lg shadow-rose-900/15 overflow-hidden animate-in fade-in duration-300">
      {/* Background ambient pattern */}
      <div className="absolute right-0 top-0 -mt-6 -mr-6 size-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute left-1/3 bottom-0 -mb-8 size-40 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Urgent Notice & Live Indicator */}
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          <div className="size-11 sm:size-12 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center shrink-0 border border-white/30 shadow-xs">
            <Ambulance className="size-6 stroke-[2.2] animate-bounce" />
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black tracking-wider uppercase backdrop-blur-md border border-white/25">
                <span className="size-1.5 rounded-full bg-white animate-ping" />
                <span>24/7 Rapid Emergency Support</span>
              </span>

              <span className="hidden lg:inline-flex items-center gap-1 text-[11px] text-white/90 font-semibold">
                <Clock className="size-3" />
                <span>Immediate Ambulance Dispatch</span>
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-black tracking-tight leading-tight">
              Medical Emergency or Trauma?
            </h3>

            <p className="text-xs text-white/90 font-medium truncate max-w-xl">
              Nearest facility: <strong className="text-white">{nearestHospitalName}</strong> (
              <span className="underline">{nearestHospitalDistance} away</span>) • ICU & Trauma 24/7
            </p>
          </div>
        </div>

        {/* Right: Quick SOS Call Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap shrink-0">
          {/* Ambulance Call 108 */}
          <a
            href="tel:108"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-rose-700 font-black text-xs sm:text-sm hover:bg-rose-50 shadow-md transition-all active:scale-[0.98] cursor-pointer"
          >
            <PhoneCall className="size-4 text-rose-600 shrink-0" />
            <span>Call 108 Ambulance</span>
          </a>

          {/* Emergency Hospitals Filter Button */}
          {onFindEmergencyHospitals && (
            <button
              type="button"
              onClick={onFindEmergencyHospitals}
              className="inline-flex items-center gap-1 px-3.5 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs backdrop-blur-md border border-white/20 transition-colors cursor-pointer"
            >
              <span>Emergency ICUs</span>
              <ChevronRight className="size-3.5" />
            </button>
          )}

          {/* Dismiss Button */}
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer shrink-0"
            title="Dismiss Emergency Bar"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default EmergencySosBanner
