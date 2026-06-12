import { axiosInstance } from '@/api/axiosInstance'
import type { IListing } from '@/interfaces/listing.interface'

export const syncBookAggregates = async (bookId: string): Promise<void> => {
  const { data: listings } = await axiosInstance.get<IListing[]>('/listings', {
    params: { bookId, isActive: true },
  })

  if (listings.length === 0) {
    await axiosInstance.patch(`/books/${bookId}`, { minPrice: null, mrp: null, totalStock: 0 })
    return
  }

  const cheapest = listings.reduce((min, l) => (l.price < min.price ? l : min), listings[0])
  await axiosInstance.patch(`/books/${bookId}`, {
    minPrice: cheapest.price,
    mrp: cheapest.mrp ?? null,
    totalStock: listings.reduce((sum, l) => sum + l.stock, 0),
  })
}
