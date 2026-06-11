import axios from 'axios'
import { API_BASE_URL } from '@/utils/constants'

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error?.response?.data?.message || error?.message || 'Something went wrong'
    return Promise.reject(new Error(message))
  },
)
