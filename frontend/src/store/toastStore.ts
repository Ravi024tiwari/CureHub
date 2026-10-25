import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastItem {
  id: string
  type: ToastType
  message: string
  title?: string
  duration?: number
}

interface ToastState {
  toasts: ToastItem[]
  addToast: (toast: Omit<ToastItem, 'id'>) => string
  removeToast: (id: string) => void
  clearToasts: () => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  addToast: (newToast) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    const duration = newToast.duration ?? 4000
    const toastWithId: ToastItem = { ...newToast, id, duration }

    set((state) => ({
      // Keep up to 3 active toasts at once to prevent screen clutter
      toasts: [...state.toasts.slice(-2), toastWithId],
    }))

    return id
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }))
  },

  clearToasts: () => {
    set({ toasts: [] })
  },
}))

// Standalone functional API for calling from anywhere without hook constraints
export const toast = {
  success: (message: string, title?: string, duration = 4000) => {
    return useToastStore.getState().addToast({
      type: 'success',
      message,
      title: title || 'Success',
      duration,
    })
  },

  error: (message: string, title?: string, duration = 5000) => {
    return useToastStore.getState().addToast({
      type: 'error',
      message,
      title: title || 'Error',
      duration,
    })
  },

  info: (message: string, title?: string, duration = 4000) => {
    return useToastStore.getState().addToast({
      type: 'info',
      message,
      title: title || 'Notice',
      duration,
    })
  },

  warning: (message: string, title?: string, duration = 4500) => {
    return useToastStore.getState().addToast({
      type: 'warning',
      message,
      title: title || 'Warning',
      duration,
    })
  },

  dismiss: (id?: string) => {
    if (id) {
      useToastStore.getState().removeToast(id)
    } else {
      useToastStore.getState().clearToasts()
    }
  },
}
