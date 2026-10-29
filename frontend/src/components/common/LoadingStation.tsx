import { type FC } from 'react'

interface LoadingStationProps {
  title?: string
  subtitle?: string
  badgeText?: string
  progress?: {
    current: number
    total: number
  }
  variant?: 'card' | 'pill' | 'banner'
  className?: string
}

export const LoadingStation: FC<LoadingStationProps> = ({
  title = 'Loading more hospitals...',
  subtitle = 'Retrieving real-time hospital facilities from database',
  badgeText = 'Syncing',
  progress,
  variant = 'pill',
  className = '',
}) => {
  if (variant === 'pill') {
    return (
      <div className={`py-4 flex flex-col items-center justify-center animate-in fade-in duration-300 ${className}`}>
        <div className="inline-flex items-center gap-3.5 px-5 py-3 rounded-2xl bg-white border border-blue-100 shadow-md shadow-blue-500/5 hover:border-blue-200 transition-all select-none">
          {/* Dual-ring High-Tech Spinner */}
          <div className="relative size-6 flex items-center justify-center shrink-0">
            <div className="size-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <div className="absolute size-2 rounded-full bg-blue-600 animate-pulse" />
          </div>

          {/* Text and live badge */}
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">
                {title}
              </span>
              {badgeText && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200/80">
                  {badgeText}
                </span>
              )}
            </div>
            {subtitle && (
              <span className="text-[11px] font-semibold text-slate-500 leading-tight mt-0.5">
                {subtitle}
              </span>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Card Variant
  return (
    <div
      className={`bg-gradient-to-b from-blue-50/40 via-white to-slate-50/60 rounded-3xl p-6 sm:p-8 border border-blue-100 shadow-sm max-w-lg mx-auto text-center space-y-4 animate-in fade-in duration-300 ${className}`}
    >
      <div className="relative size-14 mx-auto flex items-center justify-center">
        {/* Animated halo pulses */}
        <div className="absolute inset-0 rounded-full bg-blue-500/10 animate-ping" />
        <div className="size-12 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin flex items-center justify-center" />
        <div className="absolute size-3.5 rounded-full bg-blue-600 shadow-xs" />
      </div>

      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/70 text-blue-800 text-[11px] font-extrabold tracking-wide uppercase">
          <span className="size-1.5 rounded-full bg-blue-600 animate-pulse" />
          <span>{badgeText}</span>
        </div>
        <h4 className="text-base font-extrabold text-slate-900">{title}</h4>
        {subtitle && <p className="text-xs text-slate-500 max-w-xs mx-auto">{subtitle}</p>}
      </div>

      {progress && progress.total > 0 && (
        <div className="space-y-1.5 max-w-xs mx-auto pt-2">
          <div className="flex justify-between text-xs font-bold text-slate-600 px-1">
            <span>Directory Progress</span>
            <span>
              {progress.current} / {progress.total}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.round((progress.current / progress.total) * 100))}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default LoadingStation

