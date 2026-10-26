import { type FC } from 'react'
import { Check } from 'lucide-react'

export interface StepItem {
  id: number
  title: string
  shortTitle: string
}

export const STEPS: StepItem[] = [
  { id: 1, title: 'Basic Information', shortTitle: 'Basic Info' },
  { id: 2, title: 'Hospital Details', shortTitle: 'Hospital' },
  { id: 3, title: 'Identity & Documents', shortTitle: 'Documents' },
  { id: 4, title: 'Qualifications', shortTitle: 'Qualifications' },
  { id: 5, title: 'Review & Submit', shortTitle: 'Review' },
]

interface HospitalAdminStepperProps {
  currentStep: number
  onStepClick: (step: number) => void
  completedSteps?: number[]
}

export const HospitalAdminStepper: FC<HospitalAdminStepperProps> = ({
  currentStep,
  onStepClick,
  completedSteps = [],
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
      {/* Desktop Stepper */}
      <div className="hidden md:flex items-center justify-between relative">
        {STEPS.map((step, idx) => {
          const isCompleted = completedSteps.includes(step.id) || currentStep > step.id
          const isActive = currentStep === step.id
          const isLast = idx === STEPS.length - 1

          return (
            <div key={step.id} className="flex-1 flex items-center relative">
              {/* Step indicator button */}
              <button
                type="button"
                onClick={() => onStepClick(step.id)}
                className="group flex items-center gap-3 relative z-10 focus:outline-none transition-transform hover:scale-[1.02]"
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-xs ${
                    isActive
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-blue-500/20'
                      : isCompleted
                      ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                      : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : step.id}
                </div>

                <div className="text-left">
                  <p
                    className={`text-xs font-semibold tracking-tight transition-colors ${
                      isActive
                        ? 'text-blue-700'
                        : isCompleted
                        ? 'text-slate-800'
                        : 'text-slate-500 group-hover:text-slate-700'
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {isActive ? 'In Progress' : isCompleted ? 'Completed' : `Step ${step.id}`}
                  </p>
                </div>
              </button>

              {/* Connecting line */}
              {!isLast && (
                <div className="flex-1 mx-4 h-0.5 bg-slate-200 overflow-hidden rounded-full">
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

      {/* Mobile Compact Stepper matching the screenshot */}
      <div className="md:hidden flex items-center justify-between gap-1 overflow-x-auto py-1 scrollbar-none">
        {STEPS.map((step) => {
          const isCompleted = completedSteps.includes(step.id) || currentStep > step.id
          const isActive = currentStep === step.id

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onStepClick(step.id)}
              className={`flex flex-col items-center flex-1 min-w-[58px] p-1.5 rounded-xl transition-all ${
                isActive
                  ? 'bg-blue-50/70 text-blue-700'
                  : isCompleted
                  ? 'text-slate-700'
                  : 'text-slate-400'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs mb-1 transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : isCompleted
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.id}
              </div>
              <span className="text-[10px] font-semibold tracking-tight truncate max-w-full text-center">
                {step.shortTitle}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
