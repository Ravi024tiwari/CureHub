import { useState, type FC, type FormEvent } from 'react'
import {
  X,
  Building2,
  Phone,
  Mail,
  ShieldCheck,
} from 'lucide-react'
import { useHospitalBranchesStore } from '@/store/hospitalBranchesStore'

export const AddHospitalModal: FC = () => {
  const { isAddModalOpen, setIsAddModalOpen, createHospital, isSubmitting } =
    useHospitalBranchesStore()

  const [formData, setFormData] = useState({
    name: '',
    hospitalType: 'Multi-Speciality',
    licenseNumber: '',
    licenseDocumentUrl: 'https://curehealth-storage.s3.amazonaws.com/licenses/demo-license.pdf',
    contactEmail: '',
    contactPhone: '',
    street: '',
    city: 'Bilaspur',
    state: 'Chhattisgarh',
    zipCode: '495001',
    totalBeds: 100,
    establishmentYear: new Date().getFullYear(),
    departments: 'General Medicine, Cardiology, Orthopedics, Pediatrics',
    facilities: '24x7 Emergency, Pharmacy, Lab, Ambulance, ICU',
    coverImage: '/src/assets/city-care-hospital.jpg',
    description: '',
  })

  const [formError, setFormError] = useState<string | null>(null)

  if (!isAddModalOpen) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!formData.name.trim()) {
      setFormError('Hospital name is required')
      return
    }
    if (!formData.licenseNumber.trim()) {
      setFormError('Government License/Registration number is required')
      return
    }
    if (!formData.contactEmail.trim() || !formData.contactPhone.trim()) {
      setFormError('Contact email and phone number are required')
      return
    }
    if (!formData.street.trim() || !formData.city.trim()) {
      setFormError('Street and City address are required')
      return
    }

    const payload = {
      name: formData.name.trim(),
      hospitalType: formData.hospitalType,
      licenseNumber: formData.licenseNumber.trim(),
      licenseDocumentUrl: formData.licenseDocumentUrl.trim(),
      contactEmail: formData.contactEmail.trim(),
      contactPhone: formData.contactPhone.trim(),
      address: {
        street: formData.street.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        zipCode: formData.zipCode.trim(),
        country: 'India',
      },
      totalBeds: Number(formData.totalBeds) || 50,
      establishmentYear: Number(formData.establishmentYear) || 2024,
      departments: formData.departments
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      facilities: formData.facilities
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      images: {
        coverImage: formData.coverImage,
      },
      description: formData.description.trim(),
    }

    const success = await createHospital(payload)
    if (!success) {
      setFormError('Failed to register hospital. Please verify details.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-200 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
              <Building2 className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight leading-tight">
                Add New Hospital Branch
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Submit your facility for verification and patient intake
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAddModalOpen(false)}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 space-y-4 text-xs">
          {formError && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold">
              {formError}
            </div>
          )}

          {/* Row 1: Hospital Name & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Hospital Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Apollo Multispeciality Hospital"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>

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
          </div>

          {/* Row 2: License Number & Document */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                License / Registration No. <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <ShieldCheck className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  placeholder="e.g. CG-BIL-2024-1049"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Total Beds & Year
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min="1"
                  value={formData.totalBeds}
                  onChange={(e) => setFormData({ ...formData, totalBeds: Number(e.target.value) })}
                  placeholder="Beds"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                />
                <input
                  type="number"
                  value={formData.establishmentYear}
                  onChange={(e) => setFormData({ ...formData, establishmentYear: Number(e.target.value) })}
                  placeholder="Year"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Row 3: Contact Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Official Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  placeholder="contact@hospital.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Contact Phone <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  placeholder="+91 7752 400 100"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Row 4: Address Details */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Street Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              placeholder="e.g. Civil Lines, Main High Court Road"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">City</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">State</label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">PIN Code</label>
              <input
                type="text"
                required
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Row 5: Departments & Facilities */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </div>

          {/* Description */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide a brief overview of healthcare services, key specialties, and clinical strengths..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Submit Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold transition-all cursor-pointer shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? 'Registering...' : '+ Create Hospital Branch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
export default AddHospitalModal
