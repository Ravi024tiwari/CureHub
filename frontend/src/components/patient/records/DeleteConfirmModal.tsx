import { type FC } from 'react'
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react'
import { usePatientStore } from '@/store/patientStore'

export const DeleteConfirmModal: FC = () => {
  const {
    isDeleteModalOpen,
    recordToDelete,
    closeDeleteModal,
    deleteReport,
    isDeleting,
  } = usePatientStore()

  if (!isDeleteModalOpen || !recordToDelete) return null

  const handleConfirm = async () => {
    await deleteReport(recordToDelete._id)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-sm my-auto p-6 text-center animate-in zoom-in-95 duration-200">
        <div className="size-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 shadow-sm shadow-rose-500/10">
          <AlertTriangle className="size-7" />
        </div>

        <h3 className="text-base font-extrabold text-slate-900 mb-1">
          Delete Medical Record?
        </h3>
        <p className="text-xs text-slate-500 mb-2 leading-relaxed">
          Are you sure you want to permanently delete:
        </p>
        <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl mb-5">
          <p className="text-xs font-bold text-slate-800 truncate">
            {recordToDelete.title}
          </p>
          <p className="text-[11px] text-slate-400">
            {recordToDelete.category} • {recordToDelete.fileType}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={closeDeleteModal}
            disabled={isDeleting}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-600/25 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {isDeleting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="size-4" />
                <span>Yes, Delete</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
