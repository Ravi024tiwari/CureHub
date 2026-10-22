import { type FC } from 'react'
import {
  Eye,
  MapPin,
  Bed,
  Calendar,
  Activity,
  Phone,
  Mail,
  Globe,
  Clock,
  CheckCircle2,
  Building2,
} from 'lucide-react'

export interface PreviewData {
  name: string
  hospitalType: string
  slug: string
  establishmentYear: number | ''
  totalBeds: number | ''
  website: string
  description: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  contactEmail: string
  contactPhone: string
  departments: string[]
  facilities: string[]
  openingTime: string
  closingTime: string
  isEmergency24x7: boolean
  coverImage: string
  gallery?: string[]
}

interface HospitalPreviewCardProps {
  data: PreviewData
  isFloatingDrawer?: boolean
}

export const HospitalPreviewCard: FC<HospitalPreviewCardProps> = ({
  data,
  isFloatingDrawer = false,
}) => {
  const displayName = data.name.trim() || 'Hospital Name'
  const displayType = data.hospitalType || 'Hospital Type'
  const displayLocation =
    [data.street, data.city, data.state].filter(Boolean).join(', ') ||
    'Address, City, State'
  const displayBeds = data.totalBeds !== '' && data.totalBeds !== undefined ? data.totalBeds : '-'
  const displayYear = data.establishmentYear || '----'
  const displayPhone = data.contactPhone || 'Phone number'
  const displayEmail = data.contactEmail || 'Email address'
  const displayWebsite = data.website || ''
  const displayHours = `${data.openingTime || '09:00 AM'} - ${data.closingTime || '11:00 PM'}`

  return (
    <div
      className={`bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col ${
        isFloatingDrawer ? 'w-full' : 'sticky top-6'
      }`}
    >
      {/* Top Banner Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-purple-100/80 text-purple-600 flex items-center justify-center">
            <Eye className="size-4 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
              Hospital Preview
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">
              This is how your hospital will appear to patients.
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200/60">
          <span className="size-1.5 rounded-full bg-blue-600 animate-pulse" />
          Live View
        </span>
      </div>

      {/* Main Hospital Card Body */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* Cover Image or Empty State Placeholder */}
        <div className="relative h-44 sm:h-48 rounded-2xl overflow-hidden shadow-xs group bg-slate-100">
          {data.coverImage ? (
            <>
              <img
                src={data.coverImage}
                alt={displayName}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-slate-100 via-blue-50/50 to-indigo-50/60 flex flex-col items-center justify-center text-slate-400 gap-1.5 p-4 text-center">
              <div className="size-11 rounded-2xl bg-white shadow-xs flex items-center justify-center text-blue-600">
                <Building2 className="size-5.5 stroke-[2]" />
              </div>
              <span className="text-[11px] font-bold text-slate-500">Cover image will appear here</span>
            </div>
          )}

          {/* Floating Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-white/95 text-blue-700 shadow-sm backdrop-blur-xs border border-white/40">
              {displayType}
            </span>

            {data.isEmergency24x7 && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500 text-white shadow-sm flex items-center gap-1">
                <Activity className="size-3" />
                24x7 Emergency
              </span>
            )}
          </div>
        </div>

        {/* Hospital Name & Location */}
        <div>
          <h4
            className={`text-base sm:text-lg font-black leading-snug line-clamp-1 ${
              data.name ? 'text-slate-900' : 'text-slate-400 italic'
            }`}
          >
            {displayName}
          </h4>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1 truncate">
            <MapPin className="size-3.5 text-rose-500 shrink-0" />
            <span className="truncate">{displayLocation}</span>
          </div>
        </div>

        {/* 3-Column Quick Metrics Row */}
        <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-slate-50/80 border border-slate-100 text-center">
          <div>
            <div className="flex items-center justify-center gap-1 text-slate-400 mb-0.5">
              <Bed className="size-3.5" />
            </div>
            <p className="text-xs font-black text-slate-800">{displayBeds}</p>
            <p className="text-[10px] text-slate-400 font-medium">Beds</p>
          </div>

          <div className="border-x border-slate-200/60">
            <div className="flex items-center justify-center gap-1 text-slate-400 mb-0.5">
              <Calendar className="size-3.5" />
            </div>
            <p className="text-xs font-black text-slate-800">{displayYear}</p>
            <p className="text-[10px] text-slate-400 font-medium">Established</p>
          </div>

          <div>
            <div className="flex items-center justify-center gap-1 text-emerald-500 mb-0.5">
              <Activity className="size-3.5" />
            </div>
            <p className="text-xs font-black text-slate-800">
              {data.isEmergency24x7 ? '24x7' : 'Standard'}
            </p>
            <p className="text-[10px] text-slate-400 font-medium">Emergency</p>
          </div>
        </div>

        {/* Key Departments */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Key Departments
            </span>
            {data.departments.length > 5 && (
              <span className="text-[10px] font-bold text-blue-600">
                +{data.departments.length - 5} more
              </span>
            )}
          </div>
          {data.departments.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {data.departments.slice(0, 5).map((dept, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200/60"
                >
                  {dept}
                </span>
              ))}
              {data.departments.length > 5 && (
                <span className="px-2 py-1 rounded-xl text-[10px] font-extrabold bg-blue-50 text-blue-700">
                  +{data.departments.length - 5}
                </span>
              )}
            </div>
          ) : (
            <p className="text-[11px] text-slate-400 italic">No departments added yet</p>
          )}
        </div>

        {/* Key Facilities */}
        <div>
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Key Facilities
          </span>
          {data.facilities.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {data.facilities.slice(0, 5).map((fac, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-blue-50/70 text-blue-700 border border-blue-100"
                >
                  {fac}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-slate-400 italic">No facilities added yet</p>
          )}
        </div>

        {/* Contact Information */}
        <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Contact
          </span>
          <div className="flex items-center gap-2 truncate">
            <Phone className="size-3.5 text-blue-600 shrink-0" />
            <span className={`truncate font-semibold ${data.contactPhone ? 'text-slate-700' : 'text-slate-400'}`}>
              {displayPhone}
            </span>
          </div>
          <div className="flex items-center gap-2 truncate">
            <Mail className="size-3.5 text-sky-600 shrink-0" />
            <span className={`truncate font-semibold ${data.contactEmail ? 'text-slate-700' : 'text-slate-400'}`}>
              {displayEmail}
            </span>
          </div>
          {displayWebsite && (
            <div className="flex items-center gap-2 truncate">
              <Globe className="size-3.5 text-indigo-600 shrink-0" />
              <span className="truncate text-blue-600 font-semibold">{displayWebsite}</span>
            </div>
          )}
        </div>

        {/* Operating Hours */}
        <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs">
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Operating Hours
          </span>
          <div className="flex items-center gap-2 text-slate-700">
            <Clock className="size-3.5 text-slate-400 shrink-0" />
            <span className="font-semibold">{displayHours}</span>
          </div>
          {data.isEmergency24x7 && (
            <div className="flex items-center gap-2 text-emerald-700 font-bold">
              <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
              <span>24x7 Emergency Services</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
export default HospitalPreviewCard
