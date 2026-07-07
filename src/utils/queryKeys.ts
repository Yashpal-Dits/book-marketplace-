import type { AdminBookParams, AdminCustomerParams, AdminSellerParams } from '@/interfaces/admin-api.interface'
import type { GetBooksParams } from '@/interfaces/books-api.interface'
import type { SellerListParams, SellerOrdersParams, SellerRequestedBooksParams } from '../interfaces/seller-api.interface'

export const queryKeys = 
{
  books: (params: GetBooksParams) => ['books', params] as const,

  approvedBooks: ['books', 'approved'] as const,

  bestSellers: (limit: number) => ['books', 'best-sellers', limit] as const,

  categories: ['categories'] as const,

  dealOfTheWeek: ['deal-of-the-week'] as const,

  bookDetails: (id: string) => ['books', id] as const,

  bookListings: (bookId: string) => ['listings', bookId] as const,

  cart: (customerId: string) => ['cart', customerId] as const,

  customerProfile: (customerId: string) => ['customer', 'profile', customerId] as const,

  sellerProfile: (sellerId: string) => ['seller', 'profile', sellerId] as const,

  adminProfile: (userId: string) => ['admin', 'profile', userId] as const,
  
  orders: (customerId: string) => ['orders', customerId] as const,

  sellerDashboard: (sellerId: string) => ['seller', 'dashboard', sellerId] as const,

  sellerApprovedBooks: ['seller', 'approved-books'] as const,

  sellerListings: (params: Partial<SellerListParams>) => ['seller', 'listings', params] as const,

  sellerRequestedBooks: (params: Partial<SellerRequestedBooksParams>) => ['seller', 'requested-books', params] as const,

  sellerOrders: (params: Partial<SellerOrdersParams>) => ['seller', 'orders', params] as const,

  adminDashboard: ['admin', 'dashboard'] as const,

  adminSellers: (params: Partial<AdminSellerParams>) => ['admin', 'sellers', params] as const,

  adminBooks: (params: Partial<AdminBookParams>) => ['admin', 'books', params] as const,

  adminCustomers: (params: Partial<AdminCustomerParams>) => ['admin', 'customers', params] as const,
}