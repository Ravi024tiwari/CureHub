import apiClient from './apiClient'
import type { HospitalCardData, AppointmentCardData } from '@/types/patient'

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

// Fetch Hospitals for discovery
export async function fetchHospitalsListApi(): Promise<HospitalCardData[]> {
  try {
    const res: any = await apiClient.get('/hospitals')
    const list = res?.data?.hospitals || res?.hospitals || res?.data || res
    if (Array.isArray(list) && list.length > 0) {
      return list.map((h: any, idx: number) => ({
        _id: h._id || String(idx),
        name: h.name,
        slug: h.slug,
        image: h.images?.[0] || h.logo || undefined,
        rating: h.rating || 4.5,
        reviewCount: h.reviewCount || 120,
        distance: `${(2.0 + idx * 0.8).toFixed(1)} km`,
        location: h.address?.city ? `${h.address.street || 'Main Road'}, ${h.address.city}` : 'Bilaspur, Chhattisgarh',
        tags: h.departments?.slice(0, 3) || ['24/7 Emergency', 'ICU', 'Pharmacy'],
        departments: h.departments,
        emergencyAvailable: h.emergencyAvailable ?? true,
        icuAvailable: h.icuAvailable ?? true,
        phoneNumber: h.phone || h.emergencyPhone,
      }))
    }
    return []
  } catch (error) {
    console.warn('Backend hospitals list not available, fallback to mock:', error)
    return []
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

