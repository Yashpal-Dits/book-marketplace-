import { create } from 'zustand'
import { AdminBookSort, AdminSellerSort } from '@/enums/admin-sort.enum'
import { BookStatus } from '@/enums/book-status.enum'
import { SellerStatus } from '@/enums/seller-status.enum'

interface AdminSellerFilterState {
  search: string
  sort: AdminSellerSort
  status: SellerStatus | ''
  page: number
  setSearch: (search: string) => void
  setSort: (sort: AdminSellerSort) => void
  setStatus: (status: SellerStatus | '') => void
  setPage: (page: number) => void
}

interface AdminBookFilterState {
  search: string
  sort: AdminBookSort
  status: BookStatus | ''
  page: number
  setSearch: (search: string) => void
  setSort: (sort: AdminBookSort) => void
  setStatus: (status: BookStatus | '') => void
  setPage: (page: number) => void
}

export const useAdminSellerFilterStore = create<AdminSellerFilterState>((set) => ({
  search: '',
  sort: AdminSellerSort.NEWEST,
  status: '',
  page: 1,
  setSearch: (search) => set({ search, page: 1 }),
  setSort: (sort) => set({ sort, page: 1 }),
  setStatus: (status) => set({ status, page: 1 }),
  setPage: (page) => set({ page }),
}))

export const useAdminBookFilterStore = create<AdminBookFilterState>((set) => ({
  search: '',
  sort: AdminBookSort.NEWEST,
  status: '',
  page: 1,
  setSearch: (search) => set({ search, page: 1 }),
  setSort: (sort) => set({ sort, page: 1 }),
  setStatus: (status) => set({ status, page: 1 }),
  setPage: (page) => set({ page }),
}))
