import { useEffect, useState, type FC } from 'react'
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  Sparkles,
} from 'lucide-react'
import { useToastStore, type ToastItem, toast } from '@/store/toastStore'

interface SingleToastProps {
  toast: ToastItem
  onClose: (id: string) => void
}

const SingleToastCard: FC<SingleToastProps> = ({ toast: item, onClose }) => {
  const [progress, setProgress] = useState(100)
  const [isPaused, setIsPaused] = useState(false)
  const duration = item.duration || 4000

  useEffect(() => {
    const intervalTime = 30
    const step = (intervalTime / duration) * 100

    const interval = setInterval(() => {
      if (!isPaused) {
        setProgress((prev) => {
          if (prev <= step) {
            clearInterval(interval)
            onClose(item.id)
            return 0
          }
          return prev - step
        })
      }
    }, intervalTime)

    return () => clearInterval(interval)
  }, [item.id, duration, isPaused, onClose])

  const isSuccess = item.type === 'success'
  const isError = item.type === 'error'
  const isWarning = item.type === 'warning'
  const isInfo = item.type === 'info'

  // Refined theme styling matching the CureHealth design system
  const theme = isSuccess
    ? {
        border: 'border-emerald-200/90 shadow-emerald-500/10',
        badgeBg: 'bg-emerald-50 text-emerald-600 border-emerald-200/80',
        aura: 'bg-emerald-400/15',
        progress: 'bg-gradient-to-r from-emerald-500 to-teal-500',
        pillBg: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
        defaultTitle: 'Success',
      }
    : isWarning
    ? {
        border: 'border-amber-200/90 shadow-amber-500/10',
        badgeBg: 'bg-amber-50 text-amber-600 border-amber-200/80',
        aura: 'bg-amber-400/20',
        progress: 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500',
        pillBg: 'bg-amber-50 text-amber-700 border-amber-200/60',
        defaultTitle: 'Attention',
      }
    : isError
    ? {
        border: 'border-rose-200/90 shadow-rose-500/10',
        badgeBg: 'bg-rose-50 text-rose-600 border-rose-200/80',
        aura: 'bg-rose-400/15',
        progress: 'bg-gradient-to-r from-rose-500 to-red-500',
        pillBg: 'bg-rose-50 text-rose-700 border-rose-200/60',
        defaultTitle: 'Error',
      }
    : {
        border: 'border-blue-200/90 shadow-blue-500/10',
        badgeBg: 'bg-blue-50 text-blue-600 border-blue-200/80',
        aura: 'bg-blue-400/15',
        progress: 'bg-gradient-to-r from-blue-500 to-indigo-500',
        pillBg: 'bg-blue-50 text-blue-700 border-blue-200/60',
        defaultTitle: 'Notice',
      }

  return (
    <div
      role="alert"
      aria-live="assertive"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="pointer-events-auto w-full transition-all duration-300 hover:scale-[1.01] hover:-translate-y-0.5 animate-in fade-in slide-in-from-bottom-4 ease-out duration-300"
    >
      <div
        className={`relative overflow-hidden rounded-2xl p-3.5 sm:p-4 bg-white/95 backdrop-blur-xl border shadow-[0_12px_36px_-6px_rgba(15,23,42,0.12),0_4px_14px_rgba(15,23,42,0.05)] transition-all ${theme.border}`}
      >
        {/* Soft atmospheric ambient glow aura */}
        <div
          className={`absolute -top-10 -right-10 size-28 rounded-full blur-2xl opacity-60 pointer-events-none ${theme.aura}`}
        />

        <div className="relative flex items-start gap-3 sm:gap-3.5">
          {/* Status Icon Badge */}
          <div
            className={`size-9 sm:size-10 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs ${theme.badgeBg}`}
          >
            {isSuccess && <CheckCircle2 className="size-5 stroke-[2.4]" />}
            {isWarning && <AlertTriangle className="size-5 stroke-[2.4]" />}
            {isError && <AlertCircle className="size-5 stroke-[2.4]" />}
            {isInfo && <Info className="size-5 stroke-[2.4]" />}
          </div>

          {/* Toast Message & Title */}
          <div className="min-w-0 flex-1 pt-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>{item.title || theme.defaultTitle}</span>
                {isSuccess && <Sparkles className="size-3 text-emerald-500 inline" />}
              </h4>
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5 line-clamp-3">
              {item.message}
            </p>
          </div>

          {/* Dismiss Button */}
          <button
            type="button"
            onClick={() => onClose(item.id)}
            aria-label="Dismiss notification"
            className="size-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            <X className="size-3.5" />
          </button>
        </div>

        {/* Depletion Countdown Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-slate-100 overflow-hidden">
          <div
            className={`h-full transition-all duration-75 ease-linear ${theme.progress}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}

/**
 * Universal Production-Grade Toast Container
 * Positioned in the bottom-right corner to maintain clean header visibility.
 * Fully responsive: expands gracefully on mobile and docks neatly on desktop.
 */
export const ToastContainer: FC = () => {
  const { toasts, removeToast } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div
      aria-label="Notifications"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-[9999] flex flex-col gap-2.5 pointer-events-none w-auto sm:w-[410px] max-w-[94vw]"
    >
      {toasts.map((item) => (
        <SingleToastCard key={item.id} toast={item} onClose={removeToast} />
      ))}
    </div>
  )
}

export { toast }
export default ToastContainer
