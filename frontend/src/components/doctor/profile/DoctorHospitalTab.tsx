import React, { useEffect, useState } from 'react'
import {
  Building2,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Send,
  Search,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { doctorService } from '@/services/doctorService'
import { toast } from '@/store/toastStore'

interface DoctorHospitalTabProps {
  hospitalId?: {
    _id?: string
    name?: string
    address?: string
    contactPhone?: string
    contactEmail?: string
  } | null
  hospitalAffiliationStatus?: string
  doctorDepartment?: string
  onAffiliationUpdated?: () => void
}

export const DoctorHospitalTab: React.FC<DoctorHospitalTabProps> = ({
  hospitalId,
  hospitalAffiliationStatus = 'NOT_AFFILIATED',
  doctorDepartment = 'Cardiology',
  onAffiliationUpdated,
}) => {
  const [availableHospitals, setAvailableHospitals] = useState<any[]>([])
  const [isLoadingHospitals, setIsLoadingHospitals] = useState(false)
  const [selectedHospitalId, setSelectedHospitalId] = useState('')
  const [requestMessage, setRequestMessage] = useState('')
  const [isSendingRequest, setIsSendingRequest] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const loadHospitals = async () => {
      setIsLoadingHospitals(true)
      try {
        const hospitals = await doctorService.getAvailableHospitals()
        setAvailableHospitals(hospitals || [])
      } catch (err) {
        console.warn('Could not load hospitals:', err)
      } finally {
        setIsLoadingHospitals(false)
      }
    }
    loadHospitals()
  }, [])

  const handleSendJoinRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedHospitalId) {
      toast.error('Please select a hospital to affiliate with.')
      return
    }

    setIsSendingRequest(true)
    try {
      await doctorService.sendHospitalJoinRequest(
        selectedHospitalId,
        doctorDepartment,
        requestMessage
      )
      toast.success('Hospital affiliation request sent successfully!')
      if (onAffiliationUpdated) onAffiliationUpdated()
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || 'Failed to send affiliation request'
      )
    } finally {
      setIsSendingRequest(false)
    }
  }

  const isApproved = hospitalAffiliationStatus === 'APPROVED'
  const isPending = hospitalAffiliationStatus === 'PENDING_APPROVAL'

  const filteredHospitals = availableHospitals.filter(
    (h) =>
      h.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.address?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
        <div className="size-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
          <Building2 className="size-4.5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Hospital Affiliation</h3>
          <p className="text-xs text-slate-500">
            Link your doctor profile with accredited multi-specialty hospitals
          </p>
        </div>
      </div>

      {/* Current Affiliation Status Card */}
      <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            Current Status
          </h4>
          {isApproved ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="size-3.5 text-emerald-600" />
              <span>Affiliation Approved</span>
            </span>
          ) : isPending ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
              <Clock className="size-3.5 text-amber-600" />
              <span>Pending Hospital Review</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
              <span>Independent / Not Affiliated</span>
            </span>
          )}
        </div>

        {hospitalId && hospitalId.name ? (
          <div className="pt-2 border-t border-slate-200/60 space-y-1.5">
            <h5 className="text-sm font-bold text-slate-900">{hospitalId.name}</h5>
            {hospitalId.address && (
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <MapPin className="size-3.5 text-slate-400 shrink-0" />
                <span>{hospitalId.address}</span>
              </p>
            )}
            {hospitalId.contactPhone && (
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <Phone className="size-3.5 text-slate-400 shrink-0" />
                <span>{hospitalId.contactPhone}</span>
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-500">
            You are currently practicing independently or your hospital request is in review.
          </p>
        )}
      </div>

      {/* Request Affiliation Form */}
      {!isApproved && (
        <form onSubmit={handleSendJoinRequest} className="space-y-4 pt-2">
          <h4 className="text-xs font-bold text-slate-800">
            Request Affiliation with a Partner Hospital
          </h4>

          {/* Search Box */}
          <div className="relative">
            <Search className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter partner hospitals by name or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Select Hospital <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedHospitalId}
              onChange={(e) => setSelectedHospitalId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            >
              <option value="">Choose Hospital...</option>
              {filteredHospitals.map((h) => (
                <option key={h._id} value={h._id}>
                  {h.name} ({h.city || 'Multispeciality'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Note to Hospital Administration (Optional)
            </label>
            <textarea
              rows={2}
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              placeholder="e.g. Requesting department affiliation for outpatient consultations..."
              className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSendingRequest || !selectedHospitalId}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            {isSendingRequest ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            <span>Send Affiliation Request</span>
          </button>
        </form>
      )}
    </div>
  )
}
