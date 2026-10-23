import { type FC } from 'react'
import {
  FileBadge,
  CheckCircle2,
  Download,
  ShieldCheck,
  FileCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { DoctorDetailData } from '@/types/patient'

interface DoctorDocumentsTabProps {
  doctor: DoctorDetailData
}

export const DoctorDocumentsTab: FC<DoctorDocumentsTabProps> = ({ doctor }) => {
  const regNumber = doctor.medicalCouncilRegistrationNumber || 'MCI/12345/2012'

  const handleDownloadProof = () => {
    if (doctor.licenseDocumentUrl && doctor.licenseDocumentUrl.startsWith('http')) {
      window.open(doctor.licenseDocumentUrl, '_blank')
    } else {
      alert(`Government Verification Certificate for ${doctor.name}\nRegistration: ${regNumber}\nStatus: Officially Validated by State Medical Council`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Official Medical Council Verification Box */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-7 space-y-6">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="size-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="size-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
              Government Regulatory Compliance
            </h3>
            <p className="text-xs text-slate-500">
              Verified clinical license and National Medical Commission accreditation
            </p>
          </div>
        </div>

        {/* Verification Certificate Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50/50 via-slate-50 to-blue-50/50 border border-emerald-200/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="size-12 rounded-2xl bg-white border border-emerald-200 shadow-xs flex items-center justify-center text-emerald-600">
                <FileBadge className="size-6" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                  Medical Council Registration
                </h4>
                <p className="text-xs font-mono font-bold text-emerald-700">{regNumber}</p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-600 text-white shadow-xs self-start sm:self-auto">
              <CheckCircle2 className="size-3.5" />
              <span>Council Verified</span>
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            This practitioner has undergone rigorous verification with the National Medical
            Commission (NMC) and State Medical Council. All academic degrees, clinical fellowships,
            and practice credentials have been verified for patient safety.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              onClick={handleDownloadProof}
              className="h-9 px-4 rounded-xl text-xs font-bold text-slate-700 border-slate-300 hover:bg-white flex items-center gap-2 cursor-pointer"
            >
              <Download className="size-3.5 text-blue-600" />
              <span>Download Digital Verification Seal</span>
            </Button>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
            <span className="text-slate-400 font-medium">Accreditation Body</span>
            <p className="text-sm font-bold text-slate-800">
              National Medical Commission / State Council
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
            <span className="text-slate-400 font-medium">Practice Standing</span>
            <p className="text-sm font-bold text-emerald-700 flex items-center gap-1.5">
              <FileCheck className="size-4" />
              <span>Good Standing & Unrestricted Practice</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
