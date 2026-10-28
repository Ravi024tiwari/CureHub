import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Building2,
  MapPin,
  BedDouble,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle,
  ExternalLink,
  Phone,
  Mail,
  Globe,
  Calendar,
  ShieldCheck,
  Stethoscope,
  Heart,
  UserPlus,
  Loader2,
  RefreshCw,
  Copy,
  Check,
  Activity,
  Ambulance,
  Share2,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { DoctorSidebar, DoctorHeader } from '@/components/doctor/dashboard'
import { DoctorJoinHospitalModal } from '@/components/doctor/hospitals'
import { doctorService } from '@/services/doctorService'
import type { DoctorHospitalItem } from '@/types/doctorHospital'

import apolloImg from '@/assets/apollo-hospital.jpg'
import cityCareImg from '@/assets/city-care-hospital.jpg'
import shreeSaiImg from '@/assets/shree-sai-hospital.jpg'
import lifecareImg from '@/assets/lifecare-hospital.jpg'

export const DoctorHospitalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [hospital, setHospital] = useState<DoctorHospitalItem | null>(null)
  const [affiliatedDoctors, setAffiliatedDoctors] = useState<any[]>([])
  const [joinRequest, setJoinRequest] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'departments' | 'facilities' | 'doctors' | 'location'>('overview')
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [selectedImageIdx, setSelectedImageIdx] = useState(0)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [isFavorite, setIsFavorite] = useState<boolean>(() => {
    try {
      if (!id) return false
      const saved = localStorage.getItem('curehealth_doc_fav_hospitals')
      if (!saved) return false
      const list = JSON.parse(saved)
      return Array.isArray(list) && list.includes(id)
    } catch {
      return false
    }
  })

  // Fetch hospital details
  const fetchDetails = useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)
      setError(null)
      const res = await doctorService.getDoctorHospitalDetail(id)
      if (res && res.hospital) {
        setHospital(res.hospital)
        setJoinRequest(res.joinRequest || null)
        setAffiliatedDoctors(res.doctors || [])
      } else {
        setError('Hospital details could not be found.')
      }
    } catch (err: any) {
      console.error('Error fetching hospital detail:', err)
      setError(err?.response?.data?.message || err?.message || 'Failed to load hospital details.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchDetails()
  }, [fetchDetails])

  const doctorName = user?.name ? (user.name.startsWith('Dr.') ? user.name : `Dr. ${user.name}`) : 'Doctor'

  // Success handler for join request
  const handleJoinSuccess = (_hospitalId: string, department: string) => {
    setHospital((prev) =>
      prev
        ? {
            ...prev,
            hasRequested: true,
            requestStatus: 'PENDING',
            requestedDepartment: department,
          }
        : null
    )
    setJoinRequest({
      status: 'PENDING',
      department,
      createdAt: new Date().toISOString(),
    })
  }

  // Toggle favorite
  const handleToggleFavorite = () => {
    if (!id) return
    setIsFavorite((prev) => {
      const next = !prev
      try {
        const saved = localStorage.getItem('curehealth_doc_fav_hospitals')
        const set = new Set(saved ? JSON.parse(saved) : [])
        if (next) set.add(id)
        else set.delete(id)
        localStorage.setItem('curehealth_doc_fav_hospitals', JSON.stringify([...set]))
      } catch (e) {
        console.error(e)
      }
      return next
    })
  }

  // Copy to clipboard helper
  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(fieldName)
    setTimeout(() => setCopiedField(null), 2000)
  }

  // Fallback gallery images
  const getImages = () => {
    if (hospital?.images?.gallery && hospital.images.gallery.length > 0) {
      return hospital.images.gallery
    }
    if (hospital?.images?.coverImage) {
      return [hospital.images.coverImage]
    }
    const name = hospital?.name?.toLowerCase() || ''
    if (name.includes('apollo') || name.includes('aarogya')) return [apolloImg, cityCareImg, lifecareImg, shreeSaiImg]
    if (name.includes('city') || name.includes('care')) return [cityCareImg, apolloImg, shreeSaiImg, lifecareImg]
    if (name.includes('sai') || name.includes('sunrise')) return [shreeSaiImg, lifecareImg, apolloImg, cityCareImg]
    return [apolloImg, cityCareImg, shreeSaiImg, lifecareImg]
  }

  const images = getImages()
  const activeImage = images[selectedImageIdx] || images[0]

  const addressText = hospital?.address
    ? `${hospital.address.street ? hospital.address.street + ', ' : ''}${hospital.address.city || ''}, ${hospital.address.state || ''}${hospital.address.zipCode ? ' - ' + hospital.address.zipCode : ''}`
    : 'Location address available upon request'

  const mapQuery = encodeURIComponent(
    hospital ? `${hospital.name}, ${hospital.address?.city || ''}, ${hospital.address?.state || ''}` : ''
  )

  const isPending = hospital?.requestStatus === 'PENDING'
  const isAffiliated = hospital?.isAffiliated

  return (
    <div className="h-screen w-full overflow-hidden bg-[#F8FAFC] text-slate-900 flex selection:bg-blue-100 selection:text-blue-700 antialiased">
      {/* 1. Desktop Persistent Sidebar */}
      <div className="hidden lg:block h-screen shrink-0">
        <DoctorSidebar />
      </div>

      {/* 2. Mobile Drawer Sidebar */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative z-50 w-64 max-w-[80vw] h-full shadow-2xl animate-in slide-in-from-left duration-200">
            <DoctorSidebar onCloseMobile={() => setIsMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* 3. Main Body Scroll Container */}
      <div className="flex-1 h-screen overflow-y-auto overflow-x-hidden flex flex-col min-w-0">
        <DoctorHeader
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
          doctorName={doctorName}
          avatar={user?.avatar || null}
        />

        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-6 pb-36">
          {/* Top Navigation & Breadcrumbs Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => navigate('/doctor/hospitals')}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors py-2 px-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 shadow-2xs cursor-pointer group"
            >
              <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
              <span>Back to Hospitals</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleFavorite}
                className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
                  isFavorite
                    ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-2xs'
                    : 'bg-white border-slate-200/80 text-slate-600 hover:text-rose-600 hover:bg-rose-50/50'
                }`}
                title={isFavorite ? 'Saved to favorites' : 'Save hospital'}
              >
                <Heart className={`size-4 ${isFavorite ? 'fill-current text-rose-600' : ''}`} />
                <span className="hidden sm:inline">{isFavorite ? 'Saved' : 'Save'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopy(window.location.href, 'share')}
                className="p-2 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                title="Share Hospital link"
              >
                {copiedField === 'share' ? (
                  <>
                    <Check className="size-4 text-emerald-600" />
                    <span className="text-emerald-600 font-bold hidden sm:inline">Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="size-4" />
                    <span className="hidden sm:inline">Share</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Loading View */}
          {loading ? (
            <div className="min-h-[460px] flex flex-col items-center justify-center space-y-4 bg-white rounded-3xl border border-slate-200/80 p-12 shadow-2xs">
              <Loader2 className="size-10 text-blue-600 animate-spin" />
              <p className="text-sm font-semibold text-slate-500">Loading complete hospital details...</p>
            </div>
          ) : error || !hospital ? (
            <div className="bg-white rounded-3xl border border-rose-200 p-8 text-center space-y-4 shadow-2xs">
              <div className="size-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <AlertCircle className="size-7" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">{error || 'Hospital Not Found'}</h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Unable to retrieve the requested hospital information. Please check your connection or retry.
              </p>
              <button
                onClick={fetchDetails}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2 shadow-xs"
              >
                <RefreshCw className="size-4" />
                <span>Retry Loading</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Main Visual & Overview Card */}
              <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
                {/* 1. Hero Image Showcase */}
                <div className="relative h-60 sm:h-72 md:h-84 lg:h-96 w-full overflow-hidden bg-slate-100">
                  <img
                    src={activeImage}
                    alt={hospital.name}
                    className="size-full object-cover transition-all duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />

                  {/* Floating Status Badge (Top Right) */}
                  <div className="absolute top-4 right-4 z-10">
                    {isAffiliated ? (
                      <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-500 text-white shadow-lg backdrop-blur-md flex items-center gap-1.5">
                        <CheckCircle2 className="size-4" />
                        <span>Affiliated Facility</span>
                      </span>
                    ) : isPending ? (
                      <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-blue-600 text-white shadow-lg backdrop-blur-md flex items-center gap-1.5">
                        <Clock className="size-4" />
                        <span>Already Requested</span>
                      </span>
                    ) : (
                      <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-600 text-white shadow-lg backdrop-blur-md flex items-center gap-1.5">
                        <Sparkles className="size-4" />
                        <span>Open for Requests</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. Gallery Thumbnails Strip */}
                {images.length > 1 && (
                  <div className="p-3 bg-slate-50/90 border-b border-slate-100 flex items-center gap-2.5 overflow-x-auto">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedImageIdx(idx)}
                        className={`relative size-16 sm:size-18 rounded-2xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                          selectedImageIdx === idx
                            ? 'border-blue-600 scale-105 shadow-md ring-2 ring-blue-500/20'
                            : 'border-transparent opacity-75 hover:opacity-100 hover:scale-[1.02]'
                        }`}
                      >
                        <img src={img} alt={`Gallery ${idx + 1}`} className="size-full object-cover" />
                      </button>
                    ))}
                    {images.length > 4 && (
                      <span className="text-[11px] font-bold text-slate-500 px-3 shrink-0">
                        +{images.length - 4} photos
                      </span>
                    )}
                  </div>
                )}

                {/* 3. Hospital Identity & Location Section */}
                <div className="p-5 sm:p-6 lg:p-7 space-y-5">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="space-y-2">
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                        {hospital.name}
                      </h1>

                      <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 font-medium flex-wrap">
                        <span className="flex items-center gap-1 text-slate-500">
                          <MapPin className="size-4 text-blue-600 shrink-0" />
                          <span>{hospital.address?.city || ''}, {hospital.address?.state || ''}</span>
                        </span>
                        {hospital.distance && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                              {hospital.distance} away
                            </span>
                          </>
                        )}
                        <span className="text-slate-300">•</span>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>View on Map</span>
                          <ExternalLink className="size-3" />
                        </a>
                      </div>

                      {/* Tag Badges */}
                      <div className="flex items-center gap-2 flex-wrap pt-1">
                        <span className="px-3 py-1 rounded-xl text-xs font-black bg-blue-50 text-blue-700 border border-blue-200/60 shadow-2xs">
                          {hospital.hospitalType || 'Multi-Speciality'}
                        </span>
                        <span className="px-3 py-1 rounded-xl text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-2xs">
                          {hospital.hospitalType?.includes('Private') ? 'Private Healthcare' : 'Recognized Institution'}
                        </span>
                        {hospital.isEmergency24x7 && (
                          <span className="px-3 py-1 rounded-xl text-xs font-black bg-rose-50 text-rose-700 border border-rose-200/60 flex items-center gap-1.5 shadow-2xs">
                            <span className="size-1.5 rounded-full bg-rose-600 animate-pulse" />
                            <span>24x7 Emergency Ready</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 4. Three Clean Metric Counters */}
                  <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-2">
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-blue-50/70 to-white border border-blue-100/90 shadow-2xs text-center group hover:border-blue-200 transition-all">
                      <div className="size-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-1.5 transition-transform group-hover:scale-105">
                        <BedDouble className="size-5" />
                      </div>
                      <span className="text-xl sm:text-2xl font-black text-slate-900 block tracking-tight">
                        {hospital.totalBeds || 120}
                      </span>
                      <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block mt-0.5">
                        Total Beds
                      </span>
                    </div>

                    <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-purple-50/70 to-white border border-purple-100/90 shadow-2xs text-center group hover:border-purple-200 transition-all">
                      <div className="size-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-1.5 transition-transform group-hover:scale-105">
                        <Building2 className="size-5" />
                      </div>
                      <span className="text-xl sm:text-2xl font-black text-slate-900 block tracking-tight">
                        {hospital.departments?.length || 8}
                      </span>
                      <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block mt-0.5">
                        Departments
                      </span>
                    </div>

                    <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-emerald-50/70 to-white border border-emerald-100/90 shadow-2xs text-center group hover:border-emerald-200 transition-all">
                      <div className="size-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-1.5 transition-transform group-hover:scale-105">
                        <Users className="size-5" />
                      </div>
                      <span className="text-xl sm:text-2xl font-black text-slate-900 block tracking-tight">
                        {hospital.doctorCount || affiliatedDoctors.length || 24}
                      </span>
                      <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block mt-0.5">
                        Active Doctors
                      </span>
                    </div>
                  </div>
                </div>

                {/* 5. Clean Navigation Tabs */}
                <div className="border-t border-slate-100 px-5 sm:px-6 bg-slate-50/50 flex items-center gap-2 sm:gap-4 overflow-x-auto scrollbar-none">
                  {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'departments', label: `Departments (${hospital.departments?.length || 0})` },
                    { id: 'facilities', label: 'Facilities' },
                    { id: 'doctors', label: `Doctors (${hospital.doctorCount || affiliatedDoctors.length || 0})` },
                    { id: 'location', label: 'Location' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`py-3.5 px-3 border-b-2 text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                        activeTab === tab.id
                          ? 'border-blue-600 text-blue-600 shadow-2xs font-extrabold'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab 1: Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Pending Application Status Callout */}
                  {isPending && joinRequest && (
                    <div className="p-5 rounded-3xl bg-gradient-to-r from-blue-50 to-indigo-50/70 border border-blue-200/80 text-blue-950 space-y-3 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="size-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                            <Clock className="size-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-slate-900">Affiliation Request Pending</h4>
                            <p className="text-xs text-blue-700">
                              Application submitted for{' '}
                              <strong className="font-extrabold text-blue-900">
                                {joinRequest.department || hospital.requestedDepartment || 'Specialty'}
                              </strong>
                            </p>
                          </div>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white shadow-xs">
                          In Review
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed">
                        Your request has been routed to the medical superintendent & administrator at {hospital.name}. Once approved, you will be notified and can set your consultation hours.
                      </p>

                      {joinRequest.message && (
                        <div className="p-3 rounded-2xl bg-white/80 border border-blue-200/60 text-xs text-slate-700">
                          <span className="font-bold text-slate-800 block mb-0.5">Your Note:</span>
                          <span className="italic">"{joinRequest.message}"</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* About Hospital */}
                  <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 lg:p-7 space-y-3 shadow-2xs">
                    <h3 className="text-base sm:text-lg font-black text-slate-900">About Hospital</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      {hospital.description ||
                        `${hospital.name} is one of the region's prominent medical facilities, offering comprehensive patient care across various medical and surgical specialties with advanced clinical infrastructure.`}
                    </p>
                  </div>

                  {/* Hospital Specifications Table */}
                  <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 lg:p-7 space-y-4 shadow-2xs">
                    <h3 className="text-base sm:text-lg font-black text-slate-900">Hospital Specifications</h3>

                    <div className="divide-y divide-slate-100 text-xs sm:text-sm">
                      <div className="py-3 flex items-center justify-between gap-4">
                        <span className="text-slate-500 font-medium">Established</span>
                        <span className="font-bold text-slate-900">{hospital.establishmentYear || '2018'}</span>
                      </div>

                      <div className="py-3 flex items-center justify-between gap-4">
                        <span className="text-slate-500 font-medium">Hospital Type</span>
                        <span className="font-bold text-slate-900">{hospital.hospitalType || 'Private Hospital'}</span>
                      </div>

                      <div className="py-3 flex items-center justify-between gap-4">
                        <span className="text-slate-500 font-medium">Registration No.</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 font-mono">
                            {hospital.licenseNumber || 'CG-HOSP-2026-10482'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(hospital.licenseNumber || 'CG-HOSP-2026-10482', 'reg')}
                            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                            title="Copy registration number"
                          >
                            {copiedField === 'reg' ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="py-3 flex items-center justify-between gap-4">
                        <span className="text-slate-500 font-medium">Website</span>
                        <a
                          href={hospital.website?.startsWith('http') ? hospital.website : `https://${hospital.website || 'www.curehealth.com'}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1 cursor-pointer truncate max-w-[200px] sm:max-w-xs"
                        >
                          <span className="truncate">{hospital.website || 'www.curehealth.com'}</span>
                          <ExternalLink className="size-3 shrink-0" />
                        </a>
                      </div>

                      <div className="py-3 flex items-center justify-between gap-4">
                        <span className="text-slate-500 font-medium">Contact Phone</span>
                        <a
                          href={`tel:${hospital.contactPhone || '+917000012345'}`}
                          className="font-bold text-slate-900 hover:text-blue-600 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Phone className="size-3.5 text-slate-400" />
                          <span>{hospital.contactPhone || '+91 70000 12345'}</span>
                        </a>
                      </div>

                      <div className="py-3 flex items-center justify-between gap-4">
                        <span className="text-slate-500 font-medium">Contact Email</span>
                        <a
                          href={`mailto:${hospital.contactEmail || 'admin@hospital.com'}`}
                          className="font-bold text-slate-900 hover:text-blue-600 transition-colors inline-flex items-center gap-1.5 cursor-pointer truncate max-w-[200px] sm:max-w-xs"
                        >
                          <Mail className="size-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{hospital.contactEmail || 'admin@hospital.com'}</span>
                        </a>
                      </div>

                      <div className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-4">
                        <span className="text-slate-500 font-medium shrink-0">Address</span>
                        <span className="font-bold text-slate-900 sm:text-right">{addressText}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Departments */}
              {activeTab === 'departments' && (
                <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 lg:p-7 space-y-5 shadow-2xs">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900">Clinical Departments</h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                      Specialized medical and surgical departments available at this hospital facility.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                    {hospital.departments && hospital.departments.length > 0 ? (
                      hospital.departments.map((dept, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-slate-50/80 hover:bg-blue-50/60 border border-slate-200/70 hover:border-blue-200 transition-all flex items-center justify-between gap-3 group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="size-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                              <Stethoscope className="size-5" />
                            </div>
                            <span className="text-xs sm:text-sm font-bold text-slate-800 truncate">{dept}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 col-span-full">No departments listed for this hospital.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 3: Facilities */}
              {activeTab === 'facilities' && (
                <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 lg:p-7 space-y-5 shadow-2xs">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900">Hospital Facilities & Tech</h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                      Infrastructure and specialized healthcare amenities provided at this institution.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                    {(hospital.facilities && hospital.facilities.length > 0
                      ? hospital.facilities
                      : [
                          '24x7 Emergency Services',
                          'Intensive Care Unit (ICU)',
                          'Modular Operation Theaters',
                          'Automated Diagnostic Lab',
                          'Digital X-Ray & MRI Center',
                          'In-house Pharmacy',
                          'Ambulance Fleet Support',
                          'Blood Storage Facility',
                          'Cardiac Cath Lab',
                          'Dialysis Center',
                        ]
                    ).map((facility, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex items-center gap-3"
                      >
                        <div className="size-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="size-4" />
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-slate-800">{facility}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 4: Doctors */}
              {activeTab === 'doctors' && (
                <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 lg:p-7 space-y-5 shadow-2xs">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900">Affiliated Medical Specialists</h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                      Doctors and consultants currently practicing at this hospital.
                    </p>
                  </div>

                  {affiliatedDoctors.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {affiliatedDoctors.map((doc, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex items-center gap-3.5"
                        >
                          <div className="size-11 rounded-xl bg-blue-100 text-blue-600 font-bold text-sm flex items-center justify-center shrink-0">
                            Dr
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                              {doc.userId?.name ? (doc.userId.name.startsWith('Dr.') ? doc.userId.name : `Dr. ${doc.userId.name}`) : 'Doctor'}
                            </h4>
                            <p className="text-xs text-slate-500 truncate">{doc.department || 'Medical Specialist'}</p>
                            {doc.experienceYears && (
                              <p className="text-[11px] font-semibold text-blue-600">{doc.experienceYears}+ years experience</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
                      <Users className="size-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-slate-600">
                        {hospital.doctorCount || 0} registered doctors at this medical center.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 5: Location */}
              {activeTab === 'location' && (
                <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 lg:p-7 space-y-5 shadow-2xs">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900">Location & Directions</h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                      Physical campus address and navigation assistance.
                    </p>
                  </div>

                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="size-5 text-blue-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-900">{hospital.name}</h4>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{addressText}</p>
                      </div>
                    </div>

                    <div className="pt-2">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                      >
                        <MapPin className="size-4" />
                        <span>Open in Google Maps</span>
                        <ExternalLink className="size-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* 4. Elegant Fixed Bottom Action Dock (Clean & Mobile-Friendly) */}
        {!loading && hospital && (
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-xl px-4 py-3 sm:py-4">
            <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="hidden sm:block">
                <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate max-w-sm">
                  {hospital.name}
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-500">
                  {isAffiliated
                    ? 'You are an approved doctor at this facility'
                    : isPending
                    ? 'Affiliation request is currently under review by admin'
                    : 'Request to join this hospital and expand your medical practice'}
                </p>
              </div>

              <div className="w-full sm:w-auto flex items-center justify-end">
                {isAffiliated ? (
                  <button
                    type="button"
                    disabled
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-50 text-emerald-700 font-black text-xs sm:text-sm border border-emerald-200 flex items-center justify-center gap-2 cursor-default"
                  >
                    <CheckCircle2 className="size-4" />
                    <span>Affiliated Member</span>
                  </button>
                ) : isPending ? (
                  <button
                    type="button"
                    disabled
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-blue-50 text-blue-700 font-black text-xs sm:text-sm border border-blue-200 flex items-center justify-center gap-2 cursor-default"
                  >
                    <Clock className="size-4 text-blue-600" />
                    <span>Request Pending Approval</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsJoinModalOpen(true)}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] text-white font-black text-xs sm:text-sm shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <UserPlus className="size-4" />
                    <span>Request to Join Hospital</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Join Request Modal */}
      {hospital && (
        <DoctorJoinHospitalModal
          isOpen={isJoinModalOpen}
          hospital={hospital}
          onClose={() => setIsJoinModalOpen(false)}
          onSuccess={handleJoinSuccess}
          defaultDepartment={user?.role === 'DOCTOR' ? (user as any).department : ''}
        />
      )}
    </div>
  )
}
export default DoctorHospitalDetailPage
