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

    // When sending FormData, delete Content-Type so browser/Axios automatically sets
    // 'multipart/form-data; boundary=...' with the correct boundary parameter
    if (config.data instanceof FormData && config.headers) {
      delete config.headers['Content-Type']
    }

    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

apiClient.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error: AxiosError<{ message?: string; success?: boolean }>) => {
    const backendMessage = error.response?.data?.message
    const errorMessage =
      backendMessage ||
      error.message ||
      'An unexpected network error occurred. Please try again.'

    return Promise.reject(new Error(errorMessage))
  }
)

export default apiClient
