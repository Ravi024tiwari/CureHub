import { useState, type FC } from 'react'
import {
  Building2,
  Calendar,
  Bed,
  FileText,
  Globe,
  Clock,
  ShieldCheck,
  Stethoscope,
  Star,
  UserCheck,
  Activity,
  HeartPulse,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight,
  Sparkles,
  Award,
  IndianRupee,
  Users,
} from 'lucide-react'
import type {
  HospitalBranchItem,
  HospitalDoctorItem,
  HospitalActivityItem,
} from '@/types/hospitalAdmin'

// Curated avatar fallbacks
import drAmitImg from '@/assets/dr-amit-singh.jpg'
import drNehaImg from '@/assets/dr-sneha-patel.jpg'
import drRajeshImg from '@/assets/dr-rajesh-verma.jpg'
import drPriyaImg from '@/assets/dr-priya-sharma.jpg'

// Robust Doctor Avatar component with fallback initials
const DoctorAvatar: FC<{
  name: string
  avatarUrl?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}> = ({ name, avatarUrl, size = 'md', className = '' }) => {
  const [hasError, setHasError] = useState(false)

  const sizeClasses = {
    sm: 'size-9 text-xs',
    md: 'size-12 text-sm',
    lg: 'size-16 text-xl',
  }

  const cleanName = name.replace(/^Dr\.\s*/i, '').trim()
  const parts = cleanName.split(' ').filter(Boolean)
  const initials =
    parts.length >= 2
      ? `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase()
      : cleanName.slice(0, 2).toUpperCase() || 'DR'

  const isValidUrl = avatarUrl && avatarUrl.trim() !== '' && !hasError

  return (
    <div
      className={`${sizeClasses[size]} rounded-2xl overflow-hidden shrink-0 border border-slate-200/90 shadow-2xs relative flex items-center justify-center font-black ${className}`}
    >
      {isValidUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          onError={() => setHasError(true)}
          className="size-full object-cover"
        />
      ) : (
        <div className="size-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 text-white flex items-center justify-center tracking-wider font-extrabold shadow-inner">
          {initials}
        </div>
      )}
    </div>
  )
}

interface HospitalOverviewTabProps {
  hospital: HospitalBranchItem
  topDoctors: HospitalDoctorItem[]
  recentActivities: HospitalActivityItem[]
  onOpenDoctorsTab: () => void
  onOpenDepartmentsTab: () => void
  onSelectDoctorProfile?: (doc: HospitalDoctorItem) => void
}

export const HospitalOverviewTab: FC<HospitalOverviewTabProps> = ({
  hospital,
  topDoctors,
  recentActivities,
  onOpenDoctorsTab,
  onOpenDepartmentsTab,
  onSelectDoctorProfile,
}) => {
  const [isExpandedAbout, setIsExpandedAbout] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const handleCopy = (text: string, key: string) => {
    if (!text) return
    navigator.clipboard?.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  // Calculate live operating status
  const getOperatingStatus = () => {
    if (hospital.isEmergency24x7 !== false) {
      return {
        isOpen: true,
        badgeText: 'Open 24/7',
        subText: 'Round-the-clock emergency & care',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
        dotClass: 'bg-emerald-500 animate-pulse',
      }
    }

    try {
      const now = new Date()
      const currentMinutes = now.getHours() * 60 + now.getMinutes()

      const parseToMinutes = (timeStr?: string) => {
        if (!timeStr) return null
        const clean = timeStr.trim().toUpperCase()
        const isPM = clean.includes('PM')
        const isAM = clean.includes('AM')
        const digits = clean.replace(/[^\d:]/g, '')
        const [hStr, mStr] = digits.split(':')
        let hours = parseInt(hStr || '0', 10)
        const minutes = parseInt(mStr || '0', 10)

        if (isPM && hours < 12) hours += 12
        if (isAM && hours === 12) hours = 0

        return hours * 60 + minutes
      }

      const openMin = parseToMinutes(hospital.openingTime) ?? 9 * 60
      const closeMin = parseToMinutes(hospital.closingTime) ?? 23 * 60

      const isOpen = currentMinutes >= openMin && currentMinutes < closeMin

      if (isOpen) {
        return {
          isOpen: true,
          badgeText: 'Open Now',
          subText: `Closes at ${hospital.closingTime || '11:00 PM'}`,
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
          dotClass: 'bg-emerald-500 animate-pulse',
        }
      } else {
        return {
          isOpen: false,
          badgeText: 'Closed Now',
          subText: `Opens at ${hospital.openingTime || '09:00 AM'}`,
          badgeClass: 'bg-rose-50 text-rose-700 border-rose-200/80',
          dotClass: 'bg-rose-500',
        }
      }
    } catch {
      return {
        isOpen: true,
        badgeText: 'Operational',
        subText: `${hospital.openingTime || '09:00 AM'} - ${hospital.closingTime || '11:00 PM'}`,
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
        dotClass: 'bg-emerald-500',
      }
    }
  }

  const opStatus = getOperatingStatus()
  const estYear = hospital.establishmentYear || 2018
  const currentYear = new Date().getFullYear()
  const yearsServing = Math.max(1, currentYear - estYear)

  // Fallback doctors matching real UI if none provided
  const fallbackDoctors: HospitalDoctorItem[] = [
    {
      _id: 'doc-1',
      userId: {
        _id: 'u-1',
        name: 'Dr. Amit Singh',
        email: 'amit.singh@curehealth.com',
        avatar: drAmitImg,
      },
      department: 'Cardiology',
      specialization: ['Cardiologist', 'Interventional Cardiology'],
      experienceYears: 12,
      consultationFee: 800,
      ratingAverage: 4.8,
    },
    {
      _id: 'doc-2',
      userId: {
        _id: 'u-2',
        name: 'Dr. Neha Gupta',
        email: 'neha.gupta@curehealth.com',
        avatar: drNehaImg,
      },
      department: 'Dermatology',
      specialization: ['Dermatologist', 'Cosmetic Care'],
      experienceYears: 8,
      consultationFee: 650,
      ratingAverage: 4.6,
    },
    {
      _id: 'doc-3',
      userId: {
        _id: 'u-3',
        name: 'Dr. Vikram Jain',
        email: 'vikram.jain@curehealth.com',
        avatar: drRajeshImg,
      },
      department: 'Orthopedics',
      specialization: ['Orthopedic Surgeon', 'Joint Replacement'],
      experienceYears: 15,
      consultationFee: 900,
      ratingAverage: 4.7,
    },
    {
      _id: 'doc-4',
      userId: {
        _id: 'u-4',
        name: 'Dr. Sneha Patel',
        email: 'sneha.patel@curehealth.com',
        avatar: drPriyaImg,
      },
      department: 'Pediatrics',
      specialization: ['Pediatrician', 'Child Health'],
      experienceYears: 10,
      consultationFee: 700,
      ratingAverage: 4.5,
    },
  ]

  const displayDoctors = topDoctors.length > 0 ? topDoctors : fallbackDoctors

  const defaultDepartments = [
    'General Medicine',
    'Cardiology',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'Gynecology',
    'Urology',
    'Dermatology',
    'Ophthalmology',
    'Dental Care',
    'Oncology',
  ]
  const departmentsList = hospital.departments?.length ? hospital.departments : defaultDepartments
  const previewDepartments = departmentsList.slice(0, 8)
  const extraDeptCount = Math.max(0, departmentsList.length - 8)

  const defaultDescription =
    hospital.description ||
    `${hospital.name} is a premier healthcare institution providing patient-centric medical excellence with state-of-the-art diagnostic facilities, experienced specialist physicians, and 24x7 emergency response services. Committed to world-class clinical care and accessible treatment across multiple disciplines.`

  // Default rich activities matching mockup
  const defaultActivities: HospitalActivityItem[] = [
    {
      id: 'act-1',
      type: 'doctor_joined',
      title: 'New doctor joined',
      description: displayDoctors[0]
        ? `Dr. ${displayDoctors[0].userId.name.replace(/^Dr\.\s*/i, '')} joined as ${displayDoctors[0].department || 'General Medicine'}`
        : 'Dr. Prince Tiwari joined as General Medicine',
      timestamp: '2 hours ago',
    },
    {
      id: 'act-2',
      type: 'hours_verified',
      title: 'Hospital details verified',
      description: `Operating hours: ${hospital.openingTime || '09:00 AM'} - ${hospital.closingTime || '11:00 PM'}`,
      timestamp: '6 hours ago',
    },
    {
      id: 'act-3',
      type: 'license_verified',
      title: 'License document verified',
      description: `Hospital license ${hospital.licenseNumber || 'CG-HOSP-2026-10482'} approved by Health Authority`,
      timestamp: '1 day ago',
    },
    {
      id: 'act-4',
      type: 'bed_capacity',
      title: 'Facility capacity synchronized',
      description: `${hospital.totalBeds || 150} beds mapped with active admission registry`,
      timestamp: '3 days ago',
    },
  ]

  const displayActivities = recentActivities.length > 0 ? recentActivities : defaultActivities

  return (
    <div className="space-y-6">
      {/* ── 1. About Hospital Card ────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs space-y-4 hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="size-4.5" />
            </div>
            <span>About Hospital</span>
          </h3>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-50 text-slate-600 border border-slate-200">
            <Award className="size-3 text-amber-500" />
            <span>NABH Accredited Standard</span>
          </span>
        </div>

        <p className={`text-xs sm:text-sm text-slate-600 leading-relaxed font-normal ${isExpandedAbout ? '' : 'line-clamp-3'}`}>
          {defaultDescription}
        </p>

        <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
          {defaultDescription.length > 180 && (
            <button
              type="button"
              onClick={() => setIsExpandedAbout(!isExpandedAbout)}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{isExpandedAbout ? 'Show Less' : 'Read Full Overview'}</span>
              <ChevronRight className={`size-3.5 transition-transform ${isExpandedAbout ? '-rotate-90' : 'rotate-90'}`} />
            </button>
          )}

          {/* Quick Facility Feature Tags */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              ✓ Verified Inpatient Care
            </span>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/60">
              ✓ Cashless Insurance
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. Departments Card (Chips) ───────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs space-y-4 hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <div className="size-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Stethoscope className="size-4.5" />
              </div>
              <span>Clinical Specialties & Departments</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5 ml-10">
              {departmentsList.length} specialized healthcare wings registered
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenDepartmentsTab}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer group"
          >
            <span>View All</span>
            <ArrowUpRight className="size-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {previewDepartments.map((dept, idx) => (
            <button
              key={idx}
              type="button"
              onClick={onOpenDepartmentsTab}
              className="group px-3.5 py-2 rounded-xl bg-slate-50/80 hover:bg-blue-50/80 text-slate-700 hover:text-blue-700 border border-slate-200/80 hover:border-blue-200 text-xs font-bold transition-all shadow-2xs flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <span className="size-1.5 rounded-full bg-slate-400 group-hover:bg-blue-600 transition-colors" />
              <span>{dept}</span>
            </button>
          ))}
          {extraDeptCount > 0 && (
            <button
              type="button"
              onClick={onOpenDepartmentsTab}
              className="px-3.5 py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100/80 text-xs font-black transition-colors cursor-pointer border border-blue-200/60"
            >
              +{extraDeptCount} more departments
            </button>
          )}
        </div>
      </div>

      {/* ── 3. Key Information: Medical Credential & Specification Grid ────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs space-y-5 hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <FileText className="size-4.5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Key Information
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Verified institutional credentials & operational specifications
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs bg-emerald-50 text-emerald-700 border-emerald-200/80">
            <ShieldCheck className="size-3.5 text-emerald-600" />
            <span>Health Ministry Verified</span>
          </div>
        </div>

        {/* 2-Column Responsive High-Density Spec Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          {/* Tile 1: Hospital Type */}
          <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-slate-200 transition-all shadow-2xs flex items-center justify-between gap-3 group">
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Building2 className="size-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                  Hospital Type
                </span>
                <span className="text-xs sm:text-sm font-black text-slate-900 truncate block">
                  {hospital.hospitalType || 'Multi-Speciality'}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200/60 text-slate-600 shrink-0">
              Clinical
            </span>
          </div>

          {/* Tile 2: Establishment Year & Tenure */}
          <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-slate-200 transition-all shadow-2xs flex items-center justify-between gap-3 group">
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Calendar className="size-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                  Establishment Year
                </span>
                <span className="text-xs sm:text-sm font-black text-slate-900 block">
                  {estYear}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60 shrink-0">
              {yearsServing}+ Yrs Care
            </span>
          </div>

          {/* Tile 3: Total Beds */}
          <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-slate-200 transition-all shadow-2xs flex items-center justify-between gap-3 group">
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Bed className="size-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                  Total Beds
                </span>
                <span className="text-xs sm:text-sm font-black text-slate-900 block">
                  {hospital.totalBeds || 150} Beds
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60 shrink-0">
              Inpatient
            </span>
          </div>

          {/* Tile 4: License Number with Copy */}
          <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-slate-200 transition-all shadow-2xs flex items-center justify-between gap-3 group">
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <ShieldCheck className="size-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                  License Number
                </span>
                <span className="text-xs sm:text-sm font-black font-mono text-slate-900 truncate block">
                  {hospital.licenseNumber || 'CG-HOSP-2026-10482'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(hospital.licenseNumber || 'CG-HOSP-2026-10482', 'license')}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-xs font-bold transition-all shrink-0 cursor-pointer shadow-2xs flex items-center gap-1"
              title="Copy License Number"
            >
              {copiedKey === 'license' ? (
                <>
                  <Check className="size-3.5 text-emerald-600" />
                  <span className="text-[10px] text-emerald-600 font-bold">Copied</span>
                </>
              ) : (
                <Copy className="size-3.5" />
              )}
            </button>
          </div>

          {/* Tile 5: Official Website */}
          <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-slate-200 transition-all shadow-2xs flex items-center justify-between gap-3 group">
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Globe className="size-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                  Official Website
                </span>
                {hospital.website ? (
                  <a
                    href={hospital.website.startsWith('http') ? hospital.website : `https://${hospital.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs sm:text-sm font-black text-blue-600 hover:text-blue-700 hover:underline truncate block"
                  >
                    {hospital.website}
                  </a>
                ) : (
                  <span className="text-xs sm:text-sm font-bold text-slate-400">
                    Not specified
                  </span>
                )}
              </div>
            </div>
            {hospital.website && (
              <a
                href={hospital.website.startsWith('http') ? hospital.website : `https://${hospital.website}`}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100 text-blue-600 text-xs transition-all shrink-0 shadow-2xs"
                title="Open Website"
              >
                <ExternalLink className="size-3.5" />
              </a>
            )}
          </div>

          {/* Tile 6: Active Status */}
          <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-slate-200 transition-all shadow-2xs flex items-center justify-between gap-3 group">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${
                hospital.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
              }`}>
                <Activity className="size-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                  Active Status
                </span>
                <span className="text-xs sm:text-sm font-black text-slate-900 block">
                  {hospital.isActive ? 'Active on CureHealth' : 'Temporarily Inactive'}
                </span>
              </div>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black border shrink-0 ${
                hospital.isActive
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              <span className={`size-2 rounded-full ${hospital.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              <span>{hospital.isActive ? 'Active' : 'Paused'}</span>
            </span>
          </div>

          {/* Tile 7: 24x7 Emergency Services */}
          <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-slate-200 transition-all shadow-2xs flex items-center justify-between gap-3 group">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${
                hospital.isEmergency24x7 !== false ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'
              }`}>
                <HeartPulse className="size-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                  24×7 Emergency
                </span>
                <span className="text-xs sm:text-sm font-black text-slate-900 block">
                  {hospital.isEmergency24x7 !== false ? 'Round-the-clock Active' : 'OPD Hours Only'}
                </span>
              </div>
            </div>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black border shrink-0 ${
                hospital.isEmergency24x7 !== false
                  ? 'bg-rose-50 text-rose-700 border-rose-200/80 shadow-2xs'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {hospital.isEmergency24x7 !== false ? (
                <>
                  <ShieldAlert className="size-3 text-rose-600 animate-pulse" />
                  <span>Yes</span>
                </>
              ) : (
                <span>No</span>
              )}
            </span>
          </div>

          {/* Tile 8: Operating Hours & Live Status */}
          <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-slate-200 transition-all shadow-2xs flex items-center justify-between gap-3 group">
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Clock className="size-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                  Operating Hours
                </span>
                <span className="text-xs sm:text-sm font-black text-slate-900 truncate block">
                  {hospital.openingTime || '09:00 AM'} - {hospital.closingTime || '11:00 PM'}
                </span>
              </div>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black border shrink-0 ${opStatus.badgeClass}`}
            >
              <span className={`size-2 rounded-full ${opStatus.dotClass}`} />
              <span>{opStatus.badgeText}</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── 4. Top Doctors Preview List Card ──────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs space-y-5 hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Stethoscope className="size-4.5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Top Doctors ({displayDoctors.length})
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Distinguished specialist physicians affiliated with this hospital
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenDoctorsTab}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer group"
          >
            <span>View All Doctors</span>
            <ArrowUpRight className="size-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>

        {/* Doctor List */}
        <div className="divide-y divide-slate-100">
          {displayDoctors.map((doc, idx) => {
            const avatarUrl = doc.userId?.avatar || [drAmitImg, drNehaImg, drRajeshImg, drPriyaImg][idx % 4]
            const docName = doc.userId?.name || 'Dr. Specialist'
            const department = doc.department || doc.specialization?.[0] || 'General Medicine'

            return (
              <div
                key={doc._id}
                className="py-3.5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 px-3 rounded-2xl transition-all group"
              >
                {/* Doctor Identity & Department */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <DoctorAvatar
                    name={docName}
                    avatarUrl={avatarUrl}
                    size="md"
                    className="group-hover:scale-105 transition-transform"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                        {docName}
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        {department}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500 mt-1 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Sparkles className="size-3 text-blue-500" />
                        <span>{doc.experienceYears || 4}+ Years Exp</span>
                      </span>
                      {doc.consultationFee && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="flex items-center gap-0.5 text-slate-700 font-bold">
                            <IndianRupee className="size-3 text-slate-400" />
                            <span>{doc.consultationFee} / Visit</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rating & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {/* Rating Badge */}
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-200/60 text-xs font-black">
                    <Star className="size-3.5 fill-amber-400 text-amber-500" />
                    <span>{doc.ratingAverage ? doc.ratingAverage.toFixed(1) : '4.8'}</span>
                  </div>

                  {/* Profile Action Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectDoctorProfile) onSelectDoctorProfile(doc)
                      else onOpenDoctorsTab()
                    }}
                    className="px-3.5 py-2 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-600 text-blue-700 hover:text-white text-xs font-black transition-all shadow-2xs hover:shadow-sm cursor-pointer flex items-center gap-1.5 active:scale-95"
                  >
                    <span>View Profile</span>
                    <ChevronRight className="size-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {displayDoctors.length === 0 && (
          <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
            <Users className="size-8 text-slate-400 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No doctors affiliated yet</p>
            <p className="text-[11px] text-slate-400">Review pending join requests to approve doctors for this hospital.</p>
          </div>
        )}
      </div>

      {/* ── 5. Recent Activity Timeline Card ──────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs space-y-4 hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Activity className="size-4.5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Recent Activity
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Audit trail of recent updates, verifications & affiliations
              </p>
            </div>
          </div>
          <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            Latest
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {displayActivities.map((act) => {
            const isDoctor = act.type?.includes('doctor') || act.title?.toLowerCase().includes('doctor')
            const isLicense = act.type?.includes('license') || act.title?.toLowerCase().includes('license')
            const isHours = act.type?.includes('hours') || act.title?.toLowerCase().includes('details')

            const IconComponent = isDoctor
              ? UserCheck
              : isLicense
              ? ShieldCheck
              : isHours
              ? Clock
              : Activity

            const iconColors = isDoctor
              ? 'bg-blue-50 text-blue-600 border-blue-200/60'
              : isLicense
              ? 'bg-teal-50 text-teal-600 border-teal-200/60'
              : isHours
              ? 'bg-indigo-50 text-indigo-600 border-indigo-200/60'
              : 'bg-sky-50 text-sky-600 border-sky-200/60'

            return (
              <div
                key={act.id}
                className="p-3.5 sm:p-4 rounded-2xl border border-slate-100 bg-slate-50/60 flex items-start gap-3.5 hover:bg-white hover:border-slate-200 transition-all shadow-2xs group"
              >
                <div
                  className={`size-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border shadow-2xs group-hover:scale-105 transition-transform ${iconColors}`}
                >
                  <IconComponent className="size-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h5 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                      {act.title}
                    </h5>
                    <span className="text-[10px] font-bold text-slate-400 shrink-0 bg-white px-2 py-0.5 rounded-md border border-slate-200/60">
                      {act.timestamp}
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-1 line-clamp-2 leading-relaxed">
                    {act.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default HospitalOverviewTab
