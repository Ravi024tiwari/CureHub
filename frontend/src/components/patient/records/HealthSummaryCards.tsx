import { type FC } from 'react'
import {
  Droplet,
  AlertCircle,
  HeartPulse,
  Activity,
  Pill,
  PhoneCall,
  Edit3,
} from 'lucide-react'
import { useMedicalRecordsStore } from '@/store/medicalRecordsStore'

export const HealthSummaryCards: FC = () => {
  const { medicalHistory, openEditHistoryModal } = useMedicalRecordsStore()

  const cards = [
    {
      id: 'blood-group',
      label: 'Blood Group',
      value: medicalHistory.bloodGroup || 'O+',
      subtext: 'Universal donor',
      icon: Droplet,
      iconColor: 'text-rose-500',
      iconBg: 'bg-rose-50 border-rose-100',
      badgeBg: 'bg-rose-100/80 text-rose-700',
    },
    {
      id: 'allergies',
      label: 'Allergies',
      value:
        medicalHistory.allergies.length > 0
          ? `${medicalHistory.allergies.length} ${
              medicalHistory.allergies.length === 1 ? 'item' : 'items'
            }`
          : 'None',
      subtext: medicalHistory.allergies.length > 0 ? medicalHistory.allergies.join(', ') : 'No known allergies',
      icon: AlertCircle,
      iconColor: 'text-amber-500',
      iconBg: 'bg-amber-50 border-amber-100',
      badgeBg: 'bg-amber-100/80 text-amber-700',
    },
    {
      id: 'chronic-diseases',
      label: 'Chronic Diseases',
      value:
        medicalHistory.chronicDiseases.length > 0
          ? `${medicalHistory.chronicDiseases.length} ${
              medicalHistory.chronicDiseases.length === 1 ? 'item' : 'items'
            }`
          : 'None',
      subtext: medicalHistory.chronicDiseases.length > 0 ? medicalHistory.chronicDiseases.join(', ') : 'None reported',
      icon: HeartPulse,
      iconColor: 'text-rose-500',
      iconBg: 'bg-rose-50 border-rose-100',
      badgeBg: 'bg-rose-100/80 text-rose-700',
    },
    {
      id: 'past-surgeries',
      label: 'Past Surgeries',
      value:
        medicalHistory.pastSurgeries.length > 0
          ? `${medicalHistory.pastSurgeries.length} ${
              medicalHistory.pastSurgeries.length === 1 ? 'surgery' : 'surgeries'
            }`
          : 'None',
      subtext: medicalHistory.pastSurgeries[0] || 'No major surgeries',
      icon: Activity,
      iconColor: 'text-indigo-500',
      iconBg: 'bg-indigo-50 border-indigo-100',
      badgeBg: 'bg-indigo-100/80 text-indigo-700',
    },
    {
      id: 'current-medications',
      label: 'Current Medications',
      value:
        medicalHistory.currentMedications.length > 0
          ? `${medicalHistory.currentMedications.length} ${
              medicalHistory.currentMedications.length === 1 ? 'medication' : 'medications'
            }`
          : 'None',
      subtext: medicalHistory.currentMedications.length > 0 ? medicalHistory.currentMedications.join(', ') : 'None',
      icon: Pill,
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-50 border-blue-100',
      badgeBg: 'bg-blue-100/80 text-blue-700',
    },
    {
      id: 'emergency-contact',
      label: 'Emergency Contact',
      value: medicalHistory.emergencyContact?.name || 'Ashok Tiwari',
      subtext: `${medicalHistory.emergencyContact?.relationship || 'Father'} • ${
        medicalHistory.emergencyContact?.phoneNumber || '+91 98765 43210'
      }`,
      icon: PhoneCall,
      iconColor: 'text-emerald-500',
      iconBg: 'bg-emerald-50 border-emerald-100',
      badgeBg: 'bg-emerald-100/80 text-emerald-700',
    },
  ]

  return (
    <div className="w-full relative">
      <div className="flex items-center justify-between mb-3 px-0.5">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Vital Health Summary
        </h3>
        <button
          onClick={openEditHistoryModal}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer transition-colors"
        >
          <Edit3 className="size-3.5" />
          <span>Edit Health Info</span>
        </button>
      </div>

      {/* Responsive Horizontal Scroll / Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.id}
              onClick={openEditHistoryModal}
              className="group relative bg-white border border-slate-200/80 hover:border-blue-300/90 rounded-3xl p-4 sm:p-4.5 transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div
                  className={`size-10 sm:size-11 rounded-2xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${card.iconBg}`}
                >
                  <Icon className={`size-5 ${card.iconColor}`} />
                </div>
                <span className="text-[11px] sm:text-xs font-semibold text-slate-500 text-right group-hover:text-blue-600 transition-colors">
                  {card.label}
                </span>
              </div>

              <div className="mt-2">
                <div className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight leading-tight line-clamp-1">
                  {card.value}
                </div>
                <p className="text-[11px] text-slate-500 font-medium truncate mt-1">
                  {card.subtext}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

