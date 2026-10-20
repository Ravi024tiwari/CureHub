import { useState, type FC } from 'react'
import {
  X,
  CheckCircle2,
  Calendar,
  Clock,
  Building2,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { DoctorCardData, HospitalCardData, AppointmentCardData } from '@/types/patient'

interface BookAppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  preselectedDoctor?: DoctorCardData | null
  preselectedHospital?: HospitalCardData | null
  doctorsList?: DoctorCardData[]
  onAppointmentBooked: (newAppt: AppointmentCardData) => void
}

export const BookAppointmentModal: FC<BookAppointmentModalProps> = ({
  isOpen,
  onClose,
  preselectedDoctor,
  preselectedHospital,
  doctorsList = [],
  onAppointmentBooked,
}) => {
  if (!isOpen) return null

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(
    preselectedDoctor?._id || (doctorsList[0]?._id ?? 'doc-1')
  )
  const [selectedDay, setSelectedDay] = useState('Mon, 20 Oct')
  const [selectedSlot, setSelectedSlot] = useState('10:00 AM')

  const days = [
    { label: 'Mon', date: '20 Oct', full: 'Mon, 20 Oct 2026' },
    { label: 'Tue', date: '21 Oct', full: 'Tue, 21 Oct 2026' },
    { label: 'Wed', date: '22 Oct', full: 'Wed, 22 Oct 2026' },
    { label: 'Thu', date: '23 Oct', full: 'Thu, 23 Oct 2026' },
  ]

  const slots = [
    '09:00 AM',
    '09:30 AM',
    '10:00 AM',
    '10:30 AM',
    '11:00 AM',
    '11:30 AM',
    '02:00 PM',
    '02:30 PM',
    '03:00 PM',
  ]

  const activeDoc =
    doctorsList.find((d) => d._id === selectedDoctorId) ||
    preselectedDoctor || {
      _id: 'doc-1',
      name: 'Dr. Priya Sharma',
      specialty: 'General Physician',
      hospitalName: preselectedHospital?.name || 'Apollo Multispeciality Hospital',
      rating: 4.8,
      reviewCount: 320,
      experienceYears: 8,
    }

  const handleConfirm = () => {
    const newAppointment: AppointmentCardData = {
      _id: `appt-${Date.now()}`,
      doctorName: activeDoc.name,
      doctorSpecialty: activeDoc.specialty,
      doctorAvatar: activeDoc.avatar,
      hospitalName: preselectedHospital?.name || activeDoc.hospitalName || 'CarePlus Hospital',
      date: selectedDay,
      time: selectedSlot,
      status: 'Confirmed',
    }

    onAppointmentBooked(newAppointment)
    setStep(3)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
            Book Appointments
          </h2>
          <button
            onClick={onClose}
            className="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Stepper Progress Indicator */}
        <div className="px-6 pt-4 pb-2 bg-slate-50/60 border-b border-slate-100 flex items-center justify-between">
          {[
            { num: 1, label: 'Select Slot' },
            { num: 2, label: 'Confirm' },
            { num: 3, label: 'Done' },
          ].map((st) => (
            <div key={st.num} className="flex items-center gap-2">
              <div
                className={`size-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === st.num
                    ? 'bg-blue-600 text-white shadow-xs'
                    : step > st.num
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {step > st.num ? '✓' : st.num}
              </div>
              <span
                className={`text-xs font-semibold ${
                  step === st.num ? 'text-blue-600' : 'text-slate-500'
                }`}
              >
                {st.label}
              </span>
            </div>
          ))}
        </div>

        {/* Step Contents */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {step === 1 && (
            <>
              {/* Doctor Selector */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Select Specialist
                  </label>
                  {doctorsList.length > 1 && (
                    <select
                      value={selectedDoctorId}
                      onChange={(e) => setSelectedDoctorId(e.target.value)}
                      className="text-[11px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg px-2 py-0.5"
                    >
                      {doctorsList.map((d) => (
                        <option key={d._id} value={d._id}>
                          {d.name} ({d.specialty})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-center gap-3">
                  <div className="size-11 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                    {activeDoc.name.charAt(4) || 'D'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{activeDoc.name}</p>
                    <p className="text-[11px] text-blue-700 font-medium truncate">
                      {activeDoc.specialty} • {activeDoc.hospitalName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Day Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Select Day
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {days.map((d) => {
                    const isSelected = selectedDay === `${d.label}, ${d.date}`
                    return (
                      <button
                        key={d.label}
                        type="button"
                        onClick={() => setSelectedDay(`${d.label}, ${d.date}`)}
                        className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300'
                        }`}
                      >
                        <p className="text-[10px] font-medium opacity-80">{d.label}</p>
                        <p className="text-xs font-extrabold">{d.date}</p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Time Slots */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Available Slots
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {slots.map((slot) => {
                    const isSelected = selectedSlot === slot
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2 px-1 text-center rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        {slot}
                      </button>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Appointment Summary
                </h3>

                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                    {activeDoc.name.charAt(4)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{activeDoc.name}</h4>
                    <p className="text-xs text-slate-500">{activeDoc.specialty}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="size-3.5 text-blue-600" />
                      Date:
                    </span>
                    <span className="font-semibold text-slate-900">{selectedDay} 2026</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Clock className="size-3.5 text-blue-600" />
                      Time Slot:
                    </span>
                    <span className="font-semibold text-slate-900">{selectedSlot}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="size-3.5 text-blue-600" />
                      Hospital:
                    </span>
                    <span className="font-semibold text-slate-900">
                      {preselectedHospital?.name || activeDoc.hospitalName}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-800 text-xs">
                <Sparkles className="size-4 text-emerald-600 shrink-0" />
                <span>Instant confirmation • Free cancellation up to 2 hours before slot</span>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="py-6 text-center space-y-3">
              <div className="size-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-sm">
                <CheckCircle2 className="size-9 stroke-[2.5]" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Appointment Confirmed!
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Your consultation with {activeDoc.name} on {selectedDay} at {selectedSlot} has been
                booked and added to your upcoming visits.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-3">
          {step === 1 && (
            <Button
              onClick={() => setStep(2)}
              className="w-full h-11 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs cursor-pointer shadow-md shadow-blue-500/20"
            >
              Continue
            </Button>
          )}

          {step === 2 && (
            <>
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="w-1/3 h-11 rounded-2xl border-slate-200 text-xs font-semibold cursor-pointer"
              >
                Back
              </Button>
              <Button
                onClick={handleConfirm}
                className="w-2/3 h-11 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs cursor-pointer shadow-md shadow-blue-500/20"
              >
                Confirm Appointment
              </Button>
            </>
          )}

          {step === 3 && (
            <Button
              onClick={onClose}
              className="w-full h-11 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs cursor-pointer"
            >
              Back to Home
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
