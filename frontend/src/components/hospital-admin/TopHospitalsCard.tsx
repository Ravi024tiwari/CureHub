import { type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, ChevronRight } from 'lucide-react'
import { useHospitalAdminStore } from '@/store/hospitalAdminStore'

export const TopHospitalsCard: FC = () => {
  const navigate = useNavigate()
  const { topHospitals } = useHospitalAdminStore()

  const getOccupancyColor = (rate: number) => {
    if (rate >= 75) return 'bg-emerald-500'
    if (rate >= 60) return 'bg-blue-500'
    return 'bg-amber-500'
  }

  // Display top 4 performing hospitals for the executive summary card (matching mockup)
  const displayHospitals = topHospitals.slice(0, 4)

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-2xs flex flex-col justify-between overflow-hidden h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
            Top Performing Hospitals
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Key operational metrics across active facilities
          </p>
        </div>
        <button
          onClick={() => navigate('/hospital-admin/hospitals')}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer transition-colors shrink-0"
        >
          <span>View All</span>
          <ChevronRight className="size-3.5" />
        </button>
      </div>

      {/* Responsive Table with smooth scroll if constrained */}
      <div className="overflow-x-auto -mx-2 sm:mx-0">
        <table className="w-full text-left text-xs min-w-[420px]">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <th className="pb-3 px-3 whitespace-nowrap">Hospital</th>
              <th className="pb-3 px-2 text-center whitespace-nowrap">Appointments</th>
              <th className="pb-3 px-2 text-center whitespace-nowrap">Patients</th>
              <th className="pb-3 px-2 text-center whitespace-nowrap">Revenue</th>
              <th className="pb-3 px-3 text-right whitespace-nowrap">Occupancy</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-slate-700 font-medium">
            {displayHospitals.map((hosp) => (
              <tr
                key={hosp.id}
                onClick={() => navigate(`/hospital-admin/hospitals`)}
                className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
              >
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Building2 className="size-4 stroke-[2.2]" />
                    </div>
                    <div className="min-w-0 max-w-[150px] sm:max-w-[200px]">
                      <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors block text-xs truncate">
                        {hosp.name}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {hosp.city}
                      </span>
                    </div>
                  </div>
                </td>

                <td className="py-2.5 px-2 text-center font-bold text-slate-800 whitespace-nowrap">
                  {hosp.appointments}
                </td>

                <td className="py-2.5 px-2 text-center font-semibold text-slate-600 whitespace-nowrap">
                  {hosp.patients.toLocaleString('en-IN')}
                </td>

                <td className="py-2.5 px-2 text-center font-bold text-emerald-600 whitespace-nowrap">
                  {hosp.revenueFormatted}
                </td>

                <td className="py-2.5 px-3 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-2">
                    <span className="font-bold text-slate-800 text-[11px]">
                      {hosp.occupancyRate}%
                    </span>
                    <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden shrink-0">
                      <div
                        style={{ width: `${hosp.occupancyRate}%` }}
                        className={`h-full rounded-full ${getOccupancyColor(hosp.occupancyRate)}`}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
export default TopHospitalsCard
