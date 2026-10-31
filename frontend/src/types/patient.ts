export interface HospitalCardData {
  _id: string
  name: string
  slug?: string
  image?: string
  images?: {
    coverImage?: string
    gallery?: string[]
  }
  rating: number
  distance: string
  location: string
  address?: {
    street?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
  }
  tags: string[]
  departments?: string[]
  facilities?: string[]
  hospitalType?: string
  establishmentYear?: number
  totalBeds?: number
  website?: string
  contactEmail?: string
  contactPhone?: string
  phoneNumber?: string
  openingTime?: string
  closingTime?: string
  isEmergency24x7?: boolean
  emergencyAvailable?: boolean
  icuAvailable?: boolean
  description?: string
  isFavorite?: boolean
}

export interface DoctorScheduleRuleItem {
  dayOfWeek: number // 0=Sun, 1=Mon, ..., 6=Sat
  startTime: string
  endTime: string
  slotDurationMinutes?: number
}

export interface DoctorLeaveItem {
  date: string
  reason?: string
  createdAt?: string
}

export interface DoctorReviewItem {
  _id: string
  patientName: string
  patientAvatar?: string
  rating: number
  comment: string
  createdAt: string
}

export interface DoctorWorkExperience {
  title: string
  institution: string
  period: string
  duration?: string
  description?: string
}

export interface DoctorCardData {
  _id: string
  name: string
  specialty: string
  department?: string
  rating: number
  reviewCount: number
  experienceYears: number
  hospitalName: string
  hospitalLocation?: string
  avatar?: string
  consultationFee?: number
  availableToday?: boolean
  availableStatus?: string
  modes?: string[]
  distance?: string
  isFavorite?: boolean
  qualifications?: string[]
  specialization?: string[]
  bio?: string
  medicalCouncilRegistrationNumber?: string
  verificationStatus?: string
  email?: string
  phoneNumber?: string
  experiences?: DoctorWorkExperience[]
}

export interface DoctorDetailData extends DoctorCardData {
  userId?: {
    _id?: string
    name: string
    email: string
    phoneNumber: string
    avatar?: string
    isEmailVerified?: boolean
    isAccountApproved?: boolean
  }
  hospitalId?: HospitalCardData | null
  hospitalAffiliationStatus?: 'NOT_AFFILIATED' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | string
  scheduleRules?: DoctorScheduleRuleItem[]
  leaves?: DoctorLeaveItem[]
  licenseDocumentUrl?: string
  isActive?: boolean
  ratingAverage?: number
  reviews?: DoctorReviewItem[]
}

export interface DoctorFilterState {
  specializations: string[]
  hospitals: string[]
  consultationTypes: string[]
  availability: string
  maxFee: number
  search: string
  selectedSpecialty: string
  selectedCity: string
  sort: string
}

