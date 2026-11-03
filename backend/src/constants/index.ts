export enum UserRole {
  PATIENT = "PATIENT",
  DOCTOR = "DOCTOR",
  HOSPITAL_ADMIN = "HOSPITAL_ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
}

export enum VerificationStatus {
  INCOMPLETE = "INCOMPLETE",
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  SUSPENDED = "SUSPENDED",
}

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

export enum BloodGroup {
  A_POSITIVE = "A+",
  A_NEGATIVE = "A-",
  B_POSITIVE = "B+",
  B_NEGATIVE = "B-",
  AB_POSITIVE = "AB+",
  AB_NEGATIVE = "AB-",
  O_POSITIVE = "O+",
  O_NEGATIVE = "O-",
}

export enum SlotStatus {
  AVAILABLE = "AVAILABLE",
  LOCKED = "LOCKED",
  BOOKED = "BOOKED",
  UNAVAILABLE = "UNAVAILABLE",
}

export enum AppointmentStatus {
  PENDING_PAYMENT = "PENDING_PAYMENT",
  CONFIRMED = "CONFIRMED",
  RESCHEDULE_REQUIRED = "RESCHEDULE_REQUIRED",
  CHECKED_IN = "CHECKED_IN",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED_BY_PATIENT = "CANCELLED_BY_PATIENT",
  CANCELLED_BY_DOCTOR = "CANCELLED_BY_DOCTOR",
  NO_SHOW = "NO_SHOW",
}

export enum ConsultationType {
  IN_PERSON = "IN_PERSON",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export enum DoctorLeaveStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
}

export enum DoctorLeaveType {
  FULL_DAY = "FULL_DAY",
  PARTIAL_DAY = "PARTIAL_DAY",
  MULTI_DAY = "MULTI_DAY",
}

export enum NotificationType {
  APPOINTMENT_RESCHEDULE = "APPOINTMENT_RESCHEDULE",
  LEAVE_STATUS = "LEAVE_STATUS",
  SYSTEM = "SYSTEM",
}

export enum NotificationPriority {
  HIGH = "HIGH",
  NORMAL = "NORMAL",
  LOW = "LOW",
}

export enum ArticleStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
}

export enum ArticleCategory {
  GENERAL_HEALTH = "General Health",
  CARDIOLOGY = "Cardiology",
  DERMATOLOGY = "Dermatology",
  NUTRITION_DIET = "Nutrition & Diet",
  MENTAL_HEALTH = "Mental Health",
  PEDIATRICS = "Pediatrics",
  ORTHOPEDICS = "Orthopedics",
  NEUROLOGY = "Neurology",
  DIABETES_ENDOCRINOLOGY = "Diabetes & Endocrinology",
  WOMENS_HEALTH = "Women's Health",
  FITNESS_LIFESTYLE = "Fitness & Lifestyle",
}
