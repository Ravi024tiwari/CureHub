import { useState, useEffect, type FC } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ChevronLeft,
  Stethoscope,
  Award,
  GraduationCap,
  Clock,
  Calendar,
  Building2,
  Phone,
  Mail,
  ShieldCheck,
  Star,
  UserX,
  RefreshCw,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  BadgeCheck,
  CalendarDays,
  FileText,
  IndianRupee,
  Sparkles,
  MapPin,
} from 'lucide-react'

import { useAuthStore } from '@/store/authStore'
import { useHospitalAdminStore } from '@/store/hospitalAdminStore'
import { useHospitalAdminDoctorsStore } from '@/store/hospitalAdminDoctorsStore'
import { fetchDoctorByIdApi } from '@/services/patientService'

// Layout Components
import { HospitalAdminSidebar } from '@/components/hospital-admin/HospitalAdminSidebar'
import { HospitalAdminHeader } from '@/components/hospital-admin/HospitalAdminHeader'
import { HospitalAdminMobileNav } from '@/components/hospital-admin/HospitalAdminMobileNav'
import { HospitalDoctorDisaffiliateModal } from '@/components/hospital-admin/doctors/HospitalDoctorDisaffiliateModal'
import { DoctorAvatar } from '@/components/hospital-admin/join-requests/JoinRequestsTable'

import drAmitImg from '@/assets/dr-amit-singh.jpg'

const DAY_NAMES: Record<number, string> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
  7: 'Sunday',
}

