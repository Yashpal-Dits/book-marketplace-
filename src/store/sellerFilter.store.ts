import { create } from 'zustand'
import { SellerListingSort, SellerOrderSort } from '@/enums/seller-sort.enum'
import { OrderStatus } from '@/enums/order-status.enum'

interface SellerListingFilterState {
  search: string
  sort: SellerListingSort
  page: number
  setSearch: (search: string) => void
  setSort: (sort: SellerListingSort) => void
  setPage: (page: number) => void
}

interface SellerOrderFilterState {
  search: string
  sort: SellerOrderSort
  status: OrderStatus | ''
  page: number
  setSearch: (search: string) => void
  setSort: (sort: SellerOrderSort) => void
  setStatus: (status: OrderStatus | '') => void
  setPage: (page: number) => void
}

export const useSellerListingFilterStore = create<SellerListingFilterState>((set) => ({
  search: '',
  sort: SellerListingSort.NEWEST,
  page: 1,
  setSearch: (search) => set({ search, page: 1 }),
  setSort: (sort) => set({ sort, page: 1 }),
  setPage: (page) => set({ page }),
}))

export const useSellerOrderFilterStore = create<SellerOrderFilterState>((set) => ({
  search: '',
  sort: SellerOrderSort.NEWEST,
  status: '',
  page: 1,
  setSearch: (search) => set({ search, page: 1 }),
  setSort: (sort) => set({ sort, page: 1 }),
  setStatus: (status) => set({ status, page: 1 }),
  setPage: (page) => set({ page }),
}))
