import { useState, type FC } from 'react'
import {
  X,
  Phone,
  Mail,
  Building2,
  Copy,
  Check,
  Calendar,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { DoctorDetailData } from '@/types/patient'

interface ContactDoctorModalProps {
  isOpen: boolean
  onClose: () => void
  doctor: DoctorDetailData
  onBookAppointment: () => void
}

export const ContactDoctorModal: FC<ContactDoctorModalProps> = ({
  isOpen,
  onClose,
  doctor,
  onBookAppointment,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  if (!isOpen) return null

  const phone = doctor.phoneNumber || '+91 98765 43210'
  const email = doctor.email || 'amit.singh@hospital.com'
  const hospital = doctor.hospitalName || 'Apollo Multispeciality Hospital'

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl overflow-hidden p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">Contact Doctor</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Direct consultation & inquiries with {doctor.name}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Doctor Summary Pill */}
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div className="size-12 rounded-xl bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center text-sm shrink-0">
            {doctor.name.replace(/^Dr\.\s*/, '').charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-slate-900 truncate">{doctor.name}</h4>
            <p className="text-xs text-blue-600 font-semibold truncate">
              {doctor.specialty || doctor.department || 'Specialist'}
            </p>
            <p className="text-[11px] text-slate-400 truncate">{hospital}</p>
          </div>
        </div>

        {/* Contact Channels */}
        <div className="space-y-3">
          {/* Phone */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 hover:border-blue-200 transition-colors">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Phone className="size-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  Phone Number
                </p>
                <a
                  href={`tel:${phone.replace(/\s+/g, '')}`}
                  className="text-xs sm:text-sm font-bold text-slate-800 hover:text-blue-600 transition-colors"
                >
                  {phone}
                </a>
              </div>
            </div>

            <button
              type="button"
              onClick={() => copyToClipboard(phone, 'phone')}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Copy Phone"
            >
              {copiedField === 'phone' ? (
                <Check className="size-4 text-emerald-600" />
              ) : (
                <Copy className="size-4" />
              )}
            </button>
          </div>

          {/* Email */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 hover:border-blue-200 transition-colors">
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Mail className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  Official Email
                </p>
                <a
                  href={`mailto:${email}`}
                  className="text-xs sm:text-sm font-bold text-slate-800 hover:text-blue-600 truncate block transition-colors"
                >
                  {email}
                </a>
              </div>
            </div>

            <button
              type="button"
              onClick={() => copyToClipboard(email, 'email')}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              title="Copy Email"
            >
              {copiedField === 'email' ? (
                <Check className="size-4 text-emerald-600" />
              ) : (
                <Copy className="size-4" />
              )}
            </button>
          </div>

          {/* Hospital Helpdesk */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200">
            <div className="size-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
              <Building2 className="size-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Hospital Helpdesk
              </p>
              <p className="text-xs sm:text-sm font-bold text-slate-800">
                {hospital} • Consultation Desk
              </p>
            </div>
          </div>
        </div>

        {/* Emergency Notice */}
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-800">
          <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            In case of critical cardiovascular or emergency conditions, please dial 108 or proceed
            directly to the 24x7 emergency department.
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-2">
          <Button
            onClick={() => {
              onClose()
              onBookAppointment()
            }}
            className="w-full h-11 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Calendar className="size-4" />
            <span>Book Appointment Online</span>
          </Button>

          <Button
            variant="outline"
            onClick={onClose}
            className="w-full h-10 rounded-2xl border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs cursor-pointer"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
