import apiClient from './apiClient'
import type { NotificationItem, NotificationsResponse } from '@/types/notification'

export const notificationService = {
  getNotifications: async (page = 1, limit = 20, unreadOnly = false): Promise<NotificationsResponse> => {
    const res: any = await apiClient.get('/notifications', {
      params: { page, limit, unreadOnly },
    })
    return res.data
  },

  markAsRead: async (id: string): Promise<{ notification: NotificationItem; unreadCount: number }> => {
    const res: any = await apiClient.patch(`/notifications/${id}/read`)
    return res.data
  },

  markAllAsRead: async (): Promise<{ modifiedCount: number; unreadCount: number }> => {
    const res: any = await apiClient.patch('/notifications/read-all')
    return res.data
  },

  deleteNotification: async (id: string): Promise<{ unreadCount: number }> => {
    const res: any = await apiClient.delete(`/notifications/${id}`)
    return res.data
  },
}

export default notificationService
