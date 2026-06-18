import type { BookSort } from '@/enums/sort.enum'

export interface GetBooksParams {
  page?: number
  limit?: number
  search?: string
  sort?: BookSort
  category?: string
  minRating?: number
  maxPrice?: number
  inStockOnly?: boolean
}
