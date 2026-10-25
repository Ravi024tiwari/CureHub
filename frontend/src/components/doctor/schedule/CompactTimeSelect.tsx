import { useState, useRef, useEffect, type FC } from 'react'
import { ChevronDown } from 'lucide-react'

export interface TimeOption {
  value: string
  label: string
}

export const TIME_OPTIONS: TimeOption[] = [
  { value: '07:00', label: '07:00 AM' },
  { value: '07:30', label: '07:30 AM' },
  { value: '08:00', label: '08:00 AM' },
  { value: '08:30', label: '08:30 AM' },
  { value: '09:00', label: '09:00 AM' },
  { value: '09:30', label: '09:30 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '10:30', label: '10:30 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '11:30', label: '11:30 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '12:30', label: '12:30 PM' },
  { value: '13:00', label: '01:00 PM' },
  { value: '13:30', label: '01:30 PM' },
  { value: '14:00', label: '02:00 PM' },
  { value: '14:30', label: '02:30 PM' },
  { value: '15:00', label: '03:00 PM' },
  { value: '15:30', label: '03:30 PM' },
  { value: '16:00', label: '04:00 PM' },
  { value: '16:30', label: '04:30 PM' },
  { value: '17:00', label: '05:00 PM' },
  { value: '17:30', label: '05:30 PM' },
  { value: '18:00', label: '06:00 PM' },
  { value: '18:30', label: '06:30 PM' },
  { value: '19:00', label: '07:00 PM' },
  { value: '19:30', label: '07:30 PM' },
  { value: '20:00', label: '08:00 PM' },
  { value: '20:30', label: '08:30 PM' },
  { value: '21:00', label: '09:00 PM' },
  { value: '21:30', label: '09:30 PM' },
  { value: '22:00', label: '10:00 PM' },
]

interface CompactTimeSelectProps {
  value: string
  onChange: (val: string) => void
  disabled?: boolean
  className?: string
}

export const CompactTimeSelect: FC<CompactTimeSelectProps> = ({
  value,
  onChange,
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const activeItemRef = useRef<HTMLButtonElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Auto-scroll to selected time when dropdown opens
  useEffect(() => {
    if (isOpen && activeItemRef.current) {
      activeItemRef.current.scrollIntoView({ block: 'nearest' })
    }
  }, [isOpen])

  const currentLabel = TIME_OPTIONS.find((t) => t.value === value)?.label || value

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-8 px-2 rounded-xl border border-slate-200 hover:border-blue-400 bg-white text-[11px] font-black text-slate-800 flex items-center justify-between gap-1 shadow-2xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50/60 active:scale-[0.98]"
      >
        <span className="truncate whitespace-nowrap">{currentLabel}</span>
        <ChevronDown
          className={`size-3 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-blue-600' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 z-50 w-28 max-h-44 overflow-y-auto overscroll-contain rounded-2xl bg-white border border-slate-200/90 shadow-2xl p-1 space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
          {TIME_OPTIONS.map((t) => {
            const isSelected = t.value === value
            return (
              <button
                key={t.value}
                ref={isSelected ? activeItemRef : undefined}
                type="button"
                onClick={() => {
                  onChange(t.value)
                  setIsOpen(false)
                }}
                className={`w-full text-center px-2 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white font-black shadow-xs'
                    : 'text-slate-700 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                {t.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
