import { useState, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Calendar,
  Phone,
  Building,
  MoreVertical,
  Eye,
  ShieldCheck,
  ShieldAlert,
  Clock,
  UserCheck,
  UserX,
  Copy,
} from 'lucide-react'
import type { HospitalAdminVerificationRecord } from '@/types/superAdmin'
import { useAdminHospitalAdminsStore } from '@/store/adminHospitalAdminsStore'

interface Props {
  hospitalAdmins: HospitalAdminVerificationRecord[]
}

export const AdminHospitalAdminsTableView: FC<Props> = ({ hospitalAdmins }) => {
  const navigate = useNavigate()
  const { openStatusModal } = useAdminHospitalAdminsStore()
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)

  const toggleMenu = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setActiveMenuId((prev) => (prev === id ? null : id))
  }

  const copyToClipboard = (text: string, e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(text)
    setActiveMenuId(null)
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[950px]">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-black uppercase tracking-wider text-slate-500">
              <th className="py-3 px-4 w-12 text-center">#</th>
              <th className="py-3 px-4">Admin Name</th>
              <th className="py-3 px-4">Hospital Name</th>
              <th className="py-3 px-4">Designation</th>
              <th className="py-3 px-4">Contact</th>
              <th className="py-3 px-4">Verified On</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right pr-6">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {hospitalAdmins.map((admin, idx) => {
              const user = admin.userId || ({} as any)
              const hospital: any = admin.hospitalId || {}
              const hospitalName = hospital.name || admin.hospitalName || 'Pending Hospital'
              const hospitalCity =
                hospital.address?.city ||
                (admin.hospitalAddress ? admin.hospitalAddress.split(',')[0] : 'Location N/A')
              const hospitalState =
                hospital.address?.state ||
                (admin.hospitalAddress ? admin.hospitalAddress.split(',')[1] || '' : '')
              const locationStr = [hospitalCity, hospitalState].filter(Boolean).join(', ')

              const isVerified = admin.verificationStatus === 'APPROVED'
              const isPending = admin.verificationStatus === 'PENDING'
              const isRejected = admin.verificationStatus === 'REJECTED'

              const verifiedDate = admin.verifiedAt || admin.createdAt

              return (
                <tr
                  key={admin._id}
                  onClick={() => navigate(`/super-admin/hospital-admins/${admin._id}`)}
                  className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                >
                  {/* # Index */}
                  <td className="py-3.5 px-4 text-center font-bold text-slate-400 text-xs">
                    {idx + 1}
                  </td>

                  {/* Admin Name & Avatar */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="size-9 rounded-full object-cover ring-2 ring-slate-100"
                          />
                        ) : (
                          <div className="size-9 rounded-full bg-linear-to-tr from-blue-600 to-indigo-500 text-white font-black flex items-center justify-center text-xs shadow-2xs">
                            {user.name ? user.name.slice(0, 2).toUpperCase() : 'HA'}
                          </div>
                        )}
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-white ${
                            user.isActive !== false ? 'bg-emerald-500' : 'bg-slate-300'
                          }`}
                          title={user.isActive !== false ? 'Account Active' : 'Account Disabled'}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                          {user.name || 'Unnamed Admin'}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                          {user.email || 'No email provided'}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Hospital Info */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="size-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 border border-slate-200/60">
                        {hospital.images?.coverImage ? (
                          <img
                            src={hospital.images.coverImage}
                            alt={hospitalName}
                            className="size-full rounded-lg object-cover"
                          />
                        ) : (
                          <Building className="size-4 text-slate-500" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-800 truncate">
                          {hospitalName}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium truncate">
                          {locationStr || 'Location unassigned'}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Designation */}
                  <td className="py-3.5 px-4">
                    <span className="inline-block text-slate-700 font-semibold bg-slate-100/80 px-2.5 py-1 rounded-lg text-[11px]">
                      {admin.designation || 'Hospital Administrator'}
                    </span>
                  </td>

                  {/* Contact */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-slate-600 font-medium text-xs whitespace-nowrap">
                      <Phone className="size-3 text-slate-400 shrink-0" />
                      <span>{user.phoneNumber || 'Not provided'}</span>
                    </div>
                  </td>

                  {/* Verified On Date */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-slate-600 font-medium text-xs whitespace-nowrap">
                      <Calendar className="size-3 text-slate-400 shrink-0" />
                      <span>
                        {verifiedDate
                          ? new Date(verifiedDate).toLocaleDateString('en-US', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'N/A'}
                      </span>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4 text-center">
                    {isVerified && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <ShieldCheck className="size-3" />
                        <span>Verified</span>
                      </span>
                    )}
                    {isPending && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="size-3" />
                        <span>Pending</span>
                      </span>
                    )}
                    {isRejected && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <ShieldAlert className="size-3" />
                        <span>Rejected</span>
                      </span>
                    )}
                    {!isVerified && !isPending && !isRejected && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
                        {admin.verificationStatus}
                      </span>
                    )}
                  </td>

                  {/* Actions (View + Menu) */}
                  <td className="py-3.5 px-4 text-right pr-6" onClick={(e) => e.stopPropagation()}>
                    <div className="relative inline-flex items-center gap-1.5">
                      <button
                        onClick={() => navigate(`/super-admin/hospital-admins/${admin._id}`)}
                        className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <Eye className="size-3" />
                        <span>View</span>
                      </button>

                      <div className="relative">
                        <button
                          onClick={(e) => toggleMenu(admin._id, e)}
                          className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                        >
                          <MoreVertical className="size-4" />
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenuId === admin._id && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setActiveMenuId(null)}
                            />
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-200/90 py-1.5 z-50 text-left animate-in fade-in zoom-in-95 duration-100">
                              <button
                                onClick={() => {
                                  navigate(`/super-admin/hospital-admins/${admin._id}`)
                                  setActiveMenuId(null)
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                              >
                                <Eye className="size-3.5 text-slate-400" />
                                <span>View Full Profile</span>
                              </button>

                              {user.email && (
                                <button
                                  onClick={(e) => copyToClipboard(user.email, e)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                                >
                                  <Copy className="size-3.5 text-slate-400" />
                                  <span>Copy Admin Email</span>
                                </button>
                              )}

                              <div className="my-1 border-t border-slate-100" />

                              {user.isActive !== false ? (
                                <button
                                  onClick={() => {
                                    openStatusModal(admin, 'disable')
                                    setActiveMenuId(null)
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 cursor-pointer"
                                >
                                  <UserX className="size-3.5" />
                                  <span>Disable Account</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    openStatusModal(admin, 'enable')
                                    setActiveMenuId(null)
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                                >
                                  <UserCheck className="size-3.5" />
                                  <span>Reactivate Account</span>
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
