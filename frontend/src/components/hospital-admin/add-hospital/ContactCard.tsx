import { type FC } from 'react'
import { Phone, Mail } from 'lucide-react'

export interface ContactData {
  contactEmail: string
  contactPhone: string
}

interface ContactCardProps {
  data: ContactData
  onChange: (fields: Partial<ContactData>) => void
  errors?: Partial<Record<keyof ContactData, string>>
}

export const ContactCard: FC<ContactCardProps> = ({ data, onChange, errors = {} }) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-all">
      {/* Header */}
      <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-slate-100">
        <div className="size-11 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 shadow-xs ring-1 ring-sky-500/10">
          <Phone className="size-5.5 stroke-[2.2]" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            Contact Information
          </h2>
          <p className="text-xs text-slate-500 font-medium">Provide hospital contact details.</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Contact Email */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Contact Email <span className="text-rose-500">*</span>
          </label>
          <div className="relative flex items-center">
            <input
              type="email"
              value={data.contactEmail}
              onChange={(e) => onChange({ contactEmail: e.target.value })}
              placeholder="e.g. info@hospital.com"
              className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-all outline-hidden ${
                errors.contactEmail
                  ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                  : 'border-slate-200 bg-slate-50/40 hover:bg-white focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
              }`}
            />
            <Mail className="size-4 text-slate-400 absolute right-3 pointer-events-none" />
          </div>
          {errors.contactEmail && (
            <p className="text-[11px] font-semibold text-rose-500 mt-1">{errors.contactEmail}</p>
          )}
        </div>

        {/* Contact Phone */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Contact Phone <span className="text-rose-500">*</span>
          </label>
          <div className="relative flex items-center">
            <input
              type="tel"
              value={data.contactPhone}
              onChange={(e) => onChange({ contactPhone: e.target.value })}
              placeholder="e.g. +91 98765 43210"
              className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-all outline-hidden ${
                errors.contactPhone
                  ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                  : 'border-slate-200 bg-slate-50/40 hover:bg-white focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
              }`}
            />
            <Phone className="size-4 text-slate-400 absolute right-3 pointer-events-none" />
          </div>
          {errors.contactPhone && (
            <p className="text-[11px] font-semibold text-rose-500 mt-1">{errors.contactPhone}</p>
          )}
        </div>
      </div>
    </div>
  )
}
export default ContactCard
