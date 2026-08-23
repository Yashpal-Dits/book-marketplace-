import { axiosInstance } from '@/api/axiosInstance'
import type { IListing } from '@/interfaces'


export const syncBookAggregates = async (bookId: string): Promise<void> => {
  const { data } = await axiosInstance.get<IListing[]>(`/books/${bookId}/listings`)

  const active = (Array.isArray(data) ? data : []).filter((l) => l.isActive)

  if (active.length === 0) {
    await axiosInstance.patch(`/books/${bookId}`, { minPrice: null, mrp: null, totalStock: 0 })
    return
  }

  const cheapest = active.reduce((min, l) => (l.price < min.price ? l : min), active[0])
  await axiosInstance.patch(`/books/${bookId}`, {
    minPrice: cheapest.price,
    mrp: cheapest.mrp ?? null,
    totalStock: active.reduce((sum, l) => sum + l.stock, 0),
  })
}
