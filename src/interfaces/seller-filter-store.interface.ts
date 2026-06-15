import type { SellerListingSort, SellerOrderSort } from '@/enums/seller-sort.enum'
import type { OrderStatus } from '@/enums/order-status.enum'

export interface SellerListingFilterState {
  search: string
  sort: SellerListingSort
  page: number
  setSearch: (search: string) => void
  setSort: (sort: SellerListingSort) => void
  setPage: (page: number) => void
}

export interface SellerOrderFilterState {
  search: string
  sort: SellerOrderSort
  status: OrderStatus | ''
  page: number
  setSearch: (search: string) => void
  setSort: (sort: SellerOrderSort) => void
  setStatus: (status: OrderStatus | '') => void
  setPage: (page: number) => void
}
