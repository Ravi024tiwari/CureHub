import apiClient from './apiClient'
import type { HospitalCardData, AppointmentCardData, HospitalsApiResponse } from '@/types/patient'

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

// Fetch Patient Appointments
export async function fetchMyPatientAppointmentsApi(): Promise<AppointmentCardData[]> {
  try {
    const res: any = await apiClient.get('/appointments/my-history')
    const appointments = res?.data?.appointments || res?.appointments || []
    if (Array.isArray(appointments) && appointments.length > 0) {
      return appointments.map((a: any) => ({
        _id: a._id,
        doctorName: a.doctor?.name || a.doctorId?.name || 'Dr. Specialist',
        doctorSpecialty: a.doctor?.department || a.department || 'General Physician',
        doctorAvatar: a.doctor?.avatar,
        hospitalName: a.hospital?.name || a.hospitalId?.name || 'CarePlus Partner Hospital',
        date: a.date,
        time: a.timeSlot?.startTime || '10:00 AM',
        status: a.status === 'CONFIRMED' ? 'Confirmed' : a.status === 'COMPLETED' ? 'Completed' : 'Pending',
      }))
    }
    return []
  } catch (error) {
    console.warn('Backend appointments not available, fallback to mock:', error)
    return []
  }
}

// Fetch Paginated Doctors for Discovery (with infinite scroll support)
export async function fetchDoctorsListApi(params: {
  page: number
  limit?: number
  search?: string
  specialty?: string
  hospital?: string
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

