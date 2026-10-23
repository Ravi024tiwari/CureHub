import { type FC } from 'react'
import {
  Building2,
  Stethoscope,
  Users,
  Calendar,
  IndianRupee,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { useSuperAdminStore } from '@/store/superAdminStore'

export const SuperAdminKpiGrid: FC = () => {
  const { kpis } = useSuperAdminStore()

  const cards = [
    {
      id: 'hospitals',
      label: 'Total Hospitals',
      value: kpis.totalHospitals.toLocaleString(),
      trend: kpis.totalHospitalsTrend,
      isPositive: true,
      delta: kpis.hospitalsMonthDelta,
      icon: Building2,
      iconBg: 'bg-blue-50 text-blue-600',
      borderAccent: 'hover:border-blue-300',
    },
    {
      id: 'doctors',
      label: 'Total Doctors',
      value: kpis.totalDoctors.toLocaleString(),
      trend: kpis.totalDoctorsTrend,
      isPositive: true,
      delta: kpis.doctorsMonthDelta,
      icon: Stethoscope,
      iconBg: 'bg-emerald-50 text-emerald-600',
      borderAccent: 'hover:border-emerald-300',
    },
    {
      id: 'patients',
      label: 'Total Patients',
      value: kpis.totalPatients.toLocaleString(),
      trend: kpis.totalPatientsTrend,
      isPositive: true,
      delta: kpis.patientsMonthDelta,
      icon: Users,
      iconBg: 'bg-purple-50 text-purple-600',
      borderAccent: 'hover:border-purple-300',
    },
    {
      id: 'appointments',
      label: 'Total Appointments',
      value: kpis.totalAppointments.toLocaleString(),
      trend: kpis.totalAppointmentsTrend,
      isPositive: true,
      delta: kpis.appointmentsMonthDelta,
      icon: Calendar,
      iconBg: 'bg-amber-50 text-amber-600',
      borderAccent: 'hover:border-amber-300',
    },
    {
      id: 'revenue',
      label: 'Total Revenue',
      value: kpis.totalRevenueFormatted,
      trend: kpis.totalRevenueTrend,
      isPositive: true,
      delta: kpis.revenueMonthDelta,
      icon: IndianRupee,
      iconBg: 'bg-emerald-50 text-emerald-600',
      borderAccent: 'hover:border-emerald-300',
    },
    {
      id: 'verifications',
      label: 'Pending Verifications',
      value: kpis.pendingVerifications.toLocaleString(),
      trend: kpis.pendingVerificationsTrend,
      isPositive: false,
      delta: kpis.pendingBreakdown,
      icon: ShieldAlert,
      iconBg: 'bg-rose-50 text-rose-600',
      borderAccent: 'hover:border-rose-300',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4.5">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.id}
            className={`bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-2xs hover:shadow-md transition-all group ${card.borderAccent}`}
          >
            <div className="flex items-center justify-between mb-2.5">
              <div
                className={`size-9 sm:size-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${card.iconBg}`}
              >
                <Icon className="size-4.5 sm:size-5 stroke-[2.2]" />
              </div>

              <div
                className={`flex items-center gap-0.5 text-[11px] font-black px-1.5 py-0.5 rounded-md ${
                  card.isPositive
                    ? 'text-emerald-700 bg-emerald-50 border border-emerald-200/60'
                    : 'text-rose-700 bg-rose-50 border border-rose-200/60'
                }`}
              >
                {card.isPositive ? (
                  <ArrowUpRight className="size-3 stroke-[2.5]" />
                ) : (
                  <ArrowDownRight className="size-3 stroke-[2.5]" />
                )}
                <span>{card.trend}</span>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 block tracking-tight">
                {card.label}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight mt-0.5">
                {card.value}
              </h3>
              <p className="text-[10px] sm:text-[11px] font-medium text-slate-400 mt-1 truncate">
                {card.delta}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default SuperAdminKpiGrid
