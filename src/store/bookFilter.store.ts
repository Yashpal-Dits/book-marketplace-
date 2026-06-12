import { create } from 'zustand'
import { BookSort } from '@/enums/sort.enum'

interface BookFilterState {
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

const initialState = {
  search: '',
  sort: BookSort.NEWEST,
  category: '',
  page: 1,
}


export const useBookFilterStore = create<BookFilterState>((set) => ({
  ...initialState,
  setSearch: (search) => set({ search, page: 1 }),
  setSort: (sort) => set({ sort, page: 1 }),
  setCategory: (category) => set({ category, page: 1 }),
  setPage: (page) => set({ page }),
  resetFilters: () => set(initialState),
}))
