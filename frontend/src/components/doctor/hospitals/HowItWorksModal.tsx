import React from 'react';
import { X, Search, FileCheck2, CalendarCheck2, ShieldCheck } from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const steps = [
    {
      step: '01',
      title: 'Explore & Discover Hospitals',
      desc: 'Browse through all verified medical facilities registered on the platform. Filter by location, department, hospital type, or bed capacity to find ideal matches.',
      icon: Search,
      color: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      step: '02',
      title: 'Submit Affiliation Request',
      desc: 'Choose your medical department and send a direct join request along with an optional introduction note to the hospital administrator.',
      icon: FileCheck2,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    {
      step: '03',
      title: 'Admin Verification & Approval',
      desc: 'The hospital admin reviews your doctor profile and medical credentials. You will see status updates in real-time right on this portal.',
      icon: ShieldCheck,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    },
    {
      step: '04',
      title: 'Manage Slots & Receive Patients',
      desc: 'Once approved, the hospital is linked to your practice. Set custom consultation timings, accept patient bookings, and manage OPD schedules seamlessly.',
      icon: CalendarCheck2,
      color: 'bg-amber-50 text-amber-600 border-amber-100',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="relative bg-white rounded-2xl md:rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">How Hospital Affiliation Works</h3>
            <p className="text-xs text-slate-500 mt-0.5">Quick guide to expanding your medical practice across registered hospitals</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-start gap-4 p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center border font-bold flex-shrink-0 ${item.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-800">{item.title}</h4>
                    <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">{item.step}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};
