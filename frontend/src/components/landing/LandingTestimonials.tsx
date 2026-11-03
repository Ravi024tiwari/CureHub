import { type FC } from 'react'
import { Star, ShieldCheck, Quote, Sparkles, CheckCircle2 } from 'lucide-react'

export const LandingTestimonials: FC = () => {
  const testimonials = [
    {
      name: 'Amitesh K. Roy',
      city: 'Bilaspur, CG',
      role: 'Verified Patient',
      specialty: 'Consulted Cardiology OPD',
      doctor: 'Dr. Priya Sharma',
      rating: 5,
      content:
        'Saved over 3 hours of physical OPD waiting for my father. The live queue tracker told us exactly when to enter the doctor consultation chamber. Absolute game changer for hospital visits.',
    },
    {
      name: 'Neha Verma',
      city: 'Raipur, CG',
      role: 'Verified Patient',
      specialty: 'Dermatology Consultation',
      doctor: 'Dr. Sneha Patel',
      rating: 5,
      content:
        'Dr. Sneha was so patient and detailed. All my prescriptions and lab test recommendations were instantly saved in my digital medical records locker. Highly recommended!',
    },
    {
      name: 'Rahul Sen Gupta',
      city: 'New Delhi, NCR',
      role: 'Verified Patient',
      specialty: 'Orthopedics & Spine Care',
      doctor: 'Dr. Amit Singh',
      rating: 5,
      content:
        'When the doctor had to take emergency surgery leave, CarePlus notified me over WhatsApp and in-app with an instant priority reschedule link. Zero stress or wasted travel.',
    },
  ]

  const trustBadges = [
    'National Health Authority (NHA) Integrated',
    'ISO 27001 Encrypted Patient Data',
    'NABH Accredited Hospital Partners',
    '100% Board-Certified Physicians',
  ]

  return (
    <section className="py-20 sm:py-28 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-black">
            <Sparkles className="size-3.5 text-blue-600" />
            <span>Trusted By 100,000+ Families</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Patient Stories & Healing Journeys
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
            Discover why thousands of patients trust CarePlus for reliable specialist access, zero-waiting hospital visits, and compassionate care.
          </p>
        </div>

        {/* Testimonials 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-50/70 hover:bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 hover:border-blue-300 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                {/* Rating & Quote */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <Quote className="size-6 text-blue-200 group-hover:text-blue-400 transition-colors" />
                </div>

                <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed italic">
                  "{item.content}"
                </p>
              </div>

              {/* Patient Attribution */}
              <div className="pt-5 mt-4 border-t border-slate-200/60 flex items-center gap-3">
                <div className="size-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                  {item.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-black text-slate-900 truncate">{item.name}</h4>
                    <ShieldCheck className="size-3.5 text-blue-600 shrink-0" />
                  </div>
                  <p className="text-[11px] font-semibold text-slate-400 truncate">
                    {item.specialty} • {item.city}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Security & Trust Assurance Strip */}
        <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/60 border border-blue-100 flex flex-wrap items-center justify-around gap-4 text-xs font-bold text-slate-700">
          {trustBadges.map((badge, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-blue-600 shrink-0" />
              <span>{badge}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
