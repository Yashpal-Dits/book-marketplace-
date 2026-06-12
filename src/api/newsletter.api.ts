import { axiosInstance } from './axiosInstance'
import { generateId } from '@/utils/generateId'

export interface ISubscriber {
  id: string
  email: string
  createdAt: string
}

export const newsletterApi = {
  async subscribe(email: string): Promise<ISubscriber> {
    const normalized = email.trim().toLowerCase()

    // duplicate check — same email cannot subscribe twice
    const { data: existing } = await axiosInstance.get<ISubscriber[]>('/subscribers', {
      params: { email: normalized },
    })
    if (existing.length > 0) {
      throw new Error('This email is already subscribed')
    }

    const { data } = await axiosInstance.post<ISubscriber>('/subscribers', {
      id: generateId('subscriber'),
      email: normalized,
      createdAt: new Date().toISOString(),
    })
    return data
  },
}
