import { useState, useEffect, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Star,
  MapPin,
  Phone,
  Globe,
  CalendarPlus,
  ShieldCheck,
  Clock,
  Bed,
  Building2,
  Award,
  CheckCircle2,
  Mail,
  Activity,
  Stethoscope,
  ChevronRight,
  Search,
  AlertCircle,
  RefreshCw,
  ExternalLink,
} from 'lucide-react'
import type { HospitalCardData, DoctorCardData } from '@/types/patient'
import type { HospitalDoctorItem } from '@/types/hospitalAdmin'
import { Button } from '@/components/ui/button'
import { LazyImage } from '@/components/common/LazyImage'
import { IndustrialSpinner } from '@/components/ui/IndustrialSpinner'
import { hospitalService } from '@/services/hospitalService'

import drAmitImg from '@/assets/dr-amit-singh.jpg'
import drPriyaImg from '@/assets/dr-priya-sharma.jpg'
import drRajeshImg from '@/assets/dr-rajesh-verma.jpg'
import drSnehaImg from '@/assets/dr-sneha-patel.jpg'

interface HospitalDetailViewProps {
  hospital: HospitalCardData
  onBack: () => void
  onBookAppointment: (hospital: HospitalCardData, doctor?: DoctorCardData) => void
}

export const HospitalDetailView: FC<HospitalDetailViewProps> = ({
  hospital,
  onBack,
  onBookAppointment,
}) => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<
    'overview' | 'departments' | 'doctors' | 'facilities' | 'gallery'
  >('overview')

  // Live Database Doctors State
  const [hospitalDoctors, setHospitalDoctors] = useState<HospitalDoctorItem[]>([])
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false)
  const [doctorError, setDoctorError] = useState<string | null>(null)

  // Doctor Filter within Hospital
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('All')
  const [doctorSearchQuery, setDoctorSearchQuery] = useState<string>('')

  // Fetch real doctors for this hospital from MongoDB database
  const loadHospitalDoctors = async () => {
    if (!hospital._id) return
    setIsLoadingDoctors(true)
    setDoctorError(null)

    try {
      const response = await hospitalService.getHospitalDoctors(hospital._id, {
        limit: 50,
      })
      const doctorsList = (response as any)?.doctors || []
      setHospitalDoctors(doctorsList)
    } catch (err: any) {
      console.error('Error fetching hospital connected doctors:', err)
      setDoctorError(err.message || 'Failed to fetch doctors for this hospital.')
    } finally {
      setIsLoadingDoctors(false)
    }
  }

  useEffect(() => {
    loadHospitalDoctors()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hospital._id])

  // Navigate to full Doctor Detail Page preserving origin context
  const handleViewDoctorDetail = (doctorId: string) => {
    navigate(`/patient/doctors/${doctorId}`, {
      state: {
        from: 'hospital',
        hospitalId: hospital._id,
        hospitalName: hospital.name,
      },
    })
  }

  // Filter doctors based on department and search query
  const filteredDoctors = hospitalDoctors.filter((doc) => {
    const docName = doc.userId?.name || ''
    const matchesDept =
      selectedDeptFilter === 'All' ||
      doc.department.toLowerCase() === selectedDeptFilter.toLowerCase()
    const matchesSearch =
      !doctorSearchQuery.trim() ||
      docName.toLowerCase().includes(doctorSearchQuery.toLowerCase()) ||
      doc.department.toLowerCase().includes(doctorSearchQuery.toLowerCase()) ||
      (doc.specialization || []).some((s) =>
        s.toLowerCase().includes(doctorSearchQuery.toLowerCase())
      )

    return matchesDept && matchesSearch
  })

  // Doctor Avatar Helper
  const getDoctorAvatar = (doc: HospitalDoctorItem) => {
    if (doc.userId?.avatar) return doc.userId.avatar
    const name = (doc.userId?.name || '').toLowerCase()
    if (name.includes('priya') || name.includes('neha') || name.includes('pooja') || name.includes('kavita')) {
      return drPriyaImg
    }
    if (name.includes('rajesh') || name.includes('vikram') || name.includes('rohan')) {
      return drRajeshImg
    }
    if (name.includes('sneha') || name.includes('ananya') || name.includes('sunita')) {
      return drSnehaImg
    }
    return drAmitImg
  }

  // Map HospitalDoctorItem to DoctorCardData for appointment booking
  const mapToDoctorCardData = (doc: HospitalDoctorItem): DoctorCardData => {
    const docName = doc.userId?.name || 'Dr. Specialist'
    return {
      _id: doc._id,
      name: docName.startsWith('Dr.') ? docName : `Dr. ${docName}`,
      specialty: doc.department || 'Specialist',
      department: doc.department,
      rating: doc.ratingAverage || 4.8,
      reviewCount: doc.reviewCount || 100,
      experienceYears: doc.experienceYears || 8,
      qualifications: doc.qualifications || ['MBBS', 'MD'],
      hospitalName: hospital.name,
      hospitalLocation: hospital.location || `${hospital.address?.city || 'Bilaspur'}, ${hospital.address?.state || ''}`,
      avatar: getDoctorAvatar(doc),
      consultationFee: doc.consultationFee || 500,
      availableStatus: 'Available Today',
      modes: ['In-clinic'],
      distance: hospital.distance || '2.5 km',
      isFavorite: false,
    }
  }

  // Gallery images with fallbacks
  const galleryImages =
    hospital.images?.gallery && hospital.images.gallery.length > 0
      ? hospital.images.gallery
      : [
          hospital.image || '/src/assets/apollo-hospital.jpg',
          'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80',
        ]

  const [selectedImage, setSelectedImage] = useState(galleryImages[0])

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'departments', label: 'Departments' },
    { id: 'doctors', label: `Doctors (${hospitalDoctors.length})` },
    { id: 'facilities', label: 'Facilities' },
    { id: 'gallery', label: 'Gallery' },
  ] as const

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Back Navigation Bar */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer group transition-colors"
      >
        <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Hospitals</span>
      </button>

      {/* Main Presentation Container */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Top Media Gallery & Primary Header */}
        <div className="p-6 sm:p-8 border-b border-slate-100">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Col (Col 6): Main Image Preview & Thumbnail strip */}
            <div className="lg:col-span-6 space-y-3">
              <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden bg-slate-100 shadow-inner">
                <LazyImage
                  src={selectedImage}
                  alt={hospital.name}
                  className="w-full h-full object-cover transition-all duration-300"
                />

                {/* Verified badge */}
                <div className="absolute top-3 left-3 bg-emerald-600/95 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold flex items-center gap-1.5 shadow-md">
                  <ShieldCheck className="size-4" />
                  <span>Verified Healthcare Partner</span>
                </div>
              </div>

              {/* Thumbnails Row */}
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar">
                {galleryImages.map((img, idx) => (
                  <button
                    key={`thumb-${idx}`}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`size-16 sm:size-18 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      selectedImage === img
                        ? 'border-blue-600 ring-2 ring-blue-500/20 scale-105'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <LazyImage src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Right Col (Col 6): Title, Badges, Address, Quick Actions & CTA */}
            <div className="lg:col-span-6 space-y-4">
              {/* Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1">
                  <ShieldCheck className="size-3.5" />
                  Verified Hospital
                </span>
                {hospital.isEmergency24x7 && (
                  <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold flex items-center gap-1">
                    <Clock className="size-3.5" />
                    24x7 Emergency
                  </span>
                )}
                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
                  {hospital.hospitalType || 'Multi-Speciality'}
                </span>
              </div>

              {/* Hospital Title */}
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                {hospital.name}
              </h1>

              {/* Rating Row */}
              <div className="flex items-center gap-2">
                <div className="flex items-center text-amber-500">
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                </div>
                <span className="text-sm font-black text-slate-900">
                  {Number(hospital.rating || 4.8).toFixed(1)}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-bold text-blue-600">
                  {hospital.distance || '2.3 km'} away
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {hospitalDoctors.length} Registered Doctor{hospitalDoctors.length === 1 ? '' : 's'}
                </span>
              </div>

              {/* Address */}
              <div className="flex items-start gap-2 text-slate-600 text-xs sm:text-sm">
                <MapPin className="size-4 shrink-0 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium">
                    {hospital.address?.street
                      ? `${hospital.address.street}, ${hospital.address.city}, ${hospital.address.state || ''} - ${hospital.address.zipCode || ''}`
                      : hospital.location}
                  </p>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(hospital.name + ' ' + (hospital.location || ''))}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1 mt-0.5"
                  >
                    <span>View on Map</span>
                    <ChevronRight className="size-3" />
                  </a>
                </div>
              </div>

              {/* Quick Specs Grid */}
              <div className="grid grid-cols-3 gap-2.5 pt-2">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Beds</p>
                  <p className="text-sm font-black text-slate-900 mt-0.5 flex items-center justify-center gap-1">
                    <Bed className="size-3.5 text-blue-600" />
                    {hospital.totalBeds || 150}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Doctors</p>
                  <p className="text-sm font-black text-blue-600 mt-0.5 flex items-center justify-center gap-1">
                    <Stethoscope className="size-3.5" />
                    {hospitalDoctors.length}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Est. Year</p>
                  <p className="text-sm font-black text-slate-900 mt-0.5">
                    {hospital.establishmentYear || 2012}
                  </p>
                </div>
              </div>

              {/* Primary Action Button */}
              <div className="pt-2 flex items-center gap-3">
                <Button
                  onClick={() => onBookAppointment(hospital)}
                  className="flex-1 h-11 text-sm font-bold rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-2"
                >
                  <CalendarPlus className="size-4" />
                  <span>Book Hospital Consultation</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 sm:px-8 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3.5 px-4 text-xs sm:text-sm font-bold transition-all relative whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'text-blue-600'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="p-6 sm:p-8">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* About description */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-4">
                  <h3 className="text-base font-extrabold text-slate-900">About {hospital.name}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {hospital.description ||
                      `${hospital.name} is a state-of-the-art multi-speciality medical center offering comprehensive OPD, surgical procedures, and emergency diagnostics. Accredited with world-class facilities and experienced medical staff providing round-the-clock clinical care.`}
                  </p>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Emergency</p>
                      <p className="text-sm sm:text-base font-black text-rose-600 mt-1 flex items-center gap-1.5">
                        <Clock className="size-4 text-rose-500" />
                        24x7 Available
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hospital Type</p>
                      <p className="text-sm sm:text-base font-black text-slate-900 mt-1 flex items-center gap-1.5">
                        <Building2 className="size-4 text-blue-600" />
                        {hospital.hospitalType || 'Multi-Speciality'}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">License Status</p>
                      <p className="text-sm sm:text-base font-black text-emerald-600 mt-1 flex items-center gap-1.5">
                        <Award className="size-4 text-emerald-600" />
                        Verified
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Info Card: Contact & Hours */}
                <div className="lg:col-span-4 bg-slate-50 rounded-2xl border border-slate-200/80 p-5 space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Contact Information
                    </h4>
                    <div className="space-y-2 text-xs text-slate-600">
                      <p className="flex items-center gap-2">
                        <Phone className="size-3.5 text-blue-600" />
                        <span>{hospital.contactPhone || '+91 7752 494000'}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Mail className="size-3.5 text-blue-600" />
                        <span className="truncate">{hospital.contactEmail || 'care@curehealth.org'}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Globe className="size-3.5 text-blue-600" />
                        <span className="truncate">{hospital.website || 'www.curehealth.org'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-slate-200/70 pt-3 space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Working Hours</h4>
                    <p className="text-xs text-slate-600 flex items-center gap-2">
                      <Clock className="size-3.5 text-slate-400" />
                      <span>Mon - Sun: {hospital.openingTime || '09:00'} - {hospital.closingTime || '23:00'}</span>
                    </p>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 text-[11px] font-bold border border-rose-100">
                      <span className="size-1.5 rounded-full bg-rose-500 animate-pulse" />
                      <span>24x7 Emergency Services Active</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Departments Overview */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-slate-900">Departments</h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('departments')}
                    className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    View All
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {(hospital.departments || ['General Medicine', 'Cardiology', 'Orthopedics', 'Pediatrics', 'Gynecology', 'Dermatology']).map((dept) => (
                    <div
                      key={dept}
                      onClick={() => {
                        setSelectedDeptFilter(dept)
                        setActiveTab('doctors')
                      }}
                      className="p-3.5 rounded-2xl border border-slate-200/80 hover:border-blue-300 hover:shadow-xs transition-all flex flex-col items-center text-center space-y-1.5 group cursor-pointer"
                    >
                      <div className="size-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Activity className="size-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {dept}
                      </p>
                      <p className="text-[10px] text-slate-400">Available</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real Doctors Connected from Database Preview */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Doctors at This Hospital
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Real specialists connected directly from database
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('doctors')}
                    className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    View All ({hospitalDoctors.length})
                  </button>
                </div>

                {isLoadingDoctors ? (
                  <div className="py-12 flex flex-col items-center justify-center space-y-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                    <IndustrialSpinner size="md" />
                    <p className="text-xs font-bold text-slate-400">Loading affiliated doctors from database...</p>
                  </div>
                ) : doctorError ? (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="size-4 text-rose-600" />
                      <span>{doctorError}</span>
                    </div>
                    <Button
                      onClick={loadHospitalDoctors}
                      variant="outline"
                      className="h-7 text-xs font-bold bg-white text-rose-700 border-rose-200 cursor-pointer"
                    >
                      Retry
                    </Button>
                  </div>
                ) : hospitalDoctors.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/70 text-center space-y-2">
                    <Stethoscope className="size-8 text-slate-300 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">No doctors currently affiliated with this hospital.</p>
                    <p className="text-[11px] text-slate-400">New doctors will appear here once affiliated.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {hospitalDoctors.slice(0, 4).map((doc) => {
                      const docName = doc.userId?.name || 'Dr. Specialist'
                      const displayName = docName.startsWith('Dr.') ? docName : `Dr. ${docName}`
                      const avatarSrc = getDoctorAvatar(doc)

                      return (
                        <div
                          key={doc._id}
                          className="p-4 rounded-2xl border border-slate-200/80 hover:shadow-md transition-all flex flex-col justify-between space-y-3 bg-white group"
                        >
                          {/* Top row: Avatar + info - one-click redirection to DoctorDetailPage */}
                          <div
                            onClick={() => handleViewDoctorDetail(doc._id)}
                            className="flex items-start gap-3 cursor-pointer"
                            title="View Full Doctor Profile"
                          >
                            <div className="size-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100 group-hover:ring-2 group-hover:ring-blue-400 transition-all">
                              <LazyImage src={avatarSrc} alt={displayName} className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                                {displayName}
                              </h4>
                              <p className="text-[11px] text-blue-600 font-semibold truncate">
                                {doc.department}
                              </p>
                              <div className="flex items-center gap-1 text-[10px] text-slate-500 pt-0.5">
                                <Star className="size-3 fill-amber-400 text-amber-400" />
                                <span className="font-bold text-slate-800">
                                  {Number(doc.ratingAverage || 4.8).toFixed(1)}
                                </span>
                                <span>({doc.experienceYears || 8}+ yrs)</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                            <Button
                              type="button"
                              onClick={() => handleViewDoctorDetail(doc._id)}
                              variant="outline"
                              className="flex-1 h-8 text-[11px] font-bold rounded-xl border-slate-200 hover:bg-blue-50 hover:text-blue-600 text-slate-700 cursor-pointer flex items-center justify-center gap-1"
                            >
                              <span>View Profile</span>
                              <ExternalLink className="size-3" />
                            </Button>
                            <Button
                              type="button"
                              onClick={() => onBookAppointment(hospital, mapToDoctorCardData(doc))}
                              className="h-8 px-3 text-[11px] font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                            >
                              Book
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* DEPARTMENTS TAB */}
          {activeTab === 'departments' && (
            <div className="space-y-4">
              <h3 className="text-base font-extrabold text-slate-900">Clinical Departments & Specialties</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(hospital.departments || []).map((dept) => (
                  <div
                    key={dept}
                    onClick={() => {
                      setSelectedDeptFilter(dept)
                      setActiveTab('doctors')
                    }}
                    className="p-4 rounded-2xl border border-slate-200/80 hover:border-blue-300 hover:shadow-xs transition-all flex items-start gap-3 cursor-pointer group"
                  >
                    <div className="size-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Stethoscope className="size-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {dept}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Comprehensive diagnostic, OPD, and inpatient surgical procedures for {dept.toLowerCase()}.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DOCTORS TAB - Real connected doctors with search, department filtering & redirection to full profile */}
          {activeTab === 'doctors' && (
            <div className="space-y-6">
              {/* Top Controls: Search & Department pills */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Medical Specialists at {hospital.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {hospitalDoctors.length} verified doctors affiliated with this facility in database
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search doctor or specialty..."
                    value={doctorSearchQuery}
                    onChange={(e) => setDoctorSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Department Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                <button
                  type="button"
                  onClick={() => setSelectedDeptFilter('All')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                    selectedDeptFilter === 'All'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  All Specialists ({hospitalDoctors.length})
                </button>
                {(hospital.departments || []).map((dept) => {
                  const count = hospitalDoctors.filter(
                    (d) => d.department.toLowerCase() === dept.toLowerCase()
                  ).length
                  return (
                    <button
                      key={dept}
                      type="button"
                      onClick={() => setSelectedDeptFilter(dept)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                        selectedDeptFilter === dept
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                      }`}
                    >
                      {dept} {count > 0 ? `(${count})` : ''}
                    </button>
                  )
                })}
              </div>

              {/* Loading / Error / Doctors Grid */}
              {isLoadingDoctors ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-4">
                  <IndustrialSpinner size="lg" />
                  <p className="text-xs font-bold text-slate-500">
                    Querying affiliated specialists from database...
                  </p>
                </div>
              ) : doctorError ? (
                <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <AlertCircle className="size-4.5 text-rose-600" />
                    <span>Failed to retrieve hospital doctors</span>
                  </div>
                  <p className="text-xs text-rose-600">{doctorError}</p>
                  <Button
                    onClick={loadHospitalDoctors}
                    className="h-8 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
                  >
                    <RefreshCw className="size-3.5 mr-1.5" />
                    Retry
                  </Button>
                </div>
              ) : filteredDoctors.length === 0 ? (
                <div className="p-12 rounded-3xl bg-slate-50 border border-slate-200/70 text-center space-y-3">
                  <Stethoscope className="size-10 text-slate-300 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-800">No doctors found</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {hospitalDoctors.length === 0
                      ? 'No doctors are currently affiliated with this hospital in the database.'
                      : 'No specialists matched your active search query or department filter.'}
                  </p>
                  {(doctorSearchQuery || selectedDeptFilter !== 'All') && (
                    <Button
                      onClick={() => {
                        setDoctorSearchQuery('')
                        setSelectedDeptFilter('All')
                      }}
                      variant="outline"
                      className="rounded-xl text-xs font-semibold text-blue-600 border-blue-200 cursor-pointer"
                    >
                      Reset Filter
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredDoctors.map((doc) => {
                    const docName = doc.userId?.name || 'Dr. Specialist'
                    const displayName = docName.startsWith('Dr.') ? docName : `Dr. ${docName}`
                    const avatarSrc = getDoctorAvatar(doc)

                    return (
                      <div
                        key={doc._id}
                        className="p-5 rounded-2xl border border-slate-200/80 flex flex-col justify-between space-y-4 bg-white shadow-2xs hover:shadow-md hover:border-blue-200 transition-all group"
                      >
                        {/* Top row: Avatar + info - one-click redirection to DoctorDetailPage */}
                        <div
                          onClick={() => handleViewDoctorDetail(doc._id)}
                          className="flex items-start gap-3.5 cursor-pointer"
                          title="View Full Doctor Profile"
                        >
                          <div className="size-16 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100 shadow-xs group-hover:ring-2 group-hover:ring-blue-400 transition-all">
                            <LazyImage
                              src={avatarSrc}
                              alt={displayName}
                              className="w-full h-full object-cover object-top"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                              {displayName}
                            </h4>
                            <p className="text-xs text-blue-600 font-semibold">{doc.department}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                              {doc.qualifications?.join(', ') || 'MBBS, MD'}
                            </p>
                            <div className="flex items-center gap-1.5 text-xs text-slate-700 pt-1 font-medium">
                              <Star className="size-3.5 fill-amber-400 text-amber-400" />
                              <span className="font-bold">
                                {Number(doc.ratingAverage || 4.8).toFixed(1)}
                              </span>
                              <span className="text-slate-400">
                                ({doc.experienceYears || 8}+ yrs exp)
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Specialization Tags */}
                        {doc.specialization && doc.specialization.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {doc.specialization.slice(0, 3).map((spec, sIdx) => (
                              <span
                                key={`spec-${sIdx}`}
                                className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold"
                              >
                                {spec}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Footer: Fee & Action Buttons */}
                        <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                          <div>
                            <span className="text-slate-400">Fee:</span>{' '}
                            <span className="font-extrabold text-slate-900">
                              ₹{doc.consultationFee || 500}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              onClick={() => handleViewDoctorDetail(doc._id)}
                              variant="outline"
                              className="h-8 px-3 text-xs font-bold rounded-xl border-slate-200 hover:bg-blue-50 hover:text-blue-600 text-slate-700 cursor-pointer flex items-center gap-1"
                            >
                              <span>View Profile</span>
                              <ExternalLink className="size-3" />
                            </Button>
                            <Button
                              type="button"
                              onClick={() => onBookAppointment(hospital, mapToDoctorCardData(doc))}
                              className="h-8 px-3 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                            >
                              Book Appt
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* FACILITIES TAB */}
          {activeTab === 'facilities' && (
            <div className="space-y-4">
              <h3 className="text-base font-extrabold text-slate-900">Hospital Facilities & Medical Amenities</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(hospital.facilities || ['24x7 Emergency', 'Ambulance', 'ICU', 'Diagnostic Lab', 'Pharmacy', 'Parking']).map((f) => (
                  <div key={f} className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/50 flex items-center gap-3">
                    <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
                    <span className="text-xs sm:text-sm font-bold text-slate-800">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GALLERY TAB */}
          {activeTab === 'gallery' && (
            <div className="space-y-4">
              <h3 className="text-base font-extrabold text-slate-900">Hospital Infrastructure & Facility Gallery</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {galleryImages.map((img, idx) => (
                  <div key={idx} className="h-56 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                    <LazyImage src={img} alt={`Facility ${idx + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default HospitalDetailView
