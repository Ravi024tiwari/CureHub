import { type FC } from 'react'
import { Search, ShieldCheck, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import doctorImage from '@/assets/dr-priya-sharma.jpg'

interface PatientHeroBannerProps {
  patientName: string
  searchQuery: string
  onSearchChange: (q: string) => void
  onSearchSubmit: () => void
  selectedCity: string
}

export const PatientHeroBanner: FC<PatientHeroBannerProps> = ({
  patientName,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  selectedCity,
}) => {
  const shortCity = selectedCity.split(',')[0] || 'Bilaspur'

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-50/90 via-sky-50/70 to-indigo-50/80 border border-blue-100/80 p-6 sm:p-8 lg:p-10 shadow-sm">
      {/* Background soft glow circles */}
      <div className="absolute top-0 right-1/4 -mt-12 size-64 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-12 size-56 bg-sky-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
        {/* Left Column: Greeting, Big Headline, Subtitle, Search bar */}
        <div className="w-full lg:max-w-3xl xl:max-w-4xl space-y-4">
          {/* Greeting */}
          <div className="inline-flex items-center gap-2">
            <span className="text-xs sm:text-sm font-semibold text-slate-600">
              Welcome back, {patientName}! 👋
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
            Your Health, <span className="text-blue-600">Our Priority</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
            Find trusted hospitals, book appointments with top doctors, explore services and manage
            your health — all in one place.
          </p>

          {/* Integrated Search Bar inside Hero */}
          <div className="pt-2">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                onSearchSubmit()
              }}
              className="bg-white p-2 rounded-2xl shadow-lg shadow-blue-900/5 border border-slate-200/90 flex flex-col sm:flex-row items-center gap-2 sm:gap-3"
            >
              {/* Doctor / Hospital / Specialty Input */}
              <div className="relative flex-1 w-full flex items-center">
                <Search className="size-4 text-slate-400 shrink-0 ml-3 mr-2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search doctors, hospitals, services or specialties..."
                  className="w-full py-2 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
                />
              </div>

              {/* City Tag on Desktop */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-700 shrink-0">
                <MapPin className="size-3.5 text-blue-600" />
                <span>{shortCity}</span>
              </div>

              {/* Submit Search Button */}
              <Button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-500/20 cursor-pointer transition-all"
              >
                Search
              </Button>
            </form>
          </div>
        </div>

        {/* Right Column: Hero Doctor Visual with Trust Badge */}
        <div className="relative shrink-0 hidden sm:block lg:w-72">
          {/* Floating Trust Badge */}
          <div className="absolute -top-2 -left-6 z-20 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-slate-100 flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="size-4.5 stroke-[2.2]" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium">Trusted by</p>
              <p className="text-xs font-bold text-slate-900">10,000+ Patients</p>
            </div>
          </div>

          {/* Doctor Portrait Image */}
          <div className="relative size-56 sm:size-64 lg:size-72 rounded-full overflow-hidden ring-8 ring-white/80 shadow-2xl shadow-blue-900/10 mx-auto">
            <img
              src={doctorImage}
              alt="CarePlus Medical Specialist"
              className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
