import { useState, useEffect, type FC, type FormEvent } from 'react'
import { X, Building2 } from 'lucide-react'
import { useHospitalBranchesStore } from '@/store/hospitalBranchesStore'

export const EditHospitalModal: FC = () => {
  const {
    selectedHospital,
    isEditModalOpen,
    setIsEditModalOpen,
    updateHospital,
    isSubmitting,
  } = useHospitalBranchesStore()

  const [formData, setFormData] = useState({
    name: '',
    hospitalType: 'Multi-Speciality',
    contactEmail: '',
    contactPhone: '',
    street: '',
    city: '',
    totalBeds: 100,
    departments: '',
    facilities: '',
    description: '',
    isActive: true,
  })

  useEffect(() => {
    if (selectedHospital) {
      setFormData({
        name: selectedHospital.name || '',
        hospitalType: selectedHospital.hospitalType || 'Multi-Speciality',
        contactEmail: selectedHospital.contactEmail || '',
        contactPhone: selectedHospital.contactPhone || '',
        street: selectedHospital.address?.street || '',
        city: selectedHospital.address?.city || '',
        totalBeds: selectedHospital.totalBeds || 100,
        departments: (selectedHospital.departments || []).join(', '),
        facilities: (selectedHospital.facilities || []).join(', '),
        description: selectedHospital.description || '',
        isActive: selectedHospital.isActive ?? true,
      })
    }
  }, [selectedHospital])

  if (!isEditModalOpen || !selectedHospital) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const payload = {
      name: formData.name.trim(),
      hospitalType: formData.hospitalType,
      contactEmail: formData.contactEmail.trim(),
      contactPhone: formData.contactPhone.trim(),
      address: {
        ...selectedHospital.address,
        street: formData.street.trim(),
        city: formData.city.trim(),
      },
      totalBeds: Number(formData.totalBeds) || 50,
      departments: formData.departments
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      facilities: formData.facilities
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      description: formData.description.trim(),
      isActive: formData.isActive,
    }

    await updateHospital(selectedHospital._id, payload)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-200 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
              <Building2 className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight leading-tight">
                Manage Hospital Branch
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Update branch operations, contact details, or active status
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsEditModalOpen(false)}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Hospital Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Hospital Type</label>
              <select
                value={formData.hospitalType}
                onChange={(e) => setFormData({ ...formData, hospitalType: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
              >
                <option value="Multi-Speciality">Multi-Speciality</option>
                <option value="Super-Speciality">Super-Speciality</option>
                <option value="General Hospital">General Hospital</option>
                <option value="Maternity & Women Care">Maternity & Women Care</option>
                <option value="Clinic">Clinic</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Total Beds</label>
              <input
                type="number"
                min="1"
                value={formData.totalBeds}
                onChange={(e) => setFormData({ ...formData, totalBeds: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Official Email</label>
              <input
                type="email"
                required
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
              <input
                type="tel"
                required
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Street Address</label>
              <input
                type="text"
                required
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">City</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Departments (comma separated)
            </label>
            <input
              type="text"
              value={formData.departments}
              onChange={(e) => setFormData({ ...formData, departments: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Facilities (comma separated)
            </label>
            <input
              type="text"
              value={formData.facilities}
              onChange={(e) => setFormData({ ...formData, facilities: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Active status checkbox */}
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <input
              type="checkbox"
              id="isActiveToggle"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="size-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="isActiveToggle" className="font-bold text-slate-800 cursor-pointer">
              Branch is Active and Open for Patient Intake & Bookings
            </label>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold transition-all cursor-pointer shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? 'Saving Changes...' : 'Save Updates'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
export default EditHospitalModal
