import { type FC } from 'react'
import { Check } from 'lucide-react'

export interface StepItem {
  id: number
  key: string
  title: string
}

export const STEPS: StepItem[] = [
  { id: 1, key: 'basic', title: 'Basic Information' },
  { id: 2, key: 'address', title: 'Address & Contact' },
  { id: 3, key: 'departments', title: 'Departments & Facilities' },
  { id: 4, key: 'images', title: 'Images & Documents' },
  { id: 5, key: 'review', title: 'Review & Submit' },
]

interface AddHospitalStepperProps {
  currentStep: number
  onStepClick: (stepId: number) => void
  completedSteps?: number[]
}

export const AddHospitalStepper: FC<AddHospitalStepperProps> = ({
  currentStep,
  onStepClick,
  completedSteps = [],
}) => {
  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-xs">
      {/* Mobile/Tablet Horizontal Scrollable Steps */}
      <div className="flex items-center justify-between overflow-x-auto no-scrollbar gap-2 sm:gap-4 relative">
        {STEPS.map((step, idx) => {
          const isCurrent = currentStep === step.id
          const isCompleted = completedSteps.includes(step.id) || currentStep > step.id

          return (
            <div key={step.id} className="flex items-center flex-1 min-w-max group">
              <button
                type="button"
                onClick={() => onStepClick(step.id)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all cursor-pointer text-left ${
                  isCurrent
                    ? 'bg-blue-50/80 ring-1 ring-blue-600/20'
                    : 'hover:bg-slate-50'
                }`}
              >
                {/* Step Circle Indicator */}
                <div
                  className={`size-7 sm:size-8 rounded-full flex items-center justify-center font-black text-xs transition-all shrink-0 ${
                    isCurrent
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                      : isCompleted
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                  }`}
                >
                  {isCompleted && !isCurrent ? (
                    <Check className="size-4 stroke-[3]" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>

                {/* Step Title Label */}
                <div className="flex flex-col">
                  <span
                    className={`text-xs sm:text-sm font-bold tracking-tight whitespace-nowrap transition-colors ${
                      isCurrent
                        ? 'text-blue-700 font-extrabold'
                        : isCompleted
                        ? 'text-slate-800'
                        : 'text-slate-500 group-hover:text-slate-700'
                    }`}
                  >
                    {step.title}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium hidden sm:block">
                    {isCurrent ? 'In Progress' : isCompleted ? 'Completed' : `Step 0${step.id}`}
                  </span>
                </div>
              </button>

              {/* Connecting line between steps */}
              {idx < STEPS.length - 1 && (
                <div className="hidden md:block flex-1 mx-2 h-0.5 bg-slate-200/80 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      currentStep > step.id ? 'bg-emerald-500 w-full' : 'w-0'
                    }`}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
export default AddHospitalStepper
