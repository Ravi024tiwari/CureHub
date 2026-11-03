import { create } from 'zustand'
import { notificationService } from '@/services/notificationService'
import type { NotificationItem } from '@/types/notification'

export interface NotificationState {
  notifications: NotificationItem[]
  unreadCount: number
  isLoading: boolean
  error: string | null

  // Actions
  fetchNotifications: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  addNotificationLocally: (item: NotificationItem) => void
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async () => {
    try {
      set({ isLoading: true, error: null })
      const data = await notificationService.getNotifications(1, 30)
      set({
        notifications: data.notifications || [],
        unreadCount: typeof data.unreadCount === 'number' ? data.unreadCount : 0,
        isLoading: false,
      })
    } catch (err: any) {
      console.error('Failed to fetch notifications:', err)
      set({ isLoading: false, error: err.message || 'Failed to load notifications' })
    }
  },

  markAsRead: async (id: string) => {
    // Optimistic UI update
    const previousNotifications = get().notifications
    const previousUnread = get().unreadCount
    const target = previousNotifications.find((n) => n._id === id)

    if (target && !target.isRead) {
      set({
        unreadCount: Math.max(0, previousUnread - 1),
        notifications: previousNotifications.map((n) =>
          n._id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
        ),
      })
    }

    try {
      const data = await notificationService.markAsRead(id)
      if (typeof data.unreadCount === 'number') {
        set({ unreadCount: data.unreadCount })
      }
    } catch (err) {
      console.error('Failed to mark notification as read on server:', err)
    }
  },

  markAllAsRead: async () => {
    // Optimistic UI update
    set((state) => ({
      unreadCount: 0,
      notifications: state.notifications.map((n) => ({
        ...n,
        isRead: true,
        readAt: new Date().toISOString(),
      })),
    }))

    try {
      await notificationService.markAllAsRead()
    } catch (err) {
      console.error('Failed to mark all notifications as read on server:', err)
    }
  },

  deleteNotification: async (id: string) => {
    const previous = get().notifications
    const target = previous.find((n) => n._id === id)
    const decrementedUnread = target && !target.isRead ? Math.max(0, get().unreadCount - 1) : get().unreadCount

    set({
      notifications: previous.filter((n) => n._id !== id),
      unreadCount: decrementedUnread,
    })

    try {
      const data = await notificationService.deleteNotification(id)
      if (typeof data.unreadCount === 'number') {
        set({ unreadCount: data.unreadCount })
      }
    } catch (err) {
      console.error('Failed to delete notification on server:', err)
    }
  },

  addNotificationLocally: (newItem: NotificationItem) => {
    set((state) => {
      // Deduplicate by _id
      const exists = state.notifications.some((n) => n._id === newItem._id)
      if (exists) return state

      const updatedNotifications = [newItem, ...state.notifications]
      const updatedUnread = newItem.isRead ? state.unreadCount : state.unreadCount + 1

      return {
        notifications: updatedNotifications,
        unreadCount: updatedUnread,
      }
    })
  },
}))
