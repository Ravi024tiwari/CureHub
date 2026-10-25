import type { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, Phone, ChevronRight, Stethoscope, CheckCircle2 } from 'lucide-react'

interface DoctorNextAppointmentCardProps {
  appointment?: {
    _id: string
    appointmentNumber: string
    date: string
    startTime: string
    endTime: string
    symptoms?: string
    consultationFee: number
    patientId: {
      _id: string
      name: string
      email: string
      phoneNumber?: string
      avatar?: string
    }
  } | null
}

export const DoctorNextAppointmentCard: FC<DoctorNextAppointmentCardProps> = ({
  appointment,
}) => {
  const navigate = useNavigate()

  if (!appointment) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Clock className="size-4.5 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900">Next OPD Patient</h3>
            <p className="text-[11px] text-slate-400 font-medium">Upcoming in-clinic appointment</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/70 text-center space-y-2">
          <div className="size-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="size-5" />
          </div>
          <p className="text-xs font-bold text-slate-700">No Pending OPD Patients Today</p>
          <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
            All appointments for today have been treated or there are no further bookings scheduled.
          </p>
          <button
            type="button"
            onClick={() => navigate('/doctor/appointments')}
            className="mt-2 text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <span>View All Appointments</span>
            <ChevronRight className="size-3" />
          </button>
        </div>
      </div>
    )
  }

  const patient = appointment.patientId
  const patientName = patient?.name || 'Walk-in Patient'

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Clock className="size-4.5 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900">Next OPD Patient</h3>
            <p className="text-[11px] text-slate-400 font-medium">Scheduled for in-clinic visit</p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200/60 font-black text-xs">
          {appointment.startTime} - {appointment.endTime}
        </span>
      </div>

      {/* Patient Card */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-xl overflow-hidden bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm shrink-0 border border-slate-200/80">
            {patient?.avatar ? (
              <img src={patient.avatar} alt={patientName} className="size-full object-cover" />
            ) : (
              <span>{patientName.charAt(0) || 'P'}</span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-black text-slate-900 truncate">{patientName}</h4>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium mt-0.5">
              {patient?.phoneNumber && (
                <span className="flex items-center gap-1">
                  <Phone className="size-3 text-slate-400" />
                  <span>{patient.phoneNumber}</span>
                </span>
              )}
              <span>• Reg: {appointment.appointmentNumber}</span>
            </div>
          </div>
        </div>

        {appointment.symptoms && (
          <div className="pt-2 border-t border-slate-200/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Reported Symptoms:
            </span>
            <p className="text-xs text-slate-700 font-medium mt-0.5 line-clamp-2">
              {appointment.symptoms}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-1 flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/doctor/prescriptions')}
            className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-sm shadow-blue-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Stethoscope className="size-3.5" />
            <span>Start OPD Consultation</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/doctor/appointments')}
            className="py-2 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs transition-colors cursor-pointer"
          >
            Details
          </button>
        </div>
      </div>
    </div>
  )
}

export default DoctorNextAppointmentCard
