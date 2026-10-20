import { useState, type FC } from 'react'
import {
  ArrowLeft,
  Star,
  MapPin,
  Phone,
  Navigation,
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
} from 'lucide-react'
import type { HospitalCardData, DoctorCardData } from '@/types/patient'
import { Button } from '@/components/ui/button'
import { LazyImage } from '@/components/common/LazyImage'
import { useDoctorStore } from '@/store/doctorStore'

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
  const [activeTab, setActiveTab] = useState<
    'overview' | 'departments' | 'doctors' | 'facilities' | 'gallery'
  >('overview')

  const { doctors } = useDoctorStore()

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

  // Filter doctors associated with this hospital (or top doctors)
  const hospitalDoctors = doctors.filter(
    (d) =>
      d.hospitalName.toLowerCase().includes(hospital.name.toLowerCase()) ||
      hospital.name.toLowerCase().includes(d.hospitalName.toLowerCase())
  )
  const displayDoctors = hospitalDoctors.length > 0 ? hospitalDoctors : doctors.slice(0, 4)

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'departments', label: 'Departments' },
    { id: 'doctors', label: 'Doctors' },
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
                    href={`https://maps.google.com/?q=${encodeURIComponent(hospital.name + ' ' + hospital.location)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1 mt-0.5"
                  >
                    <span>View on Map</span>
                    <ChevronRight className="size-3" />
                  </a>
                </div>
              </div>

              {/* Action Buttons: Call, Directions, Website */}
              <div className="grid grid-cols-3 gap-2.5 pt-2">
                <a
                  href={`tel:${hospital.contactPhone || hospital.phoneNumber}`}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200/90 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                >
                  <Phone className="size-3.5 text-blue-600" />
                  <span>Call</span>
                </a>

                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(hospital.name + ' ' + hospital.location)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200/90 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                >
                  <Navigation className="size-3.5 text-blue-600" />
                  <span>Directions</span>
                </a>

                <a
                  href={hospital.website || 'https://www.curehealth.org'}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200/90 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                >
                  <Globe className="size-3.5 text-blue-600" />
                  <span>Website</span>
                </a>
              </div>

              {/* Primary Book Appointment CTA */}
              <Button
                onClick={() => onBookAppointment(hospital)}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CalendarPlus className="size-4.5" />
                <span>Book Appointment</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Header */}
        <div className="border-b border-slate-200 px-6 sm:px-8 bg-slate-50/50">
          <div className="flex items-center gap-4 sm:gap-8 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-3.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* About Section */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 space-y-4">
                  <h3 className="text-base font-extrabold text-slate-900">About Hospital</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {hospital.description ||
                      `${hospital.name} is a leading healthcare institution offering world-class medical care with advanced technology, experienced specialists, and dedicated nursing care. We are committed to providing comprehensive and compassionate healthcare services to our community.`}
                  </p>

                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Establishment Year
                      </p>
                      <p className="text-sm sm:text-base font-black text-slate-900 mt-1 flex items-center gap-1.5">
                        <CalendarPlus className="size-4 text-blue-600" />
                        {hospital.establishmentYear || 2010}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Total Capacity
                      </p>
                      <p className="text-sm sm:text-base font-black text-slate-900 mt-1 flex items-center gap-1.5">
                        <Bed className="size-4 text-blue-600" />
                        {hospital.totalBeds || 200}+ Beds
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Hospital Type
                      </p>
                      <p className="text-sm sm:text-base font-black text-slate-900 mt-1 flex items-center gap-1.5">
                        <Building2 className="size-4 text-blue-600" />
                        {hospital.hospitalType || 'Multi-Speciality'}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        License Status
                      </p>
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
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Working Hours
                    </h4>
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

              {/* Top Doctors at This Hospital */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-slate-900">
                    Top Doctors at This Hospital
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('doctors')}
                    className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    View All Doctors
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {displayDoctors.map((doc) => (
                    <div
                      key={doc._id}
                      className="p-4 rounded-2xl border border-slate-200/80 hover:shadow-md transition-all flex flex-col justify-between space-y-3 bg-white"
                    >
                      <div className="flex items-start gap-3">
                        <div className="size-12 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                          <LazyImage src={doc.avatar} alt={doc.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                            {doc.name}
                          </h4>
                          <p className="text-[11px] text-blue-600 font-semibold truncate">
                            {doc.specialty}
                          </p>
                          <div className="flex items-center gap-1 text-[10px] text-slate-500 pt-0.5">
                            <Star className="size-3 fill-amber-400 text-amber-400" />
                            <span className="font-bold text-slate-800">{doc.rating}</span>
                            <span>({doc.experienceYears}+ yrs)</span>
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={() => onBookAppointment(hospital, doc)}
                        className="w-full h-8 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                      >
                        Book Appointment
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* DEPARTMENTS TAB */}
          {activeTab === 'departments' && (
            <div className="space-y-4">
              <h3 className="text-base font-extrabold text-slate-900">Clinical Departments & Specialties</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(hospital.departments || []).map((dept) => (
                  <div key={dept} className="p-4 rounded-2xl border border-slate-200/80 flex items-start gap-3">
                    <div className="size-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Stethoscope className="size-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{dept}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Comprehensive diagnostic, OPD, and inpatient surgical procedures for {dept.toLowerCase()}.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DOCTORS TAB */}
          {activeTab === 'doctors' && (
            <div className="space-y-4">
              <h3 className="text-base font-extrabold text-slate-900">Medical Specialists at {hospital.name}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayDoctors.map((doc) => (
                  <div key={doc._id} className="p-4 rounded-2xl border border-slate-200/80 flex flex-col justify-between space-y-3 bg-white shadow-2xs">
                    <div className="flex items-start gap-3.5">
                      <div className="size-14 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                        <LazyImage src={doc.avatar} alt={doc.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-slate-900">{doc.name}</h4>
                        <p className="text-xs text-blue-600 font-semibold">{doc.specialty}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{doc.qualifications?.join(', ') || 'MBBS, MD'}</p>
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 pt-1 font-medium">
                          <Star className="size-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-bold">{doc.rating}</span>
                          <span className="text-slate-400">({doc.reviewCount} reviews)</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
                      <div>
                        <span className="text-slate-400">Fee:</span>{' '}
                        <span className="font-extrabold text-slate-900">₹{doc.consultationFee || 500}</span>
                      </div>
                      <Button
                        onClick={() => onBookAppointment(hospital, doc)}
                        className="h-8 px-4 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                      >
                        Book Appt
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
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
