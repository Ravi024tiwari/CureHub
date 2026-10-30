import { useState, type FC } from 'react'
import { HeartPulse, Activity, Droplets } from 'lucide-react'
import { usePatientStore } from '@/store/patientStore'

export const PatientVitalsWidget: FC = () => {
  const { medicalHistory, profile } = usePatientStore()
  const [pulse] = useState(72)
  const [bp] = useState('120/80')

  const bloodGroup = profile?.bloodGroup || medicalHistory.bloodGroup || '--'

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <HeartPulse className="size-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">Your Health Vitals</h3>
        </div>
        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          Normal
        </span>
      </div>

      {/* Vitals Grid */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-0.5">
          <p className="text-[10px] text-slate-400 font-medium">Heart Rate</p>
          <div className="flex items-baseline justify-center gap-0.5">
            <span className="text-sm sm:text-base font-extrabold text-slate-900">{pulse}</span>
            <span className="text-[9px] text-slate-400">bpm</span>
          </div>
          <Activity className="size-3 text-rose-500 mx-auto animate-pulse" />
        </div>

        <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-0.5">
          <p className="text-[10px] text-slate-400 font-medium">Blood Pressure</p>
          <div className="flex items-baseline justify-center gap-0.5">
            <span className="text-xs sm:text-sm font-extrabold text-slate-900">{bp}</span>
          </div>
          <span className="text-[9px] text-emerald-600 font-bold">Optimal</span>
        </div>

        <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-0.5">
          <p className="text-[10px] text-slate-400 font-medium">Blood Group</p>
          <div className="flex items-baseline justify-center gap-0.5">
            <span className="text-sm sm:text-base font-extrabold text-rose-600">{bloodGroup}</span>
          </div>
          <Droplets className="size-3 text-rose-500 mx-auto" />
        </div>
      </div>

      {/* Emergency SOS Banner */}
      <div className="p-3 rounded-2xl bg-gradient-to-r from-rose-50 to-amber-50/70 border border-rose-200/60 flex items-center justify-between gap-2">
        <div className="space-y-0.5">
          <p className="text-xs font-bold text-rose-900">24/7 Ambulance SOS</p>
          <p className="text-[10px] text-rose-700">Call 108 or CarePlus Rapid Emergency</p>
        </div>
        <a
          href="tel:108"
          className="size-8 rounded-xl bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shrink-0 shadow-sm transition-transform active:scale-95"
          title="Call Emergency Ambulance"
        >
          <HeartPulse className="size-4" />
        </a>
      </div>
    </div>
  )
}
