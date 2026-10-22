import { useState, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  X,
  MapPin,
  Star,
  BedDouble,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Phone,
  Mail,
  Clock3,
  Edit,
  Power,
  ShieldCheck,
  Stethoscope,
  Sparkles,
} from 'lucide-react'
import { useHospitalBranchesStore } from '@/store/hospitalBranchesStore'

import apolloImg from '@/assets/apollo-hospital.jpg'
import cityCareImg from '@/assets/city-care-hospital.jpg'
import shreeSaiImg from '@/assets/shree-sai-hospital.jpg'
import lifecareImg from '@/assets/lifecare-hospital.jpg'

export const HospitalDetailsModal: FC = () => {
  const navigate = useNavigate()
  const {
    selectedHospital,
    isDetailsModalOpen,
    setIsDetailsModalOpen,
    toggleActiveStatus,
    isSubmitting,
  } = useHospitalBranchesStore()

  const [activeTab, setActiveTab] = useState<'overview' | 'departments' | 'facilities'>('overview')

  if (!isDetailsModalOpen || !selectedHospital) return null

  const getCoverImage = () => {
    if (selectedHospital.images?.coverImage) {
      return selectedHospital.images.coverImage
    }
    const name = selectedHospital.name.toLowerCase()
    if (name.includes('apollo')) return apolloImg
    if (name.includes('city') || name.includes('care')) return cityCareImg
    if (name.includes('sai')) return shreeSaiImg
    return lifecareImg
  }

  const addressLine = [
    selectedHospital.address?.street,
    selectedHospital.address?.city,
    selectedHospital.address?.state,
    selectedHospital.address?.zipCode,
  ]
    .filter(Boolean)
    .join(', ')

  const handleToggleActive = async () => {
    await toggleActiveStatus(selectedHospital._id, selectedHospital.isActive)
  }

  const handleEditClick = () => {
    setIsDetailsModalOpen(false)
    navigate(`/hospital-admin/hospitals/${selectedHospital._id}/edit`)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-200 animate-in zoom-in-95 duration-200">
        {/* Modal Top Nav Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              Hospital Details
            </h2>
            <span className="text-xs text-slate-400 font-semibold">•</span>
            <span className="text-xs font-semibold text-slate-500">
              {selectedHospital.licenseNumber || 'Verified Branch'}
            </span>
          </div>
          <button
            onClick={() => setIsDetailsModalOpen(false)}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          {/* Cover Image with Status Overlay */}
          <div className="relative h-48 sm:h-56 rounded-2xl overflow-hidden bg-slate-100">
            <img
              src={getCoverImage()}
              alt={selectedHospital.name}
              className="size-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />

            <div className="absolute top-3 left-3">
              {selectedHospital.verificationStatus === 'APPROVED' ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-sm flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5" />
                  <span>Verified Branch</span>
                </span>
              ) : selectedHospital.verificationStatus === 'PENDING' ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-sm flex items-center gap-1.5">
                  <Clock className="size-3.5" />
                  <span>Pending Super Admin Review</span>
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500 text-white shadow-sm flex items-center gap-1.5">
                  <XCircle className="size-3.5" />
                  <span>Rejected</span>
                </span>
              )}
            </div>
          </div>

          {/* Hospital Header Title & Meta */}
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  {selectedHospital.name}
                </h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                    <Star className="size-3.5 fill-current" />
                    <span>{selectedHospital.rating?.toFixed(1) || '4.8'}</span>
                  </span>
                  <span className="text-slate-400 text-xs font-medium">
                    ({(selectedHospital.reviewCount || 860).toLocaleString()} patient reviews)
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
                    {selectedHospital.hospitalType || 'Multi-Speciality'}
                  </span>
                </div>
              </div>

              <div
                className={`px-3 py-1 rounded-full text-xs font-bold border shrink-0 ${
                  selectedHospital.isActive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                ● {selectedHospital.isActive ? 'Active Status' : 'Deactivated'}
              </div>
            </div>

            {/* Address */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2 font-medium">
              <MapPin className="size-3.5 text-slate-400 shrink-0" />
              <span>{addressLine || 'Bilaspur, Chhattisgarh, India'}</span>
            </div>
          </div>

          {/* 3 Core Stats Metrics */}
          <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 text-center">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-slate-700 font-semibold text-xs">
                <BedDouble className="size-4 text-blue-600" />
                <span className="text-base font-black text-slate-900">
                  {selectedHospital.totalBeds || 120}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                Total Beds
              </span>
            </div>

            <div className="flex flex-col items-center border-x border-slate-200/60">
              <div className="flex items-center gap-1 text-slate-700 font-semibold text-xs">
                <Users className="size-4 text-emerald-600" />
                <span className="text-base font-black text-slate-900">
                  {selectedHospital.doctorCount || 18}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                Doctors
              </span>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-slate-700 font-semibold text-xs">
                <Calendar className="size-4 text-purple-600" />
                <span className="text-base font-black text-slate-900">
                  {selectedHospital.appointmentCount || 286}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                Appointments
              </span>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex border-b border-slate-200 text-xs font-bold gap-6">
            {(['overview', 'departments', 'facilities'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2.5 capitalize transition-all cursor-pointer relative ${
                  activeTab === tab
                    ? 'text-blue-600 font-black'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Description */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                  About Hospital
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {selectedHospital.description ||
                    'A leading healthcare institution offering comprehensive world-class medical care with advanced technology, dedicated specialist doctors, and 24x7 patient support services.'}
                </p>
              </div>

              {/* Operational Meta Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
                  <Phone className="size-4 text-slate-400" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 font-bold block">Contact Phone</span>
                    <span className="font-semibold text-slate-800 truncate block">
                      {selectedHospital.contactPhone || '+91 7752 400 100'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
                  <Mail className="size-4 text-slate-400" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 font-bold block">Contact Email</span>
                    <span className="font-semibold text-slate-800 truncate block">
                      {selectedHospital.contactEmail || 'admin@curehealth.org'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
                  <Clock3 className="size-4 text-slate-400" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 font-bold block">Operating Hours</span>
                    <span className="font-semibold text-slate-800 truncate block">
                      {selectedHospital.openingTime || '09:00'} - {selectedHospital.closingTime || '23:59'} (24x7 Emergency)
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
                  <ShieldCheck className="size-4 text-emerald-600" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 font-bold block">License Number</span>
                    <span className="font-semibold text-slate-800 truncate block">
                      {selectedHospital.licenseNumber}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Departments */}
          {activeTab === 'departments' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Clinical Departments ({selectedHospital.departments?.length || 4})
              </h4>
              <div className="grid grid-cols-2 gap-2.5">
                {(selectedHospital.departments || [
                  'General Medicine',
                  'Cardiology',
                  'Orthopedics',
                  'Pediatrics',
                ]).map((dept) => (
                  <div
                    key={dept}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2.5"
                  >
                    <div className="size-7 rounded-xl bg-blue-100/70 text-blue-700 flex items-center justify-center shrink-0">
                      <Stethoscope className="size-3.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 truncate">{dept}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Facilities */}
          {activeTab === 'facilities' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Hospital Infrastructure & Facilities ({selectedHospital.facilities?.length || 4})
              </h4>
              <div className="grid grid-cols-2 gap-2.5">
                {(selectedHospital.facilities || [
                  '24x7 Emergency',
                  'Pharmacy',
                  'Lab',
                  'Ambulance',
                  'ICU',
                  'Blood Bank',
                ]).map((facility) => (
                  <div
                    key={facility}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2.5"
                  >
                    <div className="size-7 rounded-xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center shrink-0">
                      <Sparkles className="size-3.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 truncate">{facility}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Actions matching mockup (Edit & Deactivate buttons + Full Page) */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-end gap-3 shrink-0">
          <button
            onClick={() => {
              setIsDetailsModalOpen(false)
              navigate(`/hospital-admin/hospitals/${selectedHospital._id}`)
            }}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <span>Open Full Page</span>
          </button>

          <button
            onClick={handleEditClick}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-slate-200 hover:border-blue-400 text-slate-700 hover:text-blue-600 bg-white font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <Edit className="size-3.5" />
            <span>Edit Hospital</span>
          </button>

          <button
            onClick={handleToggleActive}
            disabled={isSubmitting}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-white font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs ${
              selectedHospital.isActive
                ? 'bg-rose-500 hover:bg-rose-600'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            <Power className="size-3.5" />
            <span>{selectedHospital.isActive ? 'Deactivate Branch' : 'Activate Branch'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
export default HospitalDetailsModal
