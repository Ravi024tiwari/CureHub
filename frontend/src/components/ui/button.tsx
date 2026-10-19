import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200 outline-none select-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer focus-visible:ring-4 focus-visible:ring-blue-100",
  {
    variants: {
      variant: {
        default:
          "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20 active:scale-[0.99]",
        brand:
          "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-600/25 active:scale-[0.99]",
        outline:
          "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-sm active:scale-[0.99]",
        secondary:
          "bg-slate-100 text-slate-800 hover:bg-slate-200 active:scale-[0.99]",
        ghost:
          "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 shadow-sm active:scale-[0.99]",
        link:
          "text-blue-600 underline-offset-4 hover:underline p-0 h-auto font-semibold",
      },
      size: {
        default: "h-10 px-4 py-2 text-sm rounded-xl",
        sm: "h-8 px-3 text-xs rounded-lg",
        lg: "h-11 px-6 text-sm font-semibold rounded-xl",
        xl: "h-12 px-8 text-base font-semibold rounded-xl",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
