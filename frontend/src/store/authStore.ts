import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { loginApi, logoutApi, getMeApi } from '@/services/authService'
import { UserRole } from '@/types/auth'
import type { AuthUser, LoginPayload } from '@/types/auth'

export interface AuthState {
  user: AuthUser | null
  profile: any | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Direct Field Setters
  setUser: (user: AuthUser | null) => void
  setProfile: (profile: any) => void
  setToken: (token: string | null) => void
  setError: (error: string | null) => void
  clearError: () => void

  login: (payload: LoginPayload) => Promise<AuthUser>
  logout: () => Promise<void>
  fetchMe: () => Promise<void>
}

export const normalizeUser = (user: any): AuthUser | null => {
  if (!user) return null
  const rawRole = String(user.role || '').toUpperCase().trim()
  let role: UserRole = UserRole.PATIENT
  if (rawRole === UserRole.HOSPITAL_ADMIN || rawRole.includes('HOSPITAL')) {
    role = UserRole.HOSPITAL_ADMIN
  } else if (rawRole === UserRole.DOCTOR) {
    role = UserRole.DOCTOR
  } else if (rawRole === UserRole.SUPER_ADMIN) {
    role = UserRole.SUPER_ADMIN
  } else {
    role = UserRole.PATIENT
  }
  return {
    ...user,
    role,
  }
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
    (set, get) => ({
      user: null,
      profile: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Setters
      setUser: (user) => {
        const normalized = normalizeUser(user)
        set({ user: normalized, isAuthenticated: !!normalized })
      },
      setProfile: (profile) => set({ profile }),
      setToken: (token) => {
        if (token) {
          localStorage.setItem('careplus_token', token)
        } else {
          localStorage.removeItem('careplus_token')
        }
        set({ token, isAuthenticated: !!token })
      },
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // API Setter: calls backend /auth/login, sets user, profile, and token
      login: async (payload: LoginPayload) => {
        set({ isLoading: true, error: null })
        try {
          const response: any = await loginApi(payload)
          const responseData = response?.data || response
          const rawUser = responseData?.user
          const user = normalizeUser(rawUser)
          const profile = responseData?.profile || null
          const token: string = responseData?.token

          if (token) {
            localStorage.setItem('careplus_token', token)
          }
          if (user) {
            localStorage.setItem('careplus_user', JSON.stringify(user))
          }

          set({
            user,
            profile,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })

          return user as AuthUser
        } catch (err: any) {
          const errorMessage =
            err?.message || 'Login failed. Please check your credentials.'
          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
          })
          throw err
        }
      },

      // API Setter: calls backend /auth/logout, clears central state and storage
      logout: async () => {
        set({ isLoading: true })
        try {
          await logoutApi()
        } catch (err) {
          console.warn('Logout API call returned error:', err)
        } finally {
          localStorage.removeItem('careplus_token')
          localStorage.removeItem('careplus_user')
          set({
            user: null,
            profile: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
        }
      },

      // API Setter: calls backend /auth/me, refreshes central state using current token
      fetchMe: async () => {
        const currentToken = get().token || localStorage.getItem('careplus_token')
        if (!currentToken || get().isLoading) return

        set({ isLoading: true })
        try {
          const response: any = await getMeApi()
          const responseData = response?.data || response
          const rawUser = responseData?.user
          const user = normalizeUser(rawUser)
          const profile = responseData?.profile

          if (user) {
            localStorage.setItem('careplus_user', JSON.stringify(user))
          }

          set({
            user: user || get().user,
            profile: profile || get().profile,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (err: any) {
          console.warn('fetchMe API call failed:', err)
          set({ isLoading: false })
        }
      },
    }),
    {
      name: 'careplus_auth_storage',
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  ),
  { name: 'AuthStore' }
)
)
