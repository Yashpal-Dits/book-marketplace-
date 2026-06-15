import { create } from 'zustand'
import type { BookFilterState } from '@/interfaces'
import { BookSort } from '@/enums/sort.enum'

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
