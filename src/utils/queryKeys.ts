import type { AdminBookParams, AdminSellerParams } from '@/api/admin.api'
import type { GetBooksParams } from '@/api/books.api'
import type { SellerListParams, SellerOrdersParams } from '@/api/seller.api'

export const queryKeys = {
  books: (params: GetBooksParams) => ['books', params] as const,

  approvedBooks: ['books', 'approved'] as const,

  bestSellers: (limit: number) => ['books', 'best-sellers', limit] as const,

  dealOfTheWeek: ['deal-of-the-week'] as const,

  bookDetails: (id: string) => ['books', id] as const,

  bookListings: (bookId: string) => ['listings', bookId] as const,

  cart: (customerId: string) => ['cart', customerId] as const,
  
  orders: (customerId: string) => ['orders', customerId] as const,

  sellerDashboard: (sellerId: string) => ['seller', 'dashboard', sellerId] as const,

  sellerApprovedBooks: ['seller', 'approved-books'] as const,

  sellerListings: (params: Partial<SellerListParams>) => ['seller', 'listings', params] as const,

  sellerOrders: (params: Partial<SellerOrdersParams>) => ['seller', 'orders', params] as const,

  adminDashboard: ['admin', 'dashboard'] as const,

  adminSellers: (params: Partial<AdminSellerParams>) => ['admin', 'sellers', params] as const,

  adminBooks: (params: Partial<AdminBookParams>) => ['admin', 'books', params] as const,
}
