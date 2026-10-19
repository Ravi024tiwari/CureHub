import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor: Attach Auth tokens if stored in localStorage
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('careplus_token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response Interceptor: Standardize error messages & response data extraction
apiClient.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error: AxiosError<{ message?: string; success?: boolean }>) => {
    // Extract backend error message if available
    const backendMessage = error.response?.data?.message
    const errorMessage =
      backendMessage ||
      error.message ||
      'An unexpected network error occurred. Please try again.'

    return Promise.reject(new Error(errorMessage))
  }
)

export default apiClient
