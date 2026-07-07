import type { IBook } from '@/interfaces/book.interface'
import type { ICustomer } from '@/interfaces/customer.interface'
import type { IListing } from '@/interfaces/listing.interface'
import type { IOrder, IOrderItem } from '@/interfaces/order.interface'
import type { OrderStatus } from '@/enums/order-status.enum'
import type { SellerListingSort, SellerOrderSort } from '@/enums/seller-sort.enum'

export interface SellerListingDetailed extends IListing {
  book: IBook
}

export interface SellerRequestedBookDetailed extends IBook {}

export interface SellerOrderItemDetailed extends IOrderItem {
  order: IOrder
  customer?: ICustomer
}

export interface SellerDashboardSummary {
  totalListings: number
  activeListings: number
  totalStock: number
  lowStockCount: number
  pendingBooks: number
  totalOrders: number
  createdOrders: number
  revenue: number
  recentOrders: SellerOrderItemDetailed[]
  lowStockListings: SellerListingDetailed[]
}

export interface SellerListParams {
  sellerId: string
  page?: number
  limit?: number
  search?: string
  sort?: SellerListingSort
}

export interface SellerRequestedBooksParams {
  sellerId: string
  page?: number
  limit?: number
  search?: string
}

export interface SellerOrdersParams {
  sellerId: string
  page?: number
  limit?: number
  search?: string
  sort?: SellerOrderSort
  status?: OrderStatus | ''
}

export interface CreateListingPayload {
  sellerId: string
  bookId: string
  price: number
  mrp: number
  stock: number
}

export interface UpdateListingPayload {
  sellerId: string
  listingId: string
  price: number
  mrp: number
  stock: number
  isActive: boolean
}

export interface CreateBookRequestPayload {
  sellerId: string
  isbn: string
  title: string
  author: string
  publisher: string
  description: string
  category: string
  coverImageFile?: File | null
  coverImage?: string
}