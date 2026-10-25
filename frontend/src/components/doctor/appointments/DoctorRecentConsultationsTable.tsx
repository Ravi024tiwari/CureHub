import type { FC } from 'react'
import { CheckCircle2, User, ArrowRight } from 'lucide-react'
import type { DoctorAppointmentItem } from '@/services/doctorService'

interface DoctorRecentConsultationsTableProps {
  recentCompleted: DoctorAppointmentItem[]
  onSelectAppointment: (appt: DoctorAppointmentItem) => void
}

export const DoctorRecentConsultationsTable: FC<DoctorRecentConsultationsTableProps> = ({
  recentCompleted,
  onSelectAppointment,
}) => {
  if (!recentCompleted || recentCompleted.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="size-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
              Recent Completed Consultations
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Audit log of treated OPD visits and issued digital medical prescriptions.
            </p>
          </div>
        </div>

        <span className="text-xs font-bold text-slate-400">
          Last {recentCompleted.length} records
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-black uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3.5 px-5">Token / Date</th>
              <th className="py-3.5 px-5">Patient Name</th>
              <th className="py-3.5 px-5">Symptoms / Diagnosis</th>
              <th className="py-3.5 px-5">OPD Fee</th>
              <th className="py-3.5 px-5">Status</th>
              <th className="py-3.5 px-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {recentCompleted.map((appt) => {
              const patient = appt.patientId
              const isDependent = !!appt.patientDetails?.isDependent
              const displayName = isDependent
                ? appt.patientDetails?.fullName || patient?.name || 'Patient'
                : patient?.name || 'Patient'

              return (
                <tr
                  key={appt._id}
                  onClick={() => onSelectAppointment(appt)}
                  className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                >
                  {/* Token & Date */}
                  <td className="py-3.5 px-5">
                    <span className="font-black text-slate-900 block">
                      #{appt.appointmentNumber || appt._id.slice(-6).toUpperCase()}
                    </span>
                    <span className="text-[11px] text-slate-400 font-semibold block">
                      {appt.date} • {appt.startTime}
                    </span>
                  </td>

                  {/* Patient Info */}
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-2.5">
                      {patient?.avatar ? (
                        <img
                          src={patient.avatar}
                          alt={displayName}
                          className="size-7 rounded-full object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="size-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                          <User className="size-3.5" />
                        </div>
                      )}
                      <div>
                        <span className="font-bold text-slate-800 block">{displayName}</span>
                        {isDependent && (
                          <span className="text-[10px] text-purple-700 font-bold">
                            Dependent ({appt.patientDetails?.relationship})
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Symptoms */}
                  <td className="py-3.5 px-5 max-w-xs">
                    <span className="text-slate-600 font-medium truncate block">
                      {appt.symptoms || 'General Medical Consultation'}
                    </span>
                  </td>

                  {/* Fee */}
                  <td className="py-3.5 px-5">
                    <span className="font-black text-slate-900">
                      ₹{appt.consultationFee || 500}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold block">
                      {appt.paymentStatus}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="size-3 text-emerald-600" />
                      Completed
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-5 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectAppointment(appt)
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer group-hover:bg-blue-600 group-hover:text-white"
                    >
                      <span>View</span>
                      <ArrowRight className="size-3" />
                    </button>
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