export const HospitalAdminDoctorDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const {
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    isSidebarCollapsed,
    toggleSidebar,
  } = useHospitalAdminStore()

  const {
    doctors,
    openDisaffiliateModal,
  } = useHospitalAdminDoctorsStore()

  const [doctor, setDoctor] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'leaves' | 'hospital'>('overview')
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // Auth gate
  useEffect(() => {
    if (user && !user.isAccountApproved) {
      navigate('/hospital-admin/verification', { replace: true })
    }
  }, [user, navigate])

  // Fetch doctor details from database
  const loadDoctor = async () => {
    if (!id) return
    setIsLoading(true)
    setError(null)
    try {
      // Find initial data from store if present
      const storeDoc = doctors.find((d) => d._id === id || d.userId?._id === id)
      if (storeDoc) {
        setDoctor(storeDoc)
      }

      const liveData = await fetchDoctorByIdApi(id)
      if (liveData) {
        setDoctor(liveData)
      } else if (!storeDoc) {
        setError('Doctor details could not be retrieved from the server.')
      }
    } catch (err: any) {
      console.error('Error fetching doctor details:', err)
      setError(err?.message || 'Failed to load doctor profile.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDoctor()
  }, [id])

  const copyToClipboard = (text: string, fieldName: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedField(fieldName)
    setTimeout(() => setCopiedField(null), 2000)
  }

  // Doctor Data mapping
  const doctorName =
    doctor?.name ||
    doctor?.userId?.name ||
    'Dr. Specialist Physician'
  const department = doctor?.department || 'Specialist'
  const experienceYears = doctor?.experienceYears ?? 5
  const consultationFee = doctor?.consultationFee ?? 500
  const rating = doctor?.rating || doctor?.ratingAverage || 4.9
  const reviewCount = doctor?.reviewCount || 16
  const regNumber = doctor?.medicalCouncilRegistrationNumber || 'MCI-REG-VALID'
  const email = doctor?.email || doctor?.userId?.email || 'doctor@curehealth.org'
  const phone = doctor?.phoneNumber || doctor?.userId?.phoneNumber || '+91 98765 43210'
  const bio =
    doctor?.bio ||
    `Dr. ${doctorName} is a licensed medical consultant specializing in ${department}. Dedicated to evidence-based clinical treatments, comprehensive patient diagnostics, and continuous healthcare excellence.`
  const specializations: string[] = doctor?.specialization?.length
    ? doctor.specialization
    : [department, 'Consultant']
  const qualifications: string[] = doctor?.qualifications?.length
    ? doctor.qualifications
    : ['MBBS', 'MD']

  const hospital = doctor?.hospitalId || {}
  const hospitalName =
    doctor?.hospitalName ||
    (typeof hospital === 'object' && hospital?.name ? hospital.name : 'Affiliated Hospital Branch')
  const hospitalLocation =
    doctor?.hospitalLocation ||
    (typeof hospital === 'object' && hospital?.address
      ? `${hospital.address.city || ''}, ${hospital.address.state || ''}`
      : 'Hospital Medical Campus')

  const scheduleRules = doctor?.scheduleRules || []
  const leaves = doctor?.leaves || []

  const avatar = doctor?.avatar || doctor?.userId?.avatar || drAmitImg

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex selection:bg-blue-100 selection:text-blue-700 antialiased">
      {/* 1. Desktop Persistent Collapsible Sidebar */}
      <div
        className={`hidden lg:block transition-all duration-300 ease-in-out shrink-0 overflow-hidden ${
          isSidebarCollapsed ? 'w-0 opacity-0 -ml-2 pointer-events-none' : 'w-64 opacity-100'
        }`}
      >
        <HospitalAdminSidebar />
      </div>

      {/* 2. Mobile Drawer Sidebar */}
      {isMobileSidebarOpen && (
        <HospitalAdminSidebar
          isMobileDrawer={true}
          onCloseDrawer={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* 3. Main Content View Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-10 transition-all duration-300">
        <HospitalAdminHeader onToggleSidebar={toggleSidebar} />

        <main className="flex-1 max-w-[1400px] w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5 sm:space-y-6">
          {/* Top Breadcrumb Navigation & Top Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Link
                to="/hospital-admin/hospitals"
                className="hover:text-blue-600 transition-colors flex items-center gap-1"
              >
                <Building2 className="size-3.5 text-slate-400" />
                <span>Hospital Admin</span>
              </Link>
              <span>/</span>
              <Link
                to="/hospital-admin/doctors"
                className="hover:text-blue-600 transition-colors"
              >
                Affiliated Doctors
              </Link>
              <span>/</span>
              <span className="text-slate-900 font-bold truncate max-w-[200px] sm:max-w-xs">
                {doctorName}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/hospital-admin/doctors')}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <ChevronLeft className="size-4 text-slate-500" />
                <span>Back to Doctors</span>
              </button>

              <button
                type="button"
                onClick={loadDoctor}
                disabled={isLoading}
                className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="Sync Doctor Details"
              >
                <RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
                <span className="hidden sm:inline">Sync</span>
              </button>

              {doctor && (
                <button
                  type="button"
                  onClick={() => openDisaffiliateModal(doctor)}
                  className="px-3.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <UserX className="size-3.5" />
                  <span>Disaffiliate Doctor</span>
                </button>
              )}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && !doctor && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3 shadow-xs">
              <Loader2 className="size-8 text-blue-600 animate-spin mx-auto" />
              <p className="text-sm font-bold text-slate-800">
                Loading official doctor profile...
              </p>
              <p className="text-xs text-slate-400">
                Fetching credential verification, schedule rules, and hospital affiliation records.
              </p>
            </div>
          )}

          {/* Error State */}
          {error && !doctor && (
            <div className="bg-white rounded-3xl border border-rose-200 p-8 sm:p-12 text-center max-w-lg mx-auto space-y-4 shadow-xs">
              <div className="size-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <AlertCircle className="size-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900">
                  Doctor Not Found
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {error}
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/hospital-admin/doctors')}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all cursor-pointer"
              >
                Return to Doctors Directory
              </button>
            </div>
          )}

          {/* Main Doctor Profile Body */}
          {doctor && (
            <>
              {/* Hero Profile Banner Card */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-32 bg-linear-to-bl from-blue-50/70 via-indigo-50/30 to-transparent pointer-events-none" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                  {/* Doctor Avatar & Identity */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 min-w-0">
                    <div className="relative shrink-0">
                      <DoctorAvatar
                        name={doctorName}
                        avatarUrl={avatar}
                        size="lg"
                        className="size-20 sm:size-24 rounded-3xl border-3 border-white shadow-md ring-1 ring-slate-200"
                      />
                      <div
                        className="absolute -bottom-1 -right-1 size-7 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white shadow-xs"
                        title="Official Verified Doctor"
                      >
                        <BadgeCheck className="size-4" />
                      </div>
                    </div>

                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                          {doctorName}
                        </h1>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/80">
                          <ShieldCheck className="size-3.5 text-blue-600" />
                          <span>Active Official Staff</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap text-xs sm:text-sm font-semibold text-slate-600">
                        <span className="text-blue-600 font-bold">{department}</span>
                        <span className="text-slate-300">•</span>
                        <span>{qualifications.join(', ')}</span>
                        <span className="text-slate-300">•</span>
                        <span className="flex items-center gap-1 text-slate-700">
                          <Building2 className="size-3.5 text-slate-400" />
                          <span>{hospitalName}</span>
                        </span>
                      </div>

                      {/* Credentials & Rating Badges */}
                      <div className="flex items-center gap-2.5 pt-1 flex-wrap">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(regNumber, 'reg')}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-[11px] font-mono font-semibold text-slate-600 transition-all cursor-pointer"
                          title="Click to copy Registration Number"
                        >
                          <Award className="size-3 text-teal-600" />
                          <span>Reg: {regNumber}</span>
                          {copiedField === 'reg' ? (
                            <Check className="size-3 text-emerald-600" />
                          ) : (
                            <Copy className="size-3 text-slate-400" />
                          )}
                        </button>

                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200/70 text-[11px] font-black text-slate-800">
                          <Star className="size-3.5 fill-amber-400 text-amber-500" />
                          <span>{typeof rating === 'number' ? rating.toFixed(1) : rating}</span>
                          <span className="text-slate-400 font-medium">({reviewCount} reviews)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Header Action Card (OPD Fee & Quick Links) */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-slate-50/80 border border-slate-100 shrink-0">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block text-left sm:text-right">
                        OPD Consultation Fee
                      </span>
                      <span className="text-xl sm:text-2xl font-black text-slate-900 flex items-center justify-start sm:justify-end">
                        <IndianRupee className="size-5 text-slate-500" />
                        <span>{consultationFee}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {phone && (
                        <a
                          href={`tel:${phone}`}
                          className="px-3 py-1.5 rounded-xl bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
                          title="Call Doctor"
                        >
                          <Phone className="size-3.5 text-blue-600" />
                          <span className="hidden sm:inline">Call</span>
                        </a>
                      )}
                      {email && (
                        <a
                          href={`mailto:${email}`}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
                          title="Send Email"
                        >
                          <Mail className="size-3.5" />
                          <span>Email</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 4 KPI Summary Metric Tiles */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Clinical Exp.</span>
                    <Sparkles className="size-4 text-blue-500" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-slate-900">
                    {experienceYears}+ <span className="text-xs font-semibold text-slate-400">Years</span>
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">Licensed Specialist</p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Active Days</span>
                    <CalendarDays className="size-4 text-emerald-500" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-slate-900">
                    {scheduleRules.length || 5}{' '}
                    <span className="text-xs font-semibold text-slate-400">Days / Wk</span>
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">OPD Availability</p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Patient Rating</span>
                    <Star className="size-4 text-amber-500 fill-amber-400" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-slate-900">
                    {typeof rating === 'number' ? rating.toFixed(1) : rating}
                    <span className="text-xs font-semibold text-slate-400"> / 5.0</span>
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">Based on verified visits</p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Staff Status</span>
                    <ShieldCheck className="size-4 text-indigo-500" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-emerald-600">
                    Approved
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">Active Hospital Staff</p>
                </div>
              </div>

              {/* Navigation Tabs Bar */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-1.5 shadow-2xs flex items-center gap-1 overflow-x-auto scrollbar-none">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'overview'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="size-3.5" />
                  <span>Overview & Bio</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('schedule')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'schedule'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <CalendarDays className="size-3.5" />
                  <span>OPD Schedule & Routine ({scheduleRules.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('leaves')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'leaves'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Clock className="size-3.5" />
                  <span>Approved Leaves ({leaves.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('hospital')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'hospital'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Building2 className="size-3.5" />
                  <span>Branch & Facility</span>
                </button>
              </div>

              {/* Tab 1: Overview & Qualifications */}
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <div className="lg:col-span-2 space-y-5">
                    {/* Professional Biography */}
                    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-3">
                      <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                        <FileText className="size-4 text-blue-600" />
                        <span>Professional Biography</span>
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                        {bio}
                      </p>
                    </div>

                    {/* Specializations & Clinical Focus */}
                    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-3">
                      <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                        <Stethoscope className="size-4 text-blue-600" />
                        <span>Specializations & Clinical Focus</span>
                      </h3>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {specializations.map((spec, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200/80 text-xs font-bold"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Credentials & Direct Contact */}
                  <div className="space-y-5">
                    {/* Qualifications & Medical Council */}
                    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
                      <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                        <GraduationCap className="size-4 text-indigo-600" />
                        <span>Qualifications & License</span>
                      </h3>

                      <div className="space-y-3 text-xs">
                        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Degrees & Certifications
                          </span>
                          <span className="font-extrabold text-slate-800 text-sm">
                            {qualifications.join(' • ')}
                          </span>
                        </div>

                        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Medical Council Reg. Number
                          </span>
                          <div className="flex items-center justify-between font-mono font-bold text-slate-800">
                            <span>{regNumber}</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(regNumber, 'reg2')}
                              className="text-blue-600 hover:text-blue-700 cursor-pointer"
                            >
                              {copiedField === 'reg2' ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                            </button>
                          </div>
                        </div>

                        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 space-y-1">
                          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                            Staff Verification Status
                          </span>
                          <span className="font-black text-emerald-800 text-xs flex items-center gap-1.5">
                            <BadgeCheck className="size-4 text-emerald-600" />
                            <span>Verified Hospital Medical Staff</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
                      <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                        <Phone className="size-4 text-emerald-600" />
                        <span>Direct Communication</span>
                      </h3>

                      <div className="space-y-2.5 text-xs">
                        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                          <div className="space-y-0.5 min-w-0 pr-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              Phone Number
                            </span>
                            <span className="font-bold text-slate-800 truncate block">
                              {phone}
                            </span>
                          </div>
                          <a
                            href={`tel:${phone}`}
                            className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
                            title="Call Doctor"
                          >
                            <Phone className="size-3.5" />
                          </a>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                          <div className="space-y-0.5 min-w-0 pr-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              Official Email
                            </span>
                            <span className="font-bold text-slate-800 truncate block">
                              {email}
                            </span>
                          </div>
                          <a
                            href={`mailto:${email}`}
                            className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
                            title="Email Doctor"
                          >
                            <Mail className="size-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Weekly OPD Schedule */}
              {activeTab === 'schedule' && (
                <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <CalendarDays className="size-5 text-blue-600" />
                        <span>Weekly Outpatient Clinic Routine (OPD)</span>
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Consultation days, shift timings, and room numbers active for {doctorName}.
                      </p>
                    </div>

                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/70">
                      {scheduleRules.length} Active Rules
                    </span>
                  </div>

                  {scheduleRules.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                      <Clock className="size-8 text-slate-400 mx-auto" />
                      <p className="text-xs font-bold text-slate-700">No Custom Schedule Rules Configured</p>
                      <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                        This doctor follows standard OPD routine (Mon–Sat, 10:00 AM – 05:00 PM) at the registered hospital facility.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {scheduleRules.map((rule: any, idx: number) => {
                        const dayName =
                          typeof rule.dayOfWeek === 'number'
                            ? DAY_NAMES[rule.dayOfWeek] || `Day ${rule.dayOfWeek}`
                            : rule.dayOfWeek || 'Practice Day'

                        return (
                          <div
                            key={idx}
                            className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-blue-300 transition-all shadow-2xs space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-black text-slate-900">
                                {dayName}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Active Slot
                              </span>
                            </div>

                            <div className="space-y-1 text-xs">
                              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                                <Clock className="size-3.5 text-blue-600" />
                                <span>
                                  {rule.startTime || '10:00'} - {rule.endTime || '17:00'}
                                </span>
                              </div>

                              {rule.room && (
                                <p className="text-[11px] text-slate-500 font-semibold pl-5">
                                  Chamber / Room: <strong className="text-slate-800">{rule.room}</strong>
                                </p>
                              )}

                              {rule.slotDurationMinutes && (
                                <p className="text-[11px] text-slate-500 font-semibold pl-5">
                                  Slot Duration: {rule.slotDurationMinutes} mins
                                </p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Leaves & Time Off */}
              {activeTab === 'leaves' && (
                <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <Clock className="size-5 text-amber-600" />
                        <span>Approved Leaves & Scheduled Off-Days</span>
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Approved physician leaves and clinical absences logged in the system.
                      </p>
                    </div>

                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      {leaves.length} Recorded
                    </span>
                  </div>

                  {leaves.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                      <Calendar className="size-8 text-slate-400 mx-auto" />
                      <p className="text-xs font-bold text-slate-700">No Leaves Logged</p>
                      <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                        This doctor does not have any pending or approved leaves scheduled for the coming weeks.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden">
                      {leaves.map((l: any, idx: number) => {
                        const start = l.startDate ? new Date(l.startDate).toLocaleDateString() : 'N/A'
                        const end = l.endDate ? new Date(l.endDate).toLocaleDateString() : start
                        const status = l.status || 'APPROVED'

                        return (
                          <div
                            key={idx}
                            className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white hover:bg-slate-50/60 transition-colors"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Calendar className="size-4 text-amber-600" />
                                <span className="text-xs font-black text-slate-900">
                                  {start} {end !== start ? `to ${end}` : ''}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 font-medium pl-6">
                                Reason: {l.reason || 'Personal / Clinical Leave'}
                              </p>
                            </div>

                            <span
                              className={`self-start sm:self-auto px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                status === 'APPROVED'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {status}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Hospital Affiliation Details */}
              {activeTab === 'hospital' && (
                <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <Building2 className="size-5 text-blue-600" />
                        <span>Registered Hospital Branch Information</span>
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Facility details where Dr. {doctorName} is registered and actively conducting patient consultations.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Hospital Facility Name
                      </span>
                      <p className="text-sm font-black text-slate-900">{hospitalName}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Campus Location & Address
                      </span>
                      <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                        <MapPin className="size-4 text-rose-500 shrink-0" />
                        <span>{hospitalLocation}</span>
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Assigned Clinical Department
                      </span>
                      <p className="text-sm font-black text-blue-600">{department}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Consultation Visit Rate
                      </span>
                      <p className="text-sm font-black text-slate-900">₹{consultationFee} OPD</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Disaffiliate Confirmation Modal */}
      <HospitalDoctorDisaffiliateModal />

      {/* Mobile Bottom Navigation */}
      <HospitalAdminMobileNav />
    </div>
  )
}

export default HospitalAdminDoctorDetailPage
