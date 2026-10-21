import { type FC } from 'react'
import {
  Building2,
  Stethoscope,
  Calendar,
  Users,
  UserCheck,
  IndianRupee,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { useHospitalAdminStore } from '@/store/hospitalAdminStore'

export const KpiMetricsGrid: FC = () => {
  const { kpis } = useHospitalAdminStore()

  // Format Indian currency in Lakhs (L)
  const formatRevenue = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`
    }
    return `₹${amount.toLocaleString('en-IN')}`
  }

  const cards = [
    {
      id: 'hospitals',
      title: 'Total Hospitals',
      value: kpis.totalHospitals.toString(),
      trend: kpis.hospitalsTrend || '+1 from last month',
      isPositive: true,
      icon: Building2,
      iconBg: 'bg-blue-50 text-blue-600',
    },
    {
      id: 'doctors',
      title: 'Total Doctors',
      value: kpis.totalDoctors.toString(),
      trend: kpis.doctorsTrend || '+6 from last month',
      isPositive: true,
      icon: Stethoscope,
      iconBg: 'bg-cyan-50 text-cyan-600',
    },
    {
      id: 'appointments',
      title: 'Total Appointments',
      value: kpis.totalAppointments.toLocaleString('en-IN'),
      trend: kpis.appointmentsTrend || '+12% from last month',
      isPositive: true,
      icon: Calendar,
      iconBg: 'bg-purple-50 text-purple-600',
    },
    {
      id: 'patients',
      title: 'Active Patients',
      value: kpis.activePatients.toLocaleString('en-IN'),
      trend: kpis.patientsTrend || '+18% from last month',
      isPositive: true,
      icon: Users,
      iconBg: 'bg-indigo-50 text-indigo-600',
    },
    {
      id: 'requests',
      title: 'Pending Join Requests',
      value: kpis.pendingJoinRequests.toString(),
      trend: kpis.requestsTrend || '-5 from last week',
      isPositive: false, // decreasing pending queue is positive or highlighted amber
      icon: UserCheck,
      iconBg: 'bg-amber-50 text-amber-600',
    },
    {
      id: 'revenue',
      title: 'Total Revenue',
      value: formatRevenue(kpis.totalRevenue),
      trend: kpis.revenueTrend || '+22% from last month',
      isPositive: true,
      icon: IndianRupee,
      iconBg: 'bg-emerald-50 text-emerald-600',
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        const TrendIcon = card.isPositive ? ArrowUpRight : ArrowDownRight

        return (
          <div
            key={card.id}
            className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-4.5 shadow-2xs hover:shadow-md hover:border-slate-300/80 transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] sm:text-xs font-bold text-slate-500 truncate leading-snug">
                {card.title}
              </span>
              <div
                className={`size-8 rounded-xl ${card.iconBg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}
              >
                <Icon className="size-4 stroke-[2.2]" />
              </div>
            </div>

            <div className="my-1">
              <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight block">
                {card.value}
              </span>
            </div>

            <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold mt-1">
              <TrendIcon
                className={`size-3 stroke-[2.5] ${
                  card.isPositive ? 'text-emerald-600' : 'text-amber-600'
                }`}
              />
              <span
                className={`${card.isPositive ? 'text-emerald-600' : 'text-amber-600'} truncate`}
              >
                {card.trend}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
