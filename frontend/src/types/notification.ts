export type NotificationType = 'APPOINTMENT_RESCHEDULE' | 'LEAVE_STATUS' | 'SYSTEM'
export type NotificationPriority = 'HIGH' | 'NORMAL' | 'LOW'

export interface NotificationData {
  appointmentId?: string
  appointmentNumber?: string
  doctorName?: string
  leaveId?: string
  leaveReason?: string
  date?: string
  time?: string
  rescheduleDeadline?: string
  hospitalName?: string
  actionUrl?: string
  [key: string]: any
}

export interface NotificationItem {
  _id: string
  userId: string
  title: string
  message: string
  type: NotificationType
  priority: NotificationPriority
  data?: NotificationData
  isRead: boolean
  readAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface NotificationsResponse {
  notifications: NotificationItem[]
  unreadCount: number
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasMore: boolean
  }
}
