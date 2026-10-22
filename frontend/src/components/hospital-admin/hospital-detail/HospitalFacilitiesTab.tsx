import { type FC } from 'react'
import {
  ShieldAlert,
  Pill,
  FlaskConical,
  Activity,
  Ambulance,
  Microscope,
  HeartPulse,
  Clock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react'

interface HospitalFacilitiesTabProps {
  facilities?: string[]
}

export const HospitalFacilitiesTab: FC<HospitalFacilitiesTabProps> = ({
  facilities = [],
}) => {
  const facilityData: Record<
    string,
    { icon: any; color: string; bg: string; description: string; is24x7: boolean }
  > = {
    '24x7 Emergency': {
      icon: ShieldAlert,
      color: 'text-rose-600',
      bg: 'bg-rose-50 border-rose-200/80',
      description: 'Fully-equipped trauma center with on-call emergency physicians, ventilators, and crash carts.',
      is24x7: true,
    },
    'Pharmacy': {
      icon: Pill,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 border-emerald-200/80',
      description: 'In-house dispensing pharmacy stocked with all essential life-saving and prescription drugs.',
      is24x7: true,
    },
    'Lab': {
      icon: FlaskConical,
      color: 'text-blue-600',
      bg: 'bg-blue-50 border-blue-200/80',
      description: 'NABL-accredited diagnostic laboratory offering rapid hematology, biochemistry, and microbiology.',
      is24x7: true,
    },
    'ICU': {
      icon: Activity,
      color: 'text-purple-600',
      bg: 'bg-purple-50 border-purple-200/80',
      description: 'Intensive Coronary & Care Unit with 1:1 patient-to-nurse ratio and central telemetry monitoring.',
      is24x7: true,
    },
    'Ambulance': {
      icon: Ambulance,
      color: 'text-amber-600',
      bg: 'bg-amber-50 border-amber-200/80',
      description: 'Fleet of Advanced Life Support (ALS) ambulances equipped with GPS and live-telemetry links.',
      is24x7: true,
    },
    'Pathology': {
      icon: Microscope,
      color: 'text-pink-600',
      bg: 'bg-pink-50 border-pink-200/80',
      description: 'High-precision histopathology and molecular genetics testing facility.',
      is24x7: false,
    },
    'Blood Bank': {
      icon: HeartPulse,
      color: 'text-red-600',
      bg: 'bg-red-50 border-red-200/80',
      description: 'Component separation blood bank supporting whole blood, platelets, and fresh frozen plasma.',
      is24x7: true,
    },
  }

  const list = facilities.length > 0
    ? facilities
    : ['24x7 Emergency', 'Pharmacy', 'Lab', 'ICU', 'Ambulance', 'Pathology', 'Blood Bank']

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs space-y-6">
      <div>
        <h3 className="text-base font-black text-slate-900 tracking-tight">
          Hospital Facilities & Infrastructure ({list.length})
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Modern diagnostic and therapeutic facilities operating at this hospital campus.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {list.map((facility, idx) => {
          const info = facilityData[facility] || {
            icon: Sparkles,
            color: 'text-blue-600',
            bg: 'bg-blue-50 border-blue-200/80',
            description: 'Advanced hospital medical facility with dedicated technical staff.',
            is24x7: false,
          }
          const Icon = info.icon

          return (
            <div
              key={idx}
              className="p-5 rounded-3xl border border-slate-200/80 bg-slate-50/50 hover:bg-white transition-all shadow-2xs hover:shadow-md flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`size-12 rounded-2xl flex items-center justify-center border shadow-xs ${info.bg}`}
                  >
                    <Icon className={`size-6 ${info.color}`} />
                  </div>

                  {info.is24x7 && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                      <Clock className="size-3 text-rose-600" /> 24x7 Active
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-black text-slate-900">{facility}</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {info.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
                <CheckCircle2 className="size-3.5 fill-emerald-100" />
                <span>Operational & Certified</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
