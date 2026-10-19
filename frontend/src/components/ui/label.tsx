import * as React from "react"
import { cn } from "@/lib/utils"

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

function Label({ className, required, children, ...props }: LabelProps) {
  return (
    <label
      data-slot="label"
      className={cn(
        "text-xs font-semibold tracking-wide text-slate-700 select-none flex items-center gap-1",
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-red-500 font-bold">*</span>}
    </label>
  )
}

export { Label }
