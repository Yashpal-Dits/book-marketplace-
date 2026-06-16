import { create } from 'zustand'
import { AdminBookSort, AdminSellerSort } from '@/enums/admin-sort.enum'
import type { AdminBookFilterState, AdminCustomerFilterState, AdminSellerFilterState } from '@/interfaces'


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

export const useAdminCustomerFilterStore = create<AdminCustomerFilterState>((set) => ({
  search: '',
  status: '',
  page: 1,
  setSearch: (search) => set({ search, page: 1 }),
  setStatus: (status) => set({ status, page: 1 }),
  setPage: (page) => set({ page }),
}))
