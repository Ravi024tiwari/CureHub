import { useState, type FC } from 'react'
import {
  X,
  Plus,
  Trash2,
  FileText,
  CheckCircle2,
  AlertCircle,
  Pill,
} from 'lucide-react'
import type { DoctorAppointmentItem } from '@/services/doctorService'

interface MedicineItem {
  name: string
  dosage: string
  frequency: string
  duration: string
  instructions?: string
}

interface DoctorPrescriptionModalProps {
  isOpen: boolean
  onClose: () => void
  appointment: DoctorAppointmentItem | null
  onSubmit: (prescriptionData: {
    diagnosis: string
    advice?: string
    medicines: MedicineItem[]
    followUpDate?: string
  }) => Promise<void>
  isSubmitting: boolean
}

export const DoctorPrescriptionModal: FC<DoctorPrescriptionModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onSubmit,
  isSubmitting,
}) => {
  const [diagnosis, setDiagnosis] = useState('')
  const [advice, setAdvice] = useState('')
  const [followUpDate, setFollowUpDate] = useState('')
  const [medicines, setMedicines] = useState<MedicineItem[]>([
    {
      name: '',
      dosage: '1 Tab',
      frequency: 'Twice daily after meals',
      duration: '5 days',
      instructions: '',
    },
  ])
  const [error, setError] = useState<string | null>(null)

  if (!isOpen || !appointment) return null

  const patientName =
    appointment.patientDetails?.fullName || appointment.patientId?.name || 'Patient'

  const handleAddMedicine = () => {
    setMedicines([
      ...medicines,
      {
        name: '',
        dosage: '1 Tab',
        frequency: 'Twice daily after meals',
        duration: '5 days',
        instructions: '',
      },
    ])
  }

  const handleRemoveMedicine = (index: number) => {
    if (medicines.length === 1) return
    setMedicines(medicines.filter((_, i) => i !== index))
  }

  const handleMedicineChange = (index: number, field: keyof MedicineItem, value: string) => {
    const updated = [...medicines]
    updated[index] = { ...updated[index], [field]: value }
    setMedicines(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!diagnosis.trim()) {
      setError('Clinical diagnosis is required to issue prescription.')
      return
    }

    const validMedicines = medicines.filter((m) => m.name.trim().length > 0)

    try {
      setError(null)
      await onSubmit({
        diagnosis: diagnosis.trim(),
        advice: advice.trim() || undefined,
        medicines: validMedicines,
        followUpDate: followUpDate || undefined,
      })
      onClose()
    } catch (err: any) {
      setError(err?.message || 'Failed to complete consultation.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Dialog Modal */}
      <div className="relative z-50 w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <FileText className="size-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Issue Prescription & Discharge
              </h3>
              <p className="text-xs font-semibold text-slate-500">
                Patient: <span className="text-slate-800 font-bold">{patientName}</span> • #
                {appointment.appointmentNumber}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="size-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Diagnosis */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
              Clinical Diagnosis <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="e.g. Acute Upper Respiratory Tract Infection / Viral Pharyngitis"
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-xs sm:text-sm font-semibold text-slate-800 outline-hidden transition-all"
            />
          </div>

          {/* Medicines Prescription list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Pill className="size-4 text-blue-600" />
                <span>Prescribed Medications</span>
              </label>

              <button
                type="button"
                onClick={handleAddMedicine}
                className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                <Plus className="size-3.5" />
                <span>Add Medicine</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {medicines.map((med, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      Medicine #{idx + 1}
                    </span>
                    {medicines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicine(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={med.name}
                      onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)}
                      placeholder="Medicine Name (e.g. Paracetamol 650mg)"
                      className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 focus:border-blue-500 outline-hidden"
                    />
                    <input
                      type="text"
                      value={med.dosage}
                      onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                      placeholder="Dosage (e.g. 1 Tablet)"
                      className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 focus:border-blue-500 outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={med.frequency}
                      onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value)}
                      placeholder="Frequency (e.g. Twice daily after meals)"
                      className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 focus:border-blue-500 outline-hidden"
                    />
                    <input
                      type="text"
                      value={med.duration}
                      onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                      placeholder="Duration (e.g. 5 days)"
                      className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 focus:border-blue-500 outline-hidden"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Advice / Instructions */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
              Doctor's Dietary & Clinical Advice
            </label>
            <textarea
              rows={3}
              value={advice}
              onChange={(e) => setAdvice(e.target.value)}
              placeholder="e.g. Drink warm fluids, avoid cold beverages, bed rest for 48 hours..."
              className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-xs font-medium text-slate-800 outline-hidden resize-none"
            />
          </div>

          {/* Follow-up Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
              Follow-up Review Date (Optional)
            </label>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:border-blue-500 outline-hidden"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-black transition-all cursor-pointer shadow-md shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Completing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4" />
                  <span>Issue & Mark Completed</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