export interface DoctorsApiResponse {
  doctors: DoctorCardData[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface HospitalsApiResponse {
  hospitals: HospitalCardData[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface PrescriptionMedicineItem {
  name: string
  dosage: string
  frequency: string
  duration: string
  instructions?: string
}

export interface AppointmentPrescriptionData {
  diagnosis?: string
  issuedAt?: string
  medicines: PrescriptionMedicineItem[]
  notes?: string
  tags?: string[]
  isFavorite?: boolean
}

export interface AppointmentRescheduleItem {
  previousSlotId?: string
  previousDate: string
  previousStartTime: string
  previousEndTime?: string
  reason?: string
  rescheduledAt: string
}

export interface AppointmentCancellationData {
  reason: string
  cancelledAt: string
  cancelledBy?: string
}

export type AppointmentStatusType =
  | 'Confirmed'
  | 'Pending'
  | 'Completed'
  | 'Cancelled'
  | 'Reschedule Required'
  | 'RESCHEDULE_REQUIRED'

export interface AppointmentCardData {
  _id: string
  appointmentNumber?: string
  doctorId?: string
  hospitalId?: string
  doctorName: string
  doctorSpecialty: string
  doctorAvatar?: string
  doctorRating?: number
  doctorReviewCount?: number
  hospitalName: string
  hospitalAddress?: string
  hospitalImage?: string
  hospitalPhone?: string
  hospitalEmail?: string
  hospitalWebsite?: string
  hospitalTimings?: string
  date: string // e.g., "2026-10-20" or "Mon, 20 Oct 2026"
  time: string // e.g., "10:30 AM" or "10:30 AM - 11:00 AM"
  status: AppointmentStatusType
  consultationType?: 'In-person' | 'Video Consultation'
  symptoms?: string
  consultationFee?: number
  bookedOn?: string
  doctorLeaveReason?: string | null
  rescheduleDeadline?: string | Date | null
  prescription?: AppointmentPrescriptionData
  rescheduleHistory?: AppointmentRescheduleItem[]
  cancellation?: AppointmentCancellationData
  canCancel?: boolean
  canReschedule?: boolean
  isReviewed?: boolean
  review?: {
    _id: string
    rating: number
    comment: string
    tags?: string[]
    createdAt?: string
  }
}

export type AppointmentFilterTab = 'all' | 'upcoming' | 'completed' | 'cancelled'

export interface AppointmentCategoryCounts {
  all: number
  upcoming: number
  completed: number
  cancelled: number
}

export interface AppointmentsApiResponse {
  appointments: AppointmentCardData[]
  totalDocs: number
  totalPages: number
  currentPage: number
  limit: number
  hasNextPage: boolean
  counts?: AppointmentCategoryCounts
}

export interface SpecialtyCategory {
  id: string
  label: string
  iconName: string
  color: string
  bgColor: string
}

export interface HealthTipItem {
  id: string
  title: string
  date: string
  category: string
  readTime: string
  description: string
  imageUrl?: string
}

// Medical Records Types
export type MedicalRecordCategory =
  | 'All Reports'
  | 'Lab Report'
  | 'Imaging'
  | 'Prescription'
  | 'Others'

export interface MedicalRecordItem {
  _id: string
  title: string
  category: 'Lab Report' | 'Imaging' | 'Prescription' | 'Others' | string
  fileUrl: string
  fileType: 'PDF' | 'IMAGE' | 'JPG' | 'PNG' | string
  fileSize?: string
  uploadedAt: string
  uploadedBy?: string
  doctorName?: string
  hospitalName?: string
  notes?: string
  tags?: string[]
  isFavorite?: boolean
}

export interface PatientEmergencyContact {
  name: string
  relationship: string
  phoneNumber: string
}

export interface PatientMedicalHistory {
  bloodGroup: string | null
  allergies: string[]
  chronicDiseases: string[]
  pastSurgeries: string[]
  currentMedications: string[]
  emergencyContact: PatientEmergencyContact
  gender?: string | null
  dateOfBirth?: string | null
}


export interface PatientAddress {
  street?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
}

export interface PatientProfileData {
  _id?: string
  userId?: string
  name: string
  email: string
  phoneNumber?: string
  avatar?: string
  gender?: string
  dateOfBirth?: string
  bloodGroup?: string
  address?: PatientAddress
  allergies?: string[]
  chronicDiseases?: string[]
  pastSurgeries?: string[]
  currentMedications?: string[]
  emergencyContact?: PatientEmergencyContact
  reports?: MedicalRecordItem[]
  createdAt?: string
  updatedAt?: string
}

export interface PatientDashboardOverview {
  statistics: {
    totalBooked: number
    upcomingCount: number
    completedCount: number
    cancelledCount: number
    totalSpent: number
    totalReports: number
  }
  nextAppointment?: AppointmentCardData | null
  recentAppointments?: AppointmentCardData[]
}

export interface PatientPrescriptionLockerItem {
  appointmentId: string
  appointmentNumber?: string
  consultationDate: string
  consultationTime: string
  consultationType?: string
  symptoms?: string
  prescription: {
    diagnosis?: string
    issuedAt?: string
    medicinesCount: number
    medicines: PrescriptionMedicineItem[]
    notes?: string
  tags?: string[]
  isFavorite?: boolean
  }
  doctor: {
    id: string
    name: string
    avatar?: string | null
    department?: string
    qualifications?: string[]
    specialization?: string[]
  }
  hospital?: {
    id: string
    name: string
    address?: any
    contactPhone?: string
  } | null
  downloadPdfUrl?: string
  previewPdfUrl?: string
}
