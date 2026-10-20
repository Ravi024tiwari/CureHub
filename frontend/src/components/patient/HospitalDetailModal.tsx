import { type FC } from 'react'
import {
  X,
  Star,
  MapPin,
  Phone,
  Navigation,
  CheckCircle2,
  CalendarPlus,
} from 'lucide-react'
import type { HospitalCardData } from '@/types/patient'
import { Button } from '@/components/ui/button'

interface HospitalDetailModalProps {
  hospital: HospitalCardData | null
  onClose: () => void
  onBookAppointment: (hospital: HospitalCardData) => void
}

export const HospitalDetailModal: FC<HospitalDetailModalProps> = ({
  hospital,
  onClose,
  onBookAppointment,
}) => {
  if (!hospital) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
        {/* Cover Photo */}
        <div className="relative h-56 w-full bg-slate-100">
          <img
            src={hospital.image}
            alt={hospital.name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 size-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>

          <div className="absolute bottom-4 left-4 flex items-center gap-2">
            <span className="bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-slate-900 flex items-center gap-1 shadow-sm">
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
              <span>{hospital.rating.toFixed(1)} (1.2k reviews)</span>
            </span>
            <span className="bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-white flex items-center gap-1">
              <MapPin className="size-3 text-white" />
              <span>{hospital.distance} away</span>
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Verified Healthcare Partner
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                24/7 Emergency
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
              {hospital.name}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <MapPin className="size-4 text-slate-400 shrink-0" />
              <span>{hospital.location}</span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <a
              href={`tel:${hospital.phoneNumber || '18002002273'}`}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-xs font-semibold text-slate-700 transition-colors"
            >
              <Phone className="size-4 text-blue-600" />
              <span>Call Helpline</span>
            </a>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                hospital.name + ' ' + hospital.location
              )}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-xs font-semibold text-slate-700 transition-colors"
            >
              <Navigation className="size-4 text-blue-600" />
              <span>Get Directions</span>
            </a>
          </div>

          {/* About Hospital */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              About Facility
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {hospital.name} is a leading healthcare institution providing world-class medical care,
              modern intensive care facilities, automated diagnostic laboratories, and round-the-clock
              emergency services.
            </p>
          </div>

          {/* Available Departments */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Departments & Specializations
            </h4>
            <div className="flex flex-wrap gap-2">
              {['Cardiology', 'Orthopedics', 'General Medicine', 'Pediatrics', 'Neurology', 'ICU & Trauma', 'Pharmacy'].map(
                (dep) => (
                  <span
                    key={dep}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700"
                  >
                    <CheckCircle2 className="size-3.5 text-blue-600" />
                    <span>{dep}</span>
                  </span>
                )
              )}
            </div>
          </div>

          {/* Bottom Primary CTA */}
          <div className="pt-2">
            <Button
              onClick={() => onBookAppointment(hospital)}
              className="w-full h-11 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <CalendarPlus className="size-4.5" />
              <span>Book Appointment at this Hospital</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
