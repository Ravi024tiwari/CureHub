import { type FC } from 'react'
import { X, Eye } from 'lucide-react'
import { HospitalPreviewCard } from './HospitalPreviewCard'
import type { AddHospitalFormData } from '@/types/hospitalAdmin'

interface MobilePreviewDrawerProps {
  isOpen: boolean
  onClose: () => void
  data: AddHospitalFormData
}

export const MobilePreviewDrawer: FC<MobilePreviewDrawerProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center lg:hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity cursor-pointer"
      />

      {/* Sheet Content */}
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[85vh] overflow-y-auto shadow-2xl z-10 p-4 border border-slate-200 animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4 sticky top-0 bg-white/95 backdrop-blur-xs z-10">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <Eye className="size-4" />
            </div>
            <span className="font-extrabold text-sm text-slate-900">Hospital Live Preview</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        <HospitalPreviewCard data={data} isFloatingDrawer={true} />
      </div>
    </div>
  )
}
export default MobilePreviewDrawer
