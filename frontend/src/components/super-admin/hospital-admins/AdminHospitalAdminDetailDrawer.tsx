import type { FC } from 'react'
import {
  X,
  Building,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  Clock,
  FileText,
  ExternalLink,
  Award,
  BedDouble,
  UserX,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import { useAdminHospitalAdminsStore } from '@/store/adminHospitalAdminsStore'

export const AdminHospitalAdminDetailDrawer: FC = () => {
  const {
    isDetailDrawerOpen,
    closeAdminDetails,
    selectedAdmin,
    selectedHospital,
    activeDrawerTab,
    setActiveDrawerTab,
    openStatusModal,
    isDrawerLoading,
  } = useAdminHospitalAdminsStore()

  if (!isDetailDrawerOpen || !selectedAdmin) return null

  const user = selectedAdmin.userId || ({} as any)
  const hospital: any = selectedHospital || selectedAdmin.hospitalId || {}

  const hospitalName =
    hospital.name || selectedAdmin.hospitalName || 'Unassigned Hospital'
  const hospitalType =
    hospital.hospitalType || selectedAdmin.hospitalType || 'Private Hospital'
  const registrationNumber =
    hospital.licenseNumber ||
    selectedAdmin.hospitalRegistrationNumber ||
    'REG-PENDING'
  const hospitalAddress =
    typeof hospital.address === 'object'
      ? [
          hospital.address.street,
          hospital.address.city,
          hospital.address.state,
          hospital.address.zipCode,
        ]
          .filter(Boolean)
          .join(', ')
      : selectedAdmin.hospitalAddress || 'Address not registered'

  const bedCount =
    hospital.totalBeds ?? selectedAdmin.numberOfBeds ?? 'N/A'

  const isVerified = selectedAdmin.verificationStatus === 'APPROVED'
  const isPending = selectedAdmin.verificationStatus === 'PENDING'
  const isRejected = selectedAdmin.verificationStatus === 'REJECTED'

  const joinedDate = user.createdAt || selectedAdmin.createdAt
  const verifiedDate = selectedAdmin.verifiedAt

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={closeAdminDetails}
      />

      {/* Drawer Panel */}
      <div className="relative z-50 w-full max-w-md sm:max-w-lg bg-white h-full shadow-2xl flex flex-col min-h-screen border-l border-slate-200 animate-in slide-in-from-right duration-300">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2">
            <Building className="size-5 text-blue-600" />
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              Hospital Admin Details
            </h2>
          </div>
          <button
            onClick={closeAdminDetails}
            className="size-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-5 space-y-5">
          {isDrawerLoading && (
            <div className="p-3 bg-blue-50/70 text-blue-700 text-xs font-semibold rounded-xl flex items-center gap-2">
              <div className="size-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span>Fetching latest synchronized records...</span>
            </div>
          )}

          {/* Profile Summary Card */}
          <div className="bg-slate-50/80 rounded-2xl p-4.5 border border-slate-200/70 text-center space-y-3">
            <div className="relative inline-block">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="size-20 rounded-full object-cover mx-auto ring-4 ring-white shadow-md"
                />
              ) : (
                <div className="size-20 rounded-full bg-linear-to-tr from-blue-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center mx-auto shadow-md">
                  {user.name ? user.name.slice(0, 2).toUpperCase() : 'HA'}
                </div>
              )}
              <span
                className={`absolute bottom-0 right-1 size-4 rounded-full ring-2 ring-white ${
                  user.isActive !== false ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
                title={user.isActive !== false ? 'Account Active' : 'Account Disabled'}
              />
            </div>

            <div>
              <div className="flex items-center justify-center gap-2">
                <h3 className="text-lg font-black text-slate-900">{user.name || 'Unnamed Admin'}</h3>
                {isVerified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="size-3" />
                    <span>Verified</span>
                  </span>
                )}
                {isPending && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                    <Clock className="size-3" />
                    <span>Pending</span>
                  </span>
                )}
                {isRejected && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                    <AlertTriangle className="size-3" />
                    <span>Rejected</span>
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                {selectedAdmin.designation || 'Hospital Administrator'}
              </p>
              <p className="text-xs text-blue-600 font-bold mt-0.5">{hospitalName}</p>
              {hospitalAddress && (
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  {hospitalAddress}
                </p>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setActiveDrawerTab('overview')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeDrawerTab === 'overview'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveDrawerTab('documents')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeDrawerTab === 'documents'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Documents
            </button>
            <button
              onClick={() => setActiveDrawerTab('hospital')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeDrawerTab === 'hospital'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hospital Details
            </button>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeDrawerTab === 'overview' && (
            <div className="space-y-4">
              {/* Section 1: Contact Information */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Contact Information
                </h4>
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="size-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                      <Mail className="size-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Email Address</p>
                      <a
                        href={`mailto:${user.email}`}
                        className="font-bold text-slate-800 hover:text-blue-600 truncate block"
                      >
                        {user.email || 'N/A'}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="size-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                      <Phone className="size-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Phone Number</p>
                      <a
                        href={`tel:${user.phoneNumber}`}
                        className="font-bold text-slate-800 hover:text-blue-600 truncate block"
                      >
                        {user.phoneNumber || 'N/A'}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="size-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                      <MapPin className="size-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Location</p>
                      <p className="font-bold text-slate-800 truncate">
                        {hospitalAddress}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="size-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                      <Calendar className="size-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Joined Platform</p>
                      <p className="font-bold text-slate-800">
                        {joinedDate
                          ? new Date(joinedDate).toLocaleDateString('en-US', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                            })
                          : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {verifiedDate && (
                    <div className="flex items-center gap-3">
                      <div className="size-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <ShieldCheck className="size-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-slate-400 font-semibold uppercase">Verified Date</p>
                        <p className="font-bold text-slate-800">
                          {new Date(verifiedDate).toLocaleDateString('en-US', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 2: Hospital Information */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Hospital Information
                </h4>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="size-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 overflow-hidden">
                    {hospital.images?.coverImage ? (
                      <img
                        src={hospital.images.coverImage}
                        alt={hospitalName}
                        className="size-full object-cover"
                      />
                    ) : (
                      <Building className="size-6 text-blue-600" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h5 className="font-bold text-slate-900 text-sm truncate">{hospitalName}</h5>
                      <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md shrink-0">
                        {hospitalType}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Reg: <span className="font-semibold text-slate-600">{registrationNumber}</span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                      Total Beds
                    </span>
                    <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                      <BedDouble className="size-3.5 text-blue-600" />
                      {bedCount}
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                      Facility Status
                    </span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                      <ShieldCheck className="size-3.5 text-emerald-600" />
                      {hospital.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 3: Additional Details */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Additional Details
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                    <span className="text-slate-400 font-medium">Designation</span>
                    <span className="font-bold text-slate-800">
                      {selectedAdmin.designation || 'Hospital Administrator'}
                    </span>
                  </div>

                  <div className="py-1.5 border-b border-slate-100">
                    <span className="text-slate-400 font-medium block mb-1.5">Qualifications</span>
                    {selectedAdmin.qualifications && selectedAdmin.qualifications.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedAdmin.qualifications.map((q, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-700 font-bold rounded-md text-[11px]"
                          >
                            <Award className="size-3 text-blue-600" />
                            {q}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-500 font-medium">MBA (Hospital Admin), BBA</span>
                    )}
                  </div>

                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-slate-400 font-medium">Government ID</span>
                    <span className="font-bold text-slate-800">
                      {selectedAdmin.governmentIdType || 'Aadhaar Card'} -{' '}
                      {selectedAdmin.governmentIdNumber
                        ? `***** ${selectedAdmin.governmentIdNumber.slice(-4)}`
                        : '***** 9012'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DOCUMENTS */}
          {activeDrawerTab === 'documents' && (
            <div className="space-y-3">
              {/* Document 1: Identity Proof */}
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <FileText className="size-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {selectedAdmin.governmentIdType || 'Identity Proof'}
                      </p>
                      <p className="text-[11px] text-slate-400">Government Issued ID Document</p>
                    </div>
                  </div>
                  {selectedAdmin.identityProofUrl ? (
                    <a
                      href={selectedAdmin.identityProofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <span>View</span>
                      <ExternalLink className="size-3" />
                    </a>
                  ) : (
                    <span className="text-[11px] font-semibold text-slate-400">Not Uploaded</span>
                  )}
                </div>
              </div>

              {/* Document 2: Authorization Letter */}
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <FileText className="size-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Authorization Letter</p>
                      <p className="text-[11px] text-slate-400">Hospital Appointment & Authority</p>
                    </div>
                  </div>
                  {selectedAdmin.authorizationLetterUrl ? (
                    <a
                      href={selectedAdmin.authorizationLetterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <span>View</span>
                      <ExternalLink className="size-3" />
                    </a>
                  ) : (
                    <span className="text-[11px] font-semibold text-slate-400">Not Uploaded</span>
                  )}
                </div>
              </div>

              {/* Document 3: Hospital Registration / License */}
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                      <Building className="size-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Hospital License Document</p>
                      <p className="text-[11px] text-slate-400">State Health Department Certificate</p>
                    </div>
                  </div>
                  {hospital.licenseDocumentUrl || selectedAdmin.additionalDocUrl ? (
                    <a
                      href={hospital.licenseDocumentUrl || selectedAdmin.additionalDocUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <span>View</span>
                      <ExternalLink className="size-3" />
                    </a>
                  ) : (
                    <span className="text-[11px] font-semibold text-slate-400">Not Uploaded</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HOSPITAL DETAILS */}
          {activeDrawerTab === 'hospital' && (
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-sm font-black text-slate-900">{hospitalName}</h4>
                  <p className="text-xs text-slate-400">{hospitalType}</p>
                </div>
                <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
                  {hospital.isActive !== false ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Address</span>
                  <p className="font-semibold text-slate-700 mt-0.5">{hospitalAddress}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">
                      Emergency 24x7
                    </span>
                    <span className="font-bold text-slate-800 mt-0.5 block">
                      {hospital.isEmergency24x7 ? 'Available' : 'Standard Hours'}
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">
                      Operating Hours
                    </span>
                    <span className="font-bold text-slate-800 mt-0.5 block">
                      {hospital.openingTime || '08:00 AM'} - {hospital.closingTime || '08:00 PM'}
                    </span>
                  </div>
                </div>

                {hospital.departments && hospital.departments.length > 0 && (
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">
                      Departments
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {hospital.departments.map((dept: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-md"
                        >
                          {dept}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Drawer Actions */}
        <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between gap-3 shrink-0">
          {user.isActive !== false ? (
            <button
              onClick={() => openStatusModal(selectedAdmin, 'disable')}
              className="flex-1 py-2 px-3 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
            >
              <UserX className="size-3.5" />
              <span>Disable Access</span>
            </button>
          ) : (
            <button
              onClick={() => openStatusModal(selectedAdmin, 'enable')}
              className="flex-1 py-2 px-3 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
            >
              <UserCheck className="size-3.5" />
              <span>Enable Access</span>
            </button>
          )}

          <button
            onClick={closeAdminDetails}
            className="flex-1 py-2 px-3 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  )
}
