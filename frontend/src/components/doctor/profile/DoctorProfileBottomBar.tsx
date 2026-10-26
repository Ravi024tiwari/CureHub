import React from 'react'
import { Loader2, Check, RefreshCw } from 'lucide-react'

interface DoctorProfileBottomBarProps {
  onDiscard: () => void
  onSaveDraft: () => void
  onUpdateProfile: () => void
  isSaving: boolean
  hasChanges?: boolean
}

export const DoctorProfileBottomBar: React.FC<DoctorProfileBottomBarProps> = ({
  onDiscard,
  onSaveDraft,
  onUpdateProfile,
  isSaving,
  hasChanges = false,
}) => {
  return (
    <div className="sticky bottom-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-3 sm:py-3.5 px-4 sm:px-8 -mx-4 sm:-mx-6 lg:-mx-8 shadow-lg mt-8">
      <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-3">
        {/* Left: Discard Changes */}
        <button
          type="button"
          onClick={onDiscard}
          disabled={isSaving}
          className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-rose-600 hover:text-rose-700 bg-rose-50/60 hover:bg-rose-100/70 border border-rose-200/80 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
        >
          <RefreshCw className="size-3.5" />
          <span>Discard Changes</span>
        </button>

        {/* Right: Save as Draft & Update Profile */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={isSaving}
            className="hidden sm:inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs hover:shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <span>Save as Draft</span>
          </button>

          <button
            type="button"
            onClick={onUpdateProfile}
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-2.5 rounded-xl text-xs sm:text-sm font-black text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 active:scale-98 transition-all cursor-pointer disabled:opacity-60"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <Check className="size-4 stroke-[2.5]" />
                <span>Update Profile</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
