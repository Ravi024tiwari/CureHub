import type { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, ChevronRight, FileText, Calendar } from 'lucide-react'

interface ConsultationItem {
  _id: string
  appointmentNumber: string
  date: string
  startTime: string
  endTime: string
  symptoms?: string
  consultationFee: number
  status: string
  patientId: {
    _id: string
    name: string
    email: string
    phoneNumber?: string
    avatar?: string
  }
}

interface DoctorRecentConsultationsProps {
  consultations?: ConsultationItem[]
}

export const DoctorRecentConsultations: FC<DoctorRecentConsultationsProps> = ({
  consultations = [],
}) => {
  const navigate = useNavigate()

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="size-4.5 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900">
              Recent OPD Consultations
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              Physical in-clinic treated patients
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/doctor/appointments')}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>View All</span>
          <ChevronRight className="size-3.5" />
        </button>
      </div>

      {/* Consultations List */}
      {consultations.length > 0 ? (
        <div className="space-y-2.5">
          {consultations.map((item) => {
            const patient = item.patientId
            const patientName = patient?.name || 'OPD Patient'

            return (
              <div
                key={item._id}
                className="p-3.5 rounded-2xl bg-slate-50/70 hover:bg-slate-50 border border-slate-200/70 transition-all flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-10 rounded-xl overflow-hidden bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200/70">
                    {patient?.avatar ? (
                      <img src={patient.avatar} alt={patientName} className="size-full object-cover" />
                    ) : (
                      <span>{patientName.charAt(0) || 'P'}</span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-black text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                      {patientName}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium truncate mt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="size-2.5 text-slate-400" />
                        <span>{item.date}</span>
                      </span>
                      <span>• {item.startTime}</span>
                      {item.symptoms && <span className="truncate">• {item.symptoms}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[10px] font-black">
                    Treated
                  </span>

                  <button
                    type="button"
                    onClick={() => navigate('/doctor/prescriptions')}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-white border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                    title="View Prescription"
                  >
                    <FileText className="size-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-1.5">
          <p className="text-xs font-bold text-slate-600">No Treated Consultations Yet</p>
          <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
            Once you complete in-clinic consultations and issue digital prescriptions, they will appear here.
          </p>
        </div>
      )}
    </div>
  )
}

export default DoctorRecentConsultations
