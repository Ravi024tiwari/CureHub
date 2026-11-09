import { type FC } from 'react'
import {
  User,
  Mail,
  Phone,
  Calendar,
  Droplet,
  Info,
} from 'lucide-react'

interface PatientPersonalInfoTabProps {
  name: string
  onChangeName: (val: string) => void
  email: string
  onChangeEmail: (val: string) => void
  phoneNumber: string
  onChangePhoneNumber: (val: string) => void
  dateOfBirth: string
  onChangeDateOfBirth: (val: string) => void
  gender: string
  onChangeGender: (val: string) => void
  bloodGroup: string
  onChangeBloodGroup: (val: string) => void
}

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const GENDERS = [
  { id: 'MALE', label: 'Male' },
  { id: 'FEMALE', label: 'Female' },
  { id: 'OTHER', label: 'Other' },
]

export const PatientPersonalInfoTab: FC<PatientPersonalInfoTabProps> = ({
  name,
  onChangeName,
  email,
  onChangeEmail,
  phoneNumber,
  onChangePhoneNumber,
  dateOfBirth,
  onChangeDateOfBirth,
  gender,
  onChangeGender,
  bloodGroup,
  onChangeBloodGroup,
}) => {
  return (
    <div className="space-y-6">
      {/* Informational Guidance Banner */}
      <div className="p-4 rounded-2xl bg-[#eef3ff]/80 border border-[#c8d7fd] flex items-start gap-3">
        <Info className="size-5 text-[#5170f4] shrink-0 mt-0.5" />
        <p className="text-xs text-slate-700 font-medium leading-relaxed">
          Your personal and identity records are used to generate official OPD token receipts, verified digital prescriptions, and emergency trauma triage cards.
        </p>
      </div>

      {/* Grid of Core Identity Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {/* Full Name */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <User className="size-3.5 text-[#637ff5]" />
            <span>Full Name *</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => onChangeName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200/90 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5170f4]/25 focus:border-[#5170f4] transition-all shadow-2xs"
              required
            />
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            As printed on your government photo ID card
          </p>
        </div>

        {/* Phone Number */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Phone className="size-3.5 text-emerald-600" />
            <span>Mobile Phone Number *</span>
          </label>
          <div className="relative">
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => onChangePhoneNumber(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200/90 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5170f4]/25 focus:border-[#5170f4] transition-all shadow-2xs"
              required
            />
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            Used for real-time queue SMS alerts & WhatsApp OPD tokens
          </p>
        </div>

        {/* Email Address */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Mail className="size-3.5 text-[#637ff5]" />
            <span>Email Address *</span>
          </label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => onChangeEmail(e.target.value)}
              placeholder="patient@careplus.in"
              className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200/90 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5170f4]/25 focus:border-[#5170f4] transition-all shadow-2xs"
              required
            />
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            Where consultation invoices & diagnostic PDF reports are emailed
          </p>
        </div>

        {/* Date of Birth */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Calendar className="size-3.5 text-indigo-600" />
            <span>Date of Birth</span>
          </label>
          <div className="relative">
            <input
              type="date"
              value={dateOfBirth}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => onChangeDateOfBirth(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200/90 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5170f4]/25 focus:border-[#5170f4] transition-all shadow-2xs"
            />
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            Required for accurate pediatric and geriatric dosage calculations
          </p>
        </div>
      </div>

      {/* Gender Selection */}
      <div className="space-y-2.5 pt-2">
        <label className="text-xs font-black uppercase tracking-wider text-slate-600 block">
          Gender
        </label>
        <div className="grid grid-cols-3 gap-3 max-w-md">
          {GENDERS.map((g) => {
            const isSelected = gender?.toUpperCase() === g.id
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => onChangeGender(g.id)}
                className={`py-3 px-4 rounded-2xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#5170f4] to-[#637ff5] text-white shadow-md shadow-[#637ff5]/25 scale-[1.02]'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-[#c8d7fd] hover:bg-[#eef3ff]/40'
                }`}
              >
                <span>{g.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Blood Group Selection Grid */}
      <div className="space-y-2.5 pt-2">
        <div className="flex items-center justify-between max-w-2xl">
          <label className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Droplet className="size-3.5 text-rose-500 fill-rose-500" />
            <span>Blood Group</span>
          </label>
          <span className="text-[11px] font-semibold text-slate-400">
            Vital for trauma emergency & transfusions
          </span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5 max-w-2xl">
          {BLOOD_GROUPS.map((bg) => {
            const isSelected = bloodGroup?.toUpperCase() === bg
            return (
              <button
                key={bg}
                type="button"
                onClick={() => onChangeBloodGroup(bg)}
                className={`py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer flex flex-col items-center justify-center ${
                  isSelected
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 scale-105 ring-2 ring-rose-400'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-rose-300 hover:bg-rose-50/50'
                }`}
              >
                <span>{bg}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
