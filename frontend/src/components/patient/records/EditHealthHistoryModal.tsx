import { useState, useEffect, type FC } from 'react'
import {
  X,
  HeartPulse,
  Droplet,
  AlertCircle,
  Activity,
  Pill,
  PhoneCall,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import { usePatientStore } from '@/store/patientStore'

export const EditHealthHistoryModal: FC = () => {
  const {
    medicalHistory,
    isEditHistoryModalOpen,
    closeEditHistoryModal,
    updateMedicalHistory,
  } = usePatientStore()

  const [bloodGroup, setBloodGroup] = useState(medicalHistory.bloodGroup || '')
  const [allergies, setAllergies] = useState<string[]>([...medicalHistory.allergies])
  const [newAllergy, setNewAllergy] = useState('')

  const [chronicDiseases, setChronicDiseases] = useState<string[]>([
    ...medicalHistory.chronicDiseases,
  ])
  const [newChronic, setNewChronic] = useState('')

  const [pastSurgeries, setPastSurgeries] = useState<string[]>([
    ...medicalHistory.pastSurgeries,
  ])
  const [newSurgery, setNewSurgery] = useState('')

  const [currentMedications, setCurrentMedications] = useState<string[]>([
    ...medicalHistory.currentMedications,
  ])
  const [newMedication, setNewMedication] = useState('')

  const [contactName, setContactName] = useState(
    medicalHistory.emergencyContact?.name || ''
  )
  const [contactRelation, setContactRelation] = useState(
    medicalHistory.emergencyContact?.relationship || ''
  )
  const [contactPhone, setContactPhone] = useState(
    medicalHistory.emergencyContact?.phoneNumber || ''
  )

  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Sync state whenever modal opens or medicalHistory changes
  useEffect(() => {
    if (isEditHistoryModalOpen) {
      setBloodGroup(medicalHistory.bloodGroup || '')
      setAllergies([...medicalHistory.allergies])
      setChronicDiseases([...medicalHistory.chronicDiseases])
      setPastSurgeries([...medicalHistory.pastSurgeries])
      setCurrentMedications([...medicalHistory.currentMedications])
      setContactName(medicalHistory.emergencyContact?.name || '')
      setContactRelation(medicalHistory.emergencyContact?.relationship || '')
      setContactPhone(medicalHistory.emergencyContact?.phoneNumber || '')
    }
  }, [isEditHistoryModalOpen, medicalHistory])

  if (!isEditHistoryModalOpen) return null

  const handleAddTag = (
    list: string[],
    setList: (l: string[]) => void,
    val: string,
    setVal: (v: string) => void
  ) => {
    if (!val.trim()) return
    if (!list.includes(val.trim())) {
      setList([...list, val.trim()])
    }
    setVal('')
  }

  const handleRemoveTag = (
    list: string[],
    setList: (l: string[]) => void,
    idx: number
  ) => {
    setList(list.filter((_, i) => i !== idx))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    await updateMedicalHistory({
      bloodGroup,
      allergies,
      chronicDiseases,
      pastSurgeries,
      currentMedications,
      emergencyContact: {
        name: contactName.trim(),
        relationship: contactRelation.trim(),
        phoneNumber: contactPhone.trim(),
      },
    })

    setIsSaving(false)
    setSaveSuccess(true)
    setTimeout(() => {
      setSaveSuccess(false)
      closeEditHistoryModal()
    }, 600)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-xl my-auto overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <HeartPulse className="size-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                Health Information
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Update blood group, allergies, medications, and emergency contact
              </p>
            </div>
          </div>
          <button
            onClick={closeEditHistoryModal}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Blood Group */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
              <Droplet className="size-3.5 text-rose-500" />
              <span>Blood Group</span>
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                <button
                  key={bg}
                  type="button"
                  onClick={() => setBloodGroup(bg)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    bloodGroup === bg
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm shadow-rose-500/25 scale-105'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-rose-300 hover:bg-rose-50/50'
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>
          </div>

          {/* Allergies */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5">
              <AlertCircle className="size-3.5 text-amber-500" />
              <span>Allergies</span>
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {allergies.map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200"
                >
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(allergies, setAllergies, idx)}
                    className="hover:text-rose-600"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
              {allergies.length === 0 && (
                <span className="text-xs text-slate-400 italic">No allergies recorded</span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTag(allergies, setAllergies, newAllergy, setNewAllergy)
                  }
                }}
                placeholder="Add allergy (e.g. Penicillin, Peanuts, Pollen)..."
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-400"
              />
              <button
                type="button"
                onClick={() => handleAddTag(allergies, setAllergies, newAllergy, setNewAllergy)}
                className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-xl text-xs font-bold transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Chronic Diseases */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5">
              <HeartPulse className="size-3.5 text-red-500" />
              <span>Chronic Diseases</span>
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {chronicDiseases.map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-800 border border-red-200"
                >
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(chronicDiseases, setChronicDiseases, idx)}
                    className="hover:text-rose-600"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
              {chronicDiseases.length === 0 && (
                <span className="text-xs text-slate-400 italic">No chronic diseases recorded</span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newChronic}
                onChange={(e) => setNewChronic(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTag(chronicDiseases, setChronicDiseases, newChronic, setNewChronic)
                  }
                }}
                placeholder="Add chronic disease (e.g. Asthma, Hypertension, Diabetes)..."
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-red-400"
              />
              <button
                type="button"
                onClick={() => handleAddTag(chronicDiseases, setChronicDiseases, newChronic, setNewChronic)}
                className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-xl text-xs font-bold transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Past Surgeries */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5">
              <Activity className="size-3.5 text-indigo-500" />
              <span>Past Surgeries</span>
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {pastSurgeries.map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200"
                >
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(pastSurgeries, setPastSurgeries, idx)}
                    className="hover:text-rose-600"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
              {pastSurgeries.length === 0 && (
                <span className="text-xs text-slate-400 italic">No surgeries recorded</span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSurgery}
                onChange={(e) => setNewSurgery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTag(pastSurgeries, setPastSurgeries, newSurgery, setNewSurgery)
                  }
                }}
                placeholder="Add surgery (e.g. Appendectomy, Knee Arthroscopy)..."
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-400"
              />
              <button
                type="button"
                onClick={() => handleAddTag(pastSurgeries, setPastSurgeries, newSurgery, setNewSurgery)}
                className="px-3 py-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 rounded-xl text-xs font-bold transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Current Medications */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5">
              <Pill className="size-3.5 text-blue-500" />
              <span>Current Medications</span>
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {currentMedications.map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200"
                >
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(currentMedications, setCurrentMedications, idx)}
                    className="hover:text-rose-600"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
              {currentMedications.length === 0 && (
                <span className="text-xs text-slate-400 italic">No medications recorded</span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newMedication}
                onChange={(e) => setNewMedication(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTag(currentMedications, setCurrentMedications, newMedication, setNewMedication)
                  }
                }}
                placeholder="Add medication (e.g. Paracetamol 500mg, Metformin 500mg)..."
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-400"
              />
              <button
                type="button"
                onClick={() => handleAddTag(currentMedications, setCurrentMedications, newMedication, setNewMedication)}
                className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-xl text-xs font-bold transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
              <PhoneCall className="size-3.5 text-emerald-500" />
              <span>Emergency Contact Details</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">Name</span>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Ramesh Tiwari"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">Relationship</span>
                <input
                  type="text"
                  value={contactRelation}
                  onChange={(e) => setContactRelation(e.target.value)}
                  placeholder="e.g. Father, Spouse"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">Phone Number</span>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={closeEditHistoryModal}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCircle2 className="size-4 text-emerald-300" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Health Info</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
