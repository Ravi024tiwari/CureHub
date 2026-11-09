import { useState, type FC, type KeyboardEvent } from 'react'
import {
  ShieldCheck,
  AlertTriangle,
  Activity,
  Scissors,
  Pill,
  Plus,
  X,
  Sparkles,
} from 'lucide-react'

interface PatientMedicalHistoryTabProps {
  allergies: string[]
  onChangeAllergies: (val: string[]) => void
  chronicDiseases: string[]
  onChangeChronicDiseases: (val: string[]) => void
  pastSurgeries: string[]
  onChangePastSurgeries: (val: string[]) => void
  currentMedications: string[]
  onChangeCurrentMedications: (val: string[]) => void
}

const COMMON_ALLERGIES = [
  'Penicillin',
  'Sulfa Drugs',
  'Aspirin',
  'Peanuts',
  'Dust Mites',
  'Latex',
  'Shellfish',
  'Pollen',
]

const COMMON_CHRONIC = [
  'Hypertension (High BP)',
  'Type 2 Diabetes',
  'Asthma',
  'Thyroid Disorder',
  'Migraine',
  'Arthritis',
  'Acid Reflux (GERD)',
]

export const PatientMedicalHistoryTab: FC<PatientMedicalHistoryTabProps> = ({
  allergies,
  onChangeAllergies,
  chronicDiseases,
  onChangeChronicDiseases,
  pastSurgeries,
  onChangePastSurgeries,
  currentMedications,
  onChangeCurrentMedications,
}) => {
  // Local input fields for adding new chips
  const [allergyInput, setAllergyInput] = useState('')
  const [chronicInput, setChronicInput] = useState('')
  const [surgeryInput, setSurgeryInput] = useState('')
  const [medicationInput, setMedicationInput] = useState('')

  // Add tag helpers
  const addAllergy = (val: string) => {
    const trimmed = val.trim()
    if (!trimmed || allergies.some((a) => a.toLowerCase() === trimmed.toLowerCase())) return
    onChangeAllergies([...allergies, trimmed])
    setAllergyInput('')
  }

  const removeAllergy = (index: number) => {
    onChangeAllergies(allergies.filter((_, i) => i !== index))
  }

  const addChronic = (val: string) => {
    const trimmed = val.trim()
    if (!trimmed || chronicDiseases.some((c) => c.toLowerCase() === trimmed.toLowerCase())) return
    onChangeChronicDiseases([...chronicDiseases, trimmed])
    setChronicInput('')
  }

  const removeChronic = (index: number) => {
    onChangeChronicDiseases(chronicDiseases.filter((_, i) => i !== index))
  }

  const addSurgery = (val: string) => {
    const trimmed = val.trim()
    if (!trimmed || pastSurgeries.some((s) => s.toLowerCase() === trimmed.toLowerCase())) return
    onChangePastSurgeries([...pastSurgeries, trimmed])
    setSurgeryInput('')
  }

  const removeSurgery = (index: number) => {
    onChangePastSurgeries(pastSurgeries.filter((_, i) => i !== index))
  }

  const addMedication = (val: string) => {
    const trimmed = val.trim()
    if (!trimmed || currentMedications.some((m) => m.toLowerCase() === trimmed.toLowerCase())) return
    onChangeCurrentMedications([...currentMedications, trimmed])
    setMedicationInput('')
  }

  const removeMedication = (index: number) => {
    onChangeCurrentMedications(currentMedications.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-8">
      {/* Privacy / Clinical Safety Notice */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white border border-emerald-200/90 flex items-start gap-3">
        <ShieldCheck className="size-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-black text-emerald-950">
            Encrypted Clinical Profile & Drug Interaction Safety
          </h4>
          <p className="text-xs text-emerald-800 font-medium leading-relaxed">
            Doctors automatically receive alerts if an e-prescription conflicts with your documented allergies or current medications.
          </p>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          1. ALLERGIES SECTION
          ───────────────────────────────────────────────────────────── */}
      <div className="space-y-3.5 p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <AlertTriangle className="size-4 text-amber-500" />
            <span>Known Allergies ({allergies.length})</span>
          </label>
          <span className="text-[11px] text-slate-400 font-semibold">
            Press Enter or click Add
          </span>
        </div>

        {/* Chip Tag Cloud */}
        <div className="flex flex-wrap gap-2 min-h-8">
          {allergies.length === 0 ? (
            <p className="text-xs text-slate-400 italic">
              No known allergies listed (Click suggestions below or type your own)
            </p>
          ) : (
            allergies.map((allergy, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold shadow-2xs animate-in zoom-in-95 duration-150"
              >
                <span>{allergy}</span>
                <button
                  type="button"
                  onClick={() => removeAllergy(index)}
                  className="p-0.5 rounded-md hover:bg-amber-200/60 text-amber-700 cursor-pointer"
                  title="Remove allergy"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))
          )}
        </div>

        {/* Input Bar */}
        <div className="flex gap-2 pt-1">
          <input
            type="text"
            value={allergyInput}
            onChange={(e) => setAllergyInput(e.target.value)}
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addAllergy(allergyInput)
              }
            }}
            placeholder="Type an allergy (e.g. Ibuprofen, Shellfish)..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-slate-200/90 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5170f4]/25 focus:border-[#5170f4]"
          />
          <button
            type="button"
            onClick={() => addAllergy(allergyInput)}
            className="px-4 py-2.5 rounded-xl bg-[#5170f4] hover:bg-[#4361ee] text-white text-xs font-black shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
          >
            <Plus className="size-3.5" />
            <span>Add</span>
          </button>
        </div>

        {/* Common Suggestions */}
        <div className="pt-1 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Sparkles className="size-3 text-[#637ff5]" />
            <span>Quick Add:</span>
          </span>
          {COMMON_ALLERGIES.filter(
            (c) => !allergies.some((a) => a.toLowerCase() === c.toLowerCase())
          ).map((sugg) => (
            <button
              key={sugg}
              type="button"
              onClick={() => addAllergy(sugg)}
              className="text-[11px] font-semibold text-slate-600 bg-white hover:bg-amber-50 hover:text-amber-800 border border-slate-200/80 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              + {sugg}
            </button>
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. CHRONIC DISEASES / MEDICAL CONDITIONS
          ───────────────────────────────────────────────────────────── */}
      <div className="space-y-3.5 p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Activity className="size-4 text-[#5170f4]" />
            <span>Chronic Diseases & Pre-Existing Conditions ({chronicDiseases.length})</span>
          </label>
        </div>

        {/* Chip Tag Cloud */}
        <div className="flex flex-wrap gap-2 min-h-8">
          {chronicDiseases.length === 0 ? (
            <p className="text-xs text-slate-400 italic">
              No chronic conditions recorded
            </p>
          ) : (
            chronicDiseases.map((condition, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-900 border border-blue-200 text-xs font-bold shadow-2xs animate-in zoom-in-95 duration-150"
              >
                <span>{condition}</span>
                <button
                  type="button"
                  onClick={() => removeChronic(index)}
                  className="p-0.5 rounded-md hover:bg-blue-200/60 text-blue-700 cursor-pointer"
                  title="Remove condition"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))
          )}
        </div>

        {/* Input Bar */}
        <div className="flex gap-2 pt-1">
          <input
            type="text"
            value={chronicInput}
            onChange={(e) => setChronicInput(e.target.value)}
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addChronic(chronicInput)
              }
            }}
            placeholder="Type condition (e.g. Type 2 Diabetes, Asthma)..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-slate-200/90 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5170f4]/25 focus:border-[#5170f4]"
          />
          <button
            type="button"
            onClick={() => addChronic(chronicInput)}
            className="px-4 py-2.5 rounded-xl bg-[#5170f4] hover:bg-[#4361ee] text-white text-xs font-black shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
          >
            <Plus className="size-3.5" />
            <span>Add</span>
          </button>
        </div>

        {/* Common Suggestions */}
        <div className="pt-1 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Sparkles className="size-3 text-[#637ff5]" />
            <span>Quick Add:</span>
          </span>
          {COMMON_CHRONIC.filter(
            (c) => !chronicDiseases.some((cd) => cd.toLowerCase() === c.toLowerCase())
          ).map((sugg) => (
            <button
              key={sugg}
              type="button"
              onClick={() => addChronic(sugg)}
              className="text-[11px] font-semibold text-slate-600 bg-white hover:bg-blue-50 hover:text-blue-800 border border-slate-200/80 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              + {sugg}
            </button>
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. PAST SURGERIES & CURRENT MEDICATIONS (2 COLUMNS)
          ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Past Surgeries */}
        <div className="space-y-3.5 p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80">
          <label className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Scissors className="size-4 text-purple-600" />
            <span>Past Surgeries ({pastSurgeries.length})</span>
          </label>

          <div className="flex flex-wrap gap-2 min-h-8">
            {pastSurgeries.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No past surgeries listed</p>
            ) : (
              pastSurgeries.map((surgery, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-900 border border-purple-200 text-xs font-bold"
                >
                  <span>{surgery}</span>
                  <button
                    type="button"
                    onClick={() => removeSurgery(index)}
                    className="p-0.5 rounded-md hover:bg-purple-200/60 text-purple-700 cursor-pointer"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))
            )}
          </div>

          <div className="flex gap-2 pt-1">
            <input
              type="text"
              value={surgeryInput}
              onChange={(e) => setSurgeryInput(e.target.value)}
              onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addSurgery(surgeryInput)
                }
              }}
              placeholder="e.g. Appendectomy (2021)..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-slate-200/90 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5170f4]/25 focus:border-[#5170f4]"
            />
            <button
              type="button"
              onClick={() => addSurgery(surgeryInput)}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-xs cursor-pointer active:scale-95"
            >
              Add
            </button>
          </div>
        </div>

        {/* Current Medications */}
        <div className="space-y-3.5 p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80">
          <label className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Pill className="size-4 text-emerald-600" />
            <span>Current Medications ({currentMedications.length})</span>
          </label>

          <div className="flex flex-wrap gap-2 min-h-8">
            {currentMedications.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No ongoing daily medications</p>
            ) : (
              currentMedications.map((med, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold"
                >
                  <span>{med}</span>
                  <button
                    type="button"
                    onClick={() => removeMedication(index)}
                    className="p-0.5 rounded-md hover:bg-emerald-200/60 text-emerald-700 cursor-pointer"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))
            )}
          </div>

          <div className="flex gap-2 pt-1">
            <input
              type="text"
              value={medicationInput}
              onChange={(e) => setMedicationInput(e.target.value)}
              onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addMedication(medicationInput)
                }
              }}
              placeholder="e.g. Metformin 500mg, Amlodipine 5mg..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-slate-200/90 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5170f4]/25 focus:border-[#5170f4]"
            />
            <button
              type="button"
              onClick={() => addMedication(medicationInput)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs cursor-pointer active:scale-95"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
