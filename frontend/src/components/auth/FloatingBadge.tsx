import type { FC, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface FloatingBadgeProps {
  className?: string
  children: ReactNode
}

export const FloatingBadge: FC<FloatingBadgeProps> = ({ className, children }) => {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2.5 rounded-2xl bg-white/90 px-3.5 py-2 backdrop-blur-md border border-white/60 shadow-lg shadow-blue-500/10 transition-transform duration-300 hover:scale-105",
        className
      )}
    >
      {children}
    </div>
  )
}
