import { useState, useRef, useEffect, type FC } from 'react'
import { Search, ShieldCheck, MapPin, ChevronDown, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import doctorImage from '@/assets/dr-priya-sharma.jpg'

interface PatientHeroBannerProps {
  patientName: string
  searchQuery: string
  onSearchChange: (q: string) => void
  onSearchSubmit: () => void
  selectedCity: string
  onSelectCity?: (city: string) => void
}

const POPULAR_CITIES = [
  'All Cities',
  'Bilaspur, Chhattisgarh',
  'Raipur, Chhattisgarh',
  'New Delhi, NCR',
  'Mumbai, Maharashtra',
  'Bengaluru, Karnataka',
  'Hyderabad, Telangana',
  'Pune, Maharashtra',
]

export const PatientHeroBanner: FC<PatientHeroBannerProps> = ({
  patientName,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  selectedCity,
  onSelectCity,
}) => {
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false)
  const [cityFilterInput, setCityFilterInput] = useState('')
  const cityRef = useRef<HTMLDivElement>(null)

  const shortCity = selectedCity === 'All Cities' ? 'All Cities' : selectedCity.split(',')[0]

  // Close city popover on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setIsCityDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredCities = POPULAR_CITIES.filter((c) =>
    c.toLowerCase().includes(cityFilterInput.toLowerCase().trim())
  )

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-50/90 via-sky-50/70 to-indigo-50/80 border border-blue-100/80 p-5 sm:p-8 lg:p-10 shadow-xs">
      {/* Background ambient glow shapes */}
      <div className="absolute top-0 right-1/4 -mt-12 size-64 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-12 size-56 bg-sky-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
        {/* Left Column: Greeting, Big Headline, Subtitle, Search bar */}
        <div className="w-full lg:max-w-2xl xl:max-w-3xl space-y-4">
          {/* Greeting */}
          <div className="inline-flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-slate-700">
              Welcome back, {patientName}! 👋
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
            Your Health, <span className="text-blue-600">Our Priority</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl font-medium">
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
              className="bg-white p-2 rounded-2xl sm:rounded-3xl shadow-lg shadow-blue-900/5 border border-slate-200/90 flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
            >
              {/* Doctor / Hospital / Specialty Input */}
              <div className="relative flex-1 flex items-center min-w-0">
                <Search className="size-4 text-slate-400 shrink-0 ml-3 mr-2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search doctors, hospitals, services or specialties..."
                  className="w-full py-2.5 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => onSearchChange('')}
                    className="p-1 mr-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              {/* Interactive City Selector */}
              <div className="relative" ref={cityRef}>
                <button
                  type="button"
                  onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                  className="w-full sm:w-auto flex items-center justify-between gap-1.5 px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 cursor-pointer transition-colors shrink-0"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="size-3.5 text-blue-600 shrink-0" />
                    <span className="truncate max-w-[120px]">{shortCity}</span>
                  </div>
                  <ChevronDown className="size-3 text-slate-400 shrink-0 ml-1" />
                </button>

                {/* City Dropdown Popover */}
                {isCityDropdownOpen && (
                  <div className="absolute right-0 sm:left-0 top-full mt-2 z-50 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2.5 space-y-2 animate-in fade-in zoom-in-95 duration-150">
                    <div className="relative">
                      <Search className="size-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={cityFilterInput}
                        onChange={(e) => setCityFilterInput(e.target.value)}
                        placeholder="Search city..."
                        className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:bg-white"
                      />
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-0.5 scrollbar-thin">
                      {filteredCities.map((city) => {
                        const isSelected = selectedCity === city
                        return (
                          <button
                            key={city}
                            type="button"
                            onClick={() => {
                              onSelectCity?.(city)
                              setIsCityDropdownOpen(false)
                              setCityFilterInput('')
                            }}
                            className={`w-full px-3 py-2 text-left rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-blue-50 text-blue-700 font-bold'
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span>{city}</span>
                            {isSelected && <Check className="size-3.5 text-blue-600 shrink-0" />}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Search Button */}
              <Button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm shadow-md shadow-blue-500/25 cursor-pointer transition-all active:scale-[0.98]"
              >
                Search
              </Button>
            </form>
          </div>
        </div>

        {/* Right Column: Hero Doctor Visual with Trust Badge */}
        <div className="relative shrink-0 hidden sm:block lg:w-72">
          {/* Floating Trust Badge */}
          <div className="absolute -top-2 -left-6 z-20 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-slate-100 flex items-center gap-2.5 animate-in slide-in-from-top-2 duration-300">
            <div className="size-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="size-4.5 stroke-[2.2]" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium">Trusted by</p>
              <p className="text-xs font-black text-slate-900">10,000+ Patients</p>
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

export default PatientHeroBanner
