import React, { useState, useEffect } from 'react'
import {
  X,
  Calendar,
  Clock,
  User,
  Phone,
  Building2,
  Stethoscope,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react'
import { useHospitalAdminAppointmentsStore } from '@/store/hospitalAdminAppointmentsStore'

interface BookAppointmentModalProps {
  isOpen: boolean
  onClose: () => void
}

const SAMPLE_TIME_SLOTS = [
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
  '03:30 PM',
  '04:00 PM',
  '04:30 PM',
  '05:00 PM',
]

export const BookAppointmentModal: React.FC<BookAppointmentModalProps> = ({ isOpen, onClose }) => {
  const { filterOptions, bookAppointment } = useHospitalAdminAppointmentsStore()

  const [patientName, setPatientName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [age, setAge] = useState<number | ''>(28)
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male')
  const [hospitalId, setHospitalId] = useState('')
  const [doctorId, setDoctorId] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [timeSlot, setTimeSlot] = useState('10:00 AM')
  const [fee, setFee] = useState<number>(500)
  const [symptoms, setSymptoms] = useState('')
  const [notes, setNotes] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Sync default hospital and doctor from real backend filterOptions
  useEffect(() => {
    if (filterOptions.hospitals.length > 0 && !hospitalId) {
      setHospitalId(filterOptions.hospitals[0].id)
    }
  }, [filterOptions.hospitals, hospitalId])

  useEffect(() => {
    if (filterOptions.doctors.length > 0 && !doctorId) {
      setDoctorId(filterOptions.doctors[0].id)
    }
  }, [filterOptions.doctors, doctorId])

  if (!isOpen) return null

  const availableDoctors = filterOptions.doctors

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!patientName.trim()) {
      setErrorMsg('Please enter the patient name.')
      return
    }
    if (!phoneNumber.trim()) {
      setErrorMsg('Please enter contact phone number.')
      return
    }
    if (!hospitalId && filterOptions.hospitals.length > 0) {
      setErrorMsg('Please select a hospital.')
      return
    }
    if (!doctorId && filterOptions.doctors.length > 0) {
      setErrorMsg('Please select an attending doctor.')
      return
    }
    if (!date) {
      setErrorMsg('Please select a valid appointment date.')
      return
    }

    setIsSubmitting(true)

    try {
      const selectedHospId = hospitalId || filterOptions.hospitals[0]?.id
      const selectedDocId = doctorId || filterOptions.doctors[0]?.id

      if (!selectedHospId || !selectedDocId) {
        setErrorMsg('Cannot book: Please ensure at least one hospital and doctor are registered in your portal.')
        setIsSubmitting(false)
        return
      }

      const success = await bookAppointment({
        patientName: patientName.trim(),
        phoneNumber: phoneNumber.trim(),
        age: typeof age === 'number' ? age : undefined,
        gender,
        hospitalId: selectedHospId,
        doctorId: selectedDocId,
        date,
        startTime: timeSlot,
        consultationFee: fee || 500,
        symptoms: symptoms.trim() || 'Regular outpatient consultation',
        notes: notes.trim(),
      })

      if (success) {
        setSuccessMsg(`On-site appointment booked successfully for ${patientName}!`)
        setTimeout(() => {
          setIsSubmitting(false)
          onClose()
        }, 1200)
      } else {
        setIsSubmitting(false)
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to book appointment. Please check inputs.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Book Real On-site Appointment</h3>
              <p className="text-xs text-slate-500">
                Register a new in-person consultation directly into hospital database
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-emerald-700 text-xs">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Mode Pill Notice (Strictly On-site) */}
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-semibold text-blue-900">Consultation Mode:</span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              On-site In-Person Visit
            </span>
          </div>

          {/* Patient Information Section */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-500" />
              Patient Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Age</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  placeholder="28"
                  value={age}
                  onChange={(e) => setAge(e.target.value ? parseInt(e.target.value) : '')}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Gender</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Male', 'Female', 'Other'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`py-2 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                        gender === g
                          ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Hospital & Doctor Selection (Loaded from Real Database) */}
          <div className="pt-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-slate-500" />
              Doctor & Hospital Assignment
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Hospital Branch <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <select
                    value={hospitalId}
                    onChange={(e) => setHospitalId(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition cursor-pointer"
                  >
                    {filterOptions.hospitals.length > 0 ? (
                      filterOptions.hospitals.map((h) => (
                        <option key={h.id} value={h.id}>
                          {h.name}
                        </option>
                      ))
                    ) : (
                      <option value="">No hospital branches registered</option>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Attending Doctor <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Stethoscope className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <select
                    value={doctorId}
                    onChange={(e) => setDoctorId(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition cursor-pointer"
                  >
                    {availableDoctors.length > 0 ? (
                      availableDoctors.map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          {doc.name} ({doc.department || 'General'})
                        </option>
                      ))
                    ) : (
                      <option value="">No affiliated doctors available</option>
                    )}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Date, Time & Fee */}
          <div className="pt-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              Schedule & Consultation Fee
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Appointment Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Consultation Fee (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-xs">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={fee}
                    onChange={(e) => setFee(e.target.value ? parseInt(e.target.value) : 0)}
                    className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>
              </div>
            </div>

            {/* Time Slot Chips */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">
                Available Time Slot
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 max-h-32 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-100">
                {SAMPLE_TIME_SLOTS.map((slot) => {
                  const isSelected = timeSlot === slot
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTimeSlot(slot)}
                      className={`py-1.5 px-2 text-[11px] font-semibold rounded-lg text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-600/30'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/60'
                      }`}
                    >
                      {slot}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Reason for Visit & Clinical Notes */}
          <div className="pt-2 space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                Symptoms / Chief Complaint
              </label>
              <input
                type="text"
                placeholder="e.g. Chest tightness, routine blood pressure review, fever..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Internal Admin Notes (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Walk-in registration at front desk, files verified..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition resize-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-md hover:shadow transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating in Database...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm & Save Appointment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
