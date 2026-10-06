import axios from 'axios'
import { API_BASE_URL, AUTH_STORAGE_KEY } from '@/utils/constants'
import { useAuthStore } from '@/store/auth.store'

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

let refreshPromise: Promise<string> | null = null

const readStoredAuth = () => {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

const refreshAccessToken = async (): Promise<string> => {
  const stored = readStoredAuth()
  const refreshToken = stored?.state?.refreshToken
  if (!refreshToken) throw new Error('Your session has expired. Please log in again.')

  const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken })
  const tokens = response.data?.data ?? response.data
  const accessToken = tokens?.accessToken
  if (!accessToken) throw new Error('Unable to refresh the current session.')

  stored.state.token = accessToken
  stored.state.refreshToken = tokens.refreshToken || refreshToken
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(stored))
  return accessToken
}

axiosInstance.interceptors.request.use((config) => {
  const rawAuth = localStorage.getItem(AUTH_STORAGE_KEY)

  if (rawAuth) {
    try {
      const parsed = JSON.parse(rawAuth)
      const token = parsed?.state?.token

      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch {
      // Ignore invalid localStorage data.
    }
  }

  return config
})

axiosInstance.interceptors.response.use(
  (response) => {
    const body = response.data

    /**
     * Backend standard response:
     * {
     *   success: true,
     *   message: "...",
     *   data: ...,
     *   meta?: ...,
     *   statusCode: 200
     * }
     *
     * If meta exists, preserve it because paginated pages need total/page/limit.
     */
    if (body && typeof body === 'object' && 'data' in body) {
      response.data = 'meta' in body ? { data: body.data, meta: body.meta } : body.data
    }

    return response
  },
  async (error) => {
    const originalRequest = error?.config as (typeof error.config & { _retry?: boolean }) | undefined
    const requestUrl = String(originalRequest?.url || '')
    const publicAuthRoutes = [
      '/auth/login',
      '/auth/register/',
      '/auth/refresh',
      '/auth/send-otp',
      '/auth/verify-otp',
      '/auth/forgot-password',
      '/auth/reset-password',
    ]
    const skipsRefresh = publicAuthRoutes.some((route) => requestUrl.includes(route))

    if (error?.response?.status === 401 && originalRequest && !originalRequest._retry && !skipsRefresh) {
      originalRequest._retry = true
      try {
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null
        })
        const token = await refreshPromise
        originalRequest.headers = originalRequest.headers || {}
        originalRequest.headers.Authorization = `Bearer ${token}`
        return axiosInstance(originalRequest)
      } catch {
        useAuthStore.getState().logout()
      }
    }

    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Something went wrong'

    return Promise.reject(new Error(Array.isArray(message) ? message.join(', ') : message))
  },
)
