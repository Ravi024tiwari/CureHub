import { type FC } from 'react'
import { ArrowLeft, ArrowRight, Save, ShieldCheck, Loader2 } from 'lucide-react'

interface HospitalAdminActionBottomBarProps {
  currentStep: number
  totalSteps: number
  onBack: () => void
  onNext: () => void
  onSaveDraft: () => void
  onSubmit: () => void
  isSavingDraft: boolean
  isSubmitting: boolean
  isSubmitDisabled?: boolean
}

export const HospitalAdminActionBottomBar: FC<HospitalAdminActionBottomBarProps> = ({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  onSaveDraft,
  onSubmit,
  isSavingDraft,
  isSubmitting,
  isSubmitDisabled = false,
}) => {
  const isFirstStep = currentStep === 1
  const isLastStep = currentStep === totalSteps

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-4 z-20">
      {/* Left: Save as Draft */}
      <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2">
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={isSavingDraft || isSubmitting}
          className="px-4 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
        >
          {isSavingDraft ? (
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          ) : (
            <Save className="w-4 h-4 text-slate-500" />
          )}
          <span>Save as Draft</span>
        </button>

        {/* Back button (Mobile view left) */}
        {!isFirstStep && (
          <button
            type="button"
            onClick={onBack}
            disabled={isSavingDraft || isSubmitting}
            className="sm:hidden px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        )}
      </div>

      {/* Right: Back & Next/Submit */}
      <div className="w-full sm:w-auto flex items-center justify-end gap-3">
        {/* Back button (Desktop) */}
        {!isFirstStep && (
          <button
            type="button"
            onClick={onBack}
            disabled={isSavingDraft || isSubmitting}
            className="hidden sm:flex px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold items-center gap-2 transition-colors disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        )}

        {isLastStep ? (
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting || isSavingDraft || isSubmitDisabled}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ShieldCheck className="w-4.5 h-4.5" />
            )}
            <span>Submit for Verification</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            disabled={isSavingDraft || isSubmitting}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <span>Next Step</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
