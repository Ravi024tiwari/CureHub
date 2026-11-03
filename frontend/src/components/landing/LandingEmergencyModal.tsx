import { type FC } from 'react'
import {
  X,
  PhoneCall,
  Ambulance,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LandingEmergencyModalProps {
  isOpen: boolean
  onClose: () => void
}

export const LandingEmergencyModal: FC<LandingEmergencyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  const emergencyContacts = [
    {
      title: 'CarePlus 24/7 Central Ambulance Dispatch',
      number: '1800-200-2273',
      sub: 'Toll-free • Under 8 min response target',
      isPrimary: true,
    },
    {
      title: 'National Emergency Ambulance Service',
      number: '108',
      sub: 'All India Central Medical Emergency',
    },
    {
      title: 'National Emergency Unified Number',
      number: '112',
      sub: 'Police, Fire & Medical Coordination',
    },
    {
      title: 'Pediatric & Trauma ICU Desk',
      number: '+91-7752-409999',
      sub: 'Direct Line to Apollo Trauma Center',
    },
  ]

  const nearestTraumaCenters = [
    {
      name: 'Apollo Multispeciality Hospital — Trauma Unit',
      address: 'Rajkishore Nagar, Bilaspur, CG',
      phone: '07752-409000',
      beds: '16 ICU Beds Available',
    },
    {
      name: 'City Care Emergency Care & Cath Lab',
      address: 'Pandri Road, Raipur, CG',
      phone: '0771-4200000',
      beds: '10 ICU Beds Available',
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-rose-200 space-y-6 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/30">
              <Ambulance className="size-6 stroke-[2.4]" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-black uppercase tracking-wider">
                <span className="size-1.5 rounded-full bg-rose-600 animate-ping" />
                <span>Immediate Critical Response</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                24/7 Emergency Medical Desk
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="size-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Urgent Note Banner */}
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm font-semibold flex items-center gap-3">
          <AlertTriangle className="size-5 text-rose-600 shrink-0" />
          <span>
            If the patient is unconscious, experiencing acute chest pain, or bleeding severely, call 108 or our direct toll-free ambulance desk immediately.
          </span>
        </div>

        {/* One-Click Emergency Hotlines */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
            One-Tap Emergency Dialers
          </h4>
          {emergencyContacts.map((contact, idx) => (
            <a
              key={idx}
              href={`tel:${contact.number.replace(/[^0-9+]/g, '')}`}
              className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all duration-200 cursor-pointer ${
                contact.isPrimary
                  ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white border-transparent shadow-lg shadow-rose-600/25 hover:from-rose-700 hover:to-red-700'
                  : 'bg-slate-50 hover:bg-rose-50/70 border-slate-200 text-slate-800'
              }`}
            >
              <div>
                <p
                  className={`text-xs sm:text-sm font-black ${
                    contact.isPrimary ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {contact.title}
                </p>
                <p
                  className={`text-[11px] font-medium ${
                    contact.isPrimary ? 'text-rose-100' : 'text-slate-500'
                  }`}
                >
                  {contact.sub}
                </p>
              </div>

              <div
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black shrink-0 flex items-center gap-1.5 ${
                  contact.isPrimary ? 'bg-white text-rose-700' : 'bg-rose-100 text-rose-800'
                }`}
              >
                <PhoneCall className="size-3.5" />
                <span>{contact.number}</span>
              </div>
            </a>
          ))}
        </div>

        {/* Nearest Verified Trauma Centers */}
        <div className="space-y-2.5 pt-2 border-t border-slate-100">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
            Nearest Emergency Trauma Centers
          </h4>
          <div className="space-y-2">
            {nearestTraumaCenters.map((center, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5">
                  <p className="font-extrabold text-slate-900">{center.name}</p>
                  <p className="text-slate-500 text-[11px] font-medium">{center.address}</p>
                  <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mt-1">
                    {center.beds}
                  </span>
                </div>

                <a
                  href={`tel:${center.phone}`}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shrink-0"
                >
                  Call Desk
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2">
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full h-10 rounded-xl text-xs font-bold border-slate-200"
          >
            Close Emergency Window
          </Button>
        </div>
      </div>
    </div>
  )
}
