import { type FC } from 'react'

export const HospitalAdminHeroBanner: FC = () => {
  return (
    <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-semibold mb-3">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            Verification Onboarding
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Complete Your Hospital Admin Profile
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-2.5 leading-relaxed">
            Please provide the following details to request verification from our super admin.
            After verification, you will get full access to the hospital admin dashboard.
          </p>
        </div>

        {/* Hospital Building Vector Graphic matching the mockup */}
        <div className="shrink-0 hidden md:flex items-center justify-center">
          <div className="relative w-48 h-28 flex items-end justify-center">
            {/* Background Clouds */}
            <div className="absolute top-1 left-2 w-12 h-4 bg-sky-100/70 rounded-full blur-[1px]" />
            <div className="absolute top-4 right-4 w-10 h-3 bg-sky-100/70 rounded-full blur-[1px]" />

            {/* Hospital Building SVG */}
            <svg
              className="w-44 h-26 text-blue-600"
              viewBox="0 0 160 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Back foliage / trees */}
              <circle cx="25" cy="70" r="14" fill="#86EFAC" />
              <circle cx="135" cy="70" r="14" fill="#86EFAC" />
              <circle cx="36" cy="65" r="12" fill="#4ADE80" />
              <circle cx="124" cy="65" r="12" fill="#4ADE80" />

              {/* Ground base */}
              <rect x="10" y="86" width="140" height="6" rx="3" fill="#E2E8F0" />

              {/* Side Wing Left */}
              <rect x="30" y="44" width="28" height="42" rx="4" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="2" />
              {/* Left wing windows */}
              <rect x="36" y="52" width="6" height="7" rx="1.5" fill="#93C5FD" />
              <rect x="46" y="52" width="6" height="7" rx="1.5" fill="#93C5FD" />
              <rect x="36" y="66" width="6" height="7" rx="1.5" fill="#93C5FD" />
              <rect x="46" y="66" width="6" height="7" rx="1.5" fill="#93C5FD" />

              {/* Side Wing Right */}
              <rect x="102" y="44" width="28" height="42" rx="4" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="2" />
              {/* Right wing windows */}
              <rect x="108" y="52" width="6" height="7" rx="1.5" fill="#93C5FD" />
              <rect x="118" y="52" width="6" height="7" rx="1.5" fill="#93C5FD" />
              <rect x="108" y="66" width="6" height="7" rx="1.5" fill="#93C5FD" />
              <rect x="118" y="66" width="6" height="7" rx="1.5" fill="#93C5FD" />

              {/* Center Main Hospital Tower */}
              <rect x="52" y="24" width="56" height="62" rx="5" fill="#FFFFFF" stroke="#3B82F6" strokeWidth="2.5" />

              {/* Roof cross badge */}
              <circle cx="80" cy="38" r="9" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="1.5" />
              {/* Red medical cross */}
              <path
                d="M78 33H82V36H85V40H82V43H78V40H75V36H78V33Z"
                fill="#EF4444"
              />

              {/* Windows center tower */}
              <rect x="62" y="50" width="8" height="8" rx="2" fill="#60A5FA" />
              <rect x="76" y="50" width="8" height="8" rx="2" fill="#60A5FA" />
              <rect x="90" y="50" width="8" height="8" rx="2" fill="#60A5FA" />

              <rect x="62" y="63" width="8" height="8" rx="2" fill="#60A5FA" />
              <rect x="76" y="63" width="8" height="8" rx="2" fill="#60A5FA" />
              <rect x="90" y="63" width="8" height="8" rx="2" fill="#60A5FA" />

              {/* Main Entrance Door */}
              <rect x="74" y="74" width="12" height="12" rx="2" fill="#2563EB" />
              <line x1="80" y1="74" x2="80" y2="86" stroke="#93C5FD" strokeWidth="1" />
            </svg>
          </div>
        </div>
      </div>

      {/* Decorative gradient background blur */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-100/40 rounded-full blur-2xl pointer-events-none" />
    </div>
  )
}
