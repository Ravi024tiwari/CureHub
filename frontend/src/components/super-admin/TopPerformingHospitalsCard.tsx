import { type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, ChevronRight, Building2 } from 'lucide-react'
import { useSuperAdminStore } from '@/store/superAdminStore'

export const TopPerformingHospitalsCard: FC = () => {
  const navigate = useNavigate()
  const { topHospitals } = useSuperAdminStore()

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
      {/* Card Header with View All */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
            Top Performing Hospitals
          </h3>
          <p className="text-[11px] text-slate-400 font-medium">
            Ranked by consultations volume and patient ratings
          </p>
        </div>

        <button
          onClick={() => navigate('/super-admin/hospitals')}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-0.5 cursor-pointer"
        >
          <span>View All</span>
          <ChevronRight className="size-3.5" />
        </button>
      </div>

      {/* Hospital Ranking Items */}
      <div className="space-y-3 divide-y divide-slate-100">
        {topHospitals.map((hosp, idx) => (
          <div
            key={hosp.id}
            onClick={() => navigate('/super-admin/hospitals')}
            className={`pt-2.5 first:pt-0 flex items-center justify-between gap-3 group cursor-pointer hover:bg-slate-50/60 p-1.5 rounded-xl transition-colors`}
          >
            {/* Left: Rank Badge + Photo + Name & City */}
            <div className="flex items-center gap-3 min-w-0">
              <span className="size-5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black flex items-center justify-center shrink-0">
                {idx + 1}
              </span>

              <div className="size-10 sm:size-11 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/70 shadow-2xs">
                {hosp.image ? (
                  <img
                    src={hosp.image}
                    alt={hosp.name}
                    className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="size-full flex items-center justify-center text-blue-600 bg-blue-50">
                    <Building2 className="size-5" />
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                  {hosp.name}
                </h4>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {hosp.city}
                </p>
              </div>
            </div>

            {/* Right: Rating Star + Appointments Count Badge */}
            <div className="text-right shrink-0">
              <div className="flex items-center justify-end gap-1 text-xs font-black text-slate-800">
                <Star className="size-3.5 fill-amber-400 text-amber-400" />
                <span>{hosp.rating.toFixed(1)}</span>
              </div>
              <span className="text-[11px] font-bold text-slate-500 block mt-0.5">
                {hosp.appointmentsCount.toLocaleString()} <span className="font-normal text-slate-400">Appts</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TopPerformingHospitalsCard
