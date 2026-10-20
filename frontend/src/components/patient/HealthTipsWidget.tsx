import { useState, type FC } from 'react'
import hydrationImage from '@/assets/hydration-tip.jpg'
import { Sparkles, Calendar, Plus, Minus, X, Droplets } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const HealthTipsWidget: FC = () => {
  const [isOpenModal, setIsOpenModal] = useState(false)
  const [waterGlasses, setWaterGlasses] = useState(5)

  return (
    <>
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">Health Tips</h3>

        <div
          onClick={() => setIsOpenModal(true)}
          className="relative overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-r from-blue-50/70 to-sky-50/70 p-4 flex items-center justify-between gap-3 cursor-pointer group hover:border-blue-200 hover:shadow-xs transition-all"
        >
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
              Stay Hydrated for <br />
              Better Health
            </h4>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <Calendar className="size-3 text-slate-400" />
              <span>12 Oct 2026</span>
            </div>
          </div>

          <div className="size-16 rounded-xl overflow-hidden shrink-0 shadow-xs ring-2 ring-white">
            <img
              src={hydrationImage}
              alt="Stay Hydrated"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </div>
        </div>
      </div>

      {/* Health Tip Interactive Modal */}
      {isOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 text-blue-600">
                <Sparkles className="size-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Health Tip of the Day</span>
              </div>
              <button
                onClick={() => setIsOpenModal(false)}
                className="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="h-44 rounded-2xl overflow-hidden">
              <img
                src={hydrationImage}
                alt="Hydration"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-extrabold text-slate-900">
                Stay Hydrated for Better Health
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Drinking at least 8 to 10 glasses of water each day improves focus, optimizes kidney
                filtration, keeps skin vibrant, and regulates your body temperature.
              </p>
            </div>

            {/* Interactive Daily Water Tracker */}
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <Droplets className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Today's Water Intake</p>
                  <p className="text-[11px] text-blue-700 font-semibold">{waterGlasses} of 8 glasses logged</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setWaterGlasses(Math.max(0, waterGlasses - 1))}
                  className="size-7 rounded-lg bg-white border border-blue-200 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
                >
                  <Minus className="size-3.5" />
                </button>
                <span className="text-sm font-extrabold text-slate-900 w-6 text-center">
                  {waterGlasses}
                </span>
                <button
                  onClick={() => setWaterGlasses(waterGlasses + 1)}
                  className="size-7 rounded-lg bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>
            </div>

            <Button
              onClick={() => setIsOpenModal(false)}
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs"
            >
              Done Reading
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
