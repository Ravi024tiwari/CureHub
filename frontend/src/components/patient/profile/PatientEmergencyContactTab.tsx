import { type FC } from 'react'
import {
  PhoneCall,
  User,
  Heart,
  ShieldAlert,
  Phone,
  AlertCircle,
} from 'lucide-react'

interface PatientEmergencyContactTabProps {
  name: string
  onChangeName: (val: string) => void
  relationship: string
  onChangeRelationship: (val: string) => void
  phoneNumber: string
  onChangePhoneNumber: (val: string) => void
}

const COMMON_RELATIONSHIPS = [
  'Spouse',
  'Parent',
  'Sibling',
  'Child',
  'Guardian',
  'Friend',
  'Relative',
]

export const PatientEmergencyContactTab: FC<PatientEmergencyContactTabProps> = ({
  name,
  onChangeName,
  relationship,
  onChangeRelationship,
  phoneNumber,
  onChangePhoneNumber,
}) => {
  return (
    <div className="space-y-6">
      {/* Emergency Guidance Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-50 via-rose-50/60 to-white border border-rose-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="size-11 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-600/20">
            <ShieldAlert className="size-5.5 stroke-[2.2]" />
          </div>
          <div>
            <h4 className="text-sm font-black text-rose-950">
              Critical Emergency Contact
            </h4>
            <p className="text-xs text-rose-800 font-medium leading-relaxed max-w-xl">
              In the event of medical emergencies, trauma ICU admissions, or urgent surgical consents, hospital desks will contact this designated person immediately.
            </p>
          </div>
        </div>

        {phoneNumber && (
          <a
            href={`tel:${phoneNumber}`}
            className="px-4 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200 shadow-2xs flex items-center gap-2 shrink-0 transition-colors"
          >
            <PhoneCall className="size-3.5 text-rose-600" />
            <span>Test Call Dial</span>
          </a>
        )}
      </div>

      {/* Emergency Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {/* Contact Person Name */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <User className="size-3.5 text-rose-600" />
            <span>Contact Person Name</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => onChangeName(e.target.value)}
            placeholder="e.g. Priya Sharma"
            className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200/90 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all shadow-2xs"
          />
          <p className="text-[11px] text-slate-400 font-medium">
            Next of kin or trusted family member / guardian
          </p>
        </div>

        {/* Emergency Phone Number */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Phone className="size-3.5 text-rose-600" />
            <span>Emergency Phone Number</span>
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => onChangePhoneNumber(e.target.value)}
            placeholder="+91 98765 00000"
            className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200/90 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all shadow-2xs"
          />
          <p className="text-[11px] text-slate-400 font-medium">
            Must be actively reachable 24/7 during consultations
          </p>
        </div>
      </div>

      {/* Relationship Selector */}
      <div className="space-y-2.5 pt-2">
        <label className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
          <Heart className="size-3.5 text-rose-500 fill-rose-500" />
          <span>Relationship with Patient</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {COMMON_RELATIONSHIPS.map((rel) => {
            const isSelected = relationship?.toLowerCase() === rel.toLowerCase()
            return (
              <button
                key={rel}
                type="button"
                onClick={() => onChangeRelationship(rel)}
                className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-rose-600 text-white shadow-xs font-black'
                    : 'bg-white text-slate-700 border border-slate-200/90 hover:border-rose-200 hover:bg-rose-50/30'
                }`}
              >
                <span>{rel}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Reassurance Notice */}
      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2.5 text-xs text-slate-600">
        <AlertCircle className="size-4 text-slate-400 shrink-0" />
        <span>
          Emergency contact details are strictly confidential and will never be used for marketing or non-emergency communication.
        </span>
      </div>
    </div>
  )
}
