import { axiosInstance } from './axiosInstance'
import type { ISubscriber } from '@/interfaces'

export const newsletterApi = {
  async subscribe(email: string): Promise<ISubscriber> {
    const normalized = email.trim().toLowerCase()

    const { data } = await axiosInstance.post<ISubscriber>('/subscribers', {
      email: normalized,
    })
    return data
  },
}
