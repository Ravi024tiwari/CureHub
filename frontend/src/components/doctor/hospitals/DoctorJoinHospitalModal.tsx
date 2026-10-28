import React, { useState, useEffect } from 'react';
import { X, Building2, MapPin, AlertCircle, Send, Loader2 } from 'lucide-react';
import type { DoctorHospitalItem } from '@/types/doctorHospital';
import { doctorService } from '@/services/doctorService';

interface DoctorJoinHospitalModalProps {
  hospital: DoctorHospitalItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (hospitalId: string, department: string) => void;
  defaultDepartment?: string;
}

export const DoctorJoinHospitalModal: React.FC<DoctorJoinHospitalModalProps> = ({
  hospital,
  isOpen,
  onClose,
  onSuccess,
  defaultDepartment = '',
}) => {
  const [department, setDepartment] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hospital) {
      setError(null);
      const depts = hospital.departments || [];
      // Auto-select department if doctor's profile department is in hospital departments
      const matchedDept = depts.find(
        (d) => d && defaultDepartment && d.toLowerCase() === defaultDepartment.toLowerCase()
      );
      if (matchedDept) {
        setDepartment(matchedDept);
      } else if (depts.length > 0) {
        setDepartment(depts[0]);
      } else {
        setDepartment('');
      }

      setMessage(
        defaultDepartment
          ? `I would like to join your hospital as a ${defaultDepartment} specialist. I am interested in contributing to your healthcare team.`
          : 'I would like to request affiliation with your hospital to provide patient care and consultations.'
      );
    }
  }, [hospital, defaultDepartment]);

  if (!isOpen || !hospital) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!department) {
      setError('Please select a department to proceed with your request.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await doctorService.sendHospitalJoinRequest(hospital._id, department, message.trim());
      onSuccess(hospital._id, department);
      onClose();
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to submit join request';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const addressText = hospital.address
    ? `${hospital.address.city || ''}, ${hospital.address.state || ''}`.replace(/^,\s*|,\s*$/g, '')
    : '';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="relative bg-white rounded-2xl md:rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">Request to Join Hospital</h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Hospital Preview Mini-Card */}
          <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0">
              {hospital.images && hospital.images.length > 0 ? (
                <img
                  src={hospital.images[0]}
                  alt={hospital.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-500">
                  <Building2 className="w-7 h-7" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold text-slate-900 truncate">{hospital.name}</h4>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="truncate">{addressText || 'Location not specified'}</span>
                {hospital.distanceKm !== undefined && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="text-blue-600 font-medium">{hospital.distanceKm} km</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Info Notice Box */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-50/80 border border-blue-100 text-blue-900">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed text-blue-800">
              Your request will be sent to the hospital administrator. Once approved, you will be able to manage your availability, schedule consultations, and accept appointments from this hospital.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Department Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Department <span className="text-red-500">*</span>
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 font-medium"
            >
              {(!hospital.departments || hospital.departments.length === 0) ? (
                <option value="">No departments listed</option>
              ) : (
                hospital.departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Message Area */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Message <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write a brief note introducing your medical specialization or experience..."
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 placeholder-slate-400 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !department}
              className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
