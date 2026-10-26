import { type FC, useState } from 'react'
import { X, Headphones, Mail, Phone, MessageSquare, CheckCircle, Send } from 'lucide-react'

interface SupportContactModalProps {
  isOpen: boolean
  onClose: () => void
}

export const SupportContactModal: FC<SupportContactModalProps> = ({ isOpen, onClose }) => {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [isSent, setIsSent] = useState(false)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSent(true)
    setTimeout(() => {
      setIsSent(false)
      setSubject('')
      setMessage('')
      onClose()
    }, 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center">
              <Headphones className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">CarePlus Admin Support</h3>
              <p className="text-xs text-blue-100">24/7 dedicated assistance for hospital administrators</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Direct channels */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-2">
                <Phone className="w-4 h-4" />
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Phone Support</p>
              <p className="text-xs font-bold text-slate-800 mt-0.5">+91 1800 258 4321</p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center mb-2">
                <Mail className="w-4 h-4" />
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Email Support</p>
              <p className="text-xs font-bold text-slate-800 mt-0.5">admin-help@curehealth.org</p>
            </div>
          </div>

          {/* Quick Message Form */}
          {isSent ? (
            <div className="py-8 text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">Message Received!</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Our support team will get in touch with you shortly on your registered email.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Topic / Issue
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Document verification inquiry or affiliation issue"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Message Details
                </label>
                <textarea
                  required
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue or question..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>Send Support Request</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
