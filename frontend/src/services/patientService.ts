import apiClient from './apiClient'
import type {
  HospitalCardData,
  AppointmentCardData,
  HospitalsApiResponse,
  AppointmentsApiResponse,
} from '@/types/patient'

// Fetch Patient Dashboard overview from backend
export async function fetchPatientDashboardApi() {
  try {
    const res: any = await apiClient.get('/patient/dashboard')
    return res?.data || res
  } catch (error) {
    console.warn('Backend patient dashboard not available, fallback to mock data:', error)
    return null
  }
}

// Fetch Hospitals for discovery with dynamic query parameters
export async function fetchHospitalsListApi(params?: {
  search?: string
  city?: string
  department?: string
  hospitalType?: string
  facility?: string
  emergency?: boolean
  minYear?: number
  maxYear?: number
  sortBy?: string
  page?: number
  limit?: number
}): Promise<HospitalsApiResponse> {
  try {
    const queryParams = new URLSearchParams()
    if (params?.search) queryParams.append('search', params.search)
    if (params?.city && params.city !== 'all' && !params.city.toLowerCase().includes('all')) {
      queryParams.append('city', params.city)
    }
    if (params?.department && params.department !== 'all') queryParams.append('department', params.department)
    if (params?.hospitalType && params.hospitalType !== 'all') queryParams.append('hospitalType', params.hospitalType)
    if (params?.facility) queryParams.append('facility', params.facility)
    if (params?.emergency) queryParams.append('emergency', 'true')
    if (params?.minYear) queryParams.append('minYear', String(params.minYear))
    if (params?.maxYear) queryParams.append('maxYear', String(params.maxYear))
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params?.page) queryParams.append('page', String(params.page))
    if (params?.limit) queryParams.append('limit', String(params.limit))

    const url = `/hospitals${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    const res: any = await apiClient.get(url)
    const data = res?.data?.data || res?.data || res
    const list = data?.hospitals || (Array.isArray(data) ? data : [])
    const total = data?.pagination?.totalDocs ?? (list.length || 0)
    const pageNum = params?.page || 1
    const limitNum = params?.limit || 10
    const hasMore = data?.pagination?.hasNextPage ?? (pageNum * limitNum < total)

    if (Array.isArray(list)) {
      const mapped = list.map((h: any, idx: number) => {
        const coverImg = h.images?.coverImage || (Array.isArray(h.images) ? h.images[0] : null) || h.image || h.logo
        const gallery = h.images?.gallery || (Array.isArray(h.images) ? h.images : [])
        const loc = h.address?.city
          ? `${h.address.street || 'Main Road'}, ${h.address.city}, ${h.address.state || ''}`
          : 'Bilaspur, Chhattisgarh'

        return {
          _id: h._id || String(idx),
          name: h.name,
          slug: h.slug,
          image: coverImg,
          images: {
            coverImage: coverImg,
            gallery: gallery.length > 0 ? gallery : [coverImg].filter(Boolean),
          },
          rating: h.rating || 4.5,
          distance: h.distance || `${(2.0 + (idx % 6) * 1.1).toFixed(1)} km`,
          location: loc,
          address: h.address,
          tags: h.departments?.slice(0, 3) || ['Multi-Speciality', '24/7 Emergency', 'Cardiology'],
          departments: h.departments || ['General Medicine'],
          facilities: h.facilities || ['24x7 Emergency', 'Ambulance', 'ICU', 'Pharmacy'],
          hospitalType: h.hospitalType || 'Multi-Speciality',
          establishmentYear: h.establishmentYear || 2012,
          totalBeds: h.totalBeds || 150,
          website: h.website || '',
          contactEmail: h.contactEmail || '',
          contactPhone: h.contactPhone || h.phone || '+91 7752 494000',
          phoneNumber: h.contactPhone || h.phone || '+91 7752 494000',
          openingTime: h.openingTime || '00:00',
          closingTime: h.closingTime || '23:59',
          isEmergency24x7: h.isEmergency24x7 ?? true,
          emergencyAvailable: h.isEmergency24x7 ?? true,
          icuAvailable: (h.facilities || []).some((f: string) => f.toLowerCase().includes('icu')),
          description: h.description || '',
          verificationStatus: h.verificationStatus || 'APPROVED',
        } as HospitalCardData
      })
      return { hospitals: mapped, total, page: pageNum, limit: limitNum, hasMore }
    }
    return { hospitals: [], total: 0, page: 1, limit: limitNum, hasMore: false }
  } catch (error) {
    console.warn('Backend hospitals list not available, fallback to empty:', error)
    return { hospitals: [], total: 0, page: 1, limit: 10, hasMore: false }
  }
}

// Fetch single hospital by ID or Slug
export async function fetchHospitalDetailApi(idOrSlug: string): Promise<HospitalCardData | null> {
  try {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug)
    const url = isObjectId ? `/hospitals/${idOrSlug}` : `/hospitals/slug/${idOrSlug}`
    const res: any = await apiClient.get(url)
    const h = res?.data || res
    if (!h || !h.name) return null

    const coverImg = h.images?.coverImage || (Array.isArray(h.images) ? h.images[0] : null) || h.image
    const gallery = h.images?.gallery || (Array.isArray(h.images) ? h.images : [])
    const loc = h.address?.city
      ? `${h.address.street || 'Main Road'}, ${h.address.city}, ${h.address.state || ''}`
      : 'Bilaspur, Chhattisgarh'

    return {
      _id: h._id,
      name: h.name,
      slug: h.slug,
      image: coverImg,
      images: {
        coverImage: coverImg,
        gallery: gallery.length > 0 ? gallery : [coverImg].filter(Boolean),
      },
      rating: h.rating || 4.5,
      distance: h.distance || '2.5 km',
      location: loc,
      address: h.address,
      tags: h.departments?.slice(0, 3) || ['Multi-Speciality', '24/7 Emergency'],
      departments: h.departments || ['General Medicine'],
      facilities: h.facilities || ['24x7 Emergency', 'Ambulance', 'ICU', 'Pharmacy'],
      hospitalType: h.hospitalType || 'Multi-Speciality',
      establishmentYear: h.establishmentYear || 2012,
      totalBeds: h.totalBeds || 150,
      website: h.website || '',
      contactEmail: h.contactEmail || '',
      contactPhone: h.contactPhone || h.phone || '+91 7752 494000',
      phoneNumber: h.contactPhone || h.phone || '+91 7752 494000',
      openingTime: h.openingTime || '00:00',
      closingTime: h.closingTime || '23:59',
      isEmergency24x7: h.isEmergency24x7 ?? true,
      emergencyAvailable: h.isEmergency24x7 ?? true,
      icuAvailable: (h.facilities || []).some((f: string) => f.toLowerCase().includes('icu')),
      description: h.description || '',
      verificationStatus: h.verificationStatus || 'APPROVED',
    } as HospitalCardData
  } catch (error) {
    console.error('Failed to fetch hospital detail:', error)
    return null
  }
}

// Fetch Patient Appointments with Pagination, Filters, and Search (10 per batch)
export async function fetchMyPatientAppointmentsPaginatedApi(params: {
  page: number
  limit?: number
  status?: string
  search?: string
  dateFrom?: string
  dateTo?: string
}): Promise<AppointmentsApiResponse | null> {
  try {
    const query = new URLSearchParams()
    query.append('page', String(params.page))
    query.append('limit', String(params.limit || 10))
    if (params.status && params.status !== 'all') query.append('status', params.status)
    if (params.search && params.search.trim()) query.append('search', params.search.trim())
    if (params.dateFrom) query.append('dateFrom', params.dateFrom)
    if (params.dateTo) query.append('dateTo', params.dateTo)

    const res: any = await apiClient.get(`/appointments/my-history?${query.toString()}`)
    const payload = res?.data || res
    const rawList = payload?.appointments || []
    const pagination = payload?.pagination || {}
    const counts = payload?.counts || { all: 0, upcoming: 0, completed: 0, cancelled: 0 }

    const mapped: AppointmentCardData[] = rawList.map((a: any) => {
      const docUser = a.doctorId?.userId || {}
      const hosp = a.hospitalId || {}
      const hospAddr = hosp.address?.city
        ? `${hosp.address.street ? hosp.address.street + ', ' : ''}${hosp.address.city}${hosp.address.state ? ', ' + hosp.address.state : ''}`
        : hosp.address || 'Civil Lines, Bilaspur'

      let uiStatus: 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled' = 'Confirmed'
      if (a.status === 'COMPLETED') uiStatus = 'Completed'
      else if (a.status === 'PENDING_PAYMENT') uiStatus = 'Pending'
      else if (a.status?.includes('CANCELLED') || a.status === 'NO_SHOW') uiStatus = 'Cancelled'
      else uiStatus = 'Confirmed'

      return {
        _id: a._id,
        appointmentNumber: a.appointmentNumber || `APT-${Date.now().toString().slice(-8)}`,
        doctorId: a.doctorId?._id || a.doctorId,
        hospitalId: a.hospitalId?._id || a.hospitalId,
        doctorName: docUser.name || a.doctorId?.name || a.doctorName || 'Dr. Specialist',
        doctorSpecialty: a.doctorId?.department || a.doctorId?.specialization?.[0] || 'Specialist',
        doctorAvatar: docUser.avatar || a.doctorAvatar,
        doctorRating: a.doctorId?.ratingAverage || 4.8,
        doctorReviewCount: a.doctorId?.reviewCount || 280,
        hospitalName: hosp.name || a.hospitalName || 'CarePlus Multispeciality Hospital',
        hospitalAddress: hospAddr,
        hospitalImage: hosp.images?.coverImage || hosp.image || '/src/assets/apollo-hospital.jpg',
        hospitalPhone: hosp.contactPhone || '+91 98765 43210',
        hospitalEmail: hosp.contactEmail || 'contact@careplus.health',
        hospitalWebsite: hosp.website || 'www.careplus.health',
        hospitalTimings: '09:00 AM - 11:00 PM',
        date: a.date,
        time: a.slotId ? `${a.slotId.startTime} - ${a.slotId.endTime}` : (a.startTime ? `${a.startTime} - ${a.endTime || ''}` : '10:30 AM - 11:00 AM'),
        status: uiStatus,
        consultationType: a.type === 'VIDEO' ? 'Video Consultation' : 'In-person',
        symptoms: a.symptoms || 'General clinical consultation',
        consultationFee: a.consultationFee || 500,
        bookedOn: a.createdAt ? new Date(a.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recently',
        prescription: a.prescription ? {
          diagnosis: a.prescription.diagnosis || 'Clinical Diagnosis',
          issuedAt: a.prescription.issuedAt ? new Date(a.prescription.issuedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : undefined,
          medicines: a.prescription.medicines || [],
          notes: a.prescription.notes,
        } : undefined,
        rescheduleHistory: a.rescheduleHistory || [],
        cancellation: a.cancellation ? {
          reason: a.cancellation.reason || 'Cancelled',
          cancelledAt: a.cancellation.cancelledAt ? new Date(a.cancellation.cancelledAt).toLocaleDateString('en-GB') : 'Unknown',
        } : undefined,
        canCancel: uiStatus === 'Confirmed' || uiStatus === 'Pending',
        canReschedule: uiStatus === 'Confirmed' || uiStatus === 'Pending',
      }
    })

    return {
      appointments: mapped,
      totalDocs: pagination.totalDocs ?? mapped.length,
      totalPages: pagination.totalPages ?? 1,
      currentPage: pagination.currentPage ?? params.page,
      limit: pagination.limit ?? 10,
      hasNextPage: pagination.hasNextPage ?? false,
      counts,
    }
  } catch (error) {
    console.warn('Backend paginated appointments failed, returning null for fallback handling:', error)
    return null
  }
}

// Legacy helper for quick appointment lists
export async function fetchMyPatientAppointmentsApi(): Promise<AppointmentCardData[]> {
  const result = await fetchMyPatientAppointmentsPaginatedApi({ page: 1, limit: 10 })
  return result?.appointments || []
}

// Cancel Appointment with strict 48-hour policy & refund support
export async function cancelAppointmentApi(appointmentId: string, reason: string) {
  return apiClient.patch(`/appointments/${appointmentId}/cancel`, { reason })
}

// Reschedule Appointment
export async function rescheduleAppointmentApi(appointmentId: string, newSlotId: string, reason?: string) {
  return apiClient.patch(`/appointments/${appointmentId}/reschedule`, { newSlotId, reason })
}

// Download Prescription PDF
export async function downloadPrescriptionPdfApi(appointmentId: string) {
  const response = await apiClient.get(`/appointments/${appointmentId}/download-prescription`, {
    responseType: 'blob',
  })
  return response
}


// Fetch Paginated Doctors for Discovery (with infinite scroll support)
export async function fetchDoctorsListApi(params: {
  page: number
  limit?: number
  search?: string
  specialty?: string
  hospital?: string
  city?: string
  minFee?: number
  maxFee?: number
  sort?: string
  mode?: string
  availability?: string
}) {
  try {
    const res: any = await apiClient.get('/doctors', {
      params: {
        page: params.page,
        limit: params.limit || 10,
        search: params.search,
        specialty: params.specialty,
        hospital: params.hospital,
        city: params.city,
        minFee: params.minFee,
        maxFee: params.maxFee,
        sort: params.sort,
        mode: params.mode,
        availability: params.availability,
      },
    })
    const data = res?.data?.data || res?.data || res
    return {
      doctors: data.doctors || [],
      total: data.total || 0,
      page: data.page || params.page,
      limit: data.limit || 10,
      hasMore: data.hasMore ?? false,
    }
  } catch (error) {
    console.warn('Backend doctors list not available:', error)
    return null
  }
}

// Fetch single doctor real details from backend database
export async function fetchDoctorByIdApi(doctorId: string) {
  try {
    const res: any = await apiClient.get(`/doctors/details/${doctorId}`)
    return res?.data?.data || res?.data || res
  } catch (error) {
    console.warn('Backend doctor details not available:', error)
    return null
  }
}

// ============================================================================
// Medical Records & Patient Medical History Vault APIs
// ============================================================================

// Fetch Patient Medical History (Blood group, allergies, surgeries, chronic diseases, emergency contact)
export async function fetchPatientMedicalHistoryApi() {
  try {
    const res: any = await apiClient.get('/patients/medical-history')
    return res?.data?.data || res?.data || res
  } catch (error) {
    console.warn('Backend medical history not available:', error)
    return null
  }
}

// Update Patient Medical History
export async function updatePatientMedicalHistoryApi(data: Partial<{
  bloodGroup: string | null
  allergies: string[]
  chronicDiseases: string[]
  pastSurgeries: string[]
  currentMedications: string[]
  emergencyContact: { name: string; relationship: string; phoneNumber: string }
  gender?: string | null
  dateOfBirth?: string | null
}>) {
  const res: any = await apiClient.patch('/patients/medical-history', data)
  return res?.data?.data || res?.data || res
}

// Fetch all Patient Medical Reports Vault
export async function fetchPatientReportsApi(category?: string) {
  try {
    const query = category && category !== 'All Reports' ? `?category=${encodeURIComponent(category)}` : ''
    const res: any = await apiClient.get(`/patients/reports${query}`)
    const data = res?.data?.data || res?.data || res
    return Array.isArray(data?.reports) ? data.reports : (Array.isArray(data) ? data : [])
  } catch (error) {
    console.warn('Backend medical reports vault not available:', error)
    return null
  }
}

// Upload Medical Report (supports multipart file upload or JSON payload)
export async function uploadPatientReportApi(payload: FormData | {
  title: string
  fileUrl: string
  fileType?: string
  category?: string
}) {
  if (payload instanceof FormData) {
    const res: any = await apiClient.post('/profile/patient/reports', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res?.data?.data?.report || res?.data?.data || res?.data || res
  } else {
    const res: any = await apiClient.post('/patients/reports', payload)
    return res?.data?.data || res?.data || res
  }
}

// Delete Medical Report by ID
export async function deletePatientReportApi(reportId: string) {
  const res: any = await apiClient.delete(`/patients/reports/${reportId}`)
  return res?.data || res
}

// ============================================================================
// Appointment Booking & Slot Availability APIs
// ============================================================================

// Fetch real-time available slots for a doctor on a specific date
export async function fetchDoctorAvailableSlotsApi(doctorId: string, date: string) {
  try {
    const res: any = await apiClient.get(`/doctors/${doctorId}/available-slots?date=${date}`)
    return res?.data?.data || res?.data || res
  } catch (error) {
    console.warn(`Could not fetch slots for doctor ${doctorId} on ${date}:`, error)
    return null
  }
}

// Initiate appointment booking (locks slot for 5 mins & creates Razorpay test order)
export async function initiateAppointmentBookingApi(payload: {
  doctorId: string
  date: string
  startTime: string
  symptoms: string
  patientDetails?: {
    fullName: string
    age?: number
    gender?: string
    isDependent?: boolean
    relationship?: string
  }
}) {
  const res: any = await apiClient.post('/appointments/initiate', {
    ...payload,
    type: 'In-person',
  })
  return res?.data?.data || res?.data || res
}

// Verify payment and finalize appointment confirmation
export async function verifyAppointmentPaymentApi(payload: {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}) {
  const res: any = await apiClient.post('/appointments/verify-payment', payload)
  return res?.data?.data || res?.data || res
}


