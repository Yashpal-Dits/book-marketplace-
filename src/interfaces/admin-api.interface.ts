import type { IBook } from '@/interfaces/book.interface'
import type { IOrder } from '@/interfaces/order.interface'
import type { ISeller } from '@/interfaces/seller.interface'
import type { AdminBookSort, AdminSellerSort } from '@/enums/admin-sort.enum'
import type { BookStatus } from '@/enums/book-status.enum'
import type { SellerStatus } from '@/enums/seller-status.enum'

export interface AdminSellerParams {
  page?: number
  limit?: number
  search?: string
  sort?: AdminSellerSort
  status?: SellerStatus | ''
}

export interface AdminBookParams {
  page?: number
  limit?: number
  search?: string
  sort?: AdminBookSort
  status?: BookStatus | ''
}

export interface AdminBookDetailed extends IBook {
  seller?: ISeller
}

export interface AdminDashboardSummary {
  totalSellers: number
  pendingSellers: number
  approvedSellers: number
  rejectedSellers: number
  totalCustomers: number
  totalBooks: number
  pendingBooks: number
  approvedBooks: number
  rejectedBooks: number
  totalOrders: number
  deliveredOrders: number
  cancelledOrders: number
  marketplaceRevenue: number
  totalListings: number
  activeListings: number
  outOfStockListings: number
  recentSellers: ISeller[]
  recentBooks: AdminBookDetailed[]
  recentOrders: IOrder[]
}
