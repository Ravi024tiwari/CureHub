import React, { useState, useRef, useEffect } from 'react'
import {
  Building2,
  ChevronDown,
  Search,
  Check,
  MapPin,
  ShieldCheck,
  AlertCircle,
  X,
} from 'lucide-react'
import type { HospitalOption } from '@/types/auth'
import { cn } from '@/lib/utils'

interface HospitalSelectProps {
  hospitals: HospitalOption[]
  selectedHospitalId: string
  onSelect: (hospitalId: string, hospitalName: string) => void
  error?: string
  isLoading?: boolean
}

export const HospitalSelect: React.FC<HospitalSelectProps> = ({
  hospitals,
  selectedHospitalId,
  onSelect,
  error,
  isLoading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Find currently selected hospital
  const selectedHospital = hospitals.find((h) => h._id === selectedHospitalId)

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Helper to extract city/state cleanly
  const getCityState = (hospital: HospitalOption) => {
    const city = hospital.address?.city || hospital.city || ''
    const state = hospital.address?.state || hospital.state || ''
    if (city && state) return `${city}, ${state}`
    return city || state || 'India'
  }

  // Filtered hospitals
  const filteredHospitals = hospitals.filter((h) => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) return true
    const nameMatch = h.name.toLowerCase().includes(query)
    const cityMatch = getCityState(h).toLowerCase().includes(query)
    return nameMatch || cityMatch
  })

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Dropdown Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={cn(
          "flex h-12 w-full items-center justify-between rounded-xl border bg-white px-3.5 py-2 text-left text-sm transition-all duration-200 outline-none cursor-pointer",
          "focus:border-blue-600 focus:ring-4 focus:ring-blue-100",
          error
            ? "border-red-500"
            : isOpen
            ? "border-blue-600 ring-4 ring-blue-100"
            : "border-slate-200 hover:border-slate-300",
          isLoading && "opacity-70 cursor-not-allowed"
        )}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors",
              selectedHospital
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-400"
            )}
          >
            <Building2 className="size-4" />
          </div>

          {selectedHospital ? (
            <div className="truncate">
              <span className="font-semibold text-slate-900 block truncate">
                {selectedHospital.name}
              </span>
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <MapPin className="size-3 text-slate-400" />
                {getCityState(selectedHospital)}
              </span>
            </div>
          ) : (
            <span className="text-slate-400">
              {isLoading
                ? 'Loading registered hospitals...'
                : 'Choose your registered hospital...'}
            </span>
          )}
        </div>

        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-slate-400 transition-transform duration-200",
            isOpen && "rotate-180 text-blue-600"
          )}
        />
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 z-50 mt-1.5 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-blue-900/10 animate-in fade-in zoom-in-95 duration-150">
          {/* Search Box Header */}
          <div className="relative mb-2 px-1">
            <Search className="absolute left-3.5 top-2.5 size-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by hospital name or city..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2 pl-9 pr-8 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Hospitals Count Header */}
          <div className="flex items-center justify-between px-2 pb-1.5 text-[11px] text-slate-400 border-b border-slate-100">
            <span>Registered Partner Hospitals ({hospitals.length})</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <ShieldCheck className="size-3" />
              Verified Only
            </span>
          </div>

          {/* Scrollable Hospitals List */}
          <div className="max-h-56 overflow-y-auto space-y-1 py-1 pr-1 custom-scrollbar">
            {filteredHospitals.length > 0 ? (
              filteredHospitals.map((hospital) => {
                const isSelected = hospital._id === selectedHospitalId
                return (
                  <div
                    key={hospital._id}
                    onClick={() => {
                      onSelect(hospital._id, hospital.name)
                      setIsOpen(false)
                      setSearchQuery('')
                    }}
                    className={cn(
                      "flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all duration-150 text-left",
                      isSelected
                        ? "bg-blue-50 border border-blue-200 text-blue-900"
                        : "hover:bg-slate-50 text-slate-700"
                    )}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div
                        className={cn(
                          "size-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                          isSelected
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-500"
                        )}
                      >
                        <Building2 className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p
                          className={cn(
                            "text-xs font-semibold truncate",
                            isSelected ? "text-blue-900" : "text-slate-900"
                          )}
                        >
                          {hospital.name}
                        </p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="size-3 text-slate-400 shrink-0" />
                          <span className="truncate">
                            {getCityState(hospital)}
                          </span>
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="size-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 ml-2">
                        <Check className="size-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                )
              })
            ) : (
              <div className="py-6 text-center text-xs text-slate-400 space-y-1">
                <AlertCircle className="size-5 mx-auto text-slate-300" />
                <p className="font-medium text-slate-600">
                  {searchQuery
                    ? `No registered hospital matches "${searchQuery}"`
                    : 'No registered hospitals found in system'}
                </p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Only hospitals registered and approved on CarePlus can be affiliated.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-[11px] text-red-500 font-medium mt-1">{error}</p>}
    </div>
  )
}
export default HospitalSelect
