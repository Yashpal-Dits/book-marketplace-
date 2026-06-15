import type { BookSort } from '@/enums/sort.enum'

export interface BookFilterState {
  search: string
  sort: BookSort
  category: string
  page: number
  setSearch: (search: string) => void
  setSort: (sort: BookSort) => void
  setCategory: (category: string) => void
  setPage: (page: number) => void
  resetFilters: () => void
}
