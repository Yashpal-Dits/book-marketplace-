import type { BookSort } from '@/enums/sort.enum'

export interface BookFilterState {
  search: string
  sort: BookSort
  category: string
  minRating: number
  maxPrice: number
  inStockOnly: boolean
  page: number
  setSearch: (search: string) => void
  setSort: (sort: BookSort) => void
  setCategory: (category: string) => void
  setMinRating: (rating: number) => void
  setMaxPrice: (price: number) => void
  setInStockOnly: (inStock: boolean) => void
  setPage: (page: number) => void
  resetFilters: () => void
}
