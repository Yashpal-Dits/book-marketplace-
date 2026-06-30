import axios from 'axios'
import { API_BASE_URL, AUTH_STORAGE_KEY } from '@/utils/constants'

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

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
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Something went wrong'

    return Promise.reject(new Error(Array.isArray(message) ? message.join(', ') : message))
  },
)