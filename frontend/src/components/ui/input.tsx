import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, startIcon, endIcon, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {startIcon && (
          <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
            {startIcon}
          </div>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            "flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400",
            "transition-all duration-200 outline-none",
            "focus:border-blue-600 focus:ring-4 focus:ring-blue-100",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50",
            startIcon && "pl-10",
            endIcon && "pr-10",
            className
          )}
          {...props}
        />
        {endIcon && (
          <div className="absolute right-3.5 flex items-center text-slate-400">
            {endIcon}
          </div>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
