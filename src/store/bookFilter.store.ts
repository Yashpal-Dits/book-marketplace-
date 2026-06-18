import { create } from 'zustand'
import type { BookFilterState } from '@/interfaces'
import { BookSort } from '@/enums/sort.enum'

const initialState = {
  search: '',
  sort: BookSort.NEWEST,
  category: '',
  minRating: 0,
  maxPrice: 2000,
  inStockOnly: false,
  page: 1,
}

export const useBookFilterStore = create<BookFilterState>((set) => ({
  ...initialState,
  setSearch: (search) => set({ search, page: 1 }),
  setSort: (sort) => set({ sort, page: 1 }),
  setCategory: (category) => set({ category, page: 1 }),
  setMinRating: (minRating) => set({ minRating, page: 1 }),
  setMaxPrice: (maxPrice) => set({ maxPrice, page: 1 }),
  setInStockOnly: (inStockOnly) => set({ inStockOnly, page: 1 }),
  setPage: (page) => set({ page }),
  resetFilters: () => set(initialState),
}))
