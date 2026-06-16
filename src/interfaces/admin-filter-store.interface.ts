import type { AdminBookSort, AdminSellerSort } from '@/enums/admin-sort.enum'
import type { BookStatus } from '@/enums/book-status.enum'
import type { CustomerStatus } from '@/enums/customer-status.enum'
import type { SellerStatus } from '@/enums/seller-status.enum'

export interface AdminSellerFilterState {
  search: string
  sort: AdminSellerSort
  status: SellerStatus | ''
  page: number
  setSearch: (search: string) => void
  setSort: (sort: AdminSellerSort) => void
  setStatus: (status: SellerStatus | '') => void
  setPage: (page: number) => void
}

export interface AdminBookFilterState {
  search: string
  sort: AdminBookSort
  status: BookStatus | ''
  page: number
  setSearch: (search: string) => void
  setSort: (sort: AdminBookSort) => void
  setStatus: (status: BookStatus | '') => void
  setPage: (page: number) => void
}

export interface AdminCustomerFilterState {
  search: string
  status: CustomerStatus | ''
  page: number
  setSearch: (search: string) => void
  setStatus: (status: CustomerStatus | '') => void
  setPage: (page: number) => void
}
